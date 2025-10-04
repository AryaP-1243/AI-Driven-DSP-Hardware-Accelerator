import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import { SignalType, BlockType, OptimizationResult, ChartDataPoint, FpgaTarget, AnalysisResults, Theme, ThemeMode, ChatMessage, OptimizationConstraints, HrvAnalysis, FrequencyDataPoint, HardwareMetrics, BoardFarmValidationResult, BitWidthAnalysis, PowerSpectrumDataPoint, DspBlockConfig, WindowType, FilterType } from './types';
import { optimizeDspBlock, estimateHardwareForBitWidths, optimizeWithHardwareFeedback } from './services/geminiService';
import { calculateMse, calculateSnr, calculateHrvPowerBands, calculateEegBands } from './utils/analysis';
import { exportDataAsCsv, exportReportAsMarkdown, exportProjectAsZip } from './utils/export';
import { applyFixedPointFilter, applyDucDdc, applyMixing, applyPhaseDetection, applyDds, applySignalGeneration, calculateFrequencyResponse, calculatePsd } from './utils/dsp';

// --- PRE-LOADED EXAMPLE STATE ---
const exampleOptimizationResult: OptimizationResult = {
  explanation: "For this ECG denoising task, I've designed a symmetric, 11-tap FIR low-pass filter. The coefficients are quantized to 16 bits to maintain high fidelity and preserve the crucial QRS complex shape. The architecture uses a pipelined multiply-accumulate (MAC) structure, leveraging 6 DSP slices on the Artix-7 for parallel computation. This achieves a throughput of one sample per clock cycle while keeping LUT usage minimal.",
  metrics: {
    lutCount: "~380",
    ffCount: "~410",
    dspSlices: "6",
    bramBlocks: "0",
    cyclesPerSample: "1",
    throughput: "100 MSPS"
  },
  coefficients: [-0.003, 0.005, 0.031, 0.107, 0.222, 0.276, 0.222, 0.107, 0.031, 0.005, -0.003],
  dataBitWidth: 16,
  coefficientBitWidth: 16,
  hdlModule: `/*
 * 11-Tap Symmetric FIR Filter for ECG Denoising
 * Target: Artix-7, 100 MHz Clock
 */
module fir_filter (
    input clk,
    input reset,
    input signed [15:0] data_in,
    output signed [15:0] data_out
);

    // Coefficients (16-bit quantized)
    localparam signed [15:0] COEFF_0 = 16'shFFFD; // -0.003
    localparam signed [15:0] COEFF_1 = 16'h000A; //  0.005
    localparam signed [15:0] COEFF_2 = 16'h0040; //  0.031
    localparam signed [15:0] COEFF_3 = 16'h015B; //  0.107
    localparam signed [15:0] COEFF_4 = 16'h038E; //  0.222
    localparam signed [15:0] COEFF_5 = 16'h046A; //  0.276

    // Input data pipeline registers
    reg signed [15:0] delay_line [0:10];
    always @(posedge clk) begin
        if (reset) begin
            for (int i = 0; i < 11; i++)
                delay_line[i] <= 16'd0;
        end else begin
            delay_line[0] <= data_in;
            for (int i = 1; i < 11; i++)
                delay_line[i] <= delay_line[i-1];
        end
    end

    // Utilize symmetry: sum samples before multiplying
    reg signed [16:0] sum_0_10, sum_1_9, sum_2_8, sum_3_7, sum_4_6;
    always @(posedge clk) begin
      sum_0_10 <= delay_line[0] + delay_line[10];
      sum_1_9  <= delay_line[1] + delay_line[9];
      sum_2_8  <= delay_line[2] + delay_line[8];
      sum_3_7  <= delay_line[3] + delay_line[7];
      sum_4_6  <= delay_line[4] + delay_line[6];
    end

    // Multiply stage (inferred DSP slices)
    reg signed [32:0] p0, p1, p2, p3, p4, p5;
    always @(posedge clk) begin
        p0 <= sum_0_10 * COEFF_0;
        p1 <= sum_1_9  * COEFF_1;
        p2 <= sum_2_8  * COEFF_2;
        p3 <= sum_3_7  * COEFF_3;
        p4 <= sum_4_6  * COEFF_4;
        p5 <= delay_line[5] * COEFF_5;
    end
    
    // Final accumulator stage
    reg signed [32:0] accumulator_sum;
    always @(posedge clk) begin
        accumulator_sum <= p0 + p1 + p2 + p3 + p4 + p5;
    end
    
    // Truncate output
    assign data_out = accumulator_sum >>> 15;

endmodule`,
  hdlTestbench: `// Testbench for 11-Tap FIR Filter
\`timescale 1ns / 1ps

module fir_filter_tb;

    reg clk;
    reg reset;
    reg signed [15:0] data_in;
    wire signed [15:0] data_out;

    // Instantiate the DUT
    fir_filter dut (
        .clk(clk),
        .reset(reset),
        .data_in(data_in),
        .data_out(data_out)
    );

    // Clock generation
    initial begin
        clk = 0;
        forever #5 clk = ~clk; // 100 MHz clock
    end

    // Stimulus from file
    integer stimulus_file;
    reg [15:0] stimulus_vector;
    initial begin
        stimulus_file = $fopen("stimulus.txt", "r");
        if (stimulus_file == 0) begin
            $display("Error: Could not open stimulus.txt");
            $finish;
        end

        reset = 1;
        data_in = 0;
        #20;
        reset = 0;
        
        while (!$feof(stimulus_file)) begin
            @(posedge clk);
            $fscanf(stimulus_file, "%d", stimulus_vector);
            data_in <= stimulus_vector;
            $display("Time: %0t, In: %d, Out: %d", $time, data_in, data_out);
        end

        #100;
        $fclose(stimulus_file);
        $finish;
    end

endmodule`,
  synthesisScript: `# Vivado Synthesis Script for FIR Filter
create_project -in_memory -part xc7a35tcpg236-1
add_files {fir_filter.sv}
set_property top fir_filter [current_fileset]
update_compile_order -fileset sources_1
create_clock -period 10.000 [get_ports clk]
synth_design -top fir_filter -part xc7a35tcpg236-1
report_utilization -hierarchical`,
  stimulusFileContent: `-655\n-983\n-1310\n-1310\n-1638\n-1638\n-1310\n-1638\n-1310\n-1310\n-983\n-983\n-983\n-655\n-655\n-655\n-327\n-327\n-327\n0\n0\n2293\n13107\n2293\n-327\n-983\n-655\n-327\n-327\n-327\n0\n0\n327\n327\n327\n327\n655\n655\n983\n983\n983\n983\n1310\n1310\n1310\n1638\n1638\n1638\n1966\n1966\n1966`
};
const exampleAnalysisResults: AnalysisResults = {
  baseline: { snr: 15.23, mse: 0.0021 },
  aiOptimized: { snr: 28.71, mse: 0.00011 }
};
const exampleChatHistory: ChatMessage[] = [
    {
        role: 'user',
        text: 'Design an FIR filter to remove high-frequency noise from this ECG signal. Prioritize preserving the shape of the QRS complex. Target a low-power Xilinx Artix-7 FPGA.'
    },
    {
        role: 'ai',
        result: exampleOptimizationResult,
        analysis: exampleAnalysisResults,
        validationStatus: 'idle'
    }
];
// --- END OF EXAMPLE STATE ---

// Mock data generation
const generateSignalData = (signalType: SignalType): { cleanData: number[], noisyData: number[] } => {
  const cleanData: { clean: number; noise: number }[] = [];
  const points = 1024;
  const t = (i: number) => i / points;
  let pink_b = [0, 0, 0, 0, 0, 0, 0];
  let brown_last = 0;
  let lorenz = { x: 0.1, y: 0, z: 0 };
  let macd_ema_slow = 0;
  let macd_ema_fast = 0;

  // Helper for a single ECG beat
  const generateEcgBeat = (i: number, period: number) => {
      const ip = i % period;
      if (ip < period * 0.08) return 0.1 * Math.sin((Math.PI * ip) / (period * 0.08)); // P-wave
      if (ip > period * 0.12 && ip < period * 0.16) return -0.2 * Math.sin((Math.PI * (ip - period * 0.12)) / (period * 0.04)); // Q
      if (ip >= period * 0.16 && ip < period * 0.20) return 1.0 * Math.sin((Math.PI * (ip - period * 0.16)) / (period * 0.04)); // R
      if (ip >= period * 0.20 && ip < period * 0.24) return -0.5 * Math.sin((Math.PI * (ip - period * 0.20)) / (period * 0.04)); // S
      if (ip > period * 0.3 && ip < period * 0.5) return 0.2 * Math.sin((Math.PI * (ip - period * 0.3)) / (period * 0.2)); // T
      return 0;
  };

  for (let i = 0; i < points; i++) {
    let clean = 0;
    let noise = (Math.random() - 0.5) * 0.2; // Default noise

    switch (signalType) {
      // Biomedical
      case 'ECG': clean = generateEcgBeat(i, points / 10); break;
      case 'ECG (Arrhythmia)': const p_arr = (i < points / 2 ? points / 10 : points / 15); clean = generateEcgBeat(i, p_arr); break;
      case 'ECG (Arrhythmia Simulation)': const p_tachy = (i > points / 4 && i < 3 * points / 4) ? points / 20 : points / 10; clean = generateEcgBeat(i, p_tachy); break;
      case 'ECG (Noise Artifacts)':
        clean = generateEcgBeat(i, points / 10);
        const baselineWander = 0.15 * Math.sin(2 * Math.PI * 0.5 * t(i));
        const muscleArtifact = (i > 400 && i < 420) ? (Math.random() - 0.5) * 0.8 : 0;
        const electrodePop = (i === 600) ? 1.5 : (i === 601 ? -1.5 : 0);
        noise += baselineWander + muscleArtifact + electrodePop;
        break;
      case 'ECG (PAC/PVC beats)':
        clean = generateEcgBeat(i, points/10);
        if (i > 400 && i < 450) clean = i === 420 ? 1.2 : (i === 421 ? -0.8 : 0); // PVC
        if (i > 700 && i < 750) clean = generateEcgBeat(i+20, points/10); // PAC
        break;
      case 'Fetal ECG':
        const maternal_beat = generateEcgBeat(i, points / 10);
        const fetal_beat = 0.2 * generateEcgBeat(i * 2.5, points / 15);
        clean = maternal_beat + fetal_beat;
        break;
      case 'EEG': clean = 0.5 * Math.sin(2 * Math.PI * 10 * t(i)) + 0.3 * Math.sin(2 * Math.PI * 25 * t(i)); break; // Alpha + Beta
      case 'EMG (Muscle)': clean = (i % 100 < 50) ? (Math.random() - 0.5) * (0.2 + 0.8 * Math.sin(Math.PI * (i % 50) / 50)) : 0; break;
      case 'EOG (Eye Movement)': clean = (i > 300 && i < 350) ? 0.8 : (i > 700 && i < 750 ? -0.8 : 0); break;
      case 'Plethysmogram (PPG)': clean = 0.5 * Math.exp(-2 * t(i % 100)) * Math.sin(2 * Math.PI * 1.2 * t(i % 100)); break;
      case 'Blood Pressure (ABP)': clean = 0.6 + 0.3 * Math.sin(2 * Math.PI * 1.2 * t(i % 100)) + 0.1 * Math.sin(2 * Math.PI * 2.4 * t(i % 100)); break;
      case 'Phonocardiogram (PCG)':
          const ip_pcg = i % 100;
          const s1 = ip_pcg < 10 ? Math.exp(-0.2 * ip_pcg) * Math.sin(2 * Math.PI * 0.5 * ip_pcg) : 0;
          const s2 = ip_pcg > 40 && ip_pcg < 50 ? 0.7 * Math.exp(-0.25 * (ip_pcg - 40)) * Math.sin(2 * Math.PI * 0.7 * (ip_pcg - 40)) : 0;
          clean = s1 + s2;
          break;
      case 'Galvanic Skin Response (GSR)': clean = Math.max(0, 0.1 * Math.sin(2 * Math.PI * 0.1 * t(i)) + (i > 300 && i < 310 ? 0.5 : 0)); break;
      case 'Respiratory (RIP)': clean = 0.5 * Math.sin(2 * Math.PI * 0.25 * t(i)); break;
      case 'HRV': clean = 1.0 + 0.1 * Math.sin(2 * Math.PI * 0.1 * t(i)) + 0.05 * Math.sin(2 * Math.PI * 0.25 * t(i)); break;
      // Audio & Speech
      case 'Speech': clean = (Math.sin(2 * Math.PI * 2 * t(i)) * Math.exp(-3 * t(i))) * Math.sin(2 * Math.PI * 150 * t(i)); break;
      case 'Speech (Female)': clean = (Math.sin(2 * Math.PI * 2.5 * t(i)) * Math.exp(-3.5 * t(i))) * Math.sin(2 * Math.PI * 220 * t(i)); break;
      case 'Spoken Digit':
        const formant1 = Math.exp(-20 * t(i % 128)) * Math.sin(2 * Math.PI * 500 * t(i));
        const formant2 = Math.exp(-15 * t(i % 128)) * Math.sin(2 * Math.PI * 1500 * t(i));
        clean = i % 256 < 128 ? formant1 + 0.5 * formant2 : 0;
        break;
      case 'Audio': case 'Sine Wave': clean = Math.sin(2 * Math.PI * 440 * t(i)); break;
      case 'Music': clean = 0.5 * Math.sin(2 * Math.PI * 261.63 * t(i)) + 0.3 * Math.sin(2 * Math.PI * 329.63 * t(i)) + 0.2 * Math.sin(2 * Math.PI * 392.00 * t(i)); break;
      case 'Piano Chord': clean = 0.5 * Math.exp(-3 * t(i % 256)) * (0.5 * Math.sin(2 * Math.PI * 261.63 * t(i)) + 0.3 * Math.sin(2 * Math.PI * 329.63 * t(i))); break;
      case 'Guitar Riff': clean = (i % 128 < 64 ? Math.sin(2 * Math.PI * 196 * t(i)) : Math.sin(2 * Math.PI * 246.9 * t(i))) * Math.exp(-5 * t(i % 64)); break;
      case 'Drum Loop': clean = (i % 128 === 0 ? 1 : 0) + (i % 128 === 64 ? 0.6 : 0) + (i % 32 === 0 ? (Math.random() - 0.5) * 0.2 : 0); break;
      case 'Violin Note': clean = 0.8 * (Math.sin(2 * Math.PI * 440 * t(i)) + 0.2 * Math.sin(2 * Math.PI * 880 * t(i)) + 0.1 * Math.sin(2 * Math.PI * 1320 * t(i))); break;
      case 'Flute Note': clean = 0.7 * Math.sin(2 * Math.PI * 523.25 * t(i)) + 0.3 * Math.sin(2 * Math.PI * 1046.5 * t(i)); break;
      case 'Bass Guitar Note': clean = Math.exp(-2 * t(i % 256)) * (0.8 * Math.sin(2 * Math.PI * 82.41 * t(i)) + 0.2 * Math.sin(2 * Math.PI * 164.81 * t(i))); break;
      case 'Trumpet Note': clean = 0.6 * Math.sin(2 * Math.PI * 233.08 * t(i)) + 0.2 * Math.sin(2 * Math.PI * 466.16 * t(i)) + 0.15 * Math.sin(2 * Math.PI * 699.24 * t(i)); break;
      case 'Audio (Cymbal Crash)': clean = i < 100 ? (Math.random() - 0.5) * Math.exp(-0.05 * i) : 0; break;
      case 'Audio (Square Lead Synth)': clean = 0.5 * (Math.sin(2 * Math.PI * 220 * t(i)) > 0 ? 1 : -1) + 0.2 * (Math.sin(2 * Math.PI * 440 * t(i)) > 0 ? 1 : -1); break;
      case 'Doppler Shift Audio': const f_doppler = 440 * (1 + 0.1 * Math.sin(2 * Math.PI * 1 * t(i))); clean = Math.sin(2 * Math.PI * f_doppler * t(i)); break;
      case 'White Noise': clean = Math.random() * 2 - 1; break;
      case 'Pink Noise':
        const w_pink = Math.random() * 2 - 1;
        pink_b[0] = 0.99886 * pink_b[0] + w_pink * 0.0555179; pink_b[1] = 0.99332 * pink_b[1] + w_pink * 0.0750759; pink_b[2] = 0.96900 * pink_b[2] + w_pink * 0.1538520;
        pink_b[3] = 0.86650 * pink_b[3] + w_pink * 0.3104856; pink_b[4] = 0.55000 * pink_b[4] + w_pink * 0.5329522; pink_b[5] = -0.7616 * pink_b[5] - w_pink * 0.0168980;
        clean = (pink_b.reduce((a, b) => a + b, 0) + w_pink * 0.5362) / 7;
        break;
      case 'Brownian Noise': clean = brown_last = (brown_last + (Math.random() - 0.5) * 0.1); break;
      // Test Signals
      case 'Cosine Wave': clean = Math.cos(2 * Math.PI * 5 * t(i)); break;
      case 'Square Wave': clean = Math.sin(2 * Math.PI * 5 * t(i)) > 0 ? 1 : -1; break;
      case 'Sawtooth Wave': clean = 2 * (t(i) * 5 - Math.floor(0.5 + t(i) * 5)); break;
      case 'Triangle Wave': clean = 2 * Math.abs(2 * (t(i) * 5 - Math.floor(0.5 + t(i) * 5))) - 1; break;
      case 'Step Function': clean = i > points / 2 ? 1 : 0; break;
      case 'Impulse Function': clean = i === Math.floor(points / 2) ? 1 : 0; break;
      case 'Chirp Signal': clean = Math.sin(2 * Math.PI * (1 + 100 * t(i)) * t(i)); break;
      case 'Swept-Frequency Cosine': clean = Math.cos(2 * Math.PI * (10 * t(i) + 50 * t(i) * t(i))); break;
      case 'Damped Sine Wave': clean = Math.exp(-5 * t(i)) * Math.sin(2 * Math.PI * 20 * t(i)); break;
      case 'Gaussian Pulse': const sigma_gp = 0.1; clean = Math.exp(-Math.pow(t(i) - 0.5, 2) / (2 * sigma_gp * sigma_gp)); break;
      case 'Sinc Function': clean = t(i) === 0.5 ? 1 : Math.sin(2 * Math.PI * 10 * (t(i) - 0.5)) / (2 * Math.PI * 10 * (t(i) - 0.5)); break;
      case 'Multitone Signal': clean = 0.3 * Math.sin(2*Math.PI*50*t(i)) + 0.3*Math.sin(2*Math.PI*120*t(i)) + 0.3*Math.sin(2*Math.PI*200*t(i)); break;
      case 'Second-Order System Response': clean = 1 - Math.exp(-2 * t(i)) * Math.cos(2 * Math.PI * 5 * t(i)); break;
      case 'Rectangular Pulse Train': clean = i % 100 < 20 ? 1 : 0; break;
      case 'Random Binary Sequence': clean = Math.floor(i / 32) % 2 === 0 ? 1 : -1; break;
      // Communications & RF
      case 'BPSK Signal': clean = Math.sin(2 * Math.PI * 20 * t(i) + (Math.floor(t(i) * 10) % 2 === 0 ? 0 : Math.PI)); break;
      case 'QPSK Signal': clean = Math.sin(2 * Math.PI * 20 * t(i) + (Math.PI / 4) * (1 + 2 * (Math.floor(i / 32) % 4))); break;
      case '8-PSK Signal': clean = Math.sin(2 * Math.PI * 20 * t(i) + (Math.PI / 4) * (Math.floor(i / 32) % 8)); break;
      case '16-QAM Signal':
        const qam_levels_16 = [-3, -1, 1, 3];
        const qam_I_16 = qam_levels_16[Math.floor(i / 32) % 4];
        const qam_Q_16 = qam_levels_16[Math.floor(i / 32 / 4) % 4];
        clean = 0.2 * (qam_I_16 * Math.cos(2 * Math.PI * 40 * t(i)) - qam_Q_16 * Math.sin(2 * Math.PI * 40 * t(i)));
        break;
      case '64-QAM Signal':
        const qam_levels_64 = [-7, -5, -3, -1, 1, 3, 5, 7];
        const qam_I_64 = qam_levels_64[Math.floor(i / 16) % 8];
        const qam_Q_64 = qam_levels_64[Math.floor(i / 16 / 8) % 8];
        clean = 0.1 * (qam_I_64 * Math.cos(2 * Math.PI * 40 * t(i)) - qam_Q_64 * Math.sin(2 * Math.PI * 40 * t(i)));
        break;
      case '256-QAM Signal':
        const qam_levels_256 = [-15, -13, -11, -9, -7, -5, -3, -1, 1, 3, 5, 7, 9, 11, 13, 15];
        const qam_I_256 = qam_levels_256[Math.floor(i / 8) % 16];
        const qam_Q_256 = qam_levels_256[Math.floor(i / 8 / 16) % 16];
        clean = 0.05 * (qam_I_256 * Math.cos(2 * Math.PI * 40 * t(i)) - qam_Q_256 * Math.sin(2 * Math.PI * 40 * t(i)));
        break;
      case 'GMSK Signal':
        let phase_gmsk = 0;
        for (let j = 0; j < i; j++) phase_gmsk += (Math.PI / 2) * ((Math.floor(t(j) * 10) % 2 === 0) ? 1 : -1);
        clean = Math.cos(2 * Math.PI * 20 * t(i) + phase_gmsk);
        break;
      case 'OFDM Signal':
        let ofdm_signal = 0;
        for(let k=1; k<=4; k++) ofdm_signal += ((Math.floor(t(i) * 10) % (k + 1) === 0) ? 1 : -1) * Math.cos(2 * Math.PI * (20 + k * 5) * t(i));
        clean = ofdm_signal / 4;
        break;
      case 'AM Signal': clean = (1 + 0.5 * Math.sin(2 * Math.PI * 2 * t(i))) * Math.sin(2 * Math.PI * 30 * t(i)); break;
      case 'FM Signal': clean = Math.cos(2 * Math.PI * 30 * t(i) + 5 * Math.cos(2 * Math.PI * 3 * t(i))); break;
      case 'Double-Sideband SC': clean = Math.sin(2 * Math.PI * 2 * t(i)) * Math.sin(2 * Math.PI * 30 * t(i)); break;
      case 'Single-Sideband SC': clean = Math.sin(2 * Math.PI * 30 * t(i)) * Math.cos(2 * Math.PI * 2 * t(i)) - Math.cos(2 * Math.PI * 30 * t(i)) * Math.sin(2 * Math.PI * 2 * t(i)); break;
      case 'ASK Signal': clean = (Math.floor(t(i) * 10) % 2 === 0 ? 1 : 0.2) * Math.sin(2 * Math.PI * 30 * t(i)); break;
      case 'FSK Signal': clean = Math.sin(2 * Math.PI * (Math.floor(t(i) * 10) % 2 === 0 ? 20 : 30) * t(i)); break;
      case 'CPFSK Signal':
          let phase_cpfsk = 0;
          for (let j = 0; j < i; j++) phase_cpfsk += Math.PI * ((Math.floor(t(j) * 10) % 2 === 0) ? 1 : -1) * 0.5;
          clean = Math.cos(2 * Math.PI * 20 * t(i) + phase_cpfsk);
          break;
      case 'PWM Signal': clean = (i % 50) < (25 * (0.5 + 0.5*Math.sin(2*Math.PI*t(i)))) ? 1 : -1; break;
      case 'PPM Signal': clean = (i % 50 === Math.floor(25 * (0.5 + 0.5*Math.sin(2*Math.PI*t(i))))) ? 1 : 0; break;
      case 'Manchester Code': clean = (i % 32 < 16) !== (Math.floor(i / 32) % 2 === 0) ? 1 : -1; break;
      case 'CDMA Signal (Sim.)':
          const cdma_code = [1, -1, 1, 1, -1, 1];
          clean = cdma_code[i % 6] * (Math.floor(i / 24) % 2 === 0 ? 1 : -1);
          break;
      case 'LTE Downlink Signal (Sim.)':
          let lte_signal = 0;
          for (let k = 1; k <= 8; k++) lte_signal += Math.sin(2 * Math.PI * (40 + k * 5) * t(i) + (Math.PI / 4) * (1 + 2 * (Math.floor(i / 32) % 4)));
          clean = lte_signal / 8;
          break;
      case '5G NR Signal (Sim.)':
          let nr_signal = 0;
          for (let k = 1; k <= 12; k++) {
              const qam_I_nr = [-3,-1,1,3][Math.floor(i/16)%4];
              const qam_Q_nr = [-3,-1,1,3][Math.floor(i/16/4)%4];
              nr_signal += (qam_I_nr * Math.cos(2*Math.PI*(50+k*5)*t(i)) - qam_Q_nr * Math.sin(2*Math.PI*(50+k*5)*t(i)));
          }
          clean = nr_signal / 12 * 0.2;
          break;
      case 'Bluetooth LE Packet (Sim.)': clean = i % 100 < 40 ? Math.cos(2 * Math.PI * 25 * t(i) + (Math.PI/2 * (Math.floor(i / 8) % 2))) : 0; break;
      case 'WiFi Beacon (Sim.)': clean = i % 200 < 50 ? Math.sin(2 * Math.PI * 40 * t(i) + (Math.floor(i / 16) % 2 === 0 ? 0 : Math.PI)) : 0; break;
      case 'GPS L1 C/A Code': const gps_code = [1,1,1,1,1,-1,-1,1,1,-1,1,-1,1]; clean = gps_code[i % 13]; break;
      case 'Satellite Telemetry': clean = i % 64 < 32 ? Math.sin(2 * Math.PI * 20 * t(i) + (Math.PI * (Math.floor(i / 8) % 2))) : 0; break;
      // Radar/Sonar
      case 'Pulsed Radar Return': clean = (i % 200 > 100 && i % 200 < 110) ? Math.sin(2 * Math.PI * 50 * t(i)) : 0; break;
      case 'FMCW Radar Signal': clean = Math.sin(2 * Math.PI * (10 * t(i % 128) + (100 * t(i % 128) * t(i % 128)) / 2)); break;
      case 'Doppler Radar': clean = Math.sin(2 * Math.PI * 50 * t(i)) + (i > points / 2 ? Math.sin(2 * Math.PI * 51 * t(i)) : 0); break;
      case 'Sonar Ping': clean = (i < 50) ? Math.exp(-0.1 * i) * Math.sin(2 * Math.PI * 40 * t(i)) : 0; break;
      case 'Bat Echolocation Chirp': clean = (i < 100) ? Math.sin(2 * Math.PI * (60 - 0.4 * i) * t(i)) : 0; break;
      case 'Linear Frequency Modulated (LFM) Pulse': clean = i < 128 ? Math.sin(2 * Math.PI * (10 * t(i) + 50 * t(i) * t(i))) : 0; break;
      case 'Barker Code Pulse': const barker_code = [1,1,1,-1,-1,1,-1]; clean = i < 70 ? barker_code[Math.floor(i/10)] * Math.sin(2*Math.PI*50*t(i)) : 0; break;
      case 'Ultrasound Pulse': clean = i < 30 ? Math.exp(-0.2*i)*Math.sin(2*Math.PI*80*t(i)) : 0; break;
      case 'Hydrophone (Marine)': clean = Math.sin(2*Math.PI*5*t(i)) + 0.2*Math.sin(2*Math.PI*50*t(i)) + (i % 256 === 10 ? 0.8 : 0); break;
      // Mechanical & Sensor
      case 'Vibration Sensor': clean = 0.5 * Math.sin(2 * Math.PI * 30 * t(i)) + (Math.random() - 0.5) * 0.1 + (i % 256 === 0 ? (Math.random() - 0.5) : 0); break;
      case 'Accelerometer Data': clean = (i > 200 && i < 250 ? 0.5 * Math.sin(Math.PI * (i - 200) / 50) : 0) + 0.1 * Math.sin(2 * Math.PI * 1 * t(i)); break;
      case 'Gyroscope Data': clean = 0.1 * Math.sin(2 * Math.PI * 2 * t(i)) + (i > 512 && i < 600 ? (i - 512) / 88 * 0.5 : (i >= 600 ? 0.5 : 0)); break;
      case 'Engine Knock Sensor': clean = 0.1 * Math.sin(2*Math.PI*20*t(i)) + (i % 200 > 100 && i % 200 < 110 ? 0.8*Math.sin(2*Math.PI*150*t(i)) : 0); break;
      case 'Bearing Fault Signal': clean = i % 100 === 0 ? Math.exp(-0.1 * (i % 100)) * Math.sin(2*Math.PI*80*t(i)) : 0; noise *= 0.1; break;
      // Power Systems
      case 'Three-Phase Power':
          const phase = Math.floor(i/points * 3);
          if(phase === 0) clean = Math.sin(2*Math.PI*5*t(i));
          else if(phase === 1) clean = Math.sin(2*Math.PI*5*t(i) - 2*Math.PI/3);
          else clean = Math.sin(2*Math.PI*5*t(i) - 4*Math.PI/3);
          break;
      case 'Power Line Transient': clean = Math.sin(2*Math.PI*5*t(i)) + (i > 512 && i < 520 ? Math.exp(-0.5*(i-512)) * Math.sin(2*Math.PI*100*t(i)) : 0); break;
      // Other
      case 'Seismic Data': clean = Math.exp(-2 * t(i)) * Math.sin(2 * Math.PI * 3 * t(i)) + (Math.random() - 0.5) * 0.05; break;
      case 'Seismic P-wave': clean = i < 100 ? Math.exp(-0.05*i)*Math.sin(2*Math.PI*10*t(i)) : 0; break;
      case 'Seismic S-wave': clean = i > 200 && i < 400 ? Math.exp(-0.02*(i-200))*Math.sin(2*Math.PI*5*t(i-200)) : 0; break;
      case 'Chaotic Signal (Lorenz)':
        const dt = 0.01;
        const dx = (10 * (lorenz.y - lorenz.x)) * dt;
        const dy = (lorenz.x * (28 - lorenz.z) - lorenz.y) * dt;
        const dz = (lorenz.x * lorenz.y - (8/3) * lorenz.z) * dt;
        lorenz.x += dx; lorenz.y += dy; lorenz.z += dz;
        clean = lorenz.x / 30; // Scale for viewing
        break;
      case 'Stock Price (Simulated)': clean += (Math.random() - 0.5) * 0.05; break;
      case 'Volatility Index (Sim.)': clean = 0.2 + Math.abs(brown_last); break;
      case 'MACD Indicator (Sim.)':
        const price = 1 + (cleanData.slice(-1)[0]?.clean || 0) + (Math.random() - 0.5) * 0.05;
        macd_ema_fast = (price * 0.15) + (macd_ema_fast * 0.85);
        macd_ema_slow = (price * 0.075) + (macd_ema_slow * 0.925);
        clean = (macd_ema_fast - macd_ema_slow);
        break;
      case 'Weather Sensor Data': clean = 0.5 * Math.sin(2 * Math.PI * 0.1 * t(i)) + 0.2 * Math.sin(2 * Math.PI * 0.5 * t(i)) + Math.random() * 0.02; break;
      case 'Light Sensor Data': clean = (Math.sin(2 * Math.PI * 0.2 * t(i)) > 0 ? 1 : 0.2) + Math.random() * 0.01; break;
      default: clean = Math.sin(2 * Math.PI * 5 * t(i)); // Default to sine wave
    }
    cleanData.push({ clean, noise });
  }
  const noisyData = cleanData.map(d => d.clean + d.noise);
  const finalCleanData = cleanData.map(d => d.clean);
  return { cleanData: finalCleanData, noisyData };
};

const getThemeMode = (theme: Theme): ThemeMode => (theme === 'light' ? 'light' : 'dark');

const getSamplingRate = (signalType: SignalType): number => {
    switch(signalType) {
        case 'ECG': return 250;
        case 'EEG': return 250;
        case 'HRV': return 4;
        case 'Audio': case 'Speech': case 'Music': return 8000;
        default: return 1000;
    }
}

const filterTypes: BlockType[] = ['FIR', 'IIR', 'CIC Filter', 'Half-band Filter', 'Matched Filter', 'Wiener Filter', 'Kalman Filter', 'Convolution', 'Correlation'];

const applyBaselineBlock = (input: number[], block: DspBlockConfig): number[] => {
    if (filterTypes.includes(block.type)) {
        const filterOrder = block.settings?.filterOrder || 11;
        const baselineCoeffs = Array(filterOrder).fill(1 / filterOrder);
        return applyFixedPointFilter(input, baselineCoeffs, 16, 16);
    }
    // For other types, pass through in baseline mode
    return input;
};

const applyBlock = (input: number[], block: DspBlockConfig): number[] => {
    const config = block.config;
    // If block has been optimized, use its specific config
    if (config) {
        const { coefficients, dataBitWidth, coefficientBitWidth } = config;
        if (filterTypes.includes(block.type)) {
            return applyFixedPointFilter(input, coefficients, dataBitWidth, coefficientBitWidth);
        } else if (block.type === 'DUC/DDC') {
            return applyDucDdc(input, coefficients, dataBitWidth);
        }
    }
    // Otherwise, apply a generic baseline version of the block
    return applyBaselineBlock(input, block);
};

const processFullChain = (initialSignal: number[], chain: DspBlockConfig[]): number[] => {
    let currentSignal = initialSignal;
    for (const block of chain) {
        currentSignal = applyBlock(currentSignal, block);
    }
    return currentSignal;
};


const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [selectedSignal, setSelectedSignal] = useState<SignalType>('ECG');
  const [dspChain, setDspChain] = useState<DspBlockConfig[]>([{
      id: 'example-fir',
      type: 'FIR',
      config: exampleOptimizationResult,
      settings: { filterOrder: 11, filterType: 'Low-pass', windowType: 'None' }
  }]);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);
  const [fpgaTarget, setFpgaTarget] = useState<FpgaTarget>('Xilinx Artix-7');
  const [clockFrequency, setClockFrequency] = useState<number>(100);
  const [emulationTargets, setEmulationTargets] = useState<FpgaTarget[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sourceSignal, setSourceSignal] = useState<{ cleanData: number[], noisyData: number[] }>({ cleanData: [], noisyData: [] });
  const [fullSignalData, setFullSignalData] = useState<ChartDataPoint[]>([]);
  const [liveSignalData, setLiveSignalData] = useState<ChartDataPoint[]>([]);
  const [frequencyResponseData, setFrequencyResponseData] = useState<FrequencyDataPoint[]>([]);
  const [powerSpectrumData, setPowerSpectrumData] = useState<PowerSpectrumDataPoint[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResults | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(exampleChatHistory);
  const [optimizationRuns, setOptimizationRuns] = useState<ChatMessage[]>([exampleChatHistory[1]]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [constraints, setConstraints] = useState<OptimizationConstraints>({});
  const [isLiveInput, setIsLiveInput] = useState<boolean>(false);
  const [customCoefficients, setCustomCoefficients] = useState<number[] | null>(null);
  const [liveAnalysisResults, setLiveAnalysisResults] = useState<AnalysisResults | null>(null);
  const [bitWidthAnalysisResult, setBitWidthAnalysisResult] = useState<BitWidthAnalysis | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  const activeBlock = dspChain[activeBlockIndex];
  const activeBlockType = activeBlock?.type || 'FIR';

  useEffect(() => {
    const savedTheme = localStorage.getItem('dsp-theme') as Theme | null;
    if (savedTheme) setTheme(savedTheme);
    const loggedInUser = sessionStorage.getItem('dsp-user');
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setView('dashboard');
    } else {
      setView('landing');
    }
    const savedTargets = localStorage.getItem('dsp-emulation-targets');
    if (savedTargets) {
        setEmulationTargets(JSON.parse(savedTargets));
    }
  }, []);
  
  useEffect(() => {
      localStorage.setItem('dsp-emulation-targets', JSON.stringify(emulationTargets));
  }, [emulationTargets]);

  useEffect(() => {
    const root = window.document.documentElement;
    const mode = getThemeMode(theme);
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('dsp-theme', theme);
  }, [theme]);

  // Effect to lock body scroll when sidebar is open on mobile
  useEffect(() => {
    const handleResize = () => {
        // Tailwind's `md` breakpoint is 768px
        if (window.innerWidth < 768 && isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    handleResize(); // Check on initial render and when isSidebarOpen changes

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        document.body.style.overflow = ''; // Cleanup on component unmount
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const isAudioSignal = ['Audio', 'Speech', 'Music'].includes(selectedSignal);
    if (!isAudioSignal && isLiveInput) {
        setIsLiveInput(false);
    }
  }, [selectedSignal, isLiveInput]);
  
  // Effect to generate source signal
  useEffect(() => {
    if (isLiveInput) {
        setSourceSignal({ cleanData: [], noisyData: [] });
    } else {
        const { cleanData, noisyData } = generateSignalData(selectedSignal);
        setSourceSignal({ cleanData, noisyData });
    }
    // Reset history when signal type changes, unless it's the initial example load
    if (chatHistory !== exampleChatHistory) {
      setChatHistory([]);
      setOptimizationRuns([]);
      setCustomCoefficients(null);
      setBitWidthAnalysisResult(null);
    }
  }, [selectedSignal, isLiveInput]);


  const performFullAnalysis = useCallback((data: ChartDataPoint[], signalType: SignalType, chain: DspBlockConfig[], activeIndex: number): { analysis: AnalysisResults, spectrumData: PowerSpectrumDataPoint[] } => {
      const clean = data.map(d => d.clean);
      const input = data.map(d => d.input);
      const baseline = data.map(d => d.baselineOutput);
      const optimized = data.some(d => d.outputOptimized !== undefined) ? data.map(d => d.outputOptimized ?? 0) : [];
      const custom = data.some(d => d.outputCustom !== undefined) ? data.map(d => d.outputCustom ?? 0) : [];

      const analysis: AnalysisResults = {
          baseline: { mse: calculateMse(clean, baseline), snr: calculateSnr(clean, baseline) }
      };

      if (optimized.length > 0) analysis.aiOptimized = { mse: calculateMse(clean, optimized), snr: calculateSnr(clean, optimized) };
      if (custom.length > 0) analysis.custom = { mse: calculateMse(clean, custom), snr: calculateSnr(clean, custom) };

      const samplingRate = getSamplingRate(signalType);
      
      const activeFftBlock = chain[activeIndex]?.type === 'FFT' ? chain[activeIndex] : null;
      const fftSize = activeFftBlock?.settings?.fftSize || 256;
      const windowType = activeFftBlock?.settings?.windowType || 'None';

      const inputPsd = calculatePsd(input, fftSize, windowType);
      const baselinePsd = calculatePsd(baseline, fftSize, windowType);
      const optimizedPsd = optimized.length > 0 ? calculatePsd(optimized, fftSize, windowType) : [];
      const customPsd = custom.length > 0 ? calculatePsd(custom, fftSize, windowType) : [];
      
      const spectrumPoints = inputPsd.length;
      const spectrumData: PowerSpectrumDataPoint[] = [];
      for (let i = 0; i < spectrumPoints; i++) {
          spectrumData.push({
              frequency: i * (samplingRate / (spectrumPoints * 2)),
              inputPower: 10 * Math.log10(Math.max(inputPsd[i], 1e-12)),
              baselinePower: 10 * Math.log10(Math.max(baselinePsd[i], 1e-12)),
              ...(optimizedPsd.length > 0 && { optimizedPower: 10 * Math.log10(Math.max(optimizedPsd[i], 1e-12)) }),
              ...(customPsd.length > 0 && { customPower: 10 * Math.log10(Math.max(customPsd[i], 1e-12)) }),
          });
      }
      
      if (signalType === 'EEG') {
          analysis.eegBands = { baseline: calculateEegBands(baselinePsd, samplingRate) };
          if (optimizedPsd.length > 0) analysis.eegBands.aiOptimized = calculateEegBands(optimizedPsd, samplingRate);
          if (customPsd.length > 0) analysis.eegBands.custom = calculateEegBands(customPsd, samplingRate);
      }
      
      if (signalType === 'HRV' && activeBlock?.type === 'FFT') {
          const hrv: { aiOptimized?: HrvAnalysis; custom?: HrvAnalysis; } = {};
          if (optimized.length > 0) {
              hrv.aiOptimized = calculateHrvPowerBands(optimized, samplingRate, fftSize, windowType);
          }
          if (custom.length > 0) {
              hrv.custom = calculateHrvPowerBands(custom, samplingRate, fftSize, windowType);
          }
          if (Object.keys(hrv).length > 0) {
              analysis.hrvAnalysis = hrv;
          }
      }

      return { analysis, spectrumData };
  }, [activeBlock]);

  // Main simulation and analysis effect
  useEffect(() => {
    if (isLiveInput || sourceSignal.cleanData.length === 0 || dspChain.length === 0) {
        setFullSignalData([]);
        setFrequencyResponseData([]);
        setPowerSpectrumData([]);
        setCurrentAnalysis(null);
        return;
    }

    const baselineChain = dspChain.map(({ config, ...rest }) => rest);
    const baselineOutput = processFullChain(sourceSignal.noisyData, baselineChain);
    const optimizedOutput = processFullChain(sourceSignal.noisyData, dspChain);

    let customOutput: number[] | undefined;
    if (customCoefficients && activeBlock) {
        const customBlock: DspBlockConfig = { ...activeBlock, config: { ...activeBlock.config, coefficients: customCoefficients } as OptimizationResult };
        const chainWithCustom = [...dspChain];
        chainWithCustom[activeBlockIndex] = customBlock;
        customOutput = processFullChain(sourceSignal.noisyData, chainWithCustom);
    }
    
    const data = sourceSignal.cleanData.map((clean, i) => ({
        time: i, clean, input: sourceSignal.noisyData[i],
        baselineOutput: baselineOutput[i],
        outputOptimized: optimizedOutput[i],
        ...(customOutput && { outputCustom: customOutput[i] })
    }));
    setFullSignalData(data);

    const { analysis, spectrumData } = performFullAnalysis(data, selectedSignal, dspChain, activeBlockIndex);
    setCurrentAnalysis(analysis);
    setPowerSpectrumData(spectrumData);

    // Calculate frequency response for the active block
    const activeBlockConfig = activeBlock?.config;
    const filterOrder = activeBlock?.settings?.filterOrder || 11;
    const baselineCoeffs = filterTypes.includes(activeBlockType) ? Array(filterOrder).fill(1 / filterOrder) : [];
    const baselineFreqResp = calculateFrequencyResponse(baselineCoeffs);
    const optimizedFreqResp = activeBlockConfig ? calculateFrequencyResponse(activeBlockConfig.coefficients) : [];
    const customFreqResp = customCoefficients ? calculateFrequencyResponse(customCoefficients) : [];

    const freqPoints = baselineFreqResp.length;
    const freqData: FrequencyDataPoint[] = [];
    if (freqPoints > 0) {
        for (let i = 0; i < freqPoints; i++) {
            freqData.push({
                frequency: i / (freqPoints * 2),
                baselineDb: baselineFreqResp[i],
                optimizedDb: optimizedFreqResp.length > 0 ? optimizedFreqResp[i] : undefined,
                customDb: customFreqResp.length > 0 ? customFreqResp[i] : undefined,
            });
        }
    }
    setFrequencyResponseData(freqData);

  }, [sourceSignal, dspChain, customCoefficients, isLiveInput, activeBlockIndex, selectedSignal, performFullAnalysis, activeBlock, activeBlockType]);

  // Effect for live signal animation
  useEffect(() => {
    if (isLiveInput) {
        setLiveSignalData([]);
        return;
    }
    setLiveSignalData([]);
    if (fullSignalData.length === 0) return;

    // Show a smaller slice for live animation to keep it smooth
    const animatedData = fullSignalData.slice(0, 200);

    const intervalId = setInterval(() => {
      setLiveSignalData(currentData => {
        if (currentData.length >= animatedData.length) {
          clearInterval(intervalId);
          return currentData;
        }
        return animatedData.slice(0, currentData.length + 1);
      });
    }, 40);
    return () => clearInterval(intervalId);
  }, [fullSignalData, isLiveInput]);
  
  // Effect for microphone handling
  useEffect(() => {
    const stopMicrophone = () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        setLiveAnalysisResults(null);
        setPowerSpectrumData([]);
    };

    if (isLiveInput) {
        const startMicrophone = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                microphoneStreamRef.current = stream;

                const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = context;

                const analyser = context.createAnalyser();
                analyser.fftSize = 2048;
                analyserRef.current = analyser;

                const source = context.createMediaStreamSource(stream);
                source.connect(analyser);

                const buffer = new Float32Array(analyser.fftSize);

                const updateChart = () => {
                    if (!analyserRef.current || !audioContextRef.current) return;
                    analyserRef.current.getFloatTimeDomainData(buffer);
                    
                    const noisySignal: number[] = [];
                    const step = Math.floor(analyserRef.current.fftSize / 200);
                    for (let i = 0; i < 200; i++) {
                        noisySignal.push(buffer[i * step] || 0);
                    }
                    
                    const baselineChain = dspChain.map(({ config, ...rest }) => rest);
                    const baselineOutput = processFullChain(noisySignal, baselineChain);
                    const optimizedOutput = processFullChain(noisySignal, dspChain);
                    
                    const chartPoints: ChartDataPoint[] = noisySignal.map((input, i) => ({
                        time: i, clean: input, input,
                        baselineOutput: baselineOutput[i],
                        outputOptimized: optimizedOutput[i],
                    }));
                    setLiveSignalData(chartPoints);

                    const { analysis, spectrumData } = performFullAnalysis(chartPoints, selectedSignal, dspChain, activeBlockIndex);
                    setLiveAnalysisResults(analysis);
                    setPowerSpectrumData(spectrumData);

                    animationFrameIdRef.current = requestAnimationFrame(updateChart);
                };
                updateChart();

            } catch (err) {
                console.error("Error accessing microphone:", err);
                setError("Microphone access denied. Please enable it in your browser settings.");
                setIsLiveInput(false);
            }
        };
        startMicrophone();
    } else {
        stopMicrophone();
    }
    return stopMicrophone;
  }, [isLiveInput, activeBlockType, dspChain, selectedSignal, performFullAnalysis, activeBlockIndex]);

  const runSimulationAndAnalysisAfterAI = useCallback((newChain: DspBlockConfig[], baseSignal: {cleanData: number[], noisyData: number[]}) => {
      const baselineChain = newChain.map(({ config, ...rest }) => rest);
      const baselineOutput = processFullChain(baseSignal.noisyData, baselineChain);
      const optimizedOutput = processFullChain(baseSignal.noisyData, newChain);

      const newData = baseSignal.cleanData.map((clean, i) => ({
        time: i, clean: clean, input: baseSignal.noisyData[i],
        baselineOutput: baselineOutput[i],
        outputOptimized: optimizedOutput[i],
      }));
      
      const { analysis, spectrumData } = performFullAnalysis(newData, selectedSignal, newChain, activeBlockIndex);

      const activeBlockConfig = newChain[activeBlockIndex]?.config;
      const filterOrder = newChain[activeBlockIndex]?.settings?.filterOrder || 11;
      const baselineCoeffs = filterTypes.includes(activeBlockType) ? Array(filterOrder).fill(1 / filterOrder) : [];
      const baselineFreqResp = calculateFrequencyResponse(baselineCoeffs);
      const optimizedFreqResp = activeBlockConfig ? calculateFrequencyResponse(activeBlockConfig.coefficients) : [];
      
      const freqPoints = baselineFreqResp.length;
      const freqData: FrequencyDataPoint[] = [];
       if (freqPoints > 0) {
        for (let i = 0; i < freqPoints; i++) {
            freqData.push({
                frequency: i / (freqPoints * 2),
                baselineDb: baselineFreqResp[i],
                optimizedDb: optimizedFreqResp.length > 0 ? optimizedFreqResp[i] : undefined,
            });
        }
      }

      return { newData, analysis, freqData, spectrumData };
  }, [activeBlockIndex, activeBlockType, performFullAnalysis, selectedSignal]);

  const handleSendMessage = useCallback(async (
    userPrompt: string, 
    image?: { base64Data: string; mimeType: string; dataUrl: string; }
  ) => {
    setIsLoading(true);
    setError(null);
    setCustomCoefficients(null);
    setBitWidthAnalysisResult(null);

    if (isLiveInput) setIsLiveInput(false);
    
    // Use a timeout to ensure the state change from isLiveInput propagates and sourceSignal is generated
    setTimeout(async () => {
        const baseSignal = sourceSignal;
        if (baseSignal.noisyData.length === 0 && !image) {
            setError("Not enough signal data to run simulation. Please provide more data or an image.");
            setChatHistory(prev => [...prev, { role: 'ai', text: 'Error: Not enough signal data to run simulation.' }]);
            setIsLoading(false);
            return;
        }

        const updatedChatHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userPrompt, image: image?.dataUrl }];
        setChatHistory(updatedChatHistory);

        try {
          const imagePayload = image ? { base64Data: image.base64Data, mimeType: image.mimeType } : undefined;
          
          const result = await optimizeDspBlock(dspChain, activeBlockIndex, selectedSignal, updatedChatHistory, fpgaTarget, clockFrequency, constraints, baseSignal.noisyData, imagePayload);
          
          const newChain = [...dspChain];
          newChain[activeBlockIndex] = { ...newChain[activeBlockIndex], config: result };

          const { analysis } = runSimulationAndAnalysisAfterAI(newChain, baseSignal);
          
          const aiMessage: ChatMessage = { role: 'ai', result, analysis, validationStatus: 'idle' };

          setDspChain(newChain); // This will trigger the main simulation useEffect
          setChatHistory(prev => [...prev, aiMessage]);
          setOptimizationRuns(prev => [...prev, aiMessage]);

        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setError(`Failed to get optimization results from AI: ${errorMessage}`);
          setChatHistory(prev => [...prev, { role: 'ai', text: `Error: ${errorMessage}` }]);
          console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, 100);
  }, [dspChain, activeBlockIndex, selectedSignal, chatHistory, fpgaTarget, clockFrequency, constraints, isLiveInput, runSimulationAndAnalysisAfterAI, sourceSignal]);

  const handleHardwareInTheLoopOptimize = useCallback(async (messageIndex: number) => {
    setIsLoading(true);
    setError(null);
    
    const previousMessage = chatHistory[messageIndex];
    if (!previousMessage || previousMessage.validationStatus !== 'complete') {
        setError("Validation must be complete before running a hardware-in-the-loop optimization.");
        setIsLoading(false);
        return;
    }
    
    const userPrompt = "The synthesis results are in. Re-optimize the design focusing on reducing LUTs, as they came in higher than expected. I am willing to trade a small amount of throughput if necessary.";

    const updatedChatHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userPrompt }];
    setChatHistory(updatedChatHistory);

    try {
        const result = await optimizeWithHardwareFeedback(previousMessage, dspChain, activeBlockIndex, selectedSignal, fpgaTarget, clockFrequency, sourceSignal.noisyData, userPrompt);
        
        const newChain = [...dspChain];
        newChain[activeBlockIndex] = { ...newChain[activeBlockIndex], config: result };

        const { analysis } = runSimulationAndAnalysisAfterAI(newChain, sourceSignal);
        
        const aiMessage: ChatMessage = { role: 'ai', result, analysis, validationStatus: 'idle', isHwFeedbackRun: true };
        
        setDspChain(newChain);
        setChatHistory(prev => [...prev, aiMessage]);
        setOptimizationRuns(prev => [...prev, aiMessage]);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`HIL optimization failed: ${errorMessage}`);
        setChatHistory(prev => [...prev, { role: 'ai', text: `Error: ${errorMessage}` }]);
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [chatHistory, dspChain, activeBlockIndex, selectedSignal, fpgaTarget, clockFrequency, sourceSignal, runSimulationAndAnalysisAfterAI]);

  const handleApplyCustomCoefficients = (coefficients: number[]) => {
    setCustomCoefficients(coefficients);
    // Main simulation useEffect will handle the rest
  };

  const handleValidateOnHardware = (messageIndex: number) => {
    setChatHistory(prev => {
        const newHistory = [...prev];
        if (newHistory[messageIndex]) {
            newHistory[messageIndex] = { ...newHistory[messageIndex], validationStatus: 'validating' };
        }
        return newHistory;
    });

    setTimeout(() => {
        setChatHistory(prev => {
            const newHistory = [...prev];
            const messageToUpdate = newHistory[messageIndex];

            if (messageToUpdate && messageToUpdate.result && messageToUpdate.analysis) {
                const aiMetrics = messageToUpdate.result.metrics;
                const parse = (val: string) => parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                
                const lutVariance = 1 + (Math.random() * 0.15 + 0.05);
                const ffVariance = 1 + (Math.random() * 0.15 + 0.08);
                const throughputVariance = 1 - (Math.random() * 0.05 + 0.02);

                const validatedMetrics: HardwareMetrics = {
                    lutCount: `~${Math.round(parse(aiMetrics.lutCount) * lutVariance)}`,
                    ffCount: `~${Math.round(parse(aiMetrics.ffCount) * ffVariance)}`,
                    dspSlices: aiMetrics.dspSlices,
                    bramBlocks: aiMetrics.bramBlocks,
                    cyclesPerSample: aiMetrics.cyclesPerSample,
                    throughput: `${(parse(aiMetrics.throughput) * throughputVariance).toFixed(2)} MSPS`
                };

                const initialFarmResults: BoardFarmValidationResult[] = emulationTargets.map(target => ({
                    target,
                    status: 'pending'
                }));

                newHistory[messageIndex] = {
                    ...messageToUpdate,
                    analysis: {
                        ...messageToUpdate.analysis,
                        validatedMetrics: validatedMetrics,
                        boardFarmValidationResults: initialFarmResults,
                    },
                };
            }
            return newHistory;
        });
        
        if (emulationTargets.length > 0) {
            let targetIndex = 0;
            const interval = setInterval(() => {
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    const analysis = newHistory[messageIndex]?.analysis;
                    if (analysis?.boardFarmValidationResults && targetIndex < analysis.boardFarmValidationResults.length) {
                        analysis.boardFarmValidationResults[targetIndex].status = 'testing';
                    }
                    return newHistory;
                });
                
                setTimeout(() => {
                    setChatHistory(prev => {
                        const newHistory = [...prev];
                        const analysis = newHistory[messageIndex]?.analysis;
                        if (analysis?.boardFarmValidationResults && targetIndex < analysis.boardFarmValidationResults.length) {
                            analysis.boardFarmValidationResults[targetIndex].status = Math.random() > 0.1 ? 'pass' : 'fail';
                        }
                        return newHistory;
                    });
                    targetIndex++;
                    if (targetIndex >= emulationTargets.length) {
                        clearInterval(interval);
                        setChatHistory(prev => {
                            const newHistory = [...prev];
                            newHistory[messageIndex].validationStatus = 'complete';
                            return newHistory;
                        });
                    }
                }, 500);
            }, 300);
        } else {
             setTimeout(() => {
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[messageIndex].validationStatus = 'complete';
                    return newHistory;
                });
            }, 1000);
        }

    }, 4500); 
  };
  
  const handleExportData = () => {
    exportDataAsCsv(fullSignalData);
  };

  const handleExportReport = () => {
    let latestAiMessage: ChatMessage | undefined;
    for (let i = chatHistory.length - 1; i >= 0; i--) {
        if (chatHistory[i].role === 'ai' && chatHistory[i].result) {
            latestAiMessage = chatHistory[i];
            break;
        }
    }
    
    let latestUserMessage: ChatMessage | undefined;
    for (let i = chatHistory.length - 1; i >= 0; i--) {
        if (chatHistory[i].role === 'user' && chatHistory[i].text) {
            latestUserMessage = chatHistory[i];
            break;
        }
    }

    if (latestAiMessage && latestAiMessage.result) {
        exportReportAsMarkdown(
            latestAiMessage.result,
            latestAiMessage.analysis || null,
            {
                blockType: activeBlockType,
                signalType: selectedSignal,
                fpgaTarget: fpgaTarget,
                clockFrequency: clockFrequency,
                userPrompt: latestUserMessage?.text || "Initial optimization prompt."
            }
        );
    } else {
        alert("No AI result available to export.");
    }
  };

  const handleExportProject = () => {
    let latestAiMessage: ChatMessage | undefined;
    for (let i = chatHistory.length - 1; i >= 0; i--) {
        if (chatHistory[i].role === 'ai' && chatHistory[i].result) {
            latestAiMessage = chatHistory[i];
            break;
        }
    }
    if (latestAiMessage && latestAiMessage.result) {
        exportProjectAsZip(latestAiMessage.result, activeBlockType);
    } else {
        alert("No AI result available to export.");
    }
  };
  
  const handleBitWidthAnalysis = async (dataBitWidth: number, coefficientBitWidth: number) => {
    setIsAnalysisLoading(true);
    setBitWidthAnalysisResult(null);
    setError(null);

    const latestAiResult = [...chatHistory].reverse().find(m => m.role === 'ai' && m.result)?.result;
    if (!latestAiResult) {
        setError("No AI result available to run analysis on.");
        setIsAnalysisLoading(false);
        return;
    }

    try {
        const estimatedMetrics = await estimateHardwareForBitWidths(
            activeBlockType,
            latestAiResult,
            dataBitWidth,
            coefficientBitWidth
        );

        const analyzedOutput = applyFixedPointFilter(
            sourceSignal.noisyData,
            latestAiResult.coefficients,
            dataBitWidth,
            coefficientBitWidth
        );

        const snr = calculateSnr(sourceSignal.cleanData, analyzedOutput);
        const mse = calculateMse(sourceSignal.cleanData, analyzedOutput);
        
        setBitWidthAnalysisResult({
            snr,
            mse,
            metrics: estimatedMetrics,
            dataBitWidth,
            coefficientBitWidth
        });

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Bit-width analysis failed: ${errorMessage}`);
        console.error("Bit width analysis failed:", e);
    } finally {
        setIsAnalysisLoading(false);
    }
  };
  
  const handleBlockSettingChange = (key: string, value: any) => {
      setDspChain(prevChain => {
          const newChain = [...prevChain];
          const activeBlock = newChain[activeBlockIndex];
          if (activeBlock) {
              activeBlock.settings = {
                  ...activeBlock.settings,
                  [key]: value
              };
          }
          return newChain;
      });
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    sessionStorage.setItem('dsp-user', username);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('dsp-user');
    setView('landing');
  };
  
  const handleGetStarted = () => {
      setView('auth');
  }

  if (view === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }
  
  if (view === 'auth') {
      return <AuthPage onLogin={handleLogin} onBack={() => setView('landing')} />;
  }

  return (
    <div className={`theme-${theme} font-sans bg-bg-main min-h-screen flex text-text-main`}>
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedSignal={selectedSignal}
        setSelectedSignal={setSelectedSignal}
        dspChain={dspChain}
        setDspChain={setDspChain}
        activeBlockIndex={activeBlockIndex}
        setActiveBlockIndex={setActiveBlockIndex}
        isLiveInput={isLiveInput}
        setIsLiveInput={setIsLiveInput}
      />
      {isSidebarOpen && window.innerWidth < 768 && (
        <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black/50 z-45" 
            aria-hidden="true" 
        />
      )}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'} relative z-0`}>
        <Header 
          currentUser={currentUser}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          setTheme={setTheme}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {currentUser && activeBlock && (
            <Dashboard 
              theme={theme}
              selectedSignal={selectedSignal}
              dspChain={dspChain}
              activeBlockIndex={activeBlockIndex}
              fpgaTarget={fpgaTarget}
              setFpgaTarget={setFpgaTarget}
              clockFrequency={clockFrequency}
              setClockFrequency={setClockFrequency}
              constraints={constraints}
              setConstraints={setConstraints}
              emulationTargets={emulationTargets}
              setEmulationTargets={setEmulationTargets}
              signalData={isLiveInput ? liveSignalData : liveSignalData}
              frequencyResponseData={frequencyResponseData}
              powerSpectrumData={powerSpectrumData}
              currentAnalysis={isLiveInput ? liveAnalysisResults : currentAnalysis}
              isLoading={isLoading}
              isAnalysisLoading={isAnalysisLoading}
              error={error}
              setError={setError}
              onSendMessage={handleSendMessage}
              onApplyCustomCoefficients={handleApplyCustomCoefficients}
              onValidateOnHardware={handleValidateOnHardware}
              onHardwareInTheLoopOptimize={handleHardwareInTheLoopOptimize}
              onExportData={handleExportData}
              onExportReport={handleExportReport}
              onExportProject={handleExportProject}
              chatHistory={chatHistory}
              optimizationRuns={optimizationRuns}
              isComparisonModalOpen={isComparisonModalOpen}
              setIsComparisonModalOpen={setIsComparisonModalOpen}
              isLiveInput={isLiveInput}
              liveAnalysisResults={liveAnalysisResults}
              bitWidthAnalysisResult={bitWidthAnalysisResult}
              onRunBitWidthAnalysis={handleBitWidthAnalysis}
              onBlockSettingChange={handleBlockSettingChange}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
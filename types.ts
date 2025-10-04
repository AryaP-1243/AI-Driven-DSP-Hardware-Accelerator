export type SignalType = 
  // Biomedical
  'ECG' | 'ECG (Arrhythmia)' | 'ECG (Arrhythmia Simulation)' | 'ECG (Noise Artifacts)' | 'ECG (PAC/PVC beats)' | 'Fetal ECG' |
  'EEG' | 'EMG (Muscle)' | 'EOG (Eye Movement)' | 'Plethysmogram (PPG)' | 'Blood Pressure (ABP)' | 'Phonocardiogram (PCG)' |
  'Galvanic Skin Response (GSR)' | 'Respiratory (RIP)' | 'HRV' | 
  // Audio & Speech
  'Speech' | 'Speech (Female)' | 'Audio' | 'Music' | 'Piano Chord' | 'Guitar Riff' | 'Drum Loop' | 'Violin Note' | 'Flute Note' |
  'Bass Guitar Note' | 'Trumpet Note' | 'Audio (Cymbal Crash)' | 'Audio (Square Lead Synth)' | 'Spoken Digit' | 'Doppler Shift Audio' |
  'White Noise' | 'Pink Noise' | 'Brownian Noise' |
  // Test Signals
  'Sine Wave' | 'Cosine Wave' | 'Square Wave' | 'Sawtooth Wave' | 'Triangle Wave' | 'Step Function' | 'Impulse Function' |
  'Chirp Signal' | 'Swept-Frequency Cosine' | 'Damped Sine Wave' | 'Gaussian Pulse' | 'Sinc Function' | 'Multitone Signal' |
  'Second-Order System Response' | 'Rectangular Pulse Train' | 'Random Binary Sequence' |
  // Communications & RF
  'BPSK Signal' | 'QPSK Signal' | '8-PSK Signal' | '16-QAM Signal' | '64-QAM Signal' | '256-QAM Signal' | 'GMSK Signal' |
  'OFDM Signal' | 'AM Signal' | 'FM Signal' | 'Double-Sideband SC' | 'Single-Sideband SC' | 'ASK Signal' | 'FSK Signal' |
  'CPFSK Signal' | 'PWM Signal' | 'PPM Signal' | 'Manchester Code' | 'CDMA Signal (Sim.)' | 'LTE Downlink Signal (Sim.)' |
  '5G NR Signal (Sim.)' | 'Bluetooth LE Packet (Sim.)' | 'WiFi Beacon (Sim.)' | 'GPS L1 C/A Code' | 'Satellite Telemetry' |
  // Radar & Sonar
  'Pulsed Radar Return' | 'FMCW Radar Signal' | 'Doppler Radar' | 'Sonar Ping' | 'Bat Echolocation Chirp' |
  'Linear Frequency Modulated (LFM) Pulse' | 'Barker Code Pulse' | 'Ultrasound Pulse' | 'Hydrophone (Marine)' |
  // Mechanical & Sensor
  'Vibration Sensor' | 'Accelerometer Data' | 'Gyroscope Data' | 'Engine Knock Sensor' | 'Bearing Fault Signal' |
  // Power Systems
  'Three-Phase Power' | 'Power Line Transient' |
  // Other
  'Seismic Data' | 'Seismic P-wave' | 'Seismic S-wave' | 'Chaotic Signal (Lorenz)' |
  'Stock Price (Simulated)' | 'Volatility Index (Sim.)' | 'MACD Indicator (Sim.)' |
  'Weather Sensor Data' | 'Light Sensor Data';

export type Theme = 'dark' | 'light' | 'ocean' | 'forest' | 'sunset';
export type ThemeMode = 'light' | 'dark';
export type WindowType = 'None' | 'Hamming' | 'Blackman' | 'Hann';
export type FilterType = 'Low-pass' | 'High-pass' | 'Band-pass' | 'Band-stop';

export type BlockType = 
  // Filters
  'FIR' | 'IIR' | 'CIC Filter' | 'Half-band Filter' | 'Matched Filter' | 'Wiener Filter' | 'Kalman Filter' |
  'Comb Filter' | 'All-pass Filter' | 'Goertzel Algorithm' | 'Median Filter' |
  // Adaptive Filters
  'LMS Filter' | 'RLS Filter' |
  // Transforms
  'FFT' | 'IFFT' | 'DCT' | 'Walsh-Hadamard Transform' | 'Hilbert Transform' | 'Discrete Wavelet Transform' | 
  'Short-Time Fourier Transform (STFT)' |
  // Modulation / Demodulation
  'QAM Modulator' | 'QAM Demodulator' | 'QPSK Modulator' | 'QPSK Demodulator' | 'BPSK Modulator' |
  'Symbol Mapper' | 'Channel Estimator' | 'Equalizer' | 'Preamble Detector' |
  // Math & Arithmetic
  'CORDIC' | 'Divider' | 'Multiplier' | 'Adder Tree' | 'Absolute Value' | 'Integrator' | 'Differentiator' | 
  'Look-Up Table (LUT)' | 'Barrel Shifter' |
  // Frequency & Phase
  'Direct Digital Synthesizer (DDS)' | 'Digital Frequency Synthesizer' | 'Digital Mixer' | 'Phase Detector' |
  'Numerically Controlled Oscillator (NCO)' | 'Phase-Locked Loop (PLL)' |
  // Correlation & Synchronization
  'Correlation' |
  // OFDM / Communications
  'Cyclic Prefix Insertion' | 'Cyclic Prefix Removal' |
  // Forward Error Correction
  'Viterbi Decoder' | 'Reed-Solomon Encoder' |
  // Statistics & Measurement
  'Moving Average' | 'RMS' | 'Standard Deviation' | 'Histogram' |
  // Image & Video
  '2D FIR Filter' |
  // General Purpose
  'DUC/DDC' | 'Convolution' | 'Signal Generator';

export interface DspBlockConfig {
  id: string;
  type: BlockType;
  config?: OptimizationResult;
  settings?: {
    // Shared
    windowType?: WindowType;
    // FFT
    fftSize?: number;
    // FIR/IIR
    filterOrder?: number;
    filterType?: FilterType;
  };
}

export type FpgaTarget = 
  // AMD/Xilinx
  'Xilinx Spartan-7' | 'Xilinx Artix-7' | 'Xilinx Kintex-7' | 'Xilinx Virtex-7' |
  'Xilinx UltraScale' | 'Xilinx UltraScale+' |
  'Xilinx Zynq-7000' | 'Xilinx Zynq UltraScale+' |
  'Xilinx Versal Core' | 'Xilinx Versal AI Core' |
  // Intel/Altera
  'Intel Cyclone IV' | 'Intel Cyclone V' | 'Intel Cyclone 10' |
  'Intel Arria V' | 'Intel Arria 10' |
  'Intel Stratix IV' | 'Intel Stratix V' | 'Intel Stratix 10' |
  'Intel Agilex' | 'Intel MAX 10' |
  // Lattice
  'Lattice iCE40' | 'Lattice MachXO3' | 'Lattice ECP5' | 'Lattice CertusPro-NX' | 'Lattice Avant' |
  // Microchip
  'Microchip IGLOO2' | 'Microchip SmartFusion2' | 'Microchip PolarFire' | 'Microchip PolarFire SoC' |
  // GOWIN
  'Gowin LittleBee' | 'Gowin Arora';

export interface ChartDataPoint {
  time: number;
  clean: number;
  input: number; // clean + noise
  baselineOutput: number;
  outputOptimized?: number;
  outputCustom?: number;
}

export interface FrequencyDataPoint {
  frequency: number; // Normalized frequency 0 to 0.5
  baselineDb?: number;
  optimizedDb?: number;
  customDb?: number;
}

export interface PowerSpectrumDataPoint {
    frequency: number;
    inputPower?: number;
    baselinePower?: number;
    optimizedPower?: number;
    customPower?: number;
}

export interface HardwareMetrics {
    lutCount: string;
    ffCount: string;
    dspSlices: string;
    bramBlocks: string;
    cyclesPerSample: string;
    throughput: string;
}

export interface OptimizationResult {
  explanation: string;
  metrics: HardwareMetrics;
  coefficients: number[];
  dataBitWidth: number;
  coefficientBitWidth: number;
  hdlModule: string;
  hdlTestbench: string;
  synthesisScript: string;
  stimulusFileContent?: string;
}

export interface User {
    username: string;
    password: string; // In a real app, this would be a hash
}

export interface QuantitativeMetrics {
    snr: number;
    mse: number;
}

export interface HrvAnalysis {
    lfPower: number;
    hfPower: number;
    lfHfRatio: number;
}

export interface EegBands {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
}

export type BoardValidationStatus = 'pending' | 'testing' | 'pass' | 'fail';

export interface BoardFarmValidationResult {
    target: FpgaTarget;
    status: BoardValidationStatus;
}


export interface AnalysisResults {
    baseline: QuantitativeMetrics;
    aiOptimized?: QuantitativeMetrics;
    custom?: QuantitativeMetrics;
    hrvAnalysis?: {
        aiOptimized?: HrvAnalysis;
        custom?: HrvAnalysis;
    };
    eegBands?: {
        baseline: EegBands;
        aiOptimized?: EegBands;
        custom?: EegBands;
    };
    validatedMetrics?: HardwareMetrics;
    boardFarmValidationResults?: BoardFarmValidationResult[];
}

export type ValidationStatus = 'idle' | 'validating' | 'complete';

export interface ChatMessage {
    role: 'user' | 'ai';
    text?: string;
    image?: string; // base64 data URL for display
    result?: OptimizationResult;
    analysis?: AnalysisResults;
    validationStatus?: ValidationStatus;
    isHwFeedbackRun?: boolean;
}

export interface OptimizationConstraints {
    maxLuts?: string;
    maxFfs?: string;
    maxDsps?: string;
    maxBrams?: string;
    maxLatency?: string; // in cycles
}

export interface BitWidthAnalysis {
    snr: number;
    mse: number;
    metrics: HardwareMetrics;
    dataBitWidth: number;
    coefficientBitWidth: number;
}
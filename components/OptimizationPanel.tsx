import React, { useState, useEffect } from 'react';
import { BlockType, SignalType } from '../types';

interface OptimizationPanelProps {
  isLoading: boolean;
  error: string | null;
  onOptimize: (userPrompt: string) => void;
  selectedBlock: BlockType;
  selectedSignal: SignalType;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ isLoading, error, onOptimize, selectedBlock, selectedSignal }) => {
  
  const defaultPrompts: Record<string, Record<string, string>> = {
    // Filters
    'FIR': {
      'ECG': 'Design a low-order FIR filter for QRS complex detection, prioritizing minimal latency and using 12-bit quantized coefficients for resource savings.',
      'Fetal ECG': 'Design a filter to separate the fetal ECG from the maternal ECG signal. Prioritize removing the larger maternal QRS complex while preserving the smaller, higher-frequency fetal ECG.',
      'EEG': 'Create a linear-phase FIR band-pass filter for alpha waves (8-13 Hz), optimized for a deeply pipelined FPGA architecture to maximize throughput.',
      'Audio': 'Develop a 24-tap FIR low-pass filter for an audio DAC. Focus on high stop-band attenuation and symmetric coefficients to reduce multiplier usage.',
      'HRV': 'Design an FIR filter to remove very-low-frequency (VLF) components from an HRV tachogram, preserving the LF and HF bands for autonomic nervous system analysis.',
      'Speech': 'Design a low-latency FIR pre-emphasis filter for a speech processing system to boost high-frequency content, using minimal DSP slices for a mobile application.',
      'Music': 'Develop a 48-tap linear-phase FIR graphic equalizer band (e.g., centered at 1kHz) for a digital audio workstation, prioritizing coefficient symmetry to reduce multipliers.',
      'Engine Knock Sensor': 'Design a narrow bandpass FIR filter to isolate the high-frequency ringing characteristic of engine knock (~5-15 kHz). Prioritize extremely low latency for real-time engine control feedback.',
      'LTE Downlink Signal (Sim.)': 'Create a Root-Raised Cosine (RRC) FIR filter for pulse shaping in a simulated LTE transmitter. Optimize for low inter-symbol interference (ISI) and efficient implementation using polyphase decomposition.'
    },
    'IIR': {
        'ECG': 'Implement a resource-efficient IIR notch filter at 60Hz for powerline interference. Use canonical form to minimize delay elements on the FPGA.',
        'EEG': 'Design a low-order IIR Butterworth filter to isolate delta waves (0.5-4 Hz), focusing on stability after coefficient quantization for fixed-point implementation.',
        'Audio': 'Create a second-order section (SOS) based parametric EQ band. Optimize for minimal clock cycles per sample by parallelizing the feedback and feed-forward paths.',
        'HRV': 'Implement a narrow IIR bandpass filter to isolate the High-Frequency (HF) band (0.15-0.4 Hz) of an HRV signal for respiratory sinus arrhythmia analysis, prioritizing low group delay.',
        'Speech': 'Design a cascade of IIR filters to model the vocal tract for a speech synthesis application, focusing on real-time coefficient updatability.',
        'Music': 'Create a bank of IIR biquad filters to implement a Linkwitz-Riley crossover network for a 3-way high-fidelity speaker system, focusing on phase coherence.',
    },
    'CIC Filter': {
        'ECG': 'Design a 3-stage CIC decimator for a high-sample-rate ECG ADC, focusing on power efficiency.',
        'EEG': 'Implement a CIC interpolator for a DAC output in an EEG signal generator, minimizing droop.',
        'Audio': 'Optimize a 5-stage CIC filter for a delta-sigma ADC in a high-fidelity audio system.',
        'HRV': 'Use a CIC filter for efficient rate conversion of an oversampled physiological signal before HRV analysis.',
        'Speech': 'Design a CIC decimator for the front-end of a digital microphone, optimizing for a low gate count.',
        'Music': 'Implement a CIC interpolator in a high-quality audio DAC, focusing on compensating for sinc droop in the passband.',
    },
    'Half-band Filter': {
        'ECG': 'Use a half-band filter for efficient decimation-by-2 of an oversampled ECG signal.',
        'EEG': 'Implement a half-band filter in a polyphase structure for an EEG analysis channelizer.',
        'Audio': 'Design a low-latency half-band filter for a digital audio crossover network.',
        'HRV': 'Implement an efficient half-band filter for the first stage of decimation in an HRV analysis pipeline.',
        'Speech': 'Use a half-band filter for splitting a speech signal into sub-bands for analysis, prioritizing low computational complexity.',
        'Music': 'Design a chain of half-band filters to create an octave-band filter bank for a music equalizer.',
    },
    'Matched Filter': {
        'ECG': 'Create a matched filter to detect a specific P-wave template in an ECG stream for arrhythmia analysis.',
        'EEG': 'Design a matched filter to identify specific event-related potentials (ERPs) in EEG data.',
        'Audio': 'Implement a matched filter for pulse detection in a digital audio watermarking scheme.',
        'HRV': 'Design a matched filter to identify specific patterns or artifacts in an HRV signal.',
        'Speech': 'Create a matched filter to detect a specific keyword or phoneme within a continuous speech stream.',
        'Music': 'Implement a matched filter to detect a specific drum hit (e.g., a snare) in a complex musical passage for transcription.',
    },
    'Wiener Filter': {
        'ECG': 'Design an adaptive Wiener filter to remove motion artifacts from a noisy ECG signal, optimizing for continuous coefficient updates.',
        'EEG': 'Implement a Wiener filter to separate a specific brainwave pattern from background EEG noise.',
        'Audio': 'Create a Wiener filter for audio denoising, focusing on efficient estimation of the noise power spectral density.',
        'HRV': 'Use a Wiener filter to smooth an HRV tachogram, reducing measurement noise while preserving physiological variations.',
        'Speech': 'Implement an adaptive Wiener filter to remove stationary background noise (e.g., fan noise) from a speech signal, optimizing the coefficient update rate.',
        'Music': 'Design a Wiener filter for audio restoration to remove tape hiss from an old music recording.',
    },
    'Kalman Filter': {
        'ECG': 'Use a Kalman filter to track the baseline wander in an ECG signal, focusing on a low-complexity state-space model.',
        'EEG': 'Implement a Kalman filter to predict and filter EEG signals for a brain-computer interface (BCI).',
        'Audio': 'Design a Kalman filter for tracking the pitch of a non-stationary audio signal.',
        'HRV': 'Apply a Kalman filter to predict the next R-R interval in an HRV signal for artifact detection and correction.',
        'Speech': 'Use a Kalman filter to track the formants of a speech signal for phonetic analysis.',
        'Music': 'Implement a Kalman filter to track the fundamental frequency of a singing voice with vibrato.',
    },
     'LMS Filter': {
        'ECG': 'Design an LMS adaptive filter to cancel 60Hz powerline noise from an ECG signal using a reference input.',
        'EEG': 'Implement an LMS filter for artifact removal in EEG signals, adapting to eye-blink or muscle movement artifacts.',
        'Audio': 'Design a 32-tap LMS adaptive filter for acoustic echo cancellation in a hands-free audio system. Optimize the adaptation step-size (mu) for fast convergence without instability.',
        'HRV': 'Use an LMS filter to model and predict R-R intervals, helping to identify ectopic beats in an HRV signal.',
        'Speech': 'Implement an LMS adaptive filter for noise cancellation in a speech signal. The filter should adapt to a noisy reference input to subtract background noise from the primary speech channel.',
        'Music': 'Create an adaptive LMS equalizer for a music track that adjusts its coefficients based on the spectral content of a reference track.',
    },
    'RLS Filter': {
        'ECG': 'Develop an RLS adaptive filter for baseline wander removal in ECG, leveraging its faster convergence for non-stationary signals.',
        'EEG': 'Implement an RLS filter for tracking fast-changing components in EEG signals for BCI applications.',
        'Audio': 'Develop a high-performance RLS adaptive filter for channel equalization in a digital audio link. Prioritize rapid convergence by optimizing the matrix inversion for the FPGA architecture.',
        'HRV': 'Use an RLS filter for system identification of the cardiovascular system from HRV and blood pressure signals.',
        'Speech': 'Create an RLS filter to track and remove a time-varying interfering tone from a speech signal. Focus on a numerically stable implementation due to the recursive nature of the RLS algorithm.',
        'Music': 'Design an RLS-based adaptive noise canceller to remove a persistent feedback tone during a live music performance.',
    },
    'Goertzel Algorithm': {
        'Audio': 'Design a Goertzel filter to detect a specific DTMF tone (e.g., 697 Hz) in an audio stream. Optimize for minimal logic usage on a Lattice iCE40 FPGA.',
        'ECG': 'Use the Goertzel algorithm to efficiently measure the power of 60Hz noise in an ECG signal for diagnostic purposes.',
    },
    'Moving Average': {
        'ECG': 'Create a simple 8-point moving average filter for smoothing a noisy ECG signal. Implement it using a circular buffer to minimize register usage and ensure constant throughput.',
        'HRV': 'Apply a 16-sample moving average to an HRV tachogram to identify the low-frequency trend line.',
    },
    // Transforms
    'FFT': {
        'ECG': 'Optimize a streaming Radix-2 FFT core for real-time heart rate variability (HRV) analysis. Focus on minimizing on-chip block RAM usage for twiddle factors.',
        'EEG': 'Configure a pipelined FFT for continuous spectral analysis of brainwave data, using single-port RAM for efficient data buffering between stages.',
        'Audio': 'Design a high-throughput Radix-4 FFT for a real-time audio spectrum analyzer. Specify an architecture that maximizes the use of DSP slices for butterfly computations.',
        'HRV': 'Configure a streaming FFT core to calculate the power spectral density of an HRV signal. Optimize for analyzing the Low-Frequency (LF: 0.04-0.15 Hz) and High-Frequency (HF: 0.15-0.4 Hz) power bands.',
        'Speech': 'Optimize an FFT for a real-time spectrogram display of speech signals, focusing on a windowing strategy (e.g., Hamming) that reduces spectral leakage for formant analysis.',
        'Music': 'Design a high-resolution FFT for a precise musical pitch detection algorithm. Prioritize minimal latency to provide real-time feedback for a guitar tuner.',
    },
     'Discrete Wavelet Transform': {
        'ECG': 'Implement a 3-level Haar DWT for ECG signal compression. Focus on a memory-efficient architecture for storing intermediate coefficients and minimizing BRAM usage.',
        'EEG': 'Design a Daubechies-4 (db4) DWT core for feature extraction from EEG signals for seizure detection.',
    },
    'IFFT': {
        'ECG': 'Design an IFFT for reconstructing a filtered ECG signal from the frequency domain.',
        'EEG': 'Implement a low-power IFFT for a neurofeedback signal synthesis system.',
        'Audio': 'Optimize an IFFT for an Orthogonal Frequency-Division Multiplexing (OFDM) based audio communication system.',
        'HRV': 'Use an IFFT to reconstruct an HRV signal after frequency-domain filtering to remove specific artifacts.',
        'Speech': 'Implement an IFFT as part of a phase vocoder for time-stretching a speech signal without altering its pitch.',
        'Music': 'Design a high-throughput IFFT for an additive synthesizer, combining multiple sine waves from frequency-domain parameters.',
    },
    'DCT': {
        'ECG': 'Use a DCT for ECG signal compression, optimizing the transform for low resource usage.',
        'EEG': 'Implement a fast DCT algorithm for feature extraction in an EEG-based seizure detection system.',
        'Audio': 'Design a DCT core for a perceptual audio codec, focusing on minimizing multiply operations.',
        'HRV': 'Apply a DCT for feature extraction from an HRV signal for machine learning-based classification.',
        'Speech': 'Use a DCT for calculating Mel-Frequency Cepstral Coefficients (MFCCs) in a speech recognition front-end.',
        'Music': 'Implement a DCT for a lossy audio compression algorithm like MP3, optimizing for energy compaction.',
    },
    'Walsh-Hadamard Transform': {
        'ECG': 'Implement a multiplier-free Walsh-Hadamard Transform for ECG signal analysis, prioritizing low logic utilization.',
        'EEG': 'Design a WHT core for analyzing spectral properties of EEG signals with minimal power consumption.',
        'Audio': 'Use a WHT for a simple audio scrambling application on a resource-constrained FPGA.',
        'HRV': 'Apply a Walsh-Hadamard Transform for analyzing patterns in HRV data with minimal computational cost.',
        'Speech': 'Implement a WHT for a simple voice scrambling system, prioritizing low power and resource usage.',
        'Music': 'Use a WHT for sequency-domain analysis of musical signals, exploring alternatives to frequency analysis.',
    },
    // Modulation
    'QAM Modulator': {
        'ECG': 'Design a 16-QAM modulator for embedding patient data into a telemetry side-channel of an ECG monitor.',
        'EEG': 'Implement a 64-QAM modulator for a high-data-rate wireless EEG sensor node.',
        'Audio': 'Optimize a 256-QAM modulator for a high-capacity digital audio broadcast system.',
        'HRV': 'Use a low-order QAM modulator to transmit HRV metrics wirelessly with low power.',
        'Speech': 'Design a 16-QAM modulator for a digital voice communication system, focusing on spectral efficiency.',
        'Music': 'Implement a 64-QAM modulator for a high-quality wireless stereo audio link.',
    },
    'Equalizer': {
        'Speech': 'Implement a 3-tap adaptive equalizer using the LMS algorithm for a QPSK speech signal. Focus on a deeply pipelined implementation for high throughput.',
        'Audio': 'Design a 5-tap channel equalizer using the RLS algorithm for a high-fidelity wireless audio link.',
    },
    'Phase-Locked Loop (PLL)': {
        'Audio': 'Design a digital Phase-Locked Loop for clock recovery of an S/PDIF audio signal. Optimize the loop filter for low jitter.',
        'Speech': 'Implement a digital PLL for carrier recovery of a BPSK modulated speech signal. Focus the design on fast lock time.',
    },
    'QAM Demodulator': {
        'ECG': 'Create a 16-QAM demodulator for extracting data from an ECG telemetry signal.',
        'EEG': 'Design a carrier and timing recovery loop for a 64-QAM demodulator in a wireless EEG receiver.',
        'Audio': 'Implement a robust 256-QAM demodulator for a professional audio link, focusing on equalization.',
        'HRV': 'Design a simple 4-QAM (QPSK) demodulator for a low-power wireless HRV sensor.',
        'Speech': 'Optimize a 16-QAM demodulator for a digital voice channel, prioritizing fast synchronization.',
        'Music': 'Implement a 64-QAM demodulator with forward error correction for a robust wireless in-ear monitor system.',
    },
    'QPSK Modulator': {
        'ECG': 'Design a simple QPSK modulator for a low-power, robust ECG data link.',
        'EEG': 'Implement an offset-QPSK (OQPSK) modulator to reduce phase discontinuities in an EEG data stream.',
        'Audio': 'Create a QPSK modulator for a simple digital audio communication channel.',
        'HRV': 'Design an ultra-low-power QPSK modulator for a wearable HRV monitoring device.',
        'Speech': 'Implement a QPSK modulator for a simple walkie-talkie style digital voice system.',
        'Music': 'Use a QPSK modulator to transmit MIDI data wirelessly for a musical instrument.',
    },
    'QPSK Demodulator': {
        'ECG': 'Design a QPSK demodulator with a simple carrier recovery scheme for an ECG monitor.',
        'EEG': 'Implement a bit-error rate (BER) optimized QPSK demodulator for a wireless EEG headset.',
        'Audio': 'Optimize a QPSK demodulator for a low-latency audio intercom system.',
        'HRV': 'Create a low-complexity QPSK demodulator for a battery-powered HRV sensor node.',
        'Speech': 'Design a robust QPSK demodulator for a digital voice system operating in noisy environments.',
        'Music': 'Implement a QPSK demodulator for a wireless MIDI receiver, prioritizing low latency.',
    },
    'BPSK Modulator': {
        'ECG': 'Design an ultra-low-power BPSK modulator for an implantable ECG device.',
        'EEG': 'Implement a robust BPSK modulator for transmitting EEG event markers.',
        'Audio': 'Create a BPSK modulator for embedding a synchronization signal into an audio track.',
        'HRV': 'Use a BPSK modulator for a highly robust, low-rate transmission of critical HRV alarms.',
        'Speech': 'Design a BPSK modulator for a very simple, low-bandwidth voice communication system.',
        'Music': 'Implement a BPSK modulator to embed a tempo clock signal into a raw audio stream.',
    },
    // Math & Arithmetic
    'CORDIC': {
        'ECG': 'Use a pipelined CORDIC core in vectoring mode to calculate the magnitude and phase of an ECG complex vector.',
        'EEG': 'Implement a CORDIC in rotation mode to generate sine/cosine waves for an EEG signal simulator.',
        'Audio': 'Optimize a CORDIC core for polar-to-rectangular conversion in an audio phase vocoder.',
        'HRV': 'Use a CORDIC core to calculate phase differences for HRV coherence analysis.',
        'Speech': 'Implement a CORDIC for calculating logarithms in a speech processing algorithm (e.g., MFCC).',
        'Music': 'Design a CORDIC-based oscillator for a music synthesizer, optimizing for low resource usage.',
    },
    'Divider': {
        'ECG': 'Implement a non-restoring division algorithm for normalizing ECG amplitude values, optimized for speed.',
        'EEG': 'Design a low-latency pipelined divider for calculating power ratios in EEG frequency bands.',
        'Audio': 'Create a resource-efficient serial divider for a simple audio gain control.',
        'HRV': 'Use a pipelined divider to calculate the LF/HF power ratio from an HRV power spectrum.',
        'Speech': 'Implement a divider for Linear Predictive Coding (LPC) analysis in a speech vocoder.',
        'Music': 'Design a divider for calculating frequency ratios for musical interval analysis.',
    },
    'Multiplier': {
        'ECG': 'Optimize a 16x16 fixed-point multiplier using dedicated DSP slices for filtering ECG data.',
        'EEG': 'Design a low-power array multiplier for an EEG feature extraction algorithm.',
        'Audio': 'Implement a high-precision 24x24 multiplier for a professional audio mixing console.',
        'HRV': 'Use a multiplier for windowing an HRV signal segment before FFT analysis.',
        'Speech': 'Optimize a multiplier for the feedback path of a lattice filter in a speech synthesis model.',
        'Music': 'Design a shared, time-multiplexed multiplier for a polyphonic music synthesizer to save resources.',
    },
    'Adder Tree': {
        'ECG': 'Design a pipelined adder tree to sum the output of a parallel FIR filter for ECG processing.',
        'EEG': 'Implement a Wallace tree based adder for high-speed accumulation in an EEG correlator.',
        'Audio': 'Optimize an adder tree for combining multiple channels in a digital audio summer.',
        'HRV': 'Use an adder tree to accumulate power in specific frequency bins of an HRV spectrum.',
        'Speech': 'Design an adder tree for a dot-product calculation in a speech recognition neural network layer.',
        'Music': 'Implement a deeply pipelined adder tree for a large-scale audio mixing console with over 128 channels.',
    },
    // Frequency & Phase
    'Direct Digital Synthesizer (DDS)': {
        'ECG': 'Design a DDS to generate a 60Hz sine wave for an adaptive noise cancellation system for ECG.',
        'EEG': 'Implement a high-resolution DDS for generating precise frequencies in an auditory evoked potential (AEP) EEG experiment.',
        'Audio': 'Optimize a DDS for a high-fidelity audio test tone generator, focusing on high Spurious-Free Dynamic Range (SFDR).',
        'HRV': 'Use a DDS to generate a reference carrier for demodulating a telemetry signal containing HRV data.',
        'Speech': 'Design a DDS as the local oscillator for a speech signal frequency shifter (pitch shifter).',
        'Music': 'Implement a phase-continuous DDS for a wavetable synthesizer, optimizing the phase accumulator for seamless frequency sweeps.',
    },
    'Digital Frequency Synthesizer': {
        'ECG': 'Design a Digital Frequency Synthesizer (DFS) to generate a precise reference clock for an ECG ADC.',
        'EEG': 'Implement a DFS for a neuro-stimulation application requiring rapid frequency hopping.',
        'Audio': 'Design a Digital Frequency Synthesizer (DFS) with high spectral purity for an audio test equipment application. It should be capable of generating frequencies from 1 Hz to 20 kHz with sub-1 Hz resolution.',
        'HRV': 'Use a DFS to generate a carrier for a biomedical telemetry system.',
        'Speech': 'Implement a DFS as a local oscillator for a software-defined radio processing speech signals.',
        'Music': 'Implement a DFS as a local oscillator for a polyphonic music synthesizer. Optimize for low-latency frequency hopping between musical notes and minimal phase noise.',
    },
    'Digital Mixer': {
        'ECG': 'Use a digital mixer to down-convert a high-frequency ECG telemetry signal to a baseband for analysis.',
        'EEG': 'Implement a digital mixer to shift a specific EEG frequency band (e.g., alpha band) to DC for complex demodulation.',
        'Audio': 'Design a digital mixer for a ring modulation audio effect, optimizing the multiplier for low resource usage.',
        'HRV': 'Use a digital mixer in a lock-in amplifier architecture to detect a specific, modulated HRV component.',
        'Speech': 'Implement a single-sideband (SSB) mixer to frequency-shift a speech signal for a secure communication channel.',
        'Music': 'Design a digital mixer as part of a frequency modulation (FM) synthesis operator for a music synthesizer.',
    },
    'Phase Detector': {
        'ECG': 'Implement a simple XOR-based phase detector to align a local oscillator with an ECG telemetry carrier.',
        'EEG': 'Design a multiplier-based phase detector to measure phase coherence between two EEG channels.',
        'Audio': 'Create a Phase-Frequency Detector (PFD) for a phase-locked loop (PLL) used in a clock recovery system for digital audio.',
        'HRV': 'Use a phase detector to analyze the phase relationship between respiration and heart rate for RSA analysis.',
        'Speech': 'Implement a phase detector to track the phase of formants in a speech signal.',
        'Music': 'Design a phase detector as part of a pitch-tracking PLL for a monophonic musical instrument.',
    },
    // Correlation
    'Correlation': {
        'ECG': 'Implement a cross-correlator to find the delay between two ECG channels for signal alignment.',
        'EEG': 'Design a high-speed correlator to measure the similarity of EEG signals from different electrodes.',
        'Audio': 'Create an auto-correlator for pitch detection in a real-time audio stream.',
        'HRV': 'Use a correlator to identify repeating patterns or artifacts within an HRV signal.',
        'Speech': 'Implement a correlator for template matching in a simple speech recognition system.',
        'Music': 'Design a cross-correlator to measure the time difference of arrival between two microphones for stereo sound source localization.',
    },
     // OFDM/Communications
    'Cyclic Prefix Insertion': {
        'ECG': 'Design a Cyclic Prefix Insertion module for an OFDM-based ECG telemetry system. Parameterize the CP length for robustness.',
        'EEG': 'Implement a CP insertion block for a high-throughput wireless EEG data link using OFDM modulation.',
        'Audio': 'Optimize a Cyclic Prefix Insertion module for a Digital Audio Broadcasting (DAB) transmitter.',
        'HRV': 'Create a low-power CP insertion core for a wearable sensor network that uses OFDM.',
        'Speech': 'Design a Cyclic Prefix Insertion module for a 64-subcarrier OFDM transmitter. Parameterize the cyclic prefix length to be configurable between 1/4 and 1/16 of the symbol duration.',
        'Music': 'Implement CP insertion for a robust, multi-channel wireless instrument system based on OFDM.',
    },
    'Cyclic Prefix Removal': {
       'ECG': 'Implement a high-throughput Cyclic Prefix Removal module for an OFDM-based ECG receiver.',
       'EEG': 'Design a CP removal block that provides the valid symbol data to the subsequent FFT stage in an OFDM EEG receiver.',
       'Audio': 'Optimize a CP removal module for a high-fidelity OFDM-based audio receiver, focusing on precise timing synchronization.',
       'HRV': 'Create a low-logic CP removal core for an energy-efficient HRV sensor that receives OFDM packets.',
       'Speech': 'Implement a high-throughput Cyclic Prefix Removal module for an OFDM receiver. The design should efficiently discard the cyclic prefix and provide the valid symbol data to the subsequent FFT stage.',
       'Music': 'Design a CP removal module for a wireless in-ear monitor system, ensuring low latency from reception to audio output.',
    },
    // FEC
    'Viterbi Decoder': {
        'ECG': 'Design a Viterbi decoder for a wirelessly transmitted, convolutionally encoded ECG signal, optimizing for low power.',
        'EEG': 'Implement a high-throughput Viterbi decoder for a high-data-rate wireless EEG system.',
        'Audio': 'Create a Viterbi decoder for a digital audio broadcast (DAB) system, focusing on error resilience.',
        'HRV': 'Use a Viterbi decoder for a low-rate, robust wireless link for transmitting HRV data.',
        'Speech': 'Implement a Viterbi decoder for a digital voice channel, optimizing the traceback memory.',
        'Music': 'Design a Viterbi decoder for a robust wireless in-ear monitor system, prioritizing low latency.',
    },
    'Reed-Solomon Encoder': {
        'ECG': 'Implement a Reed-Solomon encoder for adding block-based error protection to an ECG data storage system.',
        'EEG': 'Design a high-speed Reed-Solomon encoder for a burst-error prone wireless EEG channel.',
        'Audio': 'Create a Reed-Solomon encoder for a professional digital audio link over a noisy medium.',
        'HRV': 'Use a Reed-Solomon encoder to protect stored HRV data against corruption.',
        'Speech': 'Implement a Reed-Solomon encoder for a digital voice system requiring high data integrity.',
        'Music': 'Design a Reed-Solomon encoder for protecting the data integrity of a digital music stream sent to a manufacturing plant.',
    },
    // General Purpose
    'DUC/DDC': {
        'ECG': 'Design a Digital Down-Converter (DDC) to isolate and decimate a specific band from a wideband ECG RF signal.',
        'EEG': 'Implement a Digital Up-Converter (DUC) for a multi-channel EEG signal generator.',
        'Audio': 'Optimize a DDC for the front-end of a software-defined radio (SDR) receiving a digital audio broadcast.',
        'HRV': 'Use a DDC to process a raw RF signal from a wearable device to extract the low-frequency HRV information.',
        'Speech': 'Design a DUC to up-convert a baseband speech signal to an intermediate frequency (IF) for transmission.',
        'Music': 'Implement a DDC to receive a specific channel from a multi-channel wireless instrument system.',
    },
    'Convolution': {
        'ECG': 'Implement a convolution engine for applying long FIR filters to ECG signals using overlap-add method.',
        'EEG': 'Design a high-throughput convolution core for a convolutional neural network (CNN) processing EEG spectrograms.',
        'Audio': 'Create a real-time convolution reverb effect for audio, optimizing memory access to BRAM for the impulse response.',
        'HRV': 'Use convolution for smoothing an HRV signal with a Gaussian kernel.',
        'Speech': 'Implement convolution for applying a window function to a speech signal segment.',
        'Music': 'Design a convolution engine for emulating vintage guitar amplifier cabinets using impulse responses.',
    },
    'Signal Generator': {
        'ECG': 'Design a signal generator to produce a realistic, multi-parameter synthetic ECG signal for testing.',
        'EEG': 'Implement a signal generator capable of mixing sine waves to simulate different brainwave states (alpha, beta, etc.).',
        'Audio': 'Create a versatile audio signal generator for producing test tones (sine, square, sawtooth) with adjustable frequency and amplitude.',
        'HRV': 'Design a signal generator to produce a synthetic HRV tachogram with specific LF and HF components for algorithm testing.',
        'Speech': 'Implement a signal generator to produce white and pink noise for testing speech-in-noise algorithms.',
        'Music': 'Create a signal generator that acts as a simple ADSR envelope for shaping musical notes.',
    },
  };

  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt(defaultPrompts[selectedBlock]?.[selectedSignal] || `Optimize a ${selectedBlock} for a balance of performance and resource usage.`);
  }, [selectedBlock, selectedSignal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOptimize(prompt);
  };

  const handleSuggestionClick = () => {
      setPrompt(defaultPrompts[selectedBlock]?.[selectedSignal] || `Optimize a ${selectedBlock} for a balance of performance and resource usage.`);
  };

  return (
    <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
      <h3 className="text-lg font-semibold mb-2 text-text-main">AI Optimization</h3>
      <p className="text-sm text-text-secondary mb-4">
        Describe your primary optimization goal. The AI will generate optimized parameters and hardware metrics.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-28 p-3 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main resize-none"
          placeholder="e.g., Prioritize low latency while maintaining signal fidelity."
        />

        <div className="flex items-center justify-between mt-4">
            <button
                type="button"
                onClick={handleSuggestionClick}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
            >
                Try a suggestion for {selectedSignal} + {selectedBlock}
            </button>

            <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 font-bold bg-primary hover:bg-primary-hover text-primary-text rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isLoading ? 'Optimizing...' : 'Optimize'}
            </button>
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default OptimizationPanel;
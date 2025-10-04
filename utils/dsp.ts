

import { ChartDataPoint, WindowType } from '../types';

// Quantizes a floating-point number to a signed fixed-point integer.
export const quantize = (value: number, bitWidth: number): number => {
    const scale = Math.pow(2, bitWidth - 1) - 1;
    return Math.round(value * scale);
};

// Dequantizes a fixed-point integer back to a floating-point number.
export const dequantize = (intValue: number, bitWidth: number): number => {
    const scale = Math.pow(2, bitWidth - 1) - 1;
    return intValue / scale;
};

// Simulates a fixed-point multiplication.
// Assumes inputs are already quantized. The output is also a quantized integer.
const fixedPointMultiply = (a: number, b: number, bitWidth: number): number => {
    const scale = Math.pow(2, bitWidth - 1) - 1;
    // In hardware, this would be `(a * b) >> (bitWidth - 1)`.
    // In floating point simulation, we can simulate this by dividing by the scale factor.
    return Math.round((a * b) / scale);
};

// Applies a filter using fixed-point arithmetic simulation.
// Returns floating-point values for charting.
export const applyFixedPointFilter = (
    inputData: number[], 
    coefficients: number[], 
    dataBitWidth: number, 
    coeffBitWidth: number
): number[] => {
    if (coefficients.length === 0) return inputData;

    const quantizedCoeffs = coefficients.map(c => quantize(c, coeffBitWidth));
    const quantizedInput = inputData.map(d => quantize(d, dataBitWidth));
    
    const quantizedOutput = quantizedInput.map((_, i) => {
        let accumulator = 0;
        for (let j = 0; j < quantizedCoeffs.length; j++) {
            if (i - j >= 0) {
                const dataSample = quantizedInput[i - j];
                const coeffSample = quantizedCoeffs[j];
                const product = fixedPointMultiply(dataSample, coeffSample, coeffBitWidth);
                accumulator += product;
            }
        }
        // In a real implementation, you'd need to handle accumulator bit growth and potential saturation.
        // For this simulation, we assume the accumulator has enough headroom.
        return accumulator;
    });

    // Dequantize the final output for display/analysis
    return quantizedOutput.map(d => dequantize(d, dataBitWidth));
};


// Simulates mixing for DUC/DDC and Mixers
export const applyMixing = (inputData: number[], carrierFrequency: number): number[] => {
    return inputData.map((d, i) => d * Math.cos(2 * Math.PI * carrierFrequency * (i / 200)));
};

// Applies a simulated Digital Up/Down Conversion using the fixed-point filter
export const applyDucDdc = (inputData: number[], coefficients: number[], bitWidth: number): number[] => {
    const mixedSignal = applyMixing(inputData, 20); // Mixing with a 20-cycle carrier
    const lpCoeffs = coefficients.length > 0 ? coefficients : [0.1, 0.2, 0.4, 0.2, 0.1];
    return applyFixedPointFilter(mixedSignal, lpCoeffs, bitWidth, bitWidth);
};

// Simulates a digital XOR phase detector
export const applyPhaseDetection = (inputData: number[]): number[] => {
    const points = inputData.length;
    const refFreq = 10;
    const inputFreq = 9.5;
    return Array.from({ length: points }, (_, i) => {
        const time = i / points;
        const refSignal = Math.sign(Math.sin(2 * Math.PI * refFreq * time));
        const inSignal = Math.sign(Math.sin(2 * Math.PI * inputFreq * time));
        return refSignal !== inSignal ? 1 : -1;
    });
};

export const applyDds = (inputData: ChartDataPoint[]): number[] => {
    const frequency = 5;
    return inputData.map(d => Math.sin(2 * Math.PI * frequency * (d.time / 200)));
};

export const applySignalGeneration = (inputData: ChartDataPoint[]): number[] => {
    return inputData.map(d => d.clean);
};

const applyWindow = (signal: number[], windowType: WindowType): number[] => {
    const N = signal.length;
    if (N === 0) return [];
    
    switch (windowType) {
        case 'Hamming':
            return signal.map((y, n) => y * (0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1))));
        case 'Blackman':
            return signal.map((y, n) => y * (0.42 - 0.5 * Math.cos(2 * Math.PI * n / (N - 1)) + 0.08 * Math.cos(4 * Math.PI * n / (N - 1))));
        case 'Hann':
             return signal.map((y, n) => y * (0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1)))));
        case 'None':
        default:
            return signal;
    }
};


// Performs a Discrete Fourier Transform and returns the power spectrum
export const calculatePsd = (signal: number[], fftSize: number, windowType: WindowType): number[] => {
    const N = fftSize;
    let signalSegment = signal.slice(0, N);

    // Zero-pad if signal is shorter than FFT size
    if (signalSegment.length < N) {
        signalSegment = signalSegment.concat(new Array(N - signalSegment.length).fill(0));
    }

    const windowedSignal = applyWindow(signalSegment, windowType);

    const spectrum = new Array(N / 2).fill(0);

    for (let k = 0; k < N / 2; k++) { // Calculate up to Nyquist frequency
        let real = 0;
        let imag = 0;
        for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            real += windowedSignal[n] * Math.cos(angle);
            imag -= windowedSignal[n] * Math.sin(angle);
        }
        spectrum[k] = (real * real + imag * imag) / N; // Power
    }
    return spectrum;
};

// Calculates the frequency response magnitude of a set of FIR coefficients
export const calculateFrequencyResponse = (coefficients: number[]): number[] => {
    if (coefficients.length === 0) return [];

    const N = 256; // Number of points for the frequency response calculation
    const magnitudeDb: number[] = [];
    
    for (let k = 0; k < N; k++) {
        const freq = (Math.PI * k) / N; // From 0 to pi
        let real = 0;
        let imag = 0;
        
        for (let n = 0; n < coefficients.length; n++) {
            real += coefficients[n] * Math.cos(freq * n);
            imag -= coefficients[n] * Math.sin(freq * n);
        }
        
        const mag = Math.sqrt(real * real + imag * imag);
        // Convert to dB, with a floor to avoid log(0)
        const db = 20 * Math.log10(Math.max(mag, 1e-9));
        magnitudeDb.push(db);
    }
    
    return magnitudeDb;
};
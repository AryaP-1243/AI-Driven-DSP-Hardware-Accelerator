

import { EegBands, WindowType } from '../types';
import { calculatePsd } from './dsp';

// Calculates the Mean Squared Error between two signals
export const calculateMse = (cleanSignal: number[], testSignal: number[]): number => {
  if (cleanSignal.length !== testSignal.length || cleanSignal.length === 0) {
    return 0;
  }
  const sumOfSquares = cleanSignal.reduce((acc, val, i) => {
    const error = val - testSignal[i];
    return acc + (error * error);
  }, 0);
  return sumOfSquares / cleanSignal.length;
};

// Calculates the Signal-to-Noise Ratio in dB
export const calculateSnr = (cleanSignal: number[], testSignal: number[]): number => {
  if (cleanSignal.length !== testSignal.length || cleanSignal.length === 0) {
    return 0;
  }

  let signalPower = 0;
  let errorPower = 0;

  for (let i = 0; i < cleanSignal.length; i++) {
    signalPower += cleanSignal[i] * cleanSignal[i];
    const error = cleanSignal[i] - testSignal[i];
    errorPower += error * error;
  }
  
  if (errorPower === 0) {
    return Infinity; // Perfect reconstruction
  }
  
  if (signalPower === 0) {
      return 0; // No signal
  }

  const ratio = signalPower / errorPower;
  return 10 * Math.log10(ratio);
};

// Calculates power in HRV frequency bands
export const calculateHrvPowerBands = (signal: number[], samplingRate: number, fftSize: number, windowType: WindowType) => {
    const N = fftSize;
    const powerSpectrum = calculatePsd(signal, fftSize, windowType);
    const freqResolution = samplingRate / N;

    const lf_band = [0.04, 0.15]; // Hz
    const hf_band = [0.15, 0.4]; // Hz

    let lfPower = 0;
    let hfPower = 0;

    for (let k = 1; k < powerSpectrum.length; k++) { // Iterate up to Nyquist
        const freq = k * freqResolution;
        if (freq >= lf_band[0] && freq <= lf_band[1]) {
            lfPower += powerSpectrum[k];
        }
        if (freq >= hf_band[0] && freq <= hf_band[1]) {
            hfPower += powerSpectrum[k];
        }
    }
    
    // Multiply by 2 to account for the other half of the spectrum (except DC and Nyquist)
    lfPower *= 2;
    hfPower *= 2;
    
    const lfHfRatio = hfPower > 0 ? lfPower / hfPower : Infinity;

    return { lfPower, hfPower, lfHfRatio };
};

export const calculateEegBands = (psd: number[], samplingRate: number): EegBands => {
    const N = psd.length;
    const freqResolution = samplingRate / N;

    const bands = {
        delta: { range: [0.5, 4], power: 0 },
        theta: { range: [4, 8], power: 0 },
        alpha: { range: [8, 13], power: 0 },
        beta: { range: [13, 30], power: 0 },
    };

    for (let k = 1; k < N / 2; k++) { // Iterate up to Nyquist
        const freq = k * freqResolution;
        for (const band of Object.values(bands)) {
            if (freq >= band.range[0] && freq < band.range[1]) {
                band.power += psd[k];
            }
        }
    }
    
    // Multiply by 2 to account for the symmetric spectrum
    return {
        delta: bands.delta.power * 2,
        theta: bands.theta.power * 2,
        alpha: bands.alpha.power * 2,
        beta: bands.beta.power * 2,
    };
};
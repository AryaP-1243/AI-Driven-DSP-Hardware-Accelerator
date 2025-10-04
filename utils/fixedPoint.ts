
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



import React from 'react';
import { AnalysisResults } from '../types';

interface QuantitativeAnalysisPanelProps {
  analysisResults: AnalysisResults | null;
}

const QuantitativeAnalysisPanel: React.FC<QuantitativeAnalysisPanelProps> = ({ analysisResults }) => {
  if (!analysisResults) return null;

  return (
    <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
      <h3 className="text-lg font-semibold mb-4 text-text-main">Quantitative Performance Analysis</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-bg-main text-xs text-text-secondary uppercase">
                <tr>
                    <th className="px-4 py-2">Filter Type</th>
                    <th className="px-4 py-2">Signal-to-Noise Ratio (SNR)</th>
                    <th className="px-4 py-2">Mean Squared Error (MSE)</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b border-border-main">
                    <td className="px-4 py-2 font-medium">Baseline Filter</td>
                    <td className="px-4 py-2">{analysisResults.baseline.snr.toFixed(4)} dB</td>
                    <td className="px-4 py-2">{analysisResults.baseline.mse.toExponential(4)}</td>
                </tr>
                {analysisResults.aiOptimized && (
                    <tr className="border-b border-border-main bg-primary/10">
                        <td className="px-4 py-2 font-medium text-primary">AI Optimized Filter</td>
                        <td className="px-4 py-2 font-bold text-primary">{analysisResults.aiOptimized.snr.toFixed(4)} dB</td>
                        <td className="px-4 py-2 font-bold text-primary">{analysisResults.aiOptimized.mse.toExponential(4)}</td>
                    </tr>
                )}
                 {analysisResults.custom && (
                    <tr className="border-b border-border-main bg-secondary-accent/10">
                        <td className="px-4 py-2 font-medium text-secondary-accent">Custom Filter</td>
                        <td className="px-4 py-2 font-bold text-secondary-accent">{analysisResults.custom.snr.toFixed(4)} dB</td>
                        <td className="px-4 py-2 font-bold text-secondary-accent">{analysisResults.custom.mse.toExponential(4)}</td>
                    </tr>
                )}
            </tbody>
        </table>
        <p className="text-xs text-text-secondary mt-2">SNR and MSE are calculated with the clean signal as the reference. Higher SNR and lower MSE indicate better performance.</p>
      </div>
    </div>
  );
};

export default QuantitativeAnalysisPanel;
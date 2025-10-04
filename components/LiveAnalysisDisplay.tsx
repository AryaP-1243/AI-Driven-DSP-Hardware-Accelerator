
import React from 'react';
import { AnalysisResults, QuantitativeMetrics } from '../types';

interface LiveAnalysisDisplayProps {
  analysisResults: AnalysisResults;
}

const MetricDisplay: React.FC<{ label: string; metrics: QuantitativeMetrics; colorClass: string }> = ({ label, metrics, colorClass }) => (
    <div className="flex-1 bg-bg-main p-3 rounded-md border border-border-main text-center">
        <p className={`text-sm font-semibold ${colorClass}`}>{label}</p>
        <div className="mt-1">
            <span className="text-xs text-text-secondary">SNR: </span>
            <span className="font-mono text-sm text-text-main">{metrics.snr.toFixed(2)} dB</span>
        </div>
        <div>
            <span className="text-xs text-text-secondary">MSE: </span>
            <span className="font-mono text-sm text-text-main">{metrics.mse.toExponential(2)}</span>
        </div>
    </div>
);

const LiveAnalysisDisplay: React.FC<LiveAnalysisDisplayProps> = ({ analysisResults }) => {
  return (
    <div className="mt-4 border-t border-border-main pt-4">
        <h4 className="text-md font-semibold text-text-main mb-3 text-center">Real-time Performance Analysis</h4>
        <div className="flex flex-col sm:flex-row gap-4">
            <MetricDisplay label="Baseline Filter" metrics={analysisResults.baseline} colorClass="text-text-secondary" />
            {analysisResults.aiOptimized && (
                <MetricDisplay label="AI Optimized" metrics={analysisResults.aiOptimized} colorClass="text-primary" />
            )}
            {analysisResults.custom && (
                <MetricDisplay label="Custom Filter" metrics={analysisResults.custom} colorClass="text-secondary-accent" />
            )}
        </div>
    </div>
  );
};

export default LiveAnalysisDisplay;

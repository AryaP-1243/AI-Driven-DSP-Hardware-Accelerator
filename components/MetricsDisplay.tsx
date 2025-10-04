import React from 'react';
import { OptimizationResult } from '../types';

interface MetricsDisplayProps {
  result: OptimizationResult;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ result }) => {
  return (
    <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 text-center">
        <MetricCard label="LUTs" value={result.metrics.lutCount} />
        <MetricCard label="Flip-Flops" value={result.metrics.ffCount} />
        <MetricCard label="DSP Slices" value={result.metrics.dspSlices} />
        <MetricCard label="BRAM Blocks" value={result.metrics.bramBlocks} />
        <MetricCard label="Cycles/Sample" value={result.metrics.cyclesPerSample} />
        <MetricCard label="Throughput" value={result.metrics.throughput} />
      </div>

      <div>
        <h4 className="font-semibold text-text-secondary mb-2">AI Strategy Explanation</h4>
        <p className="text-text-secondary text-sm leading-relaxed">
          {result.explanation}
        </p>
      </div>
    </div>
  );
};

interface MetricCardProps {
    label: string;
    value: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => (
    <div className="bg-bg-main p-3 rounded-md border border-border-main">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-xl font-bold text-primary">{value}</p>
    </div>
);

export default MetricsDisplay;
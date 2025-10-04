

import React from 'react';
import { AnalysisResults, EegBands, HrvAnalysis } from '../types';
import { WaveformIcon } from './icons/WaveformIcon';
import { HeartIcon } from './icons/HeartIcon';

interface SpectralAnalysisPanelProps {
  analysis: AnalysisResults;
}

const EegBandDisplay: React.FC<{ bands: EegBands }> = ({ bands }) => (
    <div className="grid grid-cols-2 gap-2 text-center">
        <MetricCard label="Delta (δ)" value={bands.delta.toExponential(2)} unit=" (0.5-4Hz)" />
        <MetricCard label="Theta (θ)" value={bands.theta.toExponential(2)} unit=" (4-8Hz)" />
        <MetricCard label="Alpha (α)" value={bands.alpha.toExponential(2)} unit=" (8-13Hz)" />
        <MetricCard label="Beta (β)" value={bands.beta.toExponential(2)} unit=" (13-30Hz)" />
    </div>
);

const HrvDisplay: React.FC<{ analysis: HrvAnalysis }> = ({ analysis }) => (
    <div className="grid grid-cols-1 gap-2">
        <HrvMetricCard label="Low-Frequency Power" value={analysis.lfPower.toFixed(3)} unit="(0.04-0.15 Hz)" />
        <HrvMetricCard label="High-Frequency Power" value={analysis.hfPower.toFixed(3)} unit="(0.15-0.4 Hz)" />
        <HrvMetricCard label="LF/HF Ratio" value={analysis.lfHfRatio.toFixed(3)} unit="" isPrimary />
    </div>
);

const SpectralAnalysisPanel: React.FC<SpectralAnalysisPanelProps> = ({ analysis }) => {
  const { eegBands, hrvAnalysis } = analysis;
  if (!eegBands && !hrvAnalysis) return null;

  return (
    <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
        {eegBands && (
            <div>
                <h3 className="text-lg font-semibold mb-2 text-text-main flex items-center">
                    <WaveformIcon className="w-5 h-5 mr-2" />
                    EEG Band Power Analysis
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                    Total power within standard neurological frequency bands.
                </p>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-text-secondary text-sm mb-2">Baseline Filter</h4>
                        <EegBandDisplay bands={eegBands.baseline} />
                    </div>
                    {eegBands.aiOptimized && (
                        <div className="border-t border-border-main pt-4">
                            <h4 className="font-semibold text-primary text-sm mb-2">AI Optimized Filter</h4>
                            <EegBandDisplay bands={eegBands.aiOptimized} />
                        </div>
                    )}
                    {eegBands.custom && (
                         <div className="border-t border-border-main pt-4">
                            <h4 className="font-semibold text-secondary-accent text-sm mb-2">Custom Filter</h4>
                            <EegBandDisplay bands={eegBands.custom} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {hrvAnalysis && (
            <div className={eegBands ? "mt-6 pt-6 border-t border-border-main" : ""}>
                 <h3 className="text-lg font-semibold mb-2 text-text-main flex items-center">
                    <HeartIcon className="w-5 h-5 mr-2" />
                    HRV Spectral Analysis
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                    Power distribution in key frequency bands for Heart Rate Variability.
                </p>
                <div className="space-y-4">
                    {hrvAnalysis.aiOptimized && (
                        <div>
                            <h4 className="font-semibold text-primary text-sm mb-2">AI Optimized Output</h4>
                            <HrvDisplay analysis={hrvAnalysis.aiOptimized} />
                        </div>
                    )}
                     {hrvAnalysis.custom && (
                        <div className="pt-4 mt-4 border-t border-border-main">
                            <h4 className="font-semibold text-secondary-accent text-sm mb-2">Custom Output</h4>
                            <HrvDisplay analysis={hrvAnalysis.custom} />
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className='bg-bg-main p-2 rounded-md border border-border-main'>
        <p className="text-sm font-medium text-text-main">{label}</p>
        <p className="text-xs text-text-secondary -mt-1">{unit}</p>
        <p className="text-lg font-bold font-mono text-primary">{value}</p>
    </div>
);

const HrvMetricCard: React.FC<{ label: string; value: string; unit: string; isPrimary?: boolean }> = ({ label, value, unit, isPrimary }) => (
     <div className={`bg-bg-main p-2 rounded-md border border-border-main flex justify-between items-center ${isPrimary ? 'bg-primary/10 border-primary/20' : ''}`}>
        <div>
            <p className={`text-sm font-medium ${isPrimary ? 'text-primary' : 'text-text-main'}`}>{label}</p>
            <p className="text-xs text-text-secondary -mt-1">{unit}</p>
        </div>
        <p className={`text-lg font-bold font-mono ${isPrimary ? 'text-primary' : 'text-text-main'}`}>{value}</p>
    </div>
);

export default SpectralAnalysisPanel;
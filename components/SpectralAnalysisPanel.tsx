
import React from 'react';
import { AnalysisResults, EegBands, HrvAnalysis } from '../types';
import { WaveformIcon } from './icons/WaveformIcon';
import { HeartIcon } from './icons/HeartIcon';
import { InfoIcon } from './icons/InfoIcon';

interface SpectralAnalysisPanelProps {
  analysis: AnalysisResults;
}

const EegBandDisplay: React.FC<{ bands: EegBands }> = ({ bands }) => (
    <div className="grid grid-cols-2 gap-2 text-center">
        <MetricCard label="Delta (δ)" value={bands.delta.toExponential(2)} unit="0.5-4Hz (Deep Sleep)" />
        <MetricCard label="Theta (θ)" value={bands.theta.toExponential(2)} unit="4-8Hz (Drowsy)" />
        <MetricCard label="Alpha (α)" value={bands.alpha.toExponential(2)} unit="8-13Hz (Relaxed Focus)" />
        <MetricCard label="Beta (β)" value={bands.beta.toExponential(2)} unit="13-30Hz (Active/Alert)" />
    </div>
);

const HrvDisplay: React.FC<{ analysis: HrvAnalysis }> = ({ analysis }) => (
    <div className="grid grid-cols-1 gap-2">
        <HrvMetricCard 
            label="Low-Frequency (LF)" 
            value={analysis.lfPower.toFixed(3)} 
            unit="Sympathetic Drive" 
            tooltip="Primarily reflects sympathetic nervous system activity and baroreceptor feedback."
        />
        <HrvMetricCard 
            label="High-Frequency (HF)" 
            value={analysis.hfPower.toFixed(3)} 
            unit="Parasympathetic Drive" 
            tooltip="Reflects vagal activity and respiratory sinus arrhythmia (parasympathetic system)."
        />
        <HrvMetricCard 
            label="LF/HF Ratio" 
            value={analysis.lfHfRatio.toFixed(3)} 
            unit="Sympathovagal Balance" 
            isPrimary 
            tooltip="A clinical marker of the balance between stress (Sympathetic) and recovery (Parasympathetic)."
        />
    </div>
);

const SpectralAnalysisPanel: React.FC<SpectralAnalysisPanelProps> = ({ analysis }) => {
  const { eegBands, hrvAnalysis } = analysis;
  if (!eegBands && !hrvAnalysis) return null;

  return (
    <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
        {eegBands && (
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-main flex items-center">
                        <WaveformIcon className="w-5 h-5 mr-2 text-secondary-accent" />
                        EEG Band Distribution
                    </h3>
                    <div className="group relative">
                        <InfoIcon className="w-4 h-4 text-text-secondary cursor-help" />
                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-bg-panel border border-border-main p-3 rounded-lg shadow-2xl text-[10px] text-text-secondary hidden group-hover:block z-50">
                            Neural oscillations are categorized by frequency. A hardware filter is successful if it preserves the power in target bands while attenuating noise outside them.
                        </div>
                    </div>
                </div>
                <p className="text-xs text-text-secondary mb-4 italic">
                    Power Spectral Density (PSD) decomposition across clinical bands.
                </p>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-text-secondary text-[10px] mb-2 uppercase tracking-widest flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-border-main mr-2"></span>
                            Baseline State
                        </h4>
                        <EegBandDisplay bands={eegBands.baseline} />
                    </div>
                    {eegBands.aiOptimized && (
                        <div className="border-t border-border-main pt-4">
                            <h4 className="font-bold text-primary text-[10px] mb-2 uppercase tracking-widest flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                                AI-Enhanced State
                            </h4>
                            <EegBandDisplay bands={eegBands.aiOptimized} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {hrvAnalysis && (
            <div className={eegBands ? "mt-6 pt-6 border-t border-border-main" : ""}>
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-main flex items-center">
                        <HeartIcon className="w-5 h-5 mr-2 text-primary" />
                        Autonomic HRV Indices
                    </h3>
                    <div className="group relative">
                        <InfoIcon className="w-4 h-4 text-text-secondary cursor-help" />
                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-bg-panel border border-border-main p-3 rounded-lg shadow-2xl text-[10px] text-text-secondary hidden group-hover:block z-50">
                            Calculated by integrating the PSD within specific frequency ranges (0.04-0.15Hz for LF, 0.15-0.4Hz for HF).
                        </div>
                    </div>
                </div>
                <p className="text-xs text-text-secondary mb-4 italic">
                    Frequency-domain Heart Rate Variability (HRV) assessment.
                </p>
                <div className="space-y-4">
                    {hrvAnalysis.aiOptimized && (
                        <div>
                            <h4 className="font-bold text-primary text-[10px] mb-2 uppercase tracking-widest">
                                AI DSP Output
                            </h4>
                            <HrvDisplay analysis={hrvAnalysis.aiOptimized} />
                        </div>
                    )}
                     {hrvAnalysis.custom && (
                        <div className="pt-4 mt-4 border-t border-border-main">
                            <h4 className="font-bold text-secondary-accent text-[10px] mb-2 uppercase tracking-widest">
                                Custom HDL Output
                            </h4>
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
    <div className='bg-bg-main p-2 rounded-lg border border-border-main hover:border-primary/30 transition-colors'>
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{label}</p>
        <p className="text-sm font-bold font-mono text-primary my-0.5">{value}</p>
        <p className="text-[9px] text-text-secondary leading-none">{unit}</p>
    </div>
);

const HrvMetricCard: React.FC<{ label: string; value: string; unit: string; isPrimary?: boolean; tooltip?: string }> = ({ label, value, unit, isPrimary, tooltip }) => (
     <div className={`group relative bg-bg-main p-3 rounded-xl border border-border-main flex justify-between items-center transition-all ${isPrimary ? 'bg-primary/5 border-primary/30' : 'hover:border-primary/20'}`}>
        <div>
            <div className="flex items-center">
                <p className={`text-xs font-bold ${isPrimary ? 'text-primary' : 'text-text-main'}`}>{label}</p>
                {tooltip && <InfoIcon className="w-3 h-3 ml-1.5 text-text-secondary opacity-50 group-hover:opacity-100 cursor-help" />}
            </div>
            <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{unit}</p>
        </div>
        <p className={`text-lg font-bold font-mono ${isPrimary ? 'text-primary' : 'text-text-main'}`}>{value}</p>
        
        {tooltip && (
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-bg-panel border border-border-main rounded text-[9px] text-text-secondary shadow-xl z-50">
                {tooltip}
            </div>
        )}
    </div>
);

export default SpectralAnalysisPanel;

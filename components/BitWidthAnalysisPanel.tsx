
import React, { useState, useEffect } from 'react';
import { OptimizationResult, AnalysisResults, BitWidthAnalysis } from '../types';
import { SlidersIcon } from './icons/SlidersIcon';
import { ProcessorIcon } from './icons/ProcessorIcon';

interface BitWidthAnalysisPanelProps {
    latestAiResult: OptimizationResult;
    latestAnalysis: AnalysisResults;
    analysisResult: BitWidthAnalysis | null;
    onRunAnalysis: (dataBitWidth: number, coefficientBitWidth: number) => void;
    isLoading: boolean;
}

const BitWidthAnalysisPanel: React.FC<BitWidthAnalysisPanelProps> = ({
    latestAiResult,
    latestAnalysis,
    analysisResult,
    onRunAnalysis,
    isLoading
}) => {
    const [dataBitWidth, setDataBitWidth] = useState(latestAiResult.dataBitWidth);
    const [coeffBitWidth, setCoeffBitWidth] = useState(latestAiResult.coefficientBitWidth);
    
    useEffect(() => {
        setDataBitWidth(latestAiResult.dataBitWidth);
        setCoeffBitWidth(latestAiResult.coefficientBitWidth);
    }, [latestAiResult]);

    const handleRunAnalysis = () => {
        onRunAnalysis(dataBitWidth, coeffBitWidth);
    };

    const originalMetrics = latestAiResult.metrics;
    const originalPerf = latestAnalysis.aiOptimized;
    const analyzedMetrics = analysisResult?.metrics;
    const analyzedPerf = analysisResult ? { snr: analysisResult.snr, mse: analysisResult.mse } : null;

    return (
        <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
            <h3 className="text-lg font-semibold mb-2 text-text-main flex items-center">
                <SlidersIcon className="w-5 h-5 mr-2" />
                Bit-Width Trade-off Analysis
            </h3>
            <p className="text-sm text-text-secondary mb-4">
                Explore how changing data and coefficient precision impacts performance and hardware cost, based on the latest AI design.
            </p>
            <div className="space-y-4 mb-4">
                <div>
                    <label htmlFor="dataBitWidth" className="flex justify-between text-sm font-medium text-text-secondary mb-1">
                        <span>Data Bit-Width</span>
                        <span className="font-bold text-primary">{dataBitWidth} bits</span>
                    </label>
                    <input
                        id="dataBitWidth"
                        type="range"
                        min="4"
                        max="32"
                        step="1"
                        value={dataBitWidth}
                        onChange={(e) => setDataBitWidth(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-border-main rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
                <div>
                    <label htmlFor="coeffBitWidth" className="flex justify-between text-sm font-medium text-text-secondary mb-1">
                        <span>Coefficient Bit-Width</span>
                        <span className="font-bold text-primary">{coeffBitWidth} bits</span>
                    </label>
                    <input
                        id="coeffBitWidth"
                        type="range"
                        min="4"
                        max="32"
                        step="1"
                        value={coeffBitWidth}
                        onChange={(e) => setCoeffBitWidth(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-border-main rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>

            <button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="w-full px-6 py-2 font-bold bg-primary hover:bg-primary-hover text-primary-text rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading && <ProcessorIcon className="w-5 h-5 animate-spin mr-2" />}
                {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
            
            {(analysisResult || isLoading) && (
                <div className="mt-6 space-y-4">
                    <div>
                        <h4 className="font-semibold text-text-secondary text-sm mb-2">Performance Impact</h4>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <ResultCard label="Original SNR" value={originalPerf ? `${originalPerf.snr.toFixed(2)} dB` : 'N/A'} />
                            <ResultCard label="Analyzed SNR" value={analyzedPerf ? `${analyzedPerf.snr.toFixed(2)} dB` : '...'} isLoading={isLoading} isPrimary/>
                            <ResultCard label="Original MSE" value={originalPerf ? originalPerf.mse.toExponential(2) : 'N/A'} />
                            <ResultCard label="Analyzed MSE" value={analyzedPerf ? analyzedPerf.mse.toExponential(2) : '...'} isLoading={isLoading} isPrimary/>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-text-secondary text-sm mb-2">Hardware Cost Impact</h4>
                         <div className="grid grid-cols-2 gap-2 text-center">
                             <ResultCard label="Original LUTs" value={originalMetrics.lutCount} />
                             <ResultCard label="Analyzed LUTs" value={analyzedMetrics?.lutCount ?? '...'} isLoading={isLoading} isPrimary />
                             <ResultCard label="Original FFs" value={originalMetrics.ffCount} />
                             <ResultCard label="Analyzed FFs" value={analyzedMetrics?.ffCount ?? '...'} isLoading={isLoading} isPrimary />
                             <ResultCard label="Original DSPs" value={originalMetrics.dspSlices} />
                             <ResultCard label="Analyzed DSPs" value={analyzedMetrics?.dspSlices ?? '...'} isLoading={isLoading} isPrimary />
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface ResultCardProps {
    label: string;
    value: string;
    isPrimary?: boolean;
    isLoading?: boolean;
}
const ResultCard: React.FC<ResultCardProps> = ({ label, value, isPrimary = false, isLoading = false }) => (
    <div className={`p-2 rounded-md border ${isPrimary ? 'bg-primary/10 border-primary/20' : 'bg-bg-main border-border-main'}`}>
        <p className={`text-xs ${isPrimary ? 'text-primary' : 'text-text-secondary'}`}>{label}</p>
        <p className={`text-sm font-bold font-mono ${isPrimary ? 'text-primary' : 'text-text-main'}`}>
            {isLoading && value === '...' ? <span className="animate-pulse">...</span> : value}
        </p>
    </div>
);


export default BitWidthAnalysisPanel;





import React, { useState } from 'react';
import { ValidationStatus, HardwareMetrics, BoardFarmValidationResult, FpgaTarget, BoardValidationStatus } from '../types';
import { CloudUploadIcon } from './icons/CloudUploadIcon';
import { ProcessorIcon } from './icons/ProcessorIcon';
import { FeedbackIcon } from './icons/FeedbackIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';

const validationSteps = [
    "Uploading project to Vivado Cloud Instance...",
    "Running Synthesis...",
    "Running Place & Route...",
    "Generating Reports...",
    "Aggregating Emulation Results...",
    "Validation Complete!"
];

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
);

const StatusIndicator: React.FC<{ status: BoardValidationStatus }> = ({ status }) => {
    switch (status) {
        case 'pass':
            return <div className="flex items-center text-green-400"><CheckIcon className="w-4 h-4 mr-2" /> Pass</div>;
        case 'fail':
            return <div className="flex items-center text-red-400"><CloseIcon className="w-4 h-4 mr-2" /> Fail</div>;
        case 'testing':
            return <div className="flex items-center text-yellow-400"><ProcessorIcon className="w-4 h-4 mr-2 animate-spin" /> Testing</div>;
        case 'pending':
        default:
            return <div className="flex items-center text-text-secondary"><ClockIcon className="w-4 h-4 mr-2" /> Pending</div>;
    }
};


interface HardwareValidationPanelProps {
    validationStatus: ValidationStatus;
    onValidate: () => void;
    onHardwareInTheLoopOptimize: () => void;
    aiMetrics?: HardwareMetrics;
    validatedMetrics?: HardwareMetrics;
    boardFarmResults?: BoardFarmValidationResult[];
    emulationTargets: FpgaTarget[];
}

const HardwareValidationPanel: React.FC<HardwareValidationPanelProps> = ({ validationStatus, onValidate, onHardwareInTheLoopOptimize, aiMetrics, validatedMetrics, boardFarmResults, emulationTargets }) => {
    const [currentStep, setCurrentStep] = useState(0);

    React.useEffect(() => {
        let interval: number | undefined;
        if (validationStatus === 'validating') {
            setCurrentStep(0);
            const totalSteps = validationSteps.length -1;
            interval = window.setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= totalSteps) {
                        if (interval) window.clearInterval(interval);
                        return totalSteps;
                    }
                    return prev + 1;
                });
            }, 900);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [validationStatus]);
    
    if (validationStatus === 'idle') {
        return (
            <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
                <div className="flex items-center mb-4">
                    <CloudUploadIcon className="w-8 h-8 text-primary mr-3" />
                    <div>
                        <h3 className="text-lg font-semibold text-text-main">Emulate on Hardware Targets</h3>
                        <p className="text-sm text-text-secondary">Run a simulated synthesis and implementation for your selected FPGA targets.</p>
                    </div>
                </div>

                <div className="my-4 p-3 border rounded-md border-border-main bg-bg-main">
                    <h4 className="text-sm font-semibold text-text-main mb-2">Selected Emulation Targets:</h4>
                    {emulationTargets.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-text-secondary space-y-1 max-h-32 overflow-y-auto">
                            {emulationTargets.map(target => <li key={target}>{target}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-text-secondary text-center p-4">No FPGA models selected. Please choose targets in the Hardware Configuration panel to enable emulation.</p>
                    )}
                </div>

                <button
                    onClick={onValidate}
                    disabled={emulationTargets.length === 0}
                    className="w-full px-6 py-3 font-bold bg-primary hover:bg-primary-hover text-primary-text rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Emulation on {emulationTargets.length} Target{emulationTargets.length !== 1 ? 's' : ''}
                </button>
            </div>
        );
    }
    
    if (validationStatus === 'validating') {
        return (
             <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
                <div className="flex items-center justify-center">
                    <ProcessorIcon className="w-8 h-8 text-primary animate-spin mr-4" />
                    <div>
                        <h3 className="text-lg font-semibold text-text-main">Emulation in Progress...</h3>
                        <p className="text-sm text-text-secondary mt-1">{validationSteps[currentStep]}</p>
                    </div>
                </div>
                 {boardFarmResults && boardFarmResults.length > 0 && (
                     <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-text-secondary uppercase">
                                <tr>
                                    <th className="px-4 py-2">Target FPGA</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                             <tbody>
                                {boardFarmResults.map(({ target, status }) => (
                                    <tr key={target} className="border-b border-border-main last:border-b-0">
                                        <td className="px-4 py-3 font-medium text-text-main">{target}</td>
                                        <td className="px-4 py-3 font-medium capitalize">
                                            <StatusIndicator status={status} />
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                     </div>
                 )}
            </div>
        );
    }

    if (validationStatus === 'complete' && aiMetrics && validatedMetrics) {
        return (
            <div className="space-y-6">
                <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-text-main">Hardware Emulation Results</h3>
                        </div>
                        <button 
                            onClick={onHardwareInTheLoopOptimize}
                            className="flex items-center px-4 py-2 text-sm font-medium bg-secondary-accent hover:bg-secondary-accent-hover text-white rounded-lg shadow-md transition-colors"
                        >
                            <FeedbackIcon className="w-5 h-5 mr-2" />
                            Optimize with Hardware Feedback
                        </button>
                    </div>
                    <p className="text-sm text-text-secondary mb-4">
                        The following metrics represent an average from all successful emulation runs.
                    </p>
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-text-secondary uppercase">
                                <tr>
                                    <th className="px-4 py-2">Metric</th>
                                    <th className="px-4 py-2">AI Estimate</th>
                                    <th className="px-4 py-2 text-primary">Hardware Verified</th>
                                    <th className="px-4 py-2">Delta</th>
                                </tr>
                            </thead>
                            <tbody>
                                <MetricRow label="LUTs" estimate={aiMetrics.lutCount} verified={validatedMetrics.lutCount} />
                                <MetricRow label="Flip-Flops" estimate={aiMetrics.ffCount} verified={validatedMetrics.ffCount} />
                                <MetricRow label="DSP Slices" estimate={aiMetrics.dspSlices} verified={validatedMetrics.dspSlices} />
                                <MetricRow label="BRAM Blocks" estimate={aiMetrics.bramBlocks} verified={validatedMetrics.bramBlocks} />
                                <MetricRow label="Throughput" estimate={aiMetrics.throughput} verified={validatedMetrics.throughput} />
                            </tbody>
                        </table>
                    </div>
                </div>
                 {boardFarmResults && boardFarmResults.length > 0 && (
                     <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
                        <h3 className="text-lg font-semibold mb-4 text-text-main">Target Emulation Summary</h3>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm">
                             <thead className="text-xs text-text-secondary uppercase">
                                <tr>
                                    <th className="px-4 py-2">Target FPGA</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                             </thead>
                             <tbody>
                                {boardFarmResults.map(({ target, status }) => (
                                    <tr key={target} className="border-b border-border-main last:border-b-0">
                                        <td className="px-4 py-3 font-medium text-text-main">{target}</td>
                                        <td className="px-4 py-3 font-medium capitalize">
                                            <StatusIndicator status={status} />
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                           </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    return null;
};

interface MetricRowProps {
    label: string;
    estimate: string;
    verified: string;
}
const MetricRow: React.FC<MetricRowProps> = ({ label, estimate, verified }) => {
    const parse = (val: string) => parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    const estVal = parse(estimate);
    const verVal = parse(verified);
    const delta = verVal - estVal;
    const deltaPercent = estVal !== 0 ? (delta / estVal) * 100 : 0;
    
    let deltaColor = 'text-text-secondary';
    if (deltaPercent > 2) deltaColor = 'text-yellow-400';
    if (deltaPercent < -2) deltaColor = 'text-green-400';
    if (label === 'Throughput' && deltaPercent > 2) deltaColor = 'text-green-400';
    if (label === 'Throughput' && deltaPercent < -2) deltaColor = 'text-yellow-400';

    return (
        <tr className="border-b border-border-main last:border-b-0">
            <td className="px-4 py-3 font-medium text-text-main">{label}</td>
            <td className="px-4 py-3 font-mono">{estimate}</td>
            <td className="px-4 py-3 font-mono font-bold text-primary">{verified}</td>
            <td className={`px-4 py-3 font-mono ${deltaColor}`}>
                {delta.toFixed(label === 'Throughput' ? 2 : 0)} ({deltaPercent.toFixed(1)}%)
            </td>
        </tr>
    );
};

export default HardwareValidationPanel;
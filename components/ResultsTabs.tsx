
import React, { useState } from 'react';
import { ChatMessage, FpgaTarget } from '../types';
import MetricsDisplay from './MetricsDisplay';
import QuantitativeAnalysisPanel from './QuantitativeAnalysisPanel';
import CodeBlock from './CodeBlock';
import HardwareValidationPanel from './HardwareValidationPanel';
import { CodeIcon } from './icons/CodeIcon';

interface ResultsTabsProps {
    messageIndex: number;
    message: ChatMessage;
    onApplyCustomCoefficients: (coefficients: number[]) => void;
    onValidateOnHardware: (messageIndex: number) => void;
    onHardwareInTheLoopOptimize: (messageIndex: number) => void;
    emulationTargets: FpgaTarget[];
}

type Tab = 'metrics' | 'analysis' | 'hdl' | 'validation';
type HdlSubTab = 'module' | 'testbench' | 'script' | 'stimulus';

const ResultsTabs: React.FC<ResultsTabsProps> = ({
    messageIndex,
    message,
    onApplyCustomCoefficients,
    onValidateOnHardware,
    onHardwareInTheLoopOptimize,
    emulationTargets,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('metrics');
    const [activeHdlTab, setActiveHdlTab] = useState<HdlSubTab>('module');
    
    const { result: optimizationResult, analysis: analysisResults, validationStatus } = message;
    if (!optimizationResult || !analysisResults) return null;

    const hasStimulus = !!optimizationResult.stimulusFileContent;

    return (
        <div>
            <div className="border-b border-border-main mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton
                        label="Hardware Metrics"
                        isActive={activeTab === 'metrics'}
                        onClick={() => setActiveTab('metrics')}
                    />
                    <TabButton
                        label="Quantitative Analysis"
                        isActive={activeTab === 'analysis'}
                        onClick={() => setActiveTab('analysis')}
                    />
                     <TabButton
                        label="Generated HDL"
                        isActive={activeTab === 'hdl'}
                        onClick={() => setActiveTab('hdl')}
                    />
                    <TabButton
                        label="Hardware Validation"
                        isActive={activeTab === 'validation'}
                        onClick={() => setActiveTab('validation')}
                    />
                </nav>
            </div>
            <div>
                {activeTab === 'metrics' && <MetricsDisplay result={optimizationResult} />}
                {activeTab === 'analysis' && <QuantitativeAnalysisPanel analysisResults={analysisResults} />}
                {activeTab === 'hdl' && (
                    <div className="bg-bg-panel p-4 rounded-lg shadow-xl border border-border-main flex flex-col">
                       <div className="flex justify-between items-center">
                         <h3 className="text-lg font-semibold text-text-main flex items-center">
                            <CodeIcon className="w-5 h-5 mr-2 text-primary" />
                            Generated Project Files
                        </h3>
                        <div className="flex space-x-1 border border-border-main rounded-lg p-1">
                            <HdlTabButton label="Module" isActive={activeHdlTab === 'module'} onClick={() => setActiveHdlTab('module')} />
                            <HdlTabButton label="Testbench" isActive={activeHdlTab === 'testbench'} onClick={() => setActiveHdlTab('testbench')} />
                            <HdlTabButton label="Script" isActive={activeHdlTab === 'script'} onClick={() => setActiveHdlTab('script')} />
                            {hasStimulus && <HdlTabButton label="Stimulus" isActive={activeHdlTab === 'stimulus'} onClick={() => setActiveHdlTab('stimulus')} />}
                        </div>
                       </div>
                       <p className="text-sm text-text-secondary my-4">
                            {activeHdlTab === 'module' && 'Synthesizable SystemVerilog module.'}
                            {activeHdlTab === 'testbench' && 'Self-checking SystemVerilog testbench.'}
                            {activeHdlTab === 'script' && 'Tcl synthesis script for Vivado or Quartus.'}
                            {activeHdlTab === 'stimulus' && 'Signal-aware input data for the testbench.'}
                       </p>

                        {activeHdlTab === 'module' && <CodeBlock code={optimizationResult.hdlModule} />}
                        {activeHdlTab === 'testbench' && <CodeBlock code={optimizationResult.hdlTestbench} />}
                        {activeHdlTab === 'script' && <CodeBlock code={optimizationResult.synthesisScript} />}
                        {activeHdlTab === 'stimulus' && hasStimulus && <CodeBlock code={optimizationResult.stimulusFileContent!} />}
                    </div>
                )}
                {activeTab === 'validation' && (
                    <HardwareValidationPanel
                        validationStatus={validationStatus || 'idle'}
                        onValidate={() => onValidateOnHardware(messageIndex)}
                        onHardwareInTheLoopOptimize={() => onHardwareInTheLoopOptimize(messageIndex)}
                        aiMetrics={optimizationResult.metrics}
                        validatedMetrics={analysisResults.validatedMetrics}
                        boardFarmResults={analysisResults.boardFarmValidationResults}
                        emulationTargets={emulationTargets}
                    />
                )}
            </div>
        </div>
    );
};

interface TabButtonProps { label: string; isActive: boolean; onClick: () => void; }
const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
    const baseClasses = "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors";
    const activeClasses = "border-primary text-primary";
    const inactiveClasses = "border-transparent text-text-secondary hover:text-text-main hover:border-gray-500";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{label}</button>
}

const HdlTabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
    const base = "px-3 py-1 text-xs rounded-md transition-colors";
    const active = "bg-primary text-primary-text font-semibold";
    const inactive = "hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary";
    return <button onClick={onClick} className={`${base} ${isActive ? active : inactive}`}>{label}</button>
}

export default ResultsTabs;

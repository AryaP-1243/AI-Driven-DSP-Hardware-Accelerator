
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ProcessorIcon } from './icons/ProcessorIcon';
import { WaveformIcon } from './icons/WaveformIcon';
import { HeartIcon } from './icons/HeartIcon';
import { AnalysisIcon } from './icons/AnalysisIcon';
import { TargetIcon } from './icons/TargetIcon';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'workflow' | 'signals' | 'math' | 'hardware';

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('workflow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-main rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative overflow-hidden animate-fade-in-up">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary-accent to-primary"></div>
        
        <div className="flex justify-between items-start p-6 border-b border-border-main">
            <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-xl mr-4">
                    <ProcessorIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-text-main">DSP Hardware Digital Twin</h2>
                    <p className="text-sm text-text-secondary uppercase tracking-widest font-semibold">AI-Driven Biomedical Engineering</p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-full text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-text-main transition-colors"
                aria-label="Close modal"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-main bg-bg-main/50 overflow-x-auto no-scrollbar">
            <NavTab active={activeTab === 'workflow'} label="Workflow" onClick={() => setActiveTab('workflow')} icon={<AnalysisIcon className="w-4 h-4" />} />
            <NavTab active={activeTab === 'signals'} label="Bio-Signals" onClick={() => setActiveTab('signals')} icon={<HeartIcon className="w-4 h-4" />} />
            <NavTab active={activeTab === 'math'} label="DSP Math" onClick={() => setActiveTab('math')} icon={<WaveformIcon className="w-4 h-4" />} />
            <NavTab active={activeTab === 'hardware'} label="Hardware Goals" onClick={() => setActiveTab('hardware')} icon={<TargetIcon className="w-4 h-4" />} />
        </div>
        
        <div className="p-8 overflow-y-auto flex-grow space-y-6">
            {activeTab === 'workflow' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-xl font-bold text-text-main">The Optimization Loop</h3>
                    <p className="text-text-secondary leading-relaxed">
                        This workbench automates the "Path to Silicon." Instead of manually writing Verilog, the AI analyzes your 
                        specific noise profile and synthesizes an RTL architecture optimized for your target FPGA architecture 
                        (e.g., Xilinx Artix-7 or Intel Cyclone V).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <StepCard num="1" title="Simulation" desc="Generate physiological signals with realistic artifacts." />
                        <StepCard num="2" title="AI Synthesis" desc="Gemini calculates coefficients and generates SystemVerilog." />
                        <StepCard num="3" title="Validation" desc="Quantify performance via SNR and MSE metrics." />
                    </div>
                </div>
            )}

            {activeTab === 'signals' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-xl font-bold text-text-main">Physiological Modeling</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bg-main/50 p-5 rounded-xl border border-border-main">
                            <h4 className="flex items-center text-primary font-bold mb-3">
                                <HeartIcon className="w-5 h-5 mr-2" /> ECG Synthesis
                            </h4>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Modeled as a state-driven piecewise function. We simulate the P-QRS-T complex using Gaussian pulses and filtered oscillators. 
                                Common artifacts included: <strong>Baseline Wander</strong> (respiratory noise) and <strong>Electrode Pop</strong>.
                            </p>
                        </div>
                        <div className="bg-bg-main/50 p-5 rounded-xl border border-border-main">
                            <h4 className="flex items-center text-secondary-accent font-bold mb-3">
                                <WaveformIcon className="w-5 h-5 mr-2" /> EEG Band Power
                            </h4>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Neural signals are modeled as a superposition of rhythmic bands ($\delta, \theta, \alpha, \beta$) 
                                atop a $1/f$ pink noise floor. The goal is often to isolate specific neural markers while 
                                suppressing muscle interference.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'math' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-xl font-bold text-text-main">Digital Signal Mathematics</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary">
                        <p>The platform executes real-time fixed-point simulation:</p>
                        <ul className="space-y-2">
                            {/* Fixed: Wrap LaTeX with curly braces in a string to avoid JSX interpretation errors for 'k' and 'N' */}
                            <li><strong>Linear Convolution:</strong> {"$y[n] = \\sum_{k=0}^{N} b_k \\cdot x[n-k]$"} is computed using AI-generated coefficients.</li>
                            <li><strong>Quantization Error:</strong> We simulate the effects of limited bit-precision (e.g., 8-bit vs 16-bit), showing you the noise floor impact.</li>
                            <li><strong>Frequency Analysis:</strong> We use FFT-based Power Spectral Density (PSD) to calculate clinical metrics like the <strong>LF/HF Ratio</strong> for HRV analysis.</li>
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'hardware' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-xl font-bold text-text-main">Silicon Implementation Goals</h3>
                    <p className="text-text-secondary">
                        The ultimate goal is to generate hardware that is ready for the "tape-out" or FPGA bitstream generation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GoalCard icon={<ProcessorIcon className="w-5 h-5" />} title="Resource Efficiency" text="Minimize LUTs and DSP slices to reduce power consumption in wearable medical devices." />
                        <GoalCard icon={<TargetIcon className="w-5 h-5" />} title="Latency Optimization" text="Achieve single-cycle throughput for real-time closed-loop neural stimulation." />
                    </div>
                </div>
            )}
        </div>
        
        <div className="p-4 border-t border-border-main bg-bg-main/30 text-center">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-widest">
                Mathematical Truth • Hardware Reality • AI Design
            </p>
        </div>
      </div>
    </div>
  );
};

const NavTab: React.FC<{ active: boolean; label: string; onClick: () => void; icon: React.ReactNode }> = ({ active, label, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
            active 
            ? 'border-primary text-primary bg-primary/5' 
            : 'border-transparent text-text-secondary hover:text-text-main hover:bg-white/5'
        }`}
    >
        <span className="mr-2">{icon}</span>
        {label}
    </button>
);

const StepCard: React.FC<{ num: string; title: string; desc: string }> = ({ num, title, desc }) => (
    <div className="bg-bg-main p-4 rounded-lg border border-border-main">
        <div className="text-primary font-bold text-lg mb-1">0{num}</div>
        <div className="text-text-main font-bold text-sm mb-1">{title}</div>
        <div className="text-xs text-text-secondary leading-tight">{desc}</div>
    </div>
);

const GoalCard: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
    <div className="flex p-4 bg-bg-main rounded-xl border border-border-main">
        <div className="text-primary mr-4 mt-1">{icon}</div>
        <div>
            <div className="font-bold text-text-main text-sm mb-1">{title}</div>
            <div className="text-xs text-text-secondary">{text}</div>
        </div>
    </div>
);

export default AboutModal;

import React from 'react';
import { ProcessorIcon } from './icons/ProcessorIcon';
import { AnalysisIcon } from './icons/AnalysisIcon';
import { ExportIcon } from './icons/ExportIcon';
import { TargetIcon } from './icons/TargetIcon';
import { EngineerIcon } from './icons/EngineerIcon';
import { ResearcherIcon } from './icons/ResearcherIcon';
import { StudentIcon } from './icons/StudentIcon';


interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col">
      <header className="p-4 container mx-auto">
        <div className="flex items-center">
          <ProcessorIcon className="w-8 h-8 text-primary mr-3" />
          <h1 className="text-xl font-bold tracking-wide">
            DSP Hardware Accelerator
          </h1>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="text-center py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-extrabold text-text-main mb-4">
                    Accelerate Your DSP Design with <span className="text-primary">AI</span>
                </h2>
                <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
                    This tool leverages generative AI to optimize DSP hardware for FPGAs. Go from high-level goals to quantitative analysis and hardware-specific metrics in seconds.
                </p>
                <button
                    onClick={onGetStarted}
                    className="px-8 py-4 text-lg font-bold bg-primary hover:bg-primary-hover text-primary-text rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300"
                >
                    Get Started
                </button>
            </div>
        </div>
        
        <div className="bg-black/10 dark:bg-black/20 py-24">
            <div className="container mx-auto px-4 text-center">
                <h3 className="text-3xl font-bold mb-4">How It Works</h3>
                <p className="text-text-secondary mb-12 max-w-2xl mx-auto">A streamlined workflow from concept to HDL insight in four simple steps.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <WorkflowStep number="1" title="Configure" description="Select your DSP block, signal type, and target FPGA architecture." />
                    <WorkflowStep number="2" title="Optimize" description="Define your performance goals in natural language to guide the AI." />
                    <WorkflowStep number="3" title="Analyze" description="Compare quantitative metrics (SNR, MSE) and hardware costs." />
                    <WorkflowStep number="4" title="Export" description="Download raw data and a full Markdown report for your research." />
                </div>
            </div>
        </div>

        <div className="py-24">
            <div className="container mx-auto px-4 text-left">
                <h3 className="text-3xl font-bold text-center mb-12">Core Capabilities for Research & Development</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                    icon={<TargetIcon className="w-8 h-8 text-primary" />}
                    title="Hardware-Aware Metrics"
                    description="Get realistic hardware cost estimations (LUTs, FFs, DSPs, BRAMs) tailored to specific FPGA families and target clock frequencies."
                    />
                    <FeatureCard
                    icon={<AnalysisIcon className="w-8 h-8 text-primary" />}
                    title="Quantitative Analysis"
                    description="Objectively measure filter performance with key metrics like Signal-to-Noise Ratio (SNR) and Mean Squared Error (MSE)."
                    />
                    <FeatureCard
                    icon={<ExportIcon className="w-8 h-8 text-primary" />}
                    title="Publication-Ready Exports"
                    description="Generate comprehensive Markdown reports and CSV data files, perfect for inclusion in academic papers or design documents."
                    />
                </div>
            </div>
        </div>
        
        <div className="bg-black/10 dark:bg-black/20 py-24">
             <div className="container mx-auto px-4 text-center">
                <h3 className="text-3xl font-bold mb-12">Designed For...</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <FeatureCard
                    icon={<EngineerIcon className="w-8 h-8 text-primary" />}
                    title="FPGA Engineers"
                    description="Rapidly prototype and explore different DSP architectures. Get AI-generated HDL snippets and resource estimates to accelerate your design cycle."
                    />
                    <FeatureCard
                    icon={<ResearcherIcon className="w-8 h-8 text-primary" />}
                    title="DSP Researchers"
                    description="Focus on algorithm performance. Leverage AI to handle hardware implementation details and quickly generate quantitative results for your studies."
                    />
                    <FeatureCard
                    icon={<StudentIcon className="w-8 h-8 text-primary" />}
                    title="Academics & Students"
                    description="A powerful educational tool to understand the trade-offs between DSP algorithms and their hardware implementation on FPGAs."
                    />
                </div>
            </div>
        </div>

        <div className="py-24">
            <div className="container mx-auto px-4 text-center">
                <h3 className="text-3xl font-bold mb-4">Ready to Optimize?</h3>
                <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
                    Create an account and start exploring the future of hardware design today.
                </p>
                <button
                    onClick={onGetStarted}
                    className="px-8 py-4 text-lg font-bold bg-primary hover:bg-primary-hover text-primary-text rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300"
                >
                    Begin Your First Simulation
                </button>
            </div>
        </div>
      </main>

       <footer className="p-4 text-center text-text-secondary text-sm">
        <p>A conceptual tool for exploring AI-driven hardware design.</p>
      </footer>
    </div>
  );
};

interface WorkflowStepProps {
    number: string;
    title: string;
    description: string;
}
const WorkflowStep: React.FC<WorkflowStepProps> = ({ number, title, description }) => (
    <div className="text-left">
        <div className="flex items-center mb-3">
            <div className="flex-shrink-0 bg-bg-panel border-2 border-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-primary">
                {number}
            </div>
            <h4 className="ml-4 text-xl font-semibold">{title}</h4>
        </div>
        <p className="text-text-secondary">{description}</p>
    </div>
);

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-bg-panel p-6 rounded-lg border border-border-main h-full">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="ml-4 text-xl font-bold">{title}</h3>
        </div>
        <p className="text-text-secondary">{description}</p>
    </div>
);

export default LandingPage;

import React, { useState } from 'react';
import { ChatMessage, Theme } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import ParetoFrontierChart from './ParetoFrontierChart';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  runs: ChatMessage[];
  theme: Theme;
}

type View = 'table' | 'plot';

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, runs, theme }) => {
  if (!isOpen) return null;
  const [view, setView] = useState<View>('table');
  
  const validRuns = runs.filter(run => run.result && run.analysis);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-main rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border-main">
            <div>
              <h2 className="text-xl font-bold text-text-main">Optimization Run Comparison</h2>
              <div className="flex space-x-1 border border-border-main rounded-lg p-1 mt-2">
                 <TabButton label="Table View" isActive={view === 'table'} onClick={() => setView('table')} />
                 <TabButton label="Pareto Plot" isActive={view === 'plot'} onClick={() => setView('plot')} />
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
        <div className="p-6 overflow-auto">
          {view === 'table' && (
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-bg-main text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Run</th>
                    <th className="px-4 py-3">SNR (dB)</th>
                    <th className="px-4 py-3">MSE</th>
                    <th className="px-4 py-3">LUTs</th>
                    <th className="px-4 py-3">FFs</th>
                    <th className="px-4 py-3">DSPs</th>
                    <th className="px-4 py-3">Throughput</th>
                  </tr>
                </thead>
                <tbody>
                  {validRuns.map((run, index) => (
                    <tr key={index} className="border-b border-border-main hover:bg-black/10 dark:hover:bg-white/10">
                      <td className={`px-4 py-3 font-medium text-text-main ${run.isHwFeedbackRun ? 'text-secondary-accent' : ''}`}>
                          #{index + 1} {run.isHwFeedbackRun && '(HIL)'}
                      </td>
                      <td className="px-4 py-3 text-text-main font-mono">{run.analysis?.aiOptimized?.snr.toFixed(2)}</td>
                      <td className="px-4 py-3 text-text-main font-mono">{run.analysis?.aiOptimized?.mse.toExponential(2)}</td>
                      <td className="px-4 py-3 text-primary font-mono">{run.result?.metrics.lutCount}</td>
                      <td className="px-4 py-3 text-primary font-mono">{run.result?.metrics.ffCount}</td>
                      <td className="px-4 py-3 text-primary font-mono">{run.result?.metrics.dspSlices}</td>
                      <td className="px-4 py-3 text-primary font-mono">{run.result?.metrics.throughput}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
          {view === 'plot' && (
              <ParetoFrontierChart runs={validRuns} theme={theme} />
          )}
        </div>
      </div>
    </div>
  );
};


interface TabButtonProps { label: string; isActive: boolean; onClick: () => void; }
const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
    const base = "px-3 py-1 text-xs rounded-md transition-colors";
    const active = "bg-primary text-primary-text font-semibold";
    const inactive = "hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary";
    return <button onClick={onClick} className={`${base} ${isActive ? active : inactive}`}>{label}</button>
}


export default ComparisonModal;

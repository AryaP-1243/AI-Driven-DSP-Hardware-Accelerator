
import React from 'react';

interface ExportControlsProps {
    onExportData: () => void;
    onExportReport: () => void;
    onExportProject: () => void;
    onCompare: () => void;
    hasResults: boolean;
    hasMultipleRuns: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({ 
    onExportData, onExportReport, onExportProject, onCompare, hasResults, hasMultipleRuns 
}) => {
    return (
        <div className="bg-bg-panel p-4 rounded-lg shadow-xl border border-border-main flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-text-main">Analysis & Export</h3>
            <div className="flex space-x-2 sm:space-x-4 flex-wrap gap-2">
                <button
                    onClick={onCompare}
                    disabled={!hasMultipleRuns}
                    className="px-4 py-2 text-sm font-medium bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-text-main rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!hasMultipleRuns ? "Run at least two optimizations to compare" : "Compare optimization runs"}
                >
                    Compare Runs
                </button>
                <button
                    onClick={onExportData}
                    disabled={!hasResults}
                    className="px-4 py-2 text-sm font-medium bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-text-main rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Data (CSV)
                </button>
                <button
                    onClick={onExportReport}
                     disabled={!hasResults}
                    className="px-4 py-2 text-sm font-medium bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-text-main rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Report (MD)
                </button>
                <button
                    onClick={onExportProject}
                     disabled={!hasResults}
                    className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-primary-text rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Download Project (.zip)
                </button>
            </div>
        </div>
    );
};

export default ExportControls;

import React, { useState, useRef } from 'react';
import { SignalType, ChartDataPoint, FpgaTarget, Theme, ChatMessage, OptimizationConstraints, FrequencyDataPoint, AnalysisResults, BitWidthAnalysis, PowerSpectrumDataPoint, DspBlockConfig } from '../types';
import SignalChart from './SignalChart';
import ChatPanel from './ChatPanel';
import AdvancedConfigPanel from './AdvancedConfigPanel';
import ExportControls from './ExportControls';
import ComparisonModal from './ComparisonModal';
import FrequencyChart from './FrequencyChart';
import LiveAnalysisDisplay from './LiveAnalysisDisplay';
import BitWidthAnalysisPanel from './BitWidthAnalysisPanel';
import SpectrumChart from './SpectrumChart';
import SpectralAnalysisPanel from './SpectralAnalysisPanel';
import CustomCoefficientsPanel from './CustomCoefficientsPanel';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CloseIcon } from './icons/CloseIcon';


interface DashboardProps {
  theme: Theme;
  selectedSignal: SignalType;
  dspChain: DspBlockConfig[];
  activeBlockIndex: number;
  fpgaTarget: FpgaTarget;
  clockFrequency: number;
  setFpgaTarget: (target: FpgaTarget) => void;
  setClockFrequency: (freq: number) => void;
  constraints: OptimizationConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<OptimizationConstraints>>;
  emulationTargets: FpgaTarget[];
  setEmulationTargets: React.Dispatch<React.SetStateAction<FpgaTarget[]>>;
  signalData: ChartDataPoint[];
  frequencyResponseData: FrequencyDataPoint[];
  powerSpectrumData: PowerSpectrumDataPoint[];
  currentAnalysis: AnalysisResults | null;
  isLoading: boolean;
  isAnalysisLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  onSendMessage: (userPrompt: string, image?: { base64Data: string; mimeType: string; dataUrl: string; }) => void;
  onApplyCustomCoefficients: (coefficients: number[]) => void;
  onValidateOnHardware: (messageIndex: number) => void;
  onHardwareInTheLoopOptimize: (messageIndex: number) => void;
  onExportData: () => void;
  onExportReport: () => void;
  onExportProject: () => void;
  chatHistory: ChatMessage[];
  optimizationRuns: ChatMessage[];
  isComparisonModalOpen: boolean;
  setIsComparisonModalOpen: (isOpen: boolean) => void;
  isLiveInput: boolean;
  liveAnalysisResults: AnalysisResults | null;
  bitWidthAnalysisResult: BitWidthAnalysis | null;
  onRunBitWidthAnalysis: (dataBitWidth: number, coefficientBitWidth: number) => void;
  onBlockSettingChange: (key: string, value: any) => void;
}

const filterBlockTypes = ['FIR', 'IIR', 'CIC Filter', 'Half-band Filter', 'Matched Filter', 'Wiener Filter', 'Kalman Filter'];
const DATA_POINTS = 200;

const Dashboard: React.FC<DashboardProps> = (props) => {
  const latestAiMessage = [...props.chatHistory].reverse().find(m => m.role === 'ai' && m.result);
  const activeBlock = props.dspChain[props.activeBlockIndex];
  
  // State and handlers for Time Domain Chart
  const [timeDomain, setTimeDomain] = useState({ min: 0, max: DATA_POINTS });
  const [isTimePanning, setIsTimePanning] = useState(false);
  const [timePanStartCoords, setTimePanStartCoords] = useState({ x: 0, domainMin: 0, domainMax: 0 });
  const timeChartWrapperRef = useRef<HTMLDivElement>(null);

  // State and handlers for Frequency Domain Chart
  const [freqDomain, setFreqDomain] = useState({ min: 0, max: 0.5 });
  const [isFreqPanning, setIsFreqPanning] = useState(false);
  const [freqPanStartCoords, setFreqPanStartCoords] = useState({ x: 0, domainMin: 0, domainMax: 0 });
  const freqChartWrapperRef = useRef<HTMLDivElement>(null);

  const [isSpectralPanelVisible, setIsSpectralPanelVisible] = useState(true);

  // --- Time Chart Handlers ---
  const handleTimeZoom = (factor: number) => {
    setTimeDomain(prevDomain => {
      const { min, max } = prevDomain;
      const range = max - min;
      const center = min + range / 2;
      let newRange = range * factor;
      if (newRange < 10) newRange = 10;
      if (newRange > DATA_POINTS) newRange = DATA_POINTS;
      let newMin = center - newRange / 2;
      let newMax = center + newRange / 2;
      if (newMin < 0) { newMin = 0; newMax = newRange; }
      if (newMax > DATA_POINTS) { newMax = DATA_POINTS; newMin = DATA_POINTS - newRange; }
      return { min: Math.round(newMin), max: Math.round(newMax) };
    });
  };
  const handleTimePan = (direction: 'left' | 'right') => {
    setTimeDomain(prevDomain => {
      const { min, max } = prevDomain; const range = max - min; const panAmount = range * 0.2;
      let newMin, newMax;
      if (direction === 'left') { newMin = Math.max(0, min - panAmount); newMax = newMin + range; } 
      else { newMax = Math.min(DATA_POINTS, max + panAmount); newMin = newMax - range; }
      return { min: Math.round(newMin), max: Math.round(newMax) };
    });
  };
  const handleResetTimeZoom = () => setTimeDomain({ min: 0, max: DATA_POINTS });
  const handleWheelTimeZoom = (e: React.WheelEvent) => { if (props.isLiveInput) return; e.preventDefault(); handleTimeZoom(e.deltaY < 0 ? 0.8 : 1.25); };
  const handleTimePanStart = (e: React.MouseEvent) => { if (props.isLiveInput) return; e.preventDefault(); setIsTimePanning(true); setTimePanStartCoords({ x: e.clientX, domainMin: timeDomain.min, domainMax: timeDomain.max }); };
  const handleTimePanMove = (e: React.MouseEvent) => {
    if (!isTimePanning || !timeChartWrapperRef.current) return; e.preventDefault();
    const chartWidth = timeChartWrapperRef.current.clientWidth; if (chartWidth === 0) return;
    const domainRange = timePanStartCoords.domainMax - timePanStartCoords.domainMin;
    const dx = e.clientX - timePanStartCoords.x;
    const domainDelta = (dx / chartWidth) * domainRange;
    let newMin = timePanStartCoords.domainMin - domainDelta; let newMax = timePanStartCoords.domainMax - domainDelta;
    if (newMin < 0) { newMin = 0; newMax = newMin + domainRange; }
    if (newMax > DATA_POINTS) { newMax = DATA_POINTS; newMin = newMax - domainRange; }
    setTimeDomain({ min: newMin, max: newMax });
  };
  const handleTimePanEnd = () => { if(isTimePanning) { setTimeDomain(prev => ({ min: Math.round(prev.min), max: Math.round(prev.max) })); setIsTimePanning(false); }};

  // --- Frequency Chart Handlers ---
  const handleFreqZoom = (factor: number) => {
    setFreqDomain(prevDomain => {
      const { min, max } = prevDomain;
      const range = max - min;
      const center = min + range / 2;
      let newRange = range * factor;
      if (newRange < 0.01) newRange = 0.01;
      if (newRange > 0.5) newRange = 0.5;
      let newMin = center - newRange / 2;
      let newMax = center + newRange / 2;
      if (newMin < 0) { newMin = 0; newMax = newRange; }
      if (newMax > 0.5) { newMax = 0.5; newMin = 0.5 - newRange; }
      return { min: newMin, max: newMax };
    });
  };
  const handleFreqPan = (direction: 'left' | 'right') => {
    setFreqDomain(prevDomain => {
      const { min, max } = prevDomain; const range = max - min; const panAmount = range * 0.2;
      let newMin, newMax;
      if (direction === 'left') { newMin = Math.max(0, min - panAmount); newMax = newMin + range; } 
      else { newMax = Math.min(0.5, max + panAmount); newMin = newMax - range; }
      return { min: newMin, max: newMax };
    });
  };
  const handleResetFreqZoom = () => setFreqDomain({ min: 0, max: 0.5 });
  const handleWheelFreqZoom = (e: React.WheelEvent) => { if (props.isLiveInput) return; e.preventDefault(); handleFreqZoom(e.deltaY < 0 ? 0.8 : 1.25); };
  const handleFreqPanStart = (e: React.MouseEvent) => { if (props.isLiveInput) return; e.preventDefault(); setIsFreqPanning(true); setFreqPanStartCoords({ x: e.clientX, domainMin: freqDomain.min, domainMax: freqDomain.max }); };
  const handleFreqPanMove = (e: React.MouseEvent) => {
    if (!isFreqPanning || !freqChartWrapperRef.current) return; e.preventDefault();
    const chartWidth = freqChartWrapperRef.current.clientWidth; if (chartWidth === 0) return;
    const domainRange = freqPanStartCoords.domainMax - freqPanStartCoords.domainMin;
    const dx = e.clientX - freqPanStartCoords.x;
    const domainDelta = (dx / chartWidth) * domainRange;
    let newMin = freqPanStartCoords.domainMin - domainDelta; let newMax = freqPanStartCoords.domainMax - domainDelta;
    if (newMin < 0) { newMin = 0; newMax = newMin + domainRange; }
    if (newMax > 0.5) { newMax = 0.5; newMin = newMax - domainRange; }
    setFreqDomain({ min: newMin, max: newMax });
  };
  const handleFreqPanEnd = () => { if(isFreqPanning) { setIsFreqPanning(false); }};
  
  if (!activeBlock) {
    return (
        <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main text-center flex flex-col justify-center items-center h-96">
            <h3 className="text-lg font-semibold mb-2 text-text-main">DSP Chain is Empty</h3>
            <p className="text-sm text-text-secondary">Please add a block from the sidebar to start configuring and optimizing.</p>
        </div>
    );
  }
  const activeBlockType = activeBlock.type;
  const isFilterBlock = filterBlockTypes.includes(activeBlockType);
  const hasSpectralDetails = props.currentAnalysis && (props.currentAnalysis.eegBands || props.currentAnalysis.hrvAnalysis);

  return (
    <div className="space-y-6">
       {props.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg relative flex items-start" role="alert">
          <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.829a1 1 0 0 0-1.414-1.414L10 8.586 7.172 5.757a1 1 0 0 0-1.414 1.414L8.586 10l-2.829 2.829a1 1 0 1 0 1.414 1.414L10 11.414l2.829 2.829a1 1 0 0 0 1.414-1.414L11.414 10z"/></svg>
          </div>
          <div>
              <p className="font-bold">An Error Occurred</p>
              <p className="text-sm">{props.error}</p>
          </div>
          <button onClick={() => props.setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close">
              <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-bg-panel p-4 rounded-lg shadow-xl border border-border-main">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-text-main">
                          {props.isLiveInput ? 'Live Microphone Input' : `Full Chain Output (${props.selectedSignal} Signal)`}
                        </h3>
                        <p className="text-sm text-text-secondary -mt-1">
                          Currently optimizing: <span className="font-semibold text-primary">{activeBlockType}</span> (Block #{props.activeBlockIndex + 1})
                        </p>
                    </div>
                     {!props.isLiveInput && (
                      <div className="flex items-center space-x-1 bg-bg-main border border-border-main rounded-lg p-1">
                        <button onClick={() => handleTimePan('left')} aria-label="Pan left" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors">
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleTimePan('right')} aria-label="Pan right" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors">
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleTimeZoom(0.8)} aria-label="Zoom in" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors">
                          <ZoomInIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleTimeZoom(1.25)} aria-label="Zoom out" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors">
                          <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleResetTimeZoom} aria-label="Reset zoom" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors">
                          <RefreshIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                </div>
                <div 
                  ref={timeChartWrapperRef}
                  onWheel={handleWheelTimeZoom}
                  onMouseDown={handleTimePanStart}
                  onMouseMove={handleTimePanMove}
                  onMouseUp={handleTimePanEnd}
                  onMouseLeave={handleTimePanEnd}
                  className={`relative ${!props.isLiveInput ? (isTimePanning ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                  title={!props.isLiveInput ? "Click and drag to pan, use mouse wheel to zoom" : ""}
                >
                  <SignalChart data={props.signalData} theme={props.theme} domain={timeDomain} />
                </div>
                {props.isLiveInput && props.liveAnalysisResults && (
                    <LiveAnalysisDisplay analysisResults={props.liveAnalysisResults} />
                )}
            </div>
            {isFilterBlock && props.frequencyResponseData.length > 0 && !props.isLiveInput && (
                <div className="bg-bg-panel p-4 rounded-lg shadow-xl border border-border-main">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-text-main">Frequency Response (Active Block)</h3>
                        <div className="flex items-center space-x-1 bg-bg-main border border-border-main rounded-lg p-1">
                            <button onClick={() => handleFreqPan('left')} aria-label="Pan left" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleFreqPan('right')} aria-label="Pan right" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleFreqZoom(0.8)} aria-label="Zoom in" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"><ZoomInIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleFreqZoom(1.25)} aria-label="Zoom out" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"><ZoomOutIcon className="w-5 h-5" /></button>
                            <button onClick={handleResetFreqZoom} aria-label="Reset zoom" className="p-1.5 text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"><RefreshIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div
                        ref={freqChartWrapperRef}
                        onWheel={handleWheelFreqZoom}
                        onMouseDown={handleFreqPanStart}
                        onMouseMove={handleFreqPanMove}
                        onMouseUp={handleFreqPanEnd}
                        onMouseLeave={handleFreqPanEnd}
                        className={`relative ${isFreqPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                        title="Click and drag to pan, use mouse wheel to zoom"
                    >
                        <FrequencyChart data={props.frequencyResponseData} theme={props.theme} domain={freqDomain} />
                    </div>
                </div>
            )}
            {props.powerSpectrumData.length > 0 && (
                <div className={`grid grid-cols-1 ${isSpectralPanelVisible && hasSpectralDetails ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                    <div className="bg-bg-panel p-4 rounded-lg shadow-xl border border-border-main">
                         <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-semibold text-text-main">Power Spectrum</h3>
                             {hasSpectralDetails && (
                                <button
                                    onClick={() => setIsSpectralPanelVisible(!isSpectralPanelVisible)}
                                    className="flex items-center text-sm px-2 py-1 rounded-md text-text-secondary hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                    title={isSpectralPanelVisible ? "Hide analysis details" : "Show analysis details"}
                                >
                                    {isSpectralPanelVisible ? (
                                        <>
                                            <span>Hide Details</span>
                                            <ChevronUpIcon className="w-4 h-4 ml-1" />
                                        </>
                                    ) : (
                                        <>
                                            <span>Show Details</span>
                                            <ChevronDownIcon className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </button>
                             )}
                        </div>
                        <SpectrumChart data={props.powerSpectrumData} theme={props.theme} signalType={props.selectedSignal} />
                    </div>
                    {isSpectralPanelVisible && hasSpectralDetails && (
                        <SpectralAnalysisPanel analysis={props.currentAnalysis} />
                    )}
                </div>
            )}
        </div>

        <div className="lg:col-span-1 space-y-6">
             <AdvancedConfigPanel
                fpgaTarget={props.fpgaTarget}
                setFpgaTarget={props.setFpgaTarget}
                clockFrequency={props.clockFrequency}
                setClockFrequency={props.setClockFrequency}
                constraints={props.constraints}
                setConstraints={props.setConstraints}
                emulationTargets={props.emulationTargets}
                setEmulationTargets={props.setEmulationTargets}
                activeBlock={activeBlock}
                onSettingChange={props.onBlockSettingChange}
            />
             {isFilterBlock && (
                <CustomCoefficientsPanel onApply={props.onApplyCustomCoefficients} />
             )}
             {latestAiMessage && latestAiMessage.result && latestAiMessage.analysis && (
                <BitWidthAnalysisPanel 
                    latestAiResult={latestAiMessage.result}
                    latestAnalysis={latestAiMessage.analysis}
                    analysisResult={props.bitWidthAnalysisResult}
                    onRunAnalysis={props.onRunBitWidthAnalysis}
                    isLoading={props.isAnalysisLoading}
                />
            )}
        </div>
      </div>
      
      <ExportControls
        onExportData={props.onExportData}
        onExportReport={props.onExportReport}
        onExportProject={props.onExportProject}
        onCompare={() => props.setIsComparisonModalOpen(true)}
        hasResults={props.optimizationRuns.length > 0}
        hasMultipleRuns={props.optimizationRuns.length > 1}
      />
      
      <ChatPanel
        isLoading={props.isLoading}
        onSendMessage={props.onSendMessage}
        selectedBlock={activeBlockType}
        selectedSignal={props.selectedSignal}
        chatHistory={props.chatHistory}
        onApplyCustomCoefficients={props.onApplyCustomCoefficients}
        onValidateOnHardware={props.onValidateOnHardware}
        onHardwareInTheLoopOptimize={props.onHardwareInTheLoopOptimize}
        emulationTargets={props.emulationTargets}
        setFpgaTarget={props.setFpgaTarget}
        setClockFrequency={props.setClockFrequency}
      />
      
      <ComparisonModal 
        isOpen={props.isComparisonModalOpen}
        onClose={() => props.setIsComparisonModalOpen(false)}
        runs={props.optimizationRuns}
        theme={props.theme}
      />
    </div>
  );
};

export default Dashboard;
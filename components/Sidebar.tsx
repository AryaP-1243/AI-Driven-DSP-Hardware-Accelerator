import React, { useState } from 'react';
import { SignalType, BlockType, DspBlockConfig, WindowType, FilterType } from '../types';
import { SignalIcon } from './icons/SignalIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SystemIcon } from './icons/SystemIcon';
import CustomSelect from './CustomSelect';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSignal: SignalType;
  setSelectedSignal: (signal: SignalType) => void;
  dspChain: DspBlockConfig[];
  setDspChain: (chain: DspBlockConfig[]) => void;
  activeBlockIndex: number;
  setActiveBlockIndex: (index: number) => void;
  isLiveInput: boolean;
  setIsLiveInput: (isLive: boolean) => void;
}

const signalCategories: { name: string, types: SignalType[] }[] = [
    { name: 'Biomedical', types: [
        'ECG', 'ECG (Arrhythmia)', 'ECG (Arrhythmia Simulation)', 'ECG (Noise Artifacts)', 'ECG (PAC/PVC beats)', 'Fetal ECG',
        'EEG', 'EMG (Muscle)', 'EOG (Eye Movement)', 'Plethysmogram (PPG)', 'Blood Pressure (ABP)',
        'Phonocardiogram (PCG)', 'Galvanic Skin Response (GSR)', 'Respiratory (RIP)', 'HRV'
    ] },
    { name: 'Audio & Speech', types: [
        'Speech', 'Speech (Female)', 'Spoken Digit', 'Audio', 'Music', 'Piano Chord', 'Guitar Riff', 'Drum Loop', 'Violin Note',
        'Flute Note', 'Bass Guitar Note', 'Trumpet Note', 'Audio (Cymbal Crash)', 'Audio (Square Lead Synth)', 'Doppler Shift Audio',
        'White Noise', 'Pink Noise', 'Brownian Noise'
    ] },
    { name: 'Test Signals', types: [
        'Sine Wave', 'Cosine Wave', 'Square Wave', 'Sawtooth Wave', 'Triangle Wave', 'Step Function', 'Impulse Function',
        'Chirp Signal', 'Swept-Frequency Cosine', 'Damped Sine Wave', 'Gaussian Pulse', 'Sinc Function', 'Multitone Signal',
        'Second-Order System Response', 'Rectangular Pulse Train', 'Random Binary Sequence'
    ] },
    { name: 'Communications & RF', types: [
        'BPSK Signal', 'QPSK Signal', '8-PSK Signal', '16-QAM Signal', '64-QAM Signal', '256-QAM Signal', 'GMSK Signal',
        'OFDM Signal', 'AM Signal', 'FM Signal', 'Double-Sideband SC', 'Single-Sideband SC', 'ASK Signal', 'FSK Signal',
        'CPFSK Signal', 'PWM Signal', 'PPM Signal', 'Manchester Code', 'CDMA Signal (Sim.)', 'LTE Downlink Signal (Sim.)',
        '5G NR Signal (Sim.)', 'Bluetooth LE Packet (Sim.)', 'WiFi Beacon (Sim.)', 'GPS L1 C/A Code'
    ] },
    { name: 'Radar & Sonar', types: [
        'Pulsed Radar Return', 'FMCW Radar Signal', 'Doppler Radar', 'Sonar Ping', 'Bat Echolocation Chirp',
        'Linear Frequency Modulated (LFM) Pulse', 'Barker Code Pulse', 'Ultrasound Pulse', 'Hydrophone (Marine)'
    ] },
    { name: 'Mechanical & Sensor', types: [
        'Vibration Sensor', 'Accelerometer Data', 'Gyroscope Data', 'Engine Knock Sensor', 'Bearing Fault Signal'
    ] },
    { name: 'Power Systems', types: [
        'Three-Phase Power', 'Power Line Transient'
    ] },
    { name: 'Financial (Simulated)', types: [
        'Stock Price (Simulated)', 'Volatility Index (Sim.)', 'MACD Indicator (Sim.)'
    ] },
    { name: 'Other', types: [
        'Seismic Data', 'Seismic P-wave', 'Seismic S-wave', 'Chaotic Signal (Lorenz)',
        'Weather Sensor Data', 'Light Sensor Data'
    ] },
];

const fftSizes = [64, 128, 256, 512, 1024];
const windowTypes: WindowType[] = ['None', 'Hamming', 'Blackman', 'Hann'];

const blockCategories: { group: string; items: { label: string; value: BlockType }[] }[] = [
    {
        group: 'Filters',
        items: [
            { label: 'FIR', value: 'FIR' }, { label: 'IIR', value: 'IIR' }, { label: 'CIC Filter', value: 'CIC Filter' },
            { label: 'Half-band Filter', value: 'Half-band Filter' }, { label: 'Matched Filter', value: 'Matched Filter' },
            { label: 'Wiener Filter', value: 'Wiener Filter' }, { label: 'Kalman Filter', value: 'Kalman Filter' },
            { label: 'Comb Filter', value: 'Comb Filter' }, { label: 'All-pass Filter', value: 'All-pass Filter' },
            { label: 'Goertzel Algorithm', value: 'Goertzel Algorithm' }, { label: 'Median Filter', value: 'Median Filter' }
        ]
    },
    {
        group: 'Adaptive Filters',
        items: [
            { label: 'LMS Filter', value: 'LMS Filter' }, { label: 'RLS Filter', value: 'RLS Filter' }
        ]
    },
    {
        group: 'Transforms',
        items: [
            { label: 'FFT', value: 'FFT' }, { label: 'IFFT', value: 'IFFT' }, { label: 'DCT', value: 'DCT' },
            { label: 'Walsh-Hadamard', value: 'Walsh-Hadamard Transform' }, { label: 'Hilbert Transform', value: 'Hilbert Transform' },
            { label: 'Wavelet (DWT)', value: 'Discrete Wavelet Transform' }, { label: 'STFT', value: 'Short-Time Fourier Transform (STFT)' }
        ]
    },
    {
        group: 'Communications',
        items: [
            { label: 'QAM Modulator', value: 'QAM Modulator' }, { label: 'QAM Demodulator', value: 'QAM Demodulator' },
            { label: 'QPSK Modulator', value: 'QPSK Modulator' }, { label: 'QPSK Demodulator', value: 'QPSK Demodulator' },
            { label: 'BPSK Modulator', value: 'BPSK Modulator' }, { label: 'Viterbi Decoder', value: 'Viterbi Decoder' },
            { label: 'Reed-Solomon Enc', value: 'Reed-Solomon Encoder' }, { label: 'DUC/DDC', value: 'DUC/DDC' },
            { label: 'Symbol Mapper', value: 'Symbol Mapper' }, { label: 'Channel Estimator', value: 'Channel Estimator' },
            { label: 'Equalizer', value: 'Equalizer' }, { label: 'Preamble Detector', value: 'Preamble Detector' }
        ]
    },
    {
        group: 'OFDM',
        items: [
            { label: 'Cyclic Prefix Ins', value: 'Cyclic Prefix Insertion' }, { label: 'Cyclic Prefix Rem', value: 'Cyclic Prefix Removal' }
        ]
    },
    {
        group: 'Synthesizers & Phase',
        items: [
            { label: 'DDS', value: 'Direct Digital Synthesizer (DDS)' }, { label: 'NCO', value: 'Numerically Controlled Oscillator (NCO)' },
            { label: 'PLL', value: 'Phase-Locked Loop (PLL)' }, { label: 'Digital Mixer', value: 'Digital Mixer' },
            { label: 'Phase Detector', value: 'Phase Detector' }, { label: 'Signal Generator', value: 'Signal Generator' }
        ]
    },
    {
        group: 'Math & Logic',
        items: [
            { label: 'CORDIC', value: 'CORDIC' }, { label: 'Divider', value: 'Divider' }, { label: 'Multiplier', value: 'Multiplier' },
            { label: 'Adder Tree', value: 'Adder Tree' }, { label: 'Correlation', value: 'Correlation' },
            { label: 'Convolution', value: 'Convolution' }, { label: 'Integrator', value: 'Integrator' },
            { label: 'Differentiator', value: 'Differentiator' }
        ]
    },
    {
        group: 'Statistics & Measurement',
        items: [
            { label: 'Moving Average', value: 'Moving Average' }, { label: 'RMS', value: 'RMS' },
            { label: 'Standard Deviation', value: 'Standard Deviation' }, { label: 'Histogram', value: 'Histogram' }
        ]
    },
    {
        group: 'Image & Video',
        items: [{ label: '2D FIR Filter', value: '2D FIR Filter' }]
    }
];


const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void;}> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-text-main">{label}</span>
      <button onClick={() => onChange(!enabled)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-panel focus:ring-primary ${enabled ? 'bg-primary' : 'bg-bg-main border border-border-main'}`}
        role="switch" aria-checked={enabled} >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({
  isOpen, onClose, selectedSignal, setSelectedSignal,
  dspChain, setDspChain, activeBlockIndex, setActiveBlockIndex,
  isLiveInput, setIsLiveInput
}) => {
  const isAudioSignal = ['Audio', 'Speech', 'Music'].includes(selectedSignal);
  const [blockToAdd, setBlockToAdd] = useState<BlockType>('FIR');

  const addBlockToChain = () => {
    const newBlock: DspBlockConfig = { id: crypto.randomUUID(), type: blockToAdd };
    if (blockToAdd === 'FFT') {
      newBlock.settings = {
        fftSize: 256,
        windowType: 'None'
      };
    }
    if (['FIR', 'IIR'].includes(blockToAdd)) {
        newBlock.settings = {
            filterOrder: 11,
            filterType: 'Low-pass',
            windowType: 'None'
        };
    }
    setDspChain([...dspChain, newBlock]);
    setActiveBlockIndex(dspChain.length);
  };

  const removeBlockFromChain = (id: string) => {
    const newChain = dspChain.filter(block => block.id !== id);
    setDspChain(newChain);
    // Adjust active index if the removed block was the active one or before it
    if (activeBlockIndex >= newChain.length) {
        setActiveBlockIndex(Math.max(0, newChain.length - 1));
    }
  };
  
  const handleFftSettingChange = (setting: string, value: any) => {
    const newChain = [...dspChain];
    const activeBlock = newChain[activeBlockIndex];
    if (activeBlock.type === 'FFT') {
        activeBlock.settings = {
            ...activeBlock.settings,
            [setting]: value
        };
    }
    setDspChain(newChain);
  };


  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-bg-panel px-4 pb-4 pt-20 md:px-6 md:pb-6 border-r border-border-main transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-lg font-bold text-text-main">Configuration</h2>
          <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-text-main transition-colors" aria-label="Close sidebar">
            <CloseIcon className="w-6 h-6" />
          </button>
      </div>

      <div className="space-y-6 h-full flex flex-col">
        {/* DSP CHAIN SECTION */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center mb-3">
             <SystemIcon className="w-5 h-5 mr-2" />
            DSP Chain
          </h2>
          <div className="flex flex-col text-center text-xs font-semibold text-text-secondary">
              <div className="p-2 bg-bg-main border-x border-t border-border-main rounded-t-md">Input Signal</div>
              <div className="h-3 w-px bg-border-main mx-auto"/>
              <div className="space-y-1 max-h-40 overflow-y-auto px-1">
                {dspChain.length > 0 ? dspChain.map((block, index) => (
                    <div key={block.id}>
                      <div className="relative group flex items-center">
                         <div className="absolute top-[-5px] bottom-[-5px] left-1/2 -translate-x-1/2 w-px bg-border-main -z-10"/>
                        <button
                            onClick={() => setActiveBlockIndex(index)}
                            className={`flex-grow text-left p-2 rounded-md text-sm transition-colors z-0 ${activeBlockIndex === index ? 'bg-primary text-primary-text font-semibold' : 'bg-bg-panel hover:bg-black/10 dark:hover:bg-white/10 text-text-main'}`}
                        >
                           {index + 1}. {block.type}
                        </button>
                        <button onClick={() => removeBlockFromChain(block.id)} className="ml-2 p-1 text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label={`Remove ${block.type}`}>
                            <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {block.type === 'FFT' && activeBlockIndex === index && (
                          <div className="p-3 my-1 border border-primary/20 bg-primary/5 rounded-md text-left text-sm space-y-2">
                               <div>
                                  <label htmlFor={`fft-size-${block.id}`} className="text-xs font-medium text-text-secondary">FFT Size</label>
                                  <select 
                                    id={`fft-size-${block.id}`}
                                    value={block.settings?.fftSize || 256} 
                                    onChange={(e) => handleFftSettingChange('fftSize', parseInt(e.target.value, 10))}
                                    className="w-full mt-1 p-1 bg-bg-main border border-border-main rounded-md focus:ring-1 focus:ring-primary focus:outline-none text-text-main text-xs"
                                  >
                                    {fftSizes.map(size => <option key={size} value={size}>{size} points</option>)}
                                  </select>
                               </div>
                               <div>
                                  <label htmlFor={`fft-window-${block.id}`} className="text-xs font-medium text-text-secondary">Window</label>
                                  <select
                                    id={`fft-window-${block.id}`}
                                    value={block.settings?.windowType || 'None'}
                                    onChange={(e) => handleFftSettingChange('windowType', e.target.value as WindowType)}
                                    className="w-full mt-1 p-1 bg-bg-main border border-border-main rounded-md focus:ring-1 focus:ring-primary focus:outline-none text-text-main text-xs"
                                  >
                                    {windowTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                  </select>
                               </div>
                          </div>
                      )}
                    </div>
                )) : (
                     <div className="p-3 my-1 border border-dashed border-border-main rounded-md text-text-secondary text-sm">Chain is empty</div>
                )}
              </div>
              <div className="h-3 w-px bg-border-main mx-auto"/>
              <div className="p-2 bg-bg-main border-x border-b border-border-main rounded-b-md">Final Output</div>
          </div>
           <div className="flex space-x-2 mt-3">
              <CustomSelect
                  value={blockToAdd}
                  onChange={(val) => setBlockToAdd(val as BlockType)}
                  options={blockCategories}
              />
              <button onClick={addBlockToChain} className="px-3 bg-primary hover:bg-primary-hover text-primary-text font-bold rounded-md transition-colors text-sm">Add</button>
           </div>
        </div>
        
        {/* SIGNAL SOURCE SECTION */}
        <div className="flex-grow flex flex-col min-h-0">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center mb-3">
             <SignalIcon className="w-5 h-5 mr-2" />
            Signal Source
          </h2>
          <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {signalCategories.map(category => (
                <div key={category.name}>
                    <h3 className="text-xs font-bold text-text-secondary mb-2">{category.name}</h3>
                    <ul className="space-y-1.5">
                        {category.types.map((signal) => (
                            <SidebarButton
                                key={signal}
                                label={signal}
                                isActive={selectedSignal === signal}
                                onClick={() => setSelectedSignal(signal)}
                            />
                        ))}
                    </ul>
                </div>
            ))}
          </div>
           {isAudioSignal && (
              <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-md border border-border-main flex-shrink-0">
                  <ToggleSwitch label="Use Microphone" enabled={isLiveInput} onChange={setIsLiveInput} />
                  <p className="text-xs text-text-secondary mt-2">Enable to use live audio as the signal source.</p>
              </div>
            )}
        </div>
      </div>
    </aside>
  );
};

interface SidebarButtonProps { label: string; isActive: boolean; onClick: () => void; }
const SidebarButton: React.FC<SidebarButtonProps> = ({ label, isActive, onClick }) => {
    const baseClasses = "w-full text-left px-3 py-1.5 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50";
    const activeClasses = "bg-primary text-primary-text font-semibold shadow-sm";
    const inactiveClasses = "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-main";
    return (
        <li><button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{label}</button></li>
    );
};

export default Sidebar;





import React, { useState, useEffect, useRef } from 'react';
import { BlockType, SignalType, ChatMessage, FpgaTarget } from '../types';
import ResultsTabs from './ResultsTabs';
import { ProcessorIcon } from './icons/ProcessorIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ChatPanelProps {
  isLoading: boolean;
  onSendMessage: (userPrompt: string, image?: { base64Data: string; mimeType: string; dataUrl: string; }) => void;
  selectedBlock: BlockType;
  selectedSignal: SignalType;
  chatHistory: ChatMessage[];
  onApplyCustomCoefficients: (coefficients: number[]) => void;
  onValidateOnHardware: (messageIndex: number) => void;
  onHardwareInTheLoopOptimize: (messageIndex: number) => void;
  emulationTargets: FpgaTarget[];
  setFpgaTarget: (target: FpgaTarget) => void;
  setClockFrequency: (freq: number) => void;
}

interface Preset {
    name: string;
    prompt: string;
    fpgaTarget?: FpgaTarget;
    clockFrequency?: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
    isLoading, onSendMessage, selectedBlock, selectedSignal, chatHistory, 
    onApplyCustomCoefficients, onValidateOnHardware, onHardwareInTheLoopOptimize, emulationTargets,
    setFpgaTarget, setClockFrequency
}) => {
  
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<{ file: File; dataUrl: string; } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets: Preset[] = [
    {
        name: 'Minimize LUTs',
        prompt: `Optimize the current ${selectedBlock} for a ${selectedSignal} signal to minimize Look-Up Table (LUT) usage. Target a Kintex-7 FPGA with a 200 MHz clock. Prioritize resource reduction over peak performance if necessary.`,
        fpgaTarget: 'Xilinx Kintex-7',
        clockFrequency: 200,
    },
    {
        name: 'Maximize Speed',
        prompt: `Re-pipeline the ${selectedBlock} design to maximize throughput for a ${selectedSignal} signal. Target a Xilinx Virtex-7 with a 300 MHz clock. I am willing to use more LUTs and FFs to achieve the highest possible MSPS.`,
        fpgaTarget: 'Xilinx Virtex-7',
        clockFrequency: 300,
    },
    {
        name: 'Minimize Latency',
        prompt: `Redesign the active ${selectedBlock} for the ${selectedSignal} signal to achieve the absolute minimum latency. You MUST use a deeply pipelined architecture. Target a Xilinx Zynq-7000 FPGA with a 100 MHz clock. Resource usage is secondary to latency.`,
        fpgaTarget: 'Xilinx Zynq-7000',
        clockFrequency: 100,
    },
    {
        name: 'Balanced',
        prompt: `Provide a balanced optimization for this ${selectedBlock} block on a ${selectedSignal} signal. Target an Intel Cyclone V. Focus on a good trade-off between resource usage (LUTs/FFs) and performance.`,
        fpgaTarget: 'Intel Cyclone V',
        clockFrequency: 150,
    },
  ];

  useEffect(() => {
    // Set a default prompt when the component loads or the block/signal changes
    if (chatHistory.length === 0) {
      setPrompt(`Provide a balanced optimization for this ${selectedBlock} block on a ${selectedSignal} signal.`);
    }
  }, [selectedBlock, selectedSignal, chatHistory.length]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Invalid file type. Please select a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
      setImageError('File size exceeds 4MB. Please select a smaller image.');
      return;
    }
    
    setImageError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
        setImage({ file, dataUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };
  
  const handlePresetClick = (preset: Preset) => {
    if (preset.fpgaTarget) setFpgaTarget(preset.fpgaTarget);
    if (preset.clockFrequency) setClockFrequency(preset.clockFrequency);
    setPrompt(preset.prompt);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && !image) || isLoading) return;

    if (image) {
        const base64Data = image.dataUrl.split(',')[1];
        onSendMessage(prompt, { base64Data, mimeType: image.file.type, dataUrl: image.dataUrl });
    } else {
        onSendMessage(prompt);
    }
    
    setPrompt('');
    setImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-bg-panel rounded-lg shadow-xl border border-border-main flex flex-col h-[70vh]">
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {chatHistory.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'user' ? (
              <div className="bg-primary/80 text-primary-text rounded-lg p-3 max-w-xl">
                 {message.image && <img src={message.image} alt="User upload" className="rounded-md mb-2 max-h-48" />}
                <p>{message.text}</p>
              </div>
            ) : (
              <div className="bg-bg-main rounded-lg p-0 max-w-full w-full">
                {message.result && message.analysis ? (
                    <ResultsTabs 
                        messageIndex={index}
                        message={message}
                        onApplyCustomCoefficients={onApplyCustomCoefficients}
                        onValidateOnHardware={onValidateOnHardware}
                        onHardwareInTheLoopOptimize={onHardwareInTheLoopOptimize}
                        emulationTargets={emulationTargets}
                    />
                ) : (
                   <div className="p-3 flex items-center">
                    <ProcessorIcon className="w-6 h-6 text-primary mr-3" />
                    <p className="text-text-secondary">{message.text || 'An unknown error occurred.'}</p>
                   </div>
                )}
              </div>
            )}
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-bg-main rounded-lg p-3 inline-flex items-center">
                    <ProcessorIcon className="w-5 h-5 text-primary animate-spin mr-3" />
                    <p className="text-text-secondary">AI is thinking...</p>
                 </div>
            </div>
         )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-border-main">
        {image && (
            <div className="relative inline-block mb-2">
                <img src={image.dataUrl} alt="Selected preview" className="h-20 rounded-md border border-border-main" />
                <button 
                    onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute -top-2 -right-2 bg-bg-main rounded-full p-0.5 text-text-secondary hover:text-text-main"
                    aria-label="Remove image"
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        )}
        {imageError && <p className="text-red-400 text-xs mb-2">{imageError}</p>}
        
        <div className="mb-3">
            <p className="text-xs font-semibold text-text-secondary mb-2">
                Start with a preset
            </p>
            <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                    <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        disabled={isLoading}
                        className="px-3 py-1 text-xs bg-bg-main border border-border-main rounded-full hover:bg-primary/20 hover:border-primary text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/png, image/jpeg, image/webp" className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 bg-bg-main border border-border-main rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-main transition-colors disabled:opacity-50"
            aria-label="Attach image"
          >
            <PaperclipIcon className="w-5 h-5" />
          </button>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            disabled={isLoading}
            rows={1}
            className="flex-1 p-3 bg-bg-main border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-text-main disabled:opacity-50 resize-none"
            placeholder="Describe your goal or ask about the attached image..."
          />
          <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && !image)}
            className="px-6 py-3 font-bold bg-primary hover:bg-primary-hover text-primary-text rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;

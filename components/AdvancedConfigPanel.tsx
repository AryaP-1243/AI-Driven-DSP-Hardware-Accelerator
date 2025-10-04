import React from 'react';
import { BlockType, DspBlockConfig, FpgaTarget, OptimizationConstraints, FilterType, WindowType } from '../types';
import { ServerIcon } from './icons/ServerIcon';

interface AdvancedConfigPanelProps {
    fpgaTarget: FpgaTarget;
    setFpgaTarget: (target: FpgaTarget) => void;
    clockFrequency: number;
    setClockFrequency: (freq: number) => void;
    constraints: OptimizationConstraints;
    setConstraints: React.Dispatch<React.SetStateAction<OptimizationConstraints>>;
    emulationTargets: FpgaTarget[];
    setEmulationTargets: React.Dispatch<React.SetStateAction<FpgaTarget[]>>;
    activeBlock: DspBlockConfig;
    onSettingChange: (key: string, value: any) => void;
}

const fpgaTargets: { vendor: string, families: FpgaTarget[] }[] = [
    {
        vendor: 'AMD / Xilinx',
        families: [
            'Xilinx Spartan-7', 'Xilinx Artix-7', 'Xilinx Kintex-7', 'Xilinx Virtex-7',
            'Xilinx UltraScale', 'Xilinx UltraScale+',
            'Xilinx Zynq-7000', 'Xilinx Zynq UltraScale+',
            'Xilinx Versal Core', 'Xilinx Versal AI Core'
        ]
    },
    {
        vendor: 'Intel / Altera',
        families: [
            'Intel Cyclone IV', 'Intel Cyclone V', 'Intel Cyclone 10',
            'Intel Arria V', 'Intel Arria 10',
            'Intel Stratix IV', 'Intel Stratix V', 'Intel Stratix 10',
            'Intel Agilex', 'Intel MAX 10'
        ]
    },
    {
        vendor: 'Lattice Semiconductor',
        families: ['Lattice iCE40', 'Lattice MachXO3', 'Lattice ECP5', 'Lattice CertusPro-NX', 'Lattice Avant']
    },
    {
        vendor: 'Microchip',
        families: ['Microchip IGLOO2', 'Microchip SmartFusion2', 'Microchip PolarFire', 'Microchip PolarFire SoC']
    },
    {
        vendor: 'GOWIN',
        families: ['Gowin LittleBee', 'Gowin Arora']
    }
];

const filterTypes: FilterType[] = ['Low-pass', 'High-pass', 'Band-pass', 'Band-stop'];
const windowTypes: { label: string, value: WindowType }[] = [
    { label: 'None (Rectangular)', value: 'None' },
    { label: 'Hamming', value: 'Hamming' },
    { label: 'Blackman', value: 'Blackman' },
    { label: 'Hann', value: 'Hann' }
];

const AdvancedConfigPanel: React.FC<AdvancedConfigPanelProps> = ({
    fpgaTarget,
    setFpgaTarget,
    clockFrequency,
    setClockFrequency,
    constraints,
    setConstraints,
    emulationTargets,
    setEmulationTargets,
    activeBlock,
    onSettingChange
}) => {
    
    const handleConstraintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConstraints(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleEmulationTarget = (target: FpgaTarget) => {
        setEmulationTargets(prev =>
            prev.includes(target)
                ? prev.filter(t => t !== target)
                : [...prev, target]
        );
    };
    
    const isFirBlock = activeBlock.type === 'FIR';
    const isIirBlock = activeBlock.type === 'IIR';
    const isFilterBlock = isFirBlock || isIirBlock;
    const settings = activeBlock.settings || {};

    return (
        <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Hardware Configuration</h3>
            <div className="space-y-4">
                 {isFilterBlock && (
                    <div className="space-y-4 p-3 rounded-md border border-primary/20 bg-primary/5">
                        <h4 className="text-sm font-semibold text-primary -mb-2">Active Block Settings ({activeBlock.type})</h4>
                        <div>
                            <label htmlFor="filterOrder" className="flex justify-between text-sm font-medium text-text-secondary mb-1">
                                <span>Filter Order ({isFirBlock ? 'Taps' : 'Order'})</span>
                                <span className="font-bold text-primary">{settings.filterOrder || 11}</span>
                            </label>
                            <input
                                id="filterOrder"
                                type="range"
                                min="2"
                                max="64"
                                step="1"
                                value={settings.filterOrder || 11}
                                onChange={(e) => onSettingChange('filterOrder', parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-border-main rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                        {isFirBlock && (
                            <>
                                <div>
                                    <label htmlFor="filterType" className="block text-sm font-medium text-text-secondary mb-1">Filter Type</label>
                                    <select
                                        id="filterType"
                                        value={settings.filterType || 'Low-pass'}
                                        onChange={(e) => onSettingChange('filterType', e.target.value as FilterType)}
                                        className="w-full p-2 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main"
                                    >
                                        {filterTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="windowType" className="block text-sm font-medium text-text-secondary mb-1">Window Function</label>
                                    <select
                                        id="windowType"
                                        value={settings.windowType || 'None'}
                                        onChange={(e) => onSettingChange('windowType', e.target.value as WindowType)}
                                        className="w-full p-2 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main"
                                    >
                                        {windowTypes.map(win => <option key={win.value} value={win.value}>{win.label}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                )}
                <div>
                    <label htmlFor="fpgaTarget" className="block text-sm font-medium text-text-secondary mb-1">Primary FPGA Target</label>
                    <select
                        id="fpgaTarget"
                        value={fpgaTarget}
                        onChange={(e) => setFpgaTarget(e.target.value as FpgaTarget)}
                        className="w-full p-2 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main"
                    >
                        {fpgaTargets.map(({ vendor, families }) => (
                            <optgroup key={vendor} label={vendor}>
                                {families.map(family => (
                                    <option key={family} value={family}>{family}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div>
                     <label htmlFor="clockFreq" className="block text-sm font-medium text-text-secondary mb-1">Target Clock Frequency (MHz)</label>
                     <input
                        id="clockFreq"
                        type="number"
                        value={clockFrequency}
                        onChange={(e) => setClockFrequency(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full p-2 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main"
                        min="1"
                     />
                </div>
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-4 text-text-main">Optimization Constraints</h3>
            <div className="grid grid-cols-2 gap-4">
                 <ConstraintInput label="Max LUTs" name="maxLuts" value={constraints.maxLuts} onChange={handleConstraintChange} placeholder="e.g., 2000" />
                 <ConstraintInput label="Max FFs" name="maxFfs" value={constraints.maxFfs} onChange={handleConstraintChange} placeholder="e.g., 2500" />
                 <ConstraintInput label="Max DSPs" name="maxDsps" value={constraints.maxDsps} onChange={handleConstraintChange} placeholder="e.g., 8" />
                 <ConstraintInput label="Max BRAMs" name="maxBrams" value={constraints.maxBrams} onChange={handleConstraintChange} placeholder="e.g., 4" />
                 <div className="col-span-2">
                    <ConstraintInput label="Max Latency (cycles)" name="maxLatency" value={constraints.maxLatency} onChange={handleConstraintChange} placeholder="e.g., 20" />
                 </div>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-text-main flex items-center">
                    <ServerIcon className="w-5 h-5 mr-2" />
                    Hardware Emulation Targets
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                    Select multiple FPGA models for connectionless parallel synthesis emulation.
                </p>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 border border-border-main rounded-md p-3 bg-bg-main">
                    {fpgaTargets.map(({ vendor, families }) => (
                        <div key={vendor}>
                            <h4 className="text-xs font-bold text-text-secondary mb-2">{vendor}</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {families.map(target => (
                                    <div key={target} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`target-${target}`}
                                            checked={emulationTargets.includes(target)}
                                            onChange={() => handleToggleEmulationTarget(target)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`target-${target}`} className="ml-2 text-sm text-text-main cursor-pointer">{target.split(' ').slice(1).join(' ')}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface ConstraintInputProps {
    label: string; name: keyof OptimizationConstraints; value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}
const ConstraintInput: React.FC<ConstraintInputProps> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input id={name} name={name} type="text" value={value || ''} onChange={onChange} placeholder={placeholder}
               className="w-full p-2 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main" />
    </div>
);


export default AdvancedConfigPanel;
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface Option {
    label: string;
    value: string;
    disabled?: boolean;
}

interface CustomSelectProps {
    options: (Option | { group: string; items: Option[] })[];
    value: string;
    onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options
        .flatMap(opt => 'group' in opt ? opt.items : [opt])
        .find(opt => opt.value === value);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex-grow w-full p-2 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main text-sm flex items-center justify-between"
            >
                <span>{selectedOption?.label || 'Select...'}</span>
                <ChevronDownIcon className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-bg-panel border border-border-main rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {options.map((opt, index) => {
                        if ('group' in opt) {
                            return (
                                <div key={`group-${index}`}>
                                    <div className="px-3 py-2 text-xs font-bold text-text-secondary uppercase">{opt.group}</div>
                                    {opt.items.map(item => (
                                        <button
                                            key={item.value}
                                            onClick={() => handleSelect(item.value)}
                                            className={`w-full text-left px-4 py-2 text-sm ${item.value === value ? 'bg-primary text-primary-text' : 'text-text-main hover:bg-primary/10'}`}
                                            disabled={item.disabled}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <button
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`w-full text-left px-4 py-2 text-sm ${opt.value === value ? 'bg-primary text-primary-text' : 'text-text-main hover:bg-primary/10'}`}
                                disabled={opt.disabled}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;

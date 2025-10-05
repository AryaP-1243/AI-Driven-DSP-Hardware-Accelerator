
import React, { useState, useEffect, useRef } from 'react';
import { ProcessorIcon } from './icons/ProcessorIcon';
import { MenuIcon } from './icons/MenuIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { CheckIcon } from './icons/CheckIcon';
import { Theme } from '../types';

interface HeaderProps {
  currentUser: string | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const themes: { name: Theme, label: string }[] = [
    { name: 'dark', label: 'Dark' },
    { name: 'light', label: 'Light' },
    { name: 'ocean', label: 'Ocean' },
    { name: 'forest', label: 'Forest' },
    { name: 'sunset', label: 'Sunset' },
    { name: 'matrix', label: 'Matrix' },
    { name: 'dracula', label: 'Dracula' },
    { name: 'cyberpunk', label: 'Cyberpunk' },
    { name: 'solarized', label: 'Solarized' },
];

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onToggleSidebar, theme, setTheme }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-bg-panel border-b border-border-main p-4 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
            <button 
              onClick={onToggleSidebar} 
              className="p-2 rounded-full text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-text-main transition-colors mr-2 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle sidebar"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <ProcessorIcon className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-wide">
              AI-Driven DSP Hardware Accelerator
            </h1>
        </div>
        {currentUser && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <UserIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-text-main text-sm font-medium hidden sm:block">{currentUser}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-bg-panel border border-border-main rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-border-main mb-1">
                    <p className="text-sm text-text-secondary">Signed in as</p>
                    <p className="text-sm font-semibold text-text-main">{currentUser}</p>
                  </div>
                  <div className="py-1">
                    <div className="flex items-center px-4 py-2 text-sm text-text-secondary">
                      <PaletteIcon className="w-5 h-5 mr-3"/>
                      <span>Theme</span>
                    </div>
                    {themes.map(themeOption => (
                        <button
                            key={themeOption.name}
                            onClick={() => { setTheme(themeOption.name); setIsUserMenuOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${theme === themeOption.name ? 'font-semibold text-primary' : 'text-text-main'} hover:bg-primary/10 transition-colors`}
                        >
                            <span>{themeOption.label}</span>
                            {theme === themeOption.name && <CheckIcon className="w-4 h-4 text-primary" />}
                        </button>
                    ))}
                  </div>
                   <div className="border-t border-border-main">
                     <button
                        onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center px-4 py-2 text-sm text-text-main hover:bg-secondary-accent/10 hover:text-secondary-accent transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                   </div>
                </div>
              )}
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
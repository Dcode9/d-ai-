
import React, { useState, useEffect, useRef, forwardRef } from 'react';
import type { ModelType } from '../types';

interface HeaderProps {
    currentModel: ModelType;
    onModelChange: (model: ModelType) => void;
    onClearChat: () => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(({ currentModel, onModelChange, onClearChat, theme, onThemeToggle }, ref) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isDark = theme === 'dark';

    const handleModelSelect = (model: ModelType) => {
        onModelChange(model);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const modelDisplayName = currentModel === 'text' ? "D'Ai - 2.5" : "D'Ai - Paint 🍌";

    return (
        <header className="absolute top-0 left-0 right-0 p-3 z-10" ref={ref}>
            <div className="glass-panel p-2 rounded-3xl flex justify-between items-center">
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-xl sm:text-2xl font-bold text-[color:var(--text-primary)] ml-2">
                        <span>{modelDisplayName}</span>
                        <svg className="w-5 h-5 ml-2 text-[color:var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div 
                        className={`absolute top-full left-0 mt-2 w-48 dropdown-glass rounded-2xl shadow-lg dropdown-container ${isDropdownOpen ? 'dropdown-visible' : 'dropdown-hidden'}`}
                    >
                        <a href="#" onClick={(e) => { e.preventDefault(); handleModelSelect('text'); }} className="block px-4 py-2 text-[color:var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/20">D'Ai - 2.5</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleModelSelect('image'); }} className="block px-4 py-2 text-[color:var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/20">D'Ai - Paint 🍌</a>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="theme-toggle" className="sr-only peer" checked={isDark} onChange={onThemeToggle} />
                            <div className="flex items-center justify-between bg-gray-600/50 w-14 h-8 rounded-full p-1">
                                <svg className="w-6 h-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform peer-checked:translate-x-6"></div>
                        </div>
                    </label>
                    <button onClick={onClearChat} className="flex items-center text-[color:var(--text-primary)] font-semibold py-2 px-2 sm:px-4 rounded-2xl transition text-sm hover:bg-black/10 dark:hover:bg-white/20">
                        <svg className="w-5 h-5 mr-0 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        <span className="hidden sm:inline">Clear Chat</span>
                    </button>
                </div>
            </div>
        </header>
    );
});
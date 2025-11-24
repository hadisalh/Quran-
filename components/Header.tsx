import React from 'react';
import { Menu, Sun, Moon } from './icons';

interface HeaderProps {
  onMenuClick: () => void;
  activeViewLabel: string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, activeViewLabel, theme, toggleTheme }) => {
  return (
    <header className="w-full flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700/50 flex-shrink-0 bg-white dark:bg-slate-900 z-10 transition-colors duration-300">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors md:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="w-6 h-6 text-slate-600 dark:text-slate-200" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 md:mr-0 mr-2">
          {activeViewLabel}
        </h1>
      </div>
      
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700"
        aria-label={theme === 'dark' ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-600" />}
      </button>
    </header>
  );
};
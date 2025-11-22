import React from 'react';
import { Menu } from './icons';

interface HeaderProps {
  onMenuClick: () => void;
  activeViewLabel: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, activeViewLabel }) => {
  return (
    <header className="w-full flex justify-between items-center p-3 border-b border-slate-700/50 flex-shrink-0 bg-slate-900 z-10">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-full hover:bg-slate-700 transition-colors"
        aria-label="فتح القائمة"
      >
        <Menu className="w-6 h-6 text-slate-200" />
      </button>
      <h1 className="text-xl font-bold text-slate-100">
        {activeViewLabel}
      </h1>
    </header>
  );
};
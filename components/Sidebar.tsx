import React from 'react';
import type { View } from '../App';
import { X, Home, ChatBubble, Sparkles, Moon, ShieldCheck, ClipboardList, Clock, Scale } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: View;
  onViewChange: (view: View) => void;
  journalEntryCount: number;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-3 rounded-lg text-right transition-colors ${
      isActive
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
    {badge !== undefined && badge > 0 && (
        <span className="mr-auto bg-amber-500 text-white dark:text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeView, onViewChange, journalEntryCount }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/60 z-40 transition-opacity duration-300 md:hidden backdrop-blur-sm ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700/50 p-4 transform transition-transform duration-300 ease-in-out z-50 md:relative md:translate-x-0 md:w-64 md:border-l-0 md:border-r flex-shrink-0 shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-serif">آية ترشدك</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden transition-colors">
            <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        
        <nav className="flex flex-col gap-2 overflow-y-auto h-[calc(100%-80px)]">
            <NavItem 
                label="الرئيسية" 
                icon={<Home className="w-6 h-6" />}
                isActive={activeView === 'home'}
                onClick={() => onViewChange('home')}
            />
            <NavItem 
                label="الباحث القرآني" 
                icon={<ChatBubble className="w-6 h-6" />}
                isActive={activeView === 'chat'}
                onClick={() => onViewChange('chat')}
            />
            <NavItem 
                label="الاستشارة الإسلامية" 
                icon={<Scale className="w-6 h-6" />}
                isActive={activeView === 'consultation'}
                onClick={() => onViewChange('consultation')}
            />
            <NavItem 
                label="أوقات الصلاة" 
                icon={<Clock className="w-6 h-6" />}
                isActive={activeView === 'prayers'}
                onClick={() => onViewChange('prayers')}
            />
            <NavItem 
                label="أدعية وأذكار" 
                icon={<ShieldCheck className="w-6 h-6" />}
                isActive={activeView === 'adhkar'}
                onClick={() => onViewChange('adhkar')}
            />
            <NavItem 
                label="دفتر هدايتي" 
                icon={<ClipboardList className="w-6 h-6" />}
                isActive={activeView === 'journal'}
                onClick={() => onViewChange('journal')}
                badge={journalEntryCount}
            />
            <NavItem 
                label="الرقية الشرعية" 
                icon={<ShieldCheck className="w-6 h-6" />}
                isActive={activeView === 'ruqyah'}
                onClick={() => onViewChange('ruqyah')}
            />
            <NavItem 
                label="ركن الإلهام" 
                icon={<Sparkles className="w-6 h-6" />}
                isActive={activeView === 'inspiration'}
                onClick={() => onViewChange('inspiration')}
            />
            <NavItem 
                label="واحة السكينة" 
                icon={<Moon className="w-6 h-6" />}
                isActive={activeView === 'relax'}
                onClick={() => onViewChange('relax')}
            />
        </nav>
      </aside>
    </>
  );
};
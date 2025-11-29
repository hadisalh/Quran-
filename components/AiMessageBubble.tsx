import React, { useState, ReactNode } from 'react';
import { AyahCard } from './AyahCard';
import type { GuidanceResponse } from '../types';
import { Save, CircleUserRound, ClipboardList, Lightbulb, HeartHandshake, Quote, Check, Sparkles } from './icons';

interface AiMessageBubbleProps {
  guidance: GuidanceResponse;
  problem: string;
  addToJournal: (problem: string, guidance: GuidanceResponse) => void;
  showJournalButton: boolean;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-500 dark:text-slate-400 transition-colors"
            title="نسخ النص"
        >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <ClipboardList className="w-4 h-4" />}
        </button>
    );
};

const Section: React.FC<{ title: string; icon: ReactNode; children: ReactNode; colorClass: string }> = ({ title, icon, children, colorClass }) => (
  <div className="relative mb-8 last:mb-0">
    <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${colorClass} text-white shadow-md`}>
            {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 font-serif">{title}</h2>
    </div>
    <div className="mr-4 pr-4 border-r-2 border-slate-200 dark:border-slate-700/60 relative">
      {/* Decorative dot at top of border */}
      <div className={`absolute -right-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-900 ${colorClass}`}></div>
      {children}
    </div>
  </div>
);

export const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({ guidance, problem, addToJournal, showJournalButton }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    addToJournal(problem, guidance);
    setIsSaved(true);
  };

  return (
    <div className="flex items-start justify-start gap-3 animate-fade-in w-full">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg mt-1 border-2 border-white dark:border-slate-800">
        <Sparkles className="w-5 h-5 text-white" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tr-none p-6 w-full max-w-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative group">
        {/* Top decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>
        
        <p className="font-bold text-amber-600/80 dark:text-amber-400/80 text-xs mb-6 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            استجابة الباحث القرآني
        </p>
        
        <div className="space-y-8">
          <Section 
            title="آية تحاكي شعورك" 
            icon={<ClipboardList className="w-5 h-5"/>}
            colorClass="bg-blue-500"
          >
            <AyahCard ayah={guidance.descriptiveAyah} tafsirLabel="رسالة لك:" tafsirIcon={<Lightbulb className="w-4 h-4"/>} />
          </Section>

          <Section 
            title="نور وهداية" 
            icon={<Lightbulb className="w-5 h-5"/>}
            colorClass="bg-amber-500"
          >
            <AyahCard ayah={guidance.solutionAyah} tafsirLabel="التوجيه الرباني:" tafsirIcon={<Check className="w-4 h-4"/>} />
          </Section>

          <Section 
            title="خطوات عملية" 
            icon={<HeartHandshake className="w-5 h-5"/>}
            colorClass="bg-emerald-500"
          >
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-5 relative">
              <CopyButton text={guidance.advice.map(a => `- ${a}`).join('\n')} />
              <ul className="space-y-4 mt-2">
                {guidance.advice.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm">
                        {index + 1}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section 
            title="دعاء يناجي قلبك" 
            icon={<Quote className="w-5 h-5"/>}
            colorClass="bg-purple-500"
          >
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 border border-purple-100 dark:border-slate-700 rounded-xl p-8 text-center relative overflow-hidden group shadow-inner">
               <CopyButton text={guidance.dua} />
               <Quote className="absolute top-2 right-4 w-10 h-10 text-purple-200 dark:text-slate-700 opacity-50" />
               <Quote className="absolute bottom-2 left-4 w-10 h-10 text-purple-200 dark:text-slate-700 opacity-50 transform rotate-180" />
              <p className="text-slate-800 dark:text-slate-200 text-xl font-serif italic leading-loose relative z-10 drop-shadow-sm">"{guidance.dua}"</p>
            </div>
          </Section>
          
          {showJournalButton && (
            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700 mt-6">
              <button 
                onClick={handleSave} 
                disabled={isSaved}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all transform active:scale-95 shadow-md ${
                    isSaved 
                    ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' 
                    : 'bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 border border-slate-200 hover:border-amber-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'
                }`}
              >
                {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                <span>{isSaved ? 'تم الحفظ في دفتر هدايتي' : 'حفظ في دفتر هدايتي'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
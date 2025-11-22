import React, { useState, ReactNode } from 'react';
import { AyahCard } from './AyahCard';
import type { GuidanceResponse } from '../types';
import { Save, CircleUserRound, ClipboardList, Lightbulb, HeartHandshake, Quote } from './icons';

interface AiMessageBubbleProps {
  guidance: GuidanceResponse;
  problem: string;
  addToJournal: (problem: string, guidance: GuidanceResponse) => void;
  showJournalButton: boolean;
}

const Section: React.FC<{ title: string; icon: ReactNode; children: ReactNode }> = ({ title, icon, children }) => (
  <div className="relative pl-8">
    <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700">
      {icon}
    </div>
    <div className="pt-1 pb-4 border-r-2 border-slate-700/60 pr-8">
      <h2 className="text-lg sm:text-xl font-bold mb-3 text-amber-400">{title}</h2>
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
    <div className="flex items-start justify-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
        <CircleUserRound className="w-6 h-6 text-amber-300" />
      </div>

      <div className="bg-slate-800 rounded-xl rounded-bl-none p-4 w-full max-w-2xl">
        <p className="font-bold text-slate-300 mb-4">هادي</p>
        <div className="space-y-2">
          <Section title="آية تصف حالتك" icon={<ClipboardList className="w-5 h-5 text-amber-400"/>}>
            <AyahCard ayah={guidance.descriptiveAyah} />
          </Section>

          <Section title="آية تحمل الحل" icon={<Lightbulb className="w-5 h-5 text-amber-400"/>}>
            <AyahCard ayah={guidance.solutionAyah} />
          </Section>

          <Section title="نصائح إيمانية" icon={<HeartHandshake className="w-5 h-5 text-amber-400"/>}>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <ul className="space-y-3">
                {guidance.advice.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1">✦</span>
                    <p className="text-slate-200 text-sm sm:text-base">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section title="دعاء مقترح" icon={<Quote className="w-5 h-5 text-amber-400"/>}>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-center">
              <p className="text-slate-200 sm:text-lg italic">"{guidance.dua}"</p>
            </div>
          </Section>
          
          {showJournalButton && (
            <div className="text-center pt-4 pr-8">
              <button 
                onClick={handleSave} 
                disabled={isSaved}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-green-800/50 disabled:cursor-not-allowed transition-colors text-slate-100 disabled:text-green-300"
              >
                <Save className="w-5 h-5" />
                <span>{isSaved ? 'تم الحفظ في دفتر هدايتي' : 'حفظ في دفتر هدايتي'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
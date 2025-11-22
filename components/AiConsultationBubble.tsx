import React from 'react';
import { Scale } from './icons';

interface AiConsultationBubbleProps {
  text: string;
}

export const AiConsultationBubble: React.FC<AiConsultationBubbleProps> = ({ text }) => {
  return (
    <div className="flex items-start justify-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
        <Scale className="w-6 h-6 text-amber-300" />
      </div>

      <div className="bg-slate-800 rounded-xl rounded-bl-none p-4 w-full max-w-2xl">
        <p className="font-bold text-slate-300 mb-4">فقيه</p>
        <div className="text-slate-200 space-y-3 leading-relaxed">
          {/* Using whitespace-pre-wrap to respect newlines and formatting from the AI response */}
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    </div>
  );
};
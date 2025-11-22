import React from 'react';
import { CircleUserRound } from './icons';

export const AiTypingBubble: React.FC = () => {
  return (
    <div className="flex items-end justify-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
        <CircleUserRound className="w-6 h-6 text-amber-300" />
      </div>
      <div className="bg-slate-800 rounded-xl rounded-bl-none p-4 max-w-xs">
        <div className="flex items-center justify-center space-x-1.5" aria-label="هادي يكتب الآن">
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};
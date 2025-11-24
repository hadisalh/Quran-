import React, { useState, useEffect } from 'react';
import { Check, RotateCcw } from './icons';

interface DhikrCounterProps {
  countString: string;
  storageKey: string; // New prop for persistence
  resetTrigger: number; // Prop to trigger reset from parent
}

// Returns the target number, or null for an open-ended counter.
const parseTargetCount = (str: string): number | null => {
  if (str.includes('مرة واحدة')) return 1;
  if (str.includes('ثلاث مرات')) return 3;
  if (str.includes('سبع مرات')) return 7;
  if (str.includes('عشر مرات')) return 10;
  if (str.includes('ثلاث وثلاثون') || str.includes('ثلاث وثلاثين') || str.includes('33')) return 33;
  if (str.includes('مئة') || str.includes('100')) return 100;
  return null; // For "يكثر منها", contextual, etc.
};

export const DhikrCounter: React.FC<DhikrCounterProps> = ({ countString, storageKey, resetTrigger }) => {
  const target = parseTargetCount(countString);
  const [currentCount, setCurrentCount] = useState(0);

  // Load from storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCurrentCount(parseInt(saved, 10));
      }
    } catch (e) {
      console.error("Error loading counter", e);
    }
  }, [storageKey]);

  // Listen for global reset trigger
  useEffect(() => {
      if (resetTrigger > 0) {
          setCurrentCount(0);
          try {
            localStorage.removeItem(storageKey);
          } catch (e) {
            console.error("Error clearing counter", e);
          }
      }
  }, [resetTrigger, storageKey]);

  // Completion is only relevant for counters with a specific target.
  const isCompleted = target !== null && currentCount >= target;

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (target !== null && currentCount + 1 === target) {
            navigator.vibrate([50, 50, 50]); // Success vibration
        } else {
            navigator.vibrate(10); // Click vibration
        }
    }

    if (target === null || currentCount < target) {
      const newCount = currentCount + 1;
      setCurrentCount(newCount);
      try {
        localStorage.setItem(storageKey, newCount.toString());
      } catch (e) {
         console.error("Error saving counter", e);
      }
    }
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    setCurrentCount(0);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
       console.error("Error removing counter", e);
    }
  };
  
  // Progress calculation for background fill
  const progressPercent = target ? Math.min((currentCount / target) * 100, 100) : 0;

  if (target !== null) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={increment}
          disabled={isCompleted}
          className={`relative w-32 h-11 flex items-center justify-center rounded-lg text-sm font-bold transition-all overflow-hidden border shadow-sm select-none ${
            isCompleted 
              ? 'bg-green-600 text-white border-green-500 cursor-default shadow-green-900/50' 
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-amber-500 dark:hover:border-amber-500 active:scale-95'
          }`}
          aria-label={`عداد الذكر. الحالي: ${currentCount} من ${target}`}
        >
            {/* Progress Background */}
            {!isCompleted && (
                <div 
                    className="absolute right-0 top-0 h-full bg-amber-100 dark:bg-amber-500/20 transition-all duration-200 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            )}

            <div className="relative z-10 flex items-center gap-2">
                {isCompleted ? (
                    <>
                        <Check className="w-5 h-5" />
                        <span>اكتمل</span>
                    </>
                ) : (
                    <span className="font-sans font-bold text-lg flex items-baseline gap-1">
                        {currentCount.toLocaleString('ar-EG')} 
                        <span className="text-xs font-normal opacity-60">/ {target.toLocaleString('ar-EG')}</span>
                    </span>
                )}
            </div>
        </button>
        
        {/* Reset button shown if count > 0, even if completed */}
        {currentCount > 0 && (
          <button 
              onClick={reset} 
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-white text-slate-400 transition-colors"
              aria-label="إعادة تعيين العداد"
          >
              <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // This is for open-ended or contextual dhikr.
  return (
     <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
            <button
              onClick={increment}
              className="min-w-[5rem] h-11 px-4 flex items-center justify-center rounded-lg text-sm font-bold transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-amber-500 active:scale-95 shadow-sm"
              aria-label={`عداد الذكر المفتوح. الحالي: ${currentCount}`}
            >
              <span className="font-sans text-xl">{currentCount.toLocaleString('ar-EG')}</span>
            </button>
            {currentCount > 0 && (
              <button 
                  onClick={reset} 
                  className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-white text-slate-400 transition-colors"
                  aria-label="إعادة تعيين العداد"
              >
                  <RotateCcw className="w-4 h-4" />
              </button>
            )}
        </div>
        <span className="text-amber-600 dark:text-amber-400/80 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-md text-xs border border-amber-200 dark:border-amber-500/20 font-bold">{countString}</span>
    </div>
  );
};
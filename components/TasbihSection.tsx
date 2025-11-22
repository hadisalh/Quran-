
import React, { useState, useEffect } from 'react';
import { RotateCcw } from './icons';

const TASBIH_STORAGE_KEY = 'ayah-guidance-tasbih-total';

export const TasbihSection: React.FC = () => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<number | 'open'>(33);
  const [totalLifetime, setTotalLifetime] = useState(0);

  useEffect(() => {
    const savedTotal = localStorage.getItem(TASBIH_STORAGE_KEY);
    if (savedTotal) {
      setTotalLifetime(parseInt(savedTotal, 10));
    }
  }, []);

  const handleIncrement = () => {
    // Haptic feedback if available
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
    }

    setCount(prev => {
      const next = prev + 1;
      if (target !== 'open' && next > target) {
        // Loop back to 1
        if (navigator.vibrate) navigator.vibrate([50, 50]); // Double vibration on lap
        return 1; 
      }
      return next;
    });

    const newTotal = totalLifetime + 1;
    setTotalLifetime(newTotal);
    localStorage.setItem(TASBIH_STORAGE_KEY, newTotal.toString());
  };

  const handleReset = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
    }
    setCount(0);
  };

  const handleTargetChange = (newTarget: number | 'open') => {
    setTarget(newTarget);
    setCount(0);
  };

  // Calculate progress percentage for the circle
  const progress = target === 'open' ? 100 : Math.min((count / target) * 100, 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8 text-center shadow-lg animate-fade-in relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 relative z-10 gap-4">
        <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
          <span>📿</span> ركن التسبيح
        </h2>
        <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-400 shadow-inner">
            مجموع تسبيحاتك: <span className="text-amber-400 font-bold text-base mr-1">{totalLifetime.toLocaleString('ar-EG')}</span>
        </div>
      </div>

      {/* Target Selectors */}
      <div className="flex justify-center gap-2 mb-8 relative z-10 flex-wrap">
        {[33, 100, 1000, 'open'].map((t) => (
            <button
                key={t}
                onClick={() => handleTargetChange(t as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                    target === t 
                    ? 'bg-amber-500 text-slate-900 border-amber-500 scale-105 shadow-lg shadow-amber-500/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-600 hover:border-slate-400'
                }`}
            >
                {t === 'open' ? 'مفتوح' : t}
            </button>
        ))}
      </div>

      {/* Main Circular Counter */}
      <div className="relative w-56 h-56 mx-auto mb-6 cursor-pointer group select-none tap-highlight-transparent" onClick={handleIncrement}>
         {/* SVG Circle Progress */}
        <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
            {/* Background Circle */}
            <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-700/50"
            />
            {/* Progress Circle */}
            <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`text-amber-500 transition-all duration-300 ease-out ${target === 'open' ? 'opacity-20' : 'opacity-100'}`}
            />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full m-4 group-active:scale-95 transition-transform duration-100">
            <div className="absolute inset-0 bg-slate-800/30 rounded-full backdrop-blur-[2px]"></div>
            <span className="relative text-7xl font-bold text-slate-100 font-sans tracking-wider drop-shadow-lg select-none">
                {count.toLocaleString('ar-EG')}
            </span>
            {target !== 'open' && (
                <span className="relative text-sm text-slate-400 mt-2 font-bold bg-slate-900/60 px-3 py-0.5 rounded-full">
                    من {target.toLocaleString('ar-EG')}
                </span>
            )}
            <p className="relative text-xs text-amber-500/70 mt-2 animate-pulse">اضغط للعد</p>
        </div>
        
        {/* Ripple effect hint ring */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/0 group-active:border-amber-500/30 group-active:scale-95 transition-all duration-100 pointer-events-none"></div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); handleReset(); }}
        className="flex items-center gap-2 mx-auto px-5 py-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors hover:text-white border border-transparent hover:border-slate-500"
        aria-label="تصفير العداد"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm">تصفير العداد الحالي</span>
      </button>
    </div>
  );
};

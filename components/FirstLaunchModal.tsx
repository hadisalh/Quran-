import React, { useState, useEffect } from 'react';
import { Sparkles, HeartHandshake } from './icons';

export const FirstLaunchModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the modal every time the component mounts (app start or refresh)
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity duration-500 animate-fade-in"
        onClick={handleClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-slate-900 w-full max-w-md rounded-3xl p-[2px] shadow-2xl animate-[fadeIn_0.7s_ease-out_forwards] transform">
        
        {/* Animated Gradient Border effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rounded-3xl opacity-40 animate-pulse"></div>
        
        <div className="relative bg-slate-900 rounded-[22px] p-6 sm:p-8 text-center border border-amber-500/20 h-full">
            
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-slate-400 text-sm font-medium tracking-wide mb-1">تمت البرمجة بواسطة</h2>
                
                {/* Fixed clipping by adding padding-y and relaxed leading */}
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-serif mb-6 drop-shadow-sm py-3 leading-normal">
                    الأستاذ هادي الدليمي
                </h1>

                <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-8 relative group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-amber-500 rounded-full border border-slate-800">
                        <HeartHandshake className="w-6 h-6" />
                    </div>
                    <p className="text-slate-300 font-ui text-xl leading-relaxed italic pt-2">
                        "لا تنساني من الدعاء لي ولوالدي"
                    </p>
                </div>

                <button 
                    onClick={handleClose}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                    الدخول للتطبيق
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
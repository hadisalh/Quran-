import React, { useState, useEffect } from 'react';
import { X } from './icons';

const WELCOME_KEY = 'ayah-guidance-welcome-shown';

export const WelcomeToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const hasBeenShown = localStorage.getItem(WELCOME_KEY);
      if (!hasBeenShown) {
        setIsVisible(true);
      }
    } catch (e) {
      console.error("Failed to access localStorage", e);
      // Fallback to show it if localStorage is unavailable
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(WELCOME_KEY, 'true');
    } catch (e) {
      console.error("Failed to set item in localStorage", e);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-amber-400/50 shadow-2xl rounded-lg p-4 max-w-sm animate-fade-in z-50">
      <button onClick={handleClose} className="absolute top-2 left-2 p-1 text-slate-400 hover:text-white">
        <X className="w-5 h-5" />
      </button>
      <div className="text-center">
        <p className="text-slate-100 font-bold">
          تم تطوير التطبيق بواسطة
          <br/>
          <span className="text-amber-300">هادي صالح الدليمي</span>
        </p>
        <p className="text-slate-400 mt-2 text-sm">
          لاتنساني من الدعاء لي ولوالدي
        </p>
      </div>
    </div>
  );
};
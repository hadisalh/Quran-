import React, { useState, useEffect } from 'react';

const FIRST_LAUNCH_KEY = 'ayah-guidance-first-launch-shown';

export const FirstLaunchModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const hasBeenShown = localStorage.getItem(FIRST_LAUNCH_KEY);
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
      localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
    } catch (e) {
      console.error("Failed to set item in localStorage", e);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-800 border border-amber-400/50 shadow-2xl rounded-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-4">
          تم تطوير التطبيق بواسطة
          <br/>
          <span className="text-amber-300">الأستاذ هادي الدليمي</span>
        </h2>
        <p className="text-slate-300 mb-6">
          لاتنساني من الدعاء لي ولوالدي
        </p>
        <button 
          onClick={handleClose}
          className="w-full px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-bold hover:bg-amber-600 transition-colors"
        >
          حسناً
        </button>
      </div>
    </div>
  );
};

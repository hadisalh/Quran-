import React, { useState, useEffect } from 'react';
import { X, Check } from './icons';

// SVG Icons for the install UI
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mx-1"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);

const PlusSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mx-1"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
);

export const InstallPwa: React.FC = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
            setIsInstalled(true);
            return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Detect Android/Chrome install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        
        window.addEventListener('beforeinstallprompt', handler);

        // Show iOS prompt once per session if not installed
        if (ios && !localStorage.getItem('ios-install-prompt-shown')) {
             setTimeout(() => setShowIOSPrompt(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                setSupportsPWA(false);
            }
            setPromptInstall(null);
        });
    };

    const closeIOSPrompt = () => {
        setShowIOSPrompt(false);
        localStorage.setItem('ios-install-prompt-shown', 'true');
    };

    // Don't render if already installed
    if (isInstalled) return null;

    return (
        <>
            {/* Android / Desktop Install Button */}
            {supportsPWA && (
                <div className="fixed bottom-20 left-4 z-50 animate-fade-in">
                    <button
                        onClick={handleInstallClick}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-3 rounded-full shadow-lg font-bold transition-transform hover:scale-105 active:scale-95 border-2 border-white dark:border-slate-800"
                    >
                        <DownloadIcon />
                        <span>تثبيت التطبيق</span>
                    </button>
                </div>
            )}

            {/* iOS Install Instructions Modal */}
            {showIOSPrompt && isIOS && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeIOSPrompt}>
                    <div 
                        className="bg-slate-100 dark:bg-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl relative animate-[fadeIn_0.5s_ease-out_forwards]"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={closeIOSPrompt} className="absolute top-3 left-3 p-1 text-slate-400">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                                <img src="/icon.svg" alt="App Icon" className="w-10 h-10" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">تثبيت "آية ترشدك"</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                                لتثبيت التطبيق على جهاز الآيفون الخاص بك والوصول إليه بسرعة بدون إنترنت:
                            </p>

                            <div className="w-full space-y-3 text-right text-sm text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                    <span className="font-bold text-amber-500">1</span>
                                    <span>اضغط على زر المشاركة <ShareIcon /> في الأسفل</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                    <span className="font-bold text-amber-500">2</span>
                                    <span>اختر <PlusSquareIcon /> <strong>إضافة إلى الصفحة الرئيسية</strong></span>
                                </div>
                                 <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                    <span className="font-bold text-amber-500">3</span>
                                    <span>اضغط على <strong>إضافة</strong> في الأعلى</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={closeIOSPrompt}
                                className="mt-6 w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold"
                            >
                                فهمت ذلك
                            </button>
                        </div>
                        
                        {/* Little arrow pointing down to the share button area on iPhone */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-100 dark:bg-slate-800 rotate-45"></div>
                    </div>
                </div>
            )}
        </>
    );
};
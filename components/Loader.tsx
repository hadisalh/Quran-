
import React from 'react';

const loadingMessages = [
    "يتم البحث عن النور...",
    "لحظات من التأمل...",
    "تُفتح أبواب الحكمة...",
    "قلبك يستمع للرحمن...",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex justify-center items-center gap-4 my-4 animate-fade-in">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 transition-opacity duration-500">{message}</p>
        </div>
    );
};
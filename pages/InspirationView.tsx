import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Loader2, RotateCcw } from '../components/icons';
import { getInspiration } from '../services/inspirationService';
import type { Inspiration } from '../types';
import { AyahCard } from '../components/AyahCard';
import { ErrorMessageBubble } from '../components/ErrorMessageBubble';

const inspiringAyahsPool = [
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", source: "الرعد: 28" },
  { text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", source: "الطلاق: 3" },
  { text: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا", source: "التوبة: 40" },
  { text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", source: "الشرح: 5" },
  { text: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", source: "البقرة: 216" },
  { text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", source: "الضحى: 5" },
  { text: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", source: "الحديد: 4" },
  { text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", source: "البقرة: 286" },
  { text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", source: "البقرة: 153" },
  { text: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", source: "غافر: 60" },
  { text: "وَمَا تَسْقُطُ مِن وَرَقَةٍ إِلَّا يَعْلَمُهَا", source: "الأنعام: 59" },
  { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", source: "الطلاق: 2" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ", source: "البقرة: 152" },
  { text: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", source: "الزمر: 53" },
  { text: "وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ", source: "الأنفال: 33" },
  { text: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ", source: "يوسف: 86" },
  { text: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", source: "ق: 16" },
  { text: "فَصَبْرٌ جَمِيلٌ ۖ وَاللَّهُ الْمُسْتَعَانُ", source: "يوسف: 18" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


export const InspirationView: React.FC = () => {
    const [inspiration, setInspiration] = useState<Inspiration | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inspirationHistory, setInspirationHistory] = useState<string[]>([]);

    const selectedAyahs = useMemo(() => shuffleArray(inspiringAyahsPool).slice(0, 6), []);

    const fetchNewInspiration = async (currentHistory: string[]) => {
        setIsLoading(true);
        setError(null);
        setInspiration(null);
        try {
            const result = await getInspiration(currentHistory);
            setInspiration(result);
            setInspirationHistory(prev => [result.ayahText, ...prev].slice(0, 5));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Initial fetch with empty history
        fetchNewInspiration([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleButtonClick = () => {
        // Subsequent fetches with current history
        fetchNewInspiration(inspirationHistory);
    };

    return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-amber-400">ركن الإلهام</h1>
        </div>
        <p className="text-slate-300 mb-6 text-center max-w-3xl mx-auto">
            دع الكلمات الربانية تضيء يومك وتلهم قلبك. اطلب إلهامًا جديدًا كلما احتجت إلى جرعة من الأمل والسكينة.
        </p>

        <div className="flex flex-col items-center justify-center space-y-6 my-4 min-h-[350px]">
            {isLoading && (
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-3 animate-fade-in">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
                    <p>جاري البحث عن إلهام يلامس روحك...</p>
                </div>
            )}
            
            {!isLoading && error && (
                <div className="w-full max-w-2xl animate-fade-in">
                    <ErrorMessageBubble message={error} />
                </div>
            )}

            {!isLoading && inspiration && (
                <div className="w-full max-w-3xl animate-fade-in">
                    <AyahCard 
                        ayah={{
                            text: inspiration.ayahText,
                            surahName: inspiration.surahName,
                            surahNumber: inspiration.surahNumber,
                            ayahNumber: inspiration.ayahNumber,
                            tafsir: inspiration.reflection
                        }} 
                        tafsirLabel="تأملات:"
                        tafsirIcon={<Sparkles className="w-5 h-5"/>}
                    />
                </div>
            )}

             <button
                onClick={handleButtonClick}
                disabled={isLoading}
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
                <RotateCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>اطلب إلهامًا جديدًا</span>
            </button>
        </div>
        
         <div className="mt-12 border-t border-slate-700/50 pt-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-300">آيات مختارة</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {selectedAyahs.map((card, index) => (
                    <div key={index} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-amber-500/10 flex flex-col justify-center items-center text-center aspect-square animate-fade-in">
                        <p className="quran-text text-amber-300 mb-4 text-2xl" lang="ar">
                            {card.text}
                        </p>
                        <p className="text-slate-400 text-sm">
                            (سورة {card.source})
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

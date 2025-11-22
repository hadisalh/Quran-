import React, { useState, useRef, useEffect } from 'react';
import { Moon, Play, Pause, Loader2, Search } from '../components/icons';
import { quranData } from '../data/quran';

// Create the list of surahs dynamically from the full Quran data
const allSurahs = quranData.map(s => ({
    id: s.number.toString(),
    title: s.name,
    reciter: 'مشاري العفاسي',
    surah: s.number
}));

export const RelaxView: React.FC = () => {
    const [activeSurah, setActiveSurah] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackRef = useRef<{ surah: number; nextAyah: number; totalAyahs: number; } | null>(null);

    const filteredSurahs = allSurahs.filter(surah =>
        surah.title.includes(searchTerm)
    );

    const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

    const stopPlayback = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setActiveSurah(null);
        setIsLoading(null);
        currentTrackRef.current = null;
    };
    
    const playAyah = (surah: number, ayah: number) => {
        const surahPadded = zeroPad(surah, 3);
        const ayahPadded = zeroPad(ayah, 3);
        const audioUrl = `https://verses.quran.com/Alafasy/mp3/${surahPadded}${ayahPadded}.mp3`;
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = handleAyahEnded;
        audioRef.current.onerror = (e) => {
            console.error(`Failed to load audio for ${surah}:${ayah}`, e);
            handleAyahEnded(); // Skip to next on error
        };

        const playPromise = audioRef.current.play();
        if (playPromise) {
            playPromise.then(() => {
                setIsLoading(null);
                setIsPlaying(true);
            }).catch(error => {
                console.error("Error playing audio:", error);
                stopPlayback();
            });
        }
    };
    
    const handleAyahEnded = () => {
        if (!currentTrackRef.current) return;

        const { surah, nextAyah, totalAyahs } = currentTrackRef.current;
        if (nextAyah > totalAyahs) {
            stopPlayback();
        } else {
            currentTrackRef.current.nextAyah++;
            playAyah(surah, nextAyah);
        }
    };

    const startPlayback = (track: { surah: number; }) => {
        stopPlayback();
        const surahData = quranData.find(s => s.number === track.surah);
        if (!surahData) return;

        setActiveSurah(track.surah);
        setIsLoading(track.surah);

        currentTrackRef.current = {
            surah: track.surah,
            nextAyah: 1,
            totalAyahs: surahData.numberOfAyahs,
        };

        const hasBismillah = track.surah !== 1 && track.surah !== 9;
        
        if (hasBismillah) {
            audioRef.current = new Audio('https://verses.quran.com/Alafasy/mp3/001001.mp3');
            audioRef.current.onended = () => playAyah(track.surah, 1);
            audioRef.current.onerror = () => playAyah(track.surah, 1); // Skip if bismillah fails
            audioRef.current.play().catch(e => {
                console.error("Error playing Bismillah", e);
                playAyah(track.surah, 1);
            });
        } else {
            playAyah(track.surah, 1);
        }
    };

    const togglePlay = (track: typeof allSurahs[0]) => {
        if (activeSurah === track.surah) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play().then(() => setIsPlaying(true));
            }
        } else {
            startPlayback(track);
        }
    };

    useEffect(() => {
        return () => stopPlayback();
    }, []);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
                <Moon className="w-8 h-8 text-amber-400" />
                <h1 className="text-3xl font-bold text-amber-400">واحة السكينة</h1>
            </div>
            
            <div className="relative mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن سورة..."
                    className="w-full p-3 pr-10 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-slate-100 placeholder-slate-500"
                />
                <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>

            <p className="text-slate-400 mb-4 text-sm">استرخِ مع تلاوات عطرة تهدئ النفس وتريح القلب.</p>
            
            <div className="overflow-y-auto flex-grow space-y-3">
                {filteredSurahs.length > 0 ? (
                    filteredSurahs.map(surah => {
                        const isActive = activeSurah === surah.surah;
                        const isBuffering = isLoading === surah.surah;
                        return (
                            <div key={surah.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center transition-colors hover:bg-slate-800">
                                <div>
                                    <h3 className="text-md font-bold text-slate-100">{surah.title}</h3>
                                    <p className="text-xs text-slate-400">{surah.reciter}</p>
                                </div>
                                <button
                                    onClick={() => togglePlay(surah)}
                                    disabled={isBuffering}
                                    className="p-2.5 rounded-full bg-amber-500 text-slate-900 hover:bg-amber-600 transition-transform transform hover:scale-110 disabled:bg-slate-600"
                                    aria-label={isActive && isPlaying ? 'إيقاف' : 'تشغيل'}
                                >
                                    {isBuffering ? <Loader2 className="w-5 h-5 animate-spin"/> : (isActive && isPlaying) ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-slate-400 pt-10">
                        <p>لم يتم العثور على السورة المطلوبة.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

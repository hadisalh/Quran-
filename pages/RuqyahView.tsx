import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Play, Pause, Loader2 } from '../components/icons';
import { quranData } from '../data/quran';

const ruqyahItems = [
  { id: 'fatiha', title: "سورة الفاتحة", reciter: "مشاري العفاسي", surah: 1, type: 'surah' as const },
  { id: 'kursi', title: "آية الكرسي", reciter: "مشاري العفاسي", surah: 2, ayah: 255, type: 'ayah' as const },
  { id: 'ikhlas', title: "سورة الإخلاص", reciter: "مشاري العفاسي", surah: 112, type: 'surah' as const },
  { id: 'falaq', title: "سورة الفلق", reciter: "مشاري العفاسي", surah: 113, type: 'surah' as const },
  { id: 'nas', title: "سورة الناس", reciter: "مشاري العفاسي", surah: 114, type: 'surah' as const },
];

export const RuqyahView: React.FC = () => {
    const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackRef = useRef<{ id: string; type: 'surah' | 'ayah'; surah: number; nextAyah: number; totalAyahs: number; } | null>(null);

    const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

    const stopPlayback = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = ''; // Release resource
            audioRef.current.load();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setActiveTrackId(null);
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
            if (currentTrackRef.current?.type === 'surah') {
                handleAyahEnded(); // Skip to next on error for surahs
            } else {
                stopPlayback();
            }
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
        if (!currentTrackRef.current || currentTrackRef.current.type !== 'surah') {
            stopPlayback();
            return;
        }

        const { surah, nextAyah, totalAyahs } = currentTrackRef.current;
        if (nextAyah > totalAyahs) {
            stopPlayback();
        } else {
            currentTrackRef.current.nextAyah++;
            playAyah(surah, nextAyah);
        }
    };

    const startPlayback = (track: typeof ruqyahItems[0]) => {
        stopPlayback();
        setActiveTrackId(track.id);
        setIsLoading(track.id);

        if (track.type === 'ayah' && track.ayah) {
            currentTrackRef.current = null;
            playAyah(track.surah, track.ayah);
        } else {
            const surahData = quranData.find(s => s.number === track.surah);
            if (!surahData) return;

            currentTrackRef.current = {
                id: track.id,
                type: 'surah',
                surah: track.surah,
                nextAyah: 1,
                totalAyahs: surahData.numberOfAyahs,
            };

            const hasBismillah = track.surah !== 1 && track.surah !== 9;
            if (hasBismillah) {
                audioRef.current = new Audio('https://verses.quran.com/Alafasy/mp3/001001.mp3');
                audioRef.current.onended = () => playAyah(track.surah, 1);
                audioRef.current.onerror = () => playAyah(track.surah, 1);
                audioRef.current.play().catch(e => {
                    console.error("Error playing Bismillah", e);
                    playAyah(track.surah, 1);
                });
            } else {
                playAyah(track.surah, 1);
            }
        }
    };

    const togglePlay = (track: typeof ruqyahItems[0]) => {
        if (activeTrackId === track.id) {
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
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
                <h1 className="text-3xl font-bold text-amber-400">الرقية الشرعية</h1>
            </div>
            <div className="overflow-y-auto flex-grow">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-100 mb-2">ما هي الرقية الشرعية؟</h2>
                    <p className="text-slate-300 leading-relaxed">
                        هي مجموعة من الآيات القرآنية والأدعية النبوية التي يتلوها المسلم على نفسه أو على غيره طلبًا للشفاء من الأمراض الجسدية والنفسية، وللحماية من العين والحسد والسحر بإذن الله تعالى. أساسها التوكل على الله واليقين بأنه هو الشافي.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-slate-200 mb-4">أركان الرقية الأساسية</h2>
                <div className="space-y-4">
                    {ruqyahItems.map(item => {
                        const isActive = activeTrackId === item.id;
                        const isBuffering = isLoading === item.id;
                        return (
                            <div key={item.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center transition-colors hover:bg-slate-800 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
                                    <p className="text-sm text-slate-400">{item.reciter}</p>
                                </div>
                                <button
                                    onClick={() => togglePlay(item)}
                                    disabled={isBuffering}
                                    className="p-3 rounded-full bg-amber-500 text-slate-900 hover:bg-amber-600 transition-transform transform hover:scale-110 disabled:bg-slate-600"
                                    aria-label={isActive && isPlaying ? 'إيقاف' : 'تشغيل'}
                                >
                                    {isBuffering ? <Loader2 className="w-5 h-5 animate-spin"/> : (isActive && isPlaying) ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                                </button>
                            </div>
                        );
                    })}
                </div>
                 <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mt-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-100 mb-2">كيفية الرقية</h2>
                    <ul className="text-slate-300 list-disc pr-6 space-y-2">
                        <li>الطهارة والوضوء.</li>
                        <li>استقبال القبلة.</li>
                        <li>ضع يدك على مكان الألم أو على رأس المريض.</li>
                        <li>اقرأ الآيات والأدعية بخشوع ويقين بالشفاء من الله.</li>
                        <li>انفث (نفخ خفيف مع قليل من الريق) بعد القراءة على مكان الألم أو على اليدين وامسح بهما الجسد.</li>
                        <li>كرر القراءة ثلاث مرات أو أكثر حسب الحاجة.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

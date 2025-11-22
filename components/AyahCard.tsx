import React, { useState, useRef, useEffect } from 'react';
import type { Ayah } from '../types';
import { Play, Pause, Loader2 } from './icons';

interface AyahCardProps {
  ayah: Ayah;
  tafsirLabel?: string;
  tafsirIcon?: React.ReactNode;
}

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

export const AyahCard: React.FC<AyahCardProps> = ({ ayah, tafsirLabel = "التفسير الميسر:", tafsirIcon = null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async () => {
    // Do not attempt to play audio for placeholder ayahs (like the welcome message)
    if (ayah.surahNumber === 0) return;

    if (!audioRef.current) {
      const surahPadded = zeroPad(ayah.surahNumber, 3);
      const ayahPadded = zeroPad(ayah.ayahNumber, 3);
      const audioUrl = `https://verses.quran.com/Alafasy/mp3/${surahPadded}${ayahPadded}.mp3`;
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        console.error(`Failed to load audio for ${ayah.surahName}:${ayah.ayahNumber}`);
        setIsPlaying(false);
        setIsAudioLoading(false);
        // Reset on error to allow retry
        audioRef.current = null;
      };
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsAudioLoading(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            // Reset on error to allow retry
            audioRef.current = null;
          })
          .finally(() => {
            setIsAudioLoading(false);
          });
      }
    }
  };
  
  // Cleanup audio element on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow hover:shadow-amber-500/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-200">
          سورة {ayah.surahName} - الآية {ayah.ayahNumber}
        </h3>
        <button 
          onClick={togglePlay} 
          disabled={isAudioLoading || ayah.surahNumber === 0}
          className="p-2 rounded-full bg-slate-700 hover:bg-amber-500 hover:text-slate-900 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
        >
          {isAudioLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
      </div>
      <p className="quran-text text-center text-amber-300 mb-6" lang="ar">
        {ayah.text}
      </p>
      {ayah.tafsir && (
        <div className="border-t border-slate-700 pt-4">
            <h4 className="font-bold text-lg text-amber-400 mb-2 flex items-center gap-2">
                {tafsirIcon}
                <span>{tafsirLabel}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed italic">{ayah.tafsir}</p>
        </div>
      )}
    </div>
  );
};
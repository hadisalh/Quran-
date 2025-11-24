import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Loader2, Volume2, Pause, Play } from '../components/icons';

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface DateInfo {
  hijri: {
    day: string;
    month: { ar: string };
    year: string;
    weekday: { ar: string };
  };
  gregorian: {
    date: string;
    weekday: { en: string };
  };
}

interface PrayerData {
  timings: PrayerTimings;
  date: DateInfo;
}

const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

// Helper to convert "HH:MM" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const cleanTime = timeStr.split(' ')[0]; // Remove timezones like (EEST)
  const parts = cleanTime.split(':');
  if (parts.length < 2) return 0;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  return hours * 60 + minutes;
};

// Helper to convert "HH:MM" (24h) to "H:MM AM/PM" (12h Arabic)
const formatTime12Hour = (time24: string): string => {
  if (!time24 || typeof time24 !== 'string') return "--:--";
  const cleanTime = time24.split(' ')[0];
  const parts = cleanTime.split(':');
  if (parts.length < 2) return "--:--";

  let hours = parseInt(parts[0], 10);
  const minutesStr = parts[1];
  
  if (isNaN(hours)) return "--:--";

  const suffix = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12; // Convert 0 to 12
  return `${hours}:${minutesStr} ${suffix}`;
};

export const PrayerTimesView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PrayerData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Get Location and Fetch Data
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع الجغرافي.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const date = new Date();
          const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
          
          const response = await fetch(
            `https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=4`
          );
          
          if (!response.ok) throw new Error("فشل في جلب البيانات");
          
          const result = await response.json();
          if (result.code === 200) {
            setData(result.data);
          } else {
            throw new Error("خطأ في البيانات المستلمة");
          }
        } catch (err: any) {
          console.error(err);
          setError("تعذر جلب مواقيت الصلاة. تأكد من اتصالك بالإنترنت.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError("يرجى السماح بالوصول للموقع لعرض مواقيت الصلاة الدقيقة لمدينتك.");
        setLoading(false);
      }
    );
  }, []);

  // Calculate Next Prayer and Countdown
  useEffect(() => {
    if (!data) return;

    const calculateNextPrayer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      
      let foundNext = false;
      let nextPrayerName = 'Fajr'; 
      let nextPrayerTimeStr = data.timings.Fajr;
      let isNextDay = false;

      for (const prayer of prayers) {
        const prayerMinutes = timeToMinutes(data.timings[prayer]);
        if (prayerMinutes > currentMinutes) {
          nextPrayerName = prayer;
          nextPrayerTimeStr = data.timings[prayer];
          foundNext = true;
          break;
        }
      }

      if (!foundNext) {
        // Next prayer is Fajr tomorrow
        isNextDay = true;
      }

      setNextPrayer(nextPrayerName);

      const cleanTime = nextPrayerTimeStr.split(' ')[0];
      const parts = cleanTime.split(':');
      const targetHours = parseInt(parts[0], 10);
      const targetMinutes = parseInt(parts[1], 10);
      
      let targetDate = new Date();
      targetDate.setHours(targetHours, targetMinutes, 0, 0);
      
      if (isNextDay) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const diff = targetDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      } else {
        setTimeRemaining("00:00:00");
      }
    };

    calculateNextPrayer();
    timerRef.current = window.setInterval(calculateNextPrayer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data]);

  const toggleAdhan = () => {
    if (!audioRef.current) {
      // Use a reliable MP3 source. Makkah Adhan.
      audioRef.current = new Audio('https://download.tvquran.com/download/Adhan/Athan_Makkah.mp3');
      audioRef.current.onended = () => setIsPlayingAdhan(false);
      audioRef.current.onerror = (e) => {
        console.error("Failed to load adhan audio", e);
        setIsPlayingAdhan(false);
        audioRef.current = null;
        alert("عذراً، تعذر تحميل ملف الصوت. يرجى المحاولة لاحقاً.");
      };
    }

    if (isPlayingAdhan) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAdhan(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingAdhan(true))
          .catch(e => {
            console.error("Audio play failed", e);
            setIsPlayingAdhan(false);
            alert("تعذر تشغيل الصوت. قد تحتاج إلى التفاعل مع الصفحة أولاً.");
          });
      }
    }
  };

  useEffect(() => {
      return () => {
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
          }
      }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 dark:text-amber-400 mb-4" />
        <p>جاري تحديد الموقع وجلب المواقيت...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        <MapPin className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">تنبيه</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          تحديث الصفحة
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-400">أوقات الصلاة</h1>
         </div>
         <div className="text-left">
             <p className="text-slate-800 dark:text-slate-200 font-bold">{data?.date.hijri.weekday.ar}</p>
             <p className="text-slate-500 dark:text-slate-400 text-sm">{data?.date.hijri.day} {data?.date.hijri.month.ar} {data?.date.hijri.year}</p>
         </div>
      </div>

      {/* Countdown Card */}
      <div className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 sm:p-8 mb-8 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
        
        <p className="text-slate-500 dark:text-slate-400 mb-2 text-lg">الصلاة القادمة</p>
        <h2 className="text-4xl sm:text-5xl font-bold text-amber-600 dark:text-amber-400 mb-2 font-serif">
          {nextPrayer ? PRAYER_NAMES_AR[nextPrayer] : '--'}
        </h2>
        
        <div className="flex justify-center items-baseline gap-2 mt-4" dir="ltr">
            <span className="text-5xl sm:text-7xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wider">
                {timeRemaining || "00:00:00"}
            </span>
        </div>
        <p className="text-slate-500 mt-2 text-sm">متبقي حتى الأذان</p>
      </div>

      {/* Prayer List */}
      <div className="grid gap-3 max-w-2xl mx-auto w-full">
        {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
            const isNext = nextPrayer === prayer;
            return (
                <div 
                    key={prayer} 
                    className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                        isNext 
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/50 shadow-lg shadow-amber-100 dark:shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isNext ? 'bg-amber-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <span className={`text-lg font-bold ${isNext ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300'}`}>
                            {PRAYER_NAMES_AR[prayer]}
                        </span>
                    </div>
                    <span className={`text-xl font-mono ${isNext ? 'text-amber-700 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`} dir="ltr">
                        {data ? formatTime12Hour(data.timings[prayer]) : '--:--'}
                    </span>
                </div>
            );
        })}
      </div>

      {/* Adhan Player */}
      <div className="mt-8 flex justify-center">
        <button
            onClick={toggleAdhan}
            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
                isPlayingAdhan 
                ? 'bg-amber-500 text-white dark:text-slate-900 shadow-lg shadow-amber-200 dark:shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
            }`}
        >
            {isPlayingAdhan ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="font-bold">{isPlayingAdhan ? 'إيقاف الأذان' : 'الاستماع للأذان'}</span>
            {isPlayingAdhan && (
                <span className="flex gap-1 h-3 items-end">
                    <span className="w-1 bg-slate-900 animate-[pulse_0.5s_ease-in-out_infinite] h-2"></span>
                    <span className="w-1 bg-slate-900 animate-[pulse_0.5s_ease-in-out_infinite_0.1s] h-3"></span>
                    <span className="w-1 bg-slate-900 animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-1"></span>
                </span>
            )}
        </button>
      </div>
      
      <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-6">
          يتم حساب المواقيت بناءً على موقعك الحالي (توقيت أم القرى / مكة المكرمة).
      </p>
    </div>
  );
};
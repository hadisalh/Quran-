import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Play, Pause, Loader2, ChevronDown, Lightbulb, BookOpen, HeartHandshake } from '../components/icons';

// --- Types ---
interface RuqyahItem {
  id: string;
  title: string;
  text: string;
  source: string;
  type: 'quran' | 'sunnah';
  surah?: number;
  ayah?: number;
  count?: string; // Recommended repetition
}

interface RuqyahCategory {
  id: string;
  title: string;
  description: string;
  items: RuqyahItem[];
}

// --- Data ---
const ruqyahData: RuqyahCategory[] = [
  {
    id: 'general',
    title: 'الرقية العامة والتحصين',
    description: 'آيات الحفظ والسكينة، أساس كل رقية.',
    items: [
      { id: 'fatiha', title: "سورة الفاتحة", text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ * ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ * ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ * مَـٰلِكِ يَوْمِ ٱلدِّينِ * إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ * ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ * صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", source: "الفاتحة: 1-7", type: 'quran', surah: 1, ayah: 1 },
      { id: 'kursi', title: "آية الكرسي", text: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱlْحَىُّ ٱlْqَيُّومُ ۚ لَا تَأْخُذُهُۥ sِنَةٌ وَلَا نَوْmٌ ۚ lَّهُۥ مَا fِى ٱlsَّmَـٰوَٰtِ وَmَا fِى ٱlْأَرْضِ ۗ مَن ذَا ٱlَّذِى يَشْfَعُ عِndَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْdِيهِمْ وَmَا خَلْfَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ mِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَsِcَ كُرْسِيُّهُ ٱlsَّmَـٰوَٰtِ وَٱlْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِfْظُهُمَا ۚ وَهُوَ ٱlْعَلِىُّ ٱlْعَظِيمُ", source: "البقرة: 255", type: 'quran', surah: 2, ayah: 255 },
      { id: 'baqarah_end', title: "خواتيم البقرة", text: "ءَامَنَ ٱlrَّsُولُ بِمَآ أُنzِلَ إِلَيْهِ مِن rَّbِّهِۦ وَٱlْمُؤْمِنُونَ... (إلى آخر السورة)", source: "البقرة: 285-286", type: 'quran', surah: 2, ayah: 285 },
      { id: 'ikhlas', title: "سورة الإخلاص", text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ * ٱللَّهُ ٱلصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", source: "الإخلاص", type: 'quran', surah: 112, ayah: 1 },
      { id: 'falaq', title: "سورة الفلق", text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ * مِن شَرِّ مَا خَلَقَ * وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ * وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", source: "الفلق", type: 'quran', surah: 113, ayah: 1 },
      { id: 'nas', title: "سورة الناس", text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ * مَلِكِ ٱلنَّاسِ * إِلَـٰهِ ٱلنَّاسِ * مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ * ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ * مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", source: "الناس", type: 'quran', surah: 114, ayah: 1 },
    ]
  },
  {
    id: 'sihr',
    title: 'رقية إبطال السحر',
    description: 'آيات دك حصون السحر بإذن الله.',
    items: [
      { id: 'araf_sihr', title: "آيات الأعراف", text: "وَأَوْحَيْنَآ إِلَىٰ مُوسَىٰٓ أَنْ أَلْقِ عَصَاكَ ۖ فَإِذَا هِىَ تَلْقَفُ مَا يَأْفِكُونَ * فَوَقَعَ ٱلْحَقُّ وَبَطَلَ مَا كَانُوا۟ يَعْمَلُونَ * فَغُلِبُوا۟ هُنَالِكَ وَٱنقَلَبُوا۟ صَـٰغِرِينَ", source: "الأعراف: 117-119", type: 'quran', surah: 7, ayah: 117 },
      { id: 'yunus_sihr', title: "آيات يونس", text: "فَلَمَّآ أَلْقَوْا۟ قَالَ مُوسَىٰ مَا جِئْتُم بِهِ ٱلسِّحْرُ ۖ إِنَّ ٱللَّهَ سَيُبْطِلُهُۥٓ ۖ إِنَّ ٱللَّهَ لَا يُصْلِحُ عَمَلَ ٱلْمُفْسِدِينَ * وَيُحِقُّ ٱللَّهُ ٱلْحَقَّ بِكَلِمَـٰتِهِۦ وَلَوْ كَرِهَ ٱلْمُجْرِمُونَ", source: "يونس: 81-82", type: 'quran', surah: 10, ayah: 81 },
      { id: 'taha_sihr', title: "آية طه", text: "وَأَلْقِ مَا فِى يَمِينِكَ تَلْقَفْ مَا صَنَعُوٓا۟ ۖ إِنَّمَا صَنَعُوا۟ كَيْدُ سَـٰحِرٍ ۖ وَلَا يُفْلِحُ ٱلسَّاحِرُ حَيْثُ أَتَىٰ", source: "طه: 69", type: 'quran', surah: 20, ayah: 69 },
    ]
  },
  {
    id: 'eye',
    title: 'رقية العين والحسد',
    description: 'لإطفاء حرارة العين وحماية النفس.',
    items: [
      { id: 'qalam_eye', title: "أواخر القلم", text: "وَإِن يَكَادُ ٱلَّذِينَ كَفَرُوا۟ لَيُزْلِقُونَكَ بِأَبْصَـٰرِهِمْ لَمَّا سَمِعُوا۟ ٱلذِّكْرَ وَيَقُولُونَ إِنَّهُۥ لَمَجْنُونٌ", source: "القلم: 51", type: 'quran', surah: 68, ayah: 51 },
      { id: 'mulk_eye', title: "بداية الملك", text: "فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ * ثُمَّ ٱرْجِعِ ٱلْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ ٱلْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", source: "الملك: 3-4", type: 'quran', surah: 67, ayah: 3 },
    ]
  },
  {
    id: 'healing',
    title: 'رقية الشفاء والألم',
    description: 'بنيه الشفاء ورفع البلاء الجسدي.',
    items: [
      { id: 'fatiha_shifa', title: "الفاتحة (الشافية)", text: "تُقرأ الفاتحة 7 مرات على مكان الألم مع النفث.", source: "سورة الفاتحة", type: 'quran', surah: 1, ayah: 1, count: "7 مرات" },
      { id: 'isra_shifa', title: "آية الشفاء", text: "وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ", source: "الإسراء: 82", type: 'quran', surah: 17, ayah: 82 },
      { id: 'shuara_shifa', title: "دعاء إبراهيم", text: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ", source: "الشعراء: 80", type: 'quran', surah: 26, ayah: 80 },
    ]
  },
  {
    id: 'sunnah',
    title: 'أدعية الرقية من السنة',
    description: 'أدعية نبوية مأثورة للتعويذ والشفاء.',
    items: [
      { id: 'duaa_jibreel', title: "رقية جبريل للنبي ﷺ", text: "بِاسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ بِاسْمِ اللَّهِ أَرْقِيكَ.", source: "رواه مسلم", type: 'sunnah', count: "3 مرات" },
      { id: 'duaa_pain', title: "عند الشعور بالألم", text: "ضَعْ يَدَكَ عَلَى الَّذِي تَأَلَّمَ مِنْ جَسَدِكَ، وَقُلْ: بِاسْمِ اللَّهِ (ثَلَاثًا)، وَقُلْ سَبْعَ مَرَّاتٍ: أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ.", source: "رواه مسلم", type: 'sunnah', count: "7 مرات" },
      { id: 'duaa_children', title: "تعويذ الأطفال", text: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ.", source: "رواه البخاري", type: 'sunnah', count: "3 مرات" },
      { id: 'duaa_comprehensive', title: "الدعاء الجامع", text: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.", source: "متفق عليه", type: 'sunnah', count: "تكرار" },
    ]
  }
];

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

export const RuqyahView: React.FC = () => {
    const [openCategory, setOpenCategory] = useState<string | null>('general');
    const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggleCategory = (id: string) => {
        setOpenCategory(openCategory === id ? null : id);
    };

    const playAudio = (item: RuqyahItem) => {
        if (activeTrackId === item.id && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        // Stop current
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        if (item.type === 'sunnah' || !item.surah || !item.ayah) {
            // Placeholder for sunnah items or where audio isn't mapped
            alert("التلاوة الصوتية متاحة للآيات القرآنية حالياً.");
            return;
        }

        setIsLoadingAudio(item.id);
        setActiveTrackId(item.id);

        const surahPadded = zeroPad(item.surah, 3);
        const ayahPadded = zeroPad(item.ayah, 3);
        const audioUrl = `https://verses.quran.com/Alafasy/mp3/${surahPadded}${ayahPadded}.mp3`;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
            setIsPlaying(false);
            setActiveTrackId(null);
        };
        
        audio.onerror = () => {
            setIsLoadingAudio(null);
            setIsPlaying(false);
            setActiveTrackId(null);
            console.error("Audio failed to load");
        };

        audio.play().then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(null);
        }).catch(e => {
            console.error("Playback error", e);
            setIsLoadingAudio(null);
            setIsPlaying(false);
        });
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                <div>
                    <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-400 font-serif">الرقية الشرعية</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">حصن نفسك وأهلك بكلام الله وهدي نبيه ﷺ</p>
                </div>
            </div>

            {/* Advice Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-4 rounded-2xl flex gap-4 items-start">
                    <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full text-amber-600 dark:text-amber-300 flex-shrink-0">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">شروط الرقية</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            1. أن تكون بكلام الله أو بأسمائه وصفاته أو بالأدعية النبوية.<br/>
                            2. أن تكون باللسان العربي وما يعرف معناه.<br/>
                            3. الاعتقاد الجازم بأن الرقية سبب والشفاء من الله وحده.
                        </p>
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 p-4 rounded-2xl flex gap-4 items-start">
                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full text-blue-600 dark:text-blue-300 flex-shrink-0">
                        <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">كيفية الرقية</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            ضع يدك على مكان الألم، أو اقرأ في كفيك وانفث (نفخ مع ريق خفيف) وامسح جسدك. كرر الآيات والأدعية 3 أو 7 مرات مع اليقين والتدبر.
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Accordion */}
            <div className="space-y-4 pb-20">
                {ruqyahData.map((category) => (
                    <div key={category.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm transition-all duration-300">
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className={`w-full flex items-center justify-between p-5 text-right transition-colors ${openCategory === category.id ? 'bg-slate-50 dark:bg-slate-700/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className={`w-6 h-6 ${openCategory === category.id ? 'text-amber-500' : 'text-slate-400'}`} />
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{category.title}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{category.description}</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openCategory === category.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openCategory === category.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-700">
                                {category.items.map((item) => (
                                    <div key={item.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 relative group hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md">
                                                {item.source}
                                            </span>
                                            {item.type === 'quran' && (
                                                <button 
                                                    onClick={() => playAudio(item)}
                                                    className={`p-2 rounded-full transition-all ${
                                                        activeTrackId === item.id 
                                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 border border-slate-200 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {isLoadingAudio === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : (activeTrackId === item.id && isPlaying) ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                                                </button>
                                            )}
                                        </div>
                                        <p className="quran-text text-slate-800 dark:text-slate-200 text-lg leading-loose text-center mb-3">
                                            {item.text}
                                        </p>
                                        {item.count && (
                                            <div className="text-center border-t border-slate-200 dark:border-slate-800 pt-2 mt-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">يُستحب التكرار: <span className="font-bold text-amber-600 dark:text-amber-500">{item.count}</span></span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
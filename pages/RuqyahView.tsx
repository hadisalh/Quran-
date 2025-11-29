import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Play, Pause, Loader2, ChevronDown, Lightbulb, BookOpen, HeartHandshake, Sparkles, Check } from '../components/icons';

// --- Types ---
interface RuqyahItem {
  id: string;
  title: string;
  text: string;
  source: string;
  type: 'quran' | 'sunnah';
  surah?: number;
  ayah?: number;
  count?: string; 
  benefit?: string; // New field for context
}

interface RuqyahCategory {
  id: string;
  title: string;
  description: string;
  items: RuqyahItem[];
  color: string; // Helper for UI theming
}

// --- Data ---
const ruqyahData: RuqyahCategory[] = [
  {
    id: 'general',
    title: 'الرقية العامة والتحصين',
    description: 'أساسيات الحفظ والتحصين اليومي لكل مسلم.',
    color: 'bg-emerald-500',
    items: [
      { id: 'fatiha', title: "سورة الفاتحة", text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ * ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ * ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ * مَـٰلِكِ يَوْمِ ٱلدِّينِ * إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ * ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ * صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", source: "الفاتحة: 1-7", type: 'quran', surah: 1, ayah: 1, count: "7 مرات", benefit: "هي الشافية والكافية وأعظم سورة في القرآن." },
      { id: 'kursi', title: "آية الكرسي", text: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱlْحَىُّ ٱlْqَيُّومُ ۚ لَا تَأْخُذُهُۥ sِنَةٌ وَلَا نَوْmٌ ۚ lَّهُۥ مَا fِى ٱlsَّmَـٰوَٰtِ وَmَا fِى ٱlْأَرْضِ ۗ مَن ذَا ٱlَّذِى يَشْfَعُ عِndَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْdِيهِمْ وَmَا خَلْfَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ mِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَsِcَ كُرْسِيُّهُ ٱlsَّmَـٰوَٰtِ وَٱlْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِfْظُهُمَا ۚ وَهُوَ ٱlْعَلِىُّ ٱlْعَظِيمُ", source: "البقرة: 255", type: 'quran', surah: 2, ayah: 255, count: "مرة صباحاً ومساءً وعند النوم", benefit: "حفظ من الشيطان والجن." },
      { id: 'baqarah_end', title: "خواتيم البقرة", text: "ءَامَنَ ٱlrَّsُولُ بِمَآ أُنzِلَ إِلَيْهِ مِن rَّbِّهِۦ وَٱlْمُؤْمِنُونَ... (الآيتان)", source: "البقرة: 285-286", type: 'quran', surah: 2, ayah: 285, count: "مرة واحدة مساءً", benefit: "من قرأهما في ليلة كفتاه." },
      { id: 'ikhlas', title: "سورة الإخلاص", text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ * ٱللَّهُ ٱلصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", source: "الإخلاص", type: 'quran', surah: 112, ayah: 1, count: "3 مرات", benefit: "تعدل ثلث القرآن." },
      { id: 'falaq', title: "سورة الفلق", text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ * مِن شَرِّ مَا خَلَقَ * وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ * وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", source: "الفلق", type: 'quran', surah: 113, ayah: 1, count: "3 مرات", benefit: "تحصين من السحر والحسد." },
      { id: 'nas', title: "سورة الناس", text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ * مَلِكِ ٱلنَّاسِ * إِلَـٰهِ ٱلنَّاسِ * مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ * ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ * مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", source: "الناس", type: 'quran', surah: 114, ayah: 1, count: "3 مرات", benefit: "تحصين من الوساوس والشياطين." },
    ]
  },
  {
    id: 'sakinah',
    title: 'آيات السكينة والانشراح',
    description: 'لعلاج القلق، الخوف، الضيق، والتوتر.',
    color: 'bg-blue-500',
    items: [
        { id: 'sharh', title: "سورة الشرح", text: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ * وَوَضَعْنَا عَنكَ وِزْرَكَ * ٱلَّذِىٓ أَنقَضَ ظَهْرَكَ * وَرَفَعْنَا لَكَ ذِكْرَكَ * فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا * إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", source: "الشرح", type: 'quran', surah: 94, ayah: 1, count: "تكرار", benefit: "لإزالة ضيق الصدر والهم." },
        { id: 'tawba_sakinah', title: "آية السكينة (التوبة)", text: "ثُمَّ أَنزَلَ ٱللَّهُ سَكِينَتَهُۥ عَلَىٰ رَسُولِهِۦ وَعَلَى ٱلْمُؤْمِنِينَ", source: "التوبة: 26", type: 'quran', surah: 9, ayah: 26, count: "تكرار", benefit: "لنزول الطمأنينة." },
        { id: 'fath_sakinah', title: "آية السكينة (الفتح)", text: "هُوَ ٱلَّذِىٓ أَنزَلَ ٱلسَّكِينَةَ فِى قُلُوبِ ٱلْمُؤْمِنِينَ لِيَزْدَادُوٓا۟ إِيمَـٰنًا مَّعَ إِيمَـٰنِهِمْ", source: "الفتح: 4", type: 'quran', surah: 48, ayah: 4, count: "تكرار", benefit: "لتثبيت القلب وزيادة الإيمان." },
        { id: 'raad_sakinah', title: "طمأنينة الذكر", text: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", source: "الرعد: 28", type: 'quran', surah: 13, ayah: 28, count: "تكرار", benefit: "العلاج الأول للقلق والتوتر." }
    ]
  },
  {
    id: 'sihr',
    title: 'رقية إبطال السحر',
    description: 'آيات دك حصون السحر بإذن الله.',
    color: 'bg-purple-500',
    items: [
      { id: 'araf_sihr', title: "آيات الأعراف", text: "وَأَوْحَيْنَآ إِلَىٰ مُوسَىٰٓ أَنْ أَلْقِ عَصَاكَ ۖ فَإِذَا هِىَ تَلْقَفُ مَا يَأْفِكُونَ * فَوَقَعَ ٱلْحَقُّ وَبَطَلَ مَا كَانُوا۟ يَعْمَلُونَ * فَغُلِبُوا۟ هُنَالِكَ وَٱنقَلَبُوا۟ صَـٰغِرِينَ", source: "الأعراف: 117-119", type: 'quran', surah: 7, ayah: 117, benefit: "لإبطال عمل السحرة." },
      { id: 'yunus_sihr', title: "آيات يونس", text: "فَلَمَّآ أَلْقَوْا۟ قَالَ مُوسَىٰ مَا جِئْتُم بِهِ ٱلسِّحْرُ ۖ إِنَّ ٱللَّهَ سَيُبْطِلُهُۥٓ ۖ إِنَّ ٱللَّهَ لَا يُصْلِحُ عَمَلَ ٱلْمُفْسِدِينَ * وَيُحِقُّ ٱللَّهُ ٱلْحَقَّ بِكَلِمَـٰتِهِۦ وَلَوْ كَرِهَ ٱلْمُجْرِمُونَ", source: "يونس: 81-82", type: 'quran', surah: 10, ayah: 81, benefit: "اليقين بأن الله سيبطل السحر." },
      { id: 'taha_sihr', title: "آية طه", text: "وَأَلْقِ مَا فِى يَمِينِكَ تَلْقَفْ مَا صَنَعُوٓا۟ ۖ إِنَّمَا صَنَعُوا۟ كَيْدُ سَـٰحِرٍ ۖ وَلَا يُفْلِحُ ٱلسَّاحِرُ حَيْثُ أَتَىٰ", source: "طه: 69", type: 'quran', surah: 20, ayah: 69, benefit: "نفي الفلاح عن الساحر." },
    ]
  },
  {
    id: 'eye',
    title: 'رقية العين والحسد',
    description: 'لإطفاء حرارة العين وحماية النفس.',
    color: 'bg-amber-500',
    items: [
      { id: 'qalam_eye', title: "أواخر القلم", text: "وَإِن يَكَادُ ٱلَّذِينَ كَفَرُوا۟ لَيُزْلِقُونَكَ بِأَبْصَـٰرِهِمْ لَمَّا سَمِعُوا۟ ٱلذِّكْرَ وَيَقُولُونَ إِنَّهُۥ لَمَجْنُونٌ", source: "القلم: 51", type: 'quran', surah: 68, ayah: 51, benefit: "آية شديدة على العين." },
      { id: 'mulk_eye', title: "بداية الملك", text: "فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ * ثُمَّ ٱرْجِعِ ٱلْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ ٱلْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", source: "الملك: 3-4", type: 'quran', surah: 67, ayah: 3, benefit: "لرد العين على صاحبها." },
      { id: 'yusuf_eye', title: "وصية يعقوب", text: "وَقَالَ يَا بَنِيَّ لَا تَدْخُلُوا مِن بَابٍ وَاحِدٍ وَادْخُلُوا مِنْ أَبْوَابٍ مُّتَفَرِّقَةٍ", source: "يوسف: 67", type: 'quran', surah: 12, ayah: 67, benefit: "للتحرز من العين." }
    ]
  },
  {
    id: 'healing',
    title: 'رقية الشفاء والألم',
    description: 'بنية الشفاء ورفع البلاء الجسدي.',
    color: 'bg-red-500',
    items: [
      { id: 'fatiha_shifa', title: "الفاتحة (الشافية)", text: "تُقرأ الفاتحة 7 مرات على مكان الألم مع النفث.", source: "سورة الفاتحة", type: 'quran', surah: 1, ayah: 1, count: "7 مرات", benefit: "رقية لكل داء." },
      { id: 'isra_shifa', title: "آية الشفاء", text: "وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ", source: "الإسراء: 82", type: 'quran', surah: 17, ayah: 82, count: "تكرار", benefit: "لطلب الشفاء بالقرآن." },
      { id: 'shuara_shifa', title: "دعاء إبراهيم", text: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ", source: "الشعراء: 80", type: 'quran', surah: 26, ayah: 80, count: "تكرار", benefit: "تعليق القلب بالشافي." },
    ]
  },
  {
    id: 'sunnah',
    title: 'أدعية الرقية من السنة',
    description: 'أدعية نبوية مأثورة للتعويذ والشفاء.',
    color: 'bg-slate-600',
    items: [
      { id: 'duaa_jibreel', title: "رقية جبريل للنبي ﷺ", text: "بِاسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ بِاسْمِ اللَّهِ أَرْقِيكَ.", source: "رواه مسلم", type: 'sunnah', count: "3 مرات", benefit: "شاملة لكل أذى." },
      { id: 'duaa_pain', title: "عند الشعور بالألم", text: "ضَعْ يَدَكَ عَلَى الَّذِي تَأَلَّمَ مِنْ جَسَدِكَ، وَقُلْ: بِاسْمِ اللَّهِ (ثَلَاثًا)، وَقُلْ سَبْعَ مَرَّاتٍ: أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ.", source: "رواه مسلم", type: 'sunnah', count: "7 مرات", benefit: "لتسكين الألم." },
      { id: 'duaa_children', title: "تعويذ الأطفال", text: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ.", source: "رواه البخاري", type: 'sunnah', count: "3 مرات", benefit: "لحفظ الأطفال." },
      { id: 'duaa_comprehensive', title: "الدعاء الجامع", text: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.", source: "متفق عليه", type: 'sunnah', count: "تكرار", benefit: "لطلب الشفاء التام." },
      { id: 'duaa_tamma', title: "كلمات الله التامات", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", source: "رواه مسلم", type: 'sunnah', count: "3 مرات مساءً", benefit: "حماية من كل ضرر." },
      { id: 'duaa_grief', title: "دعاء الهم والحزن", text: "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ... أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلاَءَ حُزْنِي، وَذَهَابَ هَمِّي.", source: "رواه أحمد", type: 'sunnah', count: "عند الحاجة", benefit: "لذهاب الهم والحزن." }
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
            alert("التلاوة الصوتية متاحة للآيات القرآنية عبر المصحف المرتل.");
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
        <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <ShieldCheck className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-serif">الرقية الشرعية</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">حصن نفسك وأهلك بكلام الله وهدي نبيه ﷺ</p>
                </div>
            </div>

            {/* Advice Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 p-5 rounded-2xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-amber-50 dark:bg-amber-900/40 p-2.5 rounded-full text-amber-600 dark:text-amber-400 flex-shrink-0">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">شروط الرقية الصحيحة</h3>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside space-y-1">
                            <li>أن تكون بكلام الله أو بأسمائه وصفاته أو بالأدعية النبوية.</li>
                            <li>أن تكون باللسان العربي.</li>
                            <li>الاعتقاد الجازم بأن الرقية سبب والشفاء من الله وحده.</li>
                        </ul>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 p-5 rounded-2xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-full text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">كيفية الرقية</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            ضع يدك على مكان الألم، أو اقرأ في كفيك وانفث (نفخ مع ريق خفيف) وامسح جسدك. كرر الآيات والأدعية 3 أو 7 مرات مع اليقين والتدبر وحضور القلب.
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Accordion */}
            <div className="space-y-4 pb-20">
                {ruqyahData.map((category, idx) => (
                    <div 
                        key={category.id} 
                        className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className={`w-full flex items-center justify-between p-5 text-right transition-colors relative overflow-hidden group ${openCategory === category.id ? 'bg-slate-50 dark:bg-slate-700/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                        >
                            {/* Color Accent Bar */}
                            <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${category.color}`}></div>

                            <div className="flex items-center gap-4 pr-3">
                                <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-700 ${openCategory === category.id ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`}>
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{category.title}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 opacity-90">{category.description}</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openCategory === category.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openCategory === category.id ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                                {category.items.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 relative group hover:border-amber-300 dark:hover:border-amber-700/50 transition-all shadow-sm">
                                        
                                        {/* Header: Source and Type Badge */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-2">
                                                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                                                    {item.source}
                                                </span>
                                                {item.type === 'quran' && (
                                                    <span className="text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-100 dark:border-amber-800/50">
                                                        قرآن
                                                    </span>
                                                )}
                                                {item.type === 'sunnah' && (
                                                    <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                                                        سنة
                                                    </span>
                                                )}
                                            </div>

                                            {item.type === 'quran' && (
                                                <button 
                                                    onClick={() => playAudio(item)}
                                                    className={`p-2.5 rounded-full transition-all ${
                                                        activeTrackId === item.id 
                                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110' 
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-600'
                                                    }`}
                                                    title="استماع"
                                                >
                                                    {isLoadingAudio === item.id ? <Loader2 className="w-5 h-5 animate-spin"/> : (activeTrackId === item.id && isPlaying) ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                                                </button>
                                            )}
                                        </div>

                                        {/* Text Content */}
                                        <p className="quran-text text-slate-800 dark:text-slate-200 text-xl leading-[3rem] text-center mb-5 px-2">
                                            {item.text}
                                        </p>

                                        {/* Footer: Benefit & Count */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            {item.benefit && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg w-full sm:w-auto justify-center sm:justify-start">
                                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                                    <span>{item.benefit}</span>
                                                </div>
                                            )}
                                            
                                            {item.count && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 px-3 py-1.5 rounded-full w-full sm:w-auto justify-center sm:justify-end">
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>التكرار: <span className="text-slate-800 dark:text-slate-200 font-bold">{item.count}</span></span>
                                                </div>
                                            )}
                                        </div>
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
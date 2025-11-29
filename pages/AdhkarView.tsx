import React, { useState, useMemo } from 'react';
import { ShieldCheck, ChevronDown, RotateCcw, Search } from '../components/icons';
import { TasbihSection } from '../components/TasbihSection';
import { DhikrCounter } from '../components/DhikrCounter';

interface AdhkarItem {
  text: string;
  count: string;
  virtue: string;
}

interface AdhkarCategory {
  id: string;
  title: string;
  items: AdhkarItem[];
}

const adhkarData: AdhkarCategory[] = [
  {
    id: 'morning',
    title: 'أذكار الصباح',
    items: [
      { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.', count: 'مرة واحدة', virtue: 'حصن للمسلم في يومه.' },
      { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.', count: 'مرة واحدة', virtue: 'استفتاح اليوم بذكر الله.' },
      { text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي؛ فَاغْفِرْ لِي؛ فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.', count: 'مرة واحدة', virtue: 'سيد الاستغفار، من قاله موقناً به ومات دخل الجنة.' },
      { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.', count: 'ثلاث مرات', virtue: 'أجر مضاعف وثواب عظيم.' },
      { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ.', count: 'مئة مرة', virtue: 'حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.'},
      { text: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.', count: 'ثلاث مرات', virtue: 'لم يضره من الله شيء.' },
      { text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ.', count: 'ثلاث مرات', virtue: 'سؤال الله العافية في الجسد.'},
      { text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.', count: 'ثلاث مرات', virtue: 'تفويض الأمر لله وطلب الإصلاح.' },
      { text: 'حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.', count: 'سبع مرات', virtue: 'كفاه الله ما أهمه من أمر الدنيا والآخرة.' }
    ]
  },
  {
    id: 'evening',
    title: 'أذكار المساء',
    items: [
      { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.', count: 'مرة واحدة', virtue: 'حصن للمسلم في ليلته.' },
      { text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.', count: 'مرة واحدة', virtue: 'ختام اليوم بذكر الله.' },
      { text: 'أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ.', count: 'مرة واحدة', virtue: 'تجديد العهد والميثاق مع الله.' },
      { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', count: 'ثلاث مرات', virtue: 'لم يضره شيء في تلك الليلة.' }
    ]
  },
  {
    id: 'waking_up',
    title: 'أذكار الاستيقاظ',
    items: [
      { text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.', count: 'مرة واحدة', virtue: 'حمد الله على نعمة الحياة الجديدة.' },
      { text: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي.', count: 'مرة واحدة', virtue: 'من قالها غُفر له، وإن دعا استُجيب له.' }
    ]
  },
  {
    id: 'sleep',
    title: 'أذكار النوم',
    items: [
      { text: 'يجمع كفيه ثم ينفث فيهما فيقرأ: سورة الإخلاص، وسورة الفلق، وسورة الناس.', count: 'ثلاث مرات', virtue: 'يمسح بهما ما استطاع من جسده.' },
      { text: 'قراءة آية الكرسي', count: 'مرة واحدة', virtue: 'لا يزال عليك من الله حافظ ولا يقربك شيطان حتى تصبح.' },
      { text: 'بِاسْمِكَ رَبِّـي وَضَعْـتُ جَنْـبِي، وَبِكَ أَرْفَعُـهُ، فَإِنْ أَمْسَـكْتَ نَفْسِـي فَارْحَمْـهَا، وَإِنْ أَرْسَلْتَـهَا فَاحْفَظْـهَا بِمَا تَحْفَـظُ بِهِ عِبَـادَكَ الصَّـالِحِيـنَ.', count: 'مرة واحدة', virtue: 'دعاء وتفويض الأمر لله.' },
      { text: 'اللّهُـمَّ قِنـي عَذابَـكَ يَـوْمَ تَبْـعَثُ عِبـادَك.', count: 'ثلاث مرات', virtue: 'دعاء للنجاة من العذاب.' },
      { text: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.', count: 'مرة واحدة', virtue: 'من مات في ليلته مات على الفطرة.' }
    ]
  },
   {
    id: 'after_prayer',
    title: 'أذكار بعد الصلاة',
    items: [
      { text: 'أَسْتَغْفِرُ اللَّهَ', count: 'ثلاث مرات', virtue: 'يقال ثلاثاً بعد التسليم من الصلاة.' },
      { text: 'اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالْإِكْرَامِ.', count: 'مرة واحدة', virtue: 'دعاء بعد التسليم مباشرة.' },
      { text: 'سُبْحَانَ اللَّهِ', count: '33 مرة', virtue: 'من المعقبات التي لا يخيب قائلها.' },
      { text: 'الْحَمْدُ لِلَّهِ', count: '33 مرة', virtue: 'من المعقبات التي لا يخيب قائلها.' },
      { text: 'اللَّهُ أَكْبَرُ', count: '33 مرة', virtue: 'من المعقبات التي لا يخيب قائلها.' },
      { text: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.', count: 'مرة واحدة', virtue: 'تمام المئة لغفران الخطايا.' },
      { text: 'قراءة آية الكرسي', count: 'مرة واحدة', virtue: 'من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا أن يموت.' }
    ]
  },
  {
    id: 'mosque',
    title: 'أذكار المسجد',
    items: [
        { text: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.', count: 'عند الدخول', virtue: 'يقدم رجله اليمنى ويقول هذا الدعاء.' },
        { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.', count: 'عند الخروج', virtue: 'يقدم رجله اليسرى ويقول هذا الدعاء.' },
        { text: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُوراً، وَفِي لِسَانِي نُوراً، وَفِي سَمْعِي نُوراً، وَفِي بَصَرِي نُوراً...', count: 'أثناء الذهاب', virtue: 'دعاء الذهاب إلى المسجد لطلب النور التام.' }
    ]
  },
  {
    id: 'home',
    title: 'دخول وخروج المنزل',
    items: [
        { text: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا.', count: 'عند الدخول', virtue: 'ثم ليسلم على أهله.' },
        { text: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.', count: 'عند الخروج', virtue: 'يُقال له: كُفيتَ وَوُقيتَ وَهُديتَ، وتنحى عنه الشيطان.' }
    ]
  },
  {
    id: 'food',
    title: 'أذكار الطعام',
    items: [
        { text: 'بِسْمِ اللَّهِ.', count: 'قبل الأكل', virtue: 'وإذا نسي قال: بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ.' },
        { text: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ.', count: 'بعد الأكل', virtue: 'غُفر له ما تقدم من ذنبه.' }
    ]
  },
  {
    id: 'travel',
    title: 'أذكار السفر',
    items: [
        { text: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى...', count: 'عند الركوب', virtue: 'دعاء السفر لحفظ الله وتيسيره.' },
        { text: 'أَسْتَوْدِعُ اللَّهَ دِينَكَ، وَأَمَانَتَكَ، وَخَوَاتِيمَ عَمَلِكَ.', count: 'للمسافر', virtue: 'دعاء المقيم للمسافر.' },
        { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', count: 'عند نزول منزل', virtue: 'من قالها لم يضره شيء حتى يرتحل.' }
    ]
  },
  {
    id: 'dressing',
    title: 'أذكار اللباس',
    items: [
        { text: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا (الثَّوْبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ.', count: 'عند اللبس', virtue: 'غفر له ما تقدم من ذنبه.' },
        { text: 'بِسْمِ اللَّهِ.', count: 'عند الخلع', virtue: 'ستر ما بين أعين الجن وعورات بني آدم.' }
    ]
  },
  {
    id: 'quranic_duas',
    title: 'أدعية قرآنية شاملة',
    items: [
        { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.', count: 'يكثر منها', virtue: 'من أجمع الأدعية لخيري الدنيا والآخرة.' },
        { text: 'رَبَّنَا لاَ تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ.', count: 'للثبات', virtue: 'طلب الثبات على الحق.' },
        { text: 'رَبِّ اشْرَحْ لِي صَدْرِي * وَيَسِّرْ لِي أَمْرِي.', count: 'عند الحاجة', virtue: 'لشرح الصدر وتيسير الأمور.' },
        { text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا.', count: 'للعائلة', virtue: 'صلاح الأهل والذرية.' },
        { text: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ.', count: 'لطلب الرزق', virtue: 'دعاء موسى عليه السلام لطلب الخير والرزق.' }
    ]
  },
  {
    id: 'worry',
    title: 'أدعية الهم والكرب',
    items: [
        { text: 'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَداً مِنْ خَلْقِكَ، أَوْ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلاَءَ حُزْنِي، وَذَهَابَ هَمِّي.', count: 'عند الهم', virtue: 'إلا أذهب الله همه وحزنه، وأبدله مكانه فرجاً.' },
        { text: 'لَا إِلَهَ إِلَّا اللهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ.', count: 'عند الكرب', virtue: 'دعاء الكرب.' },
        { text: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لاَ إِلَهَ إِلاَّ أَنْتَ.', count: 'للمكروب', virtue: 'دعاء المكروب.' },
        { text: 'لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.', count: 'عند الشدة', virtue: 'دعاء ذي النون، ما دعا بها مسلم في شيء إلا استجاب الله له.' }
    ]
  },
   {
    id: 'istikhara',
    title: 'دعاء الاستخارة',
    items: [
        { text: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الْغُيُوبِ. اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ -وَيُسَمِّي حَاجَتَهُ- خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِي الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ.', count: 'بعد ركعتين', virtue: 'لطلب الخيرة من الله في الأمور كلها.' },
    ]
  }
];


const AccordionItem: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void; }> = ({ title, children, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      <button
        onClick={onClick}
        className={`w-full flex justify-between items-center text-right p-5 focus:outline-none transition-colors ${isOpen ? 'bg-slate-100 dark:bg-slate-700/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
        aria-expanded={isOpen}
      >
        <h2 className={`text-xl font-bold transition-colors font-serif ${isOpen ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>{title}</h2>
        <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AdhkarView: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [resetTrigger, setResetTrigger] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const resetAllAdhkar = () => {
        if (window.confirm('هل أنت متأكد من رغبتك في بدء يوم جديد وتصفير جميع عدادات الأذكار؟ (لن يتم تصفير مجموع التسبيح الكلي)')) {
            setResetTrigger(prev => prev + 1);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50]);
        }
    };

    // Filter logic for search
    const filteredAdhkar = useMemo(() => {
        if (!searchTerm.trim()) return adhkarData;

        const term = searchTerm.toLowerCase();
        return adhkarData.map(category => {
            const matchesCategory = category.title.toLowerCase().includes(term);
            const matchingItems = category.items.filter(item => 
                item.text.includes(term) || item.virtue.includes(term)
            );

            // If category title matches, return all items. If not, return only matching items.
            if (matchesCategory) return category;
            
            if (matchingItems.length > 0) {
                return { ...category, items: matchingItems };
            }
            
            return null;
        }).filter(Boolean) as AdhkarCategory[];
    }, [searchTerm]);

    // Auto-expand search results
    useMemo(() => {
        if (searchTerm && filteredAdhkar.length > 0) {
            setOpenIndex(0); // Open first result by default
        }
    }, [searchTerm, filteredAdhkar.length]);

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-400 font-serif">حصن المسلم</h1>
            </div>
            <button 
                onClick={resetAllAdhkar}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:text-slate-900 text-slate-600 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md border border-slate-200 dark:border-slate-600 hover:border-amber-400"
            >
                <RotateCcw className="w-4 h-4" />
                بدء يوم جديد
            </button>
        </div>
       
        <div className="overflow-y-auto flex-grow space-y-8 pb-20">
            <TasbihSection />
            
            <div className="space-y-4">
                <div className="px-2">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-serif">الأذكار والتحصينات</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">الأذكار اليومية والأدعية الجامعة لخيري الدنيا والآخرة.</p>
                    
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث عن دعاء، ذكر، أو حالة..."
                            className="w-full p-3 pr-10 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-sm"
                        />
                        <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xl animate-fade-in">
                {filteredAdhkar.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p>لا توجد نتائج مطابقة لبحثك.</p>
                    </div>
                ) : (
                    filteredAdhkar.map((category, index) => (
                    <AccordionItem
                    key={category.id}
                    title={category.title}
                    isOpen={openIndex === index || (!!searchTerm)} // Keep open if searching
                    onClick={() => handleToggle(index)}
                    >
                        {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="relative p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/30 transition-all shadow-sm group">
                             {/* Right Accent Line */}
                             <div className="absolute right-0 top-6 bottom-6 w-1 bg-amber-500/30 group-hover:bg-amber-500 transition-colors rounded-l-full"></div>
                             
                            <div className="pr-4">
                                <p className="text-slate-800 dark:text-slate-100 leading-loose text-xl mb-5 font-serif text-justify">{item.text}</p>
                                <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <div className="w-full sm:w-auto">
                                        <DhikrCounter 
                                            countString={item.count} 
                                            storageKey={`adhkar-${category.id}-${item.text.substring(0, 10)}`} // More robust key
                                            resetTrigger={resetTrigger}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center sm:justify-start">
                                        <span className="text-amber-500 text-base">💡</span>
                                        <span className="font-medium">{item.virtue}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </AccordionItem>
                )))}
                </div>
            </div>
        </div>
    </div>
  );
};
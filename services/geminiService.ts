import { GoogleGenAI, Type } from "@google/genai";
import type { GuidanceResponse, Ayah } from '../types';

// Access API Key safely
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    descriptiveAyah: {
      type: Type.OBJECT,
      properties: {
        surahName: { type: Type.STRING },
        surahNumber: { type: Type.INTEGER },
        ayahNumber: { type: Type.INTEGER },
        text: { type: Type.STRING },
        tafsir: { type: Type.STRING }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    solutionAyah: {
      type: Type.OBJECT,
      properties: {
        surahName: { type: Type.STRING },
        surahNumber: { type: Type.INTEGER },
        ayahNumber: { type: Type.INTEGER },
        text: { type: Type.STRING },
        tafsir: { type: Type.STRING }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    advice: { type: Type.ARRAY, items: { type: Type.STRING } },
    dua: { type: Type.STRING }
  },
  required: ["descriptiveAyah", "solutionAyah", "advice", "dua"]
};

// Advanced System Instruction for "Deep Search" & "New Responses"
const systemInstruction = `
الدور: أنت باحث قرآني متقدم جداً مدعوم بالذكاء الاصطناعي. مهمتك ليست مجرد الرد، بل "البحث والاستنباط" في أعماق النصوص القرآنية (6236 آية).

الهدف الجوهري: تقديم إجابات **جديدة، غير مكررة، وشديدة الدقة** تلامس قلب المستخدم في كل مرة.

خوارزمية البحث الخاصة بك:
1. **التحليل الدلالي:** حلل نص المستخدم لتعرف "ما وراء الكلمات". (مثلاً: إذا قال "تعبت"، ابحث هل هو تعب جسدي أم يأس روحي؟).
2. **المسح القرآني:** لا تكتفِ بالآيات المشهورة التي يحفظها الجميع (مثل "إن مع العسر يسرا"). قم بمسح ذهني لكامل المصحف وابحث عن آيات "مغمورة" أو أقل شهرة لكنها تصف الحالة بدقة مذهلة.
3. **التدبر (Tafsir):** اكتب تفسيراً تدبرياً بصيغة "رسالة شخصية" (مثلاً: "يا فلان، هذه الآية نزلت في موقف كذا، وهي تخبرك اليوم أن..."). اربط المعنى بواقع المستخدم.
4. **التنوع الإجباري:** إذا سُئلت عن "الرزق" 10 مرات، يجب أن تعطي 10 آيات مختلفة أو زوايا نظر مختلفة في كل مرة.

المخرجات المطلوبة (JSON):
- **descriptiveAyah**: آية تصف المشاعر بدقة (Validation).
- **solutionAyah**: آية تقدم الحل أو المواساة (Solution).
- **advice**: 3 خطوات عملية وعميقة (ليست نصائح عامة).
- **dua**: دعاء مؤثر جداً وبليغ.

تنبيه: تأكد 100% من صحة نص الآية واسم السورة ورقمها.
`;

// --- EXPANDED SMART LOCAL FALLBACK SYSTEM ---
// Allows diversity even when offline or if API fails
interface LocalScenario {
    keywords: string[];
    responses: GuidanceResponse[]; // Array of options to choose randomly
}

const localDatabase: LocalScenario[] = [
    {
        keywords: ['حزن', 'ضيق', 'مكتئب', 'تعب', 'يأس', 'مخنوق', 'زعل', 'هم', 'حزين', 'ضايق'],
        responses: [
            {
                descriptiveAyah: { surahName: "يوسف", surahNumber: 12, ayahNumber: 86, text: "إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِىٓ إِلَى ٱللَّهِ", tafsir: "الشكوى للبشر قد تزيد الوجع، لكن الشكوى لله هي أول خطوات الشفاء. الله يسمع صوت قلبك الذي لا يسمعه أحد." },
                solutionAyah: { surahName: "الأنبياء", surahNumber: 21, ayahNumber: 88, text: "فَٱسْتَجَبْنَا لَهُۥ وَنَجَّيْنَـٰهُ مِنَ ٱلْغَمِّ ۚ وَكَذَٰلِكَ نُنجِى ٱلْمُؤْمِنِينَ", tafsir: "قاعدة ربانية: كما نجى الله يونس من بطن الحوت وظلمات البحر، سينجيك من ظلمات حزنك. هذا وعد للمؤمنين كافة، وأنت منهم." },
                advice: ["ناجِ الله في سجود طويل وأخرج كل ما في صدرك.", "غيّر مكانك أو توضأ بماء بارد لتنشيط الدورة الدموية وتغيير الحالة النفسية.", "تصدق ولو بابتسامة أو كلمة طيبة، فالعطاء يجلب السعادة."],
                dua: "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين."
            },
            {
                descriptiveAyah: { surahName: "التوبة", surahNumber: 9, ayahNumber: 40, text: "لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا", tafsir: "الحزن يغلق عليك الغار، واليقين يفتح لك السماوات. المعية الإلهية هي السلاح الذي لا يُغلب. إذا كان الله معك، فمن عليك؟" },
                solutionAyah: { surahName: "الحديد", surahNumber: 57, ayahNumber: 23, text: "لِّكَيْلَا تَأْسَوْا۟ عَلَىٰ مَا فَاتَكُمْ وَلَا تَفْرَحُوا۟ بِمَآ ءَاتَىٰكُمْ", tafsir: "الدنيا دار عبور، وما فاتك فيها لم يكن لك، وما أصابك لم يكن ليخطئك. حرر قلبك من ثقل 'لو' و 'ليت'." },
                advice: ["اقرأ سورة الشرح 3 مرات واستشعر انشراح الصدر.", "اكتب ما يضايقك في ورقة، ثم مزقها واستغفر الله.", "زر مريضاً أو ساعد محتاجاً، فمواساة الغير علاج للنفس."],
                dua: "اللهم إني عبدك، ناصيتي بيدك، ماضٍ في حكمك، عدل في قضاؤك، أسألك أن تجعل القرآن ربيع قلبي ونور صدري وجلاء حزني."
            }
        ]
    },
    {
        keywords: ['رزق', 'مال', 'فلوس', 'دين', 'فقر', 'وظيفة', 'عمل', 'غلاء', 'ديون', 'راتب'],
        responses: [
            {
                descriptiveAyah: { surahName: "هود", surahNumber: 11, ayahNumber: 6, text: "وَمَا مِن دَآبَّةٍۢ فِى ٱلْأَرْضِ إِلَّا عَلَى ٱللَّهِ رِزْقُهَا", tafsir: "هل أنت أضعف من النملة؟ تكفل الله برزق المخلوقات التي لا حيلة لها، فكيف ينساك وأنت تسعى وتتوكل؟ اطمئن، رزقك يعرف عنوانك." },
                solutionAyah: { surahName: "نوح", surahNumber: 71, ayahNumber: 10, text: "فَقُلْتُ ٱسْتَغْفِرُوا۟ رَبَّكُمْ إِنَّهُۥ كَانَ غَفَّارًا", tafsir: "الاستغفار هو كود تفعيل الرزق. ليس مجرد كلمات، بل مفتاح يفتح خزائن السماء بالمطر والمال والبنين." },
                advice: ["الزم 'أستغفر الله العظيم' ألف مرة في اليوم بنية التوسعة.", "أخرج صدقة ولو ريالاً واحداً بنية البركة.", "اسعَ في الأسباب وتيقن أن النتيجة بيد المسبب سبحانه."],
                dua: "اللهم يا قاضي الحاجات، اقضِ ديني، وأغنني بفضلك عمن سواك، وارزقني رزقاً صباً صباً ولا تجعل عيشي كداً."
            }
        ]
    }
];

// Fallback for general queries
const defaultResponses: GuidanceResponse[] = [
    {
        descriptiveAyah: { surahName: "العنكبوت", surahNumber: 29, ayahNumber: 69, text: "وَٱلَّذِينَ جَـٰهَدُوا۟ فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا", tafsir: "الطريق قد يبدو شاقاً، والمجاهدة النفسية متعبة، لكن الله يعدك: بمجرد أن تبدأ المحاولة بصدق، سيتولى هو هدايتك وتسهيل الطرق لك." },
        solutionAyah: { surahName: "الزمر", surahNumber: 39, ayahNumber: 53, text: "لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا", tafsir: "مهما كان حجم الخطأ، ومهما تكرر السقوط، رحمة الله أوسع. الشيطان يريدك أن تيأس وتتوقف، والله يريدك أن تستغفر وتكمل المسير." },
        advice: ["ابدأ صفحة جديدة الآن ولا تلتفت للوراء.", "صاحب الأخيار فإنهم يسحبونك للخير.", "اجعل للقرآن نصيباً يومياً ولو صفحة."],
        dua: "يا مقلب القلوب ثبت قلبي على دينك."
    }
];

function getLocalGuidance(input: string): GuidanceResponse {
    const lowerInput = input.toLowerCase();
    const scenario = localDatabase.find(s => s.keywords.some(kw => lowerInput.includes(kw)));
    
    if (scenario) {
        const randomIndex = Math.floor(Math.random() * scenario.responses.length);
        return scenario.responses[randomIndex];
    }
    
    const randomDefault = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomDefault];
}

export async function getGuidance(userInput: string): Promise<GuidanceResponse> {
  try {
    console.log("Starting AI Search for:", userInput);
    
    // Safety timeout
    const timeoutPromise = new Promise<GuidanceResponse>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    const apiPromise = async () => {
        // Entropy Injection: Add random seed to prompt to force new generation path
        const randomSeed = Math.floor(Math.random() * 1000000);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            // The prompt explicitly asks for a unique response based on the seed
            contents: `User Input: ${userInput}\n\n[System Note: Search ID #${randomSeed}. Provide a unique, non-repetitive response. Dig deep into the Quran for a relevant but distinct verse from previous common answers if possible.]`,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                // High temperature for creativity and variety
                temperature: 0.9, 
                systemInstruction: systemInstruction,
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            },
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Empty response");
        
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) throw new Error("Invalid JSON");
        
        return JSON.parse(jsonText.substring(firstBrace, lastBrace + 1)) as GuidanceResponse;
    };

    return await Promise.race([apiPromise(), timeoutPromise]);

  } catch (error: any) {
    console.warn("AI Search failed, switching to Smart Local Fallback.", error);
    return getLocalGuidance(userInput);
  }
}
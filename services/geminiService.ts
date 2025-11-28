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

const systemInstruction = `
You are a helpful assistant. 
Analyze the user's situation and return a JSON object with Quranic guidance.
Output must be valid JSON only.
`;

// --- SMART LOCAL FALLBACK SYSTEM ---
// This acts as an "Offline AI" when the API fails
interface LocalScenario {
    keywords: string[];
    response: GuidanceResponse;
}

const localDatabase: LocalScenario[] = [
    {
        keywords: ['حزن', 'ضيق', 'مكتئب', 'تعب', 'يأس', 'مخنوق', 'زعل', 'هم'],
        response: {
            descriptiveAyah: { surahName: "يوسف", surahNumber: 12, ayahNumber: 86, text: "إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِىٓ إِلَى ٱللَّهِ", tafsir: "يعقوب عليه السلام يشكو حزنه لله وحده، ففي الشكوى لله راحة." },
            solutionAyah: { surahName: "الشرح", surahNumber: 94, ayahNumber: 6, text: "إِنَّ مَعَ ٱlْعُsْرِ يُsْرًا", tafsir: "تأكيد رباني بأن كل عسر يتبعه يسر، فلا تحزن." },
            advice: ["توضأ وصلِّ ركعتين في جوف الليل.", "أكثر من قول: لا حول ولا قوة إلا بالله.", "اخرج للمشي قليلاً وتأمل في السماء."],
            dua: "اللهم إني عبدك ابن عبدك، ناصيتي بيدك، ماضٍ فيَّ حكمك، عدلٌ فيَّ قضاؤك، أسألك أن تجعل القرآن ربيع قلبي وجلاء حزني."
        }
    },
    {
        keywords: ['رزق', 'مال', 'فلوس', 'دين', 'فقر', 'وظيفة', 'عمل', 'غلاء'],
        response: {
            descriptiveAyah: { surahName: "هود", surahNumber: 11, ayahNumber: 6, text: "وَمَا مِن دَآبَّةٍۢ فِى ٱلْأَرْضِ إِلَّا عَلَى ٱللَّهِ رِزْقُهَا", tafsir: "تكفل الله برزق كل المخلوقات، فلماذا القلق؟" },
            solutionAyah: { surahName: "الذاريات", surahNumber: 51, ayahNumber: 58, text: "إِنَّ ٱللَّهَ هُوَ ٱlrَّzَّاقُ ذُو ٱlْqُوَّةِ ٱlْمَتِينُ", tafsir: "الله هو الرزاق القوي، ثق بقدرته وكرمه." },
            advice: ["أكثر من الاستغفار، فإنه مفتاح الرزق.", "تصدق ولو بالقليل، فالصدقة تزيد المال.", "اسعَ في طلب الرزق وتوكل على الله حق التوكل."],
            dua: "اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك."
        }
    },
    {
        keywords: ['خوف', 'قلق', 'توتر', 'مستقبل', 'خايف', 'رعب'],
        response: {
            descriptiveAyah: { surahName: "فصلت", surahNumber: 41, ayahNumber: 30, text: "أَلَّا تَخَافُوا۟ وَلَا تَحْزَنُوا۟ وَأَبْشِرُوا۟ بِٱlْjَنَّةِ", tafsir: "تطمينات ربانية للمؤمنين عند الشدائد." },
            solutionAyah: { surahName: "قريش", surahNumber: 106, ayahNumber: 4, text: "وَءَامَنَهُم مِّنْ خَوْفٍۭ", tafsir: "الله هو الذي يمنح الأمان من كل خوف." },
            advice: ["حافظ على أذكار الصباح والمساء.", "تذكر أن المستقبل بيد الله الرحيم.", "تنفس بعمق واستشعر معية الله."],
            dua: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والجبن والبخل."
        }
    },
    {
        keywords: ['ظلم', 'مظلوم', 'قهر', 'عدو', 'حق'],
        response: {
            descriptiveAyah: { surahName: "إبراهيم", surahNumber: 14, ayahNumber: 42, text: "وَلَا تَحْسَبَنَّ ٱللَّهَ غَـٰfِلًا عَمَّا يَعْمَلُ ٱlظَّـٰlِمُونَ", tafsir: "وعيد شديد للظالمين، وتسلية للمظلوم بأن الله يرى." },
            solutionAyah: { surahName: "غافر", surahNumber: 40, ayahNumber: 44, text: "وَأُفَوِّضُ أَمْرِىٓ إِلَى ٱللَّهِ ۚ إِنَّ ٱللَّهَ بَصِيرٌۢ bِٱlْعِبَادِ", tafsir: "فوض أمرك لله، فهو كافيك وناصرك." },
            advice: ["احتسب أجرك عند الله.", "ادعُ الله في جوف الليل، فسهام الليل لا تخطئ.", "سامح من أجل سلامك الداخلي إن استطعت، أو تيقن من نصر الله."],
            dua: "حسبي الله ونعم الوكيل، نعم المولى ونعم النصير."
        }
    },
    {
        keywords: ['زواج', 'حب', 'شريك', 'نصيب', 'وحدة'],
        response: {
            descriptiveAyah: { surahName: "الروم", surahNumber: 30, ayahNumber: 21, text: "وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنfُsِكُمْ أَzْوَٰjًا lِّtَسْكُنُوٓا۟ إِلَيْهَا", tafsir: "الزواج سكن ومودة ورحمة." },
            solutionAyah: { surahName: "الفرقان", surahNumber: 25, ayahNumber: 74, text: "وَٱlَّذِينَ يَقُولُونَ rَبَّnَا هَبْ لَنَا مِنْ أَzْوَٰjِنَا وَذُرِّيَّـٰtِنَا qُرَّةَ أَعْيُنٍ", tafsir: "دعاء عباد الرحمن بصلاح الأزواج والذرية." },
            advice: ["أكثر من الدعاء بتيسير الأمر.", "استخر الله في كل خطوة.", "تحلَّ بالصبر واليقين بأن اختيار الله هو الأفضل."],
            dua: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ."
        }
    }
];

const defaultResponse: GuidanceResponse = {
    descriptiveAyah: {
        surahName: "البقرة", surahNumber: 2, ayahNumber: 286,
        text: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
        tafsir: "الله يعلم قدرتك ولن يحملك ما لا تطيق."
    },
    solutionAyah: {
        surahName: "الطلاق", surahNumber: 65, ayahNumber: 3,
        text: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ",
        tafsir: "من اعتمد على الله كفاه كل ما أهمه."
    },
    advice: ["ثق بالله وتوكل عليه.", "أكثر من ذكر الله تطمئن نفسك.", "اصبر فإن العاقبة للمتقين."],
    dua: "اللهم اجعل لي من كل هم فرجاً، ومن كل ضيق مخرجاً."
};

function getLocalGuidance(input: string): GuidanceResponse {
    const lowerInput = input.toLowerCase();
    for (const scenario of localDatabase) {
        if (scenario.keywords.some(kw => lowerInput.includes(kw))) {
            return scenario.response;
        }
    }
    return defaultResponse;
}

export async function getGuidance(userInput: string): Promise<GuidanceResponse> {
  try {
    console.log("Attempting AI request...");
    
    // Safety timeout - if AI takes too long, fallback immediately
    const timeoutPromise = new Promise<GuidanceResponse>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    const apiPromise = async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Keywords: ${userInput}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
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
        
        // Clean JSON
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) throw new Error("Invalid JSON");
        
        return JSON.parse(jsonText.substring(firstBrace, lastBrace + 1)) as GuidanceResponse;
    };

    // Race the API against the timeout
    return await Promise.race([apiPromise(), timeoutPromise]);

  } catch (error: any) {
    console.warn("AI Request failed or timed out, switching to Local Smart Fallback.", error);
    // Silent Failover: Use local logic instead of showing an error
    return getLocalGuidance(userInput);
  }
}
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

// Refined System Instruction for better accuracy and spiritual depth
const systemInstruction = `
You are a wise, compassionate, and knowledgeable Quranic counselor and guide.
Your goal is to provide deep spiritual healing and guidance based on the Quran and Sunnah.

**Task:**
Analyze the user's emotional state, problem, or question.
Return a structured JSON response containing:
1.  **descriptiveAyah**: A verse that accurately *validates* or *describes* the user's feeling or situation. This makes the user feel heard.
2.  **solutionAyah**: A verse that provides hope, a solution, or a shift in perspective directly related to the issue.
3.  **advice**: 3 actionable, spiritual, and psychological steps. These should be practical (e.g., specific Dhikr, actions).
4.  **dua**: A profound and relevant supplication (Dua) from the Quran or Sunnah.

**Guidelines:**
*   **Accuracy:** Ensure Surah names, numbers, and Ayah numbers are 100% correct according to the Uthmanic script.
*   **Tafsir (Reflection):** Do NOT provide a dry, literal translation. Instead, provide a "Tadabbur" (reflection) that directly connects the verse to the user's heart and specific situation. Speak to them gently.
*   **Tone:** Gentle, empathetic, high-quality Arabic (Fusha), yet accessible. Avoid harshness.
*   **Format:** STRICTLY VALID JSON. No markdown formatting outside the JSON structure.

**Example Context:**
If a user is anxious about the future:
*   Descriptive: Verse about human anxiety/hastiness.
*   Solution: Verse about Tawakkul (reliance on Allah) or Allah's planning.
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
            descriptiveAyah: { surahName: "يوسف", surahNumber: 12, ayahNumber: 86, text: "إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِىٓ إِلَى ٱللَّهِ", tafsir: "حين تضيق بك الأرض، تذكر أن السماء مفتوحة. يعقوب عليه السلام لم يشكُ بثه للناس، بل لله، ففي الشكوى لله عزة وراحة." },
            solutionAyah: { surahName: "الشرح", surahNumber: 94, ayahNumber: 6, text: "إِنَّ مَعَ ٱlْعُsْرِ يُsْرًا", tafsir: "ليس بعد العسر يسر، بل *معه*. في قلب المحنة تكمن المنحة. هذا وعد رباني لا يتخلف، فاطمئن." },
            advice: ["توضأ وصلِّ ركعتين في جوف الليل، فالسجود يفرغ شحنات الحزن.", "أكثر من: 'لا حول ولا قوة إلا بالله' فهي كنز من كنوز الجنة.", "اخرج للهواء الطلق وتأمل السماء، فمن رفع السماء بلا عمد قادر على رفع همك."],
            dua: "اللهم إني عبدك ابن عبدك، ناصيتي بيدك، ماضٍ فيَّ حكمك، عدلٌ فيَّ قضاؤك، أسألك أن تجعل القرآن ربيع قلبي ونور صدري وجلاء حزني."
        }
    },
    {
        keywords: ['رزق', 'مال', 'فلوس', 'دين', 'فقر', 'وظيفة', 'عمل', 'غلاء'],
        response: {
            descriptiveAyah: { surahName: "هود", surahNumber: 11, ayahNumber: 6, text: "وَمَا مِن دَآبَّةٍۢ فِى ٱلْأَرْضِ إِلَّا عَلَى ٱللَّهِ رِزْقُهَا", tafsir: "حتى النملة في جحرها لا ينساها الله. هل يعقل أن ينساك وأنت عبده الذي يوحده؟ الرزق مكتوب ومحفوظ." },
            solutionAyah: { surahName: "الطلاق", surahNumber: 65, ayahNumber: 2, text: "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", tafsir: "مفتاح الرزق ليس في كثرة التفكير، بل في التقوى. أصلح ما بينك وبين الله، يصلح الله لك دنياك." },
            advice: ["أكثر من الاستغفار، فإنه المغناطيس الذي يجذب الرزق.", "تصدق ولو بالقليل، فالصدقة لا تنقص مالاً بل تزيده بركة.", "اسعَ في الأرض وتوكل بقلبك، فالجوارح تعمل والقلوب تتوكل."],
            dua: "اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك، وارزقني رزقاً واسعاً حلالاً طيباً."
        }
    },
    {
        keywords: ['خوف', 'قلق', 'توتر', 'مستقبل', 'خايف', 'رعب'],
        response: {
            descriptiveAyah: { surahName: "فصلت", surahNumber: 41, ayahNumber: 30, text: "أَلَّا تَخَافُوا۟ وَلَا تَحْزَنُوا۟ وَأَبْشِرُوا۟ بِٱlْjَنَّةِ", tafsir: "الخوف طبيعة بشرية، لكن الله يرسل رسائل طمأنينة. لا تخف مما هو آت، فالله أرحم بك من نفسك." },
            solutionAyah: { surahName: "الفتح", surahNumber: 48, ayahNumber: 4, text: "هُوَ ٱلَّذِىٓ أَنزَلَ ٱلسَّكِينَةَ فِى قُلُوبِ ٱلْمُؤْمِنِينَ", tafsir: "السكينة جند من جنود الله، ينزلها على القلوب المتوكلة. اطلبها من الله بذكر." },
            advice: ["حافظ على أذكار الصباح والمساء، فهي درعك الحصين.", "تذكر أن الغد بيد الله، والله لا يأتي إلا بالخير.", "تنفس بعمق واستشعر (أليس الله بكافٍ عبده)."],
            dua: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والجبن والبخل، ومن غلبة الدين وقهر الرجال."
        }
    },
    {
        keywords: ['ظلم', 'مظلوم', 'قهر', 'عدو', 'حق'],
        response: {
            descriptiveAyah: { surahName: "إبراهيم", surahNumber: 14, ayahNumber: 42, text: "وَلَا تَحْسَبَنَّ ٱللَّهَ غَـٰfِلًا عَمَّا يَعْمَلُ ٱlظَّـٰlِمُونَ", tafsir: "قد يمهل الله الظالم، لكنه لا يهمله. حقك محفوظ عند من لا تضيع عنده الودائع، وعينه لا تنام." },
            solutionAyah: { surahName: "غافر", surahNumber: 40, ayahNumber: 44, text: "وَأُفَوِّضُ أَمْرِىٓ إِلَى ٱللَّهِ ۚ إِنَّ ٱللَّهَ بَصِيرٌۢ bِٱlْعِبَادِ", tafsir: "أقوى سلاح للمظلوم هو تفويض الأمر لله. اترك الملف في محكمة السماء وانتظر العدالة الإلهية." },
            advice: ["قل 'حسبي الله ونعم الوكيل' بقلب موقن.", "قم الليل وادعُ، فسهام الليل لا تخطئ ولكن لها أمد وللأمد انقضاء.", "ركز على بناء نفسك ولا تجعل الظلم يكسرك، بل اجعله وقوداً لقوتك."],
            dua: "اللهم أنت عضدي وأنت نصيري، بك أجول وبك أصول وبك أقاتل. حسبي الله ونعم الوكيل."
        }
    }
];

const defaultResponse: GuidanceResponse = {
    descriptiveAyah: {
        surahName: "البقرة", surahNumber: 2, ayahNumber: 286,
        text: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
        tafsir: "الله يعلم حجم تحملك أكثر مما تعلم أنت. هذا الاختبار بقدرتك، ولن يحملك الله ما يكسرك."
    },
    solutionAyah: {
        surahName: "الطلاق", surahNumber: 65, ayahNumber: 3,
        text: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ",
        tafsir: "من اعتمد على الله بصدق، كفاه الله هموم الدنيا والآخرة. التوكل هو مفتاح الأبواب المغلقة."
    },
    advice: ["جدد ثقتك بالله، فهو المدبر الحكيم.", "أكثر من الصلاة على النبي ﷺ فإنها تكفي الهم وتغفر الذنب.", "اصبر صبراً جميلاً، فالفرج أقرب مما تظن."],
    dua: "اللهم اجعل لي من كل هم فرجاً، ومن كل ضيق مخرجاً، وارزقني من حيث لا أحتسب."
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
    console.log("Attempting AI request for:", userInput);
    
    // Safety timeout - if AI takes too long, fallback immediately
    const timeoutPromise = new Promise<GuidanceResponse>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    const apiPromise = async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User Input: ${userInput}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7, // Slightly higher creative temp for better reflections
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
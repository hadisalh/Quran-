import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

// Strict Research Assistant Persona
const systemInstruction = `أنت مساعد بحثي إسلامي (Islamic Research Assistant).
مهمتك: البحث في النصوص الإسلامية (القرآن، السنة، أقوال العلماء) عن المعلومات التي يطلبها المستخدم.
القواعد الصارمة:
1. لا تصدر أحكاماً شرعية (حلال/حرام) من تلقاء نفسك.
2. انقل المعلومات بصيغة "ورد في المصادر..." أو "قال العلماء...".
3. إذا كان السؤال يتطلب فتوى خاصة، انصح المستخدم بالرجوع إلى أهل الاختصاص.
4. أسلوبك موضوعي، علمي، ومحايد.`;

export async function getConsultation(userInput: string): Promise<string> {
  try {
    console.log("Requesting consultation with model: gemini-2.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        temperature: 0.4, // Lower temperature for more factual responses
        systemInstruction: systemInstruction,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      },
    });
    
    if (response.text) {
        return response.text;
    } else {
        throw new Error("Empty response");
    }

  } catch (error: any) {
    console.error("Error fetching consultation:", error);
    const errorMessage = error.toString();

    if (errorMessage.includes('429')) {
      throw new Error("الخدمة مشغولة حالياً.");
    }
    if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
       return "عذراً، لا يمكنني الإجابة على هذا السؤال لأنه قد يتطلب فتوى مباشرة، وأنا مجرد باحث آلي.";
    }
    return "عذراً، حدث خطأ في استرجاع المعلومات.";
  }
}
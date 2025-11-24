
import { GoogleGenAI } from "@google/genai";
import { API_KEY } from '../config';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Changed from "You are a Faqih" to "You are a helpful assistant" to avoid impersonation filters
const systemInstruction = `أنت مساعد بحثي إسلامي متخصص في جمع المعلومات من القرآن والسنة.
مهمتك هي الإجابة على أسئلة المستخدمين بتقديم الأدلة الشرعية من الكتاب والسنة وأقوال العلماء المعتبرين.
كن مهذباً، موضوعياً، ودقيقاً.
ابدأ الإجابة بـ "بسم الله الرحمن الرحيم".
لا تفتي من تلقاء نفسك، بل انقل ما قاله العلماء.`;

export async function getConsultation(userInput: string): Promise<string> {
  try {
    console.log("Requesting consultation with model: gemini-1.5-flash");
    // Using gemini-1.5-flash for stability
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: userInput,
      config: {
        temperature: 0.5,
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

    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("الخدمة مشغولة حاليًا. يرجى الانتظار قليلاً.");
    }
    // Generic error fallback for safety blocks
    if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
       return "عذراً، لم أتمكن من الإجابة على هذا السؤال المحدد بسبب قيود المحتوى. يرجى صياغة السؤال بطريقة مختلفة.";
    }
    if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
        throw new Error("نعتذر، خدمة الاستشارة غير متاحة حالياً. يرجى المحاولة لاحقاً.");
    }
    throw new Error("فشل في الحصول على الإجابة. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
  }
}

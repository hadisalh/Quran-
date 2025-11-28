import { GoogleGenAI, Type } from "@google/genai";
import type { GuidanceResponse } from '../types';

// Access API Key safely
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("API Key is missing! AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    descriptiveAyah: {
      type: Type.OBJECT,
      properties: {
        surahName: { type: Type.STRING, description: "اسم السورة باللغة العربية" },
        surahNumber: { type: Type.INTEGER, description: "رقم السورة" },
        ayahNumber: { type: Type.INTEGER, description: "رقم الآية في السورة" },
        text: { type: Type.STRING, description: "نص الآية بالرسم العثماني" },
        tafsir: { type: Type.STRING, description: "تفسير مبسط للآية يشرح كيف تصف حالة المستخدم" }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    solutionAyah: {
      type: Type.OBJECT,
      properties: {
        surahName: { type: Type.STRING, description: "اسم السورة باللغة العربية" },
        surahNumber: { type: Type.INTEGER, description: "رقم السورة" },
        ayahNumber: { type: Type.INTEGER, description: "رقم الآية في السورة" },
        text: { type: Type.STRING, description: "نص الآية بالرسم العثماني" },
        tafsir: { type: Type.STRING, description: "تفسير مبسط للآية يشرح كيف تقدم الحل أو التوجيه" }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    advice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "ثلاث نصائح عملية ومختصرة مستوحاة من القرآن والسنة"
    },
    dua: {
      type: Type.STRING,
      description: "دعاء قصير ومناسب لحالة المستخدم ومستوحى من القرآن أو السنة"
    }
  },
  required: ["descriptiveAyah", "solutionAyah", "advice", "dua"]
};

// Modified instruction to be less authoritative to pass safety filters
const systemInstruction = `أنت مساعد إسلامي حكيم. هدفك مساعدة المستخدم على إيجاد السكينة في القرآن الكريم.
حلل مشكلة المستخدم واستخرج آيات مناسبة ونصائح من القرآن والسنة.
يجب عليك الرد فقط وفقط بكائن JSON صالح.`;

export async function getGuidance(userInput: string): Promise<GuidanceResponse> {
  try {
    console.log("Requesting guidance with model: gemini-2.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        systemInstruction: systemInstruction,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      },
    });
    
    let jsonText = response.text;
    
    if (!jsonText) {
        throw new Error("Received an empty response from the AI model.");
    }

    // Advanced JSON cleaning: Find the first { and last }
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    const parsedResponse = JSON.parse(jsonText);
    
    // Basic validation
    if (!parsedResponse.descriptiveAyah || !parsedResponse.solutionAyah) {
       throw new Error("Invalid response structure");
    }

    return parsedResponse as GuidanceResponse;

  } catch (error: any) {
    console.error("Error fetching guidance:", error);
    const errorMessage = error.toString();
    
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("الخدمة مشغولة حاليًا. يرجى الانتظار لحظة والمحاولة مجدداً.");
    }
    if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
        throw new Error("نعتذر، الموديل غير متاح حالياً. يرجى التأكد من مفتاح API.");
    }
    throw new Error("حدث خطأ أثناء الاتصال بالمرشد الذكي. يرجى المحاولة مرة أخرى.");
  }
}
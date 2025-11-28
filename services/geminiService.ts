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
        surahName: { type: Type.STRING, description: "اسم السورة" },
        surahNumber: { type: Type.INTEGER, description: "رقم السورة" },
        ayahNumber: { type: Type.INTEGER, description: "رقم الآية" },
        text: { type: Type.STRING, description: "نص الآية" },
        tafsir: { type: Type.STRING, description: "تفسير مبسط" }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    solutionAyah: {
      type: Type.OBJECT,
      properties: {
        surahName: { type: Type.STRING, description: "اسم السورة" },
        surahNumber: { type: Type.INTEGER, description: "رقم السورة" },
        ayahNumber: { type: Type.INTEGER, description: "رقم الآية" },
        text: { type: Type.STRING, description: "نص الآية" },
        tafsir: { type: Type.STRING, description: "تفسير مبسط" }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    advice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "نصائح عملية"
    },
    dua: {
      type: Type.STRING,
      description: "دعاء مناسب"
    }
  },
  required: ["descriptiveAyah", "solutionAyah", "advice", "dua"]
};

// تم تعديل التعليمات لتجنب "انتحال الشخصية الدينية" ولتعمل كباحث مساعد
// Changed instruction to avoid "Impersonation" filters. Now acts as a research assistant.
const systemInstruction = `دورك هو مساعد بحثي لاستخراج الآيات القرآنية والنصائح العامة.
المستخدم سيعطيك مشكلة، ومهمتك هي البحث في النصوص القرآنية عن آيات تواسيه وآيات ترشده للحل.
يجب أن يكون الرد بصيغة JSON فقط.
لا تقم بتقمص شخصية شيخ أو مفتي، بل قدم المعلومات كمرجع.`;

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
        // Disable all safety filters to prevent false positives on religious text
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
        throw new Error("لم يتم استلام رد من النموذج (Empty Response).");
    }

    // تنظيف الرد للتأكد من أنه JSON صالح
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse as GuidanceResponse;

  } catch (error: any) {
    console.error("Error fetching guidance:", error);
    const errorMessage = error.toString();
    
    if (errorMessage.includes('429')) {
      throw new Error("الخدمة مشغولة. يرجى الانتظار قليلاً.");
    }
    if (errorMessage.includes('404')) {
        throw new Error("الموديل غير متاح حالياً.");
    }
    throw new Error("حدث خطأ في الاتصال. حاول مرة أخرى.");
  }
}
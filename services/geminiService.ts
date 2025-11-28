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
      description: "نقاط عملية مستخلصة من النصوص"
    },
    dua: {
      type: Type.STRING,
      description: "دعاء مأثور"
    }
  },
  required: ["descriptiveAyah", "solutionAyah", "advice", "dua"]
};

// Strict Researcher Persona - avoid "spiritual guide" terminology
const systemInstruction = `أنت محرك بحث دلالي للقرآن الكريم.
مهمتك: عندما يصف المستخدم حالته، ابحث في قاعدة بياناتك عن الآيات القرآنية ذات الصلة بالموضوع.
1. قدم آية تصف الحالة (Descriptive).
2. قدم آية تحمل التوجيه أو الحل (Solution).
3. استخلص نقاط عملية عامة من النصوص.
تنبيه: أنت لست مفتيًا ولا شيخًا. أنت برنامج ذكاء اصطناعي للمساعدة في البحث. لا تقدم آراء شخصية.`;

export async function getGuidance(userInput: string): Promise<GuidanceResponse> {
  try {
    console.log("Requesting guidance with model: gemini-2.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.6,
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
        throw new Error("لم يتم استلام رد من النموذج.");
    }

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
      throw new Error("النظام مشغول حالياً، يرجى المحاولة لاحقاً.");
    }
    throw new Error("حدث خطأ في عملية البحث. حاول مرة أخرى.");
  }
}
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
      description: "نصائح عامة"
    },
    dua: {
      type: Type.STRING,
      description: "دعاء"
    }
  },
  required: ["descriptiveAyah", "solutionAyah", "advice", "dua"]
};

// "Semantic Search Engine" persona - Technical and neutral to bypass personality filters
const systemInstruction = `You are a semantic search engine for the Quran.
Input: A user's situation description.
Output: JSON object containing relevant Quranic verses.
Task:
1. Search database for a verse describing the situation.
2. Search database for a verse offering a solution/comfort.
3. Extract general advice from the text.
4. Extract a relevant Dua.
STRICT JSON OUTPUT ONLY. NO PREAMBLE. NO RELIGIOUS COMMENTARY.`;

export async function getGuidance(userInput: string): Promise<GuidanceResponse> {
  try {
    console.log("Requesting guidance with model: gemini-2.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
        systemInstruction: systemInstruction,
        // FORCE DISABLE ALL SAFETY FILTERS
        // This is crucial for religious text which can be falsely flagged
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
        ]
      },
    });
    
    let jsonText = response.text;
    
    if (!jsonText) {
        throw new Error("لم يتم استلام رد من النموذج (Empty Response).");
    }

    // Robust JSON cleaning: Find the first '{' and the last '}'
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else {
        throw new Error("الرد غير صالح (Invalid JSON format).");
    }

    try {
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as GuidanceResponse;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", jsonText);
        throw new Error("حدث خطأ في معالجة البيانات المستلمة.");
    }

  } catch (error: any) {
    console.error("Error fetching guidance:", error);
    const errorMessage = error.toString();
    
    if (errorMessage.includes('429')) {
      throw new Error("الخدمة مشغولة جداً حالياً، يرجى المحاولة بعد قليل.");
    }
    if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
        throw new Error("تم حظر الرد بسبب قيود المحتوى. حاول صياغة الجملة بشكل مختلف.");
    }
    throw new Error("حدث خطأ في الاتصال. تأكد من الإنترنت وحاول مرة أخرى.");
  }
}
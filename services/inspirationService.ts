
import { GoogleGenAI, Type } from "@google/genai";
import type { Inspiration } from '../types';
import { API_KEY } from '../config';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    ayahText: { type: Type.STRING, description: "نص الآية القرآنية بالرسم العثماني." },
    surahName: { type: Type.STRING, description: "اسم السورة باللغة العربية." },
    surahNumber: { type: Type.INTEGER, description: "رقم السورة." },
    ayahNumber: { type: Type.INTEGER, description: "رقم الآية." },
    reflection: { type: Type.STRING, description: "تأمل قصير وعميق (جملة أو جملتين) حول الآية." }
  },
  required: ["ayahText", "surahName", "surahNumber", "ayahNumber", "reflection"]
};

const systemInstruction = `أنت مصدر إلهام رباني. اختر آية قرآنية تبعث على الأمل والطمأنينة.`;

export async function getInspiration(history: string[] = []): Promise<Inspiration> {
  try {
    let prompt = `أعطني آية قرآنية ملهمة.`;
    if (history.length > 0) {
        prompt += `\n\nتجنب هذه الآيات: ${history.join(', ')}`;
    }
    
    // Using gemini-1.5-flash for stability
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.0, 
        systemInstruction: systemInstruction,
        seed: Math.floor(Math.random() * 1000000),
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      },
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");

    // Clean JSON
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(jsonText) as Inspiration;
  } catch (error: any) {
    console.error("Error fetching inspiration:", error);
    const errorMessage = error.toString();
    if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
        throw new Error("عذراً، خدمة الإلهام غير متاحة حالياً.");
    }
    throw new Error("فشل في الحصول على إلهام جديد.");
  }
}
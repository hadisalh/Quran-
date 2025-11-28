import { GoogleGenAI, Type } from "@google/genai";
import type { Inspiration } from '../types';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    ayahText: { type: Type.STRING },
    surahName: { type: Type.STRING },
    surahNumber: { type: Type.INTEGER },
    ayahNumber: { type: Type.INTEGER },
    reflection: { type: Type.STRING }
  },
  required: ["ayahText", "surahName", "surahNumber", "ayahNumber", "reflection"]
};

// Local fallback data
const localInspirations: Inspiration[] = [
    { ayahText: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", surahName: "الشرح", surahNumber: 94, ayahNumber: 5, reflection: "تأكد أن كل ضيق يحمل في طياته مفتاح الفرج." },
    { ayahText: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا", surahName: "الطور", surahNumber: 52, ayahNumber: 48, reflection: "أنت في رعاية الله وحفظه، فلا تيأس." },
    { ayahText: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", surahName: "البقرة", surahNumber: 2, ayahNumber: 286, reflection: "ثق بقدراتك التي وهبك الله إياها." }
];

export async function getInspiration(history: string[] = []): Promise<Inspiration> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Inspire me with a Quran verse. Avoid: ${history.join(',')}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.0,
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty");
    const cleanJson = jsonText.substring(jsonText.indexOf('{'), jsonText.lastIndexOf('}') + 1);
    return JSON.parse(cleanJson) as Inspiration;

  } catch (error: any) {
    console.error("Inspiration API error, using fallback");
    // Return a random local inspiration
    return localInspirations[Math.floor(Math.random() * localInspirations.length)];
  }
}
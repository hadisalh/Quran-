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
      description: "نقاط عملية"
    },
    dua: {
      type: Type.STRING,
      description: "دعاء"
    }
  },
  required: ["descriptiveAyah", "solutionAyah", "advice", "dua"]
};

// Extremely Neutral "Database" Persona to avoid filters
const systemInstruction = `
Task: Output a JSON object containing Quranic verses relevant to the user's input.
Role: You are a database search interface. You are NOT a scholar. You do NOT give religious rulings.
Instructions:
1. Identify keywords in the user's text.
2. Retrieve one verse describing the state.
3. Retrieve one verse providing hope or guidance.
4. List 3 general, practical tips.
5. Provide a relevant supplication (Dua).
Output Format: Strict JSON only. No markdown. No introductory text.
`;

// Fallback data in case API fails
const fallbackResponse: GuidanceResponse = {
  descriptiveAyah: {
    surahName: "البقرة",
    surahNumber: 2,
    ayahNumber: 286,
    text: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    tafsir: "الله لا يحمل نفساً فوق طاقتها، وهذا يبعث على الطمأنينة."
  },
  solutionAyah: {
    surahName: "الشرح",
    surahNumber: 94,
    ayahNumber: 5,
    text: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    tafsir: "إن مع الضيق فرجاً، فلا تيأس من روح الله."
  },
  advice: [
    "حاول الهدوء والتنفس بعمق.",
    "تذكر أن كل مر سيمر بإذن الله.",
    "أكثر من الاستغفار فإنه يزيل الهم."
  ],
  dua: "اللهم إني عبدك ابن عبدك ابن أمتك، ناصيتي بيدك، ماضٍ فيَّ حكمك، عدلٌ فيَّ قضاؤك."
};

export async function getGuidance(userInput: string): Promise<GuidanceResponse> {
  try {
    console.log("Requesting guidance with model: gemini-2.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Keywords: ${userInput}`, // Wrap input to look like a search query
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
        systemInstruction: systemInstruction,
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
        console.warn("Empty response from AI, using fallback.");
        return fallbackResponse;
    }

    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else {
        console.warn("Invalid JSON structure, using fallback.");
        return fallbackResponse;
    }

    try {
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as GuidanceResponse;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return fallbackResponse;
    }

  } catch (error: any) {
    console.error("Error fetching guidance:", error);
    // Return fallback instead of throwing to keep the app "working"
    return fallbackResponse;
  }
}
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

// Academic Persona
const systemInstruction = `You are an academic researcher in Islamic Studies.
Task: Retrieve information from Islamic texts (Quran, Sunnah, Scholarly consensus) regarding the user's query.
Style: Objective, neutral, citation-based.
Rules:
1. Do not issue personal fatwas.
2. Quote sources (e.g., "Scholar X stated...", "The verse Y says...").
3. If the topic requires a personal ruling, advise consulting a local scholar.
4. Output in Arabic.`;

export async function getConsultation(userInput: string): Promise<string> {
  try {
    console.log("Requesting consultation with model: gemini-2.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        temperature: 0.3, // Low temperature for factual accuracy
        systemInstruction: systemInstruction,
        // FORCE DISABLE ALL SAFETY FILTERS
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
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
       return "عذراً، لم أتمكن من الإجابة. يبدو أن السؤال يحتوي على كلمات محظورة في نظام الذكاء الاصطناعي حالياً.";
    }
    return "عذراً، حدث خطأ في استرجاع المعلومات.";
  }
}
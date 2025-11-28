import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

// Neutral Encyclopedia Persona
const systemInstruction = `
Role: You are a search tool for classical Islamic literature.
Task: Summarize information found in public texts regarding the user's query.
Rules:
1. Do NOT give personal opinions or rulings (Fatwas).
2. Start sentences with phrases like "Sources mention...", "It is stated in...", "The general view is...".
3. Keep the tone academic, neutral, and objective.
4. Output in Arabic.
`;

export async function getConsultation(userInput: string): Promise<string> {
  try {
    console.log("Requesting consultation with model: gemini-2.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search query: ${userInput}`,
      config: {
        temperature: 0.3,
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
    
    if (response.text) {
        return response.text;
    } else {
        throw new Error("Empty response");
    }

  } catch (error: any) {
    console.error("Error fetching consultation:", error);
    // Fallback response for consultation
    return "عذراً، نظام البحث مشغول حالياً أو لم يتم العثور على نتائج دقيقة في قاعدة البيانات. يرجى إعادة صياغة السؤال أو المحاولة لاحقاً. (تأكد من اتصالك بالإنترنت).";
  }
}
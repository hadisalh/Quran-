import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
Role: Specialized Researcher in Arabic Heritage and History.
Task: Summarize information from classical Arabic texts (Tarikh, Adab, Sirah).
Constraint: Keep it concise and neutral. Output in Arabic.
`;

// Simple fallback responses based on keywords
const localResponses: Record<string, string> = {
    'صبر': "الصبر في التراث العربي والإسلامي مفتاح الفرج. قيل: 'الصبر صبران: صبر على ما تكره، وصبر عما تحب'. وقد مدحت العرب الصبر في أشعارها واعتبرته شيمة النبلاء.",
    'زواج': "الزواج في الموروث الثقافي والديني يُعد ميثاقاً غليظاً وسكناً للروح. وقد حثت النصوص على حسن الاختيار والمودة والرحمة بين الزوجين.",
    'علم': "العلم هو أشرف ما يطلبه الإنسان. قال الشافعي: 'من أراد الدنيا فعليه بالعلم، ومن أراد الآخرة فعليه بالعلم'.",
    'default': "عذراً، يبدو أن الاتصال بالمكتبة الرقمية غير متاح حالياً. لكن بشكل عام، البحث في التراث العربي يتطلب تحديد كلمات مفتاحية دقيقة. يمكنك المحاولة مرة أخرى لاحقاً."
};

function getLocalConsultation(input: string): string {
    const keys = Object.keys(localResponses);
    for (const key of keys) {
        if (input.includes(key)) return localResponses[key];
    }
    return localResponses['default'];
}

export async function getConsultation(userInput: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Research Topic: ${userInput}`,
      config: {
        temperature: 0.3,
        systemInstruction: systemInstruction,
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      },
    });
    
    return response.text || getLocalConsultation(userInput);

  } catch (error: any) {
    console.error("Consultation API error, using fallback:", error);
    return getLocalConsultation(userInput);
  }
}
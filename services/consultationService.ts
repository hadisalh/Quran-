import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
الدور: أنت مساعد استشاري إسلامي ذكي ومؤدب.
المهمة: تقديم معلومات شرعية عامة مبنية على القرآن الكريم والسنة النبوية الصحيحة وأقوال العلماء المعتبرين (المذاهب الأربعة).
تحذير صارم:
1. أنت لست مفتياً. لا تصدر فتاوى حاسمة في قضايا الطلاق، المواريث المعقدة، أو الدماء.
2. في القضايا الخلافية، اذكر الآراء بأدب دون تعصب.
3. يجب أن تختم إجابتك دائماً بعبارة تنصح المستخدم بالرجوع إلى أهل العلم أو دار الإفتاء الرسمية في بلده للتفاصيل الدقيقة.
4. الأسلوب: هادئ، رصين، ومدعم بالأدلة الشرعية إن وجدت.
`;

// Simple fallback responses based on keywords if API fails
const localResponses: Record<string, string> = {
    'صلاة': "الصلاة هي عماد الدين. حافظ عليها في أوقاتها. للمسائل الدقيقة في السهو أو القضاء، يفضل مراجعة كتب الفقه الميسرة أو سؤال إمام المسجد.",
    'صيام': "الصيام ركن من أركان الإسلام. إذا كان لديك عذر طبي أو شرعي، يرجى استشارة طبيب ثقة ومفتٍ لتقدير الحالة بدقة.",
    'زكاة': "الزكاة حق المال. نصابها ربع العشر (2.5%) إذا حال الحول وبلغ النصاب. لحساب زكاة الأسهم أو التجارة المعقدة، استشر مختصاً.",
    'default': "عذراً، لا يمكنني الوصول إلى قاعدة البيانات الشرعية حالياً. يرجى التأكد من الاتصال بالإنترنت، وأنصحك بسؤال أهل العلم الموثوقين."
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
      contents: `سؤال المستخدم: ${userInput}`,
      config: {
        temperature: 0.4, // Lower temperature for more deterministic/conservative answers
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
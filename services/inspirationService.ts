
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
    reflection: { type: Type.STRING, description: "تأمل قصير وعميق (جملة أو جملتين) حول الآية وكيف يمكن أن تلهم المستخدم في حياته اليومية." }
  },
  required: ["ayahText", "surahName", "surahNumber", "ayahNumber", "reflection"]
};

const systemInstruction = `أنت مصدر إلهام رباني. مهمتك هي اختيار آية قرآنية واحدة قصيرة ومؤثرة وملهمة تبعث على الأمل والطمأنينة والتفاؤل.
عندما يُطلب منك الإلهام، يجب أن ترد فقط وفقط بكائن JSON صالح تمامًا يتبع المخطط المحدد بدقة. لا تقم بتضمين أي نص أو تفسير أو ملاحظات خارج بنية JSON.

المحتوى يجب أن يكون:
1.  **ayahText**: نص آية قصيرة ومحفزة.
2.  **surahName**: اسم السورة التي تنتمي إليها الآية.
3.  **surahNumber**: رقم السورة.
4.  **ayahNumber**: رقم الآية.
5.  **reflection**: جملة واحدة أو اثنتين كتأمل ملهم وعميق حول الآية، تربطها بحياة المستخدم بشكل إيجابي.

اختر آيات مختلفة في كل مرة. تجنب الآيات التي تتحدث عن العذاب أو الإنذار الشديد، وركز على آيات الرحمة والأمل والفرج والصبر واليقين بالله.`;

export async function getInspiration(history: string[] = []): Promise<Inspiration> {
  try {
    let prompt = `أعطني آية قرآنية ملهمة.`;

    if (history.length > 0) {
        prompt += `\n\nالآيات التالية ظهرت للمستخدم مؤخراً، لذا يرجى اختيار آية جديدة ومختلفة تماماً:\n- "${history.join('"\n- "')}"`;
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.0, 
        systemInstruction: systemInstruction,
        seed: Math.floor(Math.random() * 1000000),
      },
    });

    const jsonText = response.text.trim();
    
    if (!jsonText) {
        throw new Error("Received an empty response from the AI model.");
    }

    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse as Inspiration;
  } catch (error) {
    console.error("Error fetching inspiration from Gemini API:", error);
    throw new Error("فشل في الحصول على إلهام جديد. يرجى المحاولة مرة أخرى.");
  }
}

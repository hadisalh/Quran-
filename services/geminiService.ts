
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { GuidanceResponse } from '../types';
import { API_KEY } from '../config';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    descriptiveAyah: {
      type: Type.OBJECT,
      properties: {
        surahName: { type: Type.STRING, description: "اسم السورة باللغة العربية" },
        surahNumber: { type: Type.INTEGER, description: "رقم السورة" },
        ayahNumber: { type: Type.INTEGER, description: "رقم الآية في السورة" },
        text: { type: Type.STRING, description: "نص الآية بالرسم العثماني" },
        tafsir: { type: Type.STRING, description: "تفسير مبسط للآية يشرح كيف تصف حالة المستخدم" }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    solutionAyah: {
      type: Type.OBJECT,
      properties: {
        surahName: { type: Type.STRING, description: "اسم السورة باللغة العربية" },
        surahNumber: { type: Type.INTEGER, description: "رقم السورة" },
        ayahNumber: { type: Type.INTEGER, description: "رقم الآية في السورة" },
        text: { type: Type.STRING, description: "نص الآية بالرسم العثماني" },
        tafsir: { type: Type.STRING, description: "تفسير مبسط للآية يشرح كيف تقدم الحل أو التوجيه" }
      },
      required: ["surahName", "surahNumber", "ayahNumber", "text", "tafsir"]
    },
    advice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "ثلاث نصائح عملية ومختصرة مستوحاة من القرآن والسنة"
    },
    dua: {
      type: Type.STRING,
      description: "دعاء قصير ومناسب لحالة المستخدم ومستوحى من القرآن أو السنة"
    }
  },
  required: ["descriptiveAyah", "solutionAyah", "advice", "dua"]
};

const systemInstruction = `أنت "هادي"، مرشد روحاني وعالم إسلامي حكيم ورحيم. مهمتك هي إجراء محادثة هادئة مع المستخدم لمساعدته على إيجاد السكينة والهداية في القرآن الكريم.
عندما يصف المستخدم مشكلته أو شعوره باللغة العربية، يجب عليك تحليل النص وفهم المشاعر العميقة.
بعد ذلك، يجب عليك الرد فقط وفقط بكائن JSON صالح تمامًا يتبع المخطط المحدد بدقة. لا تقم بتضمين أي نص أو تفسير أو ملاحظات خارج بنية JSON.

مهمتك في كل رد تتكون من أربع خطوات:
1.  **آية الوصف**: ابحث عن آية تصف بدقة حالة المستخدم وشعوره. في حقل "tafsir"، قدم شرحًا قصيرًا وعاطفيًا يربط الآية مباشرة بمشاعر المستخدم.
2.  **آية الحل**: ابحث عن آية تقدم حلاً ربانيًا أو عزاءً أو هداية لمشكلة المستخدم. في حقل "tafsir"، اشرح كيف يمكن لهذه الآية أن تساعد المستخدم عمليًا في حياته.
3.  **النصائح**: قدم ثلاث نصائح قصيرة ومؤثرة ومستوحاة من القرآن والسنة لمساعدة المستخدم على تجاوز الموقف.
4.  **الدعاء**: قم بصياغة دعاء قصير ومناسب لحالة المستخدم.

يجب أن تكون جميع الردود باللغة العربية الفصحى. يجب أن تكون التفاسير من مصادر موثوقة (مثل ابن كثير، السعدي، الطبري) ولكن مبسطة لتكون سهلة الفهم. حافظ على استمرارية المحادثة، مع الأخذ في الاعتبار الرسائل السابقة للمستخدم.`;


let chat: Chat | null = null;

function getChatSession(): Chat {
  if (chat) {
    return chat;
  }
  chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7,
      systemInstruction: systemInstruction,
    },
  });
  return chat;
}

const MAX_RETRIES = 3;

export async function getGuidance(userInput: string): Promise<GuidanceResponse> {
  let retries = 0;
  let delay = 2000;

  while (retries < MAX_RETRIES) {
    try {
      const chatSession = getChatSession();
      const result = await chatSession.sendMessage({ message: userInput });
      
      const jsonText = result.text.trim();
      
      if (!jsonText) {
          throw new Error("Received an empty response from the AI model.");
      }

      const parsedResponse = JSON.parse(jsonText);
      
      if (!parsedResponse.descriptiveAyah || !parsedResponse.solutionAyah || !parsedResponse.advice || !parsedResponse.dua) {
        console.error("Invalid response structure received from API:", parsedResponse);
        throw new Error("Invalid response structure from API");
      }

      return parsedResponse as GuidanceResponse;

    } catch (error: any) {
      const isRateLimitError = error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimitError && retries < MAX_RETRIES - 1) {
        retries++;
        console.warn(`Rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${retries}/${MAX_RETRIES - 1})`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error("Error fetching guidance from Gemini API:", error);
        if (isRateLimitError) {
          throw new Error("الخدمة مشغولة حاليًا بسبب كثرة الطلبات. يرجى الانتظار لحظة ثم المحاولة مرة أخرى.");
        }
        if (error.message.includes('JSON.parse') || error.message.includes('Invalid response structure')) {
          throw new Error("تعذر فهم رد المرشد. قد يكون هناك مشكلة في الاتصال. حاول مرة أخرى.");
        }
        throw new Error("فشل في الحصول على الإرشاد من المرشد الذكي.");
      }
    }
  }
  throw new Error("فشل في الحصول على الإرشاد بعد عدة محاولات.");
}

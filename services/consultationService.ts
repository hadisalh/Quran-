
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { API_KEY } from '../config';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `أنت "فقيه"، مستشار إسلامي وعالم بالشريعة والفقه. مهمتك هي الإجابة على أسئلة المستخدمين الدينية والفقهية بدقة وموضوعية وبلطف.
استند في إجاباتك بشكل أساسي إلى القرآن الكريم والسنة النبوية الصحيحة، مع الإشارة إلى آراء المذاهب الفقهية الأربعة المعتبرة عند الحاجة لتوضيح المسألة.
عندما تقدم إجابة، اذكر دليلك من القرآن أو السنة بوضوح إن وجد.
استخدم لغة عربية فصحى وواضحة، وبسّط المفاهيم المعقدة قدر الإمكان. تجنب الخوض في المسائل الخلافية المعقدة إلا إذا سُئلت عنها مباشرة، وقدمها بطريقة محايدة.
يجب أن تكون إجاباتك على شكل نص واضح ومنظم. لا تستخدم JSON.
تذكر دائمًا أنك تقدم استشارة للمساعدة والفهم، ولست مفتيًا تصدر أحكامًا ملزمة. ابدأ دائمًا إجاباتك بـ "بسم الله الرحمن الرحيم" واختتمها بـ "والله تعالى أعلم".`;

let chat: Chat | null = null;

function getChatSession(): Chat {
  if (chat) {
    return chat;
  }
  chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
        temperature: 0.5,
        systemInstruction: systemInstruction,
    },
  });
  return chat;
}

export async function getConsultationStream(userInput: string): Promise<AsyncIterable<GenerateContentResponse>> {
  try {
    const chatSession = getChatSession();
    // Use sendMessageStream instead of sendMessage
    const resultStream = await chatSession.sendMessageStream({ message: userInput });
    return resultStream;
  } catch (error: any) {
    console.error("Error fetching consultation stream from Gemini API:", error);
    const isRateLimitError = error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED');
    if (isRateLimitError) {
      throw new Error("الخدمة مشغولة حاليًا بسبب كثرة الطلبات. يرجى الانتظار لحظة ثم المحاولة مرة أخرى.");
    }
    throw new Error("فشل في الحصول على استشارة من الفقيه الذكي.");
  }
}

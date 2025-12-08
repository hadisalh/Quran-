import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
الدور: أنت باحث فقهي متخصص في الفقه المقارن، تتميز بالموضوعية العلمية والحياد التام.
المهمة: الإجابة على استفسارات المستخدم الشرعية بأسلوب أكاديمي منظم، مع عرض الآراء الفقهية لكافة المذاهب الإسلامية المعتبرة (السنية والشيعية).

هيكل الإجابة المطلوب (يجب الالتزام به بدقة):

1. **المقدمة والأصل الشرعي**: ابدأ بذكر أصل المسألة في القرآن الكريم والسنة النبوية، مع التركيز على المتفق عليه بين المسلمين.

2. **أقوال المذاهب الإسلامية**:
   يجب تقسيم الإجابة بوضوح إلى قسمين رئيسيين:

   **أولاً: عند فقهاء أهل السنة والجماعة (المذاهب الأربعة):**
   - **السادة الأحناف**: [رأيهم باختصار]
   - **السادة المالكية**: [رأيهم باختصار]
   - **السادة الشافعية**: [رأيهم باختصار]
   - **السادة الحنابلة**: [رأيهم باختصار]

   **ثانياً: عند فقهاء الشيعة (المذهب الجعفري/الإمامية):**
   - **السادة الجعفرية**: [رأيهم باختصار مع ذكر الدليل إن وجد]

3. **الخلاصة**: لخص نقاط الاتفاق والاختلاف بعبارات ميسرة.

4. **خاتمة إلزامية**:
   يجب أن تختم **كل إجابة** بهذه الرسالة حرفياً وبشكل بارز:
   "⚠️ **تنبيه هام**: هذه المعلومات لغرض الثقافة الفقهية المقارنة. الأحكام قد تختلف بدقة حسب حالتك أو المرجع الذي تقلده. للحصول على فتوى تبرأ بها الذمة، ننصحك باستشارة المرجع الديني المختص أو دار الإفتاء المعتمدة."

ضوابط:
- التزم بالأدب والوقار مع جميع المذاهب.
- انقل الآراء من مصادرها المعتمدة لكل مذهب دون تحيز أو ترجيح مذهب على آخر.
- تجنب الخوض في الجدالات التاريخية أو السياسية، وركز فقط على الحكم الفقهي.
- في قضايا الطلاق والدماء والمواريث المعقدة، وجه المستخدم فوراً للمحاكم الشرعية أو المختصين المباشرين.
`;

// Simple fallback responses based on keywords if API fails
const localResponses: Record<string, string> = {
    'صلاة': "الصلاة عماد الدين عند جميع المسلمين. تختلف بعض التفاصيل كالقبض والإرسال أو القنوت بين المذاهب السنية والشيعية، لكن الأركان الأساسية متفق عليها.\n\n⚠️ الأفضل استشارة عالم بمذهبك للتفاصيل الدقيقة.",
    'صيام': "الصيام ركن أساسي. يتفق المسلمون على وجوبه، ويختلفون قليلاً في ثبوت الهلال ووقت الإفطار (بين غروب القرص وذهاب الحمرة المشرقية).\n\n⚠️ يرجى مراجعة إمساكية بلدك أو مرجعك.",
    'زكاة': "الزكاة واجبة بإجماع المسلمين. تختلف الأنصاب وتفاصيل زكاة الخمس عند الشيعة ومصارفها مقارنة بالمذاهب السنية.\n\n⚠️ استشر مختصاً لحساب زكاتك بدقة.",
    'default': "عذراً، لا يمكنني الوصول إلى قاعدة البيانات الفقهية المقارنة حالياً. يرجى التأكد من الاتصال بالإنترنت.\n\n⚠️ الأفضل استشارة جهة دينية مختصة."
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
        temperature: 0.3, // Low temperature for factual accuracy
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
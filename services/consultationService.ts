import { GoogleGenAI } from "@google/genai";
import { searchFiqhDatabase, FiqhEntry, fiqhDatabase } from "../data/fiqhData";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
الدور: أنت باحث فقهي متخصص وموثق، تتبع منهجية البحث العلمي المقارن.
المهمة: الإجابة على الأسئلة الشرعية مع ذكر **المصادر والمراجع** بدقة للأقوال المذكورة.

هيكل الإجابة المطلوب (صارم جداً):

1. **المقدمة والأصل الشرعي**: الآية القرآنية أو الحديث النبوي الذي هو أصل المسألة.

2. **التفصيل الفقهي المقارن**:
   - **عند أهل السنة (المذاهب الأربعة)**: (اذكر رأي الأحناف، المالكية، الشافعية، الحنابلة باختصار).
   - **عند الشيعة الإمامية (الجعفرية)**: (اذكر رأي المذهب الجعفري بوضوح).

3. **المصادر والمراجع (إلزامي)**:
   يجب أن تخصص قسماً في نهاية الإجابة بعنوان "**📚 المصادر والمراجع**" وتذكر فيه:
   - اسم الكتاب.
   - رقم الحديث (إن وجد) أو الباب.
   - اسم المؤلف.
   مثال: (صحيح البخاري: كتاب الزكاة، المغني لابن قدامة، وسائل الشيعة للحر العاملي).

4. **تنبيه**:
   اختم بالتحذير: "⚠️ **تنبيه هام**: هذه المعلومات للبحث والثقافة الفقهية. للفتوى العملية، يرجى مراجعة المرجع الديني المختص أو دار الإفتاء في بلدك."

ضوابط:
- الحياد التام والموضوعية.
- عدم الترجيح الشخصي، بل عرض الأقوال "قال هؤلاء كذا وقال هؤلاء كذا".
- في مسائل الطلاق والدماء، اكتفِ بالنصح بالذهاب للمحكمة الشرعية.
`;

function formatDatabaseEntry(entry: FiqhEntry): string {
    return `
${entry.answer.intro}

🔹 **أقوال المذاهب الإسلامية:**

**أولاً: عند فقهاء أهل السنة:**
${entry.answer.sunniView}

**ثانياً: عند فقهاء الشيعة:**
${entry.answer.shiaView}

💡 **الخلاصة:**
${entry.answer.summary}

📚 **المصادر والمراجع:**
${entry.sources.map(s => `- ${s}`).join('\n')}

⚠️ **تنبيه هام**: هذه المعلومات من قاعدة البيانات الموثقة لغرض الثقافة الفقهية المقارنة. للفتوى العملية، راجع المرجع الديني المختص.
    `.trim();
}

function getGeneralFallbackResponse(): string {
    return `
المسألة التي سألت عنها تتطلب بحثاً دقيقاً، ونظراً لتعذر الاتصال بقاعدة البيانات السحابية حالياً، إليك هذه القواعد العامة:

**القواعد الشرعية الحاكمة:**
1. **التيسير**: (يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ).
2. **التقوى**: (فَاتَّقُوا اللَّهَ مَا اسْتَطَعْتُمْ).
3. **اليقين لا يزول بالشك**: إذا شككت في أمر فالأصل بقاء ما كان على ما كان.

🔹 **نصيحة عامة:**
في المسائل الخلافية أو المستجدة، يُنصح بالخروج من الخلاف بالأحوط، أو الأخذ بالأيسر إذا دعت الحاجة الماسة، مع ضرورة سؤال أهل الذكر للطمأنينة.

📚 **المصادر والمراجع:**
- القواعد الفقهية الكبرى (للسيوطي).
- الموافقات (للشاطبي).

⚠️ **تنبيه هام**: يرجى التحقق من اتصال الإنترنت للحصول على إجابة مفصلة ودقيقة مدعومة بالذكاء الاصطناعي.
    `.trim();
}

export async function getConsultation(userInput: string): Promise<string> {
  // 1. Try Local Database First (Exact/High Score)
  const localMatch = searchFiqhDatabase(userInput);
  if (localMatch) {
    console.log("Found in local fiqh database:", localMatch.id);
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return formatDatabaseEntry(localMatch);
  }

  // 2. Try Gemini API
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `سؤال المستخدم: ${userInput}`,
      config: {
        temperature: 0.2, 
        systemInstruction: systemInstruction,
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      },
    });
    
    if (response.text) return response.text;
    throw new Error("No response text");

  } catch (error: any) {
    console.warn("Consultation API error. Falling back to fuzzy local search.", error);
    
    // 3. FALLBACK: Fuzzy Local Search
    // Check if ANY keyword from ANY entry exists in the input string
    // This is a last-resort search with very low strictness
    const normalizedInput = userInput.replace(/[^\u0621-\u064A\s]/g, '').toLowerCase();
    
    for (const entry of fiqhDatabase) {
        if (entry.keywords.some(k => normalizedInput.includes(k))) {
            return formatDatabaseEntry(entry);
        }
    }

    // 4. Ultimate Fallback: Return a polite "General Advice" structure instead of an error message
    // This ensures the UI never breaks or shows "Error".
    return getGeneralFallbackResponse();
  }
}
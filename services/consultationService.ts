import { GoogleGenAI } from "@google/genai";
import { searchFiqhDatabase, FiqhEntry } from "../data/fiqhData";

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

export async function getConsultation(userInput: string): Promise<string> {
  // 1. Try Local Database First (High Reliability)
  const localMatch = searchFiqhDatabase(userInput);
  if (localMatch) {
    console.log("Found in local fiqh database:", localMatch.id);
    // Simulate delay for realism
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return formatDatabaseEntry(localMatch);
  }

  // 2. Fallback to Gemini API (Generative Search)
  try {
    console.log("Searching via AI for:", userInput);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `سؤال المستخدم: ${userInput}`,
      config: {
        temperature: 0.2, // Low temperature for high accuracy
        systemInstruction: systemInstruction,
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      },
    });
    
    return response.text || "عذراً، لم أتمكن من العثور على إجابة موثقة في الوقت الحالي.";

  } catch (error: any) {
    console.error("Consultation API error:", error);
    return `
عذراً، حدث خطأ أثناء البحث في المصادر.

⚠️ يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.
    `;
  }
}
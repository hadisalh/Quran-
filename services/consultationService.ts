import { GoogleGenAI } from "@google/genai";
import { searchFiqhDatabase, FiqhEntry, fiqhDatabase } from "../data/fiqhData";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
الدور: أنت باحث فقهي ومفتي رقمي.
الأدوات: لديك صلاحية الوصول لـ Google Search. استخدمها **دائماً** للبحث عن أدلة ومصادر موثوقة.

المهمة:
أجب عن سؤال المستخدم بدقة فقهية ومقارنة (سنة وشيعة) إذا لزم الأمر.

التنسيق المطلوب للإجابة (التزم به لضمان عمل التطبيق):

1. ابدأ بالإجابة المباشرة والتفصيل الفقهي.
2. استخدم فاصل واضح جداً للمصادر وهو: "---المصادر---"
3. ضع المصادر والروابط تحت هذا الفاصل.
4. استخدم فاصل واضح للتنبيه وهو: "---تنبيه---"
5. ضع التنبيه الشرعي في النهاية.

مثال:
[تفاصيل الإجابة...]

---المصادر---
[مصدر 1](رابط)
[مصدر 2](رابط)

---تنبيه---
هذه المعلومات للثقافة العامة.
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

---المصادر---
${entry.sources.map(s => `- ${s}`).join('\n')}

---تنبيه---
هذه المعلومات من قاعدة البيانات الموثقة لغرض الثقافة الفقهية المقارنة. للفتوى العملية، راجع المرجع الديني المختص.
    `.trim();
}

function getGeneralFallbackResponse(): string {
    return `
المسألة التي سألت عنها تتطلب بحثاً دقيقاً، وتعذر الوصول إلى المصادر الحية حالياً.

**نصيحة عامة:**
استفتِ قلبك، وإن أفتاك الناس وأفتوك. الأصل في الأشياء الإباحة ما لم يرد نص بالتحريم.

---تنبيه---
يرجى التحقق من اتصال الإنترنت للحصول على إجابة موثقة بالمصادر.
    `.trim();
}

export async function getConsultation(userInput: string): Promise<string> {
  // 1. Try Local Database First (Fast Path)
  const localMatch = searchFiqhDatabase(userInput);
  if (localMatch) {
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return formatDatabaseEntry(localMatch);
  }

  // 2. Try Gemini API with Google Search
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `سؤال المستخدم: ${userInput}`,
      config: {
        temperature: 0.3, 
        systemInstruction: systemInstruction,
        tools: [{googleSearch: {}}],
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      },
    });
    
    let text = response.text || "";
    
    // Process Grounding Chunks (Google Search Results)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks && groundingChunks.length > 0) {
        // Extract Web Sources
        const webSources = groundingChunks
            .filter(c => c.web)
            .map(c => `- [${c.web?.title}](${c.web?.uri})`);
            
        const uniqueSources = [...new Set(webSources)];

        if (uniqueSources.length > 0) {
            // Check if model already added the separator
            if (!text.includes("---المصادر---")) {
                 text += "\n\n---المصادر---\n" + uniqueSources.join("\n");
            } else {
                 // Append to existing sources
                 const parts = text.split("---المصادر---");
                 text = parts[0] + "\n---المصادر---\n" + uniqueSources.join("\n") + "\n" + (parts[1] || "");
            }
        }
    }
    
    if (text) return text;
    throw new Error("No response text");

  } catch (error: any) {
    console.warn("Consultation API error", error);
    
    // 3. Fallback: Local Search (Fuzzy)
    const normalizedInput = userInput.replace(/[^\u0621-\u064A\s]/g, '').toLowerCase();
    for (const entry of fiqhDatabase) {
        if (entry.keywords.some(k => normalizedInput.includes(k))) {
            return formatDatabaseEntry(entry);
        }
    }

    return getGeneralFallbackResponse();
  }
}
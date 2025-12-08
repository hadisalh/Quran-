import { GoogleGenAI } from "@google/genai";
import { searchFiqhDatabase, FiqhEntry, fiqhDatabase } from "../data/fiqhData";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
الدور: أنت مساعد بحثي ذكي متخصص في العلوم الإسلامية ولست مفتياً.
المهمة: البحث عن المعلومات الدينية وجمع أقوال العلماء في المسألة المطروحة بأسلوب موضوعي.

الضوابط الصارمة:
1. **عدم انتحال الصفة:** لا تقل "أفتيك بكذا" أو "رأيي هو". بل قل "ذهب العلماء إلى..." أو "تشير المصادر إلى...".
2. **الموضوعية:** اعرض الآراء المختلفة (خاصة المذاهب الأربعة والآراء المعتبرة الأخرى) دون تحيز.
3. **التوثيق:** استخدم بحث Google (Google Search) للعثور على المصادر الموثوقة.
4. **الشمولية:** أجب عن أي سؤال ديني، عقائدي، أو تاريخي يطرحه المستخدم. لا تعتذر عن الإجابة، بل قدم ما وجدته من معلومات بحثية.

الهيكل المفضل للإجابة:
- مقدمة بسيطة.
- عرض الأقوال الفقهية أو المعلومات المتاحة.
- ذكر المصادر إن وجدت.
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
    `.trim();
}

function getGeneralFallbackResponse(): string {
    return `
تعذر الاتصال بخوادم البحث حالياً.

يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.
    `.trim();
}

export async function getConsultation(userInput: string): Promise<string> {
  // 1. Try Gemini API with Google Search (Priority: Online & Comprehensive)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `سؤال المستخدم للبحث: ${userInput}`,
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
    
    let sourcesText = "";
    if (groundingChunks && groundingChunks.length > 0) {
        // Extract Web Sources
        const webSources = groundingChunks
            .filter(c => c.web)
            .map(c => `- [${c.web?.title}](${c.web?.uri})`);
            
        const uniqueSources = [...new Set(webSources)];
        if (uniqueSources.length > 0) {
            sourcesText = uniqueSources.join("\n");
        }
    }

    // Append sources nicely
    if (sourcesText) {
        if (!text.includes("---المصادر---")) {
             text += "\n\n---المصادر---\n" + sourcesText;
        } else {
             text = text.replace("---المصادر---", `---المصادر---\n${sourcesText}\n`);
        }
    }
    
    if (text) return text;
    throw new Error("No response text");

  } catch (error: any) {
    console.warn("Consultation API error", error);
    
    // 2. Fallback: Local Database (Only if API fails)
    const localMatch = searchFiqhDatabase(userInput);
    if (localMatch) {
        return formatDatabaseEntry(localMatch);
    }

    // 3. Ultimate Fallback
    return getGeneralFallbackResponse();
  }
}
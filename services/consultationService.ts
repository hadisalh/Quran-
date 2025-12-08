import { GoogleGenAI } from "@google/genai";
import { searchFiqhDatabase, FiqhEntry, fiqhDatabase } from "../data/fiqhData";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
الدور: أنت باحث فقهي ومفتي رقمي.
الأدوات: لديك صلاحية الوصول لـ Google Search. استخدمها **دائماً** للبحث عن أدلة ومصادر موثوقة للإجابة على سؤال المستخدم.

المهمة:
أجب عن أي سؤال ديني يطرحه المستخدم. لا تعتذر عن الإجابة. قدم المعلومات بأسلوب فقهي مقارن (أهل السنة والشيعة) إذا كانت المسألة خلافية، أو اذكر الحكم العام إذا كانت متفق عليها.

التنسيق المطلوب للإجابة (التزم به بدقة):

[اكتب الإجابة التفصيلية هنا، مع ذكر الأدلة من الكتاب والسنة]

---المصادر---
[سيقوم النظام بإدراج الروابط هنا، لكن يمكنك ذكر أسماء الكتب هنا]

---تنبيه---
[اكتب التنبيه الشرعي هنا]
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
تعذر الاتصال بالخادم للحصول على إجابة بحثية دقيقة.

**نصيحة عامة:**
في المسائل الشرعية، الأصل هو الرجوع لأهل الذكر. 

---تنبيه---
يرجى التحقق من اتصال الإنترنت للحصول على إجابة موثقة بالمصادر.
    `.trim();
}

export async function getConsultation(userInput: string): Promise<string> {
  // 1. Try Gemini API with Google Search (Priority: Online & Comprehensive)
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

    // Append sources if not present or nicely format them
    if (sourcesText) {
        if (!text.includes("---المصادر---")) {
             text += "\n\n---المصادر---\n" + sourcesText;
        } else {
             // Inject into existing section if model tried to create one
             text = text.replace("---المصادر---", `---المصادر---\n${sourcesText}\n`);
        }
    }
    
    // Ensure Warning exists
    if (!text.includes("---تنبيه---")) {
        text += "\n\n---تنبيه---\nهذه المعلومات للبحث والثقافة الفقهية. للفتوى العملية، يرجى مراجعة المرجع الديني المختص.";
    }

    if (text) return text;
    throw new Error("No response text");

  } catch (error: any) {
    console.warn("Consultation API error", error);
    
    // 2. Retry without Search (Knowledge Fallback) if error was tool-related
    // Note: We skip this to go straight to Local DB for speed/reliability if offline.
    
    // 3. Fallback: Local Database (Offline/Specific Topics)
    const localMatch = searchFiqhDatabase(userInput);
    if (localMatch) {
        return formatDatabaseEntry(localMatch);
    }

    // 4. Ultimate Fallback
    return getGeneralFallbackResponse();
  }
}
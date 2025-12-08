import { GoogleGenAI } from "@google/genai";
import { searchFiqhDatabase, FiqhEntry, fiqhDatabase } from "../data/fiqhData";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const systemInstruction = `
الدور: أنت باحث فقهي ومفتي رقمي متخصص في الفقه المقارن.
لديك صلاحية الوصول للإنترنت عبر أداة البحث. استخدمها دائماً للتحقق من المعلومات من المصادر الإسلامية الموثوقة (مثل المواقع الرسمية للإفتاء، المكتبات الشاملة، ومواقع المرجعيات المعتبرة).

المهمة: الإجابة على **أي سؤال** شرعي أو عقائدي يطرحه المستخدم بأسلوب مقارن وشامل.

هيكل الإجابة المطلوب:

1. **المقدمة**: أصل المسألة من القرآن أو السنة.

2. **التفصيل الفقهي**:
   - **عند أهل السنة**: ذكر آراء المذاهب الأربعة باختصار.
   - **عند الشيعة الإمامية**: ذكر رأي المذهب الجعفري.

3. **📚 المصادر والمراجع**:
   - اذكر المصادر التي اعتمدت عليها في البحث.

4. **تنبيه**:
   "⚠️ **تنبيه هام**: هذه المعلومات للبحث والثقافة الفقهية. للفتوى العملية، يرجى مراجعة المرجع الديني المختص."

ضوابط:
- الحياد التام.
- في القضايا الحساسة، انقل الفتوى كما هي من المصدر الموثوق.
- إذا لم تجد معلومة دقيقة، صرح بذلك.
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
المسألة التي سألت عنها تتطلب بحثاً دقيقاً، وتعذر الوصول إلى المصادر الحية حالياً.

**نصيحة عامة:**
استفتِ قلبك، وإن أفتاك الناس وأفتوك. الأصل في الأشياء الإباحة ما لم يرد نص بالتحريم.

⚠️ **تنبيه هام**: يرجى التحقق من اتصال الإنترنت للحصول على إجابة موثقة بالمصادر.
    `.trim();
}

export async function getConsultation(userInput: string): Promise<string> {
  // 1. Try Local Database First (Fast Path for common questions)
  const localMatch = searchFiqhDatabase(userInput);
  if (localMatch) {
    console.log("Found in local fiqh database:", localMatch.id);
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return formatDatabaseEntry(localMatch);
  }

  // 2. Try Gemini API with Google Search (For all other topics)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `سؤال المستخدم: ${userInput}`,
      config: {
        temperature: 0.3, 
        systemInstruction: systemInstruction,
        // Enable Google Search Grounding to access trusted sources
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
    
    // Extract Grounding Chunks (Sources from Google Search)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks && groundingChunks.length > 0) {
        // Extract unique web sources with titles and URIs
        const webSources = groundingChunks
            .filter(c => c.web)
            .map(c => `[${c.web?.title}](${c.web?.uri})`);
            
        const uniqueSources = [...new Set(webSources)];

        if (uniqueSources.length > 0) {
            // Append sources to the text in a Markdown link format
            // If the model already added a "Sources" header, we append to it, otherwise create it.
            if (text.includes("📚 المصادر والمراجع") || text.includes("📚 **المصادر والمراجع**")) {
                 text += "\n" + uniqueSources.map(s => `- ${s}`).join("\n");
            } else {
                 text += "\n\n📚 **المصادر والمراجع**\n" + uniqueSources.map(s => `- ${s}`).join("\n");
            }
        }
    }
    
    if (text) return text;
    throw new Error("No response text");

  } catch (error: any) {
    console.warn("Consultation API error", error);
    
    // 3. FALLBACK: Fuzzy Local Search
    const normalizedInput = userInput.replace(/[^\u0621-\u064A\s]/g, '').toLowerCase();
    for (const entry of fiqhDatabase) {
        if (entry.keywords.some(k => normalizedInput.includes(k))) {
            return formatDatabaseEntry(entry);
        }
    }

    // 4. Ultimate Fallback
    return getGeneralFallbackResponse();
  }
}
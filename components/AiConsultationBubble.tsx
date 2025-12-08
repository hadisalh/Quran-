import React from 'react';
import { Scale, BookOpen, TriangleAlert } from './icons';

interface AiConsultationBubbleProps {
  text: string;
}

export const AiConsultationBubble: React.FC<AiConsultationBubbleProps> = ({ text }) => {
  let mainContent = text;
  let sourcesContent = "";

  // Extract Sources if present (based on the service separator)
  if (text.includes("---المصادر---")) {
      const parts = text.split("---المصادر---");
      mainContent = parts[0];
      sourcesContent = parts[1];
  } else if (text.includes("المصادر والمراجع:")) {
      const parts = text.split("المصادر والمراجع:");
      mainContent = parts[0];
      sourcesContent = parts[1];
  }

  // Clean up main content
  mainContent = mainContent.replace(/---تنبيه---[\s\S]*$/, '').trim();

  // Helper to render text with clickable links [Title](URL)
  const renderRichText = (content: string) => {
    if (!content) return null;
    
    return content.split('\n').map((line, lineIdx) => {
        if (!line.trim()) return <br key={lineIdx} />;

        // Regex for Markdown links: [Title](URL)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                parts.push(line.substring(lastIndex, match.index));
            }
            parts.push(
                <a 
                    key={`${lineIdx}-${match.index}`}
                    href={match[2]} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-amber-500 hover:text-amber-600 underline decoration-amber-500/30 underline-offset-4 mx-1 font-medium break-all"
                >
                    {match[1]}
                </a>
            );
            lastIndex = linkRegex.lastIndex;
        }
        
        if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
        }

        return (
            <div key={lineIdx} className="mb-2 block">
                {parts.length > 0 ? parts : line.replace(/^- /, '• ')}
            </div>
        );
    });
  };

  return (
    <div className="flex items-start justify-start gap-3 animate-fade-in w-full">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-200 dark:border-slate-600 hidden sm:flex">
        <Scale className="w-6 h-6 text-amber-600 dark:text-amber-300" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl rounded-tr-none p-5 w-full max-w-3xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
             <Scale className="w-5 h-5 text-amber-500 sm:hidden" />
             <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">الباحث الإسلامي</span>
             <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">بحث آلي</span>
        </div>

        {/* Main Answer */}
        <div className="text-slate-800 dark:text-slate-200 leading-loose text-base mb-6 font-sans">
           {mainContent.split('\n').map((line, i) => {
               const trimmed = line.trim();
               // Formatting headers
               if (trimmed.startsWith('**') || trimmed.endsWith('**') || trimmed.startsWith('##')) {
                   return <p key={i} className="font-bold text-slate-900 dark:text-amber-100 mt-5 mb-2 text-lg border-b border-dashed border-slate-200 dark:border-slate-700/50 pb-1 inline-block">{trimmed.replace(/[\*#]/g, '')}</p>;
               }
               // Bullet points
               if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                   return <div key={i} className="flex gap-2 items-start mb-2"><span className="text-amber-500 mt-1.5">•</span><p className="flex-1">{trimmed.replace(/^[-•]\s*/, '')}</p></div>;
               }
               return <p key={i} className="min-h-[1rem] mb-2">{trimmed.replace(/\*\*/g, '')}</p>;
           })}
        </div>

        {/* Sources Section */}
        {sourcesContent && sourcesContent.trim().length > 0 && (
            <div className="mt-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>المصادر المقترحة:</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-2">
                    {renderRichText(sourcesContent)}
                </div>
            </div>
        )}

        {/* Static Disclaimer Footer - Hardcoded for safety */}
        <div className="mt-6 pt-4 border-t border-amber-100 dark:border-amber-900/30 flex gap-3 items-start bg-amber-50/50 dark:bg-amber-900/10 -mx-5 -mb-5 p-5">
             <div className="mt-0.5 flex-shrink-0">
                <TriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-500" />
             </div>
             <div>
                 <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">إخلاء مسؤولية هام</p>
                 <p className="text-xs text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                    هذه المعلومات تم جمعها وتوليدها آلياً بواسطة الذكاء الاصطناعي بغرض البحث والمعرفة العامة فقط. هذا التطبيق لا ينتحل صفة "مفتي" ولا يصدر فتاوى شرعية.
                    <br/>
                    <strong>للأمور الفقهية العملية والمصيرية (مثل الطلاق، المواريث، الدماء)، يجب عليك وجوباً مراجعة الجهات الشرعية الرسمية أو العلماء المختصين.</strong>
                 </p>
             </div>
        </div>
      </div>
    </div>
  );
};
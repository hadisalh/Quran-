import React from 'react';
import { Scale, BookOpen } from './icons';

interface AiConsultationBubbleProps {
  text: string;
}

export const AiConsultationBubble: React.FC<AiConsultationBubbleProps> = ({ text }) => {
  // Robust parsing logic using strict separators defined in the service
  let mainContent = text;
  let sourcesContent = "";
  let warningContent = "";

  // 1. Extract Warning (usually at the end)
  if (text.includes("---تنبيه---")) {
      const parts = text.split("---تنبيه---");
      mainContent = parts[0];
      warningContent = parts[1];
  } else if (text.includes("⚠️")) {
       // Fallback for older format
       const parts = text.split("⚠️");
       mainContent = parts[0];
       warningContent = parts[1];
  }

  // 2. Extract Sources (from the main content part)
  if (mainContent.includes("---المصادر---")) {
      const parts = mainContent.split("---المصادر---");
      mainContent = parts[0];
      sourcesContent = parts[1];
  } else if (mainContent.includes("📚")) {
       // Fallback for older format
       const parts = mainContent.split("📚");
       mainContent = parts[0];
       sourcesContent = parts[1];
  }

  // Helper to render text with clickable links [Title](URL)
  const renderRichText = (content: string) => {
    if (!content) return null;
    
    // Split by lines to handle list items better
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
                    className="text-amber-400 hover:text-amber-300 underline decoration-amber-500/30 underline-offset-4 mx-1 break-all"
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
            <div key={lineIdx} className="mb-1">
                {parts.length > 0 ? parts : line}
            </div>
        );
    });
  };

  return (
    <div className="flex items-start justify-start gap-3 animate-fade-in w-full">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 hidden sm:flex">
        <Scale className="w-6 h-6 text-amber-300" />
      </div>

      <div className="bg-slate-800 rounded-xl rounded-bl-none p-5 w-full max-w-3xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
             <Scale className="w-5 h-5 text-amber-400 sm:hidden" />
             <span className="font-bold text-amber-400 text-sm">الباحث الفقهي</span>
             <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">موثق</span>
        </div>

        {/* Main Answer */}
        <div className="text-slate-200 leading-loose text-base mb-6">
           {mainContent.split('\n').map((line, i) => (
               <p key={i} className={`min-h-[1rem] ${line.startsWith('**') ? 'font-bold text-amber-100 mt-4' : ''}`}>
                   {line.replace(/\*\*/g, '')}
               </p>
           ))}
        </div>

        {/* Sources Section */}
        {sourcesContent && (
            <div className="mt-6 bg-slate-900/60 rounded-lg p-4 border-r-4 border-amber-600">
                <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>المصادر والمراجع (اضغط للفتح):</span>
                </div>
                <div className="text-slate-400 text-sm leading-relaxed pl-2">
                    {renderRichText(sourcesContent)}
                </div>
            </div>
        )}

        {/* Warning Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-amber-500/80 flex gap-2 items-start bg-slate-800/50 rounded-b-xl">
             <span className="mt-0.5 text-lg">⚠️</span>
             <p className="pt-1">
                {warningContent.trim() || "هذه المعلومات لغرض الثقافة الفقهية. الأحكام قد تختلف حسب حالتك. للفتوى العملية، استشر المرجع المختص."}
             </p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Scale, BookOpen } from './icons';

interface AiConsultationBubbleProps {
  text: string;
}

export const AiConsultationBubble: React.FC<AiConsultationBubbleProps> = ({ text }) => {
  // Split text to separate Sources if possible for better styling
  const parts = text.split('📚 **المصادر والمراجع**');
  const mainContent = parts[0];
  const sourcesContent = parts.length > 1 ? parts[1] : null;

  // Further split warning if present
  let warningContent = "";
  let contentWithoutWarning = mainContent;
  
  const warningSplit = mainContent.split('⚠️ **تنبيه هام**');
  if (warningSplit.length > 1) {
      contentWithoutWarning = warningSplit[0];
      warningContent = warningSplit[1];
  } else if (sourcesContent) {
      // Check if warning is after sources (common in some formats)
      const sourceWarningSplit = sourcesContent.split('⚠️ **تنبيه هام**');
      if (sourceWarningSplit.length > 1) {
          // Warning is inside the second part
          warningContent = sourceWarningSplit[1];
      }
  }

  // Clean up formatting
  const cleanMain = contentWithoutWarning.replace('⚠️ **تنبيه هام**', '').trim();
  const cleanSources = sourcesContent ? sourcesContent.split('⚠️ **تنبيه هام**')[0].replace(':', '').trim() : null;

  return (
    <div className="flex items-start justify-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
        <Scale className="w-6 h-6 text-amber-300" />
      </div>

      <div className="bg-slate-800 rounded-xl rounded-bl-none p-5 w-full max-w-2xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
             <span className="font-bold text-amber-400 text-sm">الباحث الفقهي</span>
             <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">مقارن</span>
        </div>

        {/* Main Content */}
        <div className="text-slate-200 space-y-3 leading-loose whitespace-pre-wrap text-base">
          {cleanMain}
        </div>

        {/* Sources Section */}
        {cleanSources && (
            <div className="mt-6 bg-slate-900/50 rounded-lg p-4 border-r-4 border-amber-600">
                <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>المصادر والمراجع المعتمدة:</span>
                </div>
                <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {cleanSources}
                </div>
            </div>
        )}

        {/* Warning Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-amber-500/80 flex gap-2 items-start">
             <span className="mt-0.5">⚠️</span>
             <p>
                {warningContent.replace(':', '').trim() || "هذه المعلومات لغرض الثقافة الفقهية المقارنة. الأحكام قد تختلف بدقة حسب حالتك. للحصول على فتوى تبرأ بها الذمة، استشر المرجع الديني المختص."}
             </p>
        </div>
      </div>
    </div>
  );
};
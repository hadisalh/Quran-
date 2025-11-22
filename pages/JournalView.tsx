import React from 'react';
import type { JournalEntry } from '../types';
import { BookOpen } from '../components/icons';

interface JournalViewProps {
  entries: JournalEntry[];
}

export const JournalView: React.FC<JournalViewProps> = ({ entries }) => {
  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-amber-400" />
        <h1 className="text-3xl font-bold text-amber-400">دفتر هدايتي</h1>
      </div>

      <div className="overflow-y-auto flex-grow space-y-6">
        {entries.length === 0 ? (
          <div className="text-center text-slate-400 h-full flex flex-col items-center justify-center">
            <p className="text-lg">لم يتم تسجيل أي إرشاد بعد.</p>
            <p>ابدأ رحلتك في قسم الدردشة للعثور على الهداية في القرآن.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 animate-fade-in">
              <p className="text-slate-400 text-sm mb-2">{new Date(entry.id).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="font-bold text-slate-200 mb-3">مشكلتي: <span className="font-normal text-slate-300">"{entry.problem}"</span></p>
              <div className="border-t border-slate-600 pt-3 space-y-2">
                  <p className="text-sm text-amber-300/80">
                    <span className="font-bold">آية الوصف:</span> سورة {entry.guidance.descriptiveAyah.surahName} ({entry.guidance.descriptiveAyah.ayahNumber})
                  </p>
                  <p className="text-sm text-amber-300/80">
                    <span className="font-bold">آية الحل:</span> سورة {entry.guidance.solutionAyah.surahName} ({entry.guidance.solutionAyah.ayahNumber})
                  </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
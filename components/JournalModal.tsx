
import React from 'react';
import type { JournalEntry } from '../types';
import { X } from './icons';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
}

export const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, entries }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold text-amber-400">دفتر هدايتي</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {entries.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <p>لم يتم تسجيل أي إرشاد بعد.</p>
              <p>ابدأ رحلتك للعثور على الهداية في القرآن.</p>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
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
    </div>
  );
};

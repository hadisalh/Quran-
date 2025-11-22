
import React from 'react';
import { AyahCard } from './AyahCard';
import type { GuidanceResponse } from '../types';

interface ResponseDisplayProps {
  guidance: GuidanceResponse;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ guidance }) => {
  return (
    <div className="mt-10 animate-fade-in space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-center mb-4 text-amber-400">آية تصف حالتك</h2>
        <AyahCard ayah={guidance.descriptiveAyah} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-4 text-amber-400">آية تحمل الحل</h2>
        <AyahCard ayah={guidance.solutionAyah} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-4 text-amber-400">نصائح إيمانية</h2>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <ul className="space-y-4">
            {guidance.advice.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✦</span>
                <p className="text-slate-200">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Send } from './icons';

interface InputFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="مثال: أشعر بالظلم من شخص قريب..."
          className="w-full h-32 p-4 pr-12 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-slate-100 placeholder-slate-500 resize-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-500 text-slate-900 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-110"
          aria-label="اطلب الإرشاد"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

import React from 'react';
import { TriangleAlert } from './icons';

interface ErrorMessageBubbleProps {
  message: string;
}

export const ErrorMessageBubble: React.FC<ErrorMessageBubbleProps> = ({ message }) => {
  return (
    <div className="flex justify-center animate-fade-in my-4">
      <div className="bg-red-900/50 text-red-300 rounded-xl p-3 max-w-lg shadow-md flex items-center gap-3">
        <TriangleAlert className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};
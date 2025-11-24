import React from 'react';

interface UserMessageBubbleProps {
  text: string;
}

export const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ text }) => {
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="bg-amber-500 text-white dark:text-slate-900 rounded-xl rounded-br-none p-4 max-w-lg shadow-md">
        <p className="whitespace-pre-wrap font-medium">{text}</p>
      </div>
    </div>
  );
};
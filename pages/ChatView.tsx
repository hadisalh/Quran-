import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatInput } from '../components/ChatInput';
import { AiMessageBubble } from '../components/AiMessageBubble';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { AiTypingBubble } from '../components/AiTypingBubble';
import { ErrorMessageBubble } from '../components/ErrorMessageBubble';
import { getGuidance } from '../services/geminiService';
import type { GuidanceResponse } from '../types';
import { ChatBubble } from '../components/icons';

interface UserMessage {
  type: 'user';
  text: string;
  id: string;
}

interface AiMessage {
  type: 'ai';
  guidance: GuidanceResponse;
  id: string;
}

type Message = UserMessage | AiMessage;

interface ChatViewProps {
    addToJournal: (problem: string, guidance: GuidanceResponse) => void;
}

const ChatPlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
        <ChatBubble className="w-16 h-16 mb-4 text-slate-500"/>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">مرحباً بك في الدردشة الإرشادية</h2>
        <p className="max-w-md">
            هنا يمكنك التحدث مع مرشدك الروحي "هادي". شاركه ما تشعر به، سواء كان حزنًا، قلقًا، أو أي شعور آخر، وسيرشدك إلى آيات قرآنية تصف حالتك وتقدم لك السكينة والحل.
        </p>
        <p className="max-w-md w-full mt-4 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <strong>جرب أن تكتب:</strong> "أشعر بالضيق ولا أعرف السبب"
        </p>
    </div>
);


export const ChatView: React.FC<ChatViewProps> = ({ addToJournal }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: UserMessage = { type: 'user', text, id: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await getGuidance(text);
      const aiMessage: AiMessage = { type: 'ai', guidance: result, id: new Date().toISOString() + '-ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'عذرًا، حدث خطأ أثناء طلب الإرشاد. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
        <main className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow flex flex-col space-y-6 overflow-y-auto p-4">
                {messages.length === 0 && !isLoading && !error ? (
                    <ChatPlaceholder />
                ) : (
                    messages.map((msg, index) => {
                        if (msg.type === 'user') {
                            return <UserMessageBubble key={msg.id} text={msg.text} />;
                        } else {
                            let lastUserText = '';
                            for (let i = index - 1; i >= 0; i--) {
                                if (messages[i].type === 'user') {
                                    lastUserText = (messages[i] as UserMessage).text;
                                    break;
                                }
                            }
                            
                            return <AiMessageBubble 
                                key={msg.id} 
                                guidance={msg.guidance} 
                                problem={lastUserText} 
                                addToJournal={addToJournal} 
                                showJournalButton={true}
                            />;
                        }
                    })
                )}
                
                {isLoading && <AiTypingBubble />}
                {error && <ErrorMessageBubble message={error} />}
                
                <div ref={messagesEndRef} />
            </div>
          
            <div className="p-4 bg-slate-900 border-t border-slate-700/50">
                <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </main>
    </div>
  );
}
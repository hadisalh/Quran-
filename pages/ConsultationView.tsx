import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from '../components/ChatInput';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { AiConsultationBubble } from '../components/AiConsultationBubble';
import { AiConsultantTypingBubble } from '../components/AiConsultantTypingBubble';
import { ErrorMessageBubble } from '../components/ErrorMessageBubble';
import { getConsultationStream } from '../services/consultationService';
import { Scale } from '../components/icons';

interface Message {
  type: 'user' | 'ai';
  text: string;
  id: string;
}

const ConsultationPlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
        <Scale className="w-16 h-16 mb-4 text-slate-500"/>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">الاستشارة الإسلامية</h2>
        <p className="max-w-md">
            هنا يمكنك طرح أسئلتك الدينية والفقهية على "فقيه"، المستشار الإسلامي الذكي. سيقدم لك إجابات مبنية على القرآن والسنة.
        </p>
        <p className="max-w-md w-full mt-4 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <strong>جرب أن تسأل:</strong> "ما هي شروط صحة الوضوء؟"
        </p>
    </div>
);

export const ConsultationView: React.FC = () => {
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
    
    const userMessage: Message = { type: 'user', text, id: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError(null);

    try {
      const stream = await getConsultationStream(text);
      
      let aiMessageId: string | null = null;

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (aiMessageId === null) {
          // First chunk arrived, hide typing indicator and add the AI message bubble
          setIsLoading(false);
          const newAiMessageId = new Date().toISOString() + '-ai';
          aiMessageId = newAiMessageId;
          setMessages(prev => [...prev, { type: 'ai', text: chunkText, id: newAiMessageId }]);
        } else {
          // Append text to the existing AI message bubble
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: msg.text + chunkText } : msg
            )
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'عذرًا، حدث خطأ أثناء طلب الاستشارة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
        <main className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow flex flex-col space-y-6 overflow-y-auto p-4">
                {messages.length === 0 && !isLoading && !error ? (
                    <ConsultationPlaceholder />
                ) : (
                    messages.map((msg) => {
                        if (msg.type === 'user') {
                            return <UserMessageBubble key={msg.id} text={msg.text} />;
                        } else {
                            return <AiConsultationBubble key={msg.id} text={msg.text} />;
                        }
                    })
                )}
                
                {isLoading && <AiConsultantTypingBubble />}
                {error && <ErrorMessageBubble message={error} />}
                
                <div ref={messagesEndRef} />
            </div>
          
            <div className="p-4 bg-slate-900 border-t border-slate-700/50">
                <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </main>
    </div>
  );
};
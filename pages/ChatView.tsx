import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from '../components/ChatInput';
import { AiMessageBubble } from '../components/AiMessageBubble';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { AiTypingBubble } from '../components/AiTypingBubble';
import { ErrorMessageBubble } from '../components/ErrorMessageBubble';
import { getGuidance } from '../services/geminiService';
import type { GuidanceResponse } from '../types';
import { ChatBubble, Sparkles } from '../components/icons';

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
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-amber-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/20 to-transparent"></div>
            <Sparkles className="w-12 h-12 text-amber-500 dark:text-amber-400 animate-pulse"/>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 font-serif">الباحث القرآني الذكي</h2>
        <p className="max-w-lg text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
            أنا هنا لأستمع إليك بقلب مفتوح. أخبرني بما يثقل صدرك أو ما تبحث عنه، وسأبحث لك في كتاب الله عما يطمئن قلبك وينير دربك.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {["أشعر بضيق ولا أعرف السبب", "خائف من المستقبل والرزق", "ظلمني شخص قريب مني", "كيف أزيد من خشوعي؟"].map((suggestion, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-500 dark:text-slate-400 text-center shadow-sm select-none opacity-80">
                    "{suggestion}"
                </div>
            ))}
        </div>
    </div>
);

// Loading state messages
const loadingStates = [
    "جارٍ تحليل مشاعرك...",
    "البحث في آيات الكتاب الحكيم...",
    "استخراج معاني التدبر...",
    "صياغة الوصفة الإيمانية..."
];

export const ChatView: React.FC<ChatViewProps> = ({ addToJournal }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(loadingStates[0]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  // Loading text cycler
  useEffect(() => {
      if (!isLoading) return;
      let index = 0;
      const interval = setInterval(() => {
          index = (index + 1) % loadingStates.length;
          setLoadingText(loadingStates[index]);
      }, 2000);
      return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: UserMessage = { type: 'user', text, id: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setLoadingText(loadingStates[0]);
    setError(null);

    try {
      const result = await getGuidance(text);
      const aiMessage: AiMessage = { type: 'ai', guidance: result, id: new Date().toISOString() + '-ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'عذرًا، حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        <main className="flex-grow flex flex-col overflow-hidden relative">
            <div className="flex-grow flex flex-col space-y-8 overflow-y-auto p-4 sm:p-6 scroll-smooth">
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
                
                {isLoading && (
                    <div className="flex flex-col items-start gap-2 animate-fade-in">
                        <AiTypingBubble />
                        <span className="text-xs text-slate-400 mr-14 animate-pulse">{loadingText}</span>
                    </div>
                )}
                {error && <ErrorMessageBubble message={error} />}
                
                <div ref={messagesEndRef} className="h-4" />
            </div>
          
            <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50 shadow-lg z-10">
                <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </main>
    </div>
  );
}
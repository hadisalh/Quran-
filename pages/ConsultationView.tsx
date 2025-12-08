import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from '../components/ChatInput';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { AiConsultationBubble } from '../components/AiConsultationBubble';
import { AiConsultantTypingBubble } from '../components/AiConsultantTypingBubble';
import { ErrorMessageBubble } from '../components/ErrorMessageBubble';
import { getConsultation } from '../services/consultationService';
import { Scale, TriangleAlert, Check } from '../components/icons';

interface Message {
  type: 'user' | 'ai';
  text: string;
  id: string;
}

const ConsultationPlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
            <Scale className="w-12 h-12 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform duration-500"/>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 font-serif">الاستشارة الفقهية المقارنة</h2>
        <p className="max-w-md text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
            اسأل عن المسائل الشرعية، وسأعرض لك أقوال المذاهب الإسلامية (السنية والشيعية) بموضوعية، لغرض الثقافة والمعرفة.
        </p>
        <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
            {["حكم الجمع بين الصلوات؟", "كيفية حساب زكاة الفطر؟", "مبطلات الصيام المعاصرة", "أحكام الميراث العامة"].map((suggestion, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-500 dark:text-slate-400 text-center shadow-sm select-none opacity-80 hover:opacity-100 transition-opacity cursor-default">
                    "{suggestion}"
                </div>
            ))}
        </div>
    </div>
);

const DisclaimerModal: React.FC<{ onAccept: () => void }> = ({ onAccept }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                        <TriangleAlert className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">تنبيه وإخلاء مسؤولية</h2>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 text-right">
                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc list-inside">
                            <li>هذه الاستشارة يتم توليدها بواسطة <strong>الذكاء الاصطناعي</strong>.</li>
                            <li>المعلومات تعرض آراء <strong>كافة المذاهب (السنية والشيعية)</strong> للغرض التعليمي.</li>
                            <li>هذه الإجابات <strong>لا تغني عن الرجوع للمرجع أو المفتي</strong>.</li>
                            <li className="font-bold text-amber-600 dark:text-amber-400">للنوازل والمسائل المصيرية (مثل الطلاق)، يجب مراجعة الجهات الشرعية المعتمدة أو مرجع تقليدك.</li>
                        </ul>
                    </div>

                    <button 
                        onClick={onAccept}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
                    >
                        <Check className="w-5 h-5" />
                        <span>قرأت وفهمت، تابع</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ConsultationView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true);
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
      const responseText = await getConsultation(text);
      const aiMessage: Message = { 
          type: 'ai', 
          text: responseText, 
          id: new Date().toISOString() + '-ai' 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ في الاتصال بالخدمة.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
        {showDisclaimer && <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />}
        
        <main className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow flex flex-col space-y-6 overflow-y-auto p-4 sm:p-6 scroll-smooth">
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
                
                <div ref={messagesEndRef} className="h-4" />
            </div>
          
            <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50 shadow-lg z-10">
                <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </main>
    </div>
  );
};
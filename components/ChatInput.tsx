import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from './icons';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'not-allowed' | 'no-speech' | 'aborted' | string;
}

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Effect to check and monitor microphone permissions
  useEffect(() => {
    if (typeof navigator.permissions?.query !== 'function') {
      return;
    }
    let permissionStatus: PermissionStatus;
    const setPermissionState = () => {
        setMicPermission(permissionStatus.state);
    };
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then((status) => {
        permissionStatus = status;
        setPermissionState();
        permissionStatus.onchange = setPermissionState;
    }).catch(err => {
        console.error("Error querying microphone permissions:", err);
    });
    return () => {
        if (permissionStatus) {
            permissionStatus.onchange = null;
        }
    };
  }, []);
  
  // Effect to clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleMicClick = () => {
    if (!SpeechRecognitionAPI) {
      setMicError('متصفحك لا يدعم خاصية التعرف على الصوت.');
      return;
    }
    if (micPermission === 'denied') {
        setMicError('تم حظر الوصول إلى الميكروفون. يرجى تفعيله من إعدادات الموقع في المتصفح للمتابعة.');
        return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      // The 'end' event handler will set isListening to false
    } else {
      setMicError(null);
      try {
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        const onResult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setText(prev => (prev ? prev + ' ' : '') + transcript);
        };

        const cleanup = () => {
          recognition.removeEventListener('result', onResult as EventListener);
          recognition.removeEventListener('end', onEnd);
          recognition.removeEventListener('error', onError as EventListener);
          if (recognitionRef.current === recognition) {
            recognitionRef.current = null;
          }
        };

        const onEnd = () => {
          setIsListening(false);
          cleanup();
        };

        const onError = (event: SpeechRecognitionErrorEvent) => {
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
              setMicError('تم رفض الوصول إلى الميكروفون. يرجى تمكينه في إعدادات المتصفح.');
              setMicPermission('denied');
            } else {
              setMicError('حدث خطأ في التعرف على الصوت.');
            }
          }
          onEnd();
        };

        recognition.addEventListener('result', onResult as EventListener);
        recognition.addEventListener('end', onEnd);
        recognition.addEventListener('error', onError as EventListener);
        
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
        setIsListening(false);
        setMicError('حدث خطأ عند محاولة بدء التسجيل الصوتي.');
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
        onSubmit(text);
        setText('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (micError) {
      setMicError(null);
    }
  };
  
  const micButtonAriaLabel = isListening ? 'إيقاف التسجيل' : micPermission === 'denied' ? 'الميكروفون محظور' : 'التحدث';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="أخبرنا بما في قلبك..."
          className="w-full max-h-48 p-3 pl-24 bg-slate-800 border-2 border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-slate-100 placeholder-slate-500 resize-none"
          disabled={isLoading}
          rows={1}
        />
        <div className="absolute left-2 bottom-2 flex items-center gap-1">
            {SpeechRecognitionAPI && (
              <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isLoading}
                  className={`p-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : micPermission === 'denied' ? 'bg-red-800/50' : 'bg-slate-700 hover:bg-slate-600'} text-slate-100 transition-colors`}
                  aria-label={micButtonAriaLabel}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className={`w-5 h-5 ${micPermission === 'denied' ? 'text-red-400' : ''}`} />}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="p-2 rounded-full bg-amber-500 text-slate-900 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-110"
              aria-label="اطلب الإرشاد"
            >
              <Send className="w-5 h-5" />
            </button>
        </div>
      </form>
      {micError && <p className="text-red-400 text-xs text-center mt-2">{micError}</p>}
    </div>
  );
};
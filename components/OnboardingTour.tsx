import React, { useState, useLayoutEffect } from 'react';

interface TourStep {
  target?: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  onClose: () => void;
}

const tourSteps: TourStep[] = [
  {
    title: 'مرحباً بك في "آية ترشدك"',
    content: 'هذا رفيقك الرقمي لإيجاد السكينة والطمأنينة في القرآن الكريم. دعنا نأخذك في جولة سريعة.',
  },
  {
    target: '#home-card-chat',
    title: 'الدردشة الإرشادية',
    content: 'هنا هو قلب التطبيق. شارك ما تشعر به مع مرشدك "هادي"، وسيرشدك إلى آيات من القرآن تصف حالتك وتقدم لك العزاء والحل.',
    placement: 'bottom',
  },
  {
    target: '#home-card-journal',
    title: 'دفتر هدايتي',
    content: 'يمكنك حفظ إرشاداتك من الدردشة هنا. ارجع إليها في أي وقت للتأمل والتفكر في رحلتك الإيمانية.',
    placement: 'bottom',
  },
  {
    title: 'استكشف البقية!',
    content: 'يحتوي التطبيق على المزيد من الأقسام المفيدة مثل أذكار الصباح والمساء، الرقية الشرعية، والاستشارات الفقهية. استكشفها بحرية!',
  },
  {
    title: 'تم تطوير التطبيق بواسطة',
    content: 'الأستاذ هادي الدليمي. لاتنساني من الدعاء لي ولوالدي.',
  }
];

const getTargetRect = (targetSelector?: string): DOMRect | null => {
  if (!targetSelector) return null;
  const element = document.querySelector(targetSelector);
  return element ? element.getBoundingClientRect() : null;
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = tourSteps[stepIndex];
  
  useLayoutEffect(() => {
    const updateTargetRect = () => {
      const rect = getTargetRect(currentStep.target);
      setTargetRect(rect);
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
    };
  }, [stepIndex, currentStep.target]);


  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };
  
  const isLastStep = stepIndex === tourSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div 
        className="fixed inset-0 bg-black/60 transition-all duration-300 ease-in-out"
        style={targetRect ? {
            clipPath: `path('${`M0 0 H ${window.innerWidth} V ${window.innerHeight} H 0 Z M${targetRect.x - 4} ${targetRect.y - 4} H ${targetRect.right + 4} V ${targetRect.bottom + 4} H ${targetRect.x - 4} Z`}')`,
        } : {}}
      ></div>
       
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-amber-400/50 shadow-2xl rounded-lg p-5 max-w-sm w-[90%] text-center transition-all duration-300 ease-in-out"
      >
        <h3 className="text-xl font-bold text-amber-300 mb-3">{currentStep.title}</h3>
        <p className="text-slate-300 mb-6 text-sm leading-relaxed">{currentStep.content}</p>

        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-white px-2 py-1">تخطي</button>
          
          <div className="flex items-center gap-2">
            {stepIndex > 0 && <button onClick={handlePrev} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors text-sm">السابق</button>}
            <button onClick={handleNext} className="px-4 py-2 bg-amber-500 text-slate-900 rounded-md font-bold hover:bg-amber-600 transition-colors text-sm">
              {isLastStep ? 'إنهاء' : 'التالي'}
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-4 gap-1.5">
          {tourSteps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === stepIndex ? 'bg-amber-400' : 'bg-slate-600'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};
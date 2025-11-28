import React from 'react';
import type { View } from '../App';
import { ChatBubble, Sparkles, Moon, Scale, ShieldCheck, ClipboardList, Clock } from '../components/icons';
import { Logo } from '../components/Logo';

interface HomeViewProps {
  onNavigate: (view: View) => void;
}

// Keep the SectionCard component for the smaller cards
const SectionCard: React.FC<{
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ id, icon, title, description, onClick }) => (
  <button
    id={id}
    onClick={onClick}
    className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 backdrop-blur-sm rounded-2xl p-5 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-amber-500/10 hover:bg-white dark:hover:bg-slate-800 hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-400 h-full flex flex-col items-center justify-center group"
  >
    <div className="flex justify-center items-center mb-4 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-full shadow-inner border border-slate-200 dark:border-slate-800">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-serif">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-snug opacity-80 group-hover:opacity-100 transition-opacity">{description}</p>
  </button>
);

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const sections: {
    view: View;
    icon: React.ReactNode;
    title: string;
    description: string;
  }[] = [
    {
      view: 'prayers',
      icon: <Clock className="w-7 h-7" />,
      title: 'أوقات الصلاة',
      description: 'مواقيت دقيقة مع الأذان.',
    },
    {
      view: 'adhkar',
      icon: <ShieldCheck className="w-7 h-7" />,
      title: 'أدعية وأذكار',
      description: 'حصّن نفسك بالأدعية.',
    },
    {
        view: 'ruqyah',
        icon: <ShieldCheck className="w-7 h-7" />,
        title: 'الرقية الشرعية',
        description: 'استشفِ بالقرآن.',
    },
    {
      view: 'consultation',
      icon: <Scale className="w-7 h-7" />,
      title: 'الباحث التراثي',
      description: 'البحث في أمهات الكتب والمصادر.',
    },
    {
      view: 'inspiration',
      icon: <Sparkles className="w-7 h-7" />,
      title: 'ركن الإلهام',
      description: 'بطاقات قرآنية ملهمة.',
    },
    {
      view: 'relax',
      icon: <Moon className="w-7 h-7" />,
      title: 'واحة السكينة',
      description: 'استرخِ مع التلاوات.',
    },
     {
      view: 'journal',
      icon: <ClipboardList className="w-7 h-7" />,
      title: 'دفتر هدايتي',
      description: 'سجّل رحلتك.',
    },
  ];

  const backgroundStyle = {
    backgroundImage: `
      radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.05) 1px, transparent 0)
    `,
    backgroundSize: '2.5rem 2.5rem',
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300" style={backgroundStyle}>
        <div className="w-full max-w-5xl mx-auto animate-fade-in flex flex-col flex-grow">
            <header className="text-center py-8 sm:py-10">
                <div className="inline-block mb-5 p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-2xl">
                   <Logo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" />
                </div>
                <h1 className="text-5xl sm:text-6xl font-bold text-amber-600 dark:text-amber-400 font-serif mb-4 drop-shadow-md tracking-wide">آية ترشدك</h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-light">رفيقك الرقمي لإيجاد السكينة والطمأنينة في رحاب القرآن الكريم</p>
            </header>
            
            <main className="flex-grow pb-10">
              {/* Main CTA Card */}
              <div className="mb-8 transform transition-all duration-300 hover:scale-[1.01]">
                <button
                  id="home-card-chat"
                  onClick={() => onNavigate('chat')}
                  className="w-full bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-900/5 dark:shadow-amber-900/10 hover:shadow-amber-500/20 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden"
                >
                  {/* Background Accent */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors duration-500"></div>
                  
                  <div className="flex-shrink-0 text-amber-500 dark:text-amber-400 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 group-hover:border-amber-500/50 transition-colors relative z-10">
                    <ChatBubble className="w-12 h-12 sm:w-14 sm:h-14" />
                  </div>
                  <div className="text-center md:text-right flex-grow relative z-10">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 font-serif group-hover:text-amber-600 dark:group-hover:text-amber-100 transition-colors">الباحث القرآني</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">ابحث عن الآيات التي تلامس قلبك وتصف حالتك. المساعد الذكي سيقوم بالبحث في القرآن الكريم ليقدم لك الآيات المناسبة.</p>
                    <div className="mt-5 inline-flex items-center text-amber-600 dark:text-amber-400 font-bold text-sm bg-white/80 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-slate-900 transition-all">
                        <span>ابدأ البحث الآن</span>
                        <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Other Sections Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {sections.map(section => (
                      <SectionCard
                          id={`home-card-${section.view}`}
                          key={section.view}
                          icon={section.icon}
                          title={section.title}
                          description={section.description}
                          onClick={() => onNavigate(section.view)}
                      />
                  ))}
              </div>
            </main>

            <footer className="text-center mt-auto py-6 border-t border-slate-200 dark:border-slate-800/50 text-slate-500 flex-shrink-0">
                <p className="mb-1 font-ui text-lg">
                تم التطوير بواسطة 
                <span className="text-amber-600/90 dark:text-amber-500/90 font-bold mx-1">الأستاذ هادي الدليمي</span>
                </p>
                <p className="text-xs opacity-70">لاتنساني من الدعاء لي ولوالدي</p>
            </footer>
        </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatView } from './pages/ChatView';
import { JournalView } from './pages/JournalView';
import { InspirationView } from './pages/InspirationView';
import { RelaxView } from './pages/RelaxView';
import { RuqyahView } from './pages/RuqyahView';
import { HomeView } from './pages/HomeView';
import { AdhkarView } from './pages/AdhkarView';
import { PrayerTimesView } from './pages/PrayerTimesView';
import type { JournalEntry, GuidanceResponse } from './types';
import { OnboardingTour } from './components/OnboardingTour';
import { FirstLaunchModal } from './components/FirstLaunchModal';
import { InstallPwa } from './components/InstallPwa';

export type View = 'home' | 'chat' | 'journal' | 'inspiration' | 'relax' | 'ruqyah' | 'adhkar' | 'prayers';

const viewLabels: Record<View, string> = {
  home: 'آية ترشدك',
  chat: 'الباحث القرآني', 
  journal: 'دفتر هدايتي',
  inspiration: 'ركن الإلهام',
  relax: 'واحة السكينة',
  ruqyah: 'الرقية الشرعية',
  adhkar: 'أدعية وأذكار',
  prayers: 'أوقات الصلاة'
};

const JOURNAL_STORAGE_KEY = 'ayah-guidance-journal';
const ONBOARDING_STORAGE_KEY = 'ayah-guidance-onboarding-v1-shown';
const THEME_STORAGE_KEY = 'ayah-guidance-theme';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Theme state management
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    }
    return 'dark'; // Default to dark
  });

  // Apply theme to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Load journal entries from localStorage on initial render
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (storedEntries) {
        setJournalEntries(JSON.parse(storedEntries));
      }
    } catch (e) {
      console.error("Failed to load journal from localStorage", e);
    }

    try {
      const tourShown = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!tourShown) {
        setIsTourOpen(true);
      }
    } catch (e) {
      console.error("Failed to check onboarding status from localStorage", e);
      setIsTourOpen(true);
    }
  }, []);

  // Save journal entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journalEntries));
    } catch (e) {
      console.error("Failed to save journal to localStorage", e);
    }
  }, [journalEntries]);

  const addToJournal = (problem: string, guidance: GuidanceResponse) => {
    const newEntry: JournalEntry = {
      id: new Date().toISOString(),
      problem,
      guidance,
    };
    // Add to the beginning of the array
    setJournalEntries(prev => [newEntry, ...prev]);
  };
  
  const handleViewChange = (view: View) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  const handleCloseTour = () => {
    setIsTourOpen(false);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.error("Failed to save onboarding status to localStorage", e);
    }
  };

  const renderActiveView = () => {
    switch(activeView) {
      case 'home':
        return <HomeView onNavigate={handleViewChange} />;
      case 'chat':
        return <ChatView addToJournal={addToJournal} />;
      case 'journal':
        return <JournalView entries={journalEntries} />;
      case 'adhkar':
        return <AdhkarView />;
      case 'inspiration':
        return <InspirationView />;
      case 'relax':
        return <RelaxView />;
      case 'ruqyah':
        return <RuqyahView />;
      case 'prayers':
        return <PrayerTimesView />;
      default:
        return <HomeView onNavigate={handleViewChange} />;
    }
  };

  return (
    <div className="flex h-screen md:h-screen supports-[height:100dvh]:h-[100dvh] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300" dir="rtl">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeView={activeView}
        onViewChange={handleViewChange}
        journalEntryCount={journalEntries.length}
      />
      <div className="flex-grow flex flex-col h-full w-full overflow-hidden relative transition-all duration-300 bg-slate-50 dark:bg-slate-900">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          activeViewLabel={viewLabels[activeView]}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-grow overflow-y-auto scroll-smooth relative w-full bg-slate-50 dark:bg-slate-900">
          {renderActiveView()}
        </main>
        {isTourOpen && activeView === 'home' && <OnboardingTour onClose={handleCloseTour} />}
        <FirstLaunchModal />
        <InstallPwa />
      </div>
    </div>
  );
};

export default App;
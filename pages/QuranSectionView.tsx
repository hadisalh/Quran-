import React, { useState, useMemo, useRef, useEffect } from 'react';
import { quranData } from '../data/quran';
import type { Bookmark } from '../types';
import { Search, BookOpen, ArrowRight } from '../components/icons';

interface QuranSectionViewProps {
  bookmark: Bookmark | null;
  onSetBookmark: (bookmark: Bookmark | null) => void;
}

const SurahListView: React.FC<{
    onSelectSurah: (surahNumber: number) => void;
    bookmark: Bookmark | null;
}> = ({ onSelectSurah, bookmark }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSurahs = useMemo(() => {
        if (!searchTerm) {
            return quranData;
        }
        return quranData.filter(surah =>
            surah.name.includes(searchTerm) ||
            surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const bookmarkedSurahName = bookmark ? quranData.find(s => s.number === bookmark.surah)?.name : '';

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-amber-400" />
                <h1 className="text-3xl font-bold text-amber-400 font-ui">القرآن الكريم</h1>
            </div>
            
            <div className="relative mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن سورة..."
                    className="w-full p-3 pr-10 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-slate-100 placeholder-slate-500 font-ui"
                />
                <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>
            {bookmark && (
                <button
                    onClick={() => onSelectSurah(bookmark.surah)}
                    className="w-full text-right bg-slate-800 border-2 border-amber-400/50 p-4 rounded-lg mb-4 text-slate-100 hover:bg-slate-700/50 transition-colors shadow-lg"
                >
                    <p className="font-bold text-lg text-amber-300 font-ui">متابعة القراءة</p>
                    <p className="text-sm text-slate-300">
                        {`من ${bookmarkedSurahName}، الآية ${bookmark.ayah}`}
                    </p>
                </button>
            )}
            <div className="overflow-y-auto flex-grow">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSurahs.map(surah => (
                        <button
                            key={surah.number}
                            onClick={() => onSelectSurah(surah.number)}
                            className="w-full flex items-center bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800 hover:border-amber-500/30 transition-all text-right shadow-md"
                        >
                            <div className="ml-4 relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-full h-full text-slate-700/80" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.0001 1.75L15.4379 3.625L19.25 2.5L20.375 6.31213L22.25 9.75L20.375 13.1879L21.5 17L17.6879 18.125L14.25 20L12.0001 22.25L9.75 20L6.31213 18.125L2.5 17L3.625 13.1879L1.75 9.75L3.625 6.31213L2.5 2.5L6.31213 3.625L9.75 1.75L12.0001 1.75Z"/>
                                </svg>
                                <span className="absolute text-sm font-bold text-slate-200">{surah.number}</span>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-slate-100 font-ui">{surah.name.replace("سُورَةُ ", "")}</h3>
                                <p className="text-xs text-slate-400">{`${surah.englishName} • ${surah.numberOfAyahs} Ayahs`}</p>
                            </div>
                            <div className="text-left">
                               <p className="text-xs font-semibold text-amber-400/80">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SurahReadView: React.FC<{
    surahNumber: number;
    onBack: () => void;
    bookmark: Bookmark | null;
    onSetBookmark: (bookmark: Bookmark | null) => void;
}> = ({ surahNumber, onBack, bookmark, onSetBookmark }) => {
    const surah = useMemo(() => quranData.find(s => s.number === surahNumber), [surahNumber]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bookmark && bookmark.surah === surahNumber) {
            const element = document.getElementById(`ayah-${bookmark.surah}-${bookmark.ayah}`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        } else {
            scrollRef.current?.scrollTo(0, 0);
        }
    }, [surahNumber, bookmark]);

    if (!surah) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <p className="text-slate-300 mb-4">لم يتم العثور على السورة.</p>
                <button onClick={onBack} className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg">العودة</button>
            </div>
        );
    }
    
    const isBismillahShown = surah.number !== 1 && surah.number !== 9;

    return (
        <div className="h-full flex flex-col animate-fade-in bg-slate-900/50" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ca8a04' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}>
            <header className="flex items-center justify-between p-3 border-b border-slate-700/50 flex-shrink-0 bg-slate-900 z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="العودة للفهرس">
                    <ArrowRight className="w-6 h-6 text-slate-200" />
                </button>
                <h2 className="text-2xl font-bold text-amber-300 font-ui">{surah.name}</h2>
                <div className="w-10"></div>
            </header>
            <div ref={scrollRef} className="overflow-y-auto flex-grow p-4 sm:p-6">
                 <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 shadow-2xl">
                    {isBismillahShown && (
                        <p className="quran-text text-center text-2xl mb-6">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                    )}
                    <div className="quran-text text-slate-100">
                        {surah.ayahs.map((ayah) => {
                            const isBookmarked = bookmark?.surah === surah.number && bookmark?.ayah === ayah.number;
                            // For Al-Fatiha, where Bismillah is the first verse, we skip rendering it here as it's handled above the surah text.
                            if (surah.number === 1 && ayah.number === 1) return null;
                            return (
                                <span
                                    key={ayah.number}
                                    id={`ayah-${surah.number}-${ayah.number}`}
                                    onClick={() => onSetBookmark({ surah: surah.number, ayah: ayah.number })}
                                    className={`cursor-pointer transition-colors duration-300 p-1 rounded-md ${isBookmarked ? 'bg-amber-400/20 text-amber-200' : 'hover:bg-slate-700/50'}`}
                                >
                                    {ayah.text}
                                    <span className="verse-end-symbol">
                                       {ayah.number.toLocaleString('ar-EG')}
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export const QuranSectionView: React.FC<QuranSectionViewProps> = ({ bookmark, onSetBookmark }) => {
    const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

    const handleSelectSurah = (surahNumber: number) => {
        setSelectedSurah(surahNumber);
    };

    const handleBackToList = () => {
        setSelectedSurah(null);
    };
    
    // This logic handles the special case for Al-Fatiha where Bismillah is the first verse.
    // If the user tries to bookmark verse 1 of Al-Fatiha, we don't show the Bismillah as bookmarked
    // since it's not part of the clickable verse list. This is a display-only adjustment.
    const displayBookmark = useMemo(() => {
        if (bookmark && bookmark.surah === 1 && bookmark.ayah === 1) {
            return null;
        }
        return bookmark;
    }, [bookmark]);


    return (
        <div className="h-full bg-slate-900">
            {selectedSurah ? (
                <SurahReadView 
                    surahNumber={selectedSurah} 
                    onBack={handleBackToList}
                    bookmark={displayBookmark}
                    onSetBookmark={onSetBookmark}
                />
            ) : (
                <SurahListView 
                    onSelectSurah={handleSelectSurah}
                    bookmark={bookmark}
                />
            )}
        </div>
    );
};
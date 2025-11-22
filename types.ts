

export interface Ayah {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  text: string;
  tafsir: string;
}

export interface GuidanceResponse {
  descriptiveAyah: Ayah;
  solutionAyah: Ayah;
  advice: string[];
  dua: string;
}

export interface JournalEntry {
  id: string;
  problem: string;
  guidance: GuidanceResponse;
}

// FIX: Add and export the Bookmark interface to resolve an import error.
export interface Bookmark {
  surah: number;
  ayah: number;
}
export interface Inspiration {
  ayahText: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  reflection: string;
}
export type BookCategoryKey = 
  | 'all'
  | 'veda'          // 🕉️ वेद
  | 'upanishad'     // 📖 उपनिषद्
  | 'purana'        // 📚 पुराण
  | 'dharmashastra' // 📜 धर्मशास्त्र
  | 'karmakanda'    // 🔥 कर्मकाण्ड
  | 'mantra_stotra' // 🔱 मन्त्र तथा स्तोत्र
  | 'jyotisha'      // 🔯 ज्योतिष
  | 'panchanga'     // 🪐 पञ्चाङ्ग
  | 'vastu'         // 🏠 वास्तु
  | 'ayurveda_yoga' // 🌿 आयुर्वेद / योग
  | 'nepal_vishesh';// 🇳🇵 नेपाल विशेष

export interface BookChapter {
  id: string;
  titleNepali: string;
  titleSanskrit?: string;
  contentSanskrit?: string;
  contentNepaliTika: string;
  notesNepali?: string;
}

export interface DigitalReligiousBook {
  id: string;
  slug: string;
  titleNepali: string;
  titleSanskrit?: string;
  subtitleNepali: string;
  category: BookCategoryKey;
  categoryLabelNepali: string;
  authorOriginal: string;
  translatorNepali: string; // नेपाली टीकाकार / सम्पादक
  publisher: string;
  edition: string;
  pagesCount: number;
  language: ('संस्कृत' | 'नेपाली' | 'हिन्दी' | 'English')[];
  script: string;
  coverImage?: string;
  coverBadge?: string;
  descriptionNepali: string;
  tocNepali: string[]; // Table of Contents
  chapters: BookChapter[];
  sourceName: string;
  sourceUrl?: string;
  copyrightStatus: 'PUBLIC_DOMAIN' | 'BALANANDA_COPYRIGHT' | 'OPEN_LICENSE';
  accessType: 'LOCAL_DOWNLOAD' | 'SOURCE_DOWNLOAD' | 'READ_ONLINE';
  isLetterheadEdition: boolean;
  featured: boolean;
  publishedDateBS: string;
}

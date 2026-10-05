import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Download,
  Search,
  Filter,
  Printer,
  Sparkles,
  FileText,
  BookmarkCheck,
  Share2,
  CheckCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { DigitalReligiousBook, BookCategoryKey } from '../../data/books/bookTypes';
import { PUBLISHED_LETTERHEAD_BOOKS } from '../../data/books/publishedLetterheadBooksData';
import { BookReaderModal } from './BookReaderModal';
import { OrganizationProfile } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface DigitalLibraryViewProps {
  orgProfile?: OrganizationProfile;
  onBackToStore?: () => void;
}

const CATEGORY_TABS: { key: BookCategoryKey; label: string; icon: string }[] = [
  { key: 'all', label: 'सम्पूर्ण पुस्तकहरू', icon: '📚' },
  { key: 'karmakanda', label: 'कर्मकाण्ड एवं पूजा', icon: '🔥' },
  { key: 'dharmashastra', label: 'धर्मशास्त्र एवं व्रत कथा', icon: '📜' },
  { key: 'mantra_stotra', label: 'महाविद्या, मन्त्र एवं स्तोत्र', icon: '🔱' },
  { key: 'veda', label: 'वेद एवं रुद्राभिषेक', icon: '🕉️' },
  { key: 'jyotisha', label: 'ज्योतिष तथा उपाय', icon: '🔯' },
];

export const DigitalLibraryView: React.FC<DigitalLibraryViewProps> = ({
  orgProfile,
  onBackToStore
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BookCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readingBook, setReadingBook] = useState<DigitalReligiousBook | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);

  // Filter books based on category and search text
  const filteredBooks = useMemo(() => {
    return PUBLISHED_LETTERHEAD_BOOKS.filter((b) => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        b.titleNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.titleSanskrit && b.titleSanskrit.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.subtitleNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.descriptionNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.categoryLabelNepali.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleOpenReader = (book: DigitalReligiousBook) => {
    setReadingBook(book);
    setIsReaderOpen(true);
  };

  const handleDirectPdfDownload = (book: DigitalReligiousBook) => {
    setReadingBook(book);
    setIsReaderOpen(true);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Grand Vedic Digital Library Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#73190B] via-[#8B1E0F] to-[#5C1105] text-white p-6 sm:p-8 shadow-xl border border-amber-500/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-400 text-stone-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              🏛️ बालानन्द डिजिटल पुस्तकालय
            </span>
            <span className="bg-white/15 text-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/20">
              नेपाली टीका सहित लेटरहेड PDF
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-white leading-tight">
            वैदिक धर्मशास्त्र, पूजा पद्धति तथा मन्त्र ग्रन्थावली
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm md:text-base text-amber-100/90 leading-relaxed max-w-3xl font-serif">
            हिन्दी भाषामा रहेका दुर्लभ धार्मिक ग्रन्थ तथा पूजा पद्धतिहरूलाई शुद्ध, सरल एवं प्रामाणिक 
            <span className="text-amber-300 font-bold"> नेपाली टीका </span> 
            मा रूपान्तरण गरी, संस्थाको आधिकारिक लेटरहेडमा अनलाइन अध्ययन एवं 
            <span className="text-amber-300 font-bold"> निःशुल्क A4 PDF </span> 
            डाउनलोड गर्न मिल्ने गरी प्रकाशन गरिएको छ।
          </p>

          {/* Quick Stats Banner */}
          <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-amber-200/90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span><strong>{toDevanagariNumerals(PUBLISHED_LETTERHEAD_BOOKS.length)}</strong> आधिकारिक लेटरहेड पुस्तकहरू</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>१००% शुद्ध वैदिक सस्वर मन्त्र &amp; नेपाली भावार्थ</span>
            </div>
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-300" />
              <span>१-क्लिक A4 PDF लेटरहेड प्रिन्टिङ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="bg-white dark:bg-[#1E1914] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ग्रन्थ, मन्त्र, विषय वा विधि खोज्नुहोस्..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#8B1E0F]/30 outline-none"
            />
          </div>

          {/* Result Count and Helper */}
          <div className="text-xs text-stone-600 dark:text-stone-400 font-medium self-end sm:self-center">
            कुल <strong>{toDevanagariNumerals(filteredBooks.length)}</strong> वटा पुस्तक उपलब्ध
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === tab.key
                  ? 'bg-[#8B1E0F] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Books Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white dark:bg-[#1E1914] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            {/* Top Info */}
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8B1E0F] dark:text-amber-400 bg-amber-50 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-stone-700 font-serif">
                    {book.categoryLabelNepali}
                  </span>
                  {book.coverBadge && (
                    <span className="text-[10px] font-bold bg-[#8B1E0F] text-white px-2 py-0.5 rounded-full">
                      {book.coverBadge}
                    </span>
                  )}
                </div>

                <div className="text-right text-[11px] text-stone-500 dark:text-stone-400">
                  <span>{toDevanagariNumerals(book.pagesCount)} पृष्ठ</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#8B1E0F] dark:text-amber-200 leading-snug">
                  {book.titleNepali}
                </h3>
                {book.titleSanskrit && (
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-400 font-serif italic mt-0.5">
                    {book.titleSanskrit}
                  </p>
                )}
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  {book.subtitleNepali}
                </p>
              </div>

              {/* Description Snippet */}
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-[#FAF7F0] dark:bg-stone-900/60 p-3 rounded-xl border border-amber-100 dark:border-stone-800 line-clamp-3">
                {book.descriptionNepali}
              </p>

              {/* Meta information: Translator, Chapters, Language */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">टीकाकार:</span>
                  <span className="truncate max-w-[200px]">{book.translatorNepali}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    {toDevanagariNumerals(book.chapters.length)} अध्याय
                  </span>
                  <span className="text-[11px] font-mono">
                    {book.language.join(' / ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons at Footer */}
            <div className="px-5 py-3.5 bg-[#FAF8F3] dark:bg-[#251F19] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleOpenReader(book)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-stone-300 dark:border-stone-700"
              >
                <Eye className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>अनलाइन पढ्नुहोस्</span>
              </button>

              <button
                type="button"
                onClick={() => handleDirectPdfDownload(book)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#8B1E0F] hover:bg-[#A12312] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>लेटरहेड PDF डाउनलोड</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Empty State if no matches */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-[#1E1914] rounded-2xl border border-stone-200 dark:border-stone-800">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <h4 className="text-base font-bold text-stone-700 dark:text-stone-300">
            कुनै पुस्तक फेला परेन
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            कृपया अर्को शब्द खोज्नुहोस् वा अन्य विधा (category) चयन गर्नुहोस्।
          </p>
        </div>
      )}

      {/* 5. Book Reader & Print/PDF Modal */}
      {isReaderOpen && readingBook && (
        <BookReaderModal
          book={readingBook}
          isOpen={isReaderOpen}
          onClose={() => {
            setIsReaderOpen(false);
            setReadingBook(null);
          }}
          orgProfile={orgProfile}
        />
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { Product } from '../../types/vedicStoreTypes';
import { ProductCard } from './ProductCard';
import { BookOpen, Search, Filter, Sparkles, Layers } from 'lucide-react';

interface BookSectionViewProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const BookSectionView: React.FC<BookSectionViewProps> = ({
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Filter only books or items with bookDetails or category 'religious_books'
  const books = products.filter(
    p => p.category === 'religious_books' || p.bookDetails || p.category === 'jyotish'
  );

  const filteredBooks = books.filter(book => {
    // Language filter
    if (selectedLanguage !== 'all' && book.bookDetails?.language !== selectedLanguage) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = book.nameNepali.toLowerCase().includes(q) || book.nameEnglish.toLowerCase().includes(q);
      const authorMatch = book.bookDetails?.author.toLowerCase().includes(q) || false;
      const pubMatch = book.bookDetails?.publisher.toLowerCase().includes(q) || false;
      if (!nameMatch && !authorMatch && !pubMatch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full text-amber-200 text-xs font-bold border border-amber-400/30">
            <BookOpen className="w-4 h-4" />
            <span>सनातन धार्मिक तथा शास्त्रीय पुस्तकालय</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif leading-snug">
            वैदिक धर्मग्रन्थ, ज्योतिष र कर्मकाण्ड पुस्तक भण्डार
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            गीता, रामायण, पुराण, उपनिषद्, वेद, संस्कृत साहित्य, कर्मकाण्ड र ज्योतिषका प्रामाणिक पुस्तकहरू खोज्नुहोस्।
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="पुस्तकको नाम, लेखक वा विषय खोज्नुहोस्..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Language Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-stone-500 font-bold shrink-0">भाषा:</span>
            {['all', 'नेपाली', 'संस्कृत', 'हिन्दी', 'English'].map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedLanguage === lang
                    ? 'bg-[#D97706] text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {lang === 'all' ? 'सबै भाषा' : lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 font-serif">
            उपलब्ध धार्मिक ग्रन्थहरू ({filteredBooks.length})
          </h3>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-[#231F1C] rounded-2xl border border-[#E6E0D5] dark:border-stone-800 text-stone-500 text-xs">
            कुनै पुस्तक भेटिएन। कृपया खोज वा भाषा परिवर्तन गर्नुहोस्।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredBooks.map(book => (
              <ProductCard
                key={book.id}
                product={book}
                isInWishlist={wishlist.includes(book.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

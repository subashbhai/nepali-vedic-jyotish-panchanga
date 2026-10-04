import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Tag,
  Package,
  Flame,
  BookOpen,
  Filter
} from 'lucide-react';
import {
  PUJA_SAMAGRI_GALLERY_DATABASE,
  PUJA_GALLERY_CATEGORIES,
  PujaGalleryCategory,
  PujaGalleryItem,
  getFilteredPujaGalleryItems
} from '../../utils/pujaSamagriGalleryEngine';

interface PujaSamagriGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (item: PujaGalleryItem) => void;
  currentSelectedImageUrl?: string;
}

export const PujaSamagriGalleryModal: React.FC<PujaSamagriGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentSelectedImageUrl,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PujaGalleryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return getFilteredPujaGalleryItems({
      category: selectedCategory,
      searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-[#1C1917] w-full max-w-5xl rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 1. Modal Header */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#B91C1C] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/25 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif text-amber-100">
                  वैदिक पूजा सामग्री फोटो ग्यालरी (५०+ प्रमाणित तस्विरहरू)
                </h2>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  {PUJA_SAMAGRI_GALLERY_DATABASE.length} Photos
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-sans">
                सामग्रीको नाम अनुसार विषयवस्तु मिल्दो उच्च गुणस्तरको फोटो छनोट गर्नुहोस्
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 hover:text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Filter & Search Bar */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 space-y-3 shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सामग्रीको नाम, वर्ग वा ट्याग खोज्नुहोस् (उदा: कलश, विवाह, घ्यू, रुद्राक्ष, अगरबत्ती, गीता)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips Scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                selectedCategory === 'all'
                  ? 'bg-[#7A1C1C] text-white border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              🌟 सबै सामग्रीहरू ({PUJA_SAMAGRI_GALLERY_DATABASE.length})
            </button>
            {PUJA_GALLERY_CATEGORIES.map((cat) => {
              const count = PUJA_SAMAGRI_GALLERY_DATABASE.filter((i) => i.category === cat.key).length;
              const isSel = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                    isSel
                      ? 'bg-[#7A1C1C] text-white border-amber-600 shadow-xs font-bold'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSel ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Image Grid */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto custom-scrollbar bg-stone-100/60 dark:bg-[#151312]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <ImageIcon className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                खोजी गरिएका शब्दसँग मिल्ने सामग्री फेला परेन।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#D97706] underline font-medium cursor-pointer"
              >
                सबै ५०+ सामग्रीहरू हेर्नुहोस्
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredItems.map((item) => {
                const isSelected = currentSelectedImageUrl === item.imageUrl;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectImage(item);
                      onClose();
                    }}
                    className={`group bg-white dark:bg-stone-800 rounded-2xl border overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 relative ${
                      isSelected
                        ? 'border-2 border-green-600 dark:border-green-500 ring-2 ring-green-500/30'
                        : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 bg-green-600 text-white rounded-full p-1 shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Image Preview Box */}
                    <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.nameNepali}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-amber-300 text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                        {item.categoryNameNepali}
                      </span>
                    </div>

                    {/* Text Details & Select Button */}
                    <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-[#7A1C1C] dark:group-hover:text-amber-400 transition-colors">
                          {item.nameNepali}
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 mt-2 ${
                          isSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-[#7A1C1C] dark:text-amber-300'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isSelected ? 'चयन गरिएको छ' : 'यो फोटो छान्नुहोस्'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            देखाउँदै: <strong>{filteredItems.length}</strong> / ५० सामग्रीहरू
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            बन्द गर्नुहोस्
          </button>
        </div>

      </div>
    </div>
  );
};

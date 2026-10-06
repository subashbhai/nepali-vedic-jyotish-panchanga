import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Upload,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Eye,
  FileText,
  Sparkles,
  Layers,
  Save,
  Download,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  BookMarked,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { DigitalReligiousBook, BookChapter, BookCategoryKey } from '../../data/books/bookTypes';
import {
  getCustomBooks,
  saveCustomBook,
  deleteCustomBook,
  getCombinedBooksList
} from '../../data/books/customBooksStore';
import { BookCoverGenerator, detectDeityFromTitle } from './BookCoverGenerator';
import { BookReaderModal } from '../books/BookReaderModal';
import {
  parseAndTranslateRawBookChapter,
  translateHindiToNepali
} from '../../utils/nepaliBookTranslatorEngine';
import {
  extractTextFromPdfFile,
  isBinaryGarbage
} from '../../utils/pdfTextExtractor';
import { OrganizationProfile } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface StoreDigitalLibraryAdminTabProps {
  orgProfile?: OrganizationProfile;
}

const CATEGORY_OPTIONS: { key: BookCategoryKey; label: string }[] = [
  { key: 'mantra_stotra', label: '🔱 महाविद्या, मन्त्र एवं स्तोत्र' },
  { key: 'karmakanda', label: '🔥 कर्मकाण्ड एवं पूजा पद्धति' },
  { key: 'dharmashastra', label: '📜 धर्मशास्त्र एवं व्रत कथा' },
  { key: 'veda', label: '🕉️ वेद एवं रुद्राष्टाध्यायी' },
  { key: 'jyotisha', label: '🔯 ज्योतिष, उपाय तथा टोटके' },
  { key: 'vastu', label: '🏠 वास्तु शास्त्र' },
  { key: 'ayurveda_yoga', label: '🌿 आयुर्वेद तथा योग' },
  { key: 'nepal_vishesh', label: '🇳🇵 नेपाल विशेष तीर्थ एवं पूजा' },
];

export const StoreDigitalLibraryAdminTab: React.FC<StoreDigitalLibraryAdminTabProps> = ({
  orgProfile
}) => {
  // Books list state
  const [customBooks, setCustomBooks] = useState<DigitalReligiousBook[]>([]);
  const [allBooks, setAllBooks] = useState<DigitalReligiousBook[]>([]);

  // Preview Reader Modal state
  const [previewBook, setPreviewBook] = useState<DigitalReligiousBook | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'details' | 'cover' | 'chapters'>('details');

  // Book Form Fields
  const [editingId, setEditingId] = useState<string>('');
  const [titleNepali, setTitleNepali] = useState('');
  const [titleSanskrit, setTitleSanskrit] = useState('');
  const [subtitleNepali, setSubtitleNepali] = useState('सुरुदेखि अन्तिमसम्म पूर्ण पाठ • शुद्ध संस्कृत मन्त्र एवं नेपाली टीका');
  const [category, setCategory] = useState<BookCategoryKey>('mantra_stotra');
  const [authorOriginal, setAuthorOriginal] = useState('सनातन पारम्परिक धार्मिक ग्रन्थ');
  const [translatorNepali, setTranslatorNepali] = useState('बालानन्द वैदिक अनुसन्धान तथा सम्पादन मण्डल');
  const [edition, setEdition] = useState('२०८३ प्रथम संस्करण');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [descriptionNepali, setDescriptionNepali] = useState('');
  const [chapters, setChapters] = useState<BookChapter[]>([]);

  // Raw bulk text / PDF input for auto extraction
  const [rawBookText, setRawBookText] = useState('');
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);
  const [expandedChapterIndex, setExpandedChapterIndex] = useState<number | null>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshBooks = () => {
    setCustomBooks(getCustomBooks());
    setAllBooks(getCombinedBooksList());
  };

  useEffect(() => {
    refreshBooks();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Reset form to add new book
  const handleAddNewBook = () => {
    const newId = `book_custom_${Date.now()}`;
    setEditingId(newId);
    setTitleNepali('');
    setTitleSanskrit('');
    setSubtitleNepali('सुरुदेखि अन्तिमसम्म पूर्ण पाठ • शुद्ध संस्कृत मन्त्र एवं नेपाली टीका');
    setCategory('mantra_stotra');
    setAuthorOriginal('सनातन पारम्परिक धार्मिक ग्रन्थ');
    setTranslatorNepali('बालानन्द वैदिक अनुसन्धान तथा सम्पादन मण्डल');
    setEdition('२०८३ प्रथम संस्करण');
    setCoverImageUrl('');
    setDescriptionNepali('');
    setChapters([
      {
        id: `chap_${Date.now()}_1`,
        titleNepali: 'प्रथम अध्याय / भाग १',
        contentSanskrit: '',
        contentNepaliTika: ''
      }
    ]);
    setRawBookText('');
    setPdfProgress(null);
    setIsEditing(true);
    setActiveFormTab('details');
  };

  // Edit existing custom book
  const handleEditBook = (book: DigitalReligiousBook) => {
    setEditingId(book.id);
    setTitleNepali(book.titleNepali);
    setTitleSanskrit(book.titleSanskrit || '');
    setSubtitleNepali(book.subtitleNepali);
    setCategory(book.category);
    setAuthorOriginal(book.authorOriginal);
    setTranslatorNepali(book.translatorNepali);
    setEdition(book.edition);
    setCoverImageUrl(book.coverImage || '');
    setDescriptionNepali(book.descriptionNepali);
    setChapters(book.chapters || []);
    setRawBookText('');
    setPdfProgress(null);
    setIsEditing(true);
    setActiveFormTab('details');
  };

  // Delete custom book
  const handleDeleteBook = (id: string, title: string) => {
    if (window.confirm(`के तपाईं "${title}" पुस्तक डिजिटल पुस्तकालयबाट हटाउन निश्चित हुनुहुन्छ?`)) {
      deleteCustomBook(id);
      refreshBooks();
      showToast(`"${title}" सफलतापुर्वक हटाइयो।`);
    }
  };

  // Clean all corrupted books from storage
  const handleCleanCorruptedBooks = () => {
    const current = getCustomBooks();
    const corrupted = current.filter((b) =>
      b.chapters?.some(
        (c) => isBinaryGarbage(c.contentSanskrit || '') || isBinaryGarbage(c.contentNepaliTika || '')
      )
    );
    if (corrupted.length === 0) {
      alert('कुनै पनि भ्रष्ट (Corrupted) पुस्तक फेला परेन।');
      return;
    }
    if (window.confirm(`के तपाईं बाइनरी बिग्रेका ${corrupted.length} वटा पुराना पुस्तकहरू हटाउन चाहनुहुन्छ?`)) {
      corrupted.forEach((cb) => deleteCustomBook(cb.id));
      refreshBooks();
      showToast('भ्रष्ट पुस्तकहरू सफलतापूर्वक हटाइयो।');
    }
  };

  // Handle PDF / Text file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto set book title if empty
    if (!titleNepali) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitleNepali(cleanName);
    }

    try {
      setIsProcessingText(true);
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      let extractedText = '';

      if (isPdf) {
        setPdfProgress('PDF फाइल लोड गरिँदैछ...');
        const result = await extractTextFromPdfFile(file, (p) => {
          setPdfProgress(`पृष्ठ ${toDevanagariNumerals(p.current)} / ${toDevanagariNumerals(p.total)} बाट पाठ निकालिँदैछ...`);
        });

        if (result.isScanned) {
          alert('चेतावनी: यो PDF स्क्यान गरिएको फोटो (Scanned Image) हुन सक्छ, जसमा डिजिटल अक्षरहरू भेटिएन। कृपया यस ग्रन्थको मूल पाठ तलको बक्समा कपी-पेस्ट गर्नुहोस्।');
        }

        extractedText = result.text;
      } else {
        extractedText = await file.text();
      }

      // Check for binary garbage characters
      if (isBinaryGarbage(extractedText)) {
        alert('त्रुटि: यो फाइलबाट बाइनरी फोहोर कोड प्राप्त भयो (कुनै पठनीय देवनागरी/संस्कृत पाठ भेटिएन)। कृपया शुद्ध डिजिटल टेक्स्ट फाइल प्रयोग गर्नुहोस् वा पाठ सिधै तल पेस्ट गर्नुहोस्।');
        setRawBookText('');
        return;
      }

      if (extractedText && extractedText.trim().length > 0) {
        setRawBookText(extractedText);
        showToast(`फाइल "${file.name}" बाट पाठ सफलतापूर्वक लोड भयो! अब "अटो अनुवाद" बटन थिच्नुहोस्।`);
      } else {
        alert('फाइलबाट कुनै पाठ फेला परेन। कृपया पाठ सिधै कपी गरेर तल टाँस्नुहोस्।');
      }
    } catch (err: any) {
      console.error('File read error:', err);
      alert('PDF फाइल पढ्न समस्या आयो: ' + (err?.message || 'कृपया पाठ सिधै कपी गरेर तल टाँस्नुहोस्।'));
    } finally {
      setIsProcessingText(false);
      setPdfProgress(null);
      e.target.value = '';
    }
  };

  // Auto Split & Translate raw text into Chapters
  const handleAutoProcessAndTranslate = () => {
    if (!rawBookText.trim()) {
      alert('कृपया पहिले कुनै PDF फाइल छान्नुहोस् वा पाठ बक्समा पुस्तकको सामग्री टाँस्नुहोस्।');
      return;
    }

    if (isBinaryGarbage(rawBookText)) {
      alert('त्रुटि: बक्समा बाइनरी बिग्रेका अक्षरहरू छन्। कृपया यसलाई हटाएर शुद्ध देवनागरी/संस्कृत/नेपाली पाठ मात्र राख्नुहोस्।');
      return;
    }

    setIsProcessingText(true);
    try {
      // Check if text has multiple chapters indicated by keywords
      const chapterSplitRegex = /(?:\n\s*|^)(?:॥\s*)?(?:अथ\s+.*?अध्याय|अध्याय\s+[\d०-९]+|भाग\s+[\d०-९]+|खण्ड\s+[\d०-९]+|प्रथम[ः\s]|द्वितीय[ः\s]|तृतीय[ः\s]|चतुर्थ[ः\s]|पञ्चम[ः\s]|षष्ठ[ः\s]|सप्तम[ः\s]|अष्टम[ः\s]|नवम[ः\s]|दशम[ः\s]|एकादश[ः\s]|द्वादश[ः\s]|त्रयोदश[ः\s]|चतुर्दश[ः\s]|स्तोत्र[ः\s]|कवच[ः\s]|चालीसा|आरती)/gi;

      const rawChunks = rawBookText.split(chapterSplitRegex).filter((c) => c.trim().length > 0);

      let processedChapters: BookChapter[] = [];

      if (rawChunks.length > 1) {
        // Multi-chapter book
        processedChapters = rawChunks.map((chunk, idx) => {
          const parsed = parseAndTranslateRawBookChapter(chunk, `अध्याय ${toDevanagariNumerals(idx + 1)}`);
          return {
            id: `chap_${Date.now()}_${idx + 1}`,
            titleNepali: `अध्याय ${toDevanagariNumerals(idx + 1)}`,
            contentSanskrit: parsed.contentSanskrit,
            contentNepaliTika: parsed.contentNepaliTika,
          };
        });
      } else {
        // Single comprehensive chapter/book
        const parsed = parseAndTranslateRawBookChapter(rawBookText, titleNepali || 'सम्पूर्ण पाठ');
        processedChapters = [
          {
            id: `chap_${Date.now()}_1`,
            titleNepali: titleNepali ? `${titleNepali} - सम्पूर्ण पाठ` : 'सम्पूर्ण पाठ एवं टीका',
            contentSanskrit: parsed.contentSanskrit,
            contentNepaliTika: parsed.contentNepaliTika,
          }
        ];
      }

      setChapters(processedChapters);
      setActiveFormTab('chapters');
      setExpandedChapterIndex(0);
      showToast(`सफलतापूर्वक ${toDevanagariNumerals(processedChapters.length)} वटा अध्यायमा श्लोक र नेपाली टीका विभाजन गरियो!`);
    } catch (err) {
      console.error('Translation & parsing error:', err);
      alert('अनुवाद प्रक्रियामा समस्या आयो: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessingText(false);
    }
  };

  // Add a blank new chapter
  const handleAddBlankChapter = () => {
    const newChap: BookChapter = {
      id: `chap_${Date.now()}_${chapters.length + 1}`,
      titleNepali: `अध्याय ${toDevanagariNumerals(chapters.length + 1)}`,
      contentSanskrit: '',
      contentNepaliTika: ''
    };
    setChapters([...chapters, newChap]);
    setExpandedChapterIndex(chapters.length);
  };

  // Update specific chapter field
  const handleUpdateChapter = (index: number, field: keyof BookChapter, value: string) => {
    const updated = [...chapters];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setChapters(updated);
  };

  // Remove chapter
  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) {
      alert('कम्तिमा एउटा अध्याय अनिवार्य हुनुपर्दछ।');
      return;
    }
    const updated = chapters.filter((_, i) => i !== index);
    setChapters(updated);
    setExpandedChapterIndex(0);
  };

  // Save Book to LocalStorage & customBooksStore
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleNepali.trim()) {
      alert('कृपया पुस्तकको शीर्षक अनिवार्य रूपमा लेख्नुहोस्।');
      return;
    }

    if (chapters.length === 0 || chapters.every((c) => !c.contentNepaliTika && !c.contentSanskrit)) {
      alert('कृपया कम्तिमा एउटा अध्यायमा मन्त्र वा नेपाली टीका राख्नुहोस्।');
      return;
    }

    const categoryObj = CATEGORY_OPTIONS.find((c) => c.key === category);

    const bookToSave: DigitalReligiousBook = {
      id: editingId || `book_custom_${Date.now()}`,
      slug: (titleNepali.trim().toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`).replace(/[^\w-]/g, ''),
      titleNepali: titleNepali.trim(),
      titleSanskrit: titleSanskrit.trim() || undefined,
      subtitleNepali: subtitleNepali.trim(),
      category: category,
      categoryLabelNepali: categoryObj ? categoryObj.label : 'धार्मिक ग्रन्थ',
      authorOriginal: authorOriginal.trim() || 'सनातन पारम्परिक ग्रन्थ',
      translatorNepali: translatorNepali.trim() || 'बालानन्द वैदिक अनुसन्धान मण्डल',
      publisher: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा, नेपाल',
      edition: edition.trim() || '२०८३ प्रथम संस्करण',
      pagesCount: Math.max(chapters.length * 2, 4),
      language: ['संस्कृत', 'नेपाली'],
      script: 'देवनागरी (Devanagari)',
      coverImage: coverImageUrl || undefined,
      coverBadge: 'आधिकारिक डिजिटल संस्करण',
      descriptionNepali: descriptionNepali.trim() || `${titleNepali.trim()} - शुद्ध संस्कृत मन्त्र तथा विस्तृत नेपाली टीका सहितको पूर्ण डिजिटल ग्रन्थ।`,
      tocNepali: chapters.map((c) => c.titleNepali),
      chapters: chapters,
      sourceName: 'बालानन्द वैदिक डिजिटल पुस्तकालय',
      copyrightStatus: 'BALANANDA_COPYRIGHT',
      accessType: 'LOCAL_DOWNLOAD',
      isLetterheadEdition: true,
      featured: true,
      publishedDateBS: '२०८३',
    };

    saveCustomBook(bookToSave);
    refreshBooks();
    setIsEditing(false);
    showToast(`"${bookToSave.titleNepali}" सफलतापूर्वक पुस्तकालयमा प्रकाशित भयो!`);
  };

  // Preview generated book in Reader
  const handleOpenLivePreview = () => {
    if (!titleNepali.trim()) {
      alert('कृपया पहिले पुस्तकको शीर्षक लेख्नुहोस्।');
      return;
    }

    const tempBook: DigitalReligiousBook = {
      id: editingId || 'temp_preview',
      slug: 'temp-preview',
      titleNepali: titleNepali.trim() || 'अप्रकाशित पुस्तक',
      titleSanskrit: titleSanskrit.trim() || undefined,
      subtitleNepali: subtitleNepali.trim(),
      category: category,
      categoryLabelNepali: 'धार्मिक ग्रन्थ',
      authorOriginal: authorOriginal.trim(),
      translatorNepali: translatorNepali.trim(),
      publisher: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
      edition: edition.trim(),
      pagesCount: Math.max(chapters.length * 2, 2),
      language: ['संस्कृत', 'नेपाली'],
      script: 'देवनागरी',
      coverImage: coverImageUrl || undefined,
      descriptionNepali: descriptionNepali.trim(),
      tocNepali: chapters.map((c) => c.titleNepali),
      chapters: chapters,
      sourceName: 'बालानन्द वैदिक डिजिटल पुस्तकालय',
      copyrightStatus: 'BALANANDA_COPYRIGHT',
      accessType: 'LOCAL_DOWNLOAD',
      isLetterheadEdition: true,
      featured: true,
      publishedDateBS: '२०८३',
    };

    setPreviewBook(tempBook);
    setIsPreviewOpen(true);
  };

  const detectedDeity = useMemo(() => detectDeityFromTitle(titleNepali), [titleNepali]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown">
          <CheckCircle className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#78350F] via-[#92400E] to-[#B45309] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 px-3.5 py-1.5 rounded-full text-amber-200 text-xs font-bold border border-amber-300/30">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>बालानन्द वैदिक डिजिटल पुस्तकालय • एडमिन म्यानेजर</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight leading-snug">
            धार्मिक ग्रन्थ एवं PDF अपलोडर • अटो नेपाली टीका &amp; कभर जेनेरेटर
          </h2>

          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed">
            जुनसुकै भाषा (हिन्दी वा संस्कृत) को PDF वा पाठ अपलोड गर्दा, हाम्रो स्वचालित इन्जिनले मूल
            संस्कृत मन्त्रलाई जस्ताको तस्तै देवनागरी संस्कृतमै राख्छ र बाँकी सम्पूर्ण टीका/व्याख्यालाई
            शुद्ध नेपालीमा रूपान्तरण गरी बालानन्द लेटरहेडमा प्रकाशन गर्दछ।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!isEditing && (
              <button
                type="button"
                onClick={handleAddNewBook}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-black rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>नयाँ पुस्तक / PDF अपलोड गर्नुहोस्</span>
              </button>
            )}

            <div className="text-xs text-amber-200 font-bold bg-black/30 px-3 py-1.5 rounded-lg border border-amber-400/20">
              कुल पुस्तकहरू: {toDevanagariNumerals(allBooks.length)} (कस्टम: {toDevanagariNumerals(customBooks.length)})
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        /* Edit / Create Form */
        <div className="bg-white dark:bg-[#1C1917] border border-amber-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 dark:border-stone-800 pb-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>{editingId ? 'पुस्तक सम्पादन / नयाँ ग्रन्थ निर्माण' : 'नयाँ पुस्तक थप्नुहोस्'}</span>
              </h3>
              <p className="text-xs text-stone-500">
                शीर्षक, अटो-कभर, संस्कृत श्लोक र नेपाली टीका भरेर १-क्लिकमा पुस्तकालयमा प्रकाशित गर्नुहोस्।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenLivePreview}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-300 dark:border-stone-700"
              >
                <Eye className="w-4 h-4 text-amber-600" />
                <span>लाइभ पूर्वदर्शन (Preview)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
            {[
              { id: 'details', label: '१. आधारभूत विवरण', icon: FileText },
              { id: 'cover', label: '२. अटो फिचर कभर', icon: ImageIcon },
              { id: 'chapters', label: `३. अध्याय, श्लोक & टीका (${chapters.length})`, icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeFormTab === tab.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSaveBook} className="space-y-6">
            {/* TAB 1: Basic Details */}
            {activeFormTab === 'details' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      पुस्तकको नेपाली शीर्षक <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={titleNepali}
                      onChange={(e) => setTitleNepali(e.target.value)}
                      placeholder="उदा: श्री गणेश चालीसा एवं स्तोत्र, श्री हनुमान बाहुक"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden font-bold"
                      required
                    />
                    <p className="text-[11px] text-amber-600 mt-1">
                      💡 शीर्षक लेख्ने बित्तिकै सम्बन्धित भगवान्‌को कभर स्वतः पहिचान हुन्छ ({detectedDeity.deityNepali})
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      संस्कृत शीर्षक (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      value={titleSanskrit}
                      onChange={(e) => setTitleSanskrit(e.target.value)}
                      placeholder="उदा: श्रीगणेशचालीसा स्तोत्रञ्च"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      उपशीर्षक / ट्यागलाइन
                    </label>
                    <input
                      type="text"
                      value={subtitleNepali}
                      onChange={(e) => setSubtitleNepali(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      विधा / वर्ग (Category)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as BookCategoryKey)}
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-bold"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      संस्करण (Edition)
                    </label>
                    <input
                      type="text"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      मूल ग्रन्थकार / परम्परा
                    </label>
                    <input
                      type="text"
                      value={authorOriginal}
                      onChange={(e) => setAuthorOriginal(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      नेपाली टीकाकार / सम्पादक
                    </label>
                    <input
                      type="text"
                      value={translatorNepali}
                      onChange={(e) => setTranslatorNepali(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    पुस्तकको विस्तृत परिचय (Description)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionNepali}
                    onChange={(e) => setDescriptionNepali(e.target.value)}
                    placeholder="यस ग्रन्थको महत्ता, विधि, फलश्रुति र परम्पराको बारेमा संक्षिप्त परिचय..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                {/* Next Step Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('cover')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <span>अर्को चरण: अटो कभर हेर्नुहोस्</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Auto Feature Cover Generator */}
            {activeFormTab === 'cover' && (
              <div className="space-y-5">
                <BookCoverGenerator
                  title={titleNepali || 'श्री धार्मिक ग्रन्थ'}
                  subtitle={subtitleNepali}
                  authorOrTradition={authorOriginal}
                  editionBadge={edition}
                  onCoverGenerated={(dataUrl) => {
                    setCoverImageUrl(dataUrl);
                  }}
                />

                <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    वा आफ्नै कस्टम कभर फोटो लिङ्क (Custom Image URL / File):
                  </label>
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://... वा माथिको अटो-जेनेरेटेड इमेज स्वतः बसिसकेको छ"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                  />
                  <p className="text-[11px] text-stone-500">
                    💡 यदि तपाईंले माथि केही गर्नुभएन भने पनि शीर्षक अनुसारको दिव्य कभर स्वतः सुरक्षित हुन्छ।
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('details')}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ← अघिल्लो: आधारभूत विवरण
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('chapters')}
                    className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <span>अर्को चरण: PDF अपलोड &amp; श्लोक-टीका सम्पादन</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PDF Upload, Auto-Translation & Chapter Editor */}
            {activeFormTab === 'chapters' && (
              <div className="space-y-6">
                {/* Auto Import / Upload Box */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif">
                        <Upload className="w-4 h-4 text-amber-700" />
                        <span>PDF फाइल छान्नुहोस् वा पाठ पेस्ट गर्नुहोस् (Auto-Translate &amp; Segregate)</span>
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        कुनै पनि भाषाको धार्मिक सामग्री पेस्ट गरेर १-क्लिकमा श्लोक (संस्कृत) र व्याख्या (नेपाली) विभाजन गर्नुहोस्।
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.txt,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>फाइल अपलोड (.pdf / .txt)</span>
                      </button>
                    </div>
                  </div>

                  {pdfProgress && (
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-bold animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-300" />
                      <span>{pdfProgress}</span>
                    </div>
                  )}

                  <textarea
                    rows={6}
                    value={rawBookText}
                    onChange={(e) => setRawBookText(e.target.value)}
                    placeholder="यहाँ पुस्तकको कुनै पनि अध्याय, हिन्दी टीका वा मूल मन्त्रहरू टाँस्नुहोस् (Paste text here)..."
                    className="w-full p-3 rounded-xl border border-amber-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-serif"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      ✨ नियम: संस्कृत मन्त्र जस्ताको तस्तै देवनागरीमा रहनेछ, हिन्दी व्याख्या शुद्ध नेपाली टीकामा रूपान्तरण हुनेछ।
                    </p>

                    <button
                      type="button"
                      disabled={isProcessingText}
                      onClick={handleAutoProcessAndTranslate}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                      <span>{isProcessingText ? 'प्रक्रिया चल्दैछ...' : '⚡ अटो अनुवाद तथा श्लोक-टीका विभाजन गर्नुहोस्'}</span>
                    </button>
                  </div>
                </div>

                {/* Chapter List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>अध्यायहरूको सूची ({toDevanagariNumerals(chapters.length)} अध्यायहरू)</span>
                    </h4>

                    <button
                      type="button"
                      onClick={handleAddBlankChapter}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>नयाँ अध्याय थप्नुहोस्</span>
                    </button>
                  </div>

                  {chapters.map((chap, idx) => {
                    const isExpanded = expandedChapterIndex === idx;
                    const hasSanskrit = Boolean(chap.contentSanskrit && chap.contentSanskrit.trim().length > 0);

                    return (
                      <div
                        key={chap.id || idx}
                        className="bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs transition-all"
                      >
                        {/* Chapter Accordion Header */}
                        <div
                          onClick={() => setExpandedChapterIndex(isExpanded ? null : idx)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800 select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center font-mono">
                              {toDevanagariNumerals(idx + 1)}
                            </span>
                            <div>
                              <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                {chap.titleNepali || `अध्याय ${toDevanagariNumerals(idx + 1)}`}
                              </h5>
                              <p className="text-[11px] text-stone-500">
                                {hasSanskrit
                                  ? '🕉️ संस्कृत मन्त्र + नेपाली टीका (५०/५० स्प्लिट)'
                                  : '🇳🇵 पूर्ण पृष्ठ नेपाली टीका/विधि (सस्कृत बिना १००% नेपाली)'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveChapter(idx);
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="यो अध्याय हटाउनुहोस्"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-stone-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-stone-500" />
                            )}
                          </div>
                        </div>

                        {/* Chapter Content Details */}
                        {isExpanded && (
                          <div className="p-4 pt-0 space-y-4 border-t border-stone-200 dark:border-stone-800 mt-2">
                            <div>
                              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                अध्यायको शीर्षक (Nepali Title)
                              </label>
                              <input
                                type="text"
                                value={chap.titleNepali}
                                onChange={(e) => handleUpdateChapter(idx, 'titleNepali', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-hidden"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Sanskrit Shloka Box */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1 font-serif">
                                    <span>🕉️ मूल संस्कृत मन्त्र / श्लोकहरू (Verbatim)</span>
                                  </label>
                                  <span className="text-[10px] text-stone-400">
                                    {hasSanskrit ? 'संस्कृत मन्त्र उपस्थित' : 'खाली भएमा पूर्ण पृष्ठ नेपाली हुन्छ'}
                                  </span>
                                </div>
                                <textarea
                                  rows={8}
                                  value={chap.contentSanskrit || ''}
                                  onChange={(e) => handleUpdateChapter(idx, 'contentSanskrit', e.target.value)}
                                  placeholder="॥ ॐ भूर्भुवः स्वः... (यदि संस्कृत मन्त्र छैन भने खाली छोड्नुहोस्)"
                                  className="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-amber-500 outline-hidden"
                                />
                              </div>

                              {/* Nepali Tika Box */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                                    <span>🇳🇵 नेपाली टीका, भावार्थ तथा पूजा विधि</span>
                                  </label>
                                  <span className="text-[10px] text-emerald-600 font-bold">
                                    नेपाली भाषामा रूपान्तरित
                                  </span>
                                </div>
                                <textarea
                                  rows={8}
                                  value={chap.contentNepaliTika || ''}
                                  onChange={(e) => handleUpdateChapter(idx, 'contentNepaliTika', e.target.value)}
                                  placeholder="यस मन्त्र वा अध्यायको विस्तृत नेपाली व्याख्या तथा पूजा विधि..."
                                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-amber-500 outline-hidden"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Final Submit & Preview Action Bar */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleOpenLivePreview}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span>लाइभ पूर्वदर्शन (Live Patrika Preview)</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      रद्द गर्नुहोस्
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>💾 डिजिटल पुस्तकालयमा प्रकाशन गर्नुहोस् (Publish)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* Books List View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-amber-600" />
                <span>डिजिटल पुस्तकालयका प्रकाशित ग्रन्थहरू</span>
              </h3>
              <p className="text-xs text-stone-500">
                यहाँ तपाईंले आफ्ना कस्टम पुस्तकहरू थप्न, सम्पादन गर्न, हटाउन वा सिधै PDF डाउनलोड गर्न सक्नुहुन्छ।
              </p>
            </div>

            <div className="flex items-center gap-2">
              {customBooks.some((b) =>
                b.chapters?.some(
                  (c) => isBinaryGarbage(c.contentSanskrit || '') || isBinaryGarbage(c.contentNepaliTika || '')
                )
              ) && (
                <button
                  type="button"
                  onClick={handleCleanCorruptedBooks}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-300 dark:border-red-800"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>⚠️ बिग्रेको/बाइनरी ग्रन्थ हटाउनुहोस्</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleAddNewBook}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>नयाँ धार्मिक ग्रन्थ थप्नुहोस्</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allBooks.map((book) => {
              const isCustom = customBooks.some((cb) => cb.id === book.id);

              return (
                <div
                  key={book.id}
                  className="bg-white dark:bg-[#1C1917] border border-amber-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {book.categoryLabelNepali}
                      </span>

                      {isCustom ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          कस्टम अपलोड
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          मूल ग्रन्थ
                        </span>
                      )}
                    </div>

                    {/* Book Cover / Thumbnail Preview */}
                    {book.coverImage && (
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-900 border border-amber-200 shadow-xs">
                        <img
                          src={book.coverImage}
                          alt={book.titleNepali}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 leading-snug">
                        {book.titleNepali}
                      </h4>
                      {book.titleSanskrit && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-serif">
                          {book.titleSanskrit}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {book.descriptionNepali}
                    </p>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 space-y-1">
                      <div>अध्यायहरू: <strong>{toDevanagariNumerals(book.chapters.length)}</strong></div>
                      <div>टीकाकार: {book.translatorNepali}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewBook(book);
                        setIsPreviewOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>पढ्नुहोस् / PDF</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isCustom && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditBook(book)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs cursor-pointer transition-colors"
                            title="सम्पादन गर्नुहोस्"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(book.id, book.titleNepali)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs cursor-pointer transition-colors"
                            title="हटाउनुहोस्"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Book Reader Modal for Preview & Download */}
      <BookReaderModal
        book={previewBook}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewBook(null);
        }}
        orgProfile={orgProfile}
      />
    </div>
  );
};

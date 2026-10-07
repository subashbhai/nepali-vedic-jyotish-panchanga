import React, { useState, useEffect, useMemo } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Share2,
  Send,
  Link as LinkIcon,
  Copy,
  Check,
  Calendar,
  User,
  Tag,
  Clock,
  Sparkles,
  Flame,
  AlertCircle,
  X,
  MessageCircle,
  Mail,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Camera,
  UploadCloud,
  Loader2,
  RefreshCw,
  Sliders,
  Maximize2,
  Activity,
  TrendingUp,
  Layers,
  Globe,
  Bookmark,
  Compass,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import {
  SamacharArticle,
  SamacharCategory,
  SAMACHAR_CATEGORY_NAMES,
  NewsEditorMagicToken,
  getStoredArticles,
  saveSingleArticle,
  deleteArticle,
  getStoredActiveMagicTokens,
  generateNewsEditorMagicToken,
  revokeMagicToken,
  buildWhatsAppMessageForEditor,
  getWhatsAppShareUrl,
  getEmailShareUrl
} from '../../../db/samacharStore';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';
import { getAppBaseUrl } from '../../../utils/urlHelper';
import { compressAndResizeImage } from '../../../utils/imageUtils';
import { handlePhoneticInputKeyDown } from '../../../utils/nepaliTransliteration';

interface NewsEditorDashboardProps {
  orgName?: string;
  onRefreshParent?: () => void;
  isStandalone?: boolean;
}

export const NewsEditorDashboard: React.FC<NewsEditorDashboardProps> = ({
  orgName = 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा',
  onRefreshParent,
  isStandalone = false
}) => {
  // Main Sub-tabs
  const [activeTab, setActiveTab] = useState<'ARTICLES' | 'COMPOSE' | 'BREAKING_TICKER' | 'ANALYTICS' | 'MAGIC_LINKS'>('ARTICLES');

  // Articles data
  const [articles, setArticles] = useState<SamacharArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Active Magic Tokens data
  const [magicTokens, setMagicTokens] = useState<NewsEditorMagicToken[]>([]);
  const [isMagicLinkModalOpen, setIsMagicLinkModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [durationHours, setDurationHours] = useState<number>(72);
  const [editorNote, setEditorNote] = useState('');
  const [lastGeneratedLink, setLastGeneratedLink] = useState<{
    tokenRecord: NewsEditorMagicToken;
    activeLinkUrl: string;
  } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Form State for Article (Create / Edit)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<SamacharCategory>('panchanga');
  const [formAuthor, setFormAuthor] = useState('');
  const [formAuthorRole, setFormAuthorRole] = useState('सम्पादक');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDateBS, setFormDateBS] = useState('');
  const [formDateAD, setFormDateAD] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formTags, setFormTags] = useState('');
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Preview Article Modal
  const [previewArticle, setPreviewArticle] = useState<SamacharArticle | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadData = () => {
    try {
      const art = getStoredArticles();
      const tokens = getStoredActiveMagicTokens();
      setArticles([...art]);
      setMagicTokens([...tokens]);
      if (onRefreshParent) onRefreshParent();
    } catch (e) {
      console.error('Failed to load articles data:', e);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = filterCategory === 'all' || art.category === filterCategory;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && art.isPublished) ||
        (filterStatus === 'draft' && !art.isPublished);

      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.author.toLowerCase().includes(q) ||
        (art.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchCat && matchStatus && matchQ;
    });
  }, [articles, filterCategory, filterStatus, searchQuery]);

  // Readership Metrics
  const metrics = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.isPublished).length;
    const drafts = total - published;
    const totalViews = articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
    const breakingCount = articles.filter((a) => a.isBreaking).length;
    const featuredCount = articles.filter((a) => a.isFeatured).length;

    // Categories Breakdown
    const catCounts: Record<string, number> = {};
    articles.forEach((a) => {
      catCounts[a.category] = (catCounts[a.category] || 0) + 1;
    });

    return { total, published, drafts, totalViews, breakingCount, featuredCount, catCounts };
  }, [articles]);

  // Open Compose for New Article
  const handleOpenComposeNew = () => {
    setEditingArticleId(null);
    const today = new Date().toISOString().split('T')[0];
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormCategory('panchanga');
    setFormAuthor('ज्योतिषाचार्य सम्पादक मण्डल');
    setFormAuthorRole('सम्पादक');
    setFormImageUrl('https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80');
    setFormDateBS('२०८३-०५-२५');
    setFormDateAD(today);
    setFormIsPublished(true);
    setFormIsFeatured(false);
    setFormIsBreaking(false);
    setFormTags('पञ्चाङ्ग, ज्योतिष, चाडपर्व');
    setShowUrlInput(false);
    setActiveTab('COMPOSE');
  };

  // Open Compose for Existing Article
  const handleOpenComposeEdit = (art: SamacharArticle) => {
    setEditingArticleId(art.id);
    setFormTitle(art.title);
    setFormSummary(art.summary);
    setFormContent(art.content);
    setFormCategory(art.category);
    setFormAuthor(art.author);
    setFormAuthorRole(art.authorRole || 'सम्पादक');
    setFormImageUrl(art.coverImageUrl || '');
    setFormDateBS(art.publishedAtBS);
    setFormDateAD(art.publishedAtAD);
    setFormIsPublished(art.isPublished);
    setFormIsFeatured(art.isFeatured);
    setFormIsBreaking(art.isBreaking);
    setFormTags((art.tags || []).join(', '));
    setShowUrlInput(false);
    setActiveTab('COMPOSE');
  };

  // Handle Photo Compression & Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingImage(true);
      const base64 = await compressAndResizeImage(file, 1200, 700, 0.82);
      setFormImageUrl(base64);
      showToast('समाचारको मुख्य तस्बिर सफलतापूर्वक लोड भयो।');
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('तस्बिर लोड गर्दा समस्या आयो। कृपया पुन: प्रयास गर्नुहोस्।');
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Handle Save Article
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('कृपया समाचारको शीर्षक प्रविष्ट गर्नुहोस्।');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const existingArt = editingArticleId ? articles.find((a) => a.id === editingArticleId) : null;

    const articleToSave: SamacharArticle = {
      id: editingArticleId || `samachar_${Date.now()}`,
      slug: formTitle.trim().toLowerCase().replace(/\s+/g, '-').substring(0, 50) || 'article',
      title: formTitle.trim(),
      summary: formSummary.trim(),
      content: formContent.trim(),
      category: formCategory,
      categoryNameNepali: SAMACHAR_CATEGORY_NAMES[formCategory],
      author: formAuthor.trim() || 'सम्पादक मण्डल',
      authorRole: formAuthorRole.trim() || 'सम्पादक',
      coverImageUrl:
        formImageUrl.trim() ||
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
      publishedAtBS: formDateBS || '२०८३-०५-२५',
      publishedAtAD: formDateAD || new Date().toISOString().split('T')[0],
      isPublished: formIsPublished,
      isFeatured: formIsFeatured,
      isBreaking: formIsBreaking,
      tags: tagsArray,
      viewsCount: existingArt ? existingArt.viewsCount : 0,
      readTimeMinutes: Math.max(1, Math.round(formContent.length / 500))
    };

    saveSingleArticle(articleToSave);
    reloadData();
    showToast(editingArticleId ? 'समाचार सफलतापूर्वक अद्यावधिक भयो!' : 'नयाँ समाचार सफलतापूर्वक प्रकाशित भयो!');
    setActiveTab('ARTICLES');
  };

  // Handle Delete Article
  const handleDeleteArticle = (id: string, title: string) => {
    if (confirm(`के तपाईं "${title}" मेटाउन निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।`)) {
      deleteArticle(id);
      reloadData();
      showToast('समाचार सफलतापूर्वक हटाइयो।');
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = (art: SamacharArticle) => {
    const updated = { ...art, isPublished: !art.isPublished };
    saveSingleArticle(updated);
    reloadData();
    showToast(updated.isPublished ? 'समाचार सार्वजनिक प्रकाशित गरियो।' : 'समाचार मस्यौदा (Draft) मा सारियो।');
  };

  // Toggle Breaking News
  const handleToggleBreaking = (art: SamacharArticle) => {
    const updated = { ...art, isBreaking: !art.isBreaking };
    saveSingleArticle(updated);
    reloadData();
    showToast(updated.isBreaking ? 'ताजा ब्रेकिङ न्युज टिकरमा थपियो!' : 'ब्रेकिङ टिकरबाट हटाइयो।');
  };

  // Generate Magic Token
  const handleGenerateMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      alert('कृपया प्राप्तकर्ता (सम्पादक) को नाम प्रविष्ट गर्नुहोस्।');
      return;
    }

    const res = generateNewsEditorMagicToken({
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim() || undefined,
      recipientPhone: recipientPhone.trim() || undefined,
      durationHours: durationHours,
      note: editorNote.trim() || undefined,
      createdBy: 'NewsEditorSupervision'
    });

    setLastGeneratedLink(res);
    reloadData();
    showToast('सह-सम्पादक सक्रिय लिङ्क तयार भयो!');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    showToast('लिङ्क क्लिपबोर्डमा कपी भयो!');
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (!lastGeneratedLink) return;
    const msg = buildWhatsAppMessageForEditor({
      recipientName: lastGeneratedLink.tokenRecord.recipientName,
      activeLinkUrl: lastGeneratedLink.activeLinkUrl,
      expiresAt: lastGeneratedLink.tokenRecord.expiresAt,
      orgName
    });
    const waUrl = getWhatsAppShareUrl(recipientPhone, msg);
    window.open(waUrl, '_blank');
  };

  const handleSendEmail = () => {
    if (!lastGeneratedLink) return;
    const msg = buildWhatsAppMessageForEditor({
      recipientName: lastGeneratedLink.tokenRecord.recipientName,
      activeLinkUrl: lastGeneratedLink.activeLinkUrl,
      expiresAt: lastGeneratedLink.tokenRecord.expiresAt,
      orgName
    });
    const subject = `[${orgName}] समाचार सम्पादक प्रत्यक्ष पहुँच सक्रिय लिङ्क`;
    const mailUrl = getEmailShareUrl(recipientEmail, subject, msg);
    window.open(mailUrl, '_blank');
  };

  const handleRevoke = (token: string) => {
    if (confirm('के तपाईं यो सक्रिय लिङ्क रद्द गर्न निश्चित हुनुहुन्छ? यसपछि सम्पादकले यो लिङ्कबाट पहुँच पाउने छैनन्।')) {
      revokeMagicToken(token);
      reloadData();
      showToast('सक्रिय लिङ्क सफलतापूर्वक रद्द गरियो।');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-stone-900 dark:text-stone-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white p-5 sm:p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-semibold border border-amber-500/30">
            <Newspaper className="w-4 h-4 text-amber-400" />
            <span>समाचार तथा लेख सम्पादक नियन्त्रण कक्ष (Editorial Command Center)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
            वैदिक पञ्चाङ्ग, ज्योतिषीय समाचार तथा लेख व्यवस्थापन
          </h2>
          <p className="text-xs text-stone-300 max-w-3xl">
            दैनिक पञ्चाङ्ग, खगोलीय ग्रह गोचर, धार्मिक चाडपर्व, मुहूर्त विश्लेषण र अनुसन्धानात्मक शास्त्रीय लेखहरूको मस्यौदा, तस्बिर तथा प्रत्यक्ष प्रकाशन।
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleOpenComposeNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-xs font-extrabold shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ नयाँ समाचार / लेख रचना</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLastGeneratedLink(null);
              setIsMagicLinkModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-500/30"
            title="सह-सम्पादकलाई सुरक्षित लगइन लिङ्क पठाउनुहोस्"
          >
            <Send className="w-4 h-4 text-amber-300" />
            <span>सम्पादक लिङ्क प्रेषक</span>
          </button>

          <button
            type="button"
            onClick={reloadData}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 text-xs transition-all cursor-pointer"
            title="रिफ्रेस गर्नुहोस्"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('ARTICLES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'ARTICLES'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>सबै समाचार तथा लेखहरू ({toDevanagariNumerals(articles.length)})</span>
        </button>

        <button
          type="button"
          onClick={handleOpenComposeNew}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'COMPOSE'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800'
          }`}
        >
          <Edit className="w-4 h-4" />
          <span>{editingArticleId ? 'लेख सम्पादन (Edit Mode)' : 'नयाँ लेख रचना (Compose)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BREAKING_TICKER')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'BREAKING_TICKER'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500" />
          <span>ताजा ब्रेकिङ न्युज टिकर ({toDevanagariNumerals(metrics.breakingCount)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'ANALYTICS'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>पाठक तथ्याङ्क तथा विश्लेषण</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MAGIC_LINKS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'MAGIC_LINKS'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800'
          }`}
        >
          <Send className="w-4 h-4 text-emerald-500" />
          <span>सक्रिय टोकन लगहरू ({toDevanagariNumerals(magicTokens.length)})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL ARTICLES LIST */}
      {/* ========================================================================= */}
      {activeTab === 'ARTICLES' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">कुल प्रकाशित समाचार</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400">
                  {toDevanagariNumerals(metrics.total)}
                </span>
                <Newspaper className="w-5 h-5 text-stone-400" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">
                सार्वजनिक: {toDevanagariNumerals(metrics.published)} | मस्यौदा: {toDevanagariNumerals(metrics.drafts)}
              </span>
            </div>

            <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">सार्वजनिक पाठक संख्या</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
                  {toDevanagariNumerals(metrics.totalViews)}
                </span>
                <Eye className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-[10px] text-emerald-600/80 mt-1">प्रत्यक्ष अवलोकन</span>
            </div>

            <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">ताजा ब्रेकिङ समाचार</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold font-serif text-rose-600 dark:text-rose-400">
                  {toDevanagariNumerals(metrics.breakingCount)}
                </span>
                <Flame className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">एपको शीर्ष टिकरमा सक्रिय</span>
            </div>

            <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">विशेष फिचर्ड लेखहरू</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold font-serif text-indigo-600 dark:text-indigo-400">
                  {toDevanagariNumerals(metrics.featuredCount)}
                </span>
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">गृहपृष्ठ मुख्य ब्यानर</span>
            </div>
          </div>

          {/* Search and Category Filters */}
          <div className="bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Phonetic Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="समाचारको शीर्षक, लेखक, ट्याग खोज्नुहोस् (उदा: panchang + space)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, searchQuery, setSearchQuery)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 shrink-0 bg-stone-100 dark:bg-stone-950 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
                {(['all', 'published', 'draft'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    {st === 'all' ? 'सबै स्थिति' : st === 'published' ? 'प्रकाशित' : 'मस्यौदा'}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="shrink-0">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">सबै वर्ग (All Categories)</option>
                  {(Object.keys(SAMACHAR_CATEGORY_NAMES) as SamacharCategory[]).map((cKey) => (
                    <option key={cKey} value={cKey}>
                      {SAMACHAR_CATEGORY_NAMES[cKey]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Articles Table Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">तस्बिर तथा शीर्षक</th>
                    <th className="p-3.5">वर्ग</th>
                    <th className="p-3.5">लेखक / स्रोत</th>
                    <th className="p-3.5">प्रकाशन मिति</th>
                    <th className="p-3.5">पाठक</th>
                    <th className="p-3.5">स्थिति</th>
                    <th className="p-3.5">ताजा खबर</th>
                    <th className="p-3.5 text-right">कार्यहरू</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-stone-500">
                        <Newspaper className="w-10 h-10 mx-auto text-stone-400 mb-2 opacity-50" />
                        <p className="font-bold">कुनै समाचार वा लेख फेला परेन।</p>
                        <p className="text-[11px] mt-1">माथिको "+ नयाँ समाचार / लेख रचना" बटन थिची नयाँ लेख सिर्जना गर्नुहोस्।</p>
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => (
                      <tr
                        key={art.id}
                        className="hover:bg-amber-50/40 dark:hover:bg-stone-800/50 transition-colors"
                      >
                        <td className="p-3.5 max-w-sm">
                          <div className="flex items-center gap-3">
                            {art.coverImageUrl && (
                              <img
                                src={art.coverImageUrl}
                                alt={art.title}
                                className="w-14 h-11 object-cover rounded-xl shrink-0 border border-stone-200 dark:border-stone-700 shadow-2xs"
                              />
                            )}
                            <div>
                              <button
                                type="button"
                                onClick={() => setPreviewArticle(art)}
                                className="font-bold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 text-left line-clamp-1 cursor-pointer transition-colors"
                                title="पूर्वावलोकन हेर्नुहोस्"
                              >
                                {art.title}
                              </button>
                              <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                {art.summary}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {art.isBreaking && (
                                  <span className="bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[9px] font-extrabold px-2 py-0.2 rounded-full border border-rose-500/30">
                                    ⚡ ताजा ब्रेकिङ
                                  </span>
                                )}
                                {art.isFeatured && (
                                  <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-extrabold px-2 py-0.2 rounded-full border border-amber-500/30">
                                    ⭐ मुख्य समाचार
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-stone-200 dark:border-stone-700">
                            {art.categoryNameNepali}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap font-medium">
                          <div className="text-stone-900 dark:text-stone-100 font-bold">{art.author}</div>
                          <div className="text-[10px] text-stone-500">{art.authorRole || 'सम्पादक'}</div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-stone-500">
                          <div className="font-mono text-xs">{art.publishedAtBS}</div>
                          <div className="text-[10px] text-stone-400">{art.publishedAtAD}</div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="flex items-center gap-1 font-mono font-bold text-stone-700 dark:text-stone-300">
                            <Eye className="w-3.5 h-3.5 text-stone-400" />
                            {toDevanagariNumerals(art.viewsCount || 0)}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(art)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] cursor-pointer transition-all shadow-2xs ${
                              art.isPublished
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400 border border-stone-300 dark:border-stone-700'
                            }`}
                            title="प्रकाशन स्थिति फेर्न क्लिक गर्नुहोस्"
                          >
                            {art.isPublished ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>सार्वजनिक</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-stone-500" />
                                <span>मस्यौदा (Draft)</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleBreaking(art)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              art.isBreaking
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-rose-500'
                            }`}
                            title={art.isBreaking ? 'ब्रेकिङ टिकरबाट हटाउनुहोस्' : 'ब्रेकिङ टिकरमा राख्नुहोस्'}
                          >
                            <Flame className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewArticle(art)}
                              className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-colors cursor-pointer"
                              title="पूर्वावलोकन हेर्नुहोस्"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenComposeEdit(art)}
                              className="p-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl transition-colors cursor-pointer"
                              title="सम्पादन गर्नुहोस्"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 rounded-xl transition-colors cursor-pointer"
                              title="मेटाउनुहोस्"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPOSE / EDIT ARTICLE */}
      {/* ========================================================================= */}
      {activeTab === 'COMPOSE' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <span>{editingArticleId ? 'समाचार तथा लेख सम्पादन (Edit Article)' : 'नयाँ समाचार तथा लेख रचना (Compose Article)'}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                रोमनमा टाइप गर्दा <strong>Spacebar</strong> थिचेर स्वतः नेपाली युनिकोडमा रूपान्तरण गर्न सकिन्छ।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('ARTICLES')}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ← सूचीमा फर्किनुहोस्
            </button>
          </div>

          <form onSubmit={handleSaveArticle} className="space-y-5 text-xs">
            {/* Title */}
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                समाचारको मुख्य शीर्षक (Headline Title) *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onKeyDown={(e) => handlePhoneticInputKeyDown(e, formTitle, setFormTitle)}
                placeholder="उदा: बडादशैँ २०८३ को घटस्थापना तथा विजयादशमीको शुभ साइत (dashain + space)"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/50 outline-none transition-colors"
              />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  समाचार वर्ग (Category) *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as SamacharCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 cursor-pointer"
                >
                  {(Object.keys(SAMACHAR_CATEGORY_NAMES) as SamacharCategory[]).map((cKey) => (
                    <option key={cKey} value={cKey}>
                      {SAMACHAR_CATEGORY_NAMES[cKey]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  लेखक / स्रोत (Author)
                </label>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formAuthor, setFormAuthor)}
                  placeholder="उदा: पण्डित हेमराज शास्त्री"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  लेखकको भूमिका (Author Role)
                </label>
                <input
                  type="text"
                  value={formAuthorRole}
                  onChange={(e) => setFormAuthorRole(e.target.value)}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formAuthorRole, setFormAuthorRole)}
                  placeholder="उदा: पञ्चाङ्गविद् / सम्पादक"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  प्रकाशन मिति (वि.सं.)
                </label>
                <input
                  type="text"
                  value={formDateBS}
                  onChange={(e) => setFormDateBS(e.target.value)}
                  placeholder="उदा: २०८३-०५-२५"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Cover Image Uploader with Instant Auto-Compression */}
            <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>समाचारको मुख्य तस्बिर (Featured Cover Photo)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  {showUrlInput ? 'तस्बिर अपलोड मोड' : 'तस्बिरको वेब लिङ्क (URL) हाल्ने'}
                </button>
              </div>

              {showUrlInput ? (
                <div>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview Box */}
                  <div className="w-full sm:w-48 h-32 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden flex items-center justify-center relative shrink-0 shadow-2xs">
                    {isCompressingImage ? (
                      <div className="flex flex-col items-center gap-1 text-amber-500 p-2 text-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[10px] font-bold">कम्प्रेस तथा लोड हुँदैछ...</span>
                      </div>
                    ) : formImageUrl ? (
                      <img src={formImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-stone-400 p-2 text-center">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-[10px]">तस्बिर छानिएको छैन</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      आफ्नो डिभाइस (मोबाइल/ल्यापटप) बाट तस्बिर छान्नुहोस् वा क्यामेरा खोल्नुहोस्। प्रणालीले स्वतः उच्च गुणस्तर कायम राखी कम्प्रेस गर्दछ।
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      <label className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-all active:scale-95">
                        <UploadCloud className="w-4 h-4" />
                        <span>तस्बिर अपलोड गर्नुहोस्</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isCompressingImage}
                        />
                      </label>

                      <label className="flex items-center gap-2 px-3.5 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-95">
                        <Camera className="w-4 h-4" />
                        <span>क्यामेरा</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isCompressingImage}
                        />
                      </label>

                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          हटाउनुहोस्
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                मुख्य समाचार सारांश (Lead Paragraph / Summary) *
              </label>
              <textarea
                rows={2}
                required
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                onKeyDown={(e) => handlePhoneticInputKeyDown(e, formSummary, setFormSummary)}
                placeholder="समाचारको १-२ वाक्यको आकर्षक निष्कर्ष (उदा: ghatasthapana ko shubha sait...)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Full Content */}
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                विस्तृत समाचार तथा शास्त्रीय विवरण (Full Article Content) *
              </label>
              <textarea
                rows={8}
                required
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                onKeyDown={(e) => handlePhoneticInputKeyDown(e, formContent, setFormContent)}
                placeholder="सम्पूर्ण समाचार, शास्त्रीय आधार, समय तालिका, पूजा विधि र विस्तृत जानकारी..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 leading-relaxed font-normal"
              />
            </div>

            {/* Tags & Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ट्यागहरू (Tags - अल्पविरामले छुट्याउनुहोस्)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formTags, setFormTags)}
                  placeholder="पञ्चाङ्ग, दशैँ, घटस्थापना, साइत"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-4 flex-wrap pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800 dark:text-stone-200">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>तुरुन्त सार्वजनिक गर्ने (Publish Now)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-700 dark:text-amber-400">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>मुख्य फिचर्ड लेख (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-600 dark:text-rose-400">
                  <input
                    type="checkbox"
                    checked={formIsBreaking}
                    onChange={(e) => setFormIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>⚡ ताजा ब्रेकिङ न्युज (Flash Ticker)</span>
                </label>
              </div>
            </div>

            {/* Form Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setActiveTab('ARTICLES')}
                className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {editingArticleId ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'समाचार सुरक्षित तथा प्रकाशित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BREAKING NEWS & LIVE TICKER MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'BREAKING_TICKER' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-stone-950 text-white p-5 rounded-3xl border border-rose-800 shadow-md">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-base font-bold font-serif text-rose-100">
                ताजा ब्रेकिङ न्युज तथा लाइभ टिकर व्यवस्थापन
              </h3>
            </div>
            <p className="text-xs text-rose-200 mt-1 max-w-2xl">
              यहाँबाट टिकरमा सक्रिय राखिएका समाचारहरू सार्वजनिक एपको माथिल्लो भागमा तत्काल स्क्रोलिङ ताजा खबरका रूपमा देखिन्छन्।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles
              .filter((a) => a.isBreaking)
              .map((art) => (
                <div
                  key={art.id}
                  className="bg-white dark:bg-stone-900 border-2 border-rose-500/40 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ⚡ सक्रिय ब्रेकिङ
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{art.title}</h4>
                    <p className="text-[11px] text-stone-500 line-clamp-2">{art.summary}</p>
                    <span className="text-[10px] text-stone-400 font-mono block pt-1">
                      {art.publishedAtBS} • {art.author}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBreaking(art)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    हटाउनुहोस्
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: READERSHIP ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>वर्ग अनुसार सामग्री वितरण (Categories Breakdown)</span>
              </h4>
              <div className="space-y-2 text-xs">
                {(Object.keys(SAMACHAR_CATEGORY_NAMES) as SamacharCategory[]).map((cKey) => {
                  const count = metrics.catCounts[cKey] || 0;
                  const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                  return (
                    <div key={cKey} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span>{SAMACHAR_CATEGORY_NAMES[cKey]}</span>
                        <span className="font-mono">{toDevanagariNumerals(count)} ({toDevanagariNumerals(pct)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span>सर्वाधिक पढिएका शीर्ष लेखहरू (Top Read Articles)</span>
              </h4>
              <div className="space-y-2">
                {[...articles]
                  .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
                  .slice(0, 5)
                  .map((art, idx) => (
                    <div
                      key={art.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {toDevanagariNumerals(idx + 1)}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{art.title}</p>
                          <p className="text-[10px] text-stone-500">{art.author} • {art.categoryNameNepali}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {toDevanagariNumerals(art.viewsCount || 0)} पाठक
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACTIVE PEER TOKENS / MAGIC LINKS */}
      {/* ========================================================================= */}
      {activeTab === 'MAGIC_LINKS' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <div>
              <h3 className="text-base font-bold font-serif text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>सक्रिय सम्पादक लगइन टोकन इतिहास</span>
              </h3>
              <p className="text-xs text-stone-500">जारी गरिएका सिधा पहुँच लिङ्कहरूको स्थिति तथा व्यवस्थापन।</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setLastGeneratedLink(null);
                setIsMagicLinkModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              + नयाँ लिङ्क जारी गर्नुहोस्
            </button>
          </div>

          <div className="space-y-2">
            {magicTokens.length === 0 ? (
              <p className="p-8 text-center text-stone-500 text-xs">कुनै टोकन जारी गरिएको छैन।</p>
            ) : (
              magicTokens.map((tok) => {
                const isExpired = new Date(tok.expiresAt).getTime() < Date.now();
                const baseUrl = getAppBaseUrl();
                const fullUrl = `${baseUrl}?admin_token=${tok.token}&section=samachar_editor`;

                return (
                  <div
                    key={tok.token}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900 dark:text-stone-100">{tok.recipientName}</strong>
                        {isExpired ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.2 rounded-full font-bold">
                            म्याद सकियो
                          </span>
                        ) : tok.isRevoked ? (
                          <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.2 rounded-full font-bold">
                            रद्द गरिएको
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 rounded-full font-bold">
                            सक्रिय
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {tok.recipientPhone || tok.recipientEmail || tok.note || 'सम्पादक पहुँच'} • म्याद: {new Date(tok.expiresAt).toLocaleDateString('ne-NP')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isExpired && !tok.isRevoked && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(fullUrl)}
                            className="p-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl cursor-pointer"
                            title="लिङ्क कपी"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevoke(tok.token)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl cursor-pointer"
                            title="लिङ्क रद्द गर्नुहोस्"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PREVIEW ARTICLE */}
      {/* ========================================================================= */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-stone-900 dark:text-stone-100 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                {previewArticle.categoryNameNepali}
              </span>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewArticle.coverImageUrl && (
              <img
                src={previewArticle.coverImageUrl}
                alt={previewArticle.title}
                className="w-full h-56 object-cover rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm"
              />
            )}

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 leading-snug">
              {previewArticle.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-stone-500 border-y border-stone-200 dark:border-stone-800 py-2">
              <span>लेखक: <strong>{previewArticle.author}</strong></span>
              <span>•</span>
              <span>मिति: {previewArticle.publishedAtBS}</span>
              <span>•</span>
              <span>{toDevanagariNumerals(previewArticle.viewsCount || 0)} पटक पढियो</span>
            </div>

            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 italic bg-amber-50/50 dark:bg-stone-950 p-3.5 rounded-xl border border-amber-200/50 dark:border-stone-800">
              "{previewArticle.summary}"
            </p>

            <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed space-y-3 whitespace-pre-wrap font-normal">
              {previewArticle.content}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  handleOpenComposeEdit(previewArticle);
                  setPreviewArticle(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold"
              >
                सम्पादन गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MAGIC LINK DISPATCHER */}
      {/* ========================================================================= */}
      {isMagicLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold font-serif text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>सम्पादक सक्रिय लगइन लिङ्क प्रेषक</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMagicLinkModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateMagicLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सम्पादक / लेखकको नाम *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, recipientName, setRecipientName)}
                  placeholder="उदा: लेखक वा सम्पादकको नाम"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    WhatsApp फोन नम्बर
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="उदा: 9841234567"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    इमेल ठेगाना
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="editor@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सक्रिय रहने समयावधि
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={24}>२४ घण्टा (१ दिन)</option>
                  <option value={72}>७२ घण्टा (३ दिन - सिफारिस)</option>
                  <option value={168}>१ हप्ता (७ दिन)</option>
                  <option value={720}>१ महिना (३० दिन)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  कैफियत / टिप्पणी
                </label>
                <input
                  type="text"
                  value={editorNote}
                  onChange={(e) => setEditorNote(e.target.value)}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, editorNote, setEditorNote)}
                  placeholder="उदा: बडादशैँ पर्व समाचार प्रकाशनको लागि"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  लिङ्क सिर्जना गर्नुहोस्
                </button>
              </div>
            </form>

            {lastGeneratedLink && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                  <span>सक्रिय लिङ्क तयार भयो!</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    म्याद: {new Date(lastGeneratedLink.tokenRecord.expiresAt).toLocaleDateString('ne-NP')}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200 dark:border-emerald-700 font-mono text-[11px] break-all select-all">
                  {lastGeneratedLink.activeLinkUrl}
                </div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg font-bold text-[11px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(lastGeneratedLink.activeLinkUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white rounded-lg font-bold text-[11px]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copyFeedback ? 'कपी भयो!' : 'लिङ्क कपी'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

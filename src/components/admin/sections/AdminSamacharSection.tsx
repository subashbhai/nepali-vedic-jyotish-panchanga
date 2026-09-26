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
  Link,
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
  FileText
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

export const AdminSamacharSection: React.FC<{
  orgName?: string;
}> = ({ orgName = 'बालानन्द ज्योतिष तथा पञ्चाङ्ग सेवा' }) => {
  const [articles, setArticles] = useState<SamacharArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<SamacharArticle | null>(null);

  // Active Magic Link Dispatcher Modal State
  const [isMagicLinkModalOpen, setIsMagicLinkModalOpen] = useState(false);
  const [magicTokens, setMagicTokens] = useState<NewsEditorMagicToken[]>([]);
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

  // Form State for Article
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

  const reloadData = () => {
    setArticles(getStoredArticles());
    setMagicTokens(getStoredActiveMagicTokens());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = filterCategory === 'all' || art.category === filterCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.author.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [articles, filterCategory, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = articles.length;
    const published = articles.filter(a => a.isPublished).length;
    const drafts = total - published;
    const totalViews = articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
    return { total, published, drafts, totalViews };
  }, [articles]);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    const today = new Date().toISOString().split('T')[0];
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormCategory('panchanga');
    setFormAuthor('ज्योतिषाचार्य पञ्चाङ्ग मण्डल');
    setFormAuthorRole('सम्पादक');
    setFormImageUrl('https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80');
    setFormDateBS('२०८३-०५-२५');
    setFormDateAD(today);
    setFormIsPublished(true);
    setFormIsFeatured(false);
    setFormIsBreaking(false);
    setFormTags('पञ्चाङ्ग, ज्योतिष, चाडपर्व');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (art: SamacharArticle) => {
    setEditingArticle(art);
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
    setIsEditModalOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('कृपया समाचारको शीर्षक प्रविष्ट गर्नुहोस्।');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const articleToSave: SamacharArticle = {
      id: editingArticle ? editingArticle.id : `samachar_${Date.now()}`,
      slug: (formTitle.trim().toLowerCase().replace(/\s+/g, '-').substring(0, 50)) || 'article',
      title: formTitle.trim(),
      summary: formSummary.trim(),
      content: formContent.trim(),
      category: formCategory,
      categoryNameNepali: SAMACHAR_CATEGORY_NAMES[formCategory],
      author: formAuthor.trim() || 'सम्पादक मण्डल',
      authorRole: formAuthorRole.trim() || 'सम्पादक',
      coverImageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
      publishedAtBS: formDateBS || '२०८३-०५-२५',
      publishedAtAD: formDateAD || new Date().toISOString().split('T')[0],
      isPublished: formIsPublished,
      isFeatured: formIsFeatured,
      isBreaking: formIsBreaking,
      tags: tagsArray,
      viewsCount: editingArticle ? editingArticle.viewsCount : 0,
      readTimeMinutes: Math.max(1, Math.round(formContent.length / 500))
    };

    saveSingleArticle(articleToSave);
    setIsEditModalOpen(false);
    reloadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('के तपाईं साँच्चै यो समाचार मेटाउन चाहनुहुन्छ?')) {
      deleteArticle(id);
      reloadData();
    }
  };

  // Toggle publish status
  const handleTogglePublish = (art: SamacharArticle) => {
    const updated = { ...art, isPublished: !art.isPublished };
    saveSingleArticle(updated);
    reloadData();
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
      createdBy: 'SuperAdmin'
    });

    setLastGeneratedLink(res);
    reloadData();
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl font-bold">
              <Newspaper className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
              समाचार तथा लेख व्यवस्थापन (News & Articles Editor)
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            पञ्चाङ्ग, धार्मिक चाडपर्व, ज्योतिष अनुसन्धान, लेख तथा आधिकारिक सूचनाहरू सम्पादन र प्रकाशन गर्नुहोस्
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Magic Link Button */}
          <button
            type="button"
            onClick={() => {
              setLastGeneratedLink(null);
              setIsMagicLinkModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="सुपरएडमिनले सम्पादकका लागि Email वा WhatsApp मा सिधै लगइन हुने सक्रिय लिङ्क पठाउने प्रणाली"
          >
            <Send className="w-4 h-4 text-amber-300" />
            <span>सम्पादक सक्रिय लिङ्क पठाउनुहोस्</span>
          </button>

          {/* Add Article Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#7A1C1C] hover:bg-[#9B2C2C] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नयाँ समाचार थप्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">कुल समाचार</span>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {toDevanagariNumerals(metrics.total)}
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">प्रकाशित सामग्री</span>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {toDevanagariNumerals(metrics.published)}
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">मस्यौदा (Drafts)</span>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            {toDevanagariNumerals(metrics.drafts)}
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">कुल पाठक संख्या</span>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {toDevanagariNumerals(metrics.totalViews)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="समाचार वा लेखक खोज्नुहोस्..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="all">सबै वर्ग (Categories)</option>
            {(Object.keys(SAMACHAR_CATEGORY_NAMES) as SamacharCategory[]).map((cKey) => (
              <option key={cKey} value={cKey}>
                {SAMACHAR_CATEGORY_NAMES[cKey]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">तस्बिर / शीर्षक</th>
                <th className="p-3.5">वर्ग</th>
                <th className="p-3.5">लेखक</th>
                <th className="p-3.5">मिति</th>
                <th className="p-3.5">पाठक</th>
                <th className="p-3.5">स्थिति</th>
                <th className="p-3.5 text-right">कार्यहरू</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200 font-normal">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    कुनै समाचार फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="p-3.5 max-w-xs">
                      <div className="flex items-center gap-3">
                        {art.coverImageUrl && (
                          <img
                            src={art.coverImageUrl}
                            alt={art.title}
                            className="w-12 h-10 object-cover rounded-lg shrink-0 border border-stone-200 dark:border-stone-700"
                          />
                        )}
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                            {art.title}
                          </div>
                          <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                            {art.summary}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {art.isBreaking && (
                              <span className="bg-red-500/15 text-red-700 dark:text-red-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                ताजा खबर
                              </span>
                            )}
                            {art.isFeatured && (
                              <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                मुख्य
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {art.categoryNameNepali}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium">
                      {art.author}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-stone-500">
                      {art.publishedAtBS}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-1 font-mono text-stone-600 dark:text-stone-400">
                        <Eye className="w-3.5 h-3.5" />
                        {toDevanagariNumerals(art.viewsCount || 0)}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(art)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition-colors ${
                          art.isPublished
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                        title="प्रकाशन स्थिति फेर्न क्लिक गर्नुहोस्"
                      >
                        {art.isPublished ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> प्रकाशित
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-stone-500" /> मस्यौदा
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(art)}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                          title="सम्पादन गर्नुहोस्"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="मेटाउनुहोस्"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* =================================================================== */}
      {/* SUPERADMIN ACTIVE MAGIC LINK DISPATCHER MODAL */}
      {/* =================================================================== */}
      {isMagicLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-bold font-serif">
                    सम्पादक सक्रिय लिङ्क प्रेषक (Magic Link Dispatcher)
                  </h3>
                  <p className="text-[11px] text-teal-200">
                    सुपरएडमिनले सम्पादकलाई सिधै समाचार ड्यासबोर्ड खोल्न सक्ने सुरक्षित सक्रिय लिङ्क पठाउने
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMagicLinkModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-800 dark:text-stone-200 text-xs sm:text-sm">
              <form onSubmit={handleGenerateMagicLink} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      सम्पादक / प्राप्तकर्ताको नाम *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="उदा: पण्डित राम शर्मा वा सम्पादक"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      WhatsApp मोबाइल नम्बर (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="उदा: 9851000000"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ईमेल ठेगाना (वैकल्पिक)
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="उदा: editor@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      सक्रिय रहने समयावधि (Validity)
                    </label>
                    <select
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none cursor-pointer"
                    >
                      <option value={24}>२४ घण्टा (१ दिन)</option>
                      <option value={72}>७२ घण्टा (३ दिन - सिफारिस)</option>
                      <option value={168}>१ हप्ता (७ दिन)</option>
                      <option value={720}>१ महिना (३० दिन)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    व्यक्तिगत टिप्पणी / नोट (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={editorNote}
                    onChange={(e) => setEditorNote(e.target.value)}
                    placeholder="उदा: बडादशैँ पर्व समाचार प्रकाशनको लागि विशेष पहुँच"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>सक्रिय लिङ्क सिर्जना गर्नुहोस्</span>
                  </button>
                </div>
              </form>

              {/* Generated Link Dispatch Section */}
              {lastGeneratedLink && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      सक्रिय लिङ्क तयार भयो!
                    </span>
                    <span className="text-[11px] text-stone-500">
                      म्याद: {new Date(lastGeneratedLink.tokenRecord.expiresAt).toLocaleDateString('ne-NP')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-emerald-200 dark:border-emerald-700 font-mono text-[11px] break-all select-all text-stone-700 dark:text-stone-300">
                    {lastGeneratedLink.activeLinkUrl}
                  </div>

                  {/* Dispatch Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp बाट पठाउनुहोस्</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendEmail}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email बाट पठाउनुहोस्</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(lastGeneratedLink.activeLinkUrl)}
                      className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      {copyFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copyFeedback ? 'लिङ्क कपी भयो!' : 'लिङ्क कपी'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Active Tokens History Table */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  हाल सक्रिय रहेका सम्पादक लिङ्कहरू ({toDevanagariNumerals(magicTokens.length)})
                </h4>

                {magicTokens.length === 0 ? (
                  <p className="text-xs text-stone-500">हाल कुनै सक्रिय टोकन जारी गरिएको छैन।</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {magicTokens.map((tok) => {
                      const isExpired = new Date(tok.expiresAt).getTime() < Date.now();
                      const origin = typeof window !== 'undefined' ? window.location.origin : '';
                      const fullUrl = `${origin}/?admin_token=${tok.token}&section=samachar_editor`;

                      return (
                        <div
                          key={tok.token}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 dark:text-stone-100 truncate">
                                {tok.recipientName}
                              </span>
                              {isExpired ? (
                                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 px-1.5 py-0.2 rounded font-semibold">
                                  म्याद सकियो
                                </span>
                              ) : tok.isRevoked ? (
                                <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded font-semibold">
                                  रद्द गरिएको
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                                  सक्रिय
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 truncate mt-0.5">
                              {tok.recipientPhone || tok.recipientEmail || tok.note || 'सम्पादक लिङ्क'} • म्याद: {new Date(tok.expiresAt).toLocaleDateString('ne-NP')}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isExpired && !tok.isRevoked && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(fullUrl)}
                                  className="p-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-lg text-stone-700 dark:text-stone-200 cursor-pointer"
                                  title="लिङ्क कपी"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(tok.token)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                  title="लिङ्क रद्द गर्नुहोस्"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMagicLinkModalOpen(false)}
                className="px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ARTICLE ADD / EDIT MODAL */}
      {/* =================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                {editingArticle ? 'समाचार सम्पादन गर्नुहोस्' : 'नयाँ समाचार / लेख थप्नुहोस्'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  समाचारको शीर्षक *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="उदा: बडादशैँ २०८३ को घटस्थापना तथा टीकाको शुभ साइत"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    समाचार वर्ग (Category) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SamacharCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none cursor-pointer"
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
                    लेखक / स्रोत
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="उदा: पण्डित हेमराज शास्त्री"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    लेखकको पद / भूमिका
                  </label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    placeholder="उदा: पञ्चाङ्गविद् / सम्पादक"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  मुख्य सारांश (Short Summary) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="समाचारको १-२ वाक्यको मुख्य निष्कर्ष वा सारांश..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  विस्तृत सामग्री / विवरण (Full Content) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="सम्पूर्ण समाचार, शास्त्रीय आधार, समय तालिका र विस्तृत विवरण..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none leading-relaxed font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    तस्बिर लिङ्क (Cover Image URL)
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
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
                    placeholder="२०८३-०५-२५"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ट्यागहरू (Tags - कमाले छुट्याउनुहोस्)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="उदा: पञ्चाङ्ग, दशैँ, साइत, राशिफल"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    तत्काल प्रकाशित गर्नुहोस् (Publish)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    मुख्य प्राथमिकतामा राख्नुहोस् (Featured)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBreaking}
                    onChange={(e) => setFormIsBreaking(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-red-700 dark:text-red-300">
                    ताजा खबर / ब्रेकिङ (Breaking Alert)
                  </span>
                </label>
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A1C1C] hover:bg-[#9B2C2C] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingArticle ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'समाचार सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Trash2,
  Share2,
  ExternalLink,
  Store,
  HeartHandshake,
  Newspaper,
  Shield,
  Globe,
  Crown,
  BookOpen,
  Film,
  Compass,
  Layers
} from 'lucide-react';
import {
  MagicLinkRole,
  RoleMagicTokenRecord,
  generateRoleMagicToken,
  getStoredRoleMagicTokens,
  revokeRoleMagicToken,
  getRoleNameNepaliFromMagicRole
} from '../../../db/roleMagicTokenStore';

export const AdminRoleMagicLinksSection: React.FC = () => {
  const [tokens, setTokens] = useState<RoleMagicTokenRecord[]>(getStoredRoleMagicTokens());
  const [selectedRole, setSelectedRole] = useState<MagicLinkRole>('POS_STAFF');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);

  const [generatedLink, setGeneratedLink] = useState<{
    tokenRecord: RoleMagicTokenRecord;
    activeLinkUrl: string;
  } | null>(null);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // GitHub & Direct Access Links states
  const [copiedDirectId, setCopiedDirectId] = useState<string | null>(null);
  const [customTarget, setCustomTarget] = useState<string>('admin_super');
  const [customParam, setCustomParam] = useState<string>('');

  const getBaseAppUrl = () => {
    if (typeof window === 'undefined') return 'https://subashbhai.github.io/nepali-vedic-jyotish-panchanga/';
    const path = window.location.origin + window.location.pathname;
    return path.endsWith('/') ? path : `${path}/`;
  };

  const baseAppUrl = getBaseAppUrl();

  const handleCopyDirectLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedDirectId(id);
    setStatusMsg(`लिङ्क कपी भयो: ${url}`);
    setTimeout(() => {
      setCopiedDirectId(null);
      setStatusMsg(null);
    }, 3000);
  };

  const getCustomGeneratedUrl = (): string => {
    switch (customTarget) {
      case 'admin_super':
        return `${baseAppUrl}?admin=super${customParam ? `&${customParam.replace(/^[?&]/, '')}` : ''}`;
      case 'store_admin':
        return `${baseAppUrl}?portal=store_admin${customParam ? `&${customParam.replace(/^[?&]/, '')}` : ''}`;
      case 'pos':
        return `${baseAppUrl}?portal=pos${customParam ? `&${customParam.replace(/^[?&]/, '')}` : ''}`;
      case 'vivah_admin':
        return `${baseAppUrl}?portal=vivah_admin${customParam ? `&${customParam.replace(/^[?&]/, '')}` : ''}`;
      case 'jyotishi':
        return `${baseAppUrl}#jyotishi${customParam ? `?${customParam.replace(/^[?&]/, '')}` : ''}`;
      case 'media_download':
        return `${baseAppUrl}#media_download${customParam ? `?${customParam.replace(/^[?&]/, '')}` : ''}`;
      case 'books_download':
        return `${baseAppUrl}#books_download${customParam ? `?${customParam.replace(/^[?&]/, '')}` : ''}`;
      case 'patrika':
        return `${baseAppUrl}#patrika${customParam ? `?${customParam.replace(/^[?&]/, '')}` : ''}`;
      default:
        return `${baseAppUrl}?portal=${customTarget}${customParam ? `&${customParam.replace(/^[?&]/, '')}` : ''}`;
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      alert('कृपया प्राप्तकर्ताको नाम भर्नुहोस्।');
      return;
    }

    const res = generateRoleMagicToken(
      selectedRole,
      recipientName,
      recipientContact,
      expiryDays
    );

    setGeneratedLink(res);
    setTokens(getStoredRoleMagicTokens());
    setStatusMsg(`सफलतापूर्वक सक्रिय म्याजिक लिङ्क सिर्जना भयो!`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRevoke = (token: string) => {
    if (window.confirm('के तपाईं यो सक्रिय लिङ्क रद्द गर्न चाहनुहुन्छ? त्यसपछि यो लिङ्कबाट लगइन हुन पाउने छैन।')) {
      revokeRoleMagicToken(token);
      setTokens(getStoredRoleMagicTokens());
      if (generatedLink?.tokenRecord.token === token) {
        setGeneratedLink(null);
      }
    }
  };

  const getWhatsAppShareUrl = (url: string, name: string, roleName: string) => {
    const text = `नमस्ते ${name} ज्यू,\nतपाईंलाई बालानन्द सफ्टवेयरको *${roleName}* को रूपमा काम गर्नका लागि प्रत्यक्ष सक्रिय लगइन लिङ्क पठाइएको छ:\n\n🔗 सिधै प्रवेश गर्नुहोस्:\n${url}\n\nयो लिङ्क सुरक्षित राख्नुहोला।`;
    const cleanPhone = recipientContact.replace(/[^0-9]/g, '');
    const phoneParam = cleanPhone.length >= 10 ? `phone=${cleanPhone}&` : '';
    return `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(text)}`;
  };

  const getEmailShareUrl = (url: string, name: string, roleName: string) => {
    const subject = `बालानन्द सफ्टवेयर - ${roleName} प्रत्यक्ष सक्रिय लगइन लिङ्क`;
    const body = `नमस्ते ${name} ज्यू,\n\nतपाईंलाई बालानन्द प्रणालीको ${roleName} को रूपमा काम गर्नका लागि प्रत्यक्ष सुरक्षित सक्रिय लिङ्क पठाइएको छ:\n\n${url}\n\nमाथिको लिङ्क क्लिक गरेर तपाईं पासवर्ड बिना नै सिधै आफ्नो कार्यक्षेत्रमा प्रवेश गरी काम सुरु गर्न सक्नुहुन्छ।\n\n- बालानन्द सुपरएडमिन`;
    return `mailto:${recipientContact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleQuickGenerate = (role: MagicLinkRole, title: string) => {
    const res = generateRoleMagicToken(
      role,
      title,
      undefined,
      expiryDays
    );
    setGeneratedLink(res);
    setTokens(getStoredRoleMagicTokens());
    setStatusMsg(`सफलतापूर्वक ${getRoleNameNepaliFromMagicRole(role)} को लागि १-क्लिक प्रत्यक्ष लिङ्क तयार भयो!`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-[#7A1C1C] text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight">
              प्रत्यक्ष भूमिका लिङ्क जेनेरेटर (Role-Based Direct Access Links)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-100 mt-1.5 max-w-3xl leading-relaxed">
            सुपरएडमिनले <strong>POS काउन्टर, स्टोर एडमिन, विवाह सुपरभाइजर, समाचार सम्पादक तथा सुपरएडमिन</strong> लाई कुनै पासवर्ड झन्झट बिना प्रत्यक्ष आफ्नै ड्यासबोर्डमा प्रवेश गर्न सक्ने सुरक्षित म्याजिक लिङ्क सिर्जना गर्ने केन्द्रीय प्रणाली।
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 🌟 1. DIRECT GITHUB PAGES SUPER ADMIN & ESSENTIAL WORKSTATIONS HUB */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-[#2A1810] text-white border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>GitHub Pages एवं प्रत्यक्ष पहुँच (Direct Live Links)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-100">
              सुपरएडमिन तथा मुख्य मोड्युलहरूको स्थायी प्रत्यक्ष लिङ्क
            </h3>
            <p className="text-xs text-stone-300">
              तलका लिङ्कहरू ब्राउजरमा खोल्नासाथ कुनै अवरोध वा लगइन फारम बिना सिधै सम्बन्धित ड्यासबोर्ड खुल्नेछ।
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 text-[11px] font-mono text-stone-300">
            Base: <span className="text-amber-400 font-bold">{baseAppUrl}</span>
          </div>
        </div>

        {/* 👑 VIP Highlight Card: GitHub Super Admin Direct URL */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-amber-950/40 to-stone-900 border-2 border-amber-400/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-amber-200 font-serif">
                  👑 सुपर एडमिन प्रत्यक्ष लिङ्क (Direct Super Admin Link)
                </h4>
                <p className="text-[11px] text-amber-100/80">
                  यो लिङ्कबाट सिधै सुपरएडमिन कमान्ड सेन्टर, सम्पूर्ण ब्लक र नियन्त्रण कक्ष खुल्छ।
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
              ✓ Active 24/7
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-amber-500/30">
            <input
              type="text"
              readOnly
              value={`${baseAppUrl}?admin=super`}
              className="flex-1 bg-transparent text-amber-300 font-mono text-xs px-2 py-1 outline-none select-all"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyDirectLink(`${baseAppUrl}?admin=super`, 'super_admin_direct')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                {copiedDirectId === 'super_admin_direct' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-stone-950" />
                    <span>कपी भयो!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>लिङ्क कपी</span>
                  </>
                )}
              </button>
              <a
                href={getWhatsAppShareUrl(`${baseAppUrl}?admin=super`, 'सुपरएडमिन', 'सुपरएडमिन कमान्ड सेन्टर')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                title="WhatsApp मा सेयर गर्नुहोस्"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href={`${baseAppUrl}?admin=super`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                title="नयाँ ट्याबमा परीक्षण गर्नुहोस्"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Grid of Permanent Workstation Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: 'store_admin_card',
              title: '🏬 स्टोर एडमिन (Store & Media)',
              url: `${baseAppUrl}?portal=store_admin`,
              desc: 'पसल सामान, अर्डर, फोटो अपलोड तथा भिडियो म्यानेजर',
              color: 'border-amber-500/40 bg-stone-900/80 hover:border-amber-400'
            },
            {
              id: 'pos_counter_card',
              title: '🛍️ काउन्टर POS टर्मिनल (POS Cashier)',
              url: `${baseAppUrl}?portal=pos`,
              desc: 'द्रुत काउन्टर बिलिङ, थर्मल रसिद र दैनिक बिक्री',
              color: 'border-emerald-500/40 bg-stone-900/80 hover:border-emerald-400'
            },
            {
              id: 'vivah_admin_card',
              title: '💍 विवाह एडमिन मञ्च (Matrimony Admin)',
              url: `${baseAppUrl}?portal=vivah_admin`,
              desc: 'विवाह बायोडाटा प्रमाणीकरण, सम्पर्क विवरण र साइत',
              color: 'border-rose-500/40 bg-stone-900/80 hover:border-rose-400'
            },
            {
              id: 'media_download_card',
              title: '🎬 मिडिया तथा भिडियो डाउनलोड',
              url: `${baseAppUrl}#media_download`,
              desc: 'वैदिक मन्त्र, स्तोत्र पाठ, 4K वालपेपर र भिडियो कथा',
              color: 'border-cyan-500/40 bg-stone-900/80 hover:border-cyan-400'
            },
            {
              id: 'books_download_card',
              title: '📚 डिजिटल पुस्तकालय (Vedic PDFs)',
              url: `${baseAppUrl}#books_download`,
              desc: '५०+ वैदिक ग्रन्थहरू, वेद, पुराण, कर्मकाण्ड पुस्तकहरू',
              color: 'border-indigo-500/40 bg-stone-900/80 hover:border-indigo-400'
            },
            {
              id: 'jyotishi_card',
              title: '🔮 ज्योतिषी कुण्डली पोर्टल',
              url: `${baseAppUrl}#jyotishi`,
              desc: 'विस्तृत कुण्डली विश्लेषण, दशाफल, अष्टकवर्ग र परामर्श',
              color: 'border-yellow-500/40 bg-stone-900/80 hover:border-yellow-400'
            },
          ].map(w => (
            <div
              key={w.id}
              className={`p-3.5 rounded-2xl border ${w.color} transition-all flex flex-col justify-between space-y-2.5`}
            >
              <div>
                <h5 className="font-bold text-xs text-white">{w.title}</h5>
                <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{w.desc}</p>
              </div>

              <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-stone-800">
                <input
                  type="text"
                  readOnly
                  value={w.url}
                  className="flex-1 bg-transparent text-[11px] font-mono text-stone-300 px-1 outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={() => handleCopyDirectLink(w.url, w.id)}
                  className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="लिङ्क कपी गर्नुहोस्"
                >
                  {copiedDirectId === w.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                  title="नयाँ ट्याबमा खोल्नुहोस्"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 🛠️ 2. CUSTOM DIRECT LINK GENERATOR */}
        <div className="bg-stone-900/90 border border-stone-800 p-4 sm:p-5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-amber-200 font-serif">
              कस्टम मोड्युल लिङ्क जेनेरेटर (Generate Custom Direct URL)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-stone-400 text-[11px] font-bold mb-1">
                प्रवेश गर्ने मोड्युल / पोर्टल छान्नुहोस्:
              </label>
              <select
                value={customTarget}
                onChange={e => setCustomTarget(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-200 text-xs font-sans outline-none focus:border-amber-500"
              >
                <option value="admin_super">👑 सुपरएडमिन (?admin=super)</option>
                <option value="store_admin">🏬 स्टोर एडमिन (?portal=store_admin)</option>
                <option value="pos">🛍️ POS काउन्टर (?portal=pos)</option>
                <option value="vivah_admin">💍 विवाह एडमिन (?portal=vivah_admin)</option>
                <option value="media_download">🎬 मिडिया डाउनलोड (#media_download)</option>
                <option value="books_download">📚 डिजिटल पुस्तकालय (#books_download)</option>
                <option value="jyotishi">🔮 ज्योतिषी पोर्टल (#jyotishi)</option>
                <option value="patrika">📜 कुण्डली पत्रिका (#patrika)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-400 text-[11px] font-bold mb-1">
                अतिरिक्त प्यारामिटर (Optional Extra Parameter, उदा: tab=products):
              </label>
              <input
                type="text"
                value={customParam}
                onChange={e => setCustomParam(e.target.value)}
                placeholder="tab=inventory वा subtab=orders"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-200 text-xs font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Generated Result */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-amber-500/30">
            <input
              type="text"
              readOnly
              value={getCustomGeneratedUrl()}
              className="flex-1 bg-transparent text-emerald-400 font-mono text-xs px-2 py-1 outline-none select-all"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyDirectLink(getCustomGeneratedUrl(), 'custom_gen_link')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                {copiedDirectId === 'custom_gen_link' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>कपी भयो!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>कपी गर्नुहोस्</span>
                  </>
                )}
              </button>
              <a
                href={getWhatsAppShareUrl(getCustomGeneratedUrl(), 'सहकर्मी', 'बालानन्द प्रत्यक्ष लिङ्क')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
                title="WhatsApp मा सेयर गर्नुहोस्"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href={getCustomGeneratedUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                title="नयाँ ट्याबमा खोल्नुहोस्"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Quick Generator Grid for All Management Workstations */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-2 border-amber-400/50 dark:border-amber-700/50 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D97706]" />
          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
            तत्काल १-क्लिक प्रत्यक्ष लिङ्क जेनेरेटर (Instant 1-Click Role Links)
          </h3>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          तलको कुनै पनि भूमिकामा क्लिक गर्नासाथ प्रत्यक्ष पासवर्डरहित लगइन लिङ्क तत्काल तयार हुनेछ:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {[
            {
              role: 'POS_STAFF' as MagicLinkRole,
              title: 'काउन्टर POS स्टाफ',
              desc: 'काउन्टर बिलिङ तथा थर्मल प्रिन्ट',
              icon: Store,
              badgeColor: 'bg-emerald-600 text-white',
              btnColor: 'bg-emerald-700 hover:bg-emerald-800'
            },
            {
              role: 'STORE_ADMIN' as MagicLinkRole,
              title: 'स्टोर एडमिन',
              desc: 'पसल सामग्री, अर्डर र स्टक व्यवस्थापन',
              icon: Store,
              badgeColor: 'bg-amber-600 text-white',
              btnColor: 'bg-amber-700 hover:bg-amber-800'
            },
            {
              role: 'MARRIAGE_MODERATOR' as MagicLinkRole,
              title: 'विवाह सुपरभाइजर',
              desc: 'विवाह बायोडाटा र साइत प्रमाणीकरण',
              icon: HeartHandshake,
              badgeColor: 'bg-rose-600 text-white',
              btnColor: 'bg-rose-700 hover:bg-rose-800'
            },
            {
              role: 'NEWS_EDITOR' as MagicLinkRole,
              title: 'समाचार सम्पादक',
              desc: 'दैनिक समाचार र सूचना सम्पादन',
              icon: Newspaper,
              badgeColor: 'bg-sky-600 text-white',
              btnColor: 'bg-sky-700 hover:bg-sky-800'
            },
            {
              role: 'SUPER_ADMIN' as MagicLinkRole,
              title: 'सुपरएडमिन मास्टर',
              desc: 'सम्पूर्ण प्रणालीको पूर्ण नियन्त्रण',
              icon: Shield,
              badgeColor: 'bg-purple-600 text-white',
              btnColor: 'bg-purple-700 hover:bg-purple-800'
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${item.badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">{item.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickGenerate(item.role, item.title)}
                  className={`w-full py-2 px-3 ${item.btnColor} text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>१-क्लिक लिङ्क बनाउनुहोस्</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generator Form Card */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
          <Link2 className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
            नाम र सम्पर्कसहित कस्टम म्याजिक लिङ्क सिर्जना गर्नुहोस्
          </h3>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Role Selection Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              प्रणाली भूमिका (Role) छनोट गर्नुहोस्:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  role: 'POS_STAFF' as MagicLinkRole,
                  title: 'POS स्टाफ (Counter)',
                  desc: 'पसल, काउन्टर तथा दैनिक बिलिङ',
                  icon: Store,
                },
                {
                  role: 'STORE_ADMIN' as MagicLinkRole,
                  title: 'स्टोर एडमिन',
                  desc: 'स्टोर स्टक, अर्डर तथा रिपोर्ट',
                  icon: Store,
                },
                {
                  role: 'MARRIAGE_MODERATOR' as MagicLinkRole,
                  title: 'विवाह सुपरभाइजर',
                  desc: 'विवाह बायोडाटा तथा साइत प्रमाणीकरण',
                  icon: HeartHandshake,
                },
                {
                  role: 'NEWS_EDITOR' as MagicLinkRole,
                  title: 'समाचार सम्पादक',
                  desc: 'दैनिक समाचार लेखन तथा सम्पादन',
                  icon: Newspaper,
                },
                {
                  role: 'SUPER_ADMIN' as MagicLinkRole,
                  title: 'सुपर प्रशासक',
                  desc: 'सम्पूर्ण मास्टर नियन्त्रण केन्द्र',
                  icon: Shield,
                },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;
                return (
                  <div
                    key={item.role}
                    onClick={() => setSelectedRole(item.role)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 shadow-sm ring-2 ring-amber-500/30'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/60 dark:bg-stone-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'}`} />
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                प्राप्तकर्ताको नाम *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="उदा. राम प्रसाद श्रेष्ठ"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                फोन नम्बर वा ईमेल (WhatsApp का लागि)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="उदा. 9851000000"
                  value={recipientContact}
                  onChange={e => setRecipientContact(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                सक्रिय अवधि (म्याद)
              </label>
              <select
                value={expiryDays}
                onChange={e => setExpiryDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value={7}>७ दिन (7 Days)</option>
                <option value={15}>१५ दिन (15 Days)</option>
                <option value={30}>३० दिन (1 Month)</option>
                <option value={90}>९० दिन (3 Months)</option>
                <option value={365}>१ वर्ष (1 Year)</option>
              </select>
            </div>
          </div>

          <div className="text-right pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#7A1C1C] hover:from-amber-700 hover:to-red-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 ml-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>कस्टम म्याजिक लिङ्क सिर्जना गर्नुहोस्</span>
            </button>
          </div>
        </form>

        {/* Newly Generated Link Display Card */}
        {generatedLink && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                सक्रिय लिङ्क तयार भयो ({generatedLink.tokenRecord.roleNameNepali} - {generatedLink.tokenRecord.recipientName})
              </span>
              <span className="text-[10px] text-stone-500">
                म्याद: {new Date(generatedLink.tokenRecord.expiresAt).toLocaleDateString()} सम्म
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-300 dark:border-stone-700">
              <input
                type="text"
                readOnly
                value={generatedLink.activeLinkUrl}
                className="w-full text-xs font-mono bg-transparent border-none focus:outline-hidden text-stone-800 dark:text-stone-200 truncate"
              />
              <button
                type="button"
                onClick={() => handleCopy(generatedLink.activeLinkUrl, generatedLink.tokenRecord.token)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
              >
                {copiedToken === generatedLink.tokenRecord.token ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>कपी भयो!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>कपी लिङ्क</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={getWhatsAppShareUrl(
                  generatedLink.activeLinkUrl,
                  generatedLink.tokenRecord.recipientName,
                  generatedLink.tokenRecord.roleNameNepali
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp मा पठाउनुहोस्</span>
              </a>

              {generatedLink.tokenRecord.recipientContact?.includes('@') && (
                <a
                  href={getEmailShareUrl(
                    generatedLink.activeLinkUrl,
                    generatedLink.tokenRecord.recipientName,
                    generatedLink.tokenRecord.roleNameNepali
                  )}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email मा पठाउनुहोस्</span>
                </a>
              )}

              <a
                href={generatedLink.activeLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ml-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>नयाँ ट्याबमा परीक्षण गर्नुहोस्</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Issued Tokens Table Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            जारी गरिएका सक्रिय म्याजिक लिङ्कहरूको सूची ({tokens.length})
          </h3>
        </div>

        {tokens.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            हालसम्म कुनै पनि म्याजिक लिङ्क जारी गरिएको छैन। माथिको फारमबाट नयाँ लिङ्क बनाउनुहोस्।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 text-[11px]">
                  <th className="pb-2.5 font-bold">प्राप्तकर्ता</th>
                  <th className="pb-2.5 font-bold">भूमिका (Role)</th>
                  <th className="pb-2.5 font-bold">सम्पर्क</th>
                  <th className="pb-2.5 font-bold">म्याद (Expiry)</th>
                  <th className="pb-2.5 font-bold">स्थिति</th>
                  <th className="pb-2.5 font-bold text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {tokens.map(t => {
                  const isExpired = new Date(t.expiresAt).getTime() < Date.now();
                  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                  const linkUrl = `${origin}/?magic_role=${t.role}&magic_token=${t.token}`;

                  return (
                    <tr key={t.token} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 font-bold text-stone-900 dark:text-stone-100">
                        {t.recipientName}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                          {t.roleNameNepali}
                        </span>
                      </td>
                      <td className="py-3 text-stone-600 dark:text-stone-400 font-mono">
                        {t.recipientContact || '-'}
                      </td>
                      <td className="py-3 text-stone-500 font-mono text-[11px]">
                        {new Date(t.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {t.isRevoked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            रद्द (Revoked)
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                            म्याद सकियो
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            सक्रिय (Active)
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!t.isRevoked && !isExpired && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopy(linkUrl, t.token)}
                                className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                                title="लिङ्क कपी गर्नुहोस्"
                              >
                                {copiedToken === t.token ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <a
                                href={getWhatsAppShareUrl(linkUrl, t.recipientName, t.roleNameNepali)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700"
                                title="WhatsApp मा पठाउनुहोस्"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          {!t.isRevoked && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(t.token)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600"
                              title="सक्रिय लिङ्क रद्द गर्नुहोस्"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

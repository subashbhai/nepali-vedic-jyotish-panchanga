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
  Shield
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-[#7A1C1C] text-white p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-black font-serif tracking-tight">
              भूमिका प्रत्यक्ष सक्रिय लिङ्क व्यवस्थापन (Role Magic Links)
            </h2>
          </div>
          <p className="text-xs text-amber-100 mt-1 max-w-2xl leading-relaxed">
            सुपरएडमिनले <strong>Admin, POS, विवाह सुपरभाइजर, र समाचार सम्पादक</strong> लाई कुनै झन्झट बिना सिधै काम गर्न सक्ने सक्रिय म्याजिक लिङ्क WhatsApp वा Email बाट पठाउने केन्द्रीय प्रणाली।
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Generator Form Card */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
            नयाँ सक्रिय म्याजिक लिङ्क सिर्जना गर्नुहोस्
          </h3>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Role Selection Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              प्रणाली भूमिका (Role) छनोट गर्नुहोस्:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  role: 'POS_STAFF' as MagicLinkRole,
                  title: 'POS स्टाफ (Store)',
                  desc: 'पसल, काउन्टर तथा दैनिक बिलिङ',
                  icon: Store,
                  color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                },
                {
                  role: 'MARRIAGE_MODERATOR' as MagicLinkRole,
                  title: 'विवाह सुपरभाइजर',
                  desc: 'विवाह बायोडाटा तथा साइत प्रमाणीकरण',
                  icon: HeartHandshake,
                  color: 'border-rose-300 bg-rose-50/50 text-rose-900'
                },
                {
                  role: 'NEWS_EDITOR' as MagicLinkRole,
                  title: 'समाचार सम्पादक',
                  desc: 'दैनिक समाचार लेखन तथा सम्पादन',
                  icon: Newspaper,
                  color: 'border-sky-300 bg-sky-50/50 text-sky-900'
                },
                {
                  role: 'ADMIN' as MagicLinkRole,
                  title: 'सहायक एडमिन (Admin)',
                  desc: 'सामान्य प्रशासनिक नियन्त्रण',
                  icon: Shield,
                  color: 'border-purple-300 bg-purple-50/50 text-purple-900'
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
              <span>सक्रिय म्याजिक लिङ्क सिर्जना गर्नुहोस्</span>
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

import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Bell,
  Check,
  Send,
  Sparkles,
  Layers,
  Crown,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  CLIENT_THEMES,
  getClientTheme,
  setClientTheme,
  applyClientThemeToDOM,
  ClientThemeId
} from '../../utils/themeStore';
import {
  sendClientToYajamanNotification,
  getStoredBroadcastNotifications,
  deleteBroadcastNotification,
  BroadcastNotification
} from '../../db/broadcastNotificationStore';
import { getActiveRBACSession } from '../../db/rbacStore';
import { isClientPurchaseApproved, is24HourTrialActive } from '../../db/clientLeadStore';

interface ClientThemeNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'theme' | 'notification';
  astrologerName?: string;
}

export const ClientThemeNotificationModal: React.FC<ClientThemeNotificationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'theme',
  astrologerName
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'notification'>(initialTab);
  const [selectedTheme, setSelectedTheme] = useState<ClientThemeId>(getClientTheme());
  const [themeSuccessMsg, setThemeSuccessMsg] = useState<string | null>(null);

  // Notification form state
  const session = getActiveRBACSession();
  const effectiveSenderName = astrologerName || session?.fullName || 'आधिकारिक ज्योतिषी';
  const effectiveClientId = session?.userId || 'client-self';

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCategory, setNotifCategory] = useState<'ANNOUNCEMENT' | 'OFFER' | 'VEDIC_FESTIVAL' | 'CLIENT_REMINDER'>('CLIENT_REMINDER');
  const [notifUrl, setNotifUrl] = useState('');
  const [notifSuccessMsg, setNotifSuccessMsg] = useState<string | null>(null);
  const [clientNotifications, setClientNotifications] = useState<BroadcastNotification[]>([]);

  const isEligible = isClientPurchaseApproved() || is24HourTrialActive() || session?.role === 'SUPER_ADMIN';

  const loadNotifications = () => {
    const all = getStoredBroadcastNotifications();
    const myNotifs = all.filter(n => n.senderClientId === effectiveClientId || n.senderName === effectiveSenderName);
    setClientNotifications(myNotifs);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedTheme(getClientTheme());
      loadNotifications();
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSelectTheme = (themeId: ClientThemeId) => {
    setSelectedTheme(themeId);
    setClientTheme(themeId);
    applyClientThemeToDOM(themeId);
    setThemeSuccessMsg('थिम सफलतापूर्व परिवर्तन भयो!');
    setTimeout(() => setThemeSuccessMsg(null), 2500);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    sendClientToYajamanNotification({
      senderName: effectiveSenderName,
      senderClientId: effectiveClientId,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      category: notifCategory,
      targetUrl: notifUrl.trim() || undefined
    });

    setNotifSuccessMsg('यजमानहरूलाई सूचना सफलतापूर्वक पठाइयो!');
    setNotifTitle('');
    setNotifMessage('');
    setNotifUrl('');
    loadNotifications();
    setTimeout(() => setNotifSuccessMsg(null), 3000);
  };

  const handleDeleteNotification = (id: string) => {
    deleteBroadcastNotification(id);
    loadNotifications();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans text-stone-100">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {activeTab === 'theme' ? <Palette className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 font-serif">
                {activeTab === 'theme' ? 'सफ्टवेयर थिम कस्टमाइजेसन' : 'यजमान सूचना ब्रोडकास्ट'}
              </h2>
              <p className="text-[11px] text-amber-400 font-mono">
                क्लाइन्ट अनुकूलन केन्द्र • बालानन्द वैदिक सेवा
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-stone-900 text-amber-400 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>🎨 थिम छनोट ({CLIENT_THEMES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notification')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notification'
                ? 'bg-stone-900 text-amber-400 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>📢 यजमानलाई सूचना पठाउनुहोस्</span>
            {clientNotifications.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {clientNotifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ================= TAB 1: THEME SELECTION ================= */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-200">सफ्टवेयरको रङ्ग र शैली परिवर्तन गर्नुहोस्</h3>
                  <p className="text-xs text-stone-400">
                    आफ्नो कार्यालय, क्लिनिक वा व्यक्तिगत रुचि अनुसार ५ वटा वैदिक थिमहरू मध्ये कुनै एक चयन गर्नुहोस्।
                  </p>
                </div>
                {themeSuccessMsg && (
                  <span className="text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {themeSuccessMsg}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CLIENT_THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg ring-2 ring-amber-500/30'
                          : 'border-stone-800 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-800/40'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm -ml-2"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span className="text-xs font-bold text-stone-100">{theme.nameNepali}</span>
                        </div>

                        {isSelected && (
                          <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> सक्रिय
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {theme.descriptionNepali}
                      </p>

                      {/* Visual Swatch Preview Bar */}
                      <div className="h-6 rounded-lg overflow-hidden flex items-center px-3 text-[10px] font-bold shadow-inner"
                        style={{
                          background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`
                        }}
                      >
                        <span className="text-white drop-shadow-sm font-serif">
                          {theme.nameEnglish} Preview
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs text-stone-400 space-y-1">
                <p className="font-bold text-amber-400">💡 थिम कस्टमाइजेसन सुझाव:</p>
                <p>
                  तपाईंले चयन गर्नुभएको थिम यो ब्राउजर तथा डिभाइसमा सुरक्षित रहन्छ र कुण्डली, पञ्चाङ्ग, चार्ट तथा सम्पूर्ण इन्टरफेसमा स्वतः लागू हुन्छ।
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 2: YAJAMAN NOTIFICATION ================= */}
          {activeTab === 'notification' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-200">आफ्ना यजमान तथा ग्राहकहरूलाई सूचना पठाउनुहोस्</h3>
                <p className="text-xs text-stone-400">
                  तपाईंको ज्योतिषी प्रोफाइल अन्तर्गत दर्ता भएका वा जोडिएका यजमानहरूलाई महत्त्वपूर्ण चाडपर्व, पूजा तिथि वा परामर्श सम्बन्धी सूचना पठाउनुहोस्।
                </p>
              </div>

              {notifSuccessMsg && (
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-2xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{notifSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendNotification} className="space-y-4 bg-stone-950/80 border border-stone-800 p-5 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    प्रेषकको नाम (Sender Astrologer Name)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={effectiveSenderName}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-amber-300 font-bold outline-none cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      सूचना वर्ग (Category) *
                    </label>
                    <select
                      value={notifCategory}
                      onChange={(e) => setNotifCategory(e.target.value as any)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-amber-500"
                    >
                      <option value="CLIENT_REMINDER">⏰ यजमान पूजा / परामर्श स्मरण (Reminder)</option>
                      <option value="VEDIC_FESTIVAL">🚩 वैदिक चाडपर्व तथा तिथि जानकारी (Festival)</option>
                      <option value="ANNOUNCEMENT">📢 सामान्य सूचना (Announcement)</option>
                      <option value="OFFER">🎁 विशेष छुट वा सेवा अफर (Special Offer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      सूचनाको शीर्षक (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: आगामी सोमबार एकादशी व्रत तथा रुद्राभिषेक सम्बन्धी"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    विस्तृत सूचना सन्देश (Message Body) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="सम्पूर्ण आदरणीय यजमान महानुभावहरूमा... यहाँ पूजा संकल्प, समय तथा विधि सम्बन्धी विवरण लेख्नुहोस्।"
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    ऐच्छिक लिङ्क / भिडियो वा कागजात URL (Optional Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={notifUrl}
                    onChange={(e) => setNotifUrl(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>सूचना प्रसारण गर्नुहोस्</span>
                  </button>
                </div>
              </form>

              {/* Previously Sent Notifications by This Astrologer */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  तपाईंले प्रसारण गर्नुभएका पछिल्ला सूचनाहरू ({clientNotifications.length})
                </h4>

                {clientNotifications.length === 0 ? (
                  <p className="text-xs text-stone-500 italic bg-stone-950/40 p-4 rounded-xl text-center border border-stone-800/60">
                    हालसम्म कुनै व्यक्तिगत सूचना प्रसारण गरिएको छैन।
                  </p>
                ) : (
                  <div className="space-y-2">
                    {clientNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="bg-stone-950 border border-stone-800 p-3.5 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300">{n.title}</span>
                            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-400 font-mono">
                              {n.category}
                            </span>
                          </div>
                          <p className="text-stone-300 text-[11px] leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-stone-500 block font-mono">
                            {n.createdAtBS} ({new Date(n.createdAtISO).toLocaleDateString('ne-NP')})
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="हटाउनुहोस्"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <p className="text-[10px] text-stone-500">
            सफ्टवेयर विकास: सुकदेव शरण • बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            बन्द गर्नुहोस्
          </button>
        </div>

      </div>
    </div>
  );
};

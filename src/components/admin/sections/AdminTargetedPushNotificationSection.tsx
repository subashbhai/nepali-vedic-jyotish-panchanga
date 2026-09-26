import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  Radio,
  CheckCircle2,
  Trash2,
  Calendar,
  Sparkles,
  Crown,
  AlertCircle
} from 'lucide-react';
import {
  BroadcastNotification,
  NotificationAudience,
  getStoredBroadcastNotifications,
  sendSuperAdminBroadcast,
  saveBroadcastNotifications
} from '../../../db/broadcastNotificationStore';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

export const AdminTargetedPushNotificationSection: React.FC = () => {
  const [notifications, setNotifications] = useState<BroadcastNotification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<NotificationAudience>('ALL');
  const [category, setCategory] = useState<'ANNOUNCEMENT' | 'OFFER' | 'VEDIC_FESTIVAL' | 'SYSTEM_UPDATE'>('ANNOUNCEMENT');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadNotifications = () => {
    setNotifications(getStoredBroadcastNotifications());
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdated = () => loadNotifications();
    window.addEventListener('broadcast-notifications-updated', handleUpdated);
    return () => window.removeEventListener('broadcast-notifications-updated', handleUpdated);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('कृपया सूचनाको शीर्षक र सन्देश दुवै लेख्नुहोस्।');
      return;
    }

    const res = sendSuperAdminBroadcast({
      title: title.trim(),
      message: message.trim(),
      audience,
      category,
    });

    if (res.success) {
      setSuccessMsg(res.messageNepali);
      setTitle('');
      setMessage('');
      loadNotifications();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो सूचना हटाउन निश्चित हुनुहुन्छ?')) return;
    const remaining = notifications.filter((n) => n.id !== id);
    saveBroadcastNotifications(remaining);
    loadNotifications();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>लक्षित पुश नोटिफिकेसन प्रसारण केन्द्र (Targeted Push Broadcaster)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            सामान्य आगन्तुक (Visitors), सदस्य (Members) वा अधिकृत क्लाइन्ट (Clients) लाई लक्षित गरी तत्काल सन्देश पठाउनुहोस्।
          </p>
        </div>

        {successMsg && (
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
            ✓ {successMsg}
          </div>
        )}
      </div>

      {/* Broadcast Composer Form */}
      <form onSubmit={handleSend} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
          <Send className="w-4 h-4 text-amber-400" />
          <span>नयाँ पुश नोटिफिकेसन सिर्जना गर्नुहोस्</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-stone-400 mb-1">
              लक्षित समूह (Target Audience) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ALL', label: 'सबैलाई (All)' },
                { id: 'VISITORS', label: 'आगन्तुक (Visitors)' },
                { id: 'MEMBERS', label: 'सदस्य (Members)' },
                { id: 'CLIENTS', label: 'क्लाइन्ट (Clients)' },
              ].map((aud) => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setAudience(aud.id as NotificationAudience)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    audience === aud.id
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-2xs'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-stone-400 mb-1">
              सूचनाको श्रेणी (Category)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ANNOUNCEMENT">📢 साधारण घोषणा (Announcement)</option>
              <option value="OFFER">🎁 विशेष अफर तथा छुट (Offer)</option>
              <option value="VEDIC_FESTIVAL">🚩 चाडपर्व तथा मुहूर्त सन्देश (Festival Alert)</option>
              <option value="SYSTEM_UPDATE">⚙️ सफ्टवेयर अद्यावधिक सूचना (System Update)</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-stone-400 mb-1">
            सूचनाको शीर्षक (Title) *
          </label>
          <input
            type="text"
            placeholder="उदा: आज राति ९ बजे सूर्य गोचर विशेष फलादेश प्रत्यक्ष अपडेट..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-stone-400 mb-1">
            विस्तृत सन्देश (Message Body) *
          </label>
          <textarea
            rows={3}
            placeholder="सूचनाको सम्पूर्ण विवरण यहाँ लेख्नुहोस्..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>पुश नोटिफिकेसन प्रसारण गर्नुहोस्</span>
          </button>
        </div>
      </form>

      {/* Broadcast History */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-stone-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>पठाइएका सूचनाहरूको इतिहास ({toDevanagariNumerals(notifications.length)})</span>
          </span>
        </h3>

        <div className="space-y-2.5">
          {notifications.length === 0 ? (
            <p className="text-xs text-stone-500 text-center py-4">कुनै सूचना छैन।</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-stone-800/60 border border-stone-700/60 p-3.5 rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-100">{notif.title}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-md font-mono">
                      लक्षित: {notif.audience}
                    </span>
                    <span className="text-[10px] bg-stone-700 text-stone-300 px-1.5 py-0.2 rounded">
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-stone-300 leading-relaxed">{notif.message}</p>
                  <div className="text-[11px] text-stone-500">
                    पठाएको मिति: {notif.createdAtBS} • प्रेषक: {notif.senderName}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                  title="हटाउनुहोस्"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

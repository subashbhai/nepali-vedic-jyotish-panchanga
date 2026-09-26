import React, { useState } from 'react';
import { Bell, Send, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { SystemNotificationMessage, sendAdminNotification } from '../../../db/adminStore';

interface AdminNotificationSectionProps {
  notifications: SystemNotificationMessage[];
  onRefresh: () => void;
}

export const AdminNotificationSection: React.FC<AdminNotificationSectionProps> = ({ notifications, onRefresh }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all_users' | 'all_experts' | 'pending_payments'>('all_users');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    sendAdminNotification(
      target === 'all_users' ? 'all_users' : 'all_members',
      target === 'all_users' ? 'सबै प्रयोगकर्ता' : target === 'all_experts' ? 'सबै विशेषज्ञ' : 'पेन्डिङ भुक्तानी',
      title,
      message,
      'admin'
    );

    setTitle('');
    setMessage('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>केन्द्रीय सूचना तथा ब्रोडकास्ट केन्द्र (Notification Center)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">सबै प्रयोगकर्ता वा विशेषज्ञहरूलाई सामूहिक सूचना तथा एसएमएस पठाउनुहोस्।</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4 shadow-md">
        <h3 className="font-bold text-stone-100 text-sm">नयाँ सामूहिक सूचना पठाउनुहोस्</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-stone-400 font-bold mb-1">सूचनाको शीर्षक *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा: विशेष पूजा छुट अफर"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-bold mb-1">प्राप्तकर्ता समूह (Target Group)</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as any)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
            >
              <option value="all_users">सबै यजमान/प्रयोगकर्ताहरू</option>
              <option value="all_experts">सबै आधिकारिक विशेषज्ञहरू</option>
              <option value="pending_payments">पेन्डिङ भुक्तानी भएका प्रयोगकर्ताहरू</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-stone-400 font-bold mb-1 text-xs">सूचना सन्देश (Message) *</label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="विस्तृत सूचना यहाँ लेख्नुहोस्..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center justify-between">
          {sentSuccess && <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> सूचना सफलतापूर्वक पठाइयो!</span>}
          <button type="submit" className="ml-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer">
            <Send className="w-4 h-4" />
            <span>सूचना प्रसारण (Broadcast)</span>
          </button>
        </div>
      </form>
    </div>
  );
};

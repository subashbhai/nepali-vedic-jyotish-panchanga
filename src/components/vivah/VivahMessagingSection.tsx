import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  User, 
  AlertTriangle, 
  Ban, 
  Phone, 
  CheckCheck
} from 'lucide-react';
import { VivahProfile } from '../../types/vivahTypes';

interface ChatMessage {
  id: string;
  senderUserId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface VivahMessagingSectionProps {
  currentProfile: VivahProfile | null;
  targetUserId?: string;
  targetName?: string;
}

export const VivahMessagingSection: React.FC<VivahMessagingSectionProps> = ({
  currentProfile,
  targetUserId,
  targetName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderUserId: targetUserId || 'user_bride_01',
      senderName: targetName || 'डा. प्रनिशा श्रेष्ठ',
      text: 'नमस्ते! बालानन्द विवाह मञ्चमा सम्पर्क स्वीकृत हुनुभएकोमा खुसी लाग्यो।',
      timestamp: '10:15 AM'
    },
    {
      id: 'm2',
      senderUserId: currentProfile?.userId || 'user_groom_01',
      senderName: currentProfile?.userFullName || 'रुपेश के.सी.',
      text: 'नमस्ते डा. प्रनिशा ज्यू! हजुरको र मेरो परिवारको विचार मिल्ने देखिन्छ।',
      timestamp: '10:18 AM'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderUserId: currentProfile?.userId || 'my_user_id',
      senderName: currentProfile?.displayFirstName || 'म (Me)',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
  };

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-xl overflow-hidden flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="p-4 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D97706]/10 text-[#D97706] rounded-xl flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 font-serif">
              {targetName || 'सुरक्षित विवाह च्याट (Secure Messaging)'}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> एडमिन स्वीकृत सुरक्षित सम्पर्क (End-to-End Privacy)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold px-2.5 py-1 rounded-lg">
            प्रमाणित कनेक्शन
          </span>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 dark:bg-stone-950/40">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-center text-xs text-amber-900 dark:text-amber-200">
          सुरक्षा सन्देश: बालानन्द विवाह मञ्चभित्र मर्यादित संवाद गर्नुहोस्। शङ्कास्पद वा अभद्र सन्देश पठाएमा प्रोफाइल निलम्बन हुन सक्छ।
        </div>

        {messages.map((m) => {
          const isMe = m.senderUserId === currentProfile?.userId;
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm space-y-1 shadow-sm ${
                  isMe
                    ? 'bg-[#D97706] text-white rounded-br-none'
                    : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-bl-none'
                }`}
              >
                <span className="block font-bold text-[10px] opacity-80">{m.senderName}</span>
                <p>{m.text}</p>
              </div>
              <span className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                {m.timestamp} {isMe && <CheckCheck className="w-3 h-3 text-amber-500" />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="मर्यादित विवाह संवाद सन्देश लेख्नुहोस्..."
          className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm"
        />
        <button
          type="submit"
          className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold p-2.5 rounded-xl shadow transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

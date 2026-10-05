import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { BirthDetails, LagnaInfo, PlanetPosition, VimshottariDashaResult } from '../types/astrology';
import { handlePhoneticInputKeyDown } from '../utils/nepaliTransliteration';

interface AIAssistantViewProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha: VimshottariDashaResult;
  sadeSatiStatus: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  profile,
  lagna,
  planets,
  dasha,
  sadeSatiStatus,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `नमस्कार! म ज्योतिषीय परामर्श सहायक AI हुँ। जातक ${profile.name} को ${lagna.rashiName} लग्न र हाल चलिरहेको ${dasha.currentMahadasha?.planet || 'गुरु'} महादशाका आधारमा हजुरका प्रश्नहरूको शास्त्रीय विश्लेषण प्रस्तुत गर्न तयार छु। के सोध्न चाहनुहुन्छ?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Call backend AI endpoint
      const response = await fetch('/api/ai/astrology-interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: userText,
          structuredData: {
            profile,
            lagna,
            planets,
            currentMahadasha: dasha.currentMahadasha?.planet,
            currentAntardasha: dasha.currentAntardasha?.planet,
            sadeSatiStatus,
          },
        }),
      });

      const data = await response.json();
      const aiReplyText = data.interpretation || 'क्षमा गर्नुहोस्, प्रतिक्रिया प्राप्त गर्न सकिएन। पुनः प्रयास गर्नुहोला।';

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Consultation Error:', error);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'सर्भरसँग सम्पर्क हुन सकेन। कृपया इन्टरनेट वा सेवा जाँच गर्नुहोस्।',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
              <span>नेपाली AI ज्योतिष परामर्शदाता</span>
              <span className="text-[10px] bg-purple-50 dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700 px-2 py-0.5 rounded-full font-sans">
                Gemini AI Engine
              </span>
            </h2>
            <p className="text-xs text-[#78716C] dark:text-stone-400">सटीक गणितीय गणनालाई आधार मानी वैदिक व्याख्या</p>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm min-h-[380px] max-h-[500px] overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 rounded-lg shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#D97706] text-white font-medium rounded-tr-none'
                  : 'bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700/80 text-[#2D241E] dark:text-stone-100 rounded-tl-none space-y-1'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className="text-[9px] opacity-70 block text-right">{m.time}</span>
            </div>

            {m.sender === 'user' && (
              <div className="p-1.5 bg-[#D97706] text-white rounded-lg shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#D97706] bg-[#FDFCF8] dark:bg-stone-800 p-3 rounded-xl border border-[#E6E0D5] dark:border-stone-700 w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>शास्त्रीय गणना र गोचर विश्लेषण हुँदैछ...</span>
          </div>
        )}
      </div>

      {/* Input Query Bar */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => handlePhoneticInputKeyDown(e, inputQuery, setInputQuery)}
          placeholder="उदा. मेरो करियर र आर्थिक स्थिति आगामी वर्ष कस्तो रहला? (mero career...)"
          className="flex-1 bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#2D241E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706] shadow-xs"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="bg-[#D97706] hover:bg-[#b45309] text-white font-bold px-5 py-3 rounded-xl shadow-xs disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

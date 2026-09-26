import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, CheckCircle2, ChevronRight, X, Clock } from 'lucide-react';
import {
  getStoredScheduleConfig,
  isDispatchDueToday,
  getSubscribersFromProfiles,
  DailyWhatsAppScheduleConfig
} from '../../utils/dailyWhatsAppScheduler';
import { BirthDetails, PanchangaData, OrganizationProfile, PlanetPosition } from '../../types/astrology';

interface DailyWhatsAppReminderBannerProps {
  profiles: BirthDetails[];
  todayPanchanga: PanchangaData;
  todayBS: string;
  orgProfile: OrganizationProfile;
  transitPlanets?: PlanetPosition[];
  onOpenManager: () => void;
}

export const DailyWhatsAppReminderBanner: React.FC<DailyWhatsAppReminderBannerProps> = ({
  profiles,
  todayPanchanga,
  todayBS,
  orgProfile,
  transitPlanets,
  onOpenManager
}) => {
  const [config, setConfig] = useState<DailyWhatsAppScheduleConfig>(getStoredScheduleConfig());
  const [isDismissed, setIsDismissed] = useState(false);
  const [due, setDue] = useState(false);

  useEffect(() => {
    const currentConfig = getStoredScheduleConfig();
    setConfig(currentConfig);
    const isDue = isDispatchDueToday(currentConfig, todayBS);
    setDue(isDue);
  }, [todayBS]);

  if (isDismissed || !config.autoSendEnabled || !due) {
    return null;
  }

  const subscribers = getSubscribersFromProfiles(profiles);
  const enabledCount = subscribers.filter(s => s.enabled).length;

  return (
    <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/85 to-stone-900 text-white rounded-2xl p-3.5 sm:p-4 mb-4 border border-emerald-500/40 shadow-lg relative overflow-hidden animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
            <Clock className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-emerald-500 text-stone-950 px-2 py-0.5 rounded-md">
                बिहान {config.sendTime} बजेको WhatsApp सेवा
              </span>
              <span className="text-[11px] text-emerald-200 font-medium">
                वि.सं. {todayBS}
              </span>
            </div>
            <p className="text-xs text-stone-200 mt-0.5">
              सुपर एडमिनले छानेका <strong className="text-amber-300">{enabledCount} जना</strong> यजमानहरूलाई आजको व्यक्तिगत फलादेश, पञ्चाङ्ग तथा PDF प्रतिवेदन पठाउने समय भएको छ।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={onOpenManager}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp सेवा खोल्नुहोस्</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-white/10 transition-colors"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

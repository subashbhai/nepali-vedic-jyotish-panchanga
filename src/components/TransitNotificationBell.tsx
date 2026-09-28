import React from 'react';
import { Bell, BellRing, Sparkles, Zap } from 'lucide-react';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface TransitNotificationBellProps {
  alertCount: number;
  hasHighPriority: boolean;
  hasUpdate?: boolean;
  updateVersion?: string;
  onClick: () => void;
  onOpenAppUpdates?: () => void;
  className?: string;
}

export const TransitNotificationBell: React.FC<TransitNotificationBellProps> = ({
  alertCount,
  hasHighPriority,
  hasUpdate = false,
  updateVersion,
  onClick,
  onOpenAppUpdates,
  className = ''
}) => {
  // Blinking/pulsing animation occurs when there is a software update OR active unread transit alerts
  const shouldBlink = Boolean(hasUpdate || (hasHighPriority && alertCount > 0));

  const handleClick = () => {
    if (hasUpdate && alertCount === 0 && onOpenAppUpdates) {
      onOpenAppUpdates();
    } else {
      onClick();
    }
  };

  const cleanVersion = updateVersion ? updateVersion.replace(/^v/i, '') : '';

  return (
    <button
      id="btn-transit-notification-bell"
      type="button"
      onClick={handleClick}
      className={`relative p-2 bg-[var(--header-btn-bg,rgba(255,255,255,0.9))] hover:bg-[var(--header-btn-hover,#F5F5F4)] rounded-xl border border-[var(--header-btn-border,#E6E0D5)] text-[var(--header-btn-text,#78716C)] hover:text-[var(--header-title,#1A1A1A)] transition-all shadow-xs cursor-pointer group active:scale-95 backdrop-blur-md ${
        hasUpdate ? 'ring-2 ring-amber-400/80 shadow-amber-500/20' : ''
      } ${className}`}
      title={
        hasUpdate
          ? `नयाँ सफ्टवेयर अपडेट उपलब्ध छ (संस्करण v${cleanVersion}) - सिधै डाउनलोड गर्नुहोस्!`
          : alertCount > 0
          ? `ग्रह गोचर अलर्ट केन्द्र (${toDevanagariNumerals(alertCount)} नयाँ गोचर सचेतना)`
          : 'सूचना तथा गोचर केन्द्र'
      }
      aria-label="सूचना तथा गोचर केन्द्र"
    >
      {shouldBlink ? (
        <BellRing className={`w-4 h-4 text-[var(--header-accent,#D97706)] ${hasUpdate ? 'animate-bounce' : 'animate-pulse'} group-hover:scale-110 transition-transform`} />
      ) : (
        <Bell className="w-4 h-4 text-current group-hover:scale-110 transition-transform" />
      )}

      {/* Alert Badge (Software Update OR Transit Alerts) */}
      {hasUpdate ? (
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[9.5px] font-black rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md animate-pulse border-2 border-white dark:border-stone-800"
          title={`नयाँ अपडेट v${cleanVersion}`}
        >
          {alertCount > 0 ? toDevanagariNumerals(alertCount + 1) : 'NEW'}
        </span>
      ) : alertCount > 0 ? (
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full text-white shadow-xs ${
            shouldBlink
              ? 'bg-rose-600 animate-bounce'
              : 'bg-amber-600'
          }`}
        >
          {toDevanagariNumerals(alertCount)}
        </span>
      ) : null}
    </button>
  );
};

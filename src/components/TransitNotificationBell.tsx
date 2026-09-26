import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface TransitNotificationBellProps {
  alertCount: number;
  hasHighPriority: boolean;
  onClick: () => void;
  className?: string;
}

export const TransitNotificationBell: React.FC<TransitNotificationBellProps> = ({
  alertCount,
  hasHighPriority,
  onClick,
  className = ''
}) => {
  // Blinking/pulsing and bouncing animation occurs ONLY when there are active unread alerts AND high priority
  const shouldBlink = Boolean(hasHighPriority && alertCount > 0);

  return (
    <button
      id="btn-transit-notification-bell"
      type="button"
      onClick={onClick}
      className={`relative p-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-[#78716C] dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors shadow-sm cursor-pointer group active:scale-95 ${className}`}
      title={
        alertCount > 0
          ? `ग्रह गोचर अलर्ट केन्द्र (${toDevanagariNumerals(alertCount)} नयाँ गोचर सचेतना)`
          : 'ग्रह गोचर अलर्ट केन्द्र (सबै हेरिसकिएको)'
      }
      aria-label="ग्रह गोचर अलर्ट केन्द्र"
    >
      {shouldBlink ? (
        <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
      ) : (
        <Bell className="w-4 h-4 text-stone-600 dark:text-stone-300 group-hover:scale-110 transition-transform" />
      )}

      {/* Alert Badge (Only rendered when there are unread alerts) */}
      {alertCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full text-white shadow-xs ${
            shouldBlink
              ? 'bg-rose-600 animate-bounce'
              : 'bg-amber-600'
          }`}
        >
          {toDevanagariNumerals(alertCount)}
        </span>
      )}
    </button>
  );
};

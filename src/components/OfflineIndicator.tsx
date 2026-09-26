import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-600/95 text-white shadow-xl backdrop-blur-xs text-xs font-medium border border-amber-400/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="w-6 h-6 rounded-lg bg-amber-700/80 flex items-center justify-center shrink-0">
        <WifiOff className="w-3.5 h-3.5 text-amber-100" />
      </div>
      <div className="flex-1">
        <div className="font-bold flex items-center gap-1.5">
          <span>अफलाइन मोड (Offline Mode)</span>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
        <div className="text-[11px] text-amber-100/90 leading-tight mt-0.5">
          इन्टरनेट बन्द हुँदा पनि क्यास गरिएको पञ्चाङ्ग र सुरक्षित कुण्डलीहरू पूर्ण रूपमा उपलब्ध छन्।
        </div>
      </div>
    </div>
  );
};

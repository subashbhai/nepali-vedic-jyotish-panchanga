import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { mobileHybridSync, MobileNetworkState } from '../../services/mobileHybridSync';

export const MobileNetworkBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [network, setNetwork] = useState<MobileNetworkState>(mobileHybridSync.getNetworkState());
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    mobileHybridSync.init();

    let wasOffline = !mobileHybridSync.getNetworkState().connected;
    const unsubscribe = mobileHybridSync.onNetworkChange((state) => {
      if (wasOffline && state.connected) {
        setShowReconnectedToast(true);
        setTimeout(() => setShowReconnectedToast(false), 4000);
      }
      wasOffline = !state.connected;
      setNetwork(state);
    });

    return () => unsubscribe();
  }, []);

  // When online and no toast, show nothing (or compact green dot if compact)
  if (network.connected && !showReconnectedToast) {
    if (compact) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium" title="अनलाइन मोड सक्रिय">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>अनलाइन</span>
        </div>
      );
    }
    return null;
  }

  // If reconnected toast
  if (showReconnectedToast) {
    return (
      <div className="w-full bg-emerald-900/90 text-emerald-100 border-b border-emerald-600 px-3 py-1.5 flex items-center justify-between text-xs animate-in slide-in-from-top duration-300 z-50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">इन्टरनेट पुनः जडान भयो — स्थानीय डेटा सर्भरसँग मिलाइँदैछ।</span>
        </div>
        <Wifi className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
      </div>
    );
  }

  // When Offline
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-medium" title="अफलाइन मोड (स्थानीय गणना जारी छ)">
        <WifiOff className="w-3 h-3 text-amber-400" />
        <span>अफलाइन मोड</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-amber-200 border-b border-amber-700/60 px-3 py-1.5 flex items-center justify-between text-xs shadow-md z-50">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span>
          <strong className="text-amber-300 font-semibold">अफलाइन मोड:</strong> इन्टरनेट उपलब्ध छैन। कुण्डली, पञ्चाङ्ग, वास्तु तथा स्थानीय सुविधाहरू सामान्य रूपमा चल्दैछन्।
        </span>
      </div>
      <button
        type="button"
        onClick={() => mobileHybridSync.triggerPendingQueueSync()}
        className="px-2 py-0.5 rounded bg-amber-800/60 hover:bg-amber-700 border border-amber-600 text-[11px] text-amber-100 flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
      >
        <RefreshCw className="w-3 h-3" />
        <span>जाँच गर्नुहोस्</span>
      </button>
    </div>
  );
};

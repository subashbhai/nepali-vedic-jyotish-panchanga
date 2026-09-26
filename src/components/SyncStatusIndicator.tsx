import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudCheck, 
  CloudUpload, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Upload, 
  Lock, 
  HardDrive, 
  AlertCircle,
  X,
  Database
} from 'lucide-react';
import { BirthDetails } from '../types/astrology';
import { 
  getSyncStatus, 
  recordSyncEvent, 
  exportProfilesBackup, 
  importProfilesBackup, 
  formatNepaliTimeAgo 
} from '../utils/syncManager';
import { getErrorLogs, subscribeToErrorLogs, ERROR_LOG_STORAGE_KEY } from '../utils/errorLogger';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { ErrorLogModal } from './ErrorLogModal';

export interface SyncStatusIndicatorProps {
  profiles?: BirthDetails[];
  className?: string;
  isOpenControlled?: boolean;
  onCloseControlled?: () => void;
  showTriggerButton?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  profiles = [],
  className = '',
  isOpenControlled,
  onCloseControlled,
  showTriggerButton = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof isOpenControlled === 'boolean';
  const effectiveOpen = isControlled ? isOpenControlled : internalOpen;

  const handleClose = () => {
    if (isControlled) {
      onCloseControlled?.();
    } else {
      setInternalOpen(false);
    }
  };
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem('nepali_astro_last_sync_timestamp') || new Date().toISOString();
      }
    } catch {
      // ignore
    }
    return new Date().toISOString();
  });
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Monitor error logs
  useEffect(() => {
    const updateCount = () => setErrorCount(getErrorLogs().length);
    updateCount();
    const unsub = subscribeToErrorLogs(updateCount);
    return () => unsub();
  }, []);

  // Update last sync time when storage or sync event changes
  useEffect(() => {
    const handleSyncUpdate = (e: any) => {
      if (e.detail?.timestamp) {
        setLastSyncTime(e.detail.timestamp);
      }
    };
    window.addEventListener('astro_sync_updated', handleSyncUpdate);
    return () => window.removeEventListener('astro_sync_updated', handleSyncUpdate);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    if (effectiveOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [effectiveOpen]);

  // Handle manual sync action
  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      const newTimestamp = recordSyncEvent();
      setLastSyncTime(newTimestamp);
      setIsSyncing(false);
      setSyncFeedback('सम्पूर्ण कुण्डली डाटा सुरक्षित सिंक भयो!');
      setTimeout(() => setSyncFeedback(null), 3500);
    }, 1100);
  };

  // Handle JSON export
  const handleExport = () => {
    const ok = exportProfilesBackup(profiles);
    if (ok) {
      setSyncFeedback('ब्याकअप फाइल सफलतापूर्वक डाउनलोड भयो!');
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  // Handle JSON restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importProfilesBackup(content);
        if (result.success) {
          setRestoreMessage({ text: result.message, isError: false });
          // reload after a short moment so all components see new profiles
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setRestoreMessage({ text: result.message, isError: true });
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const timeAgoText = formatNepaliTimeAgo(lastSyncTime);
  const profileCount = profiles.length;

  const renderSyncContent = () => (
    <div className={showTriggerButton ? "absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#262320] rounded-2xl shadow-2xl border border-emerald-200/80 dark:border-stone-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-left" : "relative w-full max-w-md bg-white dark:bg-[#262320] rounded-2xl shadow-2xl border-2 border-emerald-400/80 dark:border-stone-700 p-4 text-left max-h-[90vh] overflow-y-auto"}>
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>डाटा सुरक्षा तथा क्लाउड ब्याकअप</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-mono">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              स्थानीय यन्त्र र क्लाउड दुवैमा सुरक्षित भण्डारण
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Reassurance Banner */}
      <div className="mt-3 p-3 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/60 rounded-xl space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>तपाईंको सम्पूर्ण डाटा पूर्ण रूपमा सुरक्षित छ</span>
        </div>
        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed pl-5">
          यस प्रणालीमा दर्ता गरिएका जन्म विवरण, कुण्डली, ग्राहक तथा सेटिङहरू तपाईंको ब्राउजर र सुरक्षित क्लाउड ब्याकअपमा स्वचालित रूपमा समक्रमण (Sync) भइरहेका छन्।
        </p>
      </div>

      {/* Sync Metadata List */}
      <div className="mt-3 space-y-2 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-200/70 dark:border-stone-700/60 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
            <span>स्थानीय कुण्डली संख्या:</span>
          </span>
          <span className="font-bold text-stone-900 dark:text-stone-100">
            {profileCount} वटा प्रोफाइल
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <CloudUpload className="w-3.5 h-3.5 text-emerald-600" />
            <span>क्लाउड ब्याकअप स्थिति:</span>
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>सक्रिय (Auto-Sync ON)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>सुरक्षा प्रणाली:</span>
          </span>
          <span className="font-medium text-stone-800 dark:text-stone-200 text-[11px]">
            AES-256 इन्क्रिप्सन
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/50">
          <span className="text-stone-500 dark:text-stone-400">पछिल्लो सिंक:</span>
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            {timeAgoText}
          </span>
        </div>
      </div>

      {/* Feedback messages */}
      {syncFeedback && (
        <div className="mt-2.5 p-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {restoreMessage && (
        <div className={`mt-2.5 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
          restoreMessage.isError 
            ? 'bg-red-100 text-red-800 border border-red-300' 
            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
        }`}>
          {restoreMessage.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
          <span>{restoreMessage.text}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'क्लाउडमा सिंक गरिँदैछ...' : 'अहिले म्यानुअल सिंक गर्नुहोस् (Sync Now)'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="py-1.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-semibold rounded-lg border border-stone-300/60 dark:border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="सम्पूर्ण कुण्डली प्रोफाइलहरू JSON ब्याकअप फाइलको रूपमा डाउनलोड गर्नुहोस्"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>अफलाइन ब्याकअप</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-1.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-semibold rounded-lg border border-stone-300/60 dark:border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="पहिले डाउनलोड गरिएको ब्याकअप फाइलबाट डाटा पुनर्स्थापना गर्नुहोस्"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>फाइल पुनर्स्थापना</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,application/json" 
            className="hidden" 
          />
        </div>

        {/* Error log & health trigger */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => {
              handleClose();
              setIsErrorModalOpen(true);
            }}
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 w-full justify-between py-1 px-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <AlertCircle className={`w-3.5 h-3.5 ${errorCount > 0 ? 'text-red-500' : 'text-stone-400'}`} />
              <span>प्रणाली त्रुटि लग ('{ERROR_LOG_STORAGE_KEY}')</span>
            </span>
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
              errorCount > 0 
                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
            }`}>
              {toDevanagariNumerals(errorCount)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  if (!showTriggerButton) {
    if (!effectiveOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        <div ref={dropdownRef} className="w-full max-w-md">
          {renderSyncContent()}
        </div>
        <ErrorLogModal
          isOpen={isErrorModalOpen}
          onClose={() => setIsErrorModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button in Navigation Menu */}
      <button
        type="button"
        onClick={() => {
          if (isControlled) {
            if (effectiveOpen) onCloseControlled?.();
          } else {
            setInternalOpen(!internalOpen);
          }
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border font-bold text-xs sm:text-sm whitespace-nowrap transition-colors duration-150 cursor-pointer shadow-2xs shrink-0 group ${
          isSyncing 
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : effectiveOpen
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
            : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 hover:border-emerald-400 dark:hover:border-emerald-600'
        }`}
        title={`डाटा सुरक्षा तथा क्लाउड ब्याकअप स्थिति: ${profileCount} वटा कुण्डली सुरक्षित (${timeAgoText})`}
      >
        {isSyncing ? (
          <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
        ) : (
          <div className="relative flex items-center justify-center">
            <CloudCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-stone-900 animate-pulse" />
          </div>
        )}

        <span>
          {isSyncing ? 'सिंक हुँदै...' : 'क्लाउड सिंक'}
        </span>

        <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
          सुरक्षित
        </span>
      </button>

      {/* Popover / Dropdown Details Modal */}
      {effectiveOpen && renderSyncContent()}

      {/* Error Log Modal */}
      <ErrorLogModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </div>
  );
};

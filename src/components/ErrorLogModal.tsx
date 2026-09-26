import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { 
  getErrorLogs, 
  clearErrorLogs, 
  clearPersistentErrorStates, 
  exportErrorLogsAsJson,
  exportErrorLogsAsFormattedText,
  subscribeToErrorLogs, 
  ErrorLogEntry,
  ERROR_LOG_STORAGE_KEY
} from '../utils/errorLogger';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface ErrorLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateCleared?: () => void;
}

export const ErrorLogModal: React.FC<ErrorLogModalProps> = ({
  isOpen,
  onClose,
  onStateCleared
}) => {
  const [logs, setLogs] = useState<ErrorLogEntry[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stack' | 'component' | 'context'>('stack');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<'json' | 'text' | string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadLogs = () => {
    const data = getErrorLogs();
    setLogs(data);
    if (data.length > 0 && !expandedLogId) {
      setExpandedLogId(data[0].id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
      const unsubscribe = subscribeToErrorLogs(loadLogs);
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.message.toLowerCase().includes(q) ||
      log.name.toLowerCase().includes(q) ||
      log.source.toLowerCase().includes(q) ||
      (log.appStateContext?.activeTab || '').toLowerCase().includes(q) ||
      (log.appStateContext?.profileName || '').toLowerCase().includes(q)
    );
  });

  const handleClearAll = () => {
    if (window.confirm('के तपाईं सबै त्रुटि लगहरू मेटाउन चाहनुहुन्छ?')) {
      clearErrorLogs();
      setLogs([]);
      setExpandedLogId(null);
      showFeedback('सबै त्रुटि लगहरू हटाइयो (All error logs cleared)');
    }
  };

  const handleClearPersistentState = () => {
    const res = clearPersistentErrorStates({ keepLogs: false, clearSessionStorage: true });
    setLogs([]);
    setExpandedLogId(null);
    showFeedback('स्थायी त्रुटि अवस्था तथा क्यास सफा गरियो (Persistent error states cleared)');
    if (onStateCleared) {
      onStateCleared();
    }
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 3500);
  };

  const handleCopy = async (type: 'json' | 'text' | string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl border border-stone-300 dark:border-stone-800 w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-stone-50 dark:bg-stone-800/90 p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/70 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif">प्रणाली त्रुटि लग तथा अवस्था प्रबन्धक</h2>
                <span className="text-[10px] font-mono bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-full font-bold">
                  {toDevanagariNumerals(logs.length)} लग
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                स्थानीय भण्डारण कुञ्जी: <code className="font-mono bg-stone-200/80 dark:bg-stone-800 px-1 py-0.5 rounded text-amber-700 dark:text-amber-400 font-bold">'{ERROR_LOG_STORAGE_KEY}'</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {actionFeedback && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Top Controls Bar */}
        <div className="p-3 sm:p-4 bg-stone-100/50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="त्रुटि खोज्नुहोस् (Search message, source, tab)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-stone-800 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleCopy('all_text', exportErrorLogsAsFormattedText())}
              disabled={logs.length === 0}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {copiedType === 'all_text' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>टेक्स्ट प्रतिलिपि</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy('all_json', exportErrorLogsAsJson())}
              disabled={logs.length === 0}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {copiedType === 'all_json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
              <span>JSON प्रतिलिपि</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={logs.length === 0}
              className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>सबै लग मेटाउनुहोस्</span>
            </button>

            <button
              type="button"
              onClick={handleClearPersistentState}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="स्थानीय भण्डारणमा रहेका त्रुटि कुञ्जीहरू तथा क्यासहरू सफा गरी एप पुनस्र्थापना गर्नुहोस्"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>स्थायी त्रुटि अवस्था खाली गर्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* Content Area: Left list & Right detail */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800 min-h-[350px]">
          {/* List column */}
          <div className="w-full md:w-5/12 overflow-y-auto max-h-[300px] md:max-h-[520px] p-2 space-y-1.5">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-stone-400 dark:text-stone-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto opacity-40 text-emerald-600" />
                <p className="text-xs font-semibold">कुनै त्रुटि रेकर्ड गरिएको छैन।</p>
                <p className="text-[11px] text-stone-400">तपाईंको एप सामान्य एवं त्रुटिरहित रूपमा सञ्चालन भइरहेको छ।</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = expandedLogId === log.id;
                const isBoundary = log.source === 'PatrikaErrorBoundary';

                return (
                  <div
                    key={log.id}
                    onClick={() => setExpandedLogId(log.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-xs'
                        : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isBoundary 
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300' 
                          : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                      }`}>
                        {log.source}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {log.timestampFormatted}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {log.name}: {log.message}
                    </div>

                    <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-between">
                      <span>ट्याब: <b className="text-stone-700 dark:text-stone-300">{log.appStateContext?.activeTab || 'N/A'}</b></span>
                      {log.appStateContext?.profileName && (
                        <span>जातक: <b className="text-stone-700 dark:text-stone-300">{log.appStateContext.profileName}</b></span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details column */}
          <div className="w-full md:w-7/12 flex-1 flex flex-col overflow-hidden bg-stone-50/50 dark:bg-stone-950/50">
            {(() => {
              const activeLog = logs.find((l) => l.id === expandedLogId) || logs[0];
              if (!activeLog) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                    <p className="text-xs">विवरण हेर्न बायाँबाट कुनै त्रुटि छनोट गर्नुहोस्।</p>
                  </div>
                );
              }

              return (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Active log header summary */}
                  <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400 break-all font-mono">
                        {activeLog.name}: {activeLog.message}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeLog.id, JSON.stringify(activeLog, null, 2))}
                        className="text-stone-500 hover:text-stone-800 dark:text-stone-300 text-[11px] flex items-center gap-1 border border-stone-200 dark:border-stone-700 px-2 py-1 rounded bg-stone-50 dark:bg-stone-800 cursor-pointer"
                        title="यो त्रुटिको पूर्ण विवरण प्रतिलिपि गर्नुहोस्"
                      >
                        {copiedType === activeLog.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>प्रतिलिपि</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-stone-600 dark:text-stone-300">
                      <span><strong>स्रोत:</strong> {activeLog.source}</span>
                      <span><strong>समय:</strong> {activeLog.timestampNepali}</span>
                      <span><strong>लग ID:</strong> <code className="font-mono text-[10px]">{activeLog.id}</code></span>
                    </div>
                  </div>

                  {/* Sub-tabs for details */}
                  <div className="flex items-center gap-1 px-3.5 pt-2 border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('stack')}
                      className={`px-3 py-1.5 rounded-t-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        activeTab === 'stack'
                          ? 'bg-white dark:bg-stone-950 text-amber-700 dark:text-amber-400 border-t border-x border-stone-200 dark:border-stone-800'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>स्ट्याक ट्रेस (Stack)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('component')}
                      className={`px-3 py-1.5 rounded-t-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        activeTab === 'component'
                          ? 'bg-white dark:bg-stone-950 text-amber-700 dark:text-amber-400 border-t border-x border-stone-200 dark:border-stone-800'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>कम्पोनेन्ट स्ट्याक</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('context')}
                      className={`px-3 py-1.5 rounded-t-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        activeTab === 'context'
                          ? 'bg-white dark:bg-stone-950 text-amber-700 dark:text-amber-400 border-t border-x border-stone-200 dark:border-stone-800'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>एप अवस्था (App Context)</span>
                    </button>
                  </div>

                  {/* Active Sub-tab View */}
                  <div className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200">
                    {activeTab === 'stack' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-stone-400 pb-1 border-b border-stone-100 dark:border-stone-800">
                          <span>JavaScript Execution Stack Trace</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('single_stack', activeLog.stack || 'No stack trace')}
                            className="hover:text-stone-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> प्रतिलिपि
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-red-600 dark:text-red-400 overflow-x-auto">
                          {activeLog.stack || 'No stack trace available for this error.'}
                        </pre>
                      </div>
                    )}

                    {activeTab === 'component' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-stone-400 pb-1 border-b border-stone-100 dark:border-stone-800">
                          <span>React Component Hierarchy</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('single_comp_stack', activeLog.componentStack || 'No component stack')}
                            className="hover:text-stone-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> प्रतिलिपि
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-stone-700 dark:text-stone-300 overflow-x-auto">
                          {activeLog.componentStack || 'No React component stack available.'}
                        </pre>
                      </div>
                    )}

                    {activeTab === 'context' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-stone-400 pb-1 border-b border-stone-100 dark:border-stone-800">
                          <span>Application State Context at Error Time</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('single_ctx', JSON.stringify(activeLog.appStateContext, null, 2))}
                            className="hover:text-stone-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> प्रतिलिपि
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-blue-800 dark:text-blue-300 overflow-x-auto">
                          {JSON.stringify(activeLog.appStateContext, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-stone-500 dark:text-stone-400 text-[11px]">
            त्रुटि लगहरू ब्राउजरको निजी भण्डारणमा सुरक्षित रहनेछन् र सर्भरमा जाँदैनन्।
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearPersistentState}
              className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-xl transition-colors cursor-pointer"
            >
              त्रुटि अवस्था रिसेट
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogModal;

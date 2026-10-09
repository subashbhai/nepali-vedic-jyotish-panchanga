import { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  Terminal, 
  Layers, 
  Globe 
} from 'lucide-react';
import { 
  logError, 
  clearPersistentErrorStates, 
  ErrorLogEntry, 
  ERROR_LOG_STORAGE_KEY,
  getCurrentAppStateContext
} from '../utils/errorLogger';
import { ErrorLogModal } from './ErrorLogModal';

export interface PatrikaErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
  appStateContext?: Record<string, unknown>;
}

export interface PatrikaErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  activeDetailTab: 'stack' | 'component' | 'context';
  loggedEntry: ErrorLogEntry | null;
  isErrorModalOpen: boolean;
  copied: boolean;
  resetFeedback: string | null;
}

export class PatrikaErrorBoundary extends Component<PatrikaErrorBoundaryProps, PatrikaErrorBoundaryState> {
  constructor(props: PatrikaErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      activeDetailTab: 'stack',
      loggedEntry: null,
      isErrorModalOpen: false,
      copied: false,
      resetFeedback: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<PatrikaErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PatrikaErrorBoundary caught an error:', error, errorInfo);

    // Capture and log stack traces and app state context to the dedicated 'error-log' localStorage key
    try {
      const loggedEntry = logError(error, {
        componentStack: errorInfo.componentStack || undefined,
        source: 'PatrikaErrorBoundary',
        context: {
          fallbackTitle: this.props.fallbackTitle,
          ...(this.props.appStateContext || {}),
        },
      });

      this.setState({ error, errorInfo, loggedEntry });
    } catch (loggingErr) {
      console.warn('Failed to log error in PatrikaErrorBoundary:', loggingErr);
      this.setState({ error, errorInfo });
    }
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      showDetails: false,
      loggedEntry: null,
      resetFeedback: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleClearPersistentState = () => {
    try {
      clearPersistentErrorStates({ keepLogs: false, clearSessionStorage: true });
      this.setState({ 
        resetFeedback: 'स्थायी त्रुटि अवस्था तथा क्यास सफलतापूर्वक खाली गरियो! (Persistent error states cleared)'
      });

      setTimeout(() => {
        this.handleRetry();
      }, 900);
    } catch (e) {
      console.error('Failed to clear persistent error state:', e);
      this.handleRetry();
    }
  };

  private handleCopyDetails = async () => {
    const { error, errorInfo, loggedEntry } = this.state;
    const context = loggedEntry?.appStateContext || getCurrentAppStateContext(this.props.appStateContext);

    const report = {
      title: this.props.fallbackTitle || 'Patrika Error Report',
      error: error?.toString(),
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      appStateContext: context,
      timestamp: new Date().toISOString(),
      storageKey: ERROR_LOG_STORAGE_KEY,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  public render() {
    const { 
      hasError, 
      error, 
      errorInfo, 
      showDetails, 
      activeDetailTab, 
      loggedEntry, 
      isErrorModalOpen, 
      copied,
      resetFeedback 
    } = this.state;

    if (hasError) {
      const appContext = loggedEntry?.appStateContext || getCurrentAppStateContext(this.props.appStateContext);

      return (
        <div className="min-h-[480px] w-full bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-amber-800/80 rounded-2xl p-5 sm:p-8 shadow-xl my-4 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-200">
          
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 shadow-xs">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          </div>

          {/* Title & Context Message */}
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
              {this.props.fallbackTitle || 'पृष्ठ वा कम्पोनेन्ट लोड गर्न समस्या भयो'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {this.props.fallbackMessage || (
                (appContext?.activeTab === 'admin_control' || appContext?.activeTab === 'user_control' || appContext?.activeTab === 'menu_control')
                  ? 'प्रणाली वा प्रशासक कमान्ड कक्ष लोड गर्दा प्राविधिक त्रुटि देखिएको छ। कृपया रिसेट गरी पुनः प्रयास गर्नुहोस्।'
                  : 'जातकको जन्म विवरण, ग्रह स्थिति वा गणना तथ्याङ्कमा कुनै अस्वाभाविक त्रुटि भएकाले यो खण्ड प्रदर्शन हुन सकेन।'
              )} 
              {' '}यो त्रुटि, स्ट्याक ट्रेस र एप अवस्था सन्दर्भ स्थानीय भण्डारणको <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-amber-700 dark:text-amber-400 font-bold">'{ERROR_LOG_STORAGE_KEY}'</code> कुञ्जीमा सुरक्षित गरिएको छ।
            </p>

            {resetFeedback && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold animate-in fade-in">
                ✓ {resetFeedback}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>पुनः प्रयास गर्नुहोस् (Retry)</span>
            </button>

            <button
              type="button"
              onClick={this.handleClearPersistentState}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
              title="स्थायी त्रुटि अवस्था, क्यास तथा 'error-log' कुञ्जी खाली गरी एपलाई सुरक्षित अवस्थामा फर्काउनुहोस्"
            >
              <Trash2 className="w-4 h-4" />
              <span>स्थायी त्रुटि अवस्था खाली गर्नुहोस्</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.hash = '#dashboard';
                window.location.reload();
              }}
              className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-amber-600" />
              <span>गृहपृष्ठमा फर्कनुहोस्</span>
            </button>

            <button
              type="button"
              onClick={this.handleCopyDetails}
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'प्रतिलिपि भयो!' : 'त्रुटि प्रतिलिपि'}</span>
            </button>

            <button
              type="button"
              onClick={() => this.setState({ isErrorModalOpen: true })}
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>त्रुटि लग प्रबन्धक</span>
            </button>
          </div>

          {/* Technical Details Accordion */}
          <div className="w-full max-w-2xl pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => this.setState((prev) => ({ showDetails: !prev?.showDetails }))}
              className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center justify-center gap-1.5 mx-auto font-mono underline cursor-pointer"
            >
              <span>प्रविधिक विवरण तथा स्ट्याक ट्रेस (Technical Error Details & Stack Trace)</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl overflow-hidden text-left font-mono text-[11px] shadow-inner">
                {/* Tabs */}
                <div className="flex items-center gap-1 p-2 bg-stone-200/70 dark:bg-stone-900 border-b border-stone-300 dark:border-stone-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => this.setState({ activeDetailTab: 'stack' })}
                    className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      activeDetailTab === 'stack'
                        ? 'bg-white dark:bg-stone-950 text-red-600 dark:text-red-400 shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <Terminal className="w-3 h-3" />
                    <span>स्ट्याक ट्रेस</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => this.setState({ activeDetailTab: 'component' })}
                    className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      activeDetailTab === 'component'
                        ? 'bg-white dark:bg-stone-950 text-red-600 dark:text-red-400 shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>कम्पोनेन्ट स्ट्याक</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => this.setState({ activeDetailTab: 'context' })}
                    className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      activeDetailTab === 'context'
                        ? 'bg-white dark:bg-stone-950 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>एप अवस्था सन्दर्भ</span>
                  </button>
                </div>

                {/* Tab content */}
                <div className="p-3 max-h-56 overflow-y-auto space-y-2">
                  <div className="font-bold text-red-600 dark:text-red-400">
                    {error?.toString()}
                  </div>

                  {activeDetailTab === 'stack' && (
                    <pre className="text-[10px] text-red-500/90 dark:text-red-400/90 whitespace-pre-wrap leading-relaxed">
                      {error?.stack || 'No JS stack trace available'}
                    </pre>
                  )}

                  {activeDetailTab === 'component' && (
                    <pre className="text-[10px] text-stone-600 dark:text-stone-400 whitespace-pre-wrap leading-relaxed">
                      {errorInfo?.componentStack || 'No component stack available'}
                    </pre>
                  )}

                  {activeDetailTab === 'context' && (
                    <pre className="text-[10px] text-blue-700 dark:text-blue-300 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(appContext, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Error Log Modal */}
          <ErrorLogModal
            isOpen={isErrorModalOpen}
            onClose={() => this.setState({ isErrorModalOpen: false })}
            onStateCleared={this.handleRetry}
          />

        </div>
      );
    }

    return this.props.children;
  }
}

export default PatrikaErrorBoundary;

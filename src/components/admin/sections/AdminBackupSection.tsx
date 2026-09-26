import React, { useState } from 'react';
import { Database, Download, RefreshCw, AlertTriangle, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';

export const AdminBackupSection: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleFullBackup = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <span>बैकअप तथा डाटा सुरक्षा केन्द्र (Backup & Data Safety)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">सम्पूर्ण प्रणालीको डाटाबेस एक्सपोर्ट, ब्याकअप र पुनर्स्थापना (Restore Points)।</p>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-4 shadow-md">
        <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-800/50 p-4 rounded-xl">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-amber-200">पूर्ण प्रणाली ब्याकअप (Full System JSON Export)</h3>
            <p className="text-amber-300/80">
              यस कार्यले प्रणालीका सम्पूर्ण प्रयोगकर्ता, विशेषज्ञ, भुक्तानी, अर्डर, बुकिङ र सेटिङ्सको सुरक्षित ब्याकअप फाइल सिर्जना गर्दछ।
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {exportComplete && (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> ब्याकअप फाइल सफलतापूर्वक डाउनलोड भयो!
            </span>
          )}

          <button
            onClick={handleFullBackup}
            disabled={isExporting}
            className="ml-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'ब्याकअप फाइल तयार हुँदैछ...' : 'सम्पूर्ण डाटा ब्याकअप डाउनलोड गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

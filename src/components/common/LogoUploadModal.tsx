import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Check,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import {
  getStoredCustomLogo,
  saveStoredCustomLogo,
  resetStoredCustomLogo,
  compressAndFormatLogo
} from '../../utils/logoManager';
import { BALANANDA_DEFAULT_EMBLEM_SVG, getAssetUrl } from '../../utils/assetHelper';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoUpdated?: (newLogoUrl: string | null) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  onLogoUpdated,
}) => {
  const [currentLogo, setCurrentLogo] = useState<string>(() => {
    return getStoredCustomLogo() || getAssetUrl('/logo.png');
  });
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredCustomLogo();
      setCurrentLogo(stored || getAssetUrl('/logo.png'));
      setSelectedPreview(null);
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('कृपया फोटो वा तस्बिर फाइल मात्र छान्नुहोस् (PNG, JPG, WebP)।');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      // Compress and convert to Base64 (max 320x320)
      const dataUrl = await compressAndFormatLogo(file, 320);
      setSelectedPreview(dataUrl);
    } catch (err: any) {
      setErrorMsg('फोटो प्रोसेस गर्दा समस्या आयो: ' + (err.message || 'त्रुटि'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSave = () => {
    if (!selectedPreview) return;
    try {
      saveStoredCustomLogo(selectedPreview);
      setCurrentLogo(selectedPreview);
      setSuccessMsg('लोगो सफलतापूर्वक परिवर्तन भयो! अब यो सम्पूर्ण एप र प्रिन्टमा देखिनेछ।');
      if (onLogoUpdated) onLogoUpdated(selectedPreview);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e: any) {
      setErrorMsg('लोगो सुरक्षित गर्न सकिएन: ' + (e.message || 'त्रुटि'));
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('के तपाईं पूर्वनिर्धारित आधिकारिक बालानन्द लोगोमा फर्किन चाहनुहुन्छ?')) {
      resetStoredCustomLogo();
      setCurrentLogo(BALANANDA_DEFAULT_EMBLEM_SVG);
      setSelectedPreview(null);
      setSuccessMsg('पूर्वनिर्धारित लोगो पुनर्स्थापित गरियो।');
      if (onLogoUpdated) onLogoUpdated(null);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const displayLogo = selectedPreview || currentLogo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-[#2D241E] dark:text-stone-100 max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between bg-[#FDFCF8] dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif">
                संस्थाको लोगो व्यवस्थापन (Logo Upload)
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                कम्प्युटर वा मोबाइलबाट आफ्नो लोगो आफैं राख्नुहोस्
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-700 rounded-2xl text-red-900 dark:text-red-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dual Preview: Header Style & Letterhead Style */}
          <div className="p-4 bg-[#FAF8F5] dark:bg-stone-950 rounded-2xl border border-amber-200/70 dark:border-stone-800 space-y-3">
            <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              प्रत्यक्ष पूर्वावलोकन (Live Preview):
            </span>

            <div className="flex items-center justify-around gap-4 pt-1">
              {/* Circular Badge Preview (Header view) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 p-0.5 shadow-md bg-white overflow-hidden ring-2 ring-amber-400/20 flex items-center justify-center">
                  <img
                    src={displayLogo}
                    alt="Logo Preview"
                    className="w-full h-full object-cover rounded-full select-none"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = BALANANDA_DEFAULT_EMBLEM_SVG;
                    }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-medium">हेडर / प्रोफाइल (गोलाकार)</span>
              </div>

              {/* Square / Letterhead Preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-stone-300 dark:border-stone-700 p-1 shadow-sm bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src={displayLogo}
                    alt="Square Preview"
                    className="w-full h-full object-contain select-none"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = BALANANDA_DEFAULT_EMBLEM_SVG;
                    }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-medium">कागजात / रसिद (वर्गाकार)</span>
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#D97706] bg-amber-50 dark:bg-amber-950/30 scale-[1.01]'
                : 'border-stone-300 dark:border-stone-700 hover:border-amber-400 hover:bg-stone-50/80 dark:hover:bg-stone-850'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-[#D97706] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs sm:text-sm">
                नयाँ लोगो छान्नुहोस् (Browse or Drag & Drop)
              </span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                PNG, JPG वा WebP फोटो (पारदर्शी पृष्ठभूमि भएको PNG उत्तम हुन्छ)
              </p>
            </div>
          </div>

          {/* Offline & Persistence Notice */}
          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>१००% अफलाइन तथा सुरक्षित:</span>
            </div>
            <p className="text-blue-800 dark:text-blue-300">
              तपाईंले अपलोड गर्नुभएको लोगो सिधै सुरक्षित बेस-६४ (Base64) डेटामा रूपान्तरण हुन्छ। यसले गर्दा इन्टरनेट नभए पनि, कम्प्युटर वा मोबाइलमा एप कहिल्यै पनि झिम्किने (Blink) वा बिग्रने हुँदैन।
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FDFCF8] dark:bg-stone-850 border-t border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1 text-[11px] text-stone-600 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-400 cursor-pointer font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>पूर्वनिर्धारितमा फर्काउनुहोस्</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
            >
              रद्द गर्नुहोस्
            </button>

            <button
              type="button"
              disabled={!selectedPreview || isProcessing}
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
                selectedPreview && !isProcessing
                  ? 'bg-[#D97706] hover:bg-[#b45309] text-white active:scale-95'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>लोगो सुरक्षित गर्नुहोस्</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

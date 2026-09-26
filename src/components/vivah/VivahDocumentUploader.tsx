import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Trash2, 
  FileText, 
  Eye, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck,
  Maximize2
} from 'lucide-react';
import { compressAndResizeImage } from '../../utils/imageUtils';

interface VivahDocumentUploaderProps {
  value?: string;
  onChange: (docDataUrl: string) => void;
  label?: string;
  docType?: string;
}

export const VivahDocumentUploader: React.FC<VivahDocumentUploaderProps> = ({
  value,
  onChange,
  label = 'परिचयपत्र कागजात अपलोड (Document Upload) *',
  docType = 'नागरिकता'
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle file chosen from computer / mobile
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type.startsWith('image/')) {
        // High quality resolution for reading serial numbers & text
        const compressed = await compressAndResizeImage(file, 1200, 0.88);
        onChange(compressed);
      } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            onChange(ev.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('कृपया तस्बिर (JPG, PNG) वा PDF फाइल मात्र छान्नुहोस्।');
      }
    } catch (err) {
      console.error('Document processing failed:', err);
    } finally {
      e.target.value = '';
    }
  };

  // Open native camera input or live webcam
  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setIsCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        return;
      } catch (err) {
        console.warn('Webcam stream unavailable, falling back to device camera:', err);
        stopCamera();
      }
    }
    // Fallback: Trigger native camera file picker
    nativeCameraInputRef.current?.click();
  };

  // Stop active camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from live camera
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const compressed = await compressAndResizeImage(dataUrl, 1200, 0.88);
        onChange(compressed);
      }
    } catch (err) {
      console.error('Failed to capture document photo:', err);
    } finally {
      stopCamera();
    }
  };

  const isPdf = value?.startsWith('data:application/pdf') || value?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block font-bold text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}

      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Uploaded State: Document Preview & Actions */
        <div className="bg-stone-50 dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{docType} कागजात सफलतापूर्वक लोड भयो</span>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              हटाउनुहोस्
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Thumbnail Preview */}
            <div 
              onClick={() => setIsPreviewOpen(true)}
              className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-950 flex items-center justify-center cursor-pointer group shadow-inner"
            >
              {isPdf ? (
                <div className="text-center p-3 text-stone-600 dark:text-stone-400">
                  <FileText className="w-10 h-10 text-red-500 mx-auto mb-1" />
                  <span className="text-[11px] font-bold block">PDF कागजात</span>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Uploaded ID Document"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                <Maximize2 className="w-4 h-4" />
                ठूलो हेर्नुहोस्
              </div>
            </div>

            {/* Actions & info */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                कागजात स्पष्ट र पढ्न सकिने हुनुपर्दछ। प्रमाणीकरणका लागि पेश गर्नु अघि एक पटक पूर्वावलोकन गर्नुहोस्।
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  कागजात हेर्नुहोस् (Preview)
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  अर्को फाइल छान्नुहोस्
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  पुनः स्क्यान / फोटो खिच्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Upload from Device or Camera Buttons */
        <div className="bg-stone-50/70 dark:bg-stone-900/70 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-5 text-center space-y-3">
          <div className="flex justify-center gap-3 text-stone-400">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          <div>
            <h5 className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
              आफ्नो {docType} को स्पष्ट फोटो वा PDF अपलोड गर्नुहोस्
            </h5>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              नागरिकता, राष्ट्रिय परिचयपत्र वा राहदानीको तस्बिर खिच्नुहोस् वा फाइल अपलोड गर्नुहोस्।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            {/* 1. Device Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-102"
            >
              <Upload className="w-4 h-4" />
              डिभाइस / ग्यालरीबाट अपलोड (Upload File)
            </button>

            {/* 2. Camera Scan Button */}
            <button
              type="button"
              onClick={startCamera}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-102"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              क्यामेराबाट सिधै फोटो खिच्नुहोस् (Scan / Snap)
            </button>
          </div>

          {/* Optional URL input toggle */}
          <div className="pt-2 text-center">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-[11px] text-amber-700 dark:text-amber-400 underline hover:text-amber-800 cursor-pointer"
              >
                वा कागजात लिङ्क (URL) राख्नुहोस्
              </button>
            ) : (
              <div className="max-w-md mx-auto flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="https://..."
                  onChange={(e) => {
                    if (e.target.value.trim()) onChange(e.target.value.trim());
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Webcam Modal for Document Scan */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-700 max-w-lg w-full p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500 animate-pulse" />
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {docType} क्यामेरा स्क्यान (Live Document Scan)
                </h4>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Document Alignment Frame */}
              <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-white/90 bg-black/60 px-3 py-1 rounded-full font-medium shadow">
                  कागजात यस फ्रेमभित्र सिधा राख्नुहोस्
                </span>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Scan
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-transform hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                कागजात खिच्नुहोस् (Capture ID)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Preview Modal */}
      {isPreviewOpen && value && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-700 max-w-2xl w-full p-4 space-y-3 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {docType} कागजात पूर्वावलोकन (Full Document View)
              </h4>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl bg-stone-950 flex items-center justify-center p-2 min-h-[300px]">
              {isPdf ? (
                <iframe
                  src={value}
                  title="PDF Preview"
                  className="w-full h-96 rounded-lg border-0"
                />
              ) : (
                <img
                  src={value}
                  alt="Full Document View"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
              >
                बन्द गर्नुहोस् (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

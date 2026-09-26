import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Trash2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  X, 
  Check, 
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import { compressAndResizeImage } from '../../utils/imageUtils';

interface VivahPhotoUploaderProps {
  value?: string;
  onChange: (photoUrl: string) => void;
  label?: string;
}

export const VivahPhotoUploader: React.FC<VivahPhotoUploaderProps> = ({
  value,
  onChange,
  label = 'प्रोफाइल तस्बिर छनोट (तपाईंको गोपनीयता सुरक्षित रहनेछ - अनुहार स्वतः ब्लर हुनेछ):'
}) => {
  const [showBlurPreview, setShowBlurPreview] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle file chosen from device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressAndResizeImage(file, 800, 0.85);
      onChange(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      e.target.value = '';
    }
  };

  // Open native camera input or live webcam
  const startCamera = async () => {
    setCameraError('');
    // Try webcam API first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setIsCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        return;
      } catch (err) {
        console.warn('Webcam stream unavailable, falling back to native camera input:', err);
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
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw centered square crop if aspect ratio is not 1:1
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const compressed = await compressAndResizeImage(dataUrl, 800, 0.85);
        onChange(compressed);
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
    } finally {
      stopCamera();
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* When Photo is present: Preview + Controls */}
      {value ? (
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Visual Photo Box with Blur toggle */}
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md shrink-0 bg-stone-200 dark:bg-stone-800">
              <img
                src={value}
                alt="Profile"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  showBlurPreview ? 'filter blur-[7px] scale-105' : 'filter-none'
                }`}
              />

              {showBlurPreview && (
                <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                  <ShieldCheck className="w-6 h-6 text-emerald-300 mb-1 drop-shadow" />
                  <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full shadow">
                    सार्वजनिक ब्लर दृश्य
                  </span>
                </div>
              )}
            </div>

            {/* Actions & Explanations */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlurPreview(!showBlurPreview)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    showBlurPreview
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
                      : 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
                  }`}
                >
                  {showBlurPreview ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      मूल तस्बिर हेर्नुहोस् (Original)
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                      ब्लर दृश्य हेर्नुहोस् (Safe Blur)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 text-xs font-semibold flex items-center gap-1 hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  तस्बिर हटाउनुहोस्
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  अर्को फोटो अपलोड
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  क्यामेराबाट खिच्नुहोस्
                </button>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed pt-1">
                ✓ तपाईंको तस्बिर सुरक्षित रूपमा सेभ भएको छ। पोर्टलका अन्य प्रयोगकर्ताहरूलाई अनुहार ब्लर भएर मात्र देखिनेछ।
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Upload from Device or Camera Buttons */
        <div className="bg-stone-50/70 dark:bg-stone-900/70 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-5 text-center space-y-3">
          <div className="flex justify-center gap-3 text-stone-400">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <ImageIcon className="w-6 h-6" />
            </div>
          </div>

          <div>
            <h5 className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
              आफ्नो स्पष्ट तस्बिर अपलोड गर्नुहोस् वा खिच्नुहोस्
            </h5>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              १००% गोपनीयता: तपाईंको अनुहार सार्वजनिक खोज सूचीमा स्वतः ब्लर हुनेछ।
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
              ग्यालरी / डिभाइसबाट अपलोड
            </button>

            {/* 2. Camera Button */}
            <button
              type="button"
              onClick={startCamera}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-102"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              क्यामेराबाट खिच्नुहोस् (Camera)
            </button>
          </div>

          {/* Optional URL input toggle */}
          <div className="pt-2 text-center">
            {!showUrlFallback ? (
              <button
                type="button"
                onClick={() => setShowUrlFallback(true)}
                className="text-[11px] text-amber-700 dark:text-amber-400 underline hover:text-amber-800 cursor-pointer"
              >
                वा अनलाइन फोटो लिङ्क (URL) राख्नुहोस्
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
                  onClick={() => setShowUrlFallback(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Webcam Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-700 max-w-sm w-full p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500 animate-pulse" />
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  क्यामेरा दृश्य (Live Camera)
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

            <div className="relative rounded-2xl overflow-hidden aspect-square bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none" />
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live
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
                तस्बिर खिच्नुहोस् (Snap)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

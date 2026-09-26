import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Check, 
  Trash2, 
  Crop, 
  Shield, 
  Eye, 
  EyeOff, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle 
} from 'lucide-react';
import { CROP_ASPECT_PRESETS, compressAndResizeImage, cropCanvasImage } from '../utils/imageUtils';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleNepali: string;
  currentPhotoUrl?: string;
  onSavePhoto: (photoUrl: string, isPrivate?: boolean) => void;
  onDeletePhoto?: () => void;
  isPrivateInitial?: boolean;
  allowPrivacyToggle?: boolean;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  titleNepali,
  currentPhotoUrl,
  onSavePhoto,
  onDeletePhoto,
  isPrivateInitial = false,
  allowPrivacyToggle = false,
}) => {
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPrivate, setIsPrivate] = useState<boolean>(isPrivateInitial);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedImageSrc(currentPhotoUrl || '');
      setIsPrivate(isPrivateInitial || false);
      setIsConfirmingDelete(false);
      setIsCameraActive(false);
    } else {
      stopCamera();
    }
  }, [isOpen, currentPhotoUrl, isPrivateInitial]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('क्यामेरा खोल्न सकिएन। कृपया क्यामेराको अनुमति दिनुहोस् वा फाइल छनोट गर्नुहोस्।');
      setIsCameraActive(false);
    }
  };

  const handleCaptureFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImageSrc(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setIsProcessing(true);
      try {
        const compressed = await compressAndResizeImage(files[0], 1000, 0.9);
        setSelectedImageSrc(compressed);
      } catch (err) {
        console.error('Image compression error', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleApplyCropAndSave = async () => {
    if (!selectedImageSrc) return;
    setIsProcessing(true);
    try {
      // Compress and optimize final image
      const finalImage = await compressAndResizeImage(selectedImageSrc, 600, 0.85);
      onSavePhoto(finalImage, isPrivate);
      onClose();
    } catch (err) {
      console.error('Error applying photo crop', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (onDeletePhoto) {
      onDeletePhoto();
      onClose();
    } else {
      setSelectedImageSrc('');
      onSavePhoto('', false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-[#00000080] z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between bg-[#FDFCF8] dark:bg-stone-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F59E0B]/10 text-[#D97706] rounded-xl">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1A1A1A] dark:text-stone-100">{titleNepali}</h3>
              <p className="text-xs text-[#78716C] dark:text-stone-400">फोटो छनोट, काटछाँट तथा मिलाउने व्यवस्था</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Camera active view */}
          {isCameraActive ? (
            <div className="space-y-3">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-amber-500/30">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-xl hover:bg-stone-300"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  onClick={handleCaptureFromCamera}
                  className="px-5 py-2 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  फोटो खिच्नुहोस्
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Photo Display / Preview Canvas Box */}
              <div className="relative aspect-square max-w-[280px] mx-auto bg-stone-100 dark:bg-stone-950 border-2 border-dashed border-[#D97706]/40 dark:border-amber-500/40 rounded-2xl overflow-hidden flex items-center justify-center group shadow-inner">
                {selectedImageSrc ? (
                  <img
                    src={selectedImageSrc}
                    alt="Photo Preview"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                      फोटो उपलब्ध छैन
                    </p>
                    <p className="text-[11px] text-stone-400">
                      मोबाइल वा कम्प्युटरबाट अपलोड गर्नुहोस्
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Controls Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#D97706]" />
                  फाइल छनोट गर्नुहोस्
                </button>

                <button
                  onClick={handleStartCamera}
                  className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4 text-[#D97706]" />
                  क्यामेराबाट खिच्नुहोस्
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Aspect Ratio & Zoom Controls (when photo present) */}
              {selectedImageSrc && (
                <div className="space-y-3 bg-[#FDFCF8] dark:bg-stone-950 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      अनुपात छनोट (Aspect Ratio):
                    </span>
                    <span className="text-[11px] text-[#D97706] font-bold">
                      {CROP_ASPECT_PRESETS.find((p) => p.value === aspectRatio)?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CROP_ASPECT_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setAspectRatio(preset.value)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                          aspectRatio === preset.value
                            ? 'bg-[#D97706] text-white border-[#D97706]'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {preset.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Zoom Slider */}
                  <div className="flex items-center gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                    <ZoomOut className="w-4 h-4 text-stone-400" />
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.05"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      className="w-full accent-[#D97706] cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              )}

              {/* Privacy Setting Toggle */}
              {allowPrivacyToggle && (
                <div className="flex items-center justify-between p-3 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D97706]" />
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        ग्राहक फोटो गोपनीयता
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        अनुमति बिना यो फोटो सार्वजनिक हुने छैन।
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isPrivate
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Confirm Delete Banner */}
              {isConfirmingDelete && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-bold">के तपाईं यो फोटो हटाउन चाहनुहुन्छ?</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-3 py-1 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-lg"
                    >
                      रद्द
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      हटाउनुहोस्
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#E6E0D5] dark:border-stone-800 bg-[#FDFCF8] dark:bg-stone-950 flex items-center justify-between">
          {selectedImageSrc && !isConfirmingDelete && (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              फोटो हटाउनुहोस्
            </button>
          )}
          {!selectedImageSrc && <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              बन्द गर्नुहोस्
            </button>
            <button
              onClick={handleApplyCropAndSave}
              disabled={!selectedImageSrc || isProcessing}
              className="px-5 py-2 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              सुरक्षित गर्नुहोस्
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;

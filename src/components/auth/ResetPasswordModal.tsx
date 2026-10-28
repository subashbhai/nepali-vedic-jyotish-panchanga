import React, { useState, useEffect } from 'react';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { clearRBACSession } from '../../db/rbacStore';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onResetSuccess?: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  token,
  onResetSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token || token.trim() === '') {
      setErrorMsg('अमान्य वा फेला नपरेको पासवर्ड रिसेट टोकन।');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('पासवर्ड र पुनः प्रविष्ट गरिएको पासवर्ड मिलेन।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'तपाईंको पासवर्ड सफलतापूर्वक परिवर्तन भयो!');
        // Invalidate current session locally so user logs in cleanly with new credentials
        clearRBACSession();
        // Remove token from hash
        if (window.location.hash.includes('reset-password')) {
          window.location.hash = '#home';
        }

        setTimeout(() => {
          onClose();
          if (onResetSuccess) {
            onResetSuccess();
          } else {
            window.dispatchEvent(new CustomEvent('open-rbac-auth-modal'));
          }
        }, 1800);
      } else {
        setErrorMsg(data.error || 'पासवर्ड रिसेट गर्न सकिएन। टोकनको म्याद समाप्त भएको हुन सक्छ।');
      }
    } catch (err: any) {
      setErrorMsg('सर्भरसँग सम्पर्क हुन सकेन। कृपया इन्टरनेट जडान जाँच गरी पुनः प्रयास गर्नुहोस्।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-500/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif">
                नयाँ पासवर्ड सेट गर्नुहोस्
              </h3>
              <p className="text-xs text-amber-200/90 mt-0.5">
                बालानन्द वैदिक सेवा - सुरक्षित पासवर्ड रिसेट
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {successMsg ? (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-emerald-800 dark:text-emerald-300">
                पासवर्ड सफलतापूर्वक परिवर्तन भयो!
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {successMsg} पुराना सबै सक्रिय सेसनहरू रद्द गरिएका छन्। अब नयाँ पासवर्डबाट लगइन गर्नुहोस्।
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-1">
                  <span>लगइन फारम खुल्दैछ...</span>
                  <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Notice */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  सुपरएडमिनद्वारा जारी गरिएको एकल-प्रयोग (Single-use) सुरक्षित रिसेट लिङ्क प्रमाणित भएको छ। नयाँ पासवर्ड प्रविष्ट गर्नुहोस्।
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center gap-2 text-rose-800 dark:text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1.5">
                  नयाँ पासवर्ड (कम्तीमा ६ अक्षर) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="नयाँ गोप्य पासवर्ड प्रविष्ट गर्नुहोस्"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 pr-10 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1.5">
                  नयाँ पासवर्ड पुनः पुष्टि गर्नुहोस् *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="नयाँ पासवर्ड पुनः टाइप गर्नुहोस्"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className={`w-full py-3 rounded-2xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                    !loading && newPassword.length >= 6 && newPassword === confirmPassword
                      ? 'bg-gradient-to-r from-[#7A1C1C] to-[#92400E] hover:brightness-110 cursor-pointer active:scale-98'
                      : 'bg-stone-400 dark:bg-stone-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'सुरक्षित गर्दै...' : 'पासवर्ड सुरक्षित गर्नुहोस्'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

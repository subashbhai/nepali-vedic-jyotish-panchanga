import React, { useState, useEffect } from 'react';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { changeClientPassword, getClientPolicyByMobile } from '../../db/menuControlStore';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMobile?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  defaultMobile = ''
}) => {
  const [mobile, setMobile] = useState(defaultMobile);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (!defaultMobile) {
        // Try getting from active mobile policy in storage
        try {
          const raw = localStorage.getItem('balananda_active_mobile_policy_v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.mobile) setMobile(parsed.mobile);
          }
        } catch {}
      } else {
        setMobile(defaultMobile);
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, defaultMobile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('कृपया मान्य १० अंकको मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    if (!oldPassword) {
      setErrorMsg('कृपया हालको (सुपरएडमिनले दिएको वा पुरानो) पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('नयाँ पासवर्ड कम्तीमा ६ अक्षर वा अङ्कको हुनुपर्दछ।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('नयाँ पासवर्ड र पुष्टि पासवर्ड मिलेन।');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = changeClientPassword(cleanMobile, oldPassword, newPassword);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          onClose();
        }, 1600);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'पासवर्ड परिवर्तन गर्दा समस्या आयो।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-amber-400 dark:border-stone-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-200">पासवर्ड परिवर्तन (Change Password)</h3>
              <p className="text-[11px] text-amber-100/80">आफ्नो खाताको गोप्य पासवर्ड सुरक्षित रूपमा परिवर्तन गर्नुहोस्</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              मोबाइल नम्बर (Mobile Number)
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="९८XXXXXXXX / 98XXXXXXXX"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              हालको पुरानो पासवर्ड (Current Password)
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="सुपरएडमिनले दिएको वा हालको पासवर्ड"
                className="w-full px-3 py-2 pr-10 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              नयाँ गोप्य पासवर्ड (New Password)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="नयाँ पासवर्ड (कम्तीमा ६ अक्षर/अङ्क)"
                className="w-full px-3 py-2 pr-10 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              नयाँ पासवर्ड पुन: प्रविष्ट (Confirm New Password)
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="नयाँ पासवर्ड दोहोर्याउनुहोस्"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500"
              required
              minLength={6}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#7A1C1C] hover:bg-[#8B2323] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'परिवर्तन गर्दै...' : 'पासवर्ड सुरक्षित गर्नुहोस्'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

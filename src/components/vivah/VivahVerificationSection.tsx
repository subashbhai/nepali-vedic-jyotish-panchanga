import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck, 
  Upload, 
  Lock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { VivahProfile } from '../../types/vivahTypes';
import { VivahDocumentUploader } from './VivahDocumentUploader';

interface VivahVerificationSectionProps {
  currentProfile: VivahProfile | null;
  onSubmitVerification: (idDocType: string, docUrl: string) => void;
}

export const VivahVerificationSection: React.FC<VivahVerificationSectionProps> = ({
  currentProfile,
  onSubmitVerification,
}) => {
  const [docType, setDocType] = useState('नागरिकता (Citizenship)');
  const [docUrl, setDocUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!currentProfile) {
    return (
      <div className="bg-white dark:bg-[#1E1B18] p-8 rounded-3xl border border-[#E6E0D5] text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-[#D97706] mx-auto" />
        <h3 className="font-bold font-serif text-lg">प्रमाणीकरणका लागि पहिले आफ्नो विवाह प्रोफाइल चयन/दर्ता गर्नुहोस्।</h3>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl.trim()) {
      alert('कृपया पहिले आफ्नो परिचयपत्र कागजात अपलोड वा स्क्यान गर्नुहोस्।');
      return;
    }

    onSubmitVerification(docType, docUrl);
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-6 rounded-3xl border border-amber-800/60 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 px-3 py-0.5 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>प्रोफाइल प्रमाणीकरण प्रणाली (Verification System)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
          प्रमाणित ब्याज प्राप्त गर्नुहोस् (Get Admin Verification Badge)
        </h2>
        <p className="text-xs text-amber-200/80">
          नागरिकता वा राष्ट्रिय परिचयपत्र पेश गरी आफ्नो प्रोफाइललाई पूर्ण रूपमा आधिकारिक र विश्वासिलो बनाउनुहोस्।
        </p>
      </div>

      {/* Current Level Status Card */}
      <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="font-bold font-serif text-base text-stone-900 dark:text-stone-100">
          हजुरको हालको प्रमाणीकरण तह (Current Verification Level)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            currentProfile.verificationLevel === 'BASIC'
              ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/60'
              : 'bg-stone-50 border-stone-200 dark:bg-stone-900'
          }`}>
            <span className="font-bold text-xs block">१. आधारभूत (Basic)</span>
            <span className="text-[11px] text-stone-500">ईमेल/फोन दर्ता</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            currentProfile.verificationLevel === 'MOBILE_VERIFIED' || currentProfile.verificationLevel === 'ID_SUBMITTED'
              ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/60'
              : 'bg-stone-50 border-stone-200 dark:bg-stone-900'
          }`}>
            <span className="font-bold text-xs block">२. मोबाइल प्रमाणित</span>
            <span className="text-[11px] text-stone-500">OTP प्रमाणीकरण</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            currentProfile.verificationLevel === 'ADMIN_VERIFIED'
              ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 text-emerald-900'
              : 'bg-stone-50 border-stone-200 dark:bg-stone-900'
          }`}>
            <span className="font-bold text-xs block">३. एडमिन प्रमाणित (Verified)</span>
            <span className="text-[11px] text-stone-500">परिचयपत्र स्वीकृत</span>
          </div>
        </div>

        {/* Verification Document Form */}
        {currentProfile.verificationLevel === 'ADMIN_VERIFIED' ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>बधाई छ! हजुरको प्रोफाइल एडमिनद्वारा पूर्ण रूपमा प्रमाणीकरण (Admin Verified) भइसकेको छ।</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs sm:text-sm">
            <div>
              <label className="block font-bold mb-1">परिचयपत्र प्रकार छनोट गर्नुहोस् *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
              >
                <option value="नागरिकता (Citizenship)">नेपाली नागरिकता प्रमाणपत्र (Citizenship Certificate)</option>
                <option value="राष्ट्रिय परिचयपत्र (NID)">राष्ट्रिय परिचयपत्र (National ID)</option>
                <option value="राहदानी (Passport)">राहदानी (Passport)</option>
                <option value="सवारी चालक अनुमतिपत्र (Driving License)">सवारी चालक अनुमतिपत्र (Driving License)</option>
                <option value="अन्य सरकारी परिचयपत्र">अन्य सरकारी परिचयपत्र (Other Official ID)</option>
              </select>
            </div>

            {/* परिचयपत्र कागजात (Document Upload / Camera Scan) */}
            <VivahDocumentUploader
              value={docUrl}
              onChange={(uploadedDoc) => setDocUrl(uploadedDoc)}
              label="परिचयपत्र कागजात अपलोड (Document Upload) *"
              docType={docType}
            />

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>गोपनीयता प्रतिबद्धता: हजुरका परिचयपत्र कागजात एडमिनद्वारा मात्र जाँच हुन्छन् र अन्य कुनै पनि प्रयोगकर्तालाई कहिल्यै देखाइनेछैन।</span>
            </div>

            {isSubmitted && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
                कागजात दर्ता भएको छ। एडमिनको रिभ्यु पछि प्रमाणिक ब्याज (Verified Badge) प्रदान गरिनेछ।
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-3 rounded-xl shadow transition-colors"
            >
              प्रमाणीकरणका लागि पेश गर्नुहोस् (Submit for Verification)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

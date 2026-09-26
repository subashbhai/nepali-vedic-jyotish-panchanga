import React, { useState } from 'react';
import { Scroll, Printer, Download, Sparkles } from 'lucide-react';
import { BirthDetails, OrganizationProfile } from '../types/astrology';
import { exportElementToPDF, printElement } from '../utils/pdfGenerator';
import { ReportHeader, ReportFooter } from './ReportHeaderFooter';
import { OmBorderFrame } from './CheenaDocument';

interface SanskarDocsViewProps {
  profile: BirthDetails;
  orgProfile?: OrganizationProfile;
}

export const SanskarDocsView: React.FC<SanskarDocsViewProps> = ({ profile, orgProfile }) => {
  const [docType, setDocType] = useState<'naamkaran' | 'annaprashan' | 'vivah' | 'bartabandha' | 'certificate'>('naamkaran');
  const [showPhoto, setShowPhoto] = useState<boolean>(true);

  const defaultOrg: OrganizationProfile = orgProfile || {
    name: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
    phone: '+९७७-९७६४४००५३३',
    email: 'suwashdmk@gmail.com',
    address: 'काठमाडौँ, नेपाल',
    intro: 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा',
    showLogoOnBills: true,
    showPhotoOnReports: true,
  };

  const handlePrint = () => printElement('sanskar_document_area');
  const handlePDF = () => exportElementToPDF('sanskar_document_area', `Sanskar_Patra_${profile.name}.pdf`);

  return (
    <div className="space-y-6">
      {/* Document Selector Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-[#D97706]" />
            <span>वैदिक संस्कार पत्र तथा प्रमाणपत्र (Sanskar Patrikas & Certificates)</span>
          </h2>
          <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">नामकरण, अन्नप्राशन, व्रतबन्ध, विवाह निमन्त्रणा तथा संस्कार सम्पन्न प्रमाणपत्र</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showPhoto}
              onChange={(e) => setShowPhoto(e.target.checked)}
              className="accent-[#D97706]"
            />
            <span>फोटो समावेश</span>
          </label>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white dark:bg-stone-800 text-[#2D241E] dark:text-stone-100 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#E6E0D5] dark:border-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#D97706]" />
            <span>प्रिन्ट</span>
          </button>
          <button
            onClick={handlePDF}
            className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>PDF डाउनलोड</span>
          </button>
        </div>
      </div>

      {/* Doc Types Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setDocType('naamkaran')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            docType === 'naamkaran' ? 'bg-[#D97706] text-white shadow-xs' : 'bg-white dark:bg-stone-800 text-[#78716C] dark:text-stone-300 border border-[#E6E0D5] dark:border-stone-700'
          }`}
        >
          👶 नामकरण पत्र (Naamkaran)
        </button>
        <button
          onClick={() => setDocType('annaprashan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            docType === 'annaprashan' ? 'bg-[#D97706] text-white shadow-xs' : 'bg-white dark:bg-stone-800 text-[#78716C] dark:text-stone-300 border border-[#E6E0D5] dark:border-stone-700'
          }`}
        >
          🍚 अन्नप्राशन / पासनी
        </button>
        <button
          onClick={() => setDocType('vivah')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            docType === 'vivah' ? 'bg-[#D97706] text-white shadow-xs' : 'bg-white dark:bg-stone-800 text-[#78716C] dark:text-stone-300 border border-[#E6E0D5] dark:border-stone-700'
          }`}
        >
          💍 विवाह निमन्त्रणा पत्र
        </button>
        <button
          onClick={() => setDocType('bartabandha')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            docType === 'bartabandha' ? 'bg-[#D97706] text-white shadow-xs' : 'bg-white dark:bg-stone-800 text-[#78716C] dark:text-stone-300 border border-[#E6E0D5] dark:border-stone-700'
          }`}
        >
          🕉 व्रतबन्ध / उपनयन
        </button>
        <button
          onClick={() => setDocType('certificate')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            docType === 'certificate' ? 'bg-[#D97706] text-white shadow-xs' : 'bg-white dark:bg-stone-800 text-[#78716C] dark:text-stone-300 border border-[#E6E0D5] dark:border-stone-700'
          }`}
        >
          📜 संस्कार सम्पन्न प्रमाणपत्र
        </button>
      </div>

      {/* Printable Document Sheet */}
      <div id="sanskar_document_area">
        <OmBorderFrame>
          <div className="bg-[#FFFDF7] text-amber-950 p-6 sm:p-8 space-y-6 font-serif max-w-3xl mx-auto relative overflow-hidden">
            <ReportHeader
              orgProfile={defaultOrg}
              titleNepali={
                docType === 'naamkaran' ? '॥ नामकरण संस्कार पत्रम् ॥' :
                docType === 'annaprashan' ? '॥ अन्नप्राशन (पासनी) संस्कार पत्रम् ॥' :
                docType === 'vivah' ? '॥ शुभ-विवाह निमन्त्रणा पत्रम् ॥' :
                docType === 'bartabandha' ? '॥ उपनयन (व्रतबन्ध) संस्कार पत्रम् ॥' :
                '॥ वैदिक संस्कार सम्पन्न आधिकारिक प्रमाणपत्र ॥'
              }
              subtitleNepali="श्रीगणेशाय नमः | वैदिक सनातन धर्मानुसार सम्पूर्ण विधिपूर्वक अनुष्ठित"
              clientPhotoUrl={profile.photoUrl}
              clientName={profile.name}
              showPhoto={showPhoto}
            />

            <div className="space-y-4 text-sm leading-relaxed text-amber-900 border-t border-amber-800/30 pt-4">
              <p className="text-center font-bold text-base text-amber-950">
                शुभ सम्बत् <strong>{profile.dateBS}</strong> गतेका दिन जातक <strong>{profile.name}</strong> को शुभ संस्कार कार्यक्रम बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवाद्वारा विधिपूर्वक सम्पन्न गरिएको प्रमाणित गरिन्छ।
              </p>

              <div className="bg-amber-100/70 border-2 border-amber-800/40 p-5 rounded-2xl space-y-2 text-xs shadow-inner">
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>जातकको नाम:</strong> {profile.name}</p>
                  <p><strong>ग्राहक आईडी:</strong> {profile.customerId || 'ग्राह-००१'}</p>
                  <p><strong>पिता/अभिभावक:</strong> {profile.parentName || '—'}</p>
                  <p><strong>जन्मस्थान:</strong> {profile.location?.name || '—'}</p>
                  <p><strong>कार्यक्रम मिति:</strong> {profile.dateBS}</p>
                  <p><strong>स्थान:</strong> बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा मन्दिर / पाञ्चायन कुण्ड</p>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-end text-xs font-bold text-amber-900">
                <div className="text-center space-y-1">
                  <div className="w-28 h-10 border-b border-amber-900 mx-auto" />
                  <p>आधिकारिक पुरोहित हस्ताक्षर</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-28 h-10 border-b border-amber-900 mx-auto" />
                  <p>मुख्य ज्योतिषाचार्यको छाप/हस्ताक्षर</p>
                </div>
              </div>
            </div>

            <ReportFooter orgProfile={defaultOrg} />
          </div>
        </OmBorderFrame>
      </div>
    </div>
  );
};


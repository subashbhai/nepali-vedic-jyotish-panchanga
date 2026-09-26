import React from 'react';
import { Printer, Download, Scroll } from 'lucide-react';
import { BirthDetails, LagnaInfo, PlanetPosition, PanchangaData, OrganizationProfile, AstrologerProfile } from '../types/astrology';
import { exportElementToPDF, printElement } from '../utils/pdfGenerator';
import { TipanDocument } from './TipanDocument';
import { getStoredOrgProfile } from '../db/profileStore';

interface TipanViewProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  orgProfile?: OrganizationProfile;
  astrologer?: AstrologerProfile;
}

export const TipanView: React.FC<TipanViewProps> = ({
  profile,
  lagna,
  planets,
  panchanga,
  orgProfile,
  astrologer,
}) => {
  const currentOrgProfile = orgProfile || getStoredOrgProfile();

  const handlePrint = () => {
    printElement('nepali_tipan_printable_area');
  };

  const handlePDF = async () => {
    await exportElementToPDF('nepali_tipan_printable_area', `Tipan_${profile.name}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-[#D97706]" />
            <span>नेपाली परम्परागत जन्म टिपन (Traditional Nepali Birth Tipan)</span>
          </h2>
          <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
            वैदिक विधि अनुसार तयार पारिएको प्रामाणिक जन्म टिपन पत्र
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white dark:bg-stone-800 text-[#2D241E] dark:text-stone-100 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#E6E0D5] dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#D97706]" />
            <span>प्रिन्ट गर्नुहोस्</span>
          </button>

          <button
            onClick={handlePDF}
            className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>PDF डाउनलोड</span>
          </button>
        </div>
      </div>

      {/* Printable Nepali Tipan Card */}
      <div id="nepali_tipan_printable_area">
        <TipanDocument
          profile={profile}
          lagna={lagna}
          planets={planets}
          panchanga={panchanga}
          orgProfile={currentOrgProfile}
          astrologer={astrologer}
        />
      </div>
    </div>
  );
};

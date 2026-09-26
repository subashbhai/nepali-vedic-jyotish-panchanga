import React, { useState } from 'react';
import { Settings, Building2, Save, ShieldAlert, DollarSign, Globe, Lock } from 'lucide-react';
import { PricingConfig, getStoredPricingConfig, savePricingConfig, formatNPRCurrency } from '../../../db/subscriptionStore';

export const AdminSettingsSection: React.FC = () => {
  const [pricing, setPricing] = useState<PricingConfig>(getStoredPricingConfig());
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    savePricingConfig(pricing);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>प्रणाली र संस्थागत सेटिङ्स (System Settings)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">संस्थागत प्रोफाइल, सेवा शुल्क दर, eSewa भुक्तानी खाता र प्रणाली मोड नियन्त्रण।</p>
        </div>

        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow transition-colors cursor-pointer">
          <Save className="w-4 h-4" />
          <span>{saved ? 'सुरक्षित भयो!' : 'सेटिङ्स बचत गर्नुहोस्'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Org Profile */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>संस्थागत प्रोफाइल (Organization Info)</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-stone-400 mb-1 font-bold">संस्थाको नाम (Nepali)</label>
              <input type="text" defaultValue="बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100" />
            </div>
            <div>
              <label className="block text-stone-400 mb-1 font-bold">सम्पर्क फोन</label>
              <input type="text" defaultValue="+९७७-९७६४४००५३३" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono" />
            </div>
            <div>
              <label className="block text-stone-400 mb-1 font-bold">ठेगाना</label>
              <input type="text" defaultValue="काठमाडौं, नेपाल" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100" />
            </div>
          </div>
        </div>

        {/* Pricing Rules */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>प्लेटफर्म शुल्क र कमिसन दर (Commission & Fees)</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-stone-400 mb-1 font-bold">प्लेटफर्म कमिसन दर (%)</label>
              <input
                type="number"
                value={(pricing as any).commissionPercentRate || 10}
                onChange={(e) => setPricing({ ...pricing, commissionPercentRate: Number(e.target.value) } as any)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1 font-bold">ज्योतिष सेवा आधार शुल्क (NPR)</label>
              <input
                type="number"
                value={(pricing as any).serviceRates?.jyotishConsultationNPR || 1000}
                onChange={(e) => setPricing({ ...pricing, serviceRates: { ...((pricing as any).serviceRates || {}), jyotishConsultationNPR: Number(e.target.value) } } as any)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  User 
} from 'lucide-react';
import { ProfileGender, MaritalStatus } from '../../types/vivahTypes';
import {
  NEPALI_GOTRAS,
  NEPALI_CASTES,
  NEPALI_RELIGIONS,
  NEPALI_EDUCATIONS,
  NEPALI_OCCUPATIONS
} from '../../constants/vivahConstants';

export interface FilterState {
  gender: 'ALL' | ProfileGender;
  minAge: number;
  maxAge: number;
  district: string;
  province: string;
  education: string;
  profession: string;
  maritalStatus: string;
  gotra: string;
  caste?: string;
  religion?: string;
  verifiedOnly: boolean;
  featuredOnly: boolean;
  searchQuery: string;
}

interface VivahSearchFilterProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const VivahSearchFilter: React.FC<VivahSearchFilterProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalResultsCount,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}) => {
  const handleChange = (field: keyof FilterState, value: any) => {
    onChangeFilters({ ...filters, [field]: value });
  };

  const FilterContent = (
    <div className="space-y-5 text-xs sm:text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 font-bold font-serif text-stone-900 dark:text-stone-100">
          <Filter className="w-4 h-4 text-[#D97706]" />
          <span>प्रोफाइल खोज तथा फिल्टर (Filters)</span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1 text-xs"
        >
          <RotateCcw className="w-3 h-3" /> रीसेट
        </button>
      </div>

      {/* Free Text Search */}
      <div>
        <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
          कीवर्ड खोज (Name / Profession / District)
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleChange('searchQuery', e.target.value)}
            placeholder="नाम, पेशा वा स्थान लेख्नुहोस्..."
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Gender Selection */}
      <div>
        <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
          वर वा वधू (Gender Filter)
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => handleChange('gender', 'ALL')}
            className={`py-1.5 text-center font-bold text-xs rounded-lg transition-colors ${
              filters.gender === 'ALL'
                ? 'bg-[#D97706] text-white shadow'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            सबै (All)
          </button>
          <button
            type="button"
            onClick={() => handleChange('gender', 'GROOM')}
            className={`py-1.5 text-center font-bold text-xs rounded-lg transition-colors ${
              filters.gender === 'GROOM'
                ? 'bg-[#1E3A8A] text-white shadow'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            वर (Groom)
          </button>
          <button
            type="button"
            onClick={() => handleChange('gender', 'BRIDE')}
            className={`py-1.5 text-center font-bold text-xs rounded-lg transition-colors ${
              filters.gender === 'BRIDE'
                ? 'bg-[#991B1B] text-white shadow'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            वधू (Bride)
          </button>
        </div>
      </div>

      {/* Age Range */}
      <div>
        <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 font-medium mb-1">
          <span>उमेर दायरा (Age Range):</span>
          <span className="font-bold text-[#D97706]">{filters.minAge} - {filters.maxAge} वर्ष</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={18}
            max={60}
            value={filters.minAge}
            onChange={(e) => handleChange('minAge', parseInt(e.target.value) || 18)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs"
          />
          <span className="text-stone-400">देखि</span>
          <input
            type="number"
            min={18}
            max={70}
            value={filters.maxAge}
            onChange={(e) => handleChange('maxAge', parseInt(e.target.value) || 60)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs"
          />
        </div>
      </div>

      {/* District & Province */}
      <div className="space-y-3">
        <div>
          <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
            मुख्य जिल्ला (District)
          </label>
          <select
            value={filters.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
          >
            <option value="">सबै जिल्लाहरू (All)</option>
            <option value="काठमाडौँ">काठमाडौँ</option>
            <option value="ललितपुर">ललितपुर</option>
            <option value="भक्तपुर">भक्तपुर</option>
            <option value="कास्की">कास्की (पोखरा)</option>
            <option value="चितवन">चितवन</option>
            <option value="रूपन्देही">रूपन्देही (बुटवल)</option>
            <option value="मोरङ">मोरङ (विराटनगर)</option>
            <option value="सुनसरी">सुनसरी (धरान)</option>
            <option value="बाँके">बाँके (नेपालगन्ज)</option>
          </select>
        </div>

        <div>
          <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
            वैवाहिक स्थिति (Marital Status)
          </label>
          <select
            value={filters.maritalStatus}
            onChange={(e) => handleChange('maritalStatus', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
          >
            <option value="">सबै वैवाहिक स्थिति</option>
            <option value="NEVER_MARRIED">अविवाहित (Never Married)</option>
            <option value="DIVORCED">पारपाचुके (Divorced)</option>
            <option value="WIDOWED">विदुर / विधवा (Widowed)</option>
          </select>
        </div>

        {/* Gotra Filter */}
        <div>
          <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
            गोत्र (Gotra Filter)
          </label>
          <select
            value={filters.gotra}
            onChange={(e) => handleChange('gotra', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
          >
            <option value="">सबै गोत्रहरू (All Gotras)</option>
            {NEPALI_GOTRAS.map(g => (
              <option key={g.value} value={g.value}>{g.labelNepali}</option>
            ))}
          </select>
        </div>

        {/* Caste / Community Filter */}
        <div>
          <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
            जात / समुदाय (Caste Filter)
          </label>
          <select
            value={filters.caste || ''}
            onChange={(e) => handleChange('caste', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
          >
            <option value="">सबै जात / समुदाय</option>
            <optgroup label="खस / आर्य">
              {NEPALI_CASTES.filter(c => c.category === 'Khas/Arya').map(c => (
                <option key={c.value} value={c.value}>{c.labelNepali}</option>
              ))}
            </optgroup>
            <optgroup label="नेवार समुदाय">
              {NEPALI_CASTES.filter(c => c.category === 'Newar').map(c => (
                <option key={c.value} value={c.value}>{c.labelNepali}</option>
              ))}
            </optgroup>
            <optgroup label="जनजाति तथा आदिवासी">
              {NEPALI_CASTES.filter(c => c.category === 'Janajati').map(c => (
                <option key={c.value} value={c.value}>{c.labelNepali}</option>
              ))}
            </optgroup>
            <optgroup label="मधेश / तराई समुदाय">
              {NEPALI_CASTES.filter(c => c.category === 'Madhesi/Tarai').map(c => (
                <option key={c.value} value={c.value}>{c.labelNepali}</option>
              ))}
            </optgroup>
            <optgroup label="शिल्पी तथा दलित समुदाय">
              {NEPALI_CASTES.filter(c => c.category === 'Dalit').map(c => (
                <option key={c.value} value={c.value}>{c.labelNepali}</option>
              ))}
            </optgroup>
            <optgroup label="अन्य">
              {NEPALI_CASTES.filter(c => c.category === 'Other').map(c => (
                <option key={c.value} value={c.value}>{c.labelNepali}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Religion Filter */}
        <div>
          <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
            धर्म (Religion Filter)
          </label>
          <select
            value={filters.religion || ''}
            onChange={(e) => handleChange('religion', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
          >
            <option value="">सबै धर्महरू (All Religions)</option>
            {NEPALI_RELIGIONS.map(r => (
              <option key={r.value} value={r.value}>{r.labelNepali}</option>
            ))}
          </select>
        </div>

        {/* Education Filter */}
        <div>
          <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
            उच्चतम शिक्षा (Education)
          </label>
          <select
            value={filters.education || ''}
            onChange={(e) => handleChange('education', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
          >
            <option value="">सबै शैक्षिक योग्यता (All)</option>
            {NEPALI_EDUCATIONS.map(edu => (
              <option key={edu} value={edu}>{edu}</option>
            ))}
          </select>
        </div>

        {/* Profession Filter */}
        <div>
          <label className="block text-stone-600 dark:text-stone-400 font-medium mb-1">
            पेशा / पद (Occupation)
          </label>
          <select
            value={filters.profession || ''}
            onChange={(e) => handleChange('profession', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
          >
            <option value="">सबै पेशा / पद (All)</option>
            {NEPALI_OCCUPATIONS.map(occ => (
              <option key={occ} value={occ}>{occ}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Verification Checkboxes */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
            className="w-4 h-4 text-[#D97706] rounded"
          />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> प्रमाणिक प्रोफाइल मात्र (Admin Verified Only)
          </span>
        </label>
      </div>

      {/* Result Count Badge */}
      <div className="pt-2 text-center text-xs font-bold text-stone-500">
        भेटिएका नतिजाहरू: <span className="text-[#D97706] font-extrabold">{totalResultsCount}</span> जना
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar View */}
      <div className="hidden lg:block bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm sticky top-28 h-fit w-72 shrink-0">
        {FilterContent}
      </div>

      {/* Mobile Modal Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="bg-white dark:bg-[#1E1B18] w-full max-w-xs h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
                <span className="font-bold text-base font-serif">फिल्टर छनोट</span>
                <button type="button" onClick={onCloseMobileDrawer} className="p-1">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              {FilterContent}
            </div>

            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="mt-6 w-full bg-[#D97706] text-white font-bold py-3 rounded-xl shadow text-xs"
            >
              नतिजा हेर्नुहोस् ({totalResultsCount})
            </button>
          </div>
        </div>
      )}
    </>
  );
};

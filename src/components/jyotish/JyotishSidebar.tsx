import React, { memo } from 'react';
import {
  Sparkles,
  Plus,
  HeartHandshake,
  Globe2,
  Calendar,
  Clock,
  Layers,
  Award,
  Sun,
  Search,
  BookOpen,
  FileText,
  Briefcase,
  Receipt,
  Building2,
  Zap,
  Moon,
  Compass,
  HelpCircle,
  Hash,
  Printer,
  ChevronRight
} from 'lucide-react';
import { BirthDetails, PanchangaData, YogaResult, LagnaInfo, PlanetPosition } from '../../types/astrology';
import { BirthDetailsPanel } from './BirthDetailsPanel';
import { PanchangaPanel } from './PanchangaPanel';
import { YogaPanel } from './YogaPanel';

export type JyotishSidebarTab =
  | 'prashna'         // १. प्रश्न ज्योतिष
  | 'ankajyotish'      // २. अंक ज्योतिष
  | 'kpjyotish'        // ३. केपी ज्योतिष
  | 'neemajyotish'     // ४. नेमा ज्योतिष (तिब्बती ज्योतिष)
  | 'calendar'         // ५. क्यालेन्डर
  | 'patro'            // ५. पात्रो
  | 'panchanga'        // ६. पञ्चाङ्ग
  | 'faladesh'         // ७. फलादेश
  | 'match'            // ८. कुण्डली मिलान
  | 'patrika'          // ९. पत्रिका
  | 'workspace'        // १०. जन्मकुण्डली
  | 'gochar'           // ११. ग्रह गोचर
  | 'yearly'           // १२. वार्षिक फल
  | 'dasha_fal'        // १३. दशा फल
  | 'varga'            // १४. वर्ग कुण्डली
  | 'yoga'             // १५. योग फल
  | 'nakshatra'        // १६. नक्षत्र फल
  | 'prashna_kundali'  // १७. प्रश्न कुण्डली
  | 'life_utility'     // १८. जीवन उपयोगी
  | 'report_print'     // १९. प्रतिवेदन तथा मुद्रण
  | 'consultations'    // २०. परामर्श रेकर्ड
  | 'receipts'         // २१. शुल्क रसिद
  | 'branding'         // २२. कार्यालय सेटिङ
  // Additional secondary subtabs for compatibility:
  | 'profiles'
  | 'rashifal'
  | 'muhurta'
  | 'vastu'
  | 'ai_assistant'
  | 'aarje';

interface JyotishSidebarProps {
  activeSidebarTab: JyotishSidebarTab;
  onSelectSidebarTab: (tab: JyotishSidebarTab) => void;
  onNewProfile: () => void;
  onQuickAccess: (type: string) => void;
  totalProfilesCount: number;
  profile?: BirthDetails;
  panchanga?: PanchangaData;
  yogas?: YogaResult[];
  lagna?: LagnaInfo;
  planets?: PlanetPosition[];
  onEditProfile?: () => void;
  onPrintReport?: () => void;
}

export const JYOTISH_ALL_SUBMENUS: Array<{ 
  id: JyotishSidebarTab; 
  label: string; 
  number: string;
  icon: React.FC<{ className?: string }>; 
  category?: string;
}> = [
  { id: 'workspace', number: '१०', label: 'जन्मकुण्डली', icon: Sparkles, category: 'कुण्डली तथा गणना' },
  { id: 'prashna', number: '०१', label: 'प्रश्न ज्योतिष', icon: HelpCircle, category: 'अन्य फलादेश' },
  { id: 'ankajyotish', number: '०२', label: 'अंक ज्योतिष', icon: Hash, category: 'अन्य फलादेश' },
  { id: 'kpjyotish', number: '०३', label: 'केपी ज्योतिष', icon: Compass, category: 'अन्य फलादेश' },
  { id: 'neemajyotish', number: '०४', label: 'नेमा ज्योतिष', icon: Compass, category: 'अन्य फलादेश' },
  { id: 'calendar', number: '०४', label: 'क्यालेन्डर', icon: Calendar, category: 'पञ्चाङ्ग र काल' },
  { id: 'panchanga', number: '०५', label: 'पञ्चाङ्ग', icon: Sun, category: 'पञ्चाङ्ग र काल' },
  { id: 'faladesh', number: '०७', label: 'फलादेश', icon: Sparkles, category: 'फल तथा विश्लेषण' },
  { id: 'gochar', number: '११', label: 'ग्रह गोचर', icon: Globe2, category: 'फल तथा विश्लेषण' },
  { id: 'yearly', number: '१२', label: 'वार्षिक फल', icon: Calendar, category: 'फल तथा विश्लेषण' },
  { id: 'dasha_fal', number: '१३', label: 'दशा फल', icon: Clock, category: 'फल तथा विश्लेषण' },
  { id: 'varga', number: '१४', label: 'वर्ग कुण्डली', icon: Layers, category: 'फल तथा विश्लेषण' },
  { id: 'yoga', number: '१५', label: 'योग फल', icon: Award, category: 'फल तथा विश्लेषण' },
  { id: 'nakshatra', number: '१६', label: 'नक्षत्र फल', icon: Sun, category: 'फल तथा विश्लेषण' },
  { id: 'match', number: '०८', label: 'कुण्डली मिलान', icon: HeartHandshake, category: 'फल तथा विश्लेषण' },
  { id: 'prashna_kundali', number: '१७', label: 'प्रश्न कुण्डली', icon: Search, category: 'अन्य फलादेश' },
  { id: 'life_utility', number: '१८', label: 'जीवन उपयोगी', icon: BookOpen, category: 'उपयोगी ज्ञान' },
  { id: 'report_print', number: '१९', label: 'प्रतिवेदन तथा मुद्रण', icon: Printer, category: 'कार्यालय व्यवस्थापन' },
  { id: 'consultations', number: '२०', label: 'परामर्श रेकर्ड', icon: Briefcase, category: 'कार्यालय व्यवस्थापन' },
  { id: 'receipts', number: '२१', label: 'शुल्क रसिद', icon: Receipt, category: 'कार्यालय व्यवस्थापन' },
  { id: 'branding', number: '२२', label: 'कार्यालय सेटिङ', icon: Building2, category: 'कार्यालय व्यवस्थापन' },
];

export const QUICK_ACCESS_ITEMS = [
  { id: 'panchanga', label: 'आजको पञ्चाङ्ग', icon: Sun },
  { id: 'rahukal', label: 'आजको राहुकाल', icon: Zap },
  { id: 'shubhamuhurta', label: 'शुभ समय', icon: Clock },
  { id: 'chaughadiya', label: 'चौघडिया', icon: Compass },
  { id: 'tithi', label: 'तिथि विवरण', icon: Calendar },
  { id: 'moonrashi', label: 'चन्द्रमा राशि', icon: Moon },
];

export const JyotishSidebar: React.FC<JyotishSidebarProps> = memo(({
  activeSidebarTab,
  onSelectSidebarTab,
  onNewProfile,
  onQuickAccess,
  totalProfilesCount,
  profile,
  panchanga,
  yogas,
  lagna,
  planets,
  onEditProfile,
  onPrintReport,
}) => {
  return (
    <aside className="w-full space-y-3.5 shrink-0 h-fit self-start">

      {/* Block 1: जन्म विवरण */}
      {profile && (
        <BirthDetailsPanel
          profile={profile}
          onEdit={onEditProfile || onNewProfile}
          onPrint={onPrintReport || (() => {})}
        />
      )}

      {/* Block 2: जन्मकालीन पञ्चाङ्ग */}
      {panchanga && (
        <div className="pt-1">
          <PanchangaPanel
            panchanga={panchanga}
            profile={profile}
            lagna={lagna}
            planets={planets}
            title="जन्मकालीन पञ्चाङ्ग"
          />
        </div>
      )}

      {/* Block 3: शुभ तथा विशिष्ट ज्योतिषीय योगहरू */}
      <div className="pt-1">
        <YogaPanel yogas={yogas} />
      </div>
    </aside>
  );
});

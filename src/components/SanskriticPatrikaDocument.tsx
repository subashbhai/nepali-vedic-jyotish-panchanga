import React from 'react';
import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  PatrikaSubCategory, 
  OrganizationProfile, 
  AstrologerProfile 
} from '../types/astrology';
import { GaneshaHeaderCenter } from './GaneshaHeaderCenter';
import { OmBorderFrame } from './CheenaDocument';
import { 
  analyzeVivahAstrology, 
  analyzeBartabandhaAstrology, 
  analyzeGrihaPraveshAstrology,
  SanskriticAstrologyAnalysis 
} from '../utils/sanskritiEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { Sparkles, Calendar, Heart, Home, BookOpen, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface SanskriticPatrikaDocumentProps {
  subCategory: PatrikaSubCategory;
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  orgProfile: OrganizationProfile;
  astrologer?: AstrologerProfile;
  hideParentPhone?: boolean;
}

export const SanskriticPatrikaDocument: React.FC<SanskriticPatrikaDocumentProps> = ({
  subCategory,
  profile,
  lagna,
  planets,
  panchanga,
  orgProfile,
  astrologer,
  hideParentPhone = false,
}) => {
  // Determine Analysis based on Subcategory
  let analysis: SanskriticAstrologyAnalysis;

  if (subCategory === 'vivah') {
    analysis = analyzeVivahAstrology(profile, lagna, planets, panchanga);
  } else if (subCategory === 'bartabandha' || subCategory === 'upanayan') {
    analysis = analyzeBartabandhaAstrology(profile, lagna, planets, panchanga);
  } else if (subCategory === 'grihapravesh') {
    analysis = analyzeGrihaPraveshAstrology(profile, lagna, planets, panchanga);
  } else {
    // Default fallback to Vivah or General Patrika
    analysis = analyzeVivahAstrology(profile, lagna, planets, panchanga);
  }

  // Get Category Badge Icon & Title
  const getCategoryTheme = () => {
    switch (subCategory) {
      case 'vivah':
        return {
          icon: <Heart className="w-5 h-5 text-red-700" />,
          title: 'शुभ-विवाह संस्कार मुहूर्त तथा ज्योतिष विचार पत्रम्',
          bgHeader: 'bg-red-50 border-red-700 text-red-900',
          accentBorder: 'border-red-700',
          tagBg: 'bg-red-100 text-red-900 border-red-300',
        };
      case 'bartabandha':
      case 'upanayan':
        return {
          icon: <BookOpen className="w-5 h-5 text-amber-800" />,
          title: 'उपनयन (व्रतबन्ध) संस्कार शुभ मुहूर्त तथा ज्योतिष विचार पत्रम्',
          bgHeader: 'bg-amber-50 border-amber-800 text-amber-950',
          accentBorder: 'border-amber-800',
          tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'grihapravesh':
        return {
          icon: <Home className="w-5 h-5 text-emerald-800" />,
          title: 'वास्तु पूजन तथा नूतन गृहप्रवेश शुभ मुहूर्त पत्रम्',
          bgHeader: 'bg-emerald-50 border-emerald-800 text-emerald-950',
          accentBorder: 'border-emerald-800',
          tagBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-red-700" />,
          title: 'वैदिक संस्कार तथा शुभ मुहूर्त विचार पत्रम्',
          bgHeader: 'bg-amber-50 border-amber-800 text-amber-950',
          accentBorder: 'border-amber-800',
          tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <OmBorderFrame>
      <div className="bg-[#FFFDF7] text-stone-900 p-4 sm:p-8 space-y-6 sm:space-y-7 font-serif max-w-4xl mx-auto leading-relaxed">
        
        {/* 1. CENTERED LORD GANESHA HEADER */}
        <GaneshaHeaderCenter
          orgName={orgProfile.name}
          orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
          title={analysis.eventTitleNepali}
          subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga?.dateBS || profile?.dateBS || '')} | ${panchanga?.samvatsara || 'सिद्धार्थी'} संवत्सर`}
          primaryShloka={analysis.primaryShloka}
          secondaryShloka={analysis.secondaryShloka}
        />

        {/* 2. JATAK & FAMILY PROFILE SECTION */}
        <div className="border-2 border-red-800/80 p-5 rounded-xl bg-amber-50/80 space-y-4 text-sm sm:text-base shadow-xs">
          <h3 className="font-bold text-red-900 border-b-2 border-red-700/60 pb-2 text-base sm:text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-red-700" />
              ॥ जातक तथा पारिवारिक मुख्य परिचय ॥
            </span>
            <span className="text-xs sm:text-sm text-stone-800 font-mono bg-white px-2.5 py-1 rounded border border-amber-400 font-bold">
              क्रमाङ्क: {profile.jatakSerialNo || profile.customerId || 'जातक-००१'}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed">
            {/* Left: Birth Info */}
            <div className="border-r-0 md:border-r-2 border-amber-700/40 pr-0 md:pr-5 space-y-1.5">
              <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-extrabold text-base sm:text-lg">{profile.name}</span></p>
              <p><strong>लिङ्ग:</strong> {profile.gender === 'male' ? 'पुरुष' : 'महिला'}</p>
              <p><strong>जन्म मिति (वि.सं.):</strong> <span className="font-bold text-red-900">{toDevanagariNumerals(profile.dateBS)}</span></p>
              <p><strong>जन्म समय:</strong> {toDevanagariNumerals(profile.time)}</p>
              <p><strong>जन्म स्थान:</strong> {profile.location?.name || '—'}</p>
              <p><strong>लग्न / चन्द्र राशि:</strong> <span className="font-bold">{lagna?.rashiName || 'मेष'} / {panchanga?.moonRashi || 'मेष'}</span></p>
              <p><strong>जन्मनक्षत्र:</strong> <span className="font-bold text-amber-950">{panchanga?.nakshatra?.name || 'अश्विनी'} (पाद {toDevanagariNumerals(panchanga?.nakshatra?.pada ?? 1)})</span></p>
            </div>

            {/* Right: Lineage Info */}
            <div className="space-y-1.5">
              <p><strong>बाबुको नाम:</strong> {profile.fatherDetails?.name || profile.parentName || '—'}</p>
              <p><strong>आमाको नाम:</strong> {profile.motherDetails?.name || '—'}</p>
              <p><strong>मुख्य गोत्र (बाबुको):</strong> <span className="font-bold text-amber-950 text-base">{profile.fatherDetails?.gotra || '—'}</span></p>
              <p><strong>मायती गोत्र (आमाको):</strong> {profile.motherDetails?.gotra || '—'}</p>
              <p><strong>वंश / दर्जा:</strong> {[profile.familyHistory?.childOrder || 'द्वितिय', profile.familyHistory?.childType || (profile.gender === 'male' ? 'पुत्र' : 'पुत्री')].filter(Boolean).join(' ')}</p>
              <p><strong>कुलदेवता:</strong> {profile.familyHistory?.kuldevata || '—'}</p>
              <p><strong>स्थायी ठेगाना:</strong> {profile.location?.district ? `${profile.location.district}, ${profile.location.country || 'नेपाल'}` : profile.location?.name || '—'}</p>
              {!hideParentPhone && profile.fatherDetails?.phone && (
                <p><strong>सम्पर्क फोन:</strong> {toDevanagariNumerals(profile.fatherDetails.phone)}</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. ASTROLOGICAL AGE & DATE ANALYSIS BOX (ग्रह-दशा विचार गरी उमेर तथा मिति निर्धारण) */}
        <div className="border-2 border-red-800 p-5 rounded-xl bg-gradient-to-br from-amber-50 via-white to-amber-100/90 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-red-700/60 pb-2 flex-wrap gap-2">
            <h3 className="font-bold text-red-900 text-base sm:text-lg flex items-center gap-2">
              {theme.icon}
              <span>॥ ग्रह-दशा विचार गरी {subCategory === 'vivah' ? 'विवाह' : subCategory === 'grihapravesh' ? 'गृहप्रवेश' : 'व्रतबन्ध'} जुर्ने उमेर तथा शुभ-मुहूर्त विश्लेषण ॥</span>
            </h3>
            <span className="text-xs sm:text-sm font-bold text-red-900 bg-red-100 px-3 py-1 rounded-full border border-red-300">
              शास्त्रोक्त विचार
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
            {/* Box 1: Favorable Age Range */}
            <div className="bg-amber-100/90 border-2 border-amber-400 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold border-b border-amber-300 pb-1 text-sm sm:text-base">
                <Clock className="w-4 h-4 text-red-700 shrink-0" />
                <span>शास्त्रोक्त शुभ उमेर</span>
              </div>
              <p className="font-extrabold text-base sm:text-lg text-red-950 pt-0.5">{analysis.recommendedAgeRangeNepali}</p>
              <p className="text-xs sm:text-sm text-stone-800">जातकको वर्तमान उमेर: <strong>{analysis.currentAgeNepali}</strong></p>
              <p className="text-xs sm:text-sm text-stone-900 pt-1 leading-relaxed">{analysis.ageAssessmentNepali}</p>
            </div>

            {/* Box 2: Graha-Dasha & Transit Analysis */}
            <div className="bg-amber-100/90 border-2 border-amber-400 p-4 rounded-xl space-y-2 md:col-span-2">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold border-b border-amber-300 pb-1 text-sm sm:text-base">
                <ShieldCheck className="w-4 h-4 text-red-700 shrink-0" />
                <span>ग्रह दशा तथा गोचर बल स्थिति</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-900 leading-relaxed pt-0.5">{analysis.grahaDashaAnalysisNepali}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs sm:text-sm">
                <div className="bg-white/90 p-2 rounded border border-amber-300">
                  <strong className="text-red-900">गुरु बल:</strong> {analysis.jupiterStrengthNepali}
                </div>
                <div className="bg-white/90 p-2 rounded border border-amber-300">
                  <strong className="text-red-900">शुक्र बल:</strong> {analysis.venusStrengthNepali}
                </div>
                <div className="bg-white/90 p-2 rounded border border-amber-300">
                  <strong className="text-red-900">सूर्य बल:</strong> {analysis.sunStrengthNepali}
                </div>
              </div>
            </div>
          </div>

          {/* Favorable Months, Nakshatras & Tithis Table */}
          <div className="bg-white border-2 border-amber-300 p-4 rounded-xl text-xs sm:text-sm space-y-3">
            <h4 className="font-bold text-red-900 border-b border-amber-300 pb-1.5 flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4 text-red-700" />
              <span>शुभ-मुहूर्त जुर्ने महिना, नक्षत्र, तिथि तथा लग्न तालिका</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-300 space-y-1">
                <p className="font-bold text-amber-950 border-b border-amber-200 pb-0.5">शुभ महिनाहरू:</p>
                <p className="text-stone-900">{analysis.favorableMonthsNepali.join(', ')}</p>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-300 space-y-1">
                <p className="font-bold text-amber-950 border-b border-amber-200 pb-0.5">शुभ नक्षत्रहरू:</p>
                <p className="text-stone-900">{analysis.favorableNakshatrasNepali.join(', ')}</p>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-300 space-y-1">
                <p className="font-bold text-amber-950 border-b border-amber-200 pb-0.5">शुभ तिथि तथा वार:</p>
                <p className="text-stone-900">तिथि: {analysis.favorableTithisNepali.slice(0, 5).join(', ')} आदि | वार: {analysis.favorableDaysNepali.join(', ')}</p>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-300 space-y-1">
                <p className="font-bold text-amber-950 border-b border-amber-200 pb-0.5">शुभ लग्नहरू:</p>
                <p className="text-stone-900">{analysis.favorableLagnasNepali.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SHASTRIYA SHLOKA & VEDIC MANTRAS BOX */}
        <div className="border-2 border-red-700/60 p-5 rounded-xl bg-red-50/50 space-y-3 text-sm sm:text-base">
          <h3 className="font-bold text-red-900 border-b-2 border-red-300 pb-1.5 text-base sm:text-lg flex items-center justify-between">
            <span>॥ वैदिक शास्त्रीय प्रमाण तथा मङ्गल श्लोक ॥</span>
            <span className="text-xs text-red-800 italic font-semibold">सनातन शास्त्रोक्त वचन</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-white/95 p-4 rounded-xl border border-red-300 shadow-2xs space-y-1.5">
              <p className="font-bold text-red-900 text-sm sm:text-base leading-relaxed">{analysis.secondaryShloka}</p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic border-t border-amber-200 pt-1">
                भावार्थ: सम्पूर्ण मङ्गलका आधार भगवान् श्रीहरि, गायत्री माता तथा वास्तुदेवताले जातकको यस पवित्र संस्कार कार्यमा सर्वदा कल्याण र सिद्धि प्रदान गरून्।
              </p>
            </div>

            {analysis.tertiaryShloka && (
              <div className="bg-white/95 p-4 rounded-xl border border-red-300 shadow-2xs space-y-1.5">
                <p className="font-bold text-red-900 text-sm sm:text-base leading-relaxed">{analysis.tertiaryShloka}</p>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic border-t border-amber-200 pt-1">
                  भावार्थ: वैदिक परम्परा अनुसार उचित उमेर, वंश, विद्या, सुसंस्कार र शुभ मुहूर्तमा सम्पन्न गरिएको अनुष्ठानले वंश वृद्धि, सुख र मोक्ष प्रदान गर्दछ।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 5. ASTROLOGER OVERALL RECOMMENDATION */}
        <div className="border-2 border-amber-800/80 p-5 rounded-xl bg-amber-100/70 text-sm sm:text-base space-y-2">
          <h4 className="font-bold text-amber-950 flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="w-5 h-5 text-red-700 shrink-0" />
            <span>मुख्य ज्योतिषाचार्यको विशेष निर्णय तथा परामर्श</span>
          </h4>
          <p className="text-stone-950 leading-relaxed font-semibold pt-1">
            {analysis.overallRecommendationNepali}
          </p>
        </div>

        {/* 6. PLANETARY POSITIONS TABLE */}
        <div className="space-y-3 text-xs sm:text-sm">
          <h3 className="font-bold text-red-900 border-b-2 border-red-300 pb-1.5 text-base sm:text-lg">
            ॥ जातक जन्मकालीन स्पष्ट ग्रह स्थिति तालिका ॥
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-2 border-red-800 border-collapse">
              <thead>
                <tr className="bg-amber-200 text-amber-950 font-bold border-b-2 border-red-800 text-xs sm:text-sm">
                  <th className="p-2 border-r border-red-800">ग्रह</th>
                  <th className="p-2 border-r border-red-800">राशि</th>
                  <th className="p-2 border-r border-red-800">अंश-कला</th>
                  <th className="p-2 border-r border-red-800">नक्षत्र</th>
                  <th className="p-2 border-r border-red-800">पाद</th>
                  <th className="p-2 border-r border-red-800">भाव</th>
                  <th className="p-2">अवस्था</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-red-800 bg-amber-100/80 font-bold text-xs sm:text-sm">
                  <td className="p-2 border-r border-red-800">लग्न</td>
                  <td className="p-2 border-r border-red-800">{lagna.rashiName}</td>
                  <td className="p-2 border-r border-red-800">{lagna.formattedDegree}</td>
                  <td className="p-2 border-r border-red-800">{lagna.nakshatraName}</td>
                  <td className="p-2 border-r border-red-800">{toDevanagariNumerals(lagna.pada)}</td>
                  <td className="p-2 border-r border-red-800">१</td>
                  <td className="p-2">उदय</td>
                </tr>
                {planets.map((p) => (
                  <tr key={p.id} className="border-b border-red-800/60 text-xs sm:text-sm">
                    <td className="p-2 border-r border-red-800 font-bold">{p.name}</td>
                    <td className="p-2 border-r border-red-800">{p.rashiName}</td>
                    <td className="p-2 border-r border-red-800">{p.formattedDegree}</td>
                    <td className="p-2 border-r border-red-800">{p.nakshatraName}</td>
                    <td className="p-2 border-r border-red-800">{toDevanagariNumerals(p.pada)}</td>
                    <td className="p-2 border-r border-red-800">{toDevanagariNumerals(p.bhava)}</td>
                    <td className="p-2">{p.dignity} {p.isRetrograde ? '(वक्री)' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. FOOTER & ASTROLOGER SIGNATURE BLOCK */}
        <div className="pt-8 border-t-2 border-red-800 flex items-center justify-between text-xs sm:text-sm text-stone-900 leading-relaxed">
          <div className="space-y-1">
            <p><strong>प्रमाणित गर्ने ज्योतिषाचार्य:</strong> {astrologer?.name || orgProfile.name}</p>
            <p><strong>उपाधि / पद:</strong> {astrologer?.title || 'वरिष्ठ ज्योतिषाचार्य'}</p>
            <p><strong>सम्पर्क फोन:</strong> {toDevanagariNumerals(astrologer?.contactPhone || orgProfile.phone)}</p>
            <p><strong>संस्था:</strong> {orgProfile.name}</p>
          </div>

          <div className="text-center space-y-1.5">
            <div className="h-14 w-40 border-b border-dashed border-red-800 flex items-center justify-center italic text-xs text-stone-600">
              {astrologer?.signatureUrl ? (
                <img src={astrologer.signatureUrl} alt="हस्ताक्षर" className="h-full object-contain" />
              ) : (
                'हस्ताक्षर / आधिकारिक छाप'
              )}
            </div>
            <p className="font-bold text-red-900 text-sm sm:text-base">{astrologer?.name || orgProfile.name}</p>
          </div>
        </div>

      </div>
    </OmBorderFrame>
  );
};

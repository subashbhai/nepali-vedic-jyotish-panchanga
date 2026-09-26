import React, { useState } from 'react';
import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  OrganizationProfile, 
  AstrologerProfile 
} from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { generateDivisionalChart } from '../utils/astroCalculations';
import {
  formatPlanetDegreesMinutes,
  getPlanetStatusSuffix,
  calculateSinglePlanetAspects,
  calculateAspectArrowPath,
  NORTH_INDIAN_HOUSE_GEO,
  CalculatedAspectItem
} from '../utils/aspectEngine';
import { VedicKalash } from './common/VedicKalash';

interface TipanDocumentProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  orgProfile: OrganizationProfile;
  astrologer?: AstrologerProfile;
}

// Helper to convert planet names to traditional 2-letter Devanagari abbreviations
function getPlanetAbbr(name: string): string {
  switch (name) {
    case 'सूर्य': return 'सू';
    case 'चन्द्र': return 'च';
    case 'मंगल':
    case 'मङ्गल': return 'मं';
    case 'बुध': return 'बु';
    case 'गुरु':
    case 'वृहस्पति': return 'बृ';
    case 'शुक्र': return 'शु';
    case 'शनि': return 'श';
    case 'राहु': return 'रा';
    case 'केतु': return 'के';
    case 'लग्न': return 'ल';
    default: return name.slice(0, 2);
  }
}

// North Indian Diamond Chart component for Tipan
const TipanLagnaChart: React.FC<{
  lagna: LagnaInfo;
  planets: PlanetPosition[];
}> = ({ lagna, planets }) => {
  const d1Chart = generateDivisionalChart('D1', lagna, planets);
  const [activePlanet, setActivePlanet] = useState<{ planet: PlanetPosition; houseNumber: number } | null>(null);

  const activeAspects: CalculatedAspectItem[] = activePlanet
    ? calculateSinglePlanetAspects(activePlanet.planet, activePlanet.houseNumber, d1Chart.houses)
    : [];

  const activeTargetHouses = activeAspects.map((a) => a.targetHouseNumber);

  const retroPlanets = planets.filter((p) => p.isRetrograde);
  const combustPlanets = planets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className="relative w-full aspect-square max-w-[280px] mx-auto bg-white border-2 border-stone-800 p-1 shadow-sm select-none"
        onClick={() => setActivePlanet(null)}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-stone-900 fill-none stroke-[2]">
          <defs>
            <marker
              id="tipan-arrowhead"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
            </marker>
          </defs>

          {/* Outer Box */}
          <rect x="5" y="5" width="390" height="390" className="stroke-stone-900 stroke-[3]" />
          {/* Diagonals */}
          <line x1="5" y1="5" x2="395" y2="395" />
          <line x1="395" y1="5" x2="5" y2="395" />
          {/* Inner Diamond */}
          <polygon points="200,5 395,200 200,395 5,200" className="stroke-stone-900 stroke-[3]" />

          {/* Highlight Aspect Target Houses */}
          {activeTargetHouses.map((tgtHouseNum) => {
            const geo = NORTH_INDIAN_HOUSE_GEO[tgtHouseNum];
            if (!geo) return null;
            return (
              <polygon
                key={`tgt-${tgtHouseNum}`}
                points={geo.polygonPoints}
                className="fill-amber-400/25 stroke-amber-600 stroke-[2.5]"
              />
            );
          })}

          {/* Draw Aspect Arrows on Hover */}
          {activePlanet && activeAspects.map((asp, idx) => {
            const pathInfo = calculateAspectArrowPath(
              asp.sourceHouseNumber,
              asp.targetHouseNumber,
              idx,
              activeAspects.length
            );
            if (!pathInfo) return null;

            return (
              <g key={`arrow-${idx}`}>
                <path
                  d={pathInfo.pathD}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeOpacity="0.5"
                />
                <path
                  d={pathInfo.pathD}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  markerEnd="url(#tipan-arrowhead)"
                />
              </g>
            );
          })}
        </svg>

        {/* House Overlays */}
        {d1Chart.houses.map((house) => {
          const geo = NORTH_INDIAN_HOUSE_GEO[house.houseNumber];
          if (!geo) return null;

          const isTarget = activeTargetHouses.includes(house.houseNumber);

          return (
            <div
              key={house.houseNumber}
              className={`absolute text-center transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-transform ${
                isTarget ? 'scale-105 z-10' : ''
              }`}
              style={{ left: `${(geo.center.x / 400) * 100}%`, top: `${(geo.center.y / 400) * 100}%` }}
            >
              {/* Rashi Number in Blue */}
              <span className="text-[11px] font-extrabold text-blue-700 leading-none">
                {toDevanagariNumerals(house.rashiId)}
              </span>

              {/* Planets in Red - Only Graha and Degree */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 mt-0.5 max-w-[80px]">
                {house.planets.map((p) => {
                  const isSelected = activePlanet?.planet.id === p.id && activePlanet.houseNumber === house.houseNumber;
                  const degStr = formatPlanetDegreesMinutes(p);

                  return (
                    <button
                      key={p.id}
                      onMouseEnter={() => setActivePlanet({ planet: p, houseNumber: house.houseNumber })}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) setActivePlanet(null);
                        else setActivePlanet({ planet: p, houseNumber: house.houseNumber });
                      }}
                      title={`${p.name} ${degStr} ${getPlanetStatusSuffix(p)}`}
                      className={`text-red-700 font-bold text-[10px] leading-tight px-0.5 rounded cursor-pointer transition-all ${
                        isSelected ? 'bg-amber-200 ring-1 ring-amber-500 scale-110 z-20 font-black' : 'hover:bg-amber-50'
                      }`}
                    >
                      <span>{getPlanetAbbr(p.name)}</span>
                      <span className="text-[8px] text-stone-700 ml-0.5 font-mono font-normal">{degStr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Swastika/Om Border Frame
const SwastikaBorderFrame: React.FC<{ children: React.ReactNode; orgName: string }> = ({ children, orgName }) => {
  const swastikaTopBottom = Array.from({ length: 22 });
  const swastikaSides = Array.from({ length: 30 });

  return (
    <div className="relative w-full bg-[#FFFDF7] text-stone-900 border-4 border-red-900 p-2 sm:p-3.5 my-3 font-serif rounded-sm shadow-2xl print:m-0 print:border-4 print:p-2">
      {/* Top Om/Swastika Row */}
      <div className="flex justify-between items-center text-red-900 dark:text-red-800 text-sm sm:text-base md:text-lg font-black px-1 select-none overflow-hidden h-6 leading-none">
        {swastikaTopBottom.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">{i % 2 === 0 ? 'ॐ' : '卐'}</span>
        ))}
      </div>

      <div className="flex">
        {/* Left Om/Swastika Column */}
        <div className="flex flex-col justify-between items-center text-red-900 dark:text-red-800 text-sm sm:text-base md:text-lg font-black py-1 pr-1.5 select-none w-6 leading-none">
          {swastikaSides.map((_, i) => (
            <span key={i} className="font-black scale-110">{i % 2 === 0 ? 'ॐ' : '卐'}</span>
          ))}
        </div>

        {/* Main Inner Content with double frame */}
        <div className="flex-1 border-2 border-amber-700 p-1 bg-amber-50/20">
          <div className="border-2 border-red-700 p-4 sm:p-6 md:p-8 bg-[#FFFDF7] min-h-[1050px] flex flex-col justify-between shadow-2xs">
            {children}
          </div>
        </div>

        {/* Right Om/Swastika Column */}
        <div className="flex flex-col justify-between items-center text-red-900 dark:text-red-800 text-sm sm:text-base md:text-lg font-black py-1 pl-1.5 select-none w-6 leading-none">
          {swastikaSides.map((_, i) => (
            <span key={i} className="font-black scale-110">{i % 2 === 0 ? 'ॐ' : '卐'}</span>
          ))}
        </div>
      </div>

      {/* Bottom Om/Swastika Row */}
      <div className="flex justify-between items-center text-red-900 dark:text-red-800 text-sm sm:text-base md:text-lg font-black px-1 select-none overflow-hidden h-6 relative leading-none">
        {swastikaTopBottom.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">{i % 2 === 0 ? 'ॐ' : '卐'}</span>
        ))}
        <div className="absolute right-2 bottom-0 text-[10px] text-stone-600 font-sans font-semibold bg-[#FFFDF7] px-1">
          Powered by: {orgName || 'JyotishPunja'}
        </div>
      </div>
    </div>
  );
};

export const TipanDocument: React.FC<TipanDocumentProps> = ({
  profile,
  lagna,
  planets,
  panchanga,
  orgProfile,
  astrologer,
}) => {
  const bsDate = profile.dateBS || '२०७८/९/८';

  return (
    <div className="max-w-4xl mx-auto font-serif text-stone-900">
      <SwastikaBorderFrame orgName={orgProfile.name}>
        
        {/* TOP SECTION: Ganesha Graphic + Shloka (Left) & Birth Details Table (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b border-stone-300 pb-3">
          
          {/* Top Left: 2 Kalash on sides and Lord Ganesha on Lotus in the middle */}
          <div className="md:col-span-5 flex flex-col items-center text-center space-y-1 pt-0.5">
            <div className="flex items-center justify-center gap-2">
              <VedicKalash size={50} />
              <img
                src="/assets/deities/ganesha_lotus.jpg"
                alt="भगवान् श्री गणेश"
                className="w-20 h-20 object-contain select-none"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/deities/ganesha.jpg';
                }}
              />
              <VedicKalash size={50} />
            </div>

            {/* Navagraha Mangala Shloka */}
            <div className="text-[10px] sm:text-[11px] font-bold text-[#CC0000] leading-snug px-1 space-y-0.5 font-serif">
              <p className="font-black text-xs tracking-wider">श्री मङ्गलमूर्तये नमः</p>
              <p>आदित्याद्या ग्रहाः सर्वे सनक्षत्राः सराशयः ।</p>
              <p>कुर्वन्तु मङ्गलं तस्य यस्यैषा जन्मपत्रिका ॥</p>
            </div>
          </div>

          {/* Top Right: Birth Details Box ("जन्म विवरण") */}
          <div className="md:col-span-7 space-y-1.5">
            <div className="flex justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-6 py-1 rounded-full shadow-sm">
                जन्म विवरण
              </span>
            </div>

            <div className="overflow-hidden border border-stone-800 text-xs rounded-sm bg-white">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-stone-300">
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50 w-1/4">नाम</td>
                    <td className="p-1.5 font-bold text-red-700 w-1/4">{profile.name}</td>
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50 w-1/4">लिङ्ग</td>
                    <td className="p-1.5 w-1/4">{profile.gender === 'male' ? 'पुरुष' : 'महिला'}</td>
                  </tr>
                  <tr className="border-b border-stone-300">
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">बाबुको नाम</td>
                    <td className="p-1.5 border-r border-stone-300 font-semibold">{profile.fatherDetails?.name || profile.parentName || '—'} {profile.fatherDetails?.occupation ? `(${profile.fatherDetails.occupation})` : ''}</td>
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">आमाको नाम</td>
                    <td className="p-1.5 font-semibold">{profile.motherDetails?.name || '—'} {profile.motherDetails?.occupation ? `(${profile.motherDetails.occupation})` : ''}</td>
                  </tr>
                  <tr className="border-b border-stone-300">
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">गोत्र</td>
                    <td className="p-1.5 border-r border-stone-300 font-bold text-red-700">{profile.fatherDetails?.gotra || '—'} {profile.motherDetails?.gotra ? `(मायती: ${profile.motherDetails.gotra})` : ''}</td>
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">सन्तान क्रम / दर्जा</td>
                    <td className="p-1.5 font-bold text-red-700">
                      {[profile.familyHistory?.childOrder || 'द्वितिय', profile.familyHistory?.childType || (profile.gender === 'male' ? 'पुत्र' : 'पुत्री')].filter(Boolean).join(' ')}
                    </td>
                  </tr>
                  <tr className="border-b border-stone-300">
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">गाउँ / टोल / शहर</td>
                    <td className="p-1.5 border-r border-stone-300">{[profile?.location?.tole, profile?.location?.localBody, profile?.location?.name].filter(Boolean).join(', ') || '—'}</td>
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">जिल्ला / प्रदेश / देश</td>
                    <td className="p-1.5">{[profile?.location?.district, profile?.location?.province, profile?.location?.country || 'नेपाल'].filter(Boolean).join(', ')}</td>
                  </tr>
                  <tr className="border-b border-stone-300">
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">जन्म मिति (वि.सं.)</td>
                    <td className="p-1.5 border-r border-stone-300 font-bold text-red-700" colSpan={3}>{toDevanagariNumerals(bsDate)}</td>
                  </tr>
                  <tr className="border-b border-stone-300">
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">स्थानीय जन्म समय</td>
                    <td className="p-1.5 border-r border-stone-300 font-semibold">{toDevanagariNumerals(profile.time)}</td>
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">मानक समय (UTC)</td>
                    <td className="p-1.5">+५:४५ (04:42:06)</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">अक्षांश</td>
                    <td className="p-1.5 border-r border-stone-300">{toDevanagariNumerals(profile?.location?.latitude || '28N41')}</td>
                    <td className="p-1.5 font-bold border-r border-stone-300 bg-stone-50">देशान्तर</td>
                    <td className="p-1.5">{toDevanagariNumerals(profile?.location?.longitude || '80E36')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3">
          
          {/* LEFT COLUMN (Panchanga, Avakahada, Vimshottari, Yogini) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Panchanga Box */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-5 py-0.5 rounded-full shadow-sm">
                  पञ्चाङ्ग
                </span>
              </div>
              <div className="text-[11px] font-bold text-center text-red-700 bg-amber-100/70 py-0.5 border border-red-200 rounded-sm">
                चान्द्रमानेन: {(panchanga as any)?.monthNameNepali || 'पौष'}, {panchanga?.tithi?.paksha || 'शुक्ल'} पक्ष | सौरमानेन: {(panchanga as any)?.monthNameNepali || 'पौष'}
              </div>

              <div className="border border-stone-800 text-[11px] rounded-sm bg-white overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">सूर्योदय कालीन तिथी</td>
                      <td className="p-1 border-r border-stone-300">{panchanga?.tithi?.name || 'प्रतिपदा'}</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">जन्म कालीन तिथी</td>
                      <td className="p-1 text-red-700 font-bold">{panchanga?.tithi?.name || 'प्रतिपदा'}</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">सूर्योदय कालीन नक्षत्र</td>
                      <td className="p-1 border-r border-stone-300">{panchanga?.nakshatra?.name || 'अश्विनी'}</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">जन्म कालीन नक्षत्र</td>
                      <td className="p-1 text-red-700 font-bold">{panchanga?.nakshatra?.name || 'अश्विनी'}</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">सूर्योदय कालीन योग</td>
                      <td className="p-1 border-r border-stone-300">{panchanga?.yoga?.name || 'सिद्धि'}</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">जन्म कालीन योग</td>
                      <td className="p-1">{panchanga?.yoga?.name || 'सिद्धि'}</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">जन्म कालीन करण</td>
                      <td className="p-1 border-r border-stone-300">{panchanga?.karana?.name || 'बव'}</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">इष्ट (घडी)</td>
                      <td className="p-1">२२:४:७</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">आधुनिक बार</td>
                      <td className="p-1 border-r border-stone-300">{panchanga?.dayNameNepali || 'आइतबार'}</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">जन्मबार</td>
                      <td className="p-1 font-bold">{panchanga?.dayNameNepali || 'आइतबार'}</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">भयात</td>
                      <td className="p-1 border-r border-stone-300">४२:१४:३६</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">भभोग</td>
                      <td className="p-1">६३:२५:५३</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">अहर्गण</td>
                      <td className="p-1 border-r border-stone-300">१८७९१०६</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">अयनांश</td>
                      <td className="p-1">२४:३१:५</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">सूर्योदय</td>
                      <td className="p-1 border-r border-stone-300">७:२३:५२</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">सूर्यास्त</td>
                      <td className="p-1">१७:२९:१५</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">संवत्सर</td>
                      <td className="p-1 border-r border-stone-300">{panchanga?.samvatsara || 'सिद्धार्थी'}</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">पाया</td>
                      <td className="p-1">लोह</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Avakahada Chakra Box */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-5 py-0.5 rounded-full shadow-sm">
                  अवकहडा चक्र
                </span>
              </div>

              <div className="border border-stone-800 text-[11px] rounded-sm bg-white overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50 w-1/4">नामाक्षर</td>
                      <td className="p-1 border-r border-stone-300 font-bold text-red-700 w-1/4">डे</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50 w-1/4">नक्षत्र</td>
                      <td className="p-1 font-bold text-blue-700 w-1/4">{panchanga?.nakshatra?.name || 'अश्विनी'}</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">चरण</td>
                      <td className="p-1 border-r border-stone-300">तृतीय</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">राशि</td>
                      <td className="p-1 font-bold text-red-700">{panchanga?.moonRashi || 'मेष'}</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">योनी</td>
                      <td className="p-1 border-r border-stone-300">मार्जार:</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">गण</td>
                      <td className="p-1">राक्षस</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">नाडी</td>
                      <td className="p-1 border-r border-stone-300">अन्त्य</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">वर्ग</td>
                      <td className="p-1">श्वान:</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">वर्ण</td>
                      <td className="p-1 border-r border-stone-300">ब्राह्मण:</td>
                      <td className="p-1 border-r border-stone-300 font-bold bg-stone-50">आसन</td>
                      <td className="p-1">काक:</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vimshottari Dasha Box */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-5 py-0.5 rounded-full shadow-sm">
                  विंशोत्तरी दशा
                </span>
              </div>
              <div className="overflow-x-auto border border-stone-800 rounded-sm bg-white">
                <table className="w-full text-center text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-stone-100 font-bold border-b border-stone-800 text-blue-800">
                      <th className="p-1 border-r border-stone-300">बु</th>
                      <th className="p-1 border-r border-stone-300">के</th>
                      <th className="p-1 border-r border-stone-300">शु</th>
                      <th className="p-1 border-r border-stone-300">सू</th>
                      <th className="p-1 border-r border-stone-300">च</th>
                      <th className="p-1 border-r border-stone-300">म</th>
                      <th className="p-1 border-r border-stone-300">रा</th>
                      <th className="p-1 border-r border-stone-300">वृ</th>
                      <th className="p-1 border-r border-stone-300">श</th>
                      <th className="p-1 font-bold text-stone-900">ग्रहा:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-300 font-bold text-red-700">
                      <td className="p-1 border-r border-stone-300">१D</td>
                      <td className="p-1 border-r border-stone-300">७</td>
                      <td className="p-1 border-r border-stone-300">२०</td>
                      <td className="p-1 border-r border-stone-300">६</td>
                      <td className="p-1 border-r border-stone-300">१०</td>
                      <td className="p-1 border-r border-stone-300">७</td>
                      <td className="p-1 border-r border-stone-300">१८</td>
                      <td className="p-1 border-r border-stone-300">१६</td>
                      <td className="p-1 border-r border-stone-300">१९</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष:</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-stone-300">१७</td>
                      <td className="p-1 border-r border-stone-300">२४</td>
                      <td className="p-1 border-r border-stone-300">४४</td>
                      <td className="p-1 border-r border-stone-300">५०</td>
                      <td className="p-1 border-r border-stone-300">६०</td>
                      <td className="p-1 border-r border-stone-300">६७</td>
                      <td className="p-1 border-r border-stone-300">८५</td>
                      <td className="p-1 border-r border-stone-300">१०१</td>
                      <td className="p-1 border-r border-stone-300">१२०</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Yogini Dasha Box */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-5 py-0.5 rounded-full shadow-sm">
                  योगिनी दशा
                </span>
              </div>
              <div className="overflow-x-auto border border-stone-800 rounded-sm bg-white">
                <table className="w-full text-center text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-stone-100 font-bold border-b border-stone-800 text-blue-800">
                      <th className="p-1 border-r border-stone-300">भ्रा</th>
                      <th className="p-1 border-r border-stone-300">भ</th>
                      <th className="p-1 border-r border-stone-300">उ</th>
                      <th className="p-1 border-r border-stone-300">सि</th>
                      <th className="p-1 border-r border-stone-300">सं</th>
                      <th className="p-1 border-r border-stone-300">मं</th>
                      <th className="p-1 border-r border-stone-300">पिं</th>
                      <th className="p-1 border-r border-stone-300">धा</th>
                      <th className="p-1 font-bold text-stone-900">ग्रहा:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-300 font-bold text-red-700">
                      <td className="p-1 border-r border-stone-300">४</td>
                      <td className="p-1 border-r border-stone-300">५</td>
                      <td className="p-1 border-r border-stone-300">६</td>
                      <td className="p-1 border-r border-stone-300">७</td>
                      <td className="p-1 border-r border-stone-300">८</td>
                      <td className="p-1 border-r border-stone-300">१</td>
                      <td className="p-1 border-r border-stone-300">२</td>
                      <td className="p-1 border-r border-stone-300">३</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष:</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 border-r border-stone-300">४</td>
                      <td className="p-1 border-r border-stone-300">९</td>
                      <td className="p-1 border-r border-stone-300">१५</td>
                      <td className="p-1 border-r border-stone-300">२२</td>
                      <td className="p-1 border-r border-stone-300">३०</td>
                      <td className="p-1 border-r border-stone-300">३१</td>
                      <td className="p-1 border-r border-stone-300">३३</td>
                      <td className="p-1 border-r border-stone-300">३६</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-stone-300">४०</td>
                      <td className="p-1 border-r border-stone-300">४५</td>
                      <td className="p-1 border-r border-stone-300">५१</td>
                      <td className="p-1 border-r border-stone-300">५८</td>
                      <td className="p-1 border-r border-stone-300">६६</td>
                      <td className="p-1 border-r border-stone-300">६७</td>
                      <td className="p-1 border-r border-stone-300">६९</td>
                      <td className="p-1 border-r border-stone-300">७२</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Shubhachakra, Ghatachakra, Lagna Kundali) */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Shubhachakra Box */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-5 py-0.5 rounded-full shadow-sm">
                  शुभचक्र
                </span>
              </div>

              <div className="border border-stone-800 text-[11px] rounded-sm bg-white overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50 w-2/5">भाग्यांक</td>
                      <td className="p-1 font-bold text-red-700">७</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ अंक</td>
                      <td className="p-1 font-bold text-blue-700">१,२,३,९</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ रत्न</td>
                      <td className="p-1">मोती</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ वार</td>
                      <td className="p-1">रवि,मंगल</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ ग्रह</td>
                      <td className="p-1">सूर्य,बुध,मंगल</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ राशि</td>
                      <td className="p-1">मिथुन,कन्या,तुला</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ रंग</td>
                      <td className="p-1">सेतो र हल्का पहेँलो</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ वर्ष</td>
                      <td className="p-1">१६,२५,३४,४३,५२</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">शुभ लग्न</td>
                      <td className="p-1">मकर,मेष,मिथुन,सिंह</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ghatachakra Box */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-5 py-0.5 rounded-full shadow-sm">
                  घातचक्र
                </span>
              </div>

              <div className="border border-stone-800 text-[11px] rounded-sm bg-white overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50 w-2/5">अशुभ महिना</td>
                      <td className="p-1 text-red-700 font-bold">पौष</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ लग्न</td>
                      <td className="p-1">वृश्चिक</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ वार</td>
                      <td className="p-1">बुधवार</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ नक्षत्र</td>
                      <td className="p-1">अनुराधा</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ योग</td>
                      <td className="p-1">ब्याघात</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ करण</td>
                      <td className="p-1">नाग</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ रंग</td>
                      <td className="p-1 text-red-600 font-bold">रातो</td>
                    </tr>
                    <tr className="border-b border-stone-300">
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ तिथी</td>
                      <td className="p-1">२,७,१२</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-bold border-r border-stone-300 bg-stone-50">अशुभ राशि</td>
                      <td className="p-1">कुम्भ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lagna Kundali Box */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-5 py-0.5 rounded-full shadow-sm">
                  लग्न कुण्डली
                </span>
              </div>

              {/* North Indian Diamond Chart */}
              <TipanLagnaChart lagna={lagna} planets={planets} />

              {/* Signature / Pandit Info */}
              <div className="pt-2 text-center text-xs space-y-0.5">
                <p className="font-bold text-stone-900">
                  ज्यो. पं. {astrologer?.name || 'खगेन्द्र वशिष्ट'}
                </p>
                <p className="text-[11px] text-stone-700">
                  {orgProfile?.address || 'श्रीधाम वृन्दावन'}
                </p>
                <p className="text-[10px] text-stone-600 font-sans">
                  {astrologer?.contactPhone || orgProfile?.phone || '९७६४२४००५३३'}
                </p>
              </div>
            </div>

          </div>
        </div>

      </SwastikaBorderFrame>
    </div>
  );
};

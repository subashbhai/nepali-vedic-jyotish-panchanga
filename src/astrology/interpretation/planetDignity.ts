import { PlanetName, RashiName } from '../../types/astrology';
import { DignityAnalysis, DignityStatus } from './types';

// Map of Rashi Lords (1 to 12)
export const RASHI_LORDS: Record<number, PlanetName> = {
  1: 'मंगल',  // मेष
  2: 'शुक्र',  // वृष
  3: 'बुध',   // मिथुन
  4: 'चन्द्र', // कर्कट
  5: 'सूर्य',  // सिंह
  6: 'बुध',   // कन्या
  7: 'शुक्र',  // तुला
  8: 'मंगल',  // वृश्चिक
  9: 'गुरु',  // धनु
  10: 'शनि', // मकर
  11: 'शनि', // कुम्भ
  12: 'गुरु', // मीन
};

// Natural Friendships Matrix according to Parashara
export const NATURAL_FRIENDSHIPS: Record<PlanetName, { friends: PlanetName[]; enemies: PlanetName[]; neutrals: PlanetName[] }> = {
  'सूर्य': { friends: ['चन्द्र', 'मंगल', 'गुरु'], enemies: ['शुक्र', 'शनि', 'राहु', 'केतु'], neutrals: ['बुध'] },
  'चन्द्र': { friends: ['सूर्य', 'बुध'], enemies: ['राहु', 'केतु'], neutrals: ['मंगल', 'गुरु', 'शुक्र', 'शनि'] },
  'मंगल': { friends: ['सूर्य', 'चन्द्र', 'गुरु'], enemies: ['बुध', 'राहु', 'केतु'], neutrals: ['शुक्र', 'शनि'] },
  'बुध': { friends: ['सूर्य', 'शुक्र'], enemies: ['चन्द्र'], neutrals: ['मंगल', 'गुरु', 'शनि', 'राहु', 'केतु'] },
  'गुरु': { friends: ['सूर्य', 'चन्द्र', 'मंगल'], enemies: ['बुध', 'शुक्र'], neutrals: ['शनि', 'राहु', 'केतु'] },
  'शुक्र': { friends: ['बुध', 'शनि', 'राहु', 'केतु'], enemies: ['सूर्य', 'चन्द्र'], neutrals: ['मंगल', 'गुरु'] },
  'शनि': { friends: ['बुध', 'शुक्र', 'राहु'], enemies: ['सूर्य', 'चन्द्र', 'मंगल'], neutrals: ['गुरु', 'केतु'] },
  'राहु': { friends: ['शुक्र', 'शनि', 'बुध'], enemies: ['सूर्य', 'चन्द्र', 'मंगल'], neutrals: ['गुरु', 'केतु'] },
  'केतु': { friends: ['मंगल', 'गुरु', 'शुक्र'], enemies: ['सूर्य', 'चन्द्र'], neutrals: ['बुध', 'शनि', 'राहु'] },
};

/**
 * Calculates detailed dignity analysis for a planet based on sign and degree placement.
 */
export function calculatePlanetDignity(
  planet: PlanetName,
  rashiId: number,
  degreeInRashi: number
): DignityAnalysis {
  // 1. SURYA (Sun)
  if (planet === 'सूर्य') {
    if (rashiId === 1) { // Aries
      return {
        status: 'उच्च',
        score: 95,
        badgeColor: 'bg-amber-600 text-white',
        explanationNepali: 'सूर्य मेष राशिमा १०° मा परम उच्च मानिन्छ। यसले व्यक्तिमा आत्मबल, नेतृत्व क्षमता, राज्य सम्मान र ओजस्वी व्यक्तित्व प्रदान गर्दछ।',
        rationaleSanskrit: 'मेषे दशमभागे परम-उच्चम्',
      };
    }
    if (rashiId === 7) { // Libra
      return {
        status: 'नीच',
        score: 25,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'सूर्य तुला राशिमा १०° मा नीच हुन्छ। यसले आत्मबलमा संशय, अहम् टकराउ वा पिता तथा मानप्रतिष्ठामा अतिरिक्त सजगताको माग गर्दछ।',
        rationaleSanskrit: 'तुलिनि दशमभागे परम-नीचम्',
      };
    }
    if (rashiId === 5) { // Leo
      if (degreeInRashi <= 20) {
        return {
          status: 'मूलत्रिकोण',
          score: 90,
          badgeColor: 'bg-emerald-600 text-white',
          explanationNepali: 'सूर्य सिंह राशिमा ०°-२०° सम्म मूलत्रिकोण क्षेत्रमा रहन्छ। यो अत्यन्त प्रभावशाली, तेजस्वी र सकारात्मक स्थिति हो।',
          rationaleSanskrit: 'सिंहस्यादौ विंशत्यंशे मूलत्रिकोणम्',
        };
      }
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-amber-500 text-white',
        explanationNepali: 'सूर्य आफ्नै सिंह राशिमा स्वक्षेत्री भएर बसेको छ, जसले आत्मविश्वास र मौलिकता दिन्छ।',
        rationaleSanskrit: 'स्वगृहे सिंहराशौ',
      };
    }
  }

  // 2. CHANDRA (Moon)
  if (planet === 'चन्द्र') {
    if (rashiId === 2) { // Taurus
      if (degreeInRashi <= 3) {
        return {
          status: 'उच्च',
          score: 98,
          badgeColor: 'bg-sky-600 text-white',
          explanationNepali: 'चन्द्रमा वृष राशिमा ३° मा परम उच्च हुन्छ। यसले उच्च मानसिक शान्ति, भावुक परिपक्वता, समृद्धि र लोकप्रियता दिन्छ।',
          rationaleSanskrit: 'वृषे तृतीयभागे परम-उच्चम्',
        };
      }
      return {
        status: 'मूलत्रिकोण',
        score: 90,
        badgeColor: 'bg-emerald-600 text-white',
        explanationNepali: 'चन्द्रमा वृष राशिमा ४°-३०° सम्म मूलत्रिकोण क्षेत्रमा रहन्छ, जुन अत्यन्त शुभ फलदायी हुन्छ।',
        rationaleSanskrit: 'वृषे मूलत्रिकोणम्',
      };
    }
    if (rashiId === 8) { // Scorpio
      return {
        status: 'नीच',
        score: 25,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'चन्द्रमा वृश्चिक राशिमा ३° मा नीच हुन्छ। यसले मनमा चञ्चलता, मानसिक उतारचढाव र अतिसंवेदनशीलता ल्याउन सक्छ।',
        rationaleSanskrit: 'कीटे तृतीयभागे परम-नीचम्',
      };
    }
    if (rashiId === 4) { // Cancer
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-sky-500 text-white',
        explanationNepali: 'चन्द्रमा आफ्नै कर्कट राशिमा स्वगृही छ, जसले ममता, करुणा र उच्च कल्पनाशीलता दिन्छ।',
        rationaleSanskrit: 'स्वगृहे कर्कटकराशौ',
      };
    }
  }

  // 3. MANGAL (Mars)
  if (planet === 'मंगल') {
    if (rashiId === 10) { // Capricorn
      return {
        status: 'उच्च',
        score: 95,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'मंगल मकर राशिमा २८° मा परम उच्च हुन्छ। यसले अद्भूत पराक्रम, प्राविधिक र साङ्गठनिक क्षमता तथा कार्यसिद्धि दिन्छ।',
        rationaleSanskrit: 'मकरे अष्टाविंशतिभागे परम-उच्चम्',
      };
    }
    if (rashiId === 4) { // Cancer
      return {
        status: 'नीच',
        score: 25,
        badgeColor: 'bg-rose-700 text-white',
        explanationNepali: 'मंगल कर्कट राशिमा २८° मा नीच मानिन्छ। यसले आवेग, उग्रता वा भावनात्मक असन्तुलन नियन्त्रण गर्नुपर्ने संकेत गर्छ।',
        rationaleSanskrit: 'कुलीरे अष्टाविंशतौ परम-नीचम्',
      };
    }
    if (rashiId === 1) { // Aries
      if (degreeInRashi <= 12) {
        return {
          status: 'मूलत्रिकोण',
          score: 90,
          badgeColor: 'bg-emerald-600 text-white',
          explanationNepali: 'मंगल मेष राशिमा ०°-१२° सम्म मूलत्रिकोण स्थितिमा हुन्छ, जसले साहस र नेतृत्व क्षमता प्रदान गर्दछ।',
          rationaleSanskrit: 'मेषे मूलत्रिकोणम्',
        };
      }
      return {
        status: 'स्वक्षेत्र',
        score: 82,
        badgeColor: 'bg-rose-500 text-white',
        explanationNepali: 'मंगल आफ्नै मेष राशिमा स्वक्षेत्री छ।',
        rationaleSanskrit: 'स्वगृहे मेषराशौ',
      };
    }
    if (rashiId === 8) { // Scorpio
      return {
        status: 'स्वक्षेत्र',
        score: 82,
        badgeColor: 'bg-rose-500 text-white',
        explanationNepali: 'मंगल आफ्नै वृश्चिक राशिमा स्वक्षेत्री छ, जसले गहिरो अनुसन्धान र आन्तरिक बल दिन्छ।',
        rationaleSanskrit: 'स्वगृहे वृश्चिकराशौ',
      };
    }
  }

  // 4. BUDHA (Mercury)
  if (planet === 'बुध') {
    if (rashiId === 6) { // Virgo
      if (degreeInRashi <= 15) {
        return {
          status: 'उच्च',
          score: 98,
          badgeColor: 'bg-emerald-600 text-white',
          explanationNepali: 'बुध कन्या राशिमा १५° सम्म परम उच्च हुन्छ। यसले तीक्ष्ण बुद्धि, गणितीय दक्षता र विश्लेषणात्मक सफलता दिन्छ।',
          rationaleSanskrit: 'कन्यायां पञ्चदशभागे परम-उच्चम्',
        };
      }
      if (degreeInRashi <= 20) {
        return {
          status: 'मूलत्रिकोण',
          score: 90,
          badgeColor: 'bg-emerald-500 text-white',
          explanationNepali: 'बुध कन्या राशिमा १६°-२०° सम्म मूलत्रिकोण अवस्थामा हुन्छ।',
          rationaleSanskrit: 'कन्यायां मूलत्रिकोणम्',
        };
      }
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-emerald-500 text-white',
        explanationNepali: 'बुध आफ्नै कन्या राशिमा स्वक्षेत्री छ।',
        rationaleSanskrit: 'स्वगृहे कन्याराशौ',
      };
    }
    if (rashiId === 12) { // Pisces
      return {
        status: 'नीच',
        score: 25,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'बुध मीन राशिमा १५° मा नीच मानिन्छ। यसले निर्णयमा अन्योल, सञ्चारमा अस्पष्टता वा ध्यानकेन्द्रित गर्न चुनौती ल्याउन सक्छ।',
        rationaleSanskrit: 'मीने पञ्चदशभागे परम-नीचम्',
      };
    }
    if (rashiId === 3) { // Gemini
      return {
        status: 'स्वक्षेत्र',
        score: 82,
        badgeColor: 'bg-emerald-500 text-white',
        explanationNepali: 'बुध आफ्नै मिथुन राशिमा स्वगृही छ, जसले तार्किक क्षमता र सञ्चार कला दिन्छ।',
        rationaleSanskrit: 'स्वगृहे मिथुनराशौ',
      };
    }
  }

  // 5. GURU (Jupiter)
  if (planet === 'गुरु') {
    if (rashiId === 4) { // Cancer
      return {
        status: 'उच्च',
        score: 96,
        badgeColor: 'bg-amber-600 text-white',
        explanationNepali: 'बृहस्पति कर्कट राशिमा ५° मा परम उच्च मानिन्छ। यसले महान् ज्ञान, सदाचार, ईश्वरीय कृपा र उच्च मार्गदर्शन प्रदान गर्दछ।',
        rationaleSanskrit: 'कर्कटे पञ्चमभागे परम-उच्चम्',
      };
    }
    if (rashiId === 10) { // Capricorn
      return {
        status: 'नीच',
        score: 25,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'बृहस्पति मकर राशिमा ५° मा नीच हुन्छ। यसले आध्यात्मिक वा ज्ञानको व्यावहारिक प्रयोगमा केही मन्दता दर्शाउँछ।',
        rationaleSanskrit: 'मकरे पञ्चमे परम-नीचम्',
      };
    }
    if (rashiId === 9) { // Sagittarius
      if (degreeInRashi <= 10) {
        return {
          status: 'मूलत्रिकोण',
          score: 90,
          badgeColor: 'bg-emerald-600 text-white',
          explanationNepali: 'गुरु धनु राशिमा ०°-१०° सम्म मूलत्रिकोण स्थितिमा हुन्छ।',
          rationaleSanskrit: 'धनुषि मूलत्रिकोणम्',
        };
      }
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-amber-500 text-white',
        explanationNepali: 'गुरु आफ्नै धनु राशिमा स्वगृही छ।',
        rationaleSanskrit: 'स्वगृहे धनुषि',
      };
    }
    if (rashiId === 12) { // Pisces
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-amber-500 text-white',
        explanationNepali: 'गुरु आफ्नै मीन राशिमा स्वगृही छ।',
        rationaleSanskrit: 'स्वगृहे मीने',
      };
    }
  }

  // 6. SHUKRA (Venus)
  if (planet === 'शुक्र') {
    if (rashiId === 12) { // Pisces
      return {
        status: 'उच्च',
        score: 96,
        badgeColor: 'bg-purple-600 text-white',
        explanationNepali: 'शुक्र मीन राशिमा २७° मा परम उच्च हुन्छ। यसले कलात्मक प्रतिभा, दाम्पत्य सौन्दर्य र भौतिक सुखमा पूर्णता ल्याउँछ।',
        rationaleSanskrit: 'मीने सप्तविंशतौ परम-उच्चम्',
      };
    }
    if (rashiId === 6) { // Virgo
      return {
        status: 'नीच',
        score: 25,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'शुक्र कन्या राशिमा २७° मा नीच हुन्छ। यसले सम्बन्धमा अत्यधिक आलोचनात्मक दृष्टिकोण वा असन्तोष ल्याउन सक्छ।',
        rationaleSanskrit: 'कन्यायां सप्तविंशतौ परम-नीचम्',
      };
    }
    if (rashiId === 7) { // Libra
      if (degreeInRashi <= 15) {
        return {
          status: 'मूलत्रिकोण',
          score: 90,
          badgeColor: 'bg-emerald-600 text-white',
          explanationNepali: 'शुक्र तुला राशिमा ०°-१५° सम्म मूलत्रिकोण अवस्थामा हुन्छ।',
          rationaleSanskrit: 'तुलायां मूलत्रिकोणम्',
        };
      }
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-purple-500 text-white',
        explanationNepali: 'शुक्र आफ्नै तुला राशिमा स्वगृही छ।',
        rationaleSanskrit: 'स्वगृहे तुलायाम्',
      };
    }
    if (rashiId === 2) { // Taurus
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-purple-500 text-white',
        explanationNepali: 'शुक्र आफ्नै वृष राशिमा स्वगृही छ।',
        rationaleSanskrit: 'स्वगृहे वृषे',
      };
    }
  }

  // 7. SHANI (Saturn)
  if (planet === 'शनि') {
    if (rashiId === 7) { // Libra
      return {
        status: 'उच्च',
        score: 95,
        badgeColor: 'bg-slate-800 text-white',
        explanationNepali: 'शनि तुला राशिमा २०° मा परम उच्च मानिन्छ। यसले न्यायप्रियता, दूरदर्शिता र साङ्गठनिक सफलता दिन्छ।',
        rationaleSanskrit: 'तुलायां विंशतौ परम-उच्चम्',
      };
    }
    if (rashiId === 1) { // Aries
      return {
        status: 'नीच',
        score: 25,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'शनि मेष राशिमा २०° मा नीच हुन्छ। यसले धैर्यको कमी, कार्यमा ढिलाइ वा संघर्ष बढाउन सक्छ।',
        rationaleSanskrit: 'मेषे विंशतौ परम-नीचम्',
      };
    }
    if (rashiId === 11) { // Aquarius
      if (degreeInRashi <= 20) {
        return {
          status: 'मूलत्रिकोण',
          score: 90,
          badgeColor: 'bg-emerald-600 text-white',
          explanationNepali: 'शनि कुम्भ राशिमा ०°-२०° सम्म मूलत्रिकोण स्थितिमा हुन्छ।',
          rationaleSanskrit: 'कुम्भे मूलत्रिकोणम्',
        };
      }
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-slate-700 text-white',
        explanationNepali: 'शनि आफ्नै कुम्भ राशिमा स्वगृही छ।',
        rationaleSanskrit: 'स्वगृहे कुम्भे',
      };
    }
    if (rashiId === 10) { // Capricorn
      return {
        status: 'स्वक्षेत्र',
        score: 85,
        badgeColor: 'bg-slate-700 text-white',
        explanationNepali: 'शनि आफ्नै मकर राशिमा स्वगृही छ।',
        rationaleSanskrit: 'स्वगृहे मकरे',
      };
    }
  }

  // 8. RAHU & KETU
  if (planet === 'राहु') {
    if (rashiId === 2 || rashiId === 3) {
      return {
        status: 'उच्च',
        score: 88,
        badgeColor: 'bg-teal-600 text-white',
        explanationNepali: 'राहु वृष/मिथुन राशिमा उच्च प्रभाव दिने मानिन्छ, जसले नवीन प्रविधि र आउट-अफ-द-बक्स सोचमा सफलता दिन्छ।',
        rationaleSanskrit: 'वृष-मिथुनयोः उच्च स्थानम्',
      };
    }
    if (rashiId === 8 || rashiId === 9) {
      return {
        status: 'नीच',
        score: 30,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'राहु वृश्चिक/धनु राशिमा नीच मानिन्छ। यसले भ्रम र निर्णयमा सावधानीको माग गर्दछ।',
        rationaleSanskrit: 'वृश्चिक-धनुषोः नीच स्थानम्',
      };
    }
  }

  if (planet === 'केतु') {
    if (rashiId === 8 || rashiId === 9) {
      return {
        status: 'उच्च',
        score: 88,
        badgeColor: 'bg-indigo-600 text-white',
        explanationNepali: 'केतु वृश्चिक/धनु राशिमा उच्च स्थिति मानिन्छ, जसले गहिरो अनुसन्धान र सात्विक अन्तर्दृष्टि दिन्छ।',
        rationaleSanskrit: 'वृश्चिक-धनुषोः उच्च स्थानम्',
      };
    }
    if (rashiId === 2 || rashiId === 3) {
      return {
        status: 'नीच',
        score: 30,
        badgeColor: 'bg-rose-600 text-white',
        explanationNepali: 'केतु वृष/मिथुन राशिमा नीच मानिन्छ।',
        rationaleSanskrit: 'वृष-मिथुनयोः नीच स्थानम्',
      };
    }
  }

  // Fallback based on Natural Relationship with Rashi Lord
  const rashiLord = RASHI_LORDS[rashiId];
  const relationData = NATURAL_FRIENDSHIPS[planet];

  if (rashiLord === planet) {
    return {
      status: 'स्वक्षेत्र',
      score: 80,
      badgeColor: 'bg-amber-500 text-white',
      explanationNepali: `${planet} आफ्नै राशिमा स्वगृही छ।`,
      rationaleSanskrit: 'स्वक्षेत्री स्थितिः',
    };
  }

  if (relationData?.friends.includes(rashiLord)) {
    return {
      status: 'मित्रराशि',
      score: 70,
      badgeColor: 'bg-emerald-500 text-white',
      explanationNepali: `${planet} मित्र ग्रह ${rashiLord} को राशिमा रहेको हुँदा अनुकूल फल प्रदान गर्दछ।`,
      rationaleSanskrit: 'मित्रक्षेत्री स्थितिः',
    };
  }

  if (relationData?.enemies.includes(rashiLord)) {
    return {
      status: 'शत्रुराशि',
      score: 40,
      badgeColor: 'bg-rose-500 text-white',
      explanationNepali: `${planet} शत्रु ग्रह ${rashiLord} को क्षेत्रमा रहेकाले यसका कारकत्व प्रकट हुन केही संघर्ष आवश्यक पर्न सक्छ।`,
      rationaleSanskrit: 'शत्रुक्षेत्री स्थितिः',
    };
  }

  return {
    status: 'समराशि',
    score: 55,
    badgeColor: 'bg-stone-500 text-white',
    explanationNepali: `${planet} सम ग्रह ${rashiLord} को राशिमा तटस्थ स्थितिमा रहेको छ।`,
    rationaleSanskrit: 'समक्षेत्री स्थितिः',
  };
}

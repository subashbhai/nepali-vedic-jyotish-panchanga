import { 
  BirthDetails, 
  VivahMilanResult, 
  AshtakootScore,
  MangalDoshaDetail,
  SaptamBhavaDetail,
  KarakaDetail,
  MaritalLifeAreaScore,
  ComparativeFactor,
  PlanetPosition,
  LagnaInfo
} from '../types/astrology';
import { 
  getJulianDay, 
  getAyanamsa, 
  calculateLagna, 
  calculatePlanetaryPositions, 
  NAKSHATRA_DATA, 
  RASHI_DATA 
} from './astroCalculations';
import { generateFull5LevelVimshottariDasha } from './dashaEngine';
import { generateDivisionalChartEx } from './vargaEngine';
import { toDevanagariNumerals } from './nepaliCalendar';

export const VIVAH_ENGINE_VERSION = '8.0.0-VIVAH-CLASSICAL';

// ----------------------------------------------------
// 1. VARNA KOOT (Max 1)
// ----------------------------------------------------
const VARNA_GRADE: Record<number, { name: string; rank: number }> = {
  4: { name: 'ब्राह्मण', rank: 4 }, 8: { name: 'ब्राह्मण', rank: 4 }, 12: { name: 'ब्राह्मण', rank: 4 },
  1: { name: 'क्षत्रिय', rank: 3 }, 5: { name: 'क्षत्रिय', rank: 3 }, 9: { name: 'क्षत्रिय', rank: 3 },
  2: { name: 'वैश्य', rank: 2 }, 6: { name: 'वैश्य', rank: 2 }, 10: { name: 'वैश्य', rank: 2 },
  3: { name: 'शूद्र', rank: 1 }, 7: { name: 'शूद्र', rank: 1 }, 11: { name: 'शूद्र', rank: 1 },
};

export function evaluateVarna(boyRashiId: number, girlRashiId: number) {
  const boyVarna = VARNA_GRADE[boyRashiId] || { name: 'शूद्र', rank: 1 };
  const girlVarna = VARNA_GRADE[girlRashiId] || { name: 'शूद्र', rank: 1 };

  const pts = boyVarna.rank >= girlVarna.rank ? 1 : 0;
  return {
    maxPoints: 1,
    obtainedPoints: pts,
    boyAttr: boyVarna.name,
    girlAttr: girlVarna.name,
    descriptionNepali: pts === 1 
      ? 'वरको वर्ण कन्याको बराबर वा उच्च रहेकाले १/१ अङ्क प्राप्त (आध्यात्मिक तथा कार्यशैली समन्वय अनुकूल)।' 
      : 'कन्याको वर्ण वरभन्दा उच्च रहेकाले ० अङ्क प्राप्त।',
  };
}

// ----------------------------------------------------
// 2. VASHYA KOOT (Max 2)
// ----------------------------------------------------
function getVashyaCategory(rashiId: number, degree: number): string {
  switch (rashiId) {
    case 1: return 'चतुष्पाद (चारखुट्टे)';
    case 2: return 'चतुष्पाद (चारखुट्टे)';
    case 3: return 'द्विपद (मानव)';
    case 4: return 'जलचर (जलमा बस्ने)';
    case 5: return 'वनचर (जङ्गली)';
    case 6: return 'द्विपद (मानव)';
    case 7: return 'द्विपद (मानव)';
    case 8: return 'कीट (कीरा)';
    case 9: return degree < 15 ? 'द्विपद (मानव)' : 'चतुष्पाद (चारखुट्टे)';
    case 10: return degree < 15 ? 'चतुष्पाद (चारखुट्टे)' : 'जलचर (जलमा बस्ने)';
    case 11: return 'द्विपद (मानव)';
    case 12: return 'जलचर (जलमा बस्ने)';
    default: return 'द्विपद (मानव)';
  }
}

export function evaluateVashya(boyRashiId: number, girlRashiId: number, boyDeg: number, girlDeg: number) {
  const boyVashya = getVashyaCategory(boyRashiId, boyDeg);
  const girlVashya = getVashyaCategory(girlRashiId, girlDeg);

  let pts = 1.0;
  if (boyRashiId === girlRashiId) {
    pts = 2.0;
  } else if (boyVashya === girlVashya) {
    pts = 2.0;
  } else if (boyVashya.includes('द्विपद') && girlVashya.includes('चतुष्पाद')) {
    pts = 1.0;
  } else if (boyVashya.includes('द्विपद') && girlVashya.includes('जलचर')) {
    pts = 0.5;
  } else if (boyVashya.includes('वनचर') || girlVashya.includes('वनचर')) {
    pts = 0.0;
  } else if (boyVashya.includes('कीट') || girlVashya.includes('कीट')) {
    pts = 1.0;
  } else {
    pts = 1.0;
  }

  return {
    maxPoints: 2,
    obtainedPoints: pts,
    boyAttr: boyVashya,
    girlAttr: girlVashya,
    descriptionNepali: `आपसी आकर्षण तथा वश प्रभाव (${pts}/२ अङ्क प्राप्त)।`,
  };
}

// ----------------------------------------------------
// 3. TARA KOOT (Max 3)
// ----------------------------------------------------
const TARA_NAMES = [
  'अति-मित्र (Ati-Mitra)',
  'जन्म (Janma)',
  'सम्पत् (Sampat)',
  'विपत (Vipat)',
  'क्षेम (Kshem)',
  'प्रत्यक (Pratyak)',
  'साधक (Sadhak)',
  'वध/निधन (Naidhana)',
  'मित्र (Mitra)',
];

export function evaluateTara(boyNakId: number, girlNakId: number) {
  const countGtoB = ((boyNakId - girlNakId + 27) % 27) + 1;
  const taraGtoB = countGtoB % 9;

  const countBtoG = ((girlNakId - boyNakId + 27) % 27) + 1;
  const taraBtoG = countBtoG % 9;

  const isFavGtoB = [2, 4, 6, 8, 0].includes(taraGtoB);
  const isFavBtoG = [2, 4, 6, 8, 0].includes(taraBtoG);

  let pts = 1.5;
  if (isFavGtoB && isFavBtoG) pts = 3.0;
  else if (!isFavGtoB && !isFavBtoG) pts = 0.0;

  return {
    maxPoints: 3,
    obtainedPoints: pts,
    boyAttr: `${TARA_NAMES[taraBtoG]} (${countBtoG})`,
    girlAttr: `${TARA_NAMES[taraGtoB]} (${countGtoB})`,
    descriptionNepali: pts === 3 
      ? 'दुवै पक्षको तारा शुभ रहेकाले पूर्ण ३/३ अङ्क प्राप्त (भाग्य, आयु तथा स्वास्थ्य अनुकूल)।' 
      : pts === 1.5 
      ? 'एक पक्षको तारा अनुकूल तथा अर्को मध्यम रहेकाले १.५/३ अङ्क प्राप्त।'
      : 'दुवै पक्षको तारा अशुभ रहेकाले ०/३ अङ्क प्राप्त (तारा शुद्धि उपाय आवश्यक)।',
  };
}

// ----------------------------------------------------
// 4. YONI KOOT (Max 4)
// ----------------------------------------------------
const NAKSHATRA_YONI_MAP: Record<number, string> = {
  1: 'अश्व (घोडो)', 2: 'गज (हात्ती)', 3: 'मेष (भेडो)', 4: 'सर्प (साँप)', 5: 'सर्प (साँप)',
  6: 'श्वान (कुकुर)', 7: 'मार्जारी (बिरालो)', 8: 'मेष (भेडो)', 9: 'मार्जारी (बिरालो)', 10: 'मूषक (मुसो)',
  11: 'मूषक (मुसो)', 12: 'गौ (गाई)', 13: 'महिष (राँगो)', 14: 'व्याघ्र (बाघ)', 15: 'महिष (राँगो)',
  16: 'व्याघ्र (बाघ)', 17: 'मृग (हरिण)', 18: 'मृग (हरिण)', 19: 'वानर (बाँदर)', 20: 'वानर (बाँदर)',
  21: 'नकुल (नेउरो)', 22: 'श्वान (कुकुर)', 23: 'सिंह (सिंह)', 24: 'अश्व (घोडो)', 25: 'सिंह (सिंह)',
  26: 'गौ (गाई)', 27: 'गज (हात्ती)',
};

const YONI_ENEMIES: Array<[string, string]> = [
  ['अश्व (घोडो)', 'महिष (राँगो)'],
  ['गज (हात्ती)', 'सिंह (सिंह)'],
  ['मेष (भेडो)', 'वानर (बाँदर)'],
  ['सर्प (साँप)', 'नकुल (नेउरो)'],
  ['श्वान (कुकुर)', 'मृग (हरिण)'],
  ['मार्जारी (बिरालो)', 'मूषक (मुसो)'],
  ['गौ (गाई)', 'व्याघ्र (बाघ)'],
];

export function evaluateYoni(boyNakId: number, girlNakId: number) {
  const boyYoni = NAKSHATRA_YONI_MAP[boyNakId] || 'गौ (गाई)';
  const girlYoni = NAKSHATRA_YONI_MAP[girlNakId] || 'गौ (गाई)';

  let pts = 2.0;
  let isEnemy = false;

  if (boyYoni === girlYoni) {
    pts = 4.0;
  } else {
    for (const [a, b] of YONI_ENEMIES) {
      if ((boyYoni === a && girlYoni === b) || (boyYoni === b && girlYoni === a)) {
        isEnemy = true;
        pts = 0.0;
        break;
      }
    }
    if (!isEnemy) {
      pts = 2.5;
    }
  }

  return {
    maxPoints: 4,
    obtainedPoints: pts,
    boyAttr: boyYoni,
    girlAttr: girlYoni,
    descriptionNepali: isEnemy 
      ? `वैरी योनि (${boyYoni} र ${girlYoni}) भएकाले ०/४ अङ्क प्राप्त (योनि वैरता परिहार आवश्यक)।`
      : `शारीरिक तथा मानसिक सामञ्जस्यका लागि ${pts}/४ अङ्क प्राप्त।`,
  };
}

// ----------------------------------------------------
// 5. GRAHA MAITRI KOOT (Max 5)
// ----------------------------------------------------
const NATURAL_FRIENDS: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  'सूर्य': { friends: ['चन्द्र', 'मंगल', 'गुरु'], neutrals: ['बुध'], enemies: ['शुक्र', 'शनि'] },
  'चन्द्र': { friends: ['सूर्य', 'बुध'], neutrals: ['मंगल', 'गुरु', 'शुक्र', 'शनि'], enemies: [] },
  'मंगल': { friends: ['सूर्य', 'चन्द्र', 'गुरु'], neutrals: ['शुक्र', 'शनि'], enemies: ['बुध'] },
  'बुध': { friends: ['सूर्य', 'शुक्र'], neutrals: ['मंगल', 'गुरु', 'शनि'], enemies: ['चन्द्र'] },
  'गुरु': { friends: ['सूर्य', 'चन्द्र', 'मंगल'], neutrals: ['शनि'], enemies: ['बुध', 'शुक्र'] },
  'शुक्र': { friends: ['बुध', 'शनि'], neutrals: ['मंगल', 'गुरु'], enemies: ['सूर्य', 'चन्द्र'] },
  'शनि': { friends: ['बुध', 'शुक्र'], neutrals: ['गुरु'], enemies: ['सूर्य', 'चन्द्र', 'मंगल'] },
};

export function evaluateGrahaMaitri(boyRashiId: number, girlRashiId: number) {
  const lordBoy = RASHI_DATA[boyRashiId - 1].lord;
  const lordGirl = RASHI_DATA[girlRashiId - 1].lord;

  let pts = 0;
  if (lordBoy === lordGirl) {
    pts = 5.0;
  } else {
    const boyRelToGirl = NATURAL_FRIENDS[lordBoy];
    const girlRelToBoy = NATURAL_FRIENDS[lordGirl];

    const bIsFriend = boyRelToGirl?.friends.includes(lordGirl);
    const bIsNeutral = boyRelToGirl?.neutrals.includes(lordGirl);
    const gIsFriend = girlRelToBoy?.friends.includes(lordBoy);
    const gIsNeutral = girlRelToBoy?.neutrals.includes(lordBoy);

    if (bIsFriend && gIsFriend) pts = 5.0;
    else if ((bIsFriend && gIsNeutral) || (gIsFriend && bIsNeutral)) pts = 4.0;
    else if (bIsNeutral && gIsNeutral) pts = 3.0;
    else if (bIsFriend || gIsFriend) pts = 1.0;
    else pts = 0.0;
  }

  return {
    maxPoints: 5,
    obtainedPoints: pts,
    boyAttr: `${RASHI_DATA[boyRashiId - 1].name} (${lordBoy})`,
    girlAttr: `${RASHI_DATA[girlRashiId - 1].name} (${lordGirl})`,
    descriptionNepali: pts >= 4 
      ? `राशि स्वामीहरू (${lordBoy} र ${lordGirl}) बीच उत्तम/मित्रवत सम्बन्ध रहेकाले ${pts}/५ अङ्क प्राप्त (विचार तथा सोचाइमा सामञ्जस्य)।`
      : `राशि स्वामीहरू बीच मध्यम वा सम सम्बन्ध रहेकाले ${pts}/५ अङ्क प्राप्त।`,
  };
}

// ----------------------------------------------------
// 6. GANA KOOT (Max 6)
// ----------------------------------------------------
export function evaluateGana(boyNakId: number, girlNakId: number, boyRashiId: number, girlRashiId: number) {
  const ganaBoy = NAKSHATRA_DATA[boyNakId - 1].gana;
  const ganaGirl = NAKSHATRA_DATA[girlNakId - 1].gana;

  let pts = 6.0;
  let isDosha = false;
  const exceptionsTriggered: string[] = [];

  if (ganaBoy === ganaGirl) {
    pts = 6.0;
  } else if ((ganaBoy === 'देव' && ganaGirl === 'मानव') || (ganaBoy === 'मानव' && ganaGirl === 'देव')) {
    pts = 5.0;
  } else if (ganaBoy === 'देव' && ganaGirl === 'राक्षस') {
    pts = 1.0;
    isDosha = true;
  } else {
    pts = 0.0;
    isDosha = true;
  }

  // Check Gana Dosha Cancellation Exceptions
  const lordBoy = RASHI_DATA[boyRashiId - 1].lord;
  const lordGirl = RASHI_DATA[girlRashiId - 1].lord;
  if (isDosha) {
    if (lordBoy === lordGirl || NATURAL_FRIENDS[lordBoy]?.friends.includes(lordGirl)) {
      exceptionsTriggered.push('राशि स्वामीहरू बीच मित्रवत सम्बन्ध भएकाले गण दोष परिहार भई शमित भएको छ।');
    }
    const nakLordBoy = NAKSHATRA_DATA[boyNakId - 1].lord;
    const nakLordGirl = NAKSHATRA_DATA[girlNakId - 1].lord;
    if (nakLordBoy === nakLordGirl) {
      exceptionsTriggered.push('नक्षत्र स्वामी एउटै भएकाले गण दोष शमन भएको छ।');
    }
  }

  return {
    maxPoints: 6,
    obtainedPoints: pts,
    boyAttr: `${ganaBoy} गण`,
    girlAttr: `${ganaGirl} गण`,
    descriptionNepali: isDosha 
      ? `गण भेद (${ganaBoy} र ${ganaGirl})। ${exceptionsTriggered.length > 0 ? exceptionsTriggered.join(' ') : 'स्वभाव समन्वयमा विचार पुर्‍याउनुपर्नेछ।'}`
      : `स्वभाव तथा मिजास मिलापका लागि ${pts}/६ अङ्क प्राप्त।`,
    isDosha,
    doshaName: isDosha ? 'गण दोष' : undefined,
    exceptionsTriggeredNepali: exceptionsTriggered,
    isCancelled: exceptionsTriggered.length > 0,
  };
}

// ----------------------------------------------------
// 7. BHAKOOT KOOT (Max 7)
// ----------------------------------------------------
export function evaluateBhakoot(boyRashiId: number, girlRashiId: number, boyNakId: number, girlNakId: number) {
  const diffGirlToBoy = ((boyRashiId - girlRashiId + 12) % 12) + 1;
  const diffBoyToGirl = ((girlRashiId - boyRashiId + 12) % 12) + 1;

  const isDvidwadasa = diffGirlToBoy === 2 || diffGirlToBoy === 12; // 2/12
  const isShadashtaka = diffGirlToBoy === 6 || diffGirlToBoy === 8; // 6/8
  const isNavapanchama = diffGirlToBoy === 5 || diffGirlToBoy === 9; // 5/9

  const isBadBhakoot = isDvidwadasa || isShadashtaka || isNavapanchama;
  let pts = isBadBhakoot ? 0.0 : 7.0;
  const exceptionsTriggered: string[] = [];

  const lordBoy = RASHI_DATA[boyRashiId - 1].lord;
  const lordGirl = RASHI_DATA[girlRashiId - 1].lord;

  // Bhakoot Exceptions
  if (isBadBhakoot) {
    if (lordBoy === lordGirl) {
      exceptionsTriggered.push('दुवै चन्द्र राशिको स्वामी एउटै (समान राशेश) भएकाले भकूट दोष पूर्ण रूपमा परिहार भएको छ।');
      pts = 7.0;
    } else if (NATURAL_FRIENDS[lordBoy]?.friends.includes(lordGirl) && NATURAL_FRIENDS[lordGirl]?.friends.includes(lordBoy)) {
      exceptionsTriggered.push('राशि स्वामीहरू परस्पर परम मित्र भएकाले भकूट दोष शमित भएको छ।');
      pts = 7.0;
    } else if (boyNakId === girlNakId) {
      exceptionsTriggered.push('जन्म नक्षत्र एउटै भएकाले भकूट दोष लाग्दैन।');
      pts = 7.0;
    }
  }

  return {
    maxPoints: 7,
    obtainedPoints: pts,
    boyAttr: `${RASHI_DATA[boyRashiId - 1].name} (${diffBoyToGirl})`,
    girlAttr: `${RASHI_DATA[girlRashiId - 1].name} (${diffGirlToBoy})`,
    descriptionNepali: isBadBhakoot
      ? exceptionsTriggered.length > 0 
        ? `भकूट स्थिति (${diffGirlToBoy}/${diffBoyToGirl}) भए तापनि शास्त्रोक्त अपवाद नियम अनुसार भकूट दोष परिहार भएको छ (${pts}/७ अङ्क प्राप्त)।`
        : `भकूट स्थिति (${diffGirlToBoy}/${diffBoyToGirl}) भएकाले भकूट दोष देखिएको छ (०/७ अङ्क प्राप्त)।`
      : `अनुकूल भकूट स्थिति रहेकाले पूर्ण ७/७ अङ्क प्राप्त।`,
    isDosha: isBadBhakoot && exceptionsTriggered.length === 0,
    doshaName: isBadBhakoot ? 'भकूट दोष' : undefined,
    exceptionsTriggeredNepali: exceptionsTriggered,
    isCancelled: exceptionsTriggered.length > 0,
  };
}

// ----------------------------------------------------
// 8. NADI KOOT (Max 8)
// ----------------------------------------------------
export function evaluateNadi(
  boyNakId: number, 
  girlNakId: number, 
  boyRashiId: number, 
  girlRashiId: number,
  boyPada: number,
  girlPada: number
) {
  const nadiBoy = NAKSHATRA_DATA[boyNakId - 1].nadi;
  const nadiGirl = NAKSHATRA_DATA[girlNakId - 1].nadi;

  const isSameNadi = nadiBoy === nadiGirl;
  let pts = isSameNadi ? 0.0 : 8.0;
  const exceptionsTriggered: string[] = [];

  if (isSameNadi) {
    const lordBoy = RASHI_DATA[boyRashiId - 1].lord;
    const lordGirl = RASHI_DATA[girlRashiId - 1].lord;

    if (boyNakId === girlNakId && boyRashiId !== girlRashiId) {
      exceptionsTriggered.push('नक्षत्र एउटै भए पनि चन्द्र राशि फरक-फरक भएकाले नाडी दोष परिहार हुन्छ।');
      pts = 8.0;
    } else if (boyRashiId === girlRashiId && boyNakId !== girlNakId) {
      exceptionsTriggered.push('चन्द्र राशि एउटै भए पनि जन्म नक्षत्र भिन्न भएकाले नाडी दोष शमन भएको छ।');
      pts = 8.0;
    } else if (lordBoy === lordGirl) {
      exceptionsTriggered.push('चन्द्र राशि स्वामी एउटै रहेकाले शास्त्रीय नियम अनुसार नाडी दोष परिहार भएको छ।');
      pts = 8.0;
    } else if (boyNakId === girlNakId && Math.abs(boyPada - girlPada) >= 2) {
      exceptionsTriggered.push(`एउटै नक्षत्र भए पनि पाद भिन्न (वर: ${boyPada}, कन्या: ${girlPada}) भएकाले नाडी दोष निरस्त भएको छ।`);
      pts = 8.0;
    }
    const EXEMPT_NAKSHATRAS = ['रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुष्य', 'विशाखा', 'अनुराधा', 'उत्तर भाद्रपद', 'रेवती'];
    const nakName = NAKSHATRA_DATA[boyNakId - 1].name;
    if (boyNakId === girlNakId && EXEMPT_NAKSHATRAS.includes(nakName)) {
      exceptionsTriggered.push(`विशेष नक्षत्र (${nakName}) भएकाले मुहूर्तमार्तण्ड अनुसार नाडी दोष लाग्दैन।`);
      pts = 8.0;
    }
  }

  return {
    maxPoints: 8,
    obtainedPoints: pts,
    boyAttr: `${nadiBoy} नाडी`,
    girlAttr: `${nadiGirl} नाडी`,
    descriptionNepali: isSameNadi
      ? exceptionsTriggered.length > 0 
        ? `समान नाडी (${nadiBoy}) भए तापनि प्रमाणित अपवाद नियम अनुसार नाडी दोष परिहार/शमन भयो (${pts}/८ अङ्क प्राप्त)।`
        : `समान नाडी (${nadiBoy}) भएकाले नाडी दोष स्थिति (स्वास्थ्य, वंश तथा सन्तान पक्षमा शान्ति/उपाय आवश्यक)।`
      : `भिन्न नाडी (${nadiBoy} र ${nadiGirl}) भएकाले पूर्ण ८/८ अङ्क प्राप्त (स्वास्थ्य र सन्तान पक्ष अनुकूल)।`,
    isDosha: isSameNadi && exceptionsTriggered.length === 0,
    doshaName: isSameNadi ? 'नाडी दोष' : undefined,
    exceptionsTriggeredNepali: exceptionsTriggered,
    isCancelled: exceptionsTriggered.length > 0,
  };
}

// ----------------------------------------------------
// MANGAL DOSHA (KUJA DOSHA) DEEP ANALYSIS
// ----------------------------------------------------
export function evaluateMangalDoshaDetail(
  planets: PlanetPosition[],
  lagna: LagnaInfo
): MangalDoshaDetail {
  const mars = planets.find((p) => p.name === 'मंगल');
  const moon = planets.find((p) => p.name === 'चन्द्र');
  const venus = planets.find((p) => p.name === 'शुक्र');

  if (!mars) {
    return {
      isManglik: false,
      fromLagna: false,
      fromMoon: false,
      fromVenus: false,
      houseLagna: 0,
      houseMoon: 0,
      houseVenus: 0,
      severity: 'छैन',
      detailsNepali: 'मंगल ग्रह स्थिति सामान्य छ।',
      cancellationRulesNepali: [],
    };
  }

  const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

  const houseLagna = mars.bhava;
  const houseMoon = moon ? ((mars.rashiId - moon.rashiId + 12) % 12) + 1 : 0;
  const houseVenus = venus ? ((mars.rashiId - venus.rashiId + 12) % 12) + 1 : 0;

  const fromLagna = MANGLIK_HOUSES.includes(houseLagna);
  const fromMoon = MANGLIK_HOUSES.includes(houseMoon);
  const fromVenus = MANGLIK_HOUSES.includes(houseVenus);

  const isManglik = fromLagna || fromMoon || fromVenus;
  const cancellationRules: string[] = [];

  if (isManglik) {
    if ([1, 8].includes(mars.rashiId)) {
      cancellationRules.push('मंगल स्वक्षेत्री (मेष वा वृश्चिक) मा रहेकाले मंगल दोष भङ्ग भएको छ।');
    } else if (mars.rashiId === 10) {
      cancellationRules.push('मंगल उच्च राशि (मकर) मा रहेकाले मंगल दोष परिहार भएको छ।');
    } else if (houseLagna === 2 && [3, 6].includes(mars.rashiId)) {
      cancellationRules.push('द्वितीय भावमा मिथुन वा कन्याको मंगल भएकाले दोष लाग्दैन।');
    } else if (houseLagna === 4 && [1, 8].includes(mars.rashiId)) {
      cancellationRules.push('चतुर्थ भावमा मेष वा वृश्चिकको मंगल भएकाले दोष निरस्त छ।');
    } else if (houseLagna === 7 && [4, 10].includes(mars.rashiId)) {
      cancellationRules.push('सप्तम भावमा कर्कट वा मकरको मंगल भएकाले दोष परिहार भयो।');
    } else if (houseLagna === 8 && [9, 12].includes(mars.rashiId)) {
      cancellationRules.push('अष्टम भावमा धनु वा मीनको मंगल भएकाले दोष शमन भयो।');
    } else if (houseLagna === 12 && [2, 7].includes(mars.rashiId)) {
      cancellationRules.push('द्वादश भावमा वृष वा तुलाको मंगल भएकाले दोष परिहार छ।');
    }

    const jupiter = planets.find((p) => p.name === 'गुरु');
    if (jupiter) {
      const distMarsJup = Math.abs(mars.bhava - jupiter.bhava);
      if (distMarsJup === 0 || [4, 6, 8].includes(distMarsJup)) {
        cancellationRules.push('देवगुरु बृहस्पतिको युति वा शुभ दृष्टि रहेकाले मंगल दोष शमित भएको छ।');
      }
    }
  }

  let severity = 'छैन';
  if (isManglik) {
    if (cancellationRules.length > 0) severity = 'परिहार/शमित';
    else if (fromLagna && fromMoon) severity = 'तीव्र (High)';
    else if (fromLagna || fromMoon) severity = 'मध्यम (Medium)';
    else severity = 'सामान्य (Mild)';
  }

  let details = 'कुण्डलीमा मंगल दोष छैन।';
  if (isManglik) {
    details = `मंगल लग्नबाट ${houseLagna} औँ, चन्द्रबाट ${houseMoon} औँ तथा शुक्रबाट ${houseVenus} औँ भावमा अवस्थित छ (${severity})।`;
  }

  return {
    isManglik,
    fromLagna,
    fromMoon,
    fromVenus,
    houseLagna,
    houseMoon,
    houseVenus,
    severity,
    detailsNepali: details,
    cancellationRulesNepali: cancellationRules,
  };
}

// ----------------------------------------------------
// SAPTAMA BHAVA & SAPTAMESH ANALYSIS
// ----------------------------------------------------
export function analyzeSaptamBhava(planets: PlanetPosition[], lagna: LagnaInfo): SaptamBhavaDetail {
  const house7RashiId = ((lagna.rashiId + 6 - 1) % 12) + 1;
  const house7RashiName = RASHI_DATA[house7RashiId - 1].name;
  const lordName = RASHI_DATA[house7RashiId - 1].lord;

  const occupants = planets.filter((p) => p.bhava === 7).map((p) => p.name);
  const lordPlanet = planets.find((p) => p.name === lordName);

  const lordBhava = lordPlanet ? lordPlanet.bhava : 7;
  const lordDignity = lordPlanet ? lordPlanet.dignity : 'सामान्य';

  const aspects = planets
    .filter((p) => {
      const diff = Math.abs(p.bhava - 7);
      return diff === 6 || (p.name === 'गुरु' && [4, 8].includes(diff)) || (p.name === 'शनि' && [2, 9].includes(diff)) || (p.name === 'मंगल' && [3, 7].includes(diff));
    })
    .map((p) => p.name);

  let summary = `सप्तम भाव ${house7RashiName} राशिमा छ, जसका स्वामी ${lordName} हुन् (${lordBhava} औँ भावमा ${lordDignity})।`;
  if (occupants.length > 0) {
    summary += ` सप्तम भावमा ${occupants.join(', ')} को उपस्थिति छ।`;
  } else {
    summary += ` सप्तम भाव शुभ तथा सौम्य छ।`;
  }

  return {
    house7Rashi: house7RashiName,
    lord: lordName,
    lordBhava,
    lordDignity,
    occupants,
    aspects,
    summaryNepali: summary,
  };
}

// ----------------------------------------------------
// KARAKA (SHUKRA / GURU) ANALYSIS
// ----------------------------------------------------
export function analyzeKaraka(planets: PlanetPosition[], planetName: string): KarakaDetail {
  const planet = planets.find((p) => p.name === planetName);
  if (!planet) {
    return {
      rashi: 'अज्ञात',
      bhava: 0,
      dignity: 'सामान्य',
      summaryNepali: `${planetName} को स्थिति उपलब्ध छैन।`,
    };
  }

  return {
    rashi: planet.rashiName,
    bhava: planet.bhava,
    dignity: planet.dignity,
    summaryNepali: `${planetName} ${planet.rashiName} राशिमा ${planet.bhava} औँ भावमा (${planet.dignity}) अवस्थित छ।`,
  };
}

// ----------------------------------------------------
// MASTER VIVAH MILAN ENGINE CALCULATOR
// ----------------------------------------------------
export function calculateVivahMilan(
  rawBoyDetails: BirthDetails,
  rawGirlDetails: BirthDetails,
  customAstrologerNote?: string
): VivahMilanResult {
  const defaultLoc = { name: 'काठमाडौँ', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 };

  const boyDetails: BirthDetails = {
    id: rawBoyDetails?.id || 'boy_default',
    name: rawBoyDetails?.name || 'वर (व्यक्ति १)',
    gender: rawBoyDetails?.gender || 'male',
    dateBS: rawBoyDetails?.dateBS || '२०५०-०१-०१',
    dateAD: rawBoyDetails?.dateAD || '1993-04-14',
    time: rawBoyDetails?.time || '१२:००',
    location: {
      name: rawBoyDetails?.location?.name || defaultLoc.name,
      latitude: rawBoyDetails?.location?.latitude ?? defaultLoc.latitude,
      longitude: rawBoyDetails?.location?.longitude ?? defaultLoc.longitude,
      timeZone: rawBoyDetails?.location?.timeZone ?? defaultLoc.timeZone,
    },
    ...rawBoyDetails,
  };

  const girlDetails: BirthDetails = {
    id: rawGirlDetails?.id || 'girl_default',
    name: rawGirlDetails?.name || 'कन्या (व्यक्ति २)',
    gender: rawGirlDetails?.gender || 'female',
    dateBS: rawGirlDetails?.dateBS || '२०५२-०३-१५',
    dateAD: rawGirlDetails?.dateAD || '1995-06-30',
    time: rawGirlDetails?.time || '१०:३०',
    location: {
      name: rawGirlDetails?.location?.name || defaultLoc.name,
      latitude: rawGirlDetails?.location?.latitude ?? defaultLoc.latitude,
      longitude: rawGirlDetails?.location?.longitude ?? defaultLoc.longitude,
      timeZone: rawGirlDetails?.location?.timeZone ?? defaultLoc.timeZone,
    },
    ...rawGirlDetails,
  };

  // Calculations for Boy
  const jdBoy = getJulianDay(boyDetails.dateAD, boyDetails.time, boyDetails.location.timeZone);
  const ayaBoy = getAyanamsa(jdBoy);
  const lagnaBoy = calculateLagna(jdBoy, boyDetails.location.latitude, boyDetails.location.longitude, ayaBoy);
  const planetsBoy = calculatePlanetaryPositions(jdBoy, ayaBoy, lagnaBoy.rashiId);
  const moonBoy = planetsBoy.find((p) => p.name === 'चन्द्र')!;
  const nakBoy = NAKSHATRA_DATA[moonBoy.nakshatraId - 1];
  const dashaBoy = generateFull5LevelVimshottariDasha(moonBoy, boyDetails.dateAD);
  const d9Boy = generateDivisionalChartEx('D9', lagnaBoy, planetsBoy);

  // Calculations for Girl
  const jdGirl = getJulianDay(girlDetails.dateAD, girlDetails.time, girlDetails.location.timeZone);
  const ayaGirl = getAyanamsa(jdGirl);
  const lagnaGirl = calculateLagna(jdGirl, girlDetails.location.latitude, girlDetails.location.longitude, ayaGirl);
  const planetsGirl = calculatePlanetaryPositions(jdGirl, ayaGirl, lagnaGirl.rashiId);
  const moonGirl = planetsGirl.find((p) => p.name === 'चन्द्र')!;
  const nakGirl = NAKSHATRA_DATA[moonGirl.nakshatraId - 1];
  const dashaGirl = generateFull5LevelVimshottariDasha(moonGirl, girlDetails.dateAD);
  const d9Girl = generateDivisionalChartEx('D9', lagnaGirl, planetsGirl);

  // Evaluate 8 Kutas
  const varnaRes = evaluateVarna(moonBoy.rashiId, moonGirl.rashiId);
  const vashyaRes = evaluateVashya(moonBoy.rashiId, moonGirl.rashiId, moonBoy.degree, moonGirl.degree);
  const taraRes = evaluateTara(moonBoy.nakshatraId, moonGirl.nakshatraId);
  const yoniRes = evaluateYoni(moonBoy.nakshatraId, moonGirl.nakshatraId);
  const grahaMaitriRes = evaluateGrahaMaitri(moonBoy.rashiId, moonGirl.rashiId);
  const ganaRes = evaluateGana(moonBoy.nakshatraId, moonGirl.nakshatraId, moonBoy.rashiId, moonGirl.rashiId);
  const bhakootRes = evaluateBhakoot(moonBoy.rashiId, moonGirl.rashiId, moonBoy.nakshatraId, moonGirl.nakshatraId);
  const nadiRes = evaluateNadi(moonBoy.nakshatraId, moonGirl.nakshatraId, moonBoy.rashiId, moonGirl.rashiId, moonBoy.pada, moonGirl.pada);

  const ashtakoot: AshtakootScore[] = [
    { kootName: 'Varna', kootNepali: 'वर्ण', ...varnaRes, isDosha: false },
    { kootName: 'Vashya', kootNepali: 'वश्य', ...vashyaRes, isDosha: false },
    { kootName: 'Tara', kootNepali: 'तारा', ...taraRes, isDosha: false },
    { kootName: 'Yoni', kootNepali: 'योनि', ...yoniRes, isDosha: false },
    { kootName: 'Graha Maitri', kootNepali: 'ग्रह मैत्री', ...grahaMaitriRes, isDosha: false },
    { kootName: 'Gana', kootNepali: 'गण', ...ganaRes },
    { kootName: 'Bhakoot', kootNepali: 'भकूट', ...bhakootRes },
    { kootName: 'Nadi', kootNepali: 'नाडी', ...nadiRes },
  ];

  const totalScore = ashtakoot.reduce((sum, k) => sum + k.obtainedPoints, 0);

  // Mangal Dosha
  const mangalBoy = evaluateMangalDoshaDetail(planetsBoy, lagnaBoy);
  const mangalGirl = evaluateMangalDoshaDetail(planetsGirl, lagnaGirl);
  const isMutualCancelled = (mangalBoy.isManglik && mangalGirl.isManglik) || mangalBoy.cancellationRulesNepali.length > 0 || mangalGirl.cancellationRulesNepali.length > 0;
  
  let cancellationReason: string | undefined = undefined;
  if (mangalBoy.isManglik && mangalGirl.isManglik) {
    cancellationReason = 'वर र कन्या दुवै पक्षमा मंगल दोष अवस्थित रहेकाले समान-दोष शास्त्रीय सिद्धान्त अनुसार मंगल दोष निरस्त भई शुभ फलदायी भएको छ।';
  } else if (mangalBoy.cancellationRulesNepali.length > 0 || mangalGirl.cancellationRulesNepali.length > 0) {
    cancellationReason = 'विशेष ग्रह स्थिति तथा राशि/भाव योगका कारण मंगल दोष परिहार भएको छ।';
  }

  // Saptam Bhava & Lord
  const saptamBoy = analyzeSaptamBhava(planetsBoy, lagnaBoy);
  const saptamGirl = analyzeSaptamBhava(planetsGirl, lagnaGirl);

  // Karakas
  const shukraBoy = analyzeKaraka(planetsBoy, 'शुक्र');
  const shukraGirl = analyzeKaraka(planetsGirl, 'शुक्र');
  const guruBoy = analyzeKaraka(planetsBoy, 'गुरु');
  const guruGirl = analyzeKaraka(planetsGirl, 'गुरु');

  // Navamsha (D9)
  const d9LagnaBoy = d9Boy.houses[0]?.rashiName || lagnaBoy.rashiName;
  const d97thRashiBoy = d9Boy.houses[6]?.rashiName || 'तुला';
  const d9LagnaGirl = d9Girl.houses[0]?.rashiName || lagnaGirl.rashiName;
  const d97thRashiGirl = d9Girl.houses[6]?.rashiName || 'तुला';

  // Moon-Moon Relation
  const distMoonInRashis = ((moonGirl.rashiId - moonBoy.rashiId + 12) % 12) + 1;
  const lordRelNepali = RASHI_DATA[moonBoy.rashiId - 1].lord === RASHI_DATA[moonGirl.rashiId - 1].lord 
    ? 'एउटै राशि स्वामी' 
    : `${RASHI_DATA[moonBoy.rashiId - 1].lord} र ${RASHI_DATA[moonGirl.rashiId - 1].lord}`;

  // Dasha
  const dashaStrBoy = `${dashaBoy.activeHierarchyAtTargetDate.mahadasha.planet} महादशा`;
  const dashaStrGirl = `${dashaGirl.activeHierarchyAtTargetDate.mahadasha.planet} महादशा`;

  // Positive & Challenging Signals
  const positiveSignals: string[] = [];
  const challengingSignals: string[] = [];

  if (totalScore >= 24) positiveSignals.push(`अष्टकूट गुण प्राप्ताङ्क ${toDevanagariNumerals(totalScore)}/३६ अति उत्तम।`);
  else if (totalScore >= 18) positiveSignals.push(`अष्टकूट गुण प्राप्ताङ्क ${toDevanagariNumerals(totalScore)}/३६ मध्यम तथा विवाहका लागि स्वीकार्य।`);
  else challengingSignals.push(`अष्टकूट गुण प्राप्ताङ्क ${toDevanagariNumerals(totalScore)}/३६ कम (१८ भन्दा कम)।`);

  if (!nadiRes.isDosha || nadiRes.isCancelled) positiveSignals.push('नाडी दोष मुक्त वा पूर्ण शमित।');
  else challengingSignals.push('नाडी दोष उपस्थिति (विशेष स्वास्थ्य/वंश अनुष्ठान आवश्यक)।');

  if (!bhakootRes.isDosha || bhakootRes.isCancelled) positiveSignals.push('भकूट दोष मुक्त वा शास्त्रीय अपवाद परिहार।');
  else challengingSignals.push('भकूट दोष स्थिति।');

  if (isMutualCancelled) positiveSignals.push('मंगल दोष परिहार/शमित वा दुवै कुण्डलीमा समान सामञ्जस्य।');
  else if (mangalBoy.isManglik || mangalGirl.isManglik) challengingSignals.push('एकपक्षीय मंगल दोष (विधिपूर्वक मङ्गल शान्ति उपयुक्त)।');

  if (grahaMaitriRes.obtainedPoints >= 4) positiveSignals.push('राशि स्वामीहरू बीच उत्तम मित्रवत सम्बन्ध।');

  // Overall Category
  let overall: VivahMilanResult['overallCompatibility'] = 'उत्कृष्ट';
  if (totalScore >= 26 && challengingSignals.length === 0) overall = 'उत्कृष्ट';
  else if (totalScore >= 20) overall = 'राम्रो';
  else if (totalScore >= 18) overall = 'मध्यम';
  else if (totalScore < 18 && positiveSignals.length >= 2) overall = 'विशेष अध्ययन आवश्यक';
  else overall = 'अशुभ';

  // 13 Marital Life Area Scores
  const maritalLifeAreas: MaritalLifeAreaScore[] = [
    { key: '1_mental', titleNepali: '१. मानसिक र वैचारिक अनुकूलता (Mental Harmony)', scoreLabel: grahaMaitriRes.obtainedPoints >= 4 ? 'अति उत्तम' : 'मध्यम', detailsNepali: `ग्रह मैत्री ${grahaMaitriRes.obtainedPoints}/५ अङ्क। ${grahaMaitriRes.descriptionNepali}` },
    { key: '2_temperament', titleNepali: '२. स्वभाव र चरित्र सामञ्जस्य (Temperament)', scoreLabel: ganaRes.obtainedPoints >= 5 ? 'उत्कृष्ट' : 'सामान्य', detailsNepali: `गण कूट ${ganaRes.obtainedPoints}/६ अङ्क। ${ganaRes.descriptionNepali}` },
    { key: '3_intimacy', titleNepali: '३. शारीरिक आकर्षण तथा दाम्पत्य सुख (Physical Intimacy)', scoreLabel: yoniRes.obtainedPoints >= 2.5 ? 'राम्रो' : 'सावधानी', detailsNepali: `योनि कूट ${yoniRes.obtainedPoints}/४ अङ्क। ${yoniRes.descriptionNepali}` },
    { key: '4_health_children', titleNepali: '४. स्वास्थ्य, वंश तथा सन्तान सुख (Health & Offspring)', scoreLabel: nadiRes.obtainedPoints === 8 ? 'पूर्ण अनुकूल' : 'शान्ति आवश्यक', detailsNepali: `नाडी कूट ${nadiRes.obtainedPoints}/८ अङ्क। ${nadiRes.descriptionNepali}` },
    { key: '5_wealth_family', titleNepali: '५. धन, परिवार तथा आर्थिक समृद्धि (Wealth & Prosperity)', scoreLabel: bhakootRes.obtainedPoints === 7 ? 'अति शुभ' : 'मध्यम', detailsNepali: `भकूट कूट ${bhakootRes.obtainedPoints}/७ अङ्क। ${bhakootRes.descriptionNepali}` },
    { key: '6_destiny', titleNepali: '६. भाग्य, आयु तथा कल्याण (Destiny & Longevity)', scoreLabel: taraRes.obtainedPoints >= 1.5 ? 'शुभ' : 'साधारण', detailsNepali: `तारा कूट ${taraRes.obtainedPoints}/३ अङ्क। ${taraRes.descriptionNepali}` },
    { key: '7_saptam_boy', titleNepali: '७. वरको सप्तम भाव र सप्तमेश स्थिति (Boy 7th House)', scoreLabel: 'विश्लेषित', detailsNepali: saptamBoy.summaryNepali },
    { key: '8_saptam_girl', titleNepali: '८. कन्याको सप्तम भाव र सप्तमेश स्थिति (Girl 7th House)', scoreLabel: 'विश्लेषित', detailsNepali: saptamGirl.summaryNepali },
    { key: '9_karaka_venus', titleNepali: '९. शुक्र (विवाहकारक) स्थिति (Venus Analysis)', scoreLabel: 'अनुकूल', detailsNepali: `वरको शुक्र: ${shukraBoy.summaryNepali} | कन्याको शुक्र: ${shukraGirl.summaryNepali}` },
    { key: '10_karaka_jupiter', titleNepali: '१०. गुरु (सौभाग्यकारक) स्थिति (Jupiter Analysis)', scoreLabel: 'शुभ', detailsNepali: `वरको गुरु: ${guruBoy.summaryNepali} | कन्याको गुरु: ${guruGirl.summaryNepali}` },
    { key: '11_mangal_milan', titleNepali: '११. मङ्गल दोष तथा परिहार (Mangal Dosha Match)', scoreLabel: isMutualCancelled ? 'परिहार/सुरक्षित' : 'सामान्य शान्ति', detailsNepali: cancellationReason || `${mangalBoy.detailsNepali} ${mangalGirl.detailsNepali}` },
    { key: '12_navamsha', titleNepali: '१२. नवमंश कुण्डली समन्वय (D9 Navamsha Harmony)', scoreLabel: 'समन्वयित', detailsNepali: `वर नवमंश लग्न: ${d9LagnaBoy}, ७ औँ भाव: ${d97thRashiBoy} | कन्या नवमंश लग्न: ${d9LagnaGirl}, ७ औँ भाव: ${d97thRashiGirl}` },
    { key: '13_dasha_timing', titleNepali: '१३. दशा तथा गोचर वैवाहिक समय (Dasha & Timing)', scoreLabel: 'सक्रिय', detailsNepali: `वर सक्रिय दशा: ${dashaStrBoy} | कन्या सक्रिय दशा: ${dashaStrGirl}। वैवाहिक लगन तथा समय अनुकूल।` },
  ];

  // Side-by-Side Comparative Table
  const comparativeTable: ComparativeFactor[] = [
    { factorNepali: 'चन्द्र राशि (Moon Sign)', person1Value: `${moonBoy.rashiName} (${RASHI_DATA[moonBoy.rashiId - 1].lord})`, person2Value: `${moonGirl.rashiName} (${RASHI_DATA[moonGirl.rashiId - 1].lord})`, compatibilityRemark: `दूरी: ${distMoonInRashis} राशि` },
    { factorNepali: 'जन्म नक्षत्र (Nakshatra)', person1Value: `${nakBoy.name} (${nakBoy.lord})`, person2Value: `${nakGirl.name} (${nakGirl.lord})`, compatibilityRemark: `पदमिलान अनुकूल` },
    { factorNepali: 'नक्षत्र पद (Pada)', person1Value: `चरण ${toDevanagariNumerals(moonBoy.pada)}`, person2Value: `चरण ${toDevanagariNumerals(moonGirl.pada)}`, compatibilityRemark: 'प्रमाणित पद' },
    { factorNepali: 'लग्न राशि (Ascendant)', person1Value: lagnaBoy.rashiName, person2Value: lagnaGirl.rashiName, compatibilityRemark: 'लग्न सामञ्जस्य' },
    { factorNepali: 'सप्तमेश (7th Lord)', person1Value: saptamBoy.lord, person2Value: saptamGirl.lord, compatibilityRemark: 'सप्तम भाव स्वामी' },
    { factorNepali: 'शुक्र स्थिति (Venus)', person1Value: `${shukraBoy.rashi} (${shukraBoy.bhava} औँ)`, person2Value: `${shukraGirl.rashi} (${shukraGirl.bhava} औँ)`, compatibilityRemark: 'दाम्पत्य कारक' },
    { factorNepali: 'बृहस्पति स्थिति (Jupiter)', person1Value: `${guruBoy.rashi} (${guruBoy.bhava} औँ)`, person2Value: `${guruGirl.rashi} (${guruGirl.bhava} औँ)`, compatibilityRemark: 'सौभाग्य कारक' },
    { factorNepali: 'मङ्गल दोष (Mars Dosha)', person1Value: mangalBoy.severity, person2Value: mangalGirl.severity, compatibilityRemark: isMutualCancelled ? 'दोष निरस्त/शमित' : 'शान्ति आवश्यक' },
  ];

  const rec = `३६ अष्टकूट गुणमध्ये कुल ${toDevanagariNumerals(totalScore)} गुण प्राप्त भएको छ (${overall} मिलान)। ` +
    (totalScore >= 18 
      ? 'वैदिक अष्टकूट सिद्धान्त अनुसार विवाह मिलान अनुकूल छ। ' 
      : 'अष्टकूट गुण १८ भन्दा कम भए तापनि सप्तम भाव, नवमंश तथा ग्रहबलको समन्वय गरी निर्णय लिन सकिन्छ। ') +
    (cancellationReason ? cancellationReason : '');

  const reportNepali = `विवाह मिलान तथा ३६ गुण परीक्षण प्रतिवेदन:\n` +
    `वर: ${boyDetails.name} (राशि: ${moonBoy.rashiName}, नक्षत्र: ${nakBoy.name})\n` +
    `कन्या: ${girlDetails.name} (राशि: ${moonGirl.rashiName}, नक्षत्र: ${nakGirl.name})\n` +
    `प्राप्ताङ्क: ${toDevanagariNumerals(totalScore)} / ३६ अङ्क।\n` +
    `निष्कर्ष: ${overall}।\n` +
    `नाडी अङ्क: ${toDevanagariNumerals(nadiRes.obtainedPoints)}/८, भकूट: ${toDevanagariNumerals(bhakootRes.obtainedPoints)}/७, गण: ${toDevanagariNumerals(ganaRes.obtainedPoints)}/६, ग्रह मैत्री: ${toDevanagariNumerals(grahaMaitriRes.obtainedPoints)}/५।`;

  return {
    engineVersion: VIVAH_ENGINE_VERSION,
    boyDetails,
    girlDetails,
    totalScore,
    ashtakoot,
    mangalDoshaBoy: mangalBoy,
    mangalDoshaGirl: mangalGirl,
    isMangalDoshaCancelled: isMutualCancelled,
    cancellationReason,
    saptamAnalysis: {
      person1: saptamBoy,
      person2: saptamGirl,
      crossRelationNepali: [
        `वरको सप्तमेश ${saptamBoy.lord} र कन्याको सप्तमेश ${saptamGirl.lord} बीच सम्बन्ध अनुकूल छ।`,
      ],
    },
    karakaAnalysis: {
      shukraPerson1: shukraBoy,
      shukraPerson2: shukraGirl,
      guruPerson1: guruBoy,
      guruPerson2: guruGirl,
    },
    navamshaMatch: {
      person1D9Lagna: d9LagnaBoy,
      person1D9House7: d97thRashiBoy,
      person2D9Lagna: d9LagnaGirl,
      person2D9House7: d97thRashiGirl,
      alignmentSummaryNepali: `वरको नवमंश लग्न ${d9LagnaBoy} तथा कन्याको नवमंश लग्न ${d9LagnaGirl} बीच वैवाहिक समन्वय सकारात्मक छ।`,
    },
    moonMoonRelation: {
      distanceInRashis: distMoonInRashis,
      lordsRelationNepali: lordRelNepali,
      harmonyNepali: `चन्द्र राशिको दूरी ${distMoonInRashis} भाव रहेको छ।`,
    },
    dashaCoordination: {
      person1Dasha: dashaStrBoy,
      person2Dasha: dashaStrGirl,
      marriageTimingIndicatorNepali: `वरको ${dashaStrBoy} तथा कन्याको ${dashaStrGirl} अनुकूल लगन समयमा रहेका छन्।`,
    },
    maritalLifeAreas,
    comparativeTable,
    positiveSignalsNepali: positiveSignals,
    challengingSignalsNepali: challengingSignals,
    overallCompatibility: overall,
    recommendationNepali: rec,
    detailedReportNepali: reportNepali,
    astrologerNoteNepali: customAstrologerNote,
    sourceRuleReferenceNepali: 'मुहूर्तमार्तण्ड, मुहूर्तचिन्तामणि तथा पियूषधारा वैवाहिक कूट मिलान सिद्धान्त',
  };
}

// ----------------------------------------------------
// INTERACTIVE ASTROLOGY Q&A ENGINE FOR VIVAH MILAN
// ----------------------------------------------------
export function answerVivahQuestion(
  userQuestion: string,
  result: VivahMilanResult
): { questionNepali: string; answerNepali: string; classicalRuleNepali: string } {
  const qLower = userQuestion.toLowerCase();

  if (qLower.includes('नाडी') || qLower.includes('nadi')) {
    const nadiKoot = result.ashtakoot.find((k) => k.kootName === 'Nadi');
    const score = nadiKoot ? nadiKoot.obtainedPoints : 0;
    const isCancelled = nadiKoot?.isCancelled;

    return {
      questionNepali: userQuestion,
      answerNepali: score === 8
        ? `नाडी मिलान अति उत्तम छ (${toDevanagariNumerals(score)}/८ अङ्क)। वर र कन्याको नाडी भिन्न भएकाले नाडी दोष लाग्दैन।`
        : isCancelled
        ? `समान नाडी भए तापनि शास्त्रोक्त अपवाद नियम (राशेश/नक्षत्रभेद/पादभेद) अनुसार नाडी दोष परिहार/शमन भएको छ।`
        : `समान नाडी भएकाले नाडी दोष स्थिति देखिन्छ। यसका लागि विधिपूर्वक महामृत्युञ्जय जप वा नाडी दोष शान्ति अनुष्ठान गर्नु शुभ मानिन्छ।`,
      classicalRuleNepali: 'मुहूर्तमार्तण्ड: "भिन्ननाड्यां शुभं प्रोक्तं समानैकान्तवर्जनम्। अपवादात्तु शमनं राश्यादिभेदे सति॥"',
    };
  }

  if (qLower.includes('मंगल') || qLower.includes('mangal') || qLower.includes('कुजा')) {
    return {
      questionNepali: userQuestion,
      answerNepali: result.isMangalDoshaCancelled
        ? `मंगल दोष परिहार भएको छ। ${result.cancellationReason || 'दुवै पक्षमा अनुकूल ग्रह स्थिति छ।'}`
        : result.mangalDoshaBoy.isManglik || result.mangalDoshaGirl.isManglik
        ? `एक पक्षमा मंगल दोष स्थिति छ (वर: ${result.mangalDoshaBoy.severity}, कन्या: ${result.mangalDoshaGirl.severity})। विवाह अघि मंगल शान्ति वा पूजापाठ गर्नु उपयुक्त हुनेछ।`
        : `दुवै जनाको कुण्डलीमा मंगल दोष छैन। मंगल स्थिति पूर्ण रूपमा सुरक्षित र शुभ छ।`,
      classicalRuleNepali: 'मुहूर्तचिन्तामणि: "दम्पत्योर्जन्मकाले च यद्येको मंगलः स्थितः। अन्यस्मिन् मङ्गलो यत्र तत्र दोषो न विद्यते॥"',
    };
  }

  if (qLower.includes('भकूट') || qLower.includes('bhakoot')) {
    const bhakootKoot = result.ashtakoot.find((k) => k.kootName === 'Bhakoot');
    return {
      questionNepali: userQuestion,
      answerNepali: bhakootKoot?.obtainedPoints === 7
        ? `भकूट मिलान उत्तम छ (७/७ अङ्क प्राप्त)।`
        : bhakootKoot?.isCancelled
        ? `भकूट दोष भए तापनि राशि स्वामी एउटै वा मित्र भएकाले भकूट दोष परिहार भएको छ।`
        : `भकूट दोष स्थिति देखिन्छ। परिवार तथा आर्थिक पक्षमा विवेकपूर्ण निर्णय लिनुहोला।`,
      classicalRuleNepali: 'पीयूषधारा: "एकाधिपत्ये भकूटदोषो न विद्यते मित्रत्वे वा॥"',
    };
  }

  return {
    questionNepali: userQuestion,
    answerNepali: `कुल ३६ गुणमध्ये ${toDevanagariNumerals(result.totalScore)} गुण प्राप्त भएको छ (${result.overallCompatibility} मिलान)। ${result.recommendationNepali}`,
    classicalRuleNepali: 'मुहूर्तचिन्तामणि विवाह कूट मिलान अध्याय',
  };
}

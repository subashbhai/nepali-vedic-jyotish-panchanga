import {
  LagnaInfo,
  PlanetPosition,
  PlanetName,
  RashiName,
  RashiInfo
} from '../types/astrology';
import { RASHI_DATA } from './astroCalculations';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface BhavaDetail {
  houseNumber: number; // 1 to 12
  rashiId: number;
  rashiName: RashiName;
  lord: string; // भावेश (e.g. मंगल, शुक्र, बुध...)
  bhavaMadhyaDeg: number; // Decimal degree within 0-360
  bhavaSandhiStartDeg: number;
  bhavaSandhiEndDeg: number;
  formattedMadhya: string;
  isKendra: boolean; // १, ४, ७, १०
  isTrikona: boolean; // १, ५, ९
  isUpachaya: boolean; // ३, ६, १०, ११
  isDushtasthana: boolean; // ६, ८, १२
  isMaraka: boolean; // २, ७
  domainNepali: string; // e.g. "प्रथम भाव — तनु (शरीर, व्यक्तित्व, स्वास्थ्य)"
  planetsRashi: PlanetPosition[]; // Planets in this house in Rashi Chart
  planetsChalit: PlanetPosition[]; // Planets in this house in Bhava Chalit Chart
  aspectsOnHouse: GrahaDrishtiItem[]; // Graha aspects falling on this house
}

export interface GrahaDrishtiItem {
  aspectingPlanet: PlanetName;
  aspectType: 'पूर्ण दृष्टि (७औँ)' | 'विशेष दृष्टि (४औँ)' | 'विशेष दृष्टि (८औँ)' | 'विशेष दृष्टि (५औँ)' | 'विशेष दृष्टि (९औँ)' | 'विशेष दृष्टि (३औँ)' | 'विशेष दृष्टि (१०औँ)';
  sourceHouse: number;
  targetHouse: number;
  targetRashiName: RashiName;
  strengthPercentage: number; // 100% full aspect
  descriptionNepali: string;
}

export interface GrahaConjunctionItem {
  planet1: PlanetName;
  planet2: PlanetName;
  rashiName: RashiName;
  bhava: number;
  angularDistanceDeg: number;
  formattedDistance: string;
  descriptionNepali: string;
}

export interface BhaveshPositionItem {
  houseNumber: number; // 1 to 12
  houseNameNepali: string; // e.g. "लग्नेश", "धनेश", "सहजेश"...
  lordPlanet: string;
  residingRashiName: RashiName;
  residingHouseNumber: number;
  degree: number;
  formattedDegree: string;
  nakshatraName: string;
  pada: number;
  descriptionNepali: string;
}

export interface LagnaSensitivityCheck {
  isNearBoundary: boolean;
  boundaryType?: 'राशि सीमा (Rashi Boundary)' | 'नक्षत्र सीमा (Nakshatra Boundary)' | 'पाद सीमा (Pada Boundary)';
  degreesToBoundary: number;
  warningMessageNepali?: string;
}

export interface BhavaDrishtiFullData {
  calculationSystemNepali: string;
  lagnaInfo: LagnaInfo;
  lagnaSensitivity: LagnaSensitivityCheck;
  bhavas: BhavaDetail[];
  bhavachalitHouses: Array<{
    houseNumber: number;
    rashiName: RashiName;
    planets: PlanetPosition[];
  }>;
  allDrishti: GrahaDrishtiItem[];
  conjunctions: GrahaConjunctionItem[];
  bhaveshPositions: BhaveshPositionItem[];
}

// House Domains Nepali Map
const HOUSE_DOMAINS: Record<number, string> = {
  1: 'तनु भाव — शरीर, व्यक्तित्व, स्वास्थ्य, आत्मबल, रूप-रङ्ग',
  2: 'धन भाव — धन, कुटुम्ब, वाणी, प्रारम्भिक शिक्षा, खानपान',
  3: 'सहज भाव — पराक्रम, अनुज भाइ-बहिनी, साहस, सञ्चार, यात्रा',
  4: 'बन्धु भाव — माता, गृह सुख, वाहन, भूमि, अचल सम्पत्ति',
  5: 'पुत्र भाव — सन्तान, मन्त्र-विद्या, बुद्धि, विवेक, पूर्वपुण्य',
  6: 'रिपु भाव — शत्रु, रोग, ऋण, प्रतिस्पर्धा, मामाघर, संकट',
  7: 'जाया भाव — पति/पत्नी, दाम्पत्य, व्यापारिक साझेदार, यात्रा',
  8: 'मृत्यु भाव — आयु, गूढ ज्ञान, अचानक हानि/लाभ, कष्ट, खोज',
  9: 'धर्म भाव — भाग्य, धर्म, गुरु, उच्च शिक्षा, पिता, तीर्थयात्रा',
  10: 'कर्म भाव — पिता, करियर, व्यवसाय, मान-सम्मान, पद-प्रतिष्ठा',
  11: 'आय भाव — लाभ, ज्येष्ठ दाजु-दिदी, इच्छा पूर्ति, आम्दानी',
  12: 'व्यय भाव — मोक्ष, खर्च, विदेश यात्रा, अस्पताल, हानि',
};

// Bhavesh Name Nepali Map
const BHAVESH_NAMES: Record<number, string> = {
  1: 'लग्नेश (१म भावेश)',
  2: 'धनेश (२म भावेश)',
  3: 'सहजेश (३र भावेश)',
  4: 'चतुर्थेश / सुखेश (४थ भावेश)',
  5: 'पञ्चमेश / पुत्रेश (५म भावेश)',
  6: 'षष्ठेश / रिपुेश (६ठ भावेश)',
  7: 'सप्तमेश / दारेश (७म भावेश)',
  8: 'अष्टमेश / आयुरेश (८म भावेश)',
  9: 'नवमेश / भाग्येश (९म भावेश)',
  10: 'दशमेश / कर्मेश (१०म भावेश)',
  11: 'एकादशेश / लाभेश (११म भावेश)',
  12: 'द्वादशेश / व्ययेश (१२म भावेश)',
};

/**
 * Check Lagna boundary sensitivity (< 1° or > 29° in sign)
 */
export function checkLagnaSensitivity(lagnaInfo: LagnaInfo): LagnaSensitivityCheck {
  const deg = lagnaInfo.degree;
  const distFromStart = deg;
  const distFromEnd = 30 - deg;
  const minDist = Math.min(distFromStart, distFromEnd);

  if (minDist <= 1.0) {
    const degStr = toDevanagariNumerals(minDist.toFixed(2));
    return {
      isNearBoundary: true,
      boundaryType: 'राशि सीमा (Rashi Boundary)',
      degreesToBoundary: minDist,
      warningMessageNepali: `सावधानी: लग्न राशि सीमाभन्दा केवल ${degStr}° नजिक छ। जन्म समयमा केही सेकेन्डको फरक परेमा लग्न राशि, वर्ग कुण्डली (नवांश, षष्ट्यंश) परिवर्तन हुन सक्छ।`,
    };
  }

  return {
    isNearBoundary: false,
    degreesToBoundary: minDist,
  };
}

/**
 * Calculate full Bhava, Bhava Chalit, Aspects, and Bhavesh positions
 */
export function calculateBhavaAndDrishtiSystem(
  lagnaInfo: LagnaInfo,
  planets: PlanetPosition[],
  calculationSystem: 'Rashi' | 'Sripati' = 'Sripati',
  rahuKetuAspectsEnabled: boolean = true
): BhavaDrishtiFullData {
  const systemName = calculationSystem === 'Sripati'
    ? 'श्रीपति भावचलित प्रणाली (Lagna Degree = Bhava Madhya)'
    : 'राशी समान भाव प्रणाली (Equal Sign House System)';

  const lagnaSensitivity = checkLagnaSensitivity(lagnaInfo);

  // Total Lagna Sidereal Longitude in 0-360°
  const lagnaTotalDeg = ((lagnaInfo.rashiId - 1) * 30) + lagnaInfo.degree;

  // 1. Build 12 Bhavas (Houses)
  const bhavas: BhavaDetail[] = [];
  const chalitHouses: Array<{ houseNumber: number; rashiName: RashiName; planets: PlanetPosition[] }> = [];

  for (let h = 1; h <= 12; h++) {
    const rashiId = ((lagnaInfo.rashiId - 1 + h - 1) % 12) + 1;
    const rashi = RASHI_DATA[rashiId - 1];

    let madhyaDeg = 0;
    let sandhiStart = 0;
    let sandhiEnd = 0;

    if (calculationSystem === 'Sripati') {
      // Bhava Madhya = Lagna Degree in the respective house sign
      madhyaDeg = ((rashiId - 1) * 30) + lagnaInfo.degree;
      sandhiStart = (madhyaDeg - 15 + 360) % 360;
      sandhiEnd = (madhyaDeg + 15) % 360;
    } else {
      // Equal Sign
      madhyaDeg = ((rashiId - 1) * 30) + 15;
      sandhiStart = (rashiId - 1) * 30;
      sandhiEnd = rashiId * 30;
    }

    const degInSign = madhyaDeg % 30;
    const degInt = Math.floor(degInSign);
    const minInt = Math.floor((degInSign - degInt) * 60);
    const formattedMadhya = `${toDevanagariNumerals(degInt)}° ${toDevanagariNumerals(minInt)}'`;

    // Planets in Rashi Chart House
    const planetsInRashi = planets.filter((p) => p.rashiId === rashiId);

    // Planets in Bhava Chalit House
    const planetsInChalit = planets.filter((p) => {
      if (calculationSystem === 'Sripati') {
        // Calculate house distance from Lagna Madhya
        let diff = (p.longitude - lagnaTotalDeg + 360) % 360;
        // Shift by 15 degrees so house 1 range is [-15°, +15°] -> [0°, 30°]
        let shifted = (diff + 15) % 360;
        let pChalitHouse = Math.floor(shifted / 30) + 1;
        return pChalitHouse === h;
      } else {
        return p.rashiId === rashiId;
      }
    });

    const isKendra = h === 1 || h === 4 || h === 7 || h === 10;
    const isTrikona = h === 1 || h === 5 || h === 9;
    const isUpachaya = h === 3 || h === 6 || h === 10 || h === 11;
    const isDushtasthana = h === 6 || h === 8 || h === 12;
    const isMaraka = h === 2 || h === 7;

    bhavas.push({
      houseNumber: h,
      rashiId,
      rashiName: rashi.name,
      lord: rashi.lord,
      bhavaMadhyaDeg: madhyaDeg,
      bhavaSandhiStartDeg: sandhiStart,
      bhavaSandhiEndDeg: sandhiEnd,
      formattedMadhya,
      isKendra,
      isTrikona,
      isUpachaya,
      isDushtasthana,
      isMaraka,
      domainNepali: HOUSE_DOMAINS[h] || `भाव ${toDevanagariNumerals(h)}`,
      planetsRashi: planetsInRashi,
      planetsChalit: planetsInChalit,
      aspectsOnHouse: [], // Populated in step 2
    });

    chalitHouses.push({
      houseNumber: h,
      rashiName: rashi.name,
      planets: planetsInChalit,
    });
  }

  // 2. Calculate Graha Drishti (Aspects)
  const allDrishti: GrahaDrishtiItem[] = [];

  planets.forEach((p) => {
    const srcHouse = p.bhava; // 1 to 12
    const targetHouses: Array<{ house: number; type: GrahaDrishtiItem['aspectType'] }> = [];

    // Universal 7th Aspect for ALL planets
    const house7 = ((srcHouse - 1 + 6) % 12) + 1;
    targetHouses.push({ house: house7, type: 'पूर्ण दृष्टि (७औँ)' });

    // Special Aspects
    if (p.name === 'मंगल') { // Mars: 4th, 8th
      const house4 = ((srcHouse - 1 + 3) % 12) + 1;
      const house8 = ((srcHouse - 1 + 7) % 12) + 1;
      targetHouses.push({ house: house4, type: 'विशेष दृष्टि (४औँ)' });
      targetHouses.push({ house: house8, type: 'विशेष दृष्टि (८औँ)' });
    } else if (p.name === 'गुरु') { // Jupiter: 5th, 9th
      const house5 = ((srcHouse - 1 + 4) % 12) + 1;
      const house9 = ((srcHouse - 1 + 8) % 12) + 1;
      targetHouses.push({ house: house5, type: 'विशेष दृष्टि (५औँ)' });
      targetHouses.push({ house: house9, type: 'विशेष दृष्टि (९औँ)' });
    } else if (p.name === 'शनि') { // Saturn: 3rd, 10th
      const house3 = ((srcHouse - 1 + 2) % 12) + 1;
      const house10 = ((srcHouse - 1 + 9) % 12) + 1;
      targetHouses.push({ house: house3, type: 'विशेष दृष्टि (३औँ)' });
      targetHouses.push({ house: house10, type: 'विशेष दृष्टि (१०औँ)' });
    } else if ((p.name === 'राहु' || p.name === 'केतु') && rahuKetuAspectsEnabled) {
      // Configurable tradition: Rahu/Ketu 5th, 9th aspects
      const house5 = ((srcHouse - 1 + 4) % 12) + 1;
      const house9 = ((srcHouse - 1 + 8) % 12) + 1;
      targetHouses.push({ house: house5, type: 'विशेष दृष्टि (५औँ)' });
      targetHouses.push({ house: house9, type: 'विशेष दृष्टि (९औँ)' });
    }

    targetHouses.forEach(({ house, type }) => {
      const targetBhava = bhavas[house - 1];
      const item: GrahaDrishtiItem = {
        aspectingPlanet: p.name,
        aspectType: type,
        sourceHouse: srcHouse,
        targetHouse: house,
        targetRashiName: targetBhava.rashiName,
        strengthPercentage: 100,
        descriptionNepali: `${p.name} ग्रहले भाव ${toDevanagariNumerals(srcHouse)} बाट भाव ${toDevanagariNumerals(house)} (${targetBhava.rashiName} राशि) मा ${type} पारेका छन्।`,
      };

      allDrishti.push(item);
      targetBhava.aspectsOnHouse.push(item);
    });
  });

  // 3. Graha Yuti (Conjunctions) Calculation
  const conjunctions: GrahaConjunctionItem[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      // Same sign conjunction or within 12 degrees
      if (p1.rashiId === p2.rashiId) {
        const diff = Math.abs(p1.degree - p2.degree);
        if (diff <= 12.0) {
          const degInt = Math.floor(diff);
          const minInt = Math.floor((diff - degInt) * 60);
          const formatted = `${toDevanagariNumerals(degInt)}° ${toDevanagariNumerals(minInt)}'`;

          conjunctions.push({
            planet1: p1.name,
            planet2: p2.name,
            rashiName: p1.rashiName,
            bhava: p1.bhava,
            angularDistanceDeg: diff,
            formattedDistance: formatted,
            descriptionNepali: `${p1.name} र ${p2.name} ग्रह ${p1.rashiName} राशि (भाव ${toDevanagariNumerals(p1.bhava)}) मा ${formatted} को दूरीमा युतिमा छन्।`,
          });
        }
      }
    }
  }

  // 4. Bhavesh Positions
  const bhaveshPositions: BhaveshPositionItem[] = [];
  for (let h = 1; h <= 12; h++) {
    const houseLord = bhavas[h - 1].lord;
    // Find the lord planet in planet list
    const lordPlanet = planets.find((p) => p.name === houseLord);

    if (lordPlanet) {
      bhaveshPositions.push({
        houseNumber: h,
        houseNameNepali: BHAVESH_NAMES[h] || `भावेश ${toDevanagariNumerals(h)}`,
        lordPlanet: lordPlanet.name,
        residingRashiName: lordPlanet.rashiName,
        residingHouseNumber: lordPlanet.bhava,
        degree: lordPlanet.degree,
        formattedDegree: lordPlanet.formattedDegree,
        nakshatraName: lordPlanet.nakshatraName,
        pada: lordPlanet.pada,
        descriptionNepali: `${BHAVESH_NAMES[h]} (${lordPlanet.name}) ${lordPlanet.rashiName} राशि, भाव ${toDevanagariNumerals(lordPlanet.bhava)} मा ${lordPlanet.formattedDegree} अंशमा स्थित छ।`,
      });
    }
  }

  return {
    calculationSystemNepali: systemName,
    lagnaInfo,
    lagnaSensitivity,
    bhavas,
    bhavachalitHouses: chalitHouses,
    allDrishti,
    conjunctions,
    bhaveshPositions,
  };
}

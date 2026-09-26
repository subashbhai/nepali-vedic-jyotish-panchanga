import {
  DivisionalChartType,
  DivisionalChart,
  ChartHouse,
  LagnaInfo,
  PlanetPosition,
  RashiInfo
} from '../types/astrology';
import { RASHI_DATA } from '../data/rashiData';

/**
 * Classical Shodashvarga (16 Divisional Charts) Calculation Engine
 * Adheres strictly to Parashari Maharshi rules for all 16 Vargas.
 */

// Helper to determine element of a sign (1: Fire, 2: Earth, 3: Air, 4: Water)
function getSignElement(rashiId: number): 'अग्नि' | 'पृथ्वी' | 'वायु' | 'जल' {
  const elemMap: Array<'अग्नि' | 'पृथ्वी' | 'वायु' | 'जल'> = ['अग्नि', 'पृथ्वी', 'वायु', 'जल'];
  return elemMap[(rashiId - 1) % 4];
}

// Helper to determine mobility quality (1: Movable/चर, 2: Fixed/स्थिर, 3: Dual/द्विस्वभाव)
function getSignQuality(rashiId: number): 'चर' | 'स्थिर' | 'द्विस्वभाव' {
  const qualMap: Array<'चर' | 'स्थिर' | 'द्विस्वभाव'> = ['चर', 'स्थिर', 'द्विस्वभाव'];
  return qualMap[(rashiId - 1) % 3];
}

/**
 * Calculate Divisional Sign ID (1 to 12) for a given Rashi (1-12) and Degree (0-30)
 */
export function calculateVargaRashiId(
  type: DivisionalChartType,
  rashiId: number,
  degree: number
): number {
  const deg = Math.min(Math.max(degree, 0), 29.999999);
  const isOdd = rashiId % 2 !== 0;
  const quality = getSignQuality(rashiId);
  const element = getSignElement(rashiId);

  switch (type) {
    case 'D1': // Rashi Chart
      return rashiId;

    case 'D2': { // Hora Chart
      // Odd sign: 0-15° Sun (Leo = 5), 15-30° Moon (Cancer = 4)
      // Even sign: 0-15° Moon (Cancer = 4), 15-30° Sun (Leo = 5)
      const isFirstHalf = deg < 15;
      if (isOdd) {
        return isFirstHalf ? 5 : 4;
      } else {
        return isFirstHalf ? 4 : 5;
      }
    }

    case 'D3': { // Drekkana Chart (10° parts)
      // 0-10°: Same sign (1st)
      // 10-20°: 5th sign from current
      // 20-30°: 9th sign from current
      const part = Math.floor(deg / 10); // 0, 1, 2
      const offset = part * 4; // 0, 4, 8
      return ((rashiId - 1 + offset) % 12) + 1;
    }

    case 'D4': { // Chaturthamsha / Turyamsha (7.5° parts)
      // 0-7.5°: 1st, 7.5-15°: 4th, 15-22.5°: 7th, 22.5-30°: 10th
      const part = Math.floor(deg / 7.5); // 0, 1, 2, 3
      const offset = part * 3; // 0, 3, 6, 9
      return ((rashiId - 1 + offset) % 12) + 1;
    }

    case 'D7': { // Saptamsha (4°17'08.57" = 30/7)
      // Odd sign: Start from same sign
      // Even sign: Start from 7th sign
      const part = Math.floor(deg / (30 / 7)); // 0 to 6
      const startSign = isOdd ? rashiId : ((rashiId + 6 - 1) % 12) + 1;
      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D9': { // Navamsha (3°20' = 30/9)
      // Fiery (Aries, Leo, Sag): Starts Aries (1)
      // Earthy (Taurus, Vir, Cap): Starts Capricorn (10)
      // Airy (Gemini, Lib, Aq): Starts Libra (7)
      // Watery (Cancer, Sco, Pis): Starts Cancer (4)
      const part = Math.floor(deg / (30 / 9)); // 0 to 8
      let startSign = 1;
      if (element === 'अग्नि') startSign = 1;
      else if (element === 'पृथ्वी') startSign = 10;
      else if (element === 'वायु') startSign = 7;
      else if (element === 'जल') startSign = 4;

      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D10': { // Dashamsha (3° = 30/10)
      // Odd sign: Start from same sign
      // Even sign: Start from 9th sign from current
      const part = Math.floor(deg / 3); // 0 to 9
      const startSign = isOdd ? rashiId : ((rashiId + 8 - 1) % 12) + 1;
      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D12': { // Dwadashamsha (2°30' = 30/12)
      // Start from same sign for all signs
      const part = Math.floor(deg / 2.5); // 0 to 11
      return ((rashiId - 1 + part) % 12) + 1;
    }

    case 'D16': { // Shodashamsha / Kalamsa (1°52'30" = 30/16)
      // Movable (चर): Start Aries (1)
      // Fixed (स्थिर): Start Leo (5)
      // Dual (द्विस्वभाव): Start Sagittarius (9)
      const part = Math.floor(deg / (30 / 16)); // 0 to 15
      let startSign = 1;
      if (quality === 'चर') startSign = 1;
      else if (quality === 'स्थिर') startSign = 5;
      else if (quality === 'द्विस्वभाव') startSign = 9;

      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D20': { // Vimshamsha (1°30' = 30/20)
      // Movable (चर): Start Aries (1)
      // Fixed (स्थिर): Start Sagittarius (9)
      // Dual (द्विस्वभाव): Start Leo (5)
      const part = Math.floor(deg / 1.5); // 0 to 19
      let startSign = 1;
      if (quality === 'चर') startSign = 1;
      else if (quality === 'स्थिर') startSign = 9;
      else if (quality === 'द्विस्वभाव') startSign = 5;

      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D24': { // Chaturvimshamsha / Siddhamsa (1°15' = 30/24)
      // Odd sign: Start Leo (5)
      // Even sign: Start Cancer (4)
      const part = Math.floor(deg / 1.25); // 0 to 23
      const startSign = isOdd ? 5 : 4;
      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D27': { // Saptavimshamsha / Nakshatramsha (1°06'40" = 30/27)
      // Fiery: Start Aries (1)
      // Earthy: Start Cancer (4)
      // Airy: Start Libra (7)
      // Watery: Start Capricorn (10)
      const part = Math.floor(deg / (30 / 27)); // 0 to 26
      let startSign = 1;
      if (element === 'अग्नि') startSign = 1;
      else if (element === 'पृथ्वी') startSign = 4;
      else if (element === 'वायु') startSign = 7;
      else if (element === 'जल') startSign = 10;

      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D30': { // Trimshamsha (Classical Unequal Degrees for Odd/Even Signs)
      if (isOdd) {
        // Odd Sign: 0-5° Aries (1), 5-10° Aquarius (11), 10-18° Sagittarius (9), 18-25° Gemini (3), 25-30° Taurus (2)
        if (deg < 5) return 1; // Aries (Mars)
        if (deg < 10) return 11; // Aquarius (Saturn)
        if (deg < 18) return 9; // Sagittarius (Jupiter)
        if (deg < 25) return 3; // Gemini (Mercury)
        return 2; // Taurus (Venus)
      } else {
        // Even Sign: 0-5° Taurus (2), 5-12° Gemini (3), 12-20° Sagittarius (9), 20-25° Aquarius (11), 25-30° Aries (1)
        if (deg < 5) return 2; // Taurus (Venus)
        if (deg < 12) return 3; // Gemini (Mercury)
        if (deg < 20) return 9; // Sagittarius (Jupiter)
        if (deg < 25) return 11; // Aquarius (Saturn)
        return 1; // Aries (Mars)
      }
    }

    case 'D40': { // Khavedamsha (0°45' = 30/40)
      // Odd sign: Start Aries (1)
      // Even sign: Start Libra (7)
      const part = Math.floor(deg / (30 / 40)); // 0 to 39
      const startSign = isOdd ? 1 : 7;
      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D45': { // Akshavedamsha (0°40' = 30/45)
      // Movable: Start Aries (1)
      // Fixed: Start Leo (5)
      // Dual: Start Sagittarius (9)
      const part = Math.floor(deg / (30 / 45)); // 0 to 44
      let startSign = 1;
      if (quality === 'चर') startSign = 1;
      else if (quality === 'स्थिर') startSign = 5;
      else if (quality === 'द्विस्वभाव') startSign = 9;

      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D60': { // Shashtiamsha (0°30' = 30/60)
      // 60 divisions of 30 minutes each.
      // Parashari rule: Start from same sign for all signs
      const part = Math.floor(deg / 0.5); // 0 to 59
      return ((rashiId - 1 + part) % 12) + 1;
    }

    default:
      return rashiId;
  }
}

/**
 * Metadata & Descriptions for Shodashvarga
 */
export const VARGA_METADATA: Record<DivisionalChartType, { title: string; titleNepali: string; description: string }> = {
  D1: {
    title: 'Lagna Chart (D1)',
    titleNepali: 'जन्म लग्न कुण्डली (D-1)',
    description: 'मुख्य शरीर, व्यक्तित्व, स्वास्थ्य र समग्र जीवन यात्राको प्रतिनिधि कुण्डली।',
  },
  D2: {
    title: 'Hora Chart (D2)',
    titleNepali: 'होरा कुण्डली (D-2)',
    description: 'सम्पत्ति, धन, आर्थिक समृद्धि र पारिवारिक स्रोतको विश्लेषण।',
  },
  D3: {
    title: 'Drekkana Chart (D3)',
    titleNepali: 'द्रेष्काण कुण्डली (D-3)',
    description: 'दाजुभाइ, दिदीबहिनी, पराक्रम, साहस र यात्राको विश्लेषण।',
  },
  D4: {
    title: 'Chaturthamsha Chart (D4)',
    titleNepali: 'चतुर्थांश कुण्डली (D-4)',
    description: 'घर, जग्गा, अचल सम्पत्ति र भाग्य सुखको विश्लेषण।',
  },
  D7: {
    title: 'Saptamsha Chart (D7)',
    titleNepali: 'सप्तमांश कुण्डली (D-7)',
    description: 'सन्तान, वंश वृद्धि, नातिनातिना र सिर्जनात्मक क्षमता।',
  },
  D9: {
    title: 'Navamsha Chart (D9)',
    titleNepali: 'नवांश कुण्डली (D-9)',
    description: 'विवाह, दाम्पत्य सुख, भाग्य र ग्रहको वास्तविक आत्मिक बल।',
  },
  D10: {
    title: 'Dashamsha Chart (D10)',
    titleNepali: 'दशांश कुण्डली (D-10)',
    description: 'करियर, व्यवसाय, पद-प्रतिष्ठा, नौकरी र समाजमा प्रभाव।',
  },
  D12: {
    title: 'Dwadashamsha Chart (D12)',
    titleNepali: 'द्वादशांश कुण्डली (D-12)',
    description: 'माता-पिता, पितृ कुल, वंशानुगत गुण र पूर्वज सम्बन्धी।',
  },
  D16: {
    title: 'Shodashamsha Chart (D16)',
    titleNepali: 'षोडशांश कुण्डली (D-16)',
    description: 'वाहन सुख, यात्रा, मानसिक शान्ति र भौतिक सुख-सुविधा।',
  },
  D20: {
    title: 'Vimshamsha Chart (D20)',
    titleNepali: 'विंशांश कुण्डली (D-20)',
    description: 'आध्यात्मिक प्रगति, उपासना, मन्त्रसिद्धि र भक्तिमार्ग।',
  },
  D24: {
    title: 'Chaturvimshamsha Chart (D24)',
    titleNepali: 'चतुर्विंशांश कुण्डली (D-24)',
    description: 'उच्च शिक्षा, ज्ञान, विद्या र बौद्धिक क्षमता।',
  },
  D27: {
    title: 'Saptavimshamsha Chart (D27)',
    titleNepali: 'सप्तविंशांश (भांश) कुण्डली (D-27)',
    description: 'शारीरिक तथा मानसिक बल, कमजोरी र आत्मिक सहनशीलता।',
  },
  D30: {
    title: 'Trimshamsha Chart (D30)',
    titleNepali: 'त्रिंशांश कुण्डली (D-30)',
    description: 'अनिष्ट, पापग्रह प्रभाव, दुर्घटना, रोग र विपत्ति।',
  },
  D40: {
    title: 'Khavedamsha Chart (D40)',
    titleNepali: 'खवेदांश कुण्डली (D-40)',
    description: 'मातृकुल तथा वंश परम्परागत शुभ-अशुभ फल।',
  },
  D45: {
    title: 'Akshavedamsha Chart (D45)',
    titleNepali: 'अक्षवेदांश कुण्डली (D-45)',
    description: 'चरित्र, नैतिक आचरण, संस्कार र सूक्ष्म चरित्र।',
  },
  D60: {
    title: 'Shashtiamsha Chart (D60)',
    titleNepali: 'षष्ट्यंश कुण्डली (D-60)',
    description: 'पूर्वजन्मको कर्माधिकार, संचित कर्म र समग्र सूक्ष्म जीवन चक्र।',
  },
};

/**
 * Generate complete Divisional Chart object for any of the 16 Vargas
 */
export function generateDivisionalChartEx(
  type: DivisionalChartType,
  lagnaInfo: LagnaInfo,
  planets: PlanetPosition[]
): DivisionalChart {
  const meta = VARGA_METADATA[type] || VARGA_METADATA.D1;

  // Determine Divisional Lagna Rashi
  const divLagnaRashiId = calculateVargaRashiId(type, lagnaInfo.rashiId, lagnaInfo.degree);

  // Build 12 houses starting from divisional Lagna Rashi
  const houses: ChartHouse[] = [];

  for (let h = 1; h <= 12; h++) {
    const rashiId = ((divLagnaRashiId - 1 + h - 1) % 12) + 1;
    const rashi = RASHI_DATA[rashiId - 1];

    // Find all planets falling into this divisional sign
    const housePlanets = planets.filter((p) => {
      const pDivRashiId = calculateVargaRashiId(type, p.rashiId, p.degree);
      return pDivRashiId === rashiId;
    });

    houses.push({
      houseNumber: h,
      rashiId,
      rashiName: rashi.name,
      planets: housePlanets,
    });
  }

  return {
    type,
    title: meta.title,
    titleNepali: meta.titleNepali,
    description: meta.description,
    houses,
  };
}

import { BirthDetails, LagnaInfo, PlanetPosition, PlanetName } from '../types/astrology';
import { 
  getJulianDay, 
  getAyanamsa, 
  calculateLagna, 
  calculatePlanetaryPositions, 
  RASHI_DATA 
} from './astroCalculations';
import { toDevanagariNumerals } from './nepaliCalendar';
import { PrashnaItem, PrashnaShloka } from '../data/prashna100Database';

export interface PrashnaEvaluationResult {
  prashnaItem: PrashnaItem;
  chartMode: 'horary' | 'natal';
  chartTimestampText: string;
  lagnaInfo: LagnaInfo;
  planets: PlanetPosition[];
  lagneshaName: PlanetName;
  lagneshaPosition?: PlanetPosition;
  karyaBhava: number;
  karyaRashiId: number;
  karyaRashiName: string;
  karyeshaName: PlanetName;
  karyeshaPosition?: PlanetPosition;
  moonPosition?: PlanetPosition;
  chandraBalaDesc: string;
  lagneshaKaryeshaRelation: string;
  relationType: 'conjunction' | 'parivartana' | 'mutual_aspect' | 'trikona' | 'upachaya' | 'shadashtaka' | 'dvir-dvadasha' | 'neutral';
  successScore: number; // 0 to 100
  verdictGrade: 'excellent' | 'good' | 'moderate' | 'challenging';
  verdictTitle: string;
  verdictSummary: string;
  timingForecast: string;
  favorableDirection: string;
  kundaliAnalysisNepali: string;
  shlokaCitation: PrashnaShloka;
  vedicRemedy: string;
}

// Map Rashi ID (1-12) to Lord Planet Name
export const RASHI_LORD_MAP: Record<number, PlanetName> = {
  1: 'मंगल',  // मेष
  2: 'शुक्र',  // वृष
  3: 'बुध',   // मिथुन
  4: 'चन्द्र',  // कर्कट
  5: 'सूर्य',  // सिंह
  6: 'बुध',   // कन्या
  7: 'शुक्र',  // तुला
  8: 'मंगल',  // वृश्चिक
  9: 'गुरु',   // धनु
  10: 'शनि',  // मकर
  11: 'शनि',  // कुम्भ
  12: 'गुरु',  // मीन
};

// House Names in Nepali
export const BHAVA_NAMES_NEPALI: Record<number, string> = {
  1: 'प्रथम भाव (तनु / लग्न)',
  2: 'द्वितीय भाव (धन / कुटुम्ब)',
  3: 'तृतीय भाव (सहज / पराक्रम)',
  4: 'चतुर्थ भाव (सुख / बन्धु / मातृ)',
  5: 'पञ्चम भाव (पुत्र / विद्या / बुद्धि)',
  6: 'षष्ठ भाव (रिपु / रोग / ऋण)',
  7: 'सप्तम भाव (जाया / व्यापार / साझेदारी)',
  8: 'अष्टम भाव (आयु / रन्ध्र / संकट)',
  9: 'नवम भाव (भाग्य / धर्म / गुरु)',
  10: 'दशम भाव (कर्म / राज्य / आजीविका)',
  11: 'एकादश भाव (आय / लाभ / मनोरथ)',
  12: 'द्वादश भाव (व्यय / मोक्ष / विदेश)',
};

/**
 * Calculate Horary Chart for the current instant or custom moment
 */
export function calculateHoraryChart(
  customDateAD?: string,
  customTime?: string,
  latitude = 27.7172,
  longitude = 85.3240,
  timeZone = 5.75
): { lagnaInfo: LagnaInfo; planets: PlanetPosition[]; timestampText: string } {
  const now = new Date();
  const dateAD = customDateAD || now.toISOString().slice(0, 10);
  
  let timeStr = customTime;
  if (!timeStr) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeStr = `${hours}:${minutes}:${seconds}`;
  }

  const jd = getJulianDay(dateAD, timeStr, timeZone);
  const ayanamsa = getAyanamsa(jd);
  const lagnaInfo = calculateLagna(jd, latitude, longitude, ayanamsa);
  const planets = calculatePlanetaryPositions(jd, ayanamsa, lagnaInfo.rashiId);

  const timestampText = `${dateAD} समय: ${timeStr} (काठमाडौं / स्थानीय समय)`;
  return { lagnaInfo, planets, timestampText };
}

/**
 * Get Chart for Natal Profile
 */
export function calculateNatalChart(
  profile: BirthDetails
): { lagnaInfo: LagnaInfo; planets: PlanetPosition[]; timestampText: string } {
  const lat = profile.location?.latitude || 27.7172;
  const lon = profile.location?.longitude || 85.3240;
  const tz = profile.location?.timezone || 5.75;
  const timeStr = profile.timeSeconds ? `${profile.time}:${profile.timeSeconds}` : profile.time;

  const jd = getJulianDay(profile.dateAD, timeStr, tz);
  const ayanamsa = getAyanamsa(jd);
  const lagnaInfo = calculateLagna(jd, lat, lon, ayanamsa);
  const planets = calculatePlanetaryPositions(jd, ayanamsa, lagnaInfo.rashiId);

  const timestampText = `जन्म मिति: ${profile.dateBS || profile.dateAD} समय: ${profile.time} (${profile.location?.name || 'स्थानीय'})`;
  return { lagnaInfo, planets, timestampText };
}

/**
 * Core Evaluation Engine for Prashna Jyotish
 * Derives predictions strictly from:
 * 1. Lagna & Lagnesha (Querent's vitality & intent)
 * 2. Karya Bhava & Karyesha (Matter of query)
 * 3. Chandra Bala (State of mind, auspicious timing)
 * 4. Mutual Aspects & Tajika Sambandha
 * 5. Significator (Karaka) Planets
 */
export function evaluatePrashna(
  question: PrashnaItem,
  lagnaInfo: LagnaInfo,
  planets: PlanetPosition[],
  chartMode: 'horary' | 'natal',
  timestampText: string
): PrashnaEvaluationResult {
  // 1. Identify Lagnesha
  const lagneshaName = (lagnaInfo.lord as PlanetName) || RASHI_LORD_MAP[lagnaInfo.rashiId] || 'सूर्य';
  const lagnesha = planets.find(p => p.name === lagneshaName);

  // 2. Identify Karya Bhava and Karyesha
  const karyaBhava = question.rulingHouse;
  // Calculate Rashi falling on Karya Bhava (1-indexed)
  const karyaRashiId = ((lagnaInfo.rashiId - 1 + (karyaBhava - 1)) % 12) + 1;
  const karyaRashiInfo = RASHI_DATA[karyaRashiId - 1];
  const karyaRashiName = karyaRashiInfo ? karyaRashiInfo.name : 'मेष';
  const karyeshaName = RASHI_LORD_MAP[karyaRashiId] || 'गुरु';
  const karyesha = planets.find(p => p.name === karyeshaName);

  // 3. Moon Position (Chandra Bala)
  const moon = planets.find(p => p.name === 'चन्द्र');

  // 4. Calculate Lagnesha - Karyesha Relationship & Distance
  let relationType: PrashnaEvaluationResult['relationType'] = 'neutral';
  let relationDesc = 'सामान्य सम्बन्ध';
  let relationScore = 0;

  if (lagnesha && karyesha) {
    const lagneshaBhava = lagnesha.bhava || 1;
    const karyeshaBhava = karyesha.bhava || 1;
    
    // Check Parivartana (Mutual sign exchange or Lagnesha in Karya Bhava & vice versa)
    if (lagneshaBhava === karyaBhava && karyeshaBhava === 1) {
      relationType = 'parivartana';
      relationDesc = 'परिवर्तन महायोग (शीघ्र कार्यसिद्धि)';
      relationScore = 30;
    } else if (lagneshaBhava === karyeshaBhava) {
      relationType = 'conjunction';
      relationDesc = 'युति सम्बन्ध (लग्नेश र कार्येश एउटै भावमा एकाकार)';
      relationScore = 25;
    } else {
      // Angular distance in Bhavas (from lagnesha to karyesha)
      const diff = ((karyeshaBhava - lagneshaBhava + 12) % 12) + 1;
      
      if (diff === 7) {
        relationType = 'mutual_aspect';
        relationDesc = 'समसप्तक दृष्टि (परस्पर प्रत्यक्ष सहयोग र कार्यसिद्धि)';
        relationScore = 22;
      } else if (diff === 5 || diff === 9) {
        relationType = 'trikona';
        relationDesc = 'नवम-पञ्चम दृष्टि (दैवी कृपा र सहज सफलता)';
        relationScore = 20;
      } else if (diff === 3 || diff === 11) {
        relationType = 'upachaya';
        relationDesc = 'तृतीय-एकादश मैत्री सम्बन्ध (प्रयास र पुरुषार्थले लाभ)';
        relationScore = 15;
      } else if (diff === 6 || diff === 8) {
        relationType = 'shadashtaka';
        relationDesc = 'षडाष्टक योग (संघर्ष, ढिलाइ वा बाधाको योग)';
        relationScore = -18;
      } else if (diff === 2 || diff === 12) {
        relationType = 'dvir-dvadasha';
        relationDesc = 'द्विर्द्वादश सम्बन्ध (खर्च, दूरी वा मानसिक तनाव)';
        relationScore = -10;
      } else {
        relationType = 'neutral';
        relationDesc = 'मध्यम सम्बन्ध (सामान्य दृष्टि प्रभाव)';
        relationScore = 5;
      }
    }
  }

  // 5. Lagnesha Strength
  let lagneshaScore = 10;
  if (lagnesha) {
    const bhava = lagnesha.bhava || 1;
    // Kendra or Trikona
    if ([1, 4, 7, 10].includes(bhava)) lagneshaScore += 10;
    else if ([5, 9].includes(bhava)) lagneshaScore += 12;
    else if ([3, 11].includes(bhava)) lagneshaScore += 8;
    else if ([6, 8, 12].includes(bhava)) lagneshaScore -= 12;

    // Dignity
    if (lagnesha.dignity === 'उच्च') lagneshaScore += 12;
    else if (lagnesha.dignity === 'स्वक्षेत्र') lagneshaScore += 10;
    else if (lagnesha.dignity === 'नीच') lagneshaScore -= 12;

    if (lagnesha.isCombust) lagneshaScore -= 8;
    if (lagnesha.isRetrograde && lagnesha.name !== 'राहु' && lagnesha.name !== 'केतु') {
      lagneshaScore += 4; // Retrograde planets in Prashna have Chesta Bala
    }
  }

  // 6. Karyesha Strength
  let karyeshaScore = 10;
  if (karyesha) {
    const bhava = karyesha.bhava || 1;
    if ([1, 4, 7, 10].includes(bhava)) karyeshaScore += 12;
    else if ([5, 9].includes(bhava)) karyeshaScore += 14;
    else if ([3, 11].includes(bhava)) karyeshaScore += 10;
    else if ([6, 8, 12].includes(bhava)) karyeshaScore -= 14;

    if (karyesha.dignity === 'उच्च') karyeshaScore += 14;
    else if (karyesha.dignity === 'स्वक्षेत्र') karyeshaScore += 12;
    else if (karyesha.dignity === 'नीच') karyeshaScore -= 14;

    if (karyesha.isCombust) karyeshaScore -= 10;
  }

  // 7. Chandra Bala (Moon Strength)
  let moonScore = 8;
  let chandraBalaDesc = 'सामान्य चन्द्रबल';
  if (moon) {
    const bhava = moon.bhava || 1;
    if ([1, 4, 7, 10].includes(bhava)) {
      moonScore += 12;
      chandraBalaDesc = `केन्द्र भाव (${toDevanagariNumerals(bhava)}ौँ भाव) मा शुभ चन्द्रमा (प्रसन्न मन, कार्य अनुकूलता)`;
    } else if ([5, 9].includes(bhava)) {
      moonScore += 14;
      chandraBalaDesc = `त्रिकोण भाव (${toDevanagariNumerals(bhava)}ौँ भाव) मा शुभ चन्द्रमा (दैवी साथ, पूर्ण मनोरथ)`;
    } else if ([3, 11].includes(bhava)) {
      moonScore += 10;
      chandraBalaDesc = `उपचय भाव (${toDevanagariNumerals(bhava)}ौँ भाव) मा चन्द्रमा (उत्साह, पुरुषार्थ तथा सिद्धि)`;
    } else if (bhava === 6) {
      moonScore -= 6;
      chandraBalaDesc = 'षष्ठ भावमा चन्द्रमा (रोग, शत्रु वा अदालती झमेलाको चिन्ता)';
    } else if (bhava === 8) {
      moonScore -= 14;
      chandraBalaDesc = 'अष्टम भावमा चन्द्रमा (चन्द्रमा अष्टमस्थ हुँदा कार्यमा विघ्न र मानसिक उद्वेग)';
    } else if (bhava === 12) {
      moonScore -= 8;
      chandraBalaDesc = 'द्वादश भावमा चन्द्रमा (व्यर्थको चिन्ता र खर्चको योग)';
    }

    if (moon.dignity === 'उच्च' || moon.dignity === 'स्वक्षेत्र') {
      moonScore += 8;
      chandraBalaDesc += ' [उच्च/स्वगृही चन्द्रबली]';
    } else if (moon.dignity === 'नीच') {
      moonScore -= 10;
      chandraBalaDesc += ' [नीच राशिमा निर्बली चन्द्रमा]';
    }
  }

  // 8. Planets sitting in Karya Bhava
  let karyaBhavaOccupantsScore = 0;
  const occupants = planets.filter(p => p.bhava === karyaBhava);
  occupants.forEach(p => {
    if (['गुरु', 'शुक्र', 'बुध'].includes(p.name)) {
      karyaBhavaOccupantsScore += 8;
    } else if (['शनि', 'राहु', 'केतु'].includes(p.name)) {
      if ([3, 6, 11].includes(karyaBhava)) {
        karyaBhavaOccupantsScore += 6; // Malefics good in 3, 6, 11
      } else {
        karyaBhavaOccupantsScore -= 6;
      }
    }
  });

  // Calculate Total Probability (0-100)
  // Baseline: 45
  let rawScore = 42 + lagneshaScore + karyeshaScore + relationScore + moonScore + karyaBhavaOccupantsScore;
  let successScore = Math.max(18, Math.min(97, Math.round(rawScore)));

  // Determine Verdict Grade and Title
  let verdictGrade: PrashnaEvaluationResult['verdictGrade'] = 'moderate';
  let verdictTitle = '';
  let verdictSummary = '';

  if (successScore >= 80) {
    verdictGrade = 'excellent';
    verdictTitle = 'पूर्ण कार्यसिद्धि योग (अत्यन्त शुभ एवं शीघ्र सफलता)';
    verdictSummary = 'प्रस्तुत कुण्डलीमा लग्नेश र कार्येशको बलियो शुभ सम्बन्ध तथा चन्द्रबल अनुकूल रहेकाले सोचेको कार्यमा शीघ्र एवं निर्विघ्न सफलता मिल्ने शास्त्रीय सङ्केत देखिन्छ।';
  } else if (successScore >= 65) {
    verdictGrade = 'good';
    verdictTitle = 'प्रयासपछि सफलता योग (शुभ फल प्राप्ति)';
    verdictSummary = 'कार्येश र लग्नेशको स्थिति अनुकूल छ। केही परिश्रम, योजनाबद्ध प्रयास र धैर्यता राखेमा कार्यमा अवश्य सिद्धि प्राप्त हुनेछ।';
  } else if (successScore >= 45) {
    verdictGrade = 'moderate';
    verdictTitle = 'मध्यम तथा ढिलाइ योग (सङ्घर्ष र सतर्कता आवश्यक)';
    verdictSummary = 'ग्रहहरूको स्थिति मध्यम छ। केही ढिलाइ, अन्योल वा दोधारको स्थिति आउन सक्छ। नियमित प्रयास र निर्दिष्ट वैदिक उपाय गरेर अघि बढ्नु बुद्धिमानी हुनेछ।';
  } else {
    verdictGrade = 'challenging';
    verdictTitle = 'बाधा तथा सतर्कता योग (वैदिक शान्ति आवश्यक)';
    verdictSummary = 'कुण्डलीमा कार्येश वा लग्नेशको प्रतिकूल स्थिति तथा चन्द्रमा कमजोर रहेकाले तत्काल काममा अवरोध आउन सक्छ। हतारमा निर्णय नगरी वैदिक शान्ति र इष्ट उपासना गर्नु श्रेयस्कर छ।';
  }

  // 9. Timing Forecast (समय निर्धारण)
  // Check Rashi quality of Lagna and Karya Bhava
  const lagnaRashi = RASHI_DATA[lagnaInfo.rashiId - 1];
  const karyaRashi = RASHI_DATA[karyaRashiId - 1];
  
  let timingForecast = '';
  if (lagnaRashi?.quality === 'चर' || karyaRashi?.quality === 'चर') {
    timingForecast = 'शीघ्र (केही दिनदेखि १ महिनाभित्र) कार्य बन्ने वा ठोस नतिजा देखिने योग छ।';
  } else if (lagnaRashi?.quality === 'द्विस्वभाव' || karyaRashi?.quality === 'द्विस्वभाव') {
    timingForecast = 'मध्यम समय (२ देखि ४ महिनाभित्र) धैर्य र प्रयत्नपछि कार्य फलित हुनेछ।';
  } else {
    timingForecast = 'दीर्घकालीन (५ देखि ९ महिना वा १ वर्षभित्र) निरन्तरता र धैर्यता आवश्यक छ।';
  }

  // 10. Direction (दिशानिर्देश)
  const favorableDirection = question.favorableDirection || 'उत्तर वा ईशान कोण';

  // 11. Dynamic Vedic Shastra Kundali Analysis
  const lagneshaBhavaText = lagnesha ? `${toDevanagariNumerals(lagnesha.bhava || 1)}ौँ भाव` : 'लग्न';
  const karyeshaBhavaText = karyesha ? `${toDevanagariNumerals(karyesha.bhava || 1)}ौँ भाव` : 'कार्य भाव';
  const moonBhavaText = moon ? `${toDevanagariNumerals(moon.bhava || 1)}ौँ भाव` : 'चन्द्र भाव';

  const occupantsText = occupants.length > 0 
    ? occupants.map(p => p.name).join(', ') + ' ग्रह'
    : 'कुनै प्रत्यक्ष पाप वा क्रूर ग्रह नरहेको';

  const kundaliAnalysisNepali = `
१. **प्रश्न लग्न तथा प्रच्छक बल:** प्रश्न लग्न **${lagnaInfo.rashiName}** (स्वामी: ${lagneshaName}) रहेको छ। लग्नेश **${lagneshaBhavaText}** मा ${lagnesha?.dignity || 'सामान्य'} अवस्थामा विराजमान छन्।
२. **कार्य भाव तथा कार्येश बल:** प्रश्न सम्बन्धित **${BHAVA_NAMES_NEPALI[karyaBhava] || `${karyaBhava}ौँ भाव`}** मा **${karyaRashiName}** राशि परेको छ। यस भावका स्वामी कार्येश **${karyeshaName}** कुण्डलीको **${karyeshaBhavaText}** मा स्थित छन्।
३. **लग्नेश-कार्येश सम्बन्ध:** लग्नेश र कार्येशबीच **${relationDesc}** रहेको छ।
४. **चन्द्रमाको स्थिति (मनोबल):** चन्द्रमा **${moonBhavaText}** मा **${moon?.rashiName || ''}** राशिमा रही **${chandraBalaDesc}** निर्माण गरेका छन्।
५. **कार्य भावको अवस्था:** कार्य भावमा **${occupantsText}** रहेकाले कार्यक्षेत्रमा सोही अनुसारको प्रभाव पर्नेछ।
६. **शास्त्रीय निष्कर्ष:** बृहत् पराशर होरा शास्त्र, प्रश्न मार्ग तथा ताजिक नीलकण्ठीको सिद्धान्त अनुसार तपाईंको कार्यसिद्धि सम्भावना **${toDevanagariNumerals(successScore)}%** रहेको छ।
`.trim();

  return {
    prashnaItem: question,
    chartMode,
    chartTimestampText: timestampText,
    lagnaInfo,
    planets,
    lagneshaName,
    lagneshaPosition: lagnesha,
    karyaBhava,
    karyaRashiId,
    karyaRashiName,
    karyeshaName,
    karyeshaPosition: karyesha,
    moonPosition: moon,
    chandraBalaDesc,
    lagneshaKaryeshaRelation: relationDesc,
    relationType,
    successScore,
    verdictGrade,
    verdictTitle,
    verdictSummary,
    timingForecast,
    favorableDirection,
    kundaliAnalysisNepali,
    shlokaCitation: question.shloka,
    vedicRemedy: question.vedicRemedy,
  };
}

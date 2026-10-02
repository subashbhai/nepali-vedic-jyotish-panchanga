/**
 * Vastu Core — Directions Module
 * Standard 8-direction and 16-direction Vedic Vastu compass architecture
 * Includes Sanskrit, Nepali, and English direction attributes, deities, and degree bands.
 */

export type VastuPrimaryDirection = 
  | 'N' 
  | 'NE' 
  | 'E' 
  | 'SE' 
  | 'S' 
  | 'SW' 
  | 'W' 
  | 'NW' 
  | 'CENTER';

export type Vastu16Direction =
  | 'N'
  | 'NNE'
  | 'NE'
  | 'ENE'
  | 'E'
  | 'ESE'
  | 'SE'
  | 'SSE'
  | 'S'
  | 'SSW'
  | 'SW'
  | 'WSW'
  | 'W'
  | 'WNW'
  | 'NW'
  | 'NNW';

export interface VastuDirectionInfo {
  code: VastuPrimaryDirection;
  nameNepali: string;
  nameSanskrit: string;
  nameEnglish: string;
  angleDegree: number; // 0 to 360 (North = 0)
  degreeRange: string;
  deity: string;
  guardianLord: string;
  rulingPlanet: string;
  element: 'जल' | 'अग्नि' | 'पृथ्वी' | 'वायु' | 'आकाश';
  symbolicMeaning: string;
}

export const VASTU_PRIMARY_DIRECTIONS: VastuDirectionInfo[] = [
  {
    code: 'N',
    nameNepali: 'उत्तर',
    nameSanskrit: 'उत्तर (कुबेर दिशा)',
    nameEnglish: 'North',
    angleDegree: 0,
    degreeRange: '३३७.५° - २२.५°',
    deity: 'कुबेर / सोम',
    guardianLord: 'कुबेर (धनाध्यक्ष)',
    rulingPlanet: 'बुध',
    element: 'जल',
    symbolicMeaning: 'धन, समृद्धि, अवसर, व्यापार र नयाँ स्रोतको दिशा।',
  },
  {
    code: 'NE',
    nameNepali: 'उत्तर-पूर्व (ईशान)',
    nameSanskrit: 'ईशान कोण',
    nameEnglish: 'North-East (Ishan)',
    angleDegree: 45,
    degreeRange: '२२.५° - ६७.५°',
    deity: 'शिव / ईश / शम्भु',
    guardianLord: 'ईशान महादेव',
    rulingPlanet: 'बृहस्पति (गुरु)',
    element: 'जल',
    symbolicMeaning: 'ज्ञान, आध्यात्मिकता, मानसिक शान्ति र सकारात्मक देवऊर्जाको प्रवेशद्वार।',
  },
  {
    code: 'E',
    nameNepali: 'पूर्व',
    nameSanskrit: 'पूर्व (इन्द्र दिशा)',
    nameEnglish: 'East',
    angleDegree: 90,
    degreeRange: '६७.५° - ११२.५°',
    deity: 'इन्द्र देव / सूर्य',
    guardianLord: 'इन्द्र',
    rulingPlanet: 'सूर्य',
    element: 'वायु',
    symbolicMeaning: 'स्वास्थ्य, दीर्घायु, सामाजिक प्रतिष्ठा, यश र मान-सम्मान।',
  },
  {
    code: 'SE',
    nameNepali: 'दक्षिण-पूर्व (आग्नेय)',
    nameSanskrit: 'आग्नेय कोण',
    nameEnglish: 'South-East (Agneya)',
    angleDegree: 135,
    degreeRange: '११२.५° - १५७.५°',
    deity: 'अग्नि देव',
    guardianLord: 'अग्नि',
    rulingPlanet: 'शुक्र',
    element: 'अग्नि',
    symbolicMeaning: 'ऊर्जा, उत्साह, पाचन, भौतिक सुख, नगद प्रवाह र तेज।',
  },
  {
    code: 'S',
    nameNepali: 'दक्षिण',
    nameSanskrit: 'दक्षिण (यम दिशा)',
    nameEnglish: 'South',
    angleDegree: 180,
    degreeRange: '१५७.५° - २०२.५°',
    deity: 'यमराज / धर्मराज',
    guardianLord: 'यम',
    rulingPlanet: 'मङ्गल',
    element: 'अग्नि',
    symbolicMeaning: 'नाम, कीर्ति, स्थिरता, अनुशासन र सुरक्षा।',
  },
  {
    code: 'SW',
    nameNepali: 'दक्षिण-पश्चिम (नैऋत्य)',
    nameSanskrit: 'नैऋत्य कोण',
    nameEnglish: 'South-West (Nairritya)',
    angleDegree: 225,
    degreeRange: '२०२.५° - २४७.५°',
    deity: 'नैऋति / पितृ देव',
    guardianLord: 'निरृति (असुर/पितृ)',
    rulingPlanet: 'राहु',
    element: 'पृथ्वी',
    symbolicMeaning: 'घरको मुख्य स्थिरता, नेतृत्व, दीर्घायु, सम्बन्ध र पितृ आशीर्वाद।',
  },
  {
    code: 'W',
    nameNepali: 'पश्चिम',
    nameSanskrit: 'पश्चिम (वरुण दिशा)',
    nameEnglish: 'West',
    angleDegree: 270,
    degreeRange: '२४७.५° - २९२.५°',
    deity: 'वरुण देव',
    guardianLord: 'वरुण (जलाधिपति)',
    rulingPlanet: 'शनि',
    element: 'वायु',
    symbolicMeaning: 'प्राप्ति, लाभ, व्यापारिक मुनाफा र सन्तुष्टि।',
  },
  {
    code: 'NW',
    nameNepali: 'उत्तर-पश्चिम (वायव्य)',
    nameSanskrit: 'वायव्य कोण',
    nameEnglish: 'North-West (Vayavya)',
    angleDegree: 315,
    degreeRange: '२९२.५° - ३३७.५°',
    deity: 'वायु देव',
    guardianLord: 'पवन / वायु',
    rulingPlanet: 'चन्द्रमा',
    element: 'वायु',
    symbolicMeaning: 'सञ्चार, सम्बन्ध, सहयोग, मानसिक गतिशीलता र पाहुना सत्कार।',
  },
  {
    code: 'CENTER',
    nameNepali: 'ब्रह्मस्थान (केन्द्र)',
    nameSanskrit: 'ब्रह्मस्थान / नाभिकेन्द्र',
    nameEnglish: 'Center (Brahmasthan)',
    angleDegree: 0,
    degreeRange: 'केन्द्र भाग',
    deity: 'ब्रह्मा जी',
    guardianLord: 'ब्रह्मा (सृष्टिकर्ता)',
    rulingPlanet: 'सर्वग्रह समन्वय',
    element: 'आकाश',
    symbolicMeaning: 'समग्र घरको प्राणकेन्द्र, खुला, हलुङ्गो र पवित्र हुनुपर्ने मुख्य स्थान।',
  },
];

/**
 * Resolves degree to primary 8 directions
 */
export function getVastuDirectionFromDegree(degree: number): VastuDirectionInfo {
  const normDeg = ((degree % 360) + 360) % 360;

  if (normDeg >= 22.5 && normDeg < 67.5) {
    return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'NE')!;
  }
  if (normDeg >= 67.5 && normDeg < 112.5) {
    return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'E')!;
  }
  if (normDeg >= 112.5 && normDeg < 157.5) {
    return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'SE')!;
  }
  if (normDeg >= 157.5 && normDeg < 202.5) {
    return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'S')!;
  }
  if (normDeg >= 202.5 && normDeg < 247.5) {
    return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'SW')!;
  }
  if (normDeg >= 247.5 && normDeg < 292.5) {
    return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'W')!;
  }
  if (normDeg >= 292.5 && normDeg < 337.5) {
    return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'NW')!;
  }
  return VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'N')!;
}

/**
 * Gets direction info by code
 */
export function getVastuDirectionByCode(code: string): VastuDirectionInfo {
  const upper = code.toUpperCase();
  const found = VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === upper);
  return found || VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === 'CENTER')!;
}

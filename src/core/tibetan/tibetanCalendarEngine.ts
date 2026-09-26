/**
 * Tibetan Calendar Engine (ལོ་ཐོ་རྩིས)
 * Brihat Jyotish Professional ERP
 */

import {
  TibetanAnimal,
  TibetanAnimalId,
  TibetanElementId,
  TibetanYearInfo
} from '../../types/tibetanAstrology';
import { TIBETAN_FIVE_ELEMENTS } from './tibetanElementEngine';

export const TIBETAN_ANIMALS: Record<TibetanAnimalId, TibetanAnimal> = {
  mouse: {
    id: 'mouse',
    index: 0,
    nameNepali: 'मुसा (Tsen)',
    nameTibetan: 'བྱི (Byi)',
    nameEnglish: 'Mouse / Rat',
    fixedElementId: 'water',
    directionNepali: 'उत्तर (North)',
    nature: 'याङ (पुरुष)',
    trineGroupNepali: 'जल त्रिसङ्गम (बाँदर-मुसा-ड्रागन)',
    compatibleAnimalsNepali: ['बाँदर (Monkey)', 'ड्रागन (Dragon)', 'बँदेल (Pig)'],
    enemyAnimalNepali: 'घोडा (Horse)',
    soulDayNepali: 'बुधवार (Wednesday)',
    dangerDayNepali: 'शनिवार (Saturday)'
  },
  ox: {
    id: 'ox',
    index: 1,
    nameNepali: 'गाई-गोरु (Lang)',
    nameTibetan: 'གླང (Glang)',
    nameEnglish: 'Ox / Cow',
    fixedElementId: 'earth',
    directionNepali: 'उत्तर-पूर्व (North-East)',
    nature: 'यिन (स्त्री)',
    trineGroupNepali: 'धातु त्रिसङ्गम (सर्प-चरा-गाई)',
    compatibleAnimalsNepali: ['सर्प (Snake)', 'चरा (Bird)', 'मुसा (Mouse)'],
    enemyAnimalNepali: 'भेडा (Sheep)',
    soulDayNepali: 'शनिवार (Saturday)',
    dangerDayNepali: 'बिहीबार (Thursday)'
  },
  tiger: {
    id: 'tiger',
    index: 2,
    nameNepali: 'बाघ (Tag)',
    nameTibetan: 'སྟག (Stag)',
    nameEnglish: 'Tiger',
    fixedElementId: 'wood',
    directionNepali: 'पूर्व-उत्तर-पूर्व (East-North-East)',
    nature: 'याङ (पुरुष)',
    trineGroupNepali: 'अग्नि त्रिसङ्गम (बाघ-घोडा-कुकुर)',
    compatibleAnimalsNepali: ['घोडा (Horse)', 'कुकुर (Dog)', 'बँदेल (Pig)'],
    enemyAnimalNepali: 'बाँदर (Monkey)',
    soulDayNepali: 'बिहीबार (Thursday)',
    dangerDayNepali: 'शुक्रवार (Friday)'
  },
  rabbit: {
    id: 'rabbit',
    index: 3,
    nameNepali: 'खरायो (Yoe)',
    nameTibetan: 'ཡོས (Yos)',
    nameEnglish: 'Rabbit / Hare',
    fixedElementId: 'wood',
    directionNepali: 'पूर्व (East)',
    nature: 'यिन (स्त्री)',
    trineGroupNepali: 'काष्ठ त्रिसङ्गम (बँदेल-भेडा-खरायो)',
    compatibleAnimalsNepali: ['बँदेल (Pig)', 'भेडा (Sheep)', 'कुकुर (Dog)'],
    enemyAnimalNepali: 'चरा-भाले (Bird)',
    soulDayNepali: 'बिहीबार (Thursday)',
    dangerDayNepali: 'शुक्रवार (Friday)'
  },
  dragon: {
    id: 'dragon',
    index: 4,
    nameNepali: 'ड्रागन-मेघ (Druk)',
    nameTibetan: 'འབྲུག (\'Brug)',
    nameEnglish: 'Dragon',
    fixedElementId: 'earth',
    directionNepali: 'पूर्व-दक्षिण-पूर्व (East-South-East)',
    nature: 'याङ (पुरुष)',
    trineGroupNepali: 'जल त्रिसङ्गम (बाँदर-मुसा-ड्रागन)',
    compatibleAnimalsNepali: ['मुसा (Mouse)', 'बाँदर (Monkey)', 'भाले (Bird)'],
    enemyAnimalNepali: 'कुकुर (Dog)',
    soulDayNepali: 'आइतवार (Sunday)',
    dangerDayNepali: 'बुधवार (Wednesday)'
  },
  snake: {
    id: 'snake',
    index: 5,
    nameNepali: 'सर्प (Drul)',
    nameTibetan: 'སྦྲུལ (Sbrul)',
    nameEnglish: 'Snake',
    fixedElementId: 'fire',
    directionNepali: 'दक्षिण-दक्षिण-पूर्व (South-South-East)',
    nature: 'यिन (स्त्री)',
    trineGroupNepali: 'धातु त्रिसङ्गम (सर्प-चरा-गाई)',
    compatibleAnimalsNepali: ['गाई-गोरु (Ox)', 'चरा (Bird)', 'बाँदर (Monkey)'],
    enemyAnimalNepali: 'बँदेल (Pig)',
    soulDayNepali: 'मंगलबार (Tuesday)',
    dangerDayNepali: 'बुधवार (Wednesday)'
  },
  horse: {
    id: 'horse',
    index: 6,
    nameNepali: 'घोडा (Ta)',
    nameTibetan: 'རྟ (Rta)',
    nameEnglish: 'Horse',
    fixedElementId: 'fire',
    directionNepali: 'दक्षिण (South)',
    nature: 'याङ (पुरुष)',
    trineGroupNepali: 'अग्नि त्रिसङ्गम (बाघ-घोडा-कुकुर)',
    compatibleAnimalsNepali: ['बाघ (Tiger)', 'कुकुर (Dog)', 'भेडा (Sheep)'],
    enemyAnimalNepali: 'मुसा (Mouse)',
    soulDayNepali: 'मंगलबार (Tuesday)',
    dangerDayNepali: 'बुधवार (Wednesday)'
  },
  sheep: {
    id: 'sheep',
    index: 7,
    nameNepali: 'भेडा (Lug)',
    nameTibetan: 'ལུག (Lug)',
    nameEnglish: 'Sheep / Goat',
    fixedElementId: 'earth',
    directionNepali: 'दक्षिण-दक्षिण-पश्चिम (South-South-West)',
    nature: 'यिन (स्त्री)',
    trineGroupNepali: 'काष्ठ त्रिसङ्गम (बँदेल-भेडा-खरायो)',
    compatibleAnimalsNepali: ['खरायो (Rabbit)', 'बँदेल (Pig)', 'घोडा (Horse)'],
    enemyAnimalNepali: 'गाई-गोरु (Ox)',
    soulDayNepali: 'शुक्रवार (Friday)',
    dangerDayNepali: 'बिहीबार (Thursday)'
  },
  monkey: {
    id: 'monkey',
    index: 8,
    nameNepali: 'बाँदर (Tre)',
    nameTibetan: 'སྤྲེལ (Sprel)',
    nameEnglish: 'Monkey',
    fixedElementId: 'iron',
    directionNepali: 'पश्चिम-दक्षिण-पश्चिम (West-South-West)',
    nature: 'याङ (पुरुष)',
    trineGroupNepali: 'जल त्रिसङ्गम (बाँदर-मुसा-ड्रागन)',
    compatibleAnimalsNepali: ['मुसा (Mouse)', 'ड्रागन (Dragon)', 'सर्प (Snake)'],
    enemyAnimalNepali: 'बाघ (Tiger)',
    soulDayNepali: 'शुक्रवार (Friday)',
    dangerDayNepali: 'मंगलबार (Tuesday)'
  },
  bird: {
    id: 'bird',
    index: 9,
    nameNepali: 'चरा-भाले (Ja)',
    nameTibetan: 'བྱ (Bya)',
    nameEnglish: 'Bird / Rooster',
    fixedElementId: 'iron',
    directionNepali: 'पश्चिम (West)',
    nature: 'यिन (स्त्री)',
    trineGroupNepali: 'धातु त्रिसङ्गम (सर्प-चरा-गाई)',
    compatibleAnimalsNepali: ['गाई-गोरु (Ox)', 'सर्प (Snake)', 'ड्रागन (Dragon)'],
    enemyAnimalNepali: 'खरायो (Rabbit)',
    soulDayNepali: 'शुक्रवार (Friday)',
    dangerDayNepali: 'मंगलबार (Tuesday)'
  },
  dog: {
    id: 'dog',
    index: 10,
    nameNepali: 'कुकुर (Khyi)',
    nameTibetan: 'ཁྱི (Khyi)',
    nameEnglish: 'Dog',
    fixedElementId: 'earth',
    directionNepali: 'पश्चिम-उत्तर-पश्चिम (West-North-West)',
    nature: 'याङ (पुरुष)',
    trineGroupNepali: 'अग्नि त्रिसङ्गम (बाघ-घोडा-कुकुर)',
    compatibleAnimalsNepali: ['बाघ (Tiger)', 'घोडा (Horse)', 'खरायो (Rabbit)'],
    enemyAnimalNepali: 'ड्रागन (Dragon)',
    soulDayNepali: 'सोमवार (Monday)',
    dangerDayNepali: 'बिहीबार (Thursday)'
  },
  pig: {
    id: 'pig',
    index: 11,
    nameNepali: 'बँदेल (Phak)',
    nameTibetan: 'ཕག (Phag)',
    nameEnglish: 'Pig / Boar',
    fixedElementId: 'water',
    directionNepali: 'उत्तर-उत्तर-पश्चिम (North-North-West)',
    nature: 'यिन (स्त्री)',
    trineGroupNepali: 'काष्ठ त्रिसङ्गम (बँदेल-भेडा-खरायो)',
    compatibleAnimalsNepali: ['खरायो (Rabbit)', 'भेडा (Sheep)', 'बाघ (Tiger)'],
    enemyAnimalNepali: 'सर्प (Snake)',
    soulDayNepali: 'बुधवार (Wednesday)',
    dangerDayNepali: 'शनिवार (Saturday)'
  }
};

export const ANIMAL_ORDER: TibetanAnimalId[] = [
  'mouse',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'sheep',
  'monkey',
  'bird',
  'dog',
  'pig'
];

export const ELEMENT_POLARITY_ORDER: Array<{ elementId: TibetanElementId; polarity: 'याङ (पुरुष)' | 'यिन (स्त्री)' }> = [
  { elementId: 'wood', polarity: 'याङ (पुरुष)' },
  { elementId: 'wood', polarity: 'यिन (स्त्री)' },
  { elementId: 'fire', polarity: 'याङ (पुरुष)' },
  { elementId: 'fire', polarity: 'यिन (स्त्री)' },
  { elementId: 'earth', polarity: 'याङ (पुरुष)' },
  { elementId: 'earth', polarity: 'यिन (स्त्री)' },
  { elementId: 'iron', polarity: 'याङ (पुरुष)' },
  { elementId: 'iron', polarity: 'यिन (स्त्री)' },
  { elementId: 'water', polarity: 'याङ (पुरुष)' },
  { elementId: 'water', polarity: 'यिन (स्त्री)' }
];

// Verified Losar Dates (Tibetan New Year) for precise Gregorian-Tibetan boundary
const VERIFIED_LOSAR_DATES: Record<number, string> = {
  1950: '1950-02-18', 1951: '1951-02-07', 1952: '1952-02-26', 1953: '1953-02-14', 1954: '1954-02-04',
  1955: '1955-02-24', 1956: '1956-02-12', 1957: '1957-03-02', 1958: '1958-02-19', 1959: '1959-02-09',
  1960: '1960-02-27', 1961: '1961-02-16', 1962: '1962-02-06', 1963: '1963-02-25', 1964: '1964-02-14',
  1965: '1965-03-04', 1966: '1966-02-21', 1967: '1967-02-10', 1968: '1968-02-29', 1969: '1969-02-17',
  1970: '1970-02-07', 1971: '1971-02-26', 1972: '1972-02-16', 1973: '1973-03-05', 1974: '1974-02-23',
  1975: '1975-02-12', 1976: '1976-03-01', 1977: '1977-02-19', 1978: '1978-02-08', 1979: '1979-02-27',
  1980: '1980-02-17', 1981: '1981-02-05', 1982: '1982-02-24', 1983: '1983-02-14', 1984: '1984-03-03',
  1985: '1985-02-20', 1986: '1986-02-10', 1987: '1987-03-01', 1988: '1988-02-18', 1989: '1989-02-07',
  1990: '1990-02-26', 1991: '1991-02-15', 1992: '1992-03-05', 1993: '1993-02-22', 1994: '1994-02-11',
  1995: '1995-03-02', 1996: '1996-02-20', 1997: '1997-02-08', 1998: '1998-02-27', 1999: '1999-02-17',
  2000: '2000-02-06', 2001: '2001-02-24', 2002: '2002-02-13', 2003: '2003-03-04', 2004: '2004-02-21',
  2005: '2005-02-09', 2006: '2006-02-28', 2007: '2007-02-18', 2008: '2008-02-08', 2009: '2009-02-25',
  2010: '2010-02-14', 2011: '2011-03-05', 2012: '2012-02-22', 2013: '2013-02-11', 2014: '2014-03-02',
  2015: '2015-02-19', 2016: '2016-02-09', 2017: '2017-02-27', 2018: '2018-02-16', 2019: '2019-02-05',
  2020: '2020-02-24', 2021: '2021-02-12', 2022: '2022-03-03', 2023: '2023-02-21', 2024: '2024-02-10',
  2025: '2025-02-28', 2026: '2026-02-18', 2027: '2027-02-07', 2028: '2028-02-26', 2029: '2029-02-14',
  2030: '2030-03-05'
};

/**
 * Computes Tibetan astrological year information from Gregorian date (YYYY-MM-DD)
 */
export function calculateTibetanYear(dateAD: string): TibetanYearInfo {
  const parts = dateAD.split('-');
  const gYear = parseInt(parts[0], 10);
  const gMonth = parseInt(parts[1], 10);
  const gDay = parseInt(parts[2], 10);

  // Determine Losar Date for this Gregorian Year
  const losarDateStr = VERIFIED_LOSAR_DATES[gYear] || `${gYear}-02-15`;
  const isBeforeLosar = dateAD < losarDateStr;

  // Effective Tibetan astrological year
  const effectiveYear = isBeforeLosar ? gYear - 1 : gYear;

  // Rabjung calculation (Year 1027 was Rabjung 1, Year 1)
  const diffFrom1027 = effectiveYear - 1027;
  const rabjungNumber = Math.floor(diffFrom1027 / 60) + 1;
  const rabjungYearInCycle = (((diffFrom1027 % 60) + 60) % 60) + 1; // 1 to 60

  // Animal calculation: 1027 was Rabbit (index 3)
  const animalIdx = (((effectiveYear - 1027 + 3) % 12) + 12) % 12;
  const animalId = ANIMAL_ORDER[animalIdx];
  const animal = TIBETAN_ANIMALS[animalId];

  // Element and polarity calculation: 1027 was Fire Female (index 3 in 10-element list)
  const elementCycleIdx = (((effectiveYear - 1027 + 3) % 10) + 10) % 10;
  const { elementId, polarity } = ELEMENT_POLARITY_ORDER[elementCycleIdx];
  const element = TIBETAN_FIVE_ELEMENTS[elementId];

  // Traditional Tibetan Year Number: 127 BCE (Nyatri Tsenpo coronation) is Tibetan Royal Year (Bod Gyalo)
  // Royal Tibetan Year = Gregorian Year + 127
  const royalTibetanYear = effectiveYear + 127;

  const tibetanYearNameNepali = `${rabjungNumber}औं रबजुङ (${rabjungYearInCycle}औं वर्ष): ${element.nameNepali} ${animal.nameNepali} वर्ष [${polarity}]`;

  return {
    gregorianYear: gYear,
    tibetanYear: royalTibetanYear,
    rabjungNumber,
    rabjungYearInCycle,
    animal,
    element,
    polarity,
    tibetanYearNameNepali,
    losarDateAD: losarDateStr,
    isBeforeLosar
  };
}

/**
 * Vastu Core — Grid Module
 * Traditional Vastu Mandala and Grid Architectures:
 * 1. 8-Direction System (Ashtadisha)
 * 2. 16-Direction System (Shodashadisha)
 * 3. 32-Pada Entrance System (Dwar Pada)
 * 4. 64-Grid Mandala (Manduka Pada - 8x8)
 * 5. 81-Grid Mandala (Paramasayika Mandala - 9x9)
 */

import { VastuPrimaryDirection } from './vastuDirections';

export type VastuGridType = '8-DIRECTION' | '16-DIRECTION' | '64-MANDUKA' | '81-PARAMASAYIKA' | '32-PADA';

export interface VastuPadaCell {
  row: number; // 0 to 8 (for 9x9) or 0 to 7 (for 8x8)
  col: number;
  direction: VastuPrimaryDirection;
  deityNepali: string;
  deitySanskrit: string;
  isBrahmasthan: boolean;
  category: 'देव' | 'मनुष्य' | 'पैशाच' | 'ब्रह्म';
}

export interface VastuGridConfig {
  type: VastuGridType;
  titleNepali: string;
  descriptionNepali: string;
  totalCells: number;
  dimensions: { rows: number; cols: number };
  brahmasthanRatio: string;
}

export const VASTU_GRID_CONFIGS: Record<VastuGridType, VastuGridConfig> = {
  '8-DIRECTION': {
    type: '8-DIRECTION',
    titleNepali: 'अष्टदिशा प्रणाली (८ मुख्य दिशा + केन्द्र)',
    descriptionNepali: 'पूर्व, पश्चिम, उत्तर, दक्षिण, ईशान, आग्नेय, नैऋत्य, वायव्य र केन्द्र ब्रह्मस्थान।',
    totalCells: 9,
    dimensions: { rows: 3, cols: 3 },
    brahmasthanRatio: 'केन्द्रको १/९ भाग',
  },
  '16-DIRECTION': {
    type: '16-DIRECTION',
    titleNepali: 'षोडशदिशा प्रणाली (१६ सूक्ष्म दिशा)',
    descriptionNepali: 'प्रत्येक २२.५ डिग्रीको सूक्ष्म उर्जा क्षेत्र अनुसार १६ दिशाको विभाजन।',
    totalCells: 16,
    dimensions: { rows: 4, cols: 4 },
    brahmasthanRatio: 'केन्द्र भाग',
  },
  '64-MANDUKA': {
    type: '64-MANDUKA',
    titleNepali: 'मण्डूक मण्डल (६४ पद वास्तु मण्डल)',
    descriptionNepali: '८x८ को ६४ पद भएको परम्परागत वास्तु मण्डल, मुख्य रूपमा मन्दिर तथा आध्यात्मिक भवन निर्माणमा प्रयुक्त।',
    totalCells: 64,
    dimensions: { rows: 8, cols: 8 },
    brahmasthanRatio: 'केन्द्रका ४ पद (२x२)',
  },
  '81-PARAMASAYIKA': {
    type: '81-PARAMASAYIKA',
    titleNepali: 'परमशायिका मण्डल (८१ पद वास्तु मण्डल)',
    descriptionNepali: '९x९ को ८१ पद भएको सर्वमान्य वैदिक वास्तु मण्डल, सामान्य आवासीय घर तथा दरबार निर्माणको सर्वोपरि आधार।',
    totalCells: 81,
    dimensions: { rows: 9, cols: 9 },
    brahmasthanRatio: 'केन्द्रका ९ पद (३x३ ब्रह्मस्थान)',
  },
  '32-PADA': {
    type: '32-PADA',
    titleNepali: '३२ द्वार पद प्रणाली (३२ Vastu Entrance Pada)',
    descriptionNepali: 'घरको चारैतिर परिधिमा पर्ने ३२ वटा देवताका द्वार पद, मुख्य प्रवेशद्वार निर्धारणको शास्त्रोक्त विधि।',
    totalCells: 32,
    dimensions: { rows: 9, cols: 9 },
    brahmasthanRatio: 'परिधि बाहिरको द्वार निर्धारण',
  },
};

/**
 * 32 Classical Entrance Padas (Brihat Samhita & Manasara)
 */
export interface EntrancePadaInfo {
  index: number;
  code: string;
  nameSanskrit: string;
  direction: 'N' | 'E' | 'S' | 'W';
  directionLabelNepali: string;
  nature: 'अति शुभ' | 'शुभ' | 'मध्यम' | 'अशुभ' | 'महादोष';
  effectNepali: string;
}

export const VASTU_32_ENTRANCE_PADAS: EntrancePadaInfo[] = [
  // पूर्व दिशा (E1 - E8)
  { index: 1, code: 'E1', nameSanskrit: 'शिखी (ईशान)', direction: 'E', directionLabelNepali: 'पूर्व १ (ईशान कुना)', nature: 'अशुभ', effectNepali: 'आगोको भय र आर्थिक अस्थिरता।' },
  { index: 2, code: 'E2', nameSanskrit: 'पर्जन्य', direction: 'E', directionLabelNepali: 'पूर्व २', nature: 'मध्यम', effectNepali: 'कन्या सन्तान वृद्धि, सामान्य फल।' },
  { index: 3, code: 'E3', nameSanskrit: 'जयन्त', direction: 'E', directionLabelNepali: 'पूर्व ३ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'अपार धन, सफलता, उत्साह र सर्वपक्षीय विजय।' },
  { index: 4, code: 'E4', nameSanskrit: 'इन्द्र', direction: 'E', directionLabelNepali: 'पूर्व ४ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'राजकीय सम्मान, सरकारी कृपा, शक्ति र प्रतिष्ठा।' },
  { index: 5, code: 'E5', nameSanskrit: 'सूर्य', direction: 'E', directionLabelNepali: 'पूर्व ५', nature: 'मध्यम', effectNepali: 'अत्यधिक क्रोध र मान-सम्मानमा उतारचढाव।' },
  { index: 6, code: 'E6', nameSanskrit: 'सत्य', direction: 'E', directionLabelNepali: 'पूर्व ६', nature: 'अशुभ', effectNepali: 'झूट र अविश्वासको वातावरण।' },
  { index: 7, code: 'E7', nameSanskrit: 'भृश', direction: 'E', directionLabelNepali: 'पूर्व ७', nature: 'अशुभ', effectNepali: 'क्रोध र पारिवारिक कलह।' },
  { index: 8, code: 'E8', nameSanskrit: 'आकाश (आग्नेय)', direction: 'E', directionLabelNepali: 'पूर्व ८ (आग्नेय कुना)', nature: 'महादोष', effectNepali: 'चोरी, आर्थिक हानि र अग्नि दुर्घटनाको सम्भावना।' },

  // दक्षिण दिशा (S1 - S8)
  { index: 9, code: 'S1', nameSanskrit: 'वायु/अनिल', direction: 'S', directionLabelNepali: 'दक्षिण १', nature: 'अशुभ', effectNepali: 'सन्तानमा कष्ट र मानसिक अशान्ति।' },
  { index: 10, code: 'S2', nameSanskrit: 'पूषा', direction: 'S', directionLabelNepali: 'दक्षिण २', nature: 'अशुभ', effectNepali: 'बन्धन र कानुनी उल्झन।' },
  { index: 11, code: 'S3', nameSanskrit: 'वितथ', direction: 'S', directionLabelNepali: 'दक्षिण ३ (उत्तम)', nature: 'शुभ', effectNepali: 'समृद्धि र भौतिक उन्नति।' },
  { index: 12, code: 'S4', nameSanskrit: 'गृहक्षत', direction: 'S', directionLabelNepali: 'दक्षिण ४ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'अपार सम्पत्ति, वंश वृद्धि र प्रसिद्धि।' },
  { index: 13, code: 'S5', nameSanskrit: 'यम', direction: 'S', directionLabelNepali: 'दक्षिण ५', nature: 'महादोष', effectNepali: 'रोग, ऋण र भय।' },
  { index: 14, code: 'S6', nameSanskrit: 'गन्धर्व', direction: 'S', directionLabelNepali: 'दक्षिण ६', nature: 'अशुभ', effectNepali: 'अनावश्यक खर्च र मानहानि।' },
  { index: 15, code: 'S7', nameSanskrit: 'भृङ्गराज', direction: 'S', directionLabelNepali: 'दक्षिण ७', nature: 'अशुभ', effectNepali: 'रोग र कष्ट।' },
  { index: 16, code: 'S8', nameSanskrit: 'मृग (नैऋत्य)', direction: 'S', directionLabelNepali: 'दक्षिण ८ (नैऋत्य कुना)', nature: 'महादोष', effectNepali: 'गृहस्वामीको शक्ति क्षय र दुर्घटना भय।' },

  // पश्चिम दिशा (W1 - W8)
  { index: 17, code: 'W1', nameSanskrit: 'पितृ', direction: 'W', directionLabelNepali: 'पश्चिम १ (नैऋत्य)', nature: 'महादोष', effectNepali: 'पारिवारिक विग्रह र दीर्घ रोग।' },
  { index: 18, code: 'W2', nameSanskrit: 'दौवारिक', direction: 'W', directionLabelNepali: 'पश्चिम २', nature: 'अशुभ', effectNepali: 'सम्बन्धमा दरार।' },
  { index: 19, code: 'W3', nameSanskrit: 'सुग्रीव', direction: 'W', directionLabelNepali: 'पश्चिम ३ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'व्यापारिक लाभ, धन वर्षा र ऐश्वर्य।' },
  { index: 20, code: 'W4', nameSanskrit: 'पुष्पदन्त', direction: 'W', directionLabelNepali: 'पश्चिम ४ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'सुख, सन्तान वृद्धि र दीर्घायु।' },
  { index: 21, code: 'W5', nameSanskrit: 'वरुण', direction: 'W', directionLabelNepali: 'पश्चिम ५', nature: 'मध्यम', effectNepali: 'सामान्य फल, खर्चमा सन्तुलन आवश्यक।' },
  { index: 22, code: 'W6', nameSanskrit: 'असुर', direction: 'W', directionLabelNepali: 'पश्चिम ६', nature: 'अशुभ', effectNepali: 'ऋण र निराशा।' },
  { index: 23, code: 'W7', nameSanskrit: 'शोष', direction: 'W', directionLabelNepali: 'पश्चिम ७', nature: 'अशुभ', effectNepali: 'शारीरिक कमजोरी र धन क्षय।' },
  { index: 24, code: 'W8', nameSanskrit: 'पापयक्ष्मा (वायव्य)', direction: 'W', directionLabelNepali: 'पश्चिम ८ (वायव्य कुना)', nature: 'महादोष', effectNepali: 'रोग र मानसिक विचलन।' },

  // उत्तर दिशा (N1 - N8)
  { index: 25, code: 'N1', nameSanskrit: 'रोग', direction: 'N', directionLabelNepali: 'उत्तर १ (वायव्य)', nature: 'अशुभ', effectNepali: 'चञ्चलता र कलह।' },
  { index: 26, code: 'N2', nameSanskrit: 'नाग', direction: 'N', directionLabelNepali: 'उत्तर २', nature: 'मध्यम', effectNepali: 'शत्रु भय तर सामान्य अनुकूल।' },
  { index: 27, code: 'N3', nameSanskrit: 'मुख्य', direction: 'N', directionLabelNepali: 'उत्तर ३ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'अपार धन, सफलता र नयाँ व्यवसायिक अवसर।' },
  { index: 28, code: 'N4', nameSanskrit: 'भल्लाट', direction: 'N', directionLabelNepali: 'उत्तर ४ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'स्थायी सम्पत्ति, सुख, सन्तान सुख र कीर्ति।' },
  { index: 29, code: 'N5', nameSanskrit: 'सोम / कुबेर', direction: 'N', directionLabelNepali: 'उत्तर ५ (अति उत्तम)', nature: 'अति शुभ', effectNepali: 'कुबेरको दृष्टि, अकूत सम्पत्ति र धार्मिक रुचि।' },
  { index: 30, code: 'N6', nameSanskrit: 'भुजङ्ग', direction: 'N', directionLabelNepali: 'उत्तर ६', nature: 'अशुभ', effectNepali: 'शत्रु वृद्धि र मनमुटाव।' },
  { index: 31, code: 'N7', nameSanskrit: 'अदिति', direction: 'N', directionLabelNepali: 'उत्तर ७', nature: 'मध्यम', effectNepali: 'महिला सदस्यलाई चिन्ता।' },
  { index: 32, code: 'N8', nameSanskrit: 'दिति (ईशान)', direction: 'N', directionLabelNepali: 'उत्तर ८ (ईशान कुना)', nature: 'अशुभ', effectNepali: 'आर्थिक अवरोध।' },
];

/**
 * 3x3 Standard Grid mapping
 */
export const THREE_BY_THREE_MAP: { row: number; col: number; direction: VastuPrimaryDirection }[] = [
  { row: 0, col: 0, direction: 'NW' },
  { row: 0, col: 1, direction: 'N' },
  { row: 0, col: 2, direction: 'NE' },
  { row: 1, col: 0, direction: 'W' },
  { row: 1, col: 1, direction: 'CENTER' },
  { row: 1, col: 2, direction: 'E' },
  { row: 2, col: 0, direction: 'SW' },
  { row: 2, col: 1, direction: 'S' },
  { row: 2, col: 2, direction: 'SE' },
];

/**
 * Gets 3x3 direction for a given grid row and column
 */
export function getDirectionFrom3x3Grid(row: number, col: number): VastuPrimaryDirection {
  const match = THREE_BY_THREE_MAP.find((m) => m.row === row && m.col === col);
  return match?.direction || 'CENTER';
}

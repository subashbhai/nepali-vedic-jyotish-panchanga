/**
 * Tibetan Parkha Engine (स्पार-खा ८ / 8 Trigrams)
 * Based on Vaidurya Karpo (वैदूर्य कार्पो)
 * Brihat Jyotish Professional ERP
 */

import { TibetanParkha, TibetanParkhaId, DirectionalGuide } from '../../types/tibetanAstrology';
import { TIBETAN_FIVE_ELEMENTS } from './tibetanElementEngine';

export const PARKHA_ORDER: TibetanParkhaId[] = [
  'li',
  'khon',
  'dha',
  'khim',
  'gam',
  'gin',
  'zin',
  'zon'
];

export const TIBETAN_PARKHA_LIST: Record<TibetanParkhaId, TibetanParkha> = {
  li: {
    id: 'li',
    index: 0,
    nameNepali: 'ली (Li - अग्नि)',
    nameTibetan: 'ལི (Li)',
    trigramSymbol: '☲',
    element: TIBETAN_FIVE_ELEMENTS.fire,
    directionNepali: 'दक्षिण (South)',
    natureNepali: 'तेज, स्पष्टता, प्रकाश, उत्साह र ज्ञान',
    symbolismNepali: 'मध्य दिनको सूर्य एवं अग्नि शिखा',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'दक्षिण (South)', effectNepali: 'स्वास्थ्य, प्राणशक्ति वृद्धि र दीर्घायु' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'उत्तर-पश्चिम (North-West)', effectNepali: 'धनधान्य, ऐश्वर्य र सामाजिक प्रतिष्ठा' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'पूर्व (East)', effectNepali: 'शान्ति, अध्ययन र पारिवारिक सद्भाव' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'उत्तर (North)', effectNepali: 'विवाद, अनावश्यक यात्रा र चिसोको कष्ट' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'दक्षिण-पश्चिम (South-West)', effectNepali: 'हानि, रोग र मानसिक अशान्तिबाट जोगिनुपर्ने' }
    ]
  },
  khon: {
    id: 'khon',
    index: 1,
    nameNepali: 'खोन (Khon - धरा/माटो)',
    nameTibetan: 'ཁོན (Khon)',
    trigramSymbol: '☷',
    element: TIBETAN_FIVE_ELEMENTS.earth,
    directionNepali: 'दक्षिण-पश्चिम (South-West)',
    natureNepali: 'सहनशीलता, गाम्भीर्य, स्थिरता र मातृत्व',
    symbolismNepali: 'अथाह धर्ती एवं माताको कोख',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'दक्षिण-पश्चिम (South-West)', effectNepali: 'मानसिक शान्ति र आत्मबल' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'पश्चिम (West)', effectNepali: 'अचल सम्पत्ति र व्यापार विस्तार' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'उत्तर-पश्चिम (North-West)', effectNepali: 'धैर्य र सम्बन्ध सुधार' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'पूर्व (East)', effectNepali: 'आलस्य र निर्णयमा भ्रम' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'दक्षिण (South)', effectNepali: 'आकस्मिक विवादबाट जोगिनुपर्ने' }
    ]
  },
  dha: {
    id: 'dha',
    index: 2,
    nameNepali: 'धा (Dha - धातु/झरना)',
    nameTibetan: 'དྷ (Dha)',
    trigramSymbol: '☱',
    element: TIBETAN_FIVE_ELEMENTS.iron,
    directionNepali: 'पश्चिम (West)',
    natureNepali: 'प्रसन्नता, संवाद, कला र आकर्षण',
    symbolismNepali: 'निर्मल ताल एवं धातु खड्ग',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'पश्चिम (West)', effectNepali: 'वाक् सिद्धि, कला र सामाजिक लोकप्रियता' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'उत्तर-पूर्व (North-East)', effectNepali: 'आर्थिक लाभ र मित्र सहयोग' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'दक्षिण-पश्चिम (South-West)', effectNepali: 'सुखद पारिवारिक वातावरण' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'दक्षिण (South)', effectNepali: 'अनावश्यक बहस र तनाव' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'पूर्व (East)', effectNepali: 'क्षति र मानसिक उद्विग्नता' }
    ]
  },
  khim: {
    id: 'khim',
    index: 3,
    nameNepali: 'खिम (Khim - आकाश/वायु)',
    nameTibetan: 'ཁིམ (Khim)',
    trigramSymbol: '☰',
    element: TIBETAN_FIVE_ELEMENTS.iron,
    directionNepali: 'उत्तर-पश्चिम (North-West)',
    natureNepali: 'नेतृत्व, न्याय, आत्मअनुशासन र उच्च दृष्टि',
    symbolismNepali: 'विशाल आकाश एवं सर्वोच्च शिखर',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'उत्तर-पश्चिम (North-West)', effectNepali: 'उच्च पद, सम्मान र कार्यसिद्धि' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'दक्षिण-पश्चिम (South-West)', effectNepali: 'संस्थागत विस्तार र विजय' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'उत्तर-पूर्व (North-East)', effectNepali: 'प्रतिष्ठा र धैर्य' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'दक्षिण (South)', effectNepali: 'कार्यमा अवरोध' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'पूर्व (East)', effectNepali: 'विवादबाट जोगिनुपर्ने' }
    ]
  },
  gam: {
    id: 'gam',
    index: 4,
    nameNepali: 'गाम/खाम (Kham - जल/सागर)',
    nameTibetan: 'ཁམ (Kham)',
    trigramSymbol: '☵',
    element: TIBETAN_FIVE_ELEMENTS.water,
    directionNepali: 'उत्तर (North)',
    natureNepali: 'गम्भीरता, अनुकूलनशीलता, गतिशीलता र रहस्य',
    symbolismNepali: 'अथाह जलधारा एवं रात्रिकालीन सागर',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'उत्तर (North)', effectNepali: 'बुद्धि, अनुसन्धान र विद्या विस्तार' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'दक्षिण-पूर्व (South-East)', effectNepali: 'वैदेशिक यात्रा र व्यवसायिक सफलता' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'पूर्व (East)', effectNepali: 'शान्ति र दीर्घायु' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'दक्षिण-पश्चिम (South-West)', effectNepali: 'अनावश्यक शंका र भ्रम' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'उत्तर-पूर्व (North-East)', effectNepali: 'आर्थिक अवरोध' }
    ]
  },
  gin: {
    id: 'gin',
    index: 5,
    nameNepali: 'गिन (Gin - पर्वत/शैल)',
    nameTibetan: 'གིན (Gin)',
    trigramSymbol: '☶',
    element: TIBETAN_FIVE_ELEMENTS.earth,
    directionNepali: 'उत्तर-पूर्व (North-East)',
    natureNepali: 'अटल निश्चय, मौन शक्ति, आत्मनिरीक्षण र संरक्षण',
    symbolismNepali: 'स्थिर हिमाल एवं ध्यानस्थ योगी',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'उत्तर-पूर्व (North-East)', effectNepali: 'आध्यात्मिक साधना र मानसिक स्थिरता' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'पश्चिम (West)', effectNepali: 'सम्पत्ति संरक्षण र ज्ञान आर्जन' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'उत्तर-पश्चिम (North-West)', effectNepali: 'निरोगी जीवन' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'दक्षिण-पूर्व (South-East)', effectNepali: 'आलस्य र जडता' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'उत्तर (North)', effectNepali: 'सावधानी आवश्यक' }
    ]
  },
  zin: {
    id: 'zin',
    index: 6,
    nameNepali: 'जिन (Zin - बिजुली/गर्जन)',
    nameTibetan: 'ཟིན (Zin)',
    trigramSymbol: '☳',
    element: TIBETAN_FIVE_ELEMENTS.wood,
    directionNepali: 'पूर्व (East)',
    natureNepali: 'आरम्भ, जागरण, क्रियाशीलता, पराक्रम र नवप्रवर्तन',
    symbolismNepali: 'वसन्तको गर्जन एवं उम्रिँदै गरेको नयाँ बिरुवा',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'पूर्व (East)', effectNepali: 'नयाँ कार्यको थालनी, पराक्रम र उन्नति' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'दक्षिण (South)', effectNepali: 'सामाजिक प्रभाव र यश' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'उत्तर (North)', effectNepali: 'स्वास्थ्य र ऊर्जा' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'पश्चिम (West)', effectNepali: 'अकस्मात विवाद' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'उत्तर-पश्चिम (North-West)', effectNepali: 'आवेगमा निर्णय नलिनु' }
    ]
  },
  zon: {
    id: 'zon',
    index: 7,
    nameNepali: 'जोन (Zon - पवन/वन)',
    nameTibetan: 'ཟོན (Zon)',
    trigramSymbol: '☴',
    element: TIBETAN_FIVE_ELEMENTS.wood,
    directionNepali: 'दक्षिण-पूर्व (South-East)',
    natureNepali: 'लचकता, सुकोमलता, विस्तार, सौन्दर्य र विनम्रता',
    symbolismNepali: 'मन्द हावा एवं हरियाली वनस्पति',
    directions: [
      { category: 'अतिशुभ', tibetanTerm: 'Sogtso', nameNepali: 'जीवनदाता दिशा', direction: 'दक्षिण-पूर्व (South-East)', effectNepali: 'व्यापार विस्तार, सौहार्द र यात्रा' },
      { category: 'शुभ', tibetanTerm: 'Nammen', nameNepali: 'समृद्धि दिशा', direction: 'उत्तर (North)', effectNepali: 'विद्या, कला र कीर्ति' },
      { category: 'मध्यम', tibetanTerm: 'Tsepel', nameNepali: 'आयु विस्तार दिशा', direction: 'दक्षिण (South)', effectNepali: 'सुखद सम्बन्ध' },
      { category: 'प्रतिकूल', tibetanTerm: 'Chak', nameNepali: 'विघ्न दिशा', direction: 'उत्तर-पूर्व (North-East)', effectNepali: 'ढिलासुस्ती' },
      { category: 'हानिकारक', tibetanTerm: 'Dugyur', nameNepali: 'विपत्ति दिशा', direction: 'दक्षिण-पश्चिम (South-West)', effectNepali: 'भावुक निर्णय नगर्नु' }
    ]
  }
};

/**
 * Calculates Natal Parkha based on Tibetan Age and Gender
 */
export function calculateNatalParkha(
  tibetanEffectiveBirthYear: number,
  currentTibetanYear: number,
  gender: 'male' | 'female' | string = 'male'
): TibetanParkha {
  // Nominal Tibetan Age (1 at birth)
  const tibetanAge = Math.max(1, currentTibetanYear - tibetanEffectiveBirthYear + 1);

  const isMale = gender.toLowerCase() !== 'female' && gender.toLowerCase() !== 'स्त्री';

  let parkhaIndex = 0;
  if (isMale) {
    // Male starts at Li (index 0) and counts clockwise: (age - 1) % 8
    parkhaIndex = (tibetanAge - 1) % 8;
  } else {
    // Female starts at Kham (index 4) and counts counter-clockwise
    parkhaIndex = (((4 - (tibetanAge - 1)) % 8) + 8) % 8;
  }

  const parkhaId = PARKHA_ORDER[parkhaIndex];
  return TIBETAN_PARKHA_LIST[parkhaId] || TIBETAN_PARKHA_LIST.li;
}

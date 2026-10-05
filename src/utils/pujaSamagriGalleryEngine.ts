// ============================================================================
// बालानन्द वैदिक पसल - पूजा सामग्री तथा वैदिक उत्पादन ग्यालरी इन्जिन (50+ Items)
// (Comprehensive 50+ Vedic Puja Samagri & Ceremonial Graphics Engine)
// Features: Detailed Cultural Ceremony Graphics & Authentic Shastriya Package Items
// Official Vedic Store Contact: 97674244778
// ============================================================================

import { StoreCategoryKey, VEDIC_STORE_16_CATEGORIES } from '../types/vedicStoreTypes';

export const VEDIC_STORE_OFFICIAL_CONTACT = '97674244778';
export const VEDIC_STORE_OFFICIAL_CONTACT_DISPLAY = '+977-97674244778';

export interface PujaGalleryItem {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  category: StoreCategoryKey;
  categoryNameNepali: string;
  description: string;
  tags: string[];
  imageUrl: string;
  suggestedPrice?: number;
  samagriList: string[]; // Authentic items list printed on package insert
}

export const PUJA_GALLERY_CATEGORIES = VEDIC_STORE_16_CATEGORIES;

/**
 * Ceremonial graphic scene types for rich visual rendering
 */
export type CeremonySceneType =
  | 'vivah_mandap_sindur'        // विवाह: बेहुलाले बेहुलीलाई सिन्दूर हाल्दै, मण्डप, पण्डित, यज्ञाग्नि, जन्ती
  | 'bartabandha_upanayan'       // व्रतबन्ध: बटुक पलाँस दण्ड, जनै, गायत्री मन्त्र दीक्षा, भिक्षापात्र
  | 'annaprashan_pasni'          // पास्नी: चाँदीको कचौरा-चम्चाले खीर खुवाउँदै, ढाका टोपी शिशु
  | 'namakarana_nwaran'          // नामकरण: सुवर्ण शलाकाले कानमा नाम उच्चारण, मह-घ्यू, सूर्य पूजा
  | 'chudakarma_mundan'          // चूडाकर्म: पहिलो कपाल काट्ने, शिखा राख्ने, मङ्गल स्नान
  | 'karnavedha_earpierce'       // कर्णवेध: सुनको सुईले कान छेड्ने, मङ्गल आशीर्वाद
  | 'vidyarambha_vedarambha'     // विद्यारम्भ: मयूर प्वाँखले पाटीमा ॐ श्री गणेशाय नमः लेख्दै, सरस्वती
  | 'garbhadhana_simanta'        // गर्भाधान/सीमन्तोन्नयन: गर्भिणी आमा, दम्पती, पण्डित एवं मन्त्राक्षता
  | 'samavartana_snataka'        // समावर्तन: विद्या पूरा गरी गृहस्थ प्रवेश, छत्र-दण्ड
  | 'antyeshti_pitri_moksha'     // अन्त्येष्टि: विष्णुपद, तिल-कुश, गङ्गाजल, मोक्ष तर्पण
  | 'grihapravesh_kalash_door'   // गृहप्रवेश: दम्पतीले मङ्गल कलश लिएर नयाँ घरको तोरणद्वार प्रवेश
  | 'vastu_shanti_mandala'       // वास्तुशान्ति: वास्तुपुरुष मण्डल, पञ्चरत्न, तामाको पिरामिड, होम
  | 'bhumi_shilanyas_jag'        // भूमिपूजन: जग खन्ने, ५ कलश, कूर्मासन, शिलान्यास
  | 'rudrabhishek_lingam_snan'   // रुद्राभिषेक: तामाको शृङ्गीबाट शिवलिङ्गमा दुग्धधारा, बेलपत्र, भस्म
  | 'mahamrityunjaya_havan'      // महामृत्युञ्जय: तामाको कुण्ड, प्रज्वलित अग्नि, १०८ रुद्राक्ष माला, गुग्गुल
  | 'shraddha_pitri_tarpana'     // श्राद्ध: कुशको आसन, कालो तिलको पिण्डदान, पितृ तर्पण
  | 'navagraha_shanti_altar'     // नवग्रह: ९ रङ्गीन मण्डल, ९ अन्न, ९ काठ, ९ ग्रह देवता मञ्च
  | 'satyanarayan_banana_mandap' // सत्यनारायण: ४ केराको थाम, शालिग्राम, तुलसी, पञ्चामृत, कथा वाचन
  | 'lakshmi_deepawali_coins'    // लक्ष्मी पूजा: कमलमा महालक्ष्मी-गणेश, चाँदीका सिक्का, ५ दियो, रङ्गोली
  | 'durga_chandi_path'          // चण्डी पाठ: १० हात भएकी नवदुर्गा, चण्डी पुस्तक, अखण्ड ज्योति
  | 'santana_gopala_puja'        // सन्तानगोपाल: माखन चोर्दै गरेको बालकृष्ण, पञ्चामृत
  | 'vyapar_vriddhi_kuber'       // व्यापार वृद्धि: खातापातामा स्वस्तिक, कुबेर यन्त्र, घण्टी, रिबन
  | 'kalsarp_mangal_dosha'       // कालसर्प/मंगल: चाँदीको नाग जोडी, रातो मुगा यन्त्र, शान्ति मन्त्र
  | 'kuldevata_devali_puja'      // कुलदेवता: कुल मन्दिर, त्रिशूल, घण्टी, खड्ग, धूप-दीप
  | 'general_vedic_anushthan';   // सामान्य वैदिक अनुष्ठान

interface CeremonyGraphicOptions {
  sceneType: CeremonySceneType;
  titleNepali: string;
  subtitleNepali: string;
  categoryNepali: string;
  samagriItems: string[];
  theme: {
    bgSky: [string, string, string];
    frameGold: string;
    accent: string;
  };
  highlightBadge?: string;
}

/**
 * Returns high-resolution poster image for ceremony and title
 */
export function getPosterImageForCeremony(sceneType: CeremonySceneType, titleNepali?: string): string {
  // 1. Garbhadhana & Maternity Sanskars
  if (titleNepali && (titleNepali.includes('गर्भाधान') || titleNepali.includes('पुंसवन') || titleNepali.includes('सीमन्त'))) {
    return '/images/puja_packages/garbhadhana_sanskar_poster.jpg';
  }

  // 2. Vivaha / Marriage Sanskar
  if (titleNepali && (titleNepali.includes('विवाह') || titleNepali.includes('लग्न') || titleNepali.includes('पाणिग्रहण') || titleNepali.includes('स्वयंवर'))) {
    return '/images/puja_packages/vivaha_mandap_poster.jpg';
  }

  // 3. Bartabandha / Upanayana / Chudakarma
  if (titleNepali && (titleNepali.includes('व्रतबन्ध') || titleNepali.includes('उपनयन') || titleNepali.includes('मुण्डन') || titleNepali.includes('चूडाकर्म') || titleNepali.includes('वेदारम्भ') || titleNepali.includes('समावर्तन') || titleNepali.includes('केशान्त') || titleNepali.includes('छेवर'))) {
    return '/images/puja_packages/bartabandha_poster.jpg';
  }

  // 4. Annaprashan / Pasni / Karnavedha
  if (titleNepali && (titleNepali.includes('पास्नी') || titleNepali.includes('अन्नप्राशन') || titleNepali.includes('कर्णवेध'))) {
    return '/images/puja_packages/annaprashan_pasni_poster.jpg';
  }

  // 5. Nwaran / Namakarana / Nishkramana / Jatakarma
  if (titleNepali && (titleNepali.includes('न्वारान') || titleNepali.includes('नामकरण') || titleNepali.includes('जातकर्म') || titleNepali.includes('निष्क्रमण'))) {
    return '/images/puja_packages/nwaran_namakarana_poster.jpg';
  }

  // 6. Ganesha / Vidyarambha
  if (titleNepali && (titleNepali.includes('गणेश') || titleNepali.includes('विद्यारम्भ') || titleNepali.includes('अक्षराम्भ') || titleNepali.includes('सरस्वती'))) {
    return '/images/puja_packages/ganesh_puja_poster.jpg';
  }

  // 7. Rudrabhishek / Shiva / Mahamrityunjaya
  if (titleNepali && (titleNepali.includes('रुद्र') || titleNepali.includes('शिव') || titleNepali.includes('महामृत्युञ्जय') || titleNepali.includes('लिङ्ग'))) {
    return '/images/puja_packages/rudrabhishek_shiva_poster.jpg';
  }

  // 8. Satyanarayan / Santana Gopala
  if (titleNepali && (titleNepali.includes('सत्यनारायण') || titleNepali.includes('सन्तानगोपाल') || titleNepali.includes('एकादशी') || titleNepali.includes('पूर्णिमा') || titleNepali.includes('शालिग्राम'))) {
    return '/images/puja_packages/satyanarayan_puja_poster.jpg';
  }

  // 9. Durga / Chandi / Kuldevata
  if (titleNepali && (titleNepali.includes('दुर्गा') || titleNepali.includes('चण्डी') || titleNepali.includes('कुलदेवता') || titleNepali.includes('देवाली') || titleNepali.includes('नवरात्र') || titleNepali.includes('दशैं') || titleNepali.includes('काली') || titleNepali.includes('भगवती'))) {
    return '/images/puja_packages/durga_chandi_poster.jpg';
  }

  // 10. Lakshmi / Deepawali / Kuber / Wealth
  if (titleNepali && (titleNepali.includes('लक्ष्मी') || titleNepali.includes('दीपावली') || titleNepali.includes('तिहार') || titleNepali.includes('व्यापार') || titleNepali.includes('कुबेर') || titleNepali.includes('धनप्राप्ति') || titleNepali.includes('कनकधारा'))) {
    return '/images/puja_packages/lakshmi_puja_poster.jpg';
  }

  // 11. Navagraha / Kalsarp / Shani / Mangal
  if (titleNepali && (titleNepali.includes('नवग्रह') || titleNepali.includes('कालसर्प') || titleNepali.includes('मंगल') || titleNepali.includes('शनि') || titleNepali.includes('दोष') || titleNepali.includes('शान्ति') || titleNepali.includes('राहु') || titleNepali.includes('केतु'))) {
    return '/images/puja_packages/navagraha_shanti_poster.jpg';
  }

  // 12. Grihapravesh / Vastu / Bhumi Shilanayas
  if (titleNepali && (titleNepali.includes('गृहप्रवेश') || titleNepali.includes('वास्तु') || titleNepali.includes('भूमि') || titleNepali.includes('शिलान्यास') || titleNepali.includes('पसल') || titleNepali.includes('कार्यालय') || titleNepali.includes('उद्घाटन'))) {
    return '/images/puja_packages/grihapravesh_vastu_poster.jpg';
  }

  // 13. Shraddha / Pitri / Antyeshti / Tarpana
  if (titleNepali && (titleNepali.includes('श्राद्ध') || titleNepali.includes('तर्पण') || titleNepali.includes('अन्त्येष्टि') || titleNepali.includes('पितृ') || titleNepali.includes('मोक्ष') || titleNepali.includes('नारायणबलि') || titleNepali.includes('त्रिपिण्डी') || titleNepali.includes('एकोदिष्ट') || titleNepali.includes('पार्वण'))) {
    return '/images/puja_packages/shraddha_pitri_poster.jpg';
  }

  // SceneType Fallbacks
  switch (sceneType) {
    case 'garbhadhana_simanta':
      return '/images/puja_packages/garbhadhana_sanskar_poster.jpg';
    case 'vivah_mandap_sindur':
      return '/images/puja_packages/vivaha_mandap_poster.jpg';
    case 'bartabandha_upanayan':
    case 'chudakarma_mundan':
    case 'samavartana_snataka':
      return '/images/puja_packages/bartabandha_poster.jpg';
    case 'annaprashan_pasni':
    case 'karnavedha_earpierce':
      return '/images/puja_packages/annaprashan_pasni_poster.jpg';
    case 'namakarana_nwaran':
      return '/images/puja_packages/nwaran_namakarana_poster.jpg';
    case 'rudrabhishek_lingam_snan':
    case 'mahamrityunjaya_havan':
      return '/images/puja_packages/rudrabhishek_shiva_poster.jpg';
    case 'satyanarayan_banana_mandap':
    case 'santana_gopala_puja':
      return '/images/puja_packages/satyanarayan_puja_poster.jpg';
    case 'durga_chandi_path':
    case 'kuldevata_devali_puja':
      return '/images/puja_packages/durga_chandi_poster.jpg';
    case 'lakshmi_deepawali_coins':
    case 'vyapar_vriddhi_kuber':
      return '/images/puja_packages/lakshmi_puja_poster.jpg';
    case 'navagraha_shanti_altar':
    case 'kalsarp_mangal_dosha':
      return '/images/puja_packages/navagraha_shanti_poster.jpg';
    case 'grihapravesh_kalash_door':
    case 'vastu_shanti_mandala':
    case 'bhumi_shilanyas_jag':
      return '/images/puja_packages/grihapravesh_vastu_poster.jpg';
    case 'antyeshti_pitri_moksha':
    case 'shraddha_pitri_tarpana':
      return '/images/puja_packages/shraddha_pitri_poster.jpg';
    default:
      return '/images/puja_packages/ganesh_puja_poster.jpg';
  }
}

function createVedicCeremonyGraphicSvg(options: CeremonyGraphicOptions): string {
  return getPosterImageForCeremony(options.sceneType, options.titleNepali);
}

// ============================================================================
// ५०+ सम्पूर्ण प्रामाणिक पूजा तथा वैदिक सामग्रीहरूको आधिकारिक ग्यालरी
// (All items feature authentic Shastriya breakdown with quantities & units)
// ============================================================================
export const PUJA_SAMAGRI_GALLERY_DATABASE: PujaGalleryItem[] = [
  // =========================================================================
  // ०. विशेष अग्रपूजा (Lord Ganesha Auspicious Puja Package)
  // =========================================================================
  {
    id: 'ps_ganesh_puja_complete',
    nameNepali: 'श्री गणेश पूजा सम्पूर्ण सामग्री प्याकेज',
    nameEnglish: 'Lord Ganesha Complete Auspicious Puja Package',
    category: 'puja_package',
    categoryNameNepali: 'पूजा प्याकेज',
    description: 'विघ्न विनाशक, मङ्गलकर्ता, ऋद्धि-सिद्धि दाता श्री गणेशको विशेष पूजा, नयाँ कार्य शुभारम्भ तथा नित्य पूजन सामग्री सेट।',
    tags: ['गणेश', 'अग्रपूजा', 'विघ्नहर्ता', 'मोदक', 'दुबो', 'सिन्दूर', 'मङ्गल'],
    suggestedPrice: 1550,
    samagriList: [
      'गणेश मूर्ति / सुपारी – १ थान',
      'तामाको कलश (मङ्गल घडा) – १ थान',
      'नरिवल (पानी भएको) – १ थान',
      'आँपको पात (पञ्चपल्लव) – ७ वटा',
      'पूजा वस्त्र (रातो/पहेंलो) – १ थान',
      'जनै (यज्ञोपवीत) – ३ जोर',
      'अक्षता (सिन्दूर चामल) – १ प्याकेट (२५० ग्राम)',
      'सुपारी (सग्लो) – ११ वटा',
      'पानको पात – ११ पाती',
      'ताजा दूर्वा (दुबोको मुठा) – १ गुच्छा',
      'रातो फूल र फूलमाला – १ सेट',
      'मोदक / लड्डु – १ प्याकेट',
      'रोली, चन्दन, अबिर र सिन्दूर – १ सेट',
      'सुगन्धित धूप र अगरबत्ती – १ प्याकेट',
      'शुद्ध गाईको घ्यू – २५० ग्राम',
      'कपासको बत्ती र पाला – १ सेट',
      'भीमसेनी शुद्ध कपूर – १ बट्टा',
      'पञ्चमेवा (काजु, किसमिस, छोकडा, बदाम, मिश्री) – १ प्याकेट',
      'नवधान्य (९ थरी अन्न) – १ प्याकेट',
      'श्री गणेश यन्त्र – १ थान',
      'तामाको पञ्चपात्र र आचमनी – १ सेट',
      'शङ्ख र गरुड घण्टी – १ सेट',
      'दक्षिणावर्ती शङ्ख – १ थान',
      'आरती थाली (सजावट सहित) – १ सेट',
    ],
    imageUrl: '/images/puja_packages/ganesh_puja_poster.jpg',
  },

  // =========================================================================
  // १. १६ संस्कार (16 Vedic Sanskars)
  // =========================================================================
  {
    id: 'ps_garbhadhana',
    nameNepali: 'गर्भाधान संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Garbhadhana Sanskar Vedic Ritual Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'सद्गुणी, तेजस्वी एवं कुलदीपक सन्तान प्राप्तिका लागि पति-पत्नीले वैदिक मन्त्रोच्चार र पञ्चगव्य हवन सहित गरिने प्रथम संस्कार।',
    tags: ['गर्भाधान', 'संस्कार', 'सन्तान', 'पञ्चगव्य', 'हवन', 'दम्पती'],
    suggestedPrice: 1650,
    samagriList: [
      'तामाको मङ्गल कलश र पूर्णपात्र – १ सेट',
      'पञ्चगव्य (दूध, दही, घ्यू, गोबर, गोमूत्र) – १ सेट',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'समिधा काठ (पलाँस, शमी, आँप) – २ केजी',
      'हवन कुण्ड र साकल्य (हवन सामग्री) – १ प्याकेट (५०० ग्राम)',
      'गर्भाधान सङ्कल्प सूत्र र मौली धागो – २ थान',
      'अक्षता (शुद्ध अरुवा चामल) – १ प्याकेट (५०० ग्राम)',
      'कुशको आसन र कुश पवित्री – २ जोर',
      'सुपारी र ल्वाङ-सुकुमेल – २१ गेडा',
      'जनै (यज्ञोपवीत) – ३ जोर',
      'रातो र पहेंलो वस्त्र (दम्पतीका लागि) – २ थान',
      'मङ्गल कलश नरिवल – १ थान',
      'रोली, चन्दन, अबिर र केशरी – १ सेट',
      'सुगन्धित धूप, अगरबत्ती र कपूर – १ सेट',
      'पञ्चमेवा र मिश्री – १ प्याकेट',
      'प्राकृतिक मह (मधुपर्क निमित्त) – १ सानो सिसी',
      'दुबो र तुलसीपत्र – १ सेट',
      'तामाको पञ्चपात्र, आचमनी र अर्घ्यपात्र – १ सेट',
      'दियो र शुद्ध कपासको बत्ती – १ सेट',
      'पञ्चामृत (दूध, दही, घ्यू, मह, चिनी) – १ सेट',
    ],
    imageUrl: '/images/puja_packages/garbhadhana_sanskar_poster.jpg',
  },
  {
    id: 'ps_pumsavana',
    nameNepali: 'पुंसवन संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Pumsavana Sanskar Ritual Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'गर्भस्थ शिशुको मानसिक तथा शारीरिक विकास, आरोग्य, बल र संरक्षणका लागि तेस्रो महिनामा गरिने द्वितीय संस्कार।',
    tags: ['पुंसवन', 'संस्कार', 'गर्भसंरक्षण', 'बरकोटुसा', 'औषधि'],
    suggestedPrice: 1550,
    samagriList: [
      'मौली / रक्षासूत्र (गाँठो धागो) – १ थान',
      'वट-शुङ्ग (बरको कलिलो टुसा) – २ वटा',
      'वटपत्र (बरको पवित्र पात) – १ थान',
      'कलश (तामाको भाँडो) र नरिवल – १ सेट',
      'दीप / दियो (तामा वा माटोको) – १ थान',
      'शुद्ध कपासको बत्ती – १ प्याकेट',
      'मङ्गल नरिवल (पानी भएको) – १ थान',
      'पूर्णपात्र (अन्न भरिएको थाली) – १ थान',
      'अक्षता (रातो र सेतो) – २५० ग्राम',
      'शुद्ध चामल (अरुवा) – १ किलो',
      'सुपारी (सग्लो सिङ्गो) – ११ थान',
      'पानको पात (नागवल्ली) – ११ थान',
      'कुशको मूल र काँचो धागो – १ सेट',
      'सुगन्धित धूप – १ प्याकेट',
      'शुद्ध तिलको तेल – १ बट्टा',
      'पुष्प र ताजा फूलमाला – १ सेट',
      'सुगन्धित अगरबत्ती – १ प्याकेट',
      'अबीर, केशरी र सिन्दूर – १ प्याकेट',
      'भीमसेनी शुद्ध कपूर – १ प्याकेट',
      'गङ्गाजल (पवित्र तीर्थ जल) – १ बोतल',
      'पञ्चगव्य / गोमूत्र (गहुँत) – १ बोतल',
      'गुलाबजल – १ बोतल',
      'नवान्न (९ थरी नवधान्य) – १ प्याकेट',
      'पूजा सिक्का र यन्त्र – १ थान',
      'पूजा पुस्तक (पुंसवन विधि सहित) – १ थान',
      'शुद्ध गाईको घ्यू – २५० ग्राम',
      'सुवर्ण शलाका (सुन/चाँदीको सुई) – १ थान',
      'आरती थाली र गरुड घण्टी – १ सेट',
      'हवन सामग्री र समिधा काठ – १.५ केजी',
      'दक्षिणा तथा सङ्कल्प भेटी – १ प्याकेट',
    ],
    imageUrl: '/images/puja_packages/pumsavana_sanskar_poster.jpg',
  },
  {
    id: 'ps_simantonnayana',
    nameNepali: 'सीमन्तोन्नयन संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Simantonnayana Sanskar Ceremony Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'गर्भवती आमाको मानसिक प्रसन्नता, दीर्घायु तथा गर्भस्थ शिशुको तेजस्विताका लागि चौथो/छैटौं महिनामा गरिने तृतीय संस्कार।',
    tags: ['सीमन्तोन्नयन', 'दहीभात', 'सिउँदो', 'मङ्गल', 'संस्कार'],
    suggestedPrice: 1750,
    samagriList: [
      'दुम्सीको काँडा (शलाका/वेणी संस्कारका लागि) – १ थान',
      'उदुम्बर (डुम्री) फल र टुसा – १ सेट',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'तामाको कलश र मङ्गल नरिवल – १ थान',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'समिधा काठ र हवन सामग्री – १.५ केजी',
      'रातो रेशमी वस्त्र (गर्भिणी माताका लागि) – १ थान',
      'सौभाग्य सामग्री (सिन्दूर, पोते, चुरा, काँधिया) – १ सेट',
      'जनै र मौली धागो – २ जोर',
      'सुपारी र ल्वाङ-सुकुमेल – ११ गेडा',
      'सुगन्धित फूलमाला र दुबो – २ थान',
      'पञ्चमेवा र मौसमी फलफूल – १ टोकरी',
      'धूप, दीप, भीमसेनी कपूर – १ सेट',
      'तामाको पञ्चपात्र र आचमनी – १ सेट',
      'पञ्चामृत र मह – १ सेट',
    ],
    imageUrl: '/images/puja_packages/simantonnayana_sanskar_poster.jpg',
  },
  {
    id: 'ps_jatakarma',
    nameNepali: 'जातकर्म संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Jatakarma Baby Birth Sanskar Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'शिशु जन्मिएलगत्तै सुवर्ण शलाकाले मह-घ्यू चटाउने, नाडी छेदन पूर्व गरिने मेधाजनन एवं आयुष्यवर्धन चतुर्थ संस्कार।',
    tags: ['जातकर्म', 'शिशुजन्म', 'सुवर्ण', 'मह', 'घ्यू', 'मेधाजनन'],
    suggestedPrice: 1350,
    samagriList: [
      'सुवर्ण शलाका (सुनको तार/औंठी) – १ थान',
      'शुद्ध गाईको घ्यू र प्राकृतिक मह – १ सेट',
      'काँसको कचौरा – १ थान',
      'नाडीछेदन मङ्गल द्रव्य र पञ्चगव्य – १ सेट',
      'अक्षता, रोली र चन्दन – १ सेट',
      'कुश र गङ्गाजल – १ बोतल',
      'सुगन्धित धूप र दीप – १ सेट',
      'जनै र मौली धागो – २ थान',
      'रक्षासूत्र (कालो/पहेंलो धागो) – १ थान',
      'सुपारी र पानको पात – ५ वटा',
      'शुद्ध गाईको दुग्ध – १ लिटर',
      'तामाको कलश – १ थान',
      'नयाँ वस्त्र (शिशु र आमाका लागि) – २ थान',
    ],
    imageUrl: '/images/puja_packages/nwaran_namakarana_poster.jpg',
  },
  {
    id: 'ps_namakarana_nwaran',
    nameNepali: 'नामकरण (न्वारान) संस्कार सम्पूर्ण पूजा सामग्री',
    nameEnglish: 'Namakarana (Nwaran) Complete Ritual Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: '११ औं दिनमा गरिने न्वारान, सूर्य दर्शन, गुप्त तथा नक्षत्र नामकरण, नवग्रह शान्ति र पञ्चगव्य शुद्धिकरण महाप्याकेज।',
    tags: ['न्वारान', 'नामकरण', '११दिन', 'सूर्यदर्शन', 'राशि', 'सुवर्ण'],
    suggestedPrice: 1950,
    samagriList: [
      'सुवर्ण शलाका (कानमा नाम सुनाउन) – १ थान',
      'सूर्य पूजा ताम्रपात्र र अर्घ्यपात्र – १ सेट',
      'न्वारान कलश र पूर्णपात्र – १ सेट',
      'नरिवल (पानी भएको) – २ वटा',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'समिधा काठ (पलाँस/खयर) – २ केजी',
      'हवन सामग्री (साकल्य, गुग्गुल, जटामासी) – ५०० ग्राम',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'नवान्न (९ प्रकारका धान्य) – १ प्याकेट',
      'नवग्रह समिधा र नवग्रह वस्त्र (९ रङ) – १ सेट',
      'रातो, सेतो र पहेंलो कपडा – ३ थान',
      'जनै (यज्ञोपवीत) – ५ जोर',
      'सुपारी र पानको पात – २१ वटा',
      'मौली (रक्षासूत्र) र धागो – २ थान',
      'रोली, सिन्दूर, केशरी र चन्दन – १ सेट',
      'मह, काँसको थाली र चाँदीको सिक्का – १ सेट',
      'शिशुको प्रथम वस्त्र र ढाका टोपी – १ सेट',
      'धूप, कपूर, दीप र अगरबत्ती – १ सेट',
      'पञ्चमेवा र मौसमी फलफूल – १ सेट',
      'घण्टी र शङ्ख – १ सेट',
    ],
    imageUrl: '/images/puja_packages/nwaran_namakarana_poster.jpg',
  },
  {
    id: 'ps_nishkramana',
    nameNepali: 'निष्क्रमण संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Nishkramana Sanskar First Outing Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'चौथो महिनामा शिशुलाई पहिलोपटक घरबाहिर निकालेर सूर्य, चन्द्रमा र दिक्पाल देवता दर्शन गराउने षष्ठ संस्कार।',
    tags: ['निष्क्रमण', 'सूर्यदर्शन', 'चन्द्रदर्शन', 'शिशु', 'संस्कार'],
    suggestedPrice: 1150,
    samagriList: [
      'सूर्य देव अर्घ्य ताम्रपात्र – १ थान',
      'चन्द्र देव पूजा सामग्री – १ सेट',
      'शङ्ख, गङ्गाजल र तुलसी – १ सेट',
      'तामाको कलश र अक्षता – १ थान',
      'जनै, सुपारी र मौली धागो – १ सेट',
      'सुगन्धित चन्दन, रोली – १ सेट',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
      'फलफूल र पञ्चमेवा – १ प्याकेट',
      'शिशुको बाह्य वस्त्र र सगुन – १ सेट',
      'घण्टी र दुबो – १ सेट',
    ],
    imageUrl: '/images/puja_packages/nwaran_namakarana_poster.jpg',
  },
  {
    id: 'ps_annaprashan_pasni_pkg',
    nameNepali: 'अन्नप्राशन (पास्नी) संस्कार सम्पूर्ण सामग्री सेट',
    nameEnglish: 'Annaprashana (Pasni) Complete Ceremony Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'छैटौं महिनामा शिशुलाई चाँदीको कचौरा-चम्चाले पहिलो अन्न (खीर) खुवाउने, अष्टमङ्गल सगुन र वृत्ति परीक्षा सेट।',
    tags: ['पास्नी', 'अन्नप्राशन', 'खीर', 'चाँदीकचौरा', 'शिशु'],
    suggestedPrice: 2250,
    samagriList: [
      'चाँदीको कचौरा र चम्चा (खीर खुवाउन) – १ सेट',
      'शुद्ध गाईको दूध र बासमती चामल (खीरका निमित्त) – १ सेट',
      'शुद्ध गाईको घ्यू र प्राकृतिक मह – १ सेट',
      'पञ्चामृत सामग्री (दूध, दही, घ्यू, मह, मिश्री) – १ सेट',
      'तामाको कलश र मङ्गल नरिवल – १ थान',
      'हवन कुण्ड, समिधा काठ र हवन सामग्री – १.५ केजी',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'जनै र मौली धागो – ५ जोर',
      'सुपारी र ल्वाङ-सुकुमेल – २१ गेडा',
      'रोली, अबिर, केशरी र चन्दन – १ सेट',
      'शिशुको ढाका टोपी र परम्परागत पास्नी पोशाक – १ सेट',
      'परीक्षण वस्तुहरू (कलम, पुस्तक, सुनको गहना, माटो, हतियार) – १ सेट',
      'सुगन्धित धूप, दीप र भीमसेनी कपूर – १ सेट',
      'पञ्चमेवा र मौसमी फलफूल – १ सेट',
      'तामाको पञ्चपात्र र आरती थाली – १ सेट',
    ],
    imageUrl: '/images/puja_packages/annaprashan_pasni_poster.jpg',
  },
  {
    id: 'ps_chudakarma_mundan_pkg',
    nameNepali: 'चूडाकर्म (मुण्डन/छेवर) संस्कार सामग्री सेट',
    nameEnglish: 'Chudakarma (Mundan) Ritual Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'शिशुको पहिलो कपाल काटी शिखा (टुप्पी) राख्ने, मङ्गल स्नान र दीर्घायु-तेज प्राप्तिका लागि अष्टम संस्कार।',
    tags: ['मुण्डन', 'चूडाकर्म', 'छेवर', 'शिखा', 'कपालकाट्ने'],
    suggestedPrice: 1550,
    samagriList: [
      'तामा/काँसको थाली र कैंची/उस्तरा – १ सेट',
      'शुद्ध गाईको गोबर र कुश – १ सेट',
      'पञ्चगव्य र गङ्गाजल – १ बोतल',
      'तामाको कलश र नरिवल – १ सेट',
      'शुद्ध गाईको घ्यू र हवन सामग्री – १.५ केजी',
      'समिधा काठ (पलाँस) – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'जनै र मौली धागो – ३ जोर',
      'नयाँ वस्त्र (धोती र कुर्था) – १ थान',
      'चन्दन, रोली र अबिर – १ सेट',
      'दुबो र फूलमाला – २ थान',
      'सुपारी र पानको पात – ११ वटा',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
      'शिखा (टुप्पी) बाँध्ने पवित्र सूत्र – १ थान',
    ],
    imageUrl: '/images/puja_packages/bartabandha_poster.jpg',
  },
  {
    id: 'ps_karnavedha_pkg',
    nameNepali: 'कर्णवेध संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Karnavedha (Ear Piercing) Ritual Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'शिशुको दुवै कान छेड्ने, बौद्धिक स्मरण शक्ति, श्रवण शक्ति र आरोग्य वृद्धिका लागि नवम संस्कार।',
    tags: ['कर्णवेध', 'कानछेड्ने', 'सुनकोसुई', 'आरोग्य', 'संस्कार'],
    suggestedPrice: 1250,
    samagriList: [
      'सुवर्ण शलाका (सुन वा चाँदीको सुई) – २ थान',
      'तामाको कलश र अक्षता – १ सेट',
      'शुद्ध घ्यू, मह र नौनी – १ सेट',
      'जनै, सुपारी र पानको पात – ५ वटा',
      'रोली, चन्दन र केशरी – १ सेट',
      'सुगन्धित धूप र पाला बत्ती – १ सेट',
      'पञ्चमेवा र मिश्री – १ प्याकेट',
      'तामाको पञ्चपात्र र आचमनी – १ सेट',
      'गङ्गाजल र तुलसीदल – १ सेट',
    ],
    imageUrl: '/images/puja_packages/annaprashan_pasni_poster.jpg',
  },
  {
    id: 'ps_vidyarambha_pkg',
    nameNepali: 'विद्यारम्भ एवं अक्षराम्भ संस्कार सेट',
    nameEnglish: 'Vidyarambha (Akshararambha) Learning Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'सरस्वती पूजा, मयूर प्वाँखले पाटीमा पहिलो अक्षर ॐ श्री गणेशाय नमः लेख्ने दशम संस्कार सामग्री।',
    tags: ['विद्यारम्भ', 'अक्षराम्भ', 'सरस्वती', 'पाटी', 'मयूरप्वाँख'],
    suggestedPrice: 1350,
    samagriList: [
      'काठको पाटी (स्लेट) र खरी (चक/कलम) – १ सेट',
      'मयूर प्वाँख र चाँदीको कलम – १ थान',
      'श्री सरस्वती माताको प्रतिमा/तस्वीर – १ थान',
      'श्री गणेश यन्त्र – १ थान',
      'पुस्तक, कापी र कलम – १ सेट',
      'तामाको कलश र नरिवल – १ सेट',
      'शुद्ध गाईको घ्यू – २५० ग्राम',
      'अक्षता, रोली, अबिर र केशरी – १ सेट',
      'पहेँलो फूलमाला र दुबो – २ थान',
      'पञ्चमेवा, लड्डु र मिश्री – १ प्याकेट',
      'जनै, सुपारी र पानको पात – ११ वटा',
      'धूप, अगरबत्ती र कपूर – १ सेट',
      'मह र सेतो चन्दन – १ सेट',
    ],
    imageUrl: '/images/puja_packages/ganesh_puja_poster.jpg',
  },
  {
    id: 'ps_upanayan_bartabandha_pkg',
    nameNepali: 'उपनयन (व्रतबन्ध) संस्कार सम्पूर्ण सामग्री महाप्याकेज',
    nameEnglish: 'Upanayana (Bartabandha) Complete Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'बटुकको द्विजत्व प्राप्ति, गायत्री मन्त्र दीक्षा, यज्ञोपवीत, पलाँस दण्ड, मेखला, भिक्षापात्र र हवन सामग्री सेट।',
    tags: ['व्रतबन्ध', 'उपनयन', 'जनै', 'पलाँसदण्ड', 'गायत्री', 'बटुक'],
    suggestedPrice: 2850,
    samagriList: [
      'पलाँसको दण्ड (ब्रह्मचारी दण्ड) – १ थान',
      'मृगछाला (वा कुशासन) – १ थान',
      'शुद्ध सूती जनै (यज्ञोपवीत) – २१ जोर',
      'कौपीन (लाँघाटी) र मेखला (मुञ्जा घाँसको डोरी) – १ सेट',
      'भिक्षापात्र (काँस/तामाको कचौरा) र झोली – १ सेट',
      'पहेँलो धोती र पहेँलो चादर (उत्तरीय) – २ थान',
      'तामाको कलश र पूर्णपात्र – २ सेट',
      'शुद्ध गाईको घ्यू – १ केजी',
      'समिधा काठ (पलाँस, शमी, आँप) – ३ केजी',
      'हवन कुण्ड र हवन सामग्री (साकल्य, गुग्गुल, कपुर) – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'नवग्रह समिधा, नवग्रह धान्य र नवग्रह वस्त्र (९ रङ) – १ सेट',
      'सप्तर्षि मण्डल पूजा सामग्री – १ सेट',
      'गायत्री मन्त्र दीक्षा पुस्तक र जपमाला (रुद्राक्ष/तुलसी) – १ सेट',
      'सुपारी र ल्वाङ-सुकुमेल – १०८ गेडा',
      'रोली, चन्दन, अबिर र सिन्दूर – १ सेट',
      'पञ्चगव्य र पञ्चामृत सामग्री – १ सेट',
      'तामाको पञ्चपात्र, आचमनी र अर्घ्यपात्र – १ सेट',
      'शङ्ख र गरुड घण्टी – १ सेट',
      'नरिवल (पानी भएको) – ५ वटा',
      'पञ्चमेवा र मिष्ठान्न – १ केजी',
      'धूप, दीप, अगरबत्ती र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/bartabandha_poster.jpg',
  },
  {
    id: 'ps_vedarambha_pkg',
    nameNepali: 'वेदारम्भ संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Vedarambha (Vedic Studies Initiation) Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'चार वेद (ऋग्, यजुर्, साम, अथर्व) अध्ययन प्रारम्भका लागि गरिने वेदारम्भ होम एवं ऋषिपूजन द्वादश संस्कार।',
    tags: ['वेदारम्भ', 'वेदपाठ', 'ऋग्वेद', 'यजुर्वेद', 'अध्ययन'],
    suggestedPrice: 1550,
    samagriList: [
      'चार वेद (ऋग्वेद, यजुर्वेद, सामवेद, अथर्ववेद) ग्रन्थ – १ सेट',
      'काठको ग्रन्थ मञ्च (रेखी/रेहड़ी) – १ थान',
      'व्यास पूजा सामग्री र चन्दन – १ सेट',
      'तामाको कलश र नरिवल – १ सेट',
      'शुद्ध घ्यू, समिधा र हवन सामग्री – १.५ केजी',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'जनै, सुपारी र पानको पात – ११ वटा',
      'पहेँलो वस्त्र र कुशको आसन – १ सेट',
      'धूप, दीप, कपूर र अगरबत्ती – १ सेट',
      'पञ्चामृत र पञ्चमेवा – १ सेट',
    ],
    imageUrl: '/images/puja_packages/bartabandha_poster.jpg',
  },
  {
    id: 'ps_keshanta_godana_pkg',
    nameNepali: 'केशान्त एवं गोदान संस्कार सामग्री सेट',
    nameEnglish: 'Keshanta & Godana Sanskar Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: '१६ वर्षको उमेरमा पहिलोपटक दाह्री-कपाल खौरने तथा गुरु दक्षिणा गोदान त्रयोदश संस्कार सामग्री।',
    tags: ['केशान्त', 'गोदान', 'गुरूदक्षिणा', 'संस्कार'],
    suggestedPrice: 1750,
    samagriList: [
      'गोदान सङ्कल्प द्रव्य र काँसको थाली – १ सेट',
      'पवित्र उस्तरा र शुद्ध गाईको घ्यू – १ सेट',
      'तामाको कलश र मङ्गल नरिवल – १ सेट',
      'समिधा काठ र हवन सामग्री – १.५ केजी',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'ब्रह्मचारी पीताम्बर वस्त्र र जनै – ५ जोर',
      'सुपारी, ल्वाङ, सुकुमेल – २१ गेडा',
      'चन्दन, रोली र भस्म – १ सेट',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/bartabandha_poster.jpg',
  },
  {
    id: 'ps_samavartana_pkg',
    nameNepali: 'समावर्तन (दीक्षान्त/स्नातक) संस्कार सामग्री सेट',
    nameEnglish: 'Samavartana (Graduation/Snataka) Ceremony Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'गुरुकुल विद्या समाप्त गरी स्नातक उपाधि सहित गृहस्थ आश्रम प्रवेश गर्ने चतुर्दश संस्कार।',
    tags: ['समावर्तन', 'स्नातक', 'दीक्षान्त', 'छत्र', 'खडाउँ'],
    suggestedPrice: 1950,
    samagriList: [
      'स्नातक छत्र (छाता) र काठको खराउ (पादुका) – १ सेट',
      'स्नातक दण्ड र फूलमाला – १ सेट',
      'शुद्ध नयाँ धोती, कुर्ता र उत्तरीय चादर – १ सेट',
      'सुगन्धित अत्तर र चन्दन लेप – १ सेट',
      'तामाको कलश र नरिवल – १ सेट',
      'शुद्ध घ्यू, समिधा र हवन सामग्री – १.५ केजी',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'जनै र मौली धागो – ५ जोर',
      'पञ्चमेवा, मिष्ठान्न र फलफूल – १ सेट',
      'धूप, दीप, कपूर र आरती थाली – १ सेट',
    ],
    imageUrl: '/images/puja_packages/bartabandha_poster.jpg',
  },
  {
    id: 'ps_vivah_sanskar_pkg',
    nameNepali: 'विवाह संस्कार सम्पूर्ण शास्त्रीय महाप्याकेज (मण्डप तथा पाणिग्रहण)',
    nameEnglish: 'Vivaha Sanskar Complete Marriage Ritual Kit',
    category: 'vivah_karma',
    categoryNameNepali: 'विवाह कर्मकाण्ड',
    description: 'सनातन वैदिक विवाह, कन्यादान, लगनगाँठो, सप्तपदी, सिन्दूरदान, स्वयंवर र मण्डप हवनका लागि सम्पूर्ण महाप्याकेज।',
    tags: ['विवाह', 'लग्न', 'स्वयंवर', 'सिन्दूर', 'लगनगाँठो', 'सप्तपदी', 'मण्डप'],
    suggestedPrice: 4200,
    samagriList: [
      'सिन्दूर (शुद्ध कामाख्या/वैदिक सिन्दूर) – १ विशेष डिब्बा',
      'पोते, तिलहरी र मङ्गलसूत्र – १ सेट',
      'वरमाला र दुबोको माला – २ जोर',
      'लगनगाँठो वस्त्र (पहेँलो र रातो पटुका) – २ थान',
      'पाणिग्रहण ताम्रपात्र र काँसको कचौरा – १ सेट',
      'मण्डप तोरण, आँपको पात र केराको थाम डोरी – १ सेट',
      'सप्तपदी मण्डल (७ सुपारी, ७ सिक्का, ७ अन्न) – १ सेट',
      'लाजा (धानको लाभा) – ५०० ग्राम',
      'शिला (सप्तपदी आरोहण ढुङ्गा) – १ थान',
      'तामाको मङ्गल कलश र पूर्णपात्र – २ सेट',
      'शुद्ध गाईको घ्यू – १.५ केजी',
      'समिधा काठ (पलाँस, खयर, आँप) – ५ केजी',
      'हवन कुण्ड र हवन सामग्री (साकल्य, गुग्गुल, कपूर) – १.५ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'नवग्रह समिधा, नवग्रह वस्त्र (९ रङ) र नवग्रह धान्य – १ सेट',
      'जनै (यज्ञोपवीत) – २१ जोर',
      'सुपारी र ल्वाङ-सुकुमेल – १०८ गेडा',
      'पानको पात – ५१ पाती',
      'नरिवल (पानी भएको) – ५ वटा',
      'रोली, अबिर, केशरी, चन्दन – १ सेट',
      'पञ्चगव्य र पञ्चामृत सामग्री – १ सेट',
      'पञ्चमेवा र मिष्ठान्न – १ केजी',
      'तामाको पञ्चपात्र, आचमनी र अर्घ्यपात्र – १ सेट',
      'शङ्ख, गरुड घण्टी र आरती थाली – १ सेट',
      'सुगन्धित धूप, अगरबत्ती र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/vivaha_mandap_poster.jpg',
  },
  {
    id: 'ps_antyeshti_moksha_pkg',
    nameNepali: 'अन्त्येष्टि एवं मोक्ष तर्पण कर्मकाण्ड सेट',
    nameEnglish: 'Antyeshti & Moksha Karma Samagri Kit',
    category: 'antyeshti_karma',
    categoryNameNepali: 'अन्त्येष्टि कर्म',
    description: 'मृत्यु संस्कार, दशगात्र, एकादशाह, द्वादशाह र सपिण्डीकरणसम्मका सम्पूर्ण पितृमुक्ति सामग्री।',
    tags: ['अन्त्येष्टि', 'मृत्युसंस्कार', 'सपिण्डीकरण', 'विष्णुपद', 'पिण्डदान'],
    suggestedPrice: 2200,
    samagriList: [
      'विष्णुपद पूजा सामग्री – १ सेट',
      'कालो तिल (शुद्ध) – १ केजी',
      'कुश (हरियो/सुकेको डाँठ) – १ मुठा',
      'कुशको पवित्री र आसन – २ जोर',
      'शुद्ध गङ्गाजल र गोमूत्र – २ बोतल',
      'काँचो सुती सेतो कपडा (कफन) – १ थान',
      'तामाको तर्पण पात्र र अर्घ्यपात्र – १ सेट',
      'जौको पीठो र पिण्डदान सामग्री – ५०० ग्राम',
      'शुद्ध घ्यू र भीमसेनी कपूर – १ सेट',
      'चन्दन काठ र तुलसी काठ – १ सेट',
      'माटोको पाला र दीप धागो – १ सेट',
      'धूप, अगरबत्ती र काँचो धागो – १ सेट',
    ],
    imageUrl: '/images/puja_packages/shraddha_pitri_poster.jpg',
  },

  // =========================================================================
  // २. गृहप्रवेश तथा वास्तु (Grihapravesh & Vastu)
  // =========================================================================
  {
    id: 'ps_grihapravesh_full_pkg',
    nameNepali: 'गृहप्रवेश पूजा सामग्री सम्पूर्ण सेट (नयाँ घर प्रवेश)',
    nameEnglish: 'Complete Griha Pravesh Puja Samagri Package',
    category: 'grihapravesh_vastu',
    categoryNameNepali: 'गृहप्रवेश तथा वास्तु',
    description: 'नयाँ घर प्रवेश, मङ्गल कलश यात्रा, कुलदेवता पूजन, तोरणद्वार र वास्तु शमन सामग्री।',
    tags: ['गृहप्रवेश', 'नयाँघर', 'तोरण', 'कलश', 'वास्तुहोम'],
    suggestedPrice: 2850,
    samagriList: [
      'मङ्गल कलश (तामाको कलश र नरिवल) – ५ सेट',
      'वास्तुपुरुष प्रतिमा / यन्त्र – १ थान',
      'पञ्चरत्न (सुन, चाँदी, हिरा/मुगा, माणिक, पन्ना) – १ सेट',
      'सप्तमृत्तिका (७ पवित्र स्थानको माटो) – १ सेट',
      'तोरणद्वार (आँपको पात, सुपाडी र फूलको तोरण) – १ सेट',
      'शुद्ध गाईको घ्यू – १.५ केजी',
      'समिधा काठ (पलाँस, शमी, आँप) – ३ केजी',
      'हवन कुण्ड र हवन सामग्री – १.५ केजी',
      'नवग्रह समिधा, नवग्रह वस्त्र र नवग्रह धान्य – १ सेट',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'दुध उमाल्ने तामाको नयाँ भाँडो – १ थान',
      'जनै (यज्ञोपवीत) – ११ जोर',
      'सुपारी र ल्वाङ-सुकुमेल – ५१ गेडा',
      'पानको पात – २१ पाती',
      'रोली, सिन्दूर, अबिर र चन्दन – १ सेट',
      'पञ्चगव्य र पञ्चामृत सामग्री – १ सेट',
      'पञ्चमेवा र मौसमी फलफूल – १ सेट',
      'तामाको पञ्चपात्र, आचमनी र अर्घ्यपात्र – १ सेट',
      'शङ्ख, गरुड घण्टी र आरती थाली – १ सेट',
      'धूप, अगरबत्ती र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/grihapravesh_vastu_poster.jpg',
  },
  {
    id: 'ps_vastu_shanti_pkg',
    nameNepali: 'वास्तुशान्ति एवं वास्तुहोम पूजा प्याकेज',
    nameEnglish: 'Vastu Shanti & Vastu Homa Ritual Kit',
    category: 'grihapravesh_vastu',
    categoryNameNepali: 'गृहप्रवेश तथा वास्तु',
    description: 'घर, भवन वा कार्यालयको वास्तुदोष निवारण, वास्तुपुरुष मण्डल र पञ्चरत्न स्थापना सामग्री।',
    tags: ['वास्तुशान्ति', 'वास्तुदोष', 'वास्तुपुरुष', 'पञ्चरत्न', 'पिरामिड'],
    suggestedPrice: 2600,
    samagriList: [
      'वास्तुपुरुष यन्त्र र तामाको पिरामिड – १ सेट',
      'सप्तमृत्तिका (७ पवित्र माटो) – १ सेट',
      'पञ्चगव्य र गङ्गाजल – १ सेट',
      'पञ्चरत्न र नवग्रह समिधा – १ सेट',
      'सप्तधान्य (७ प्रकारका अन्न) – १ प्याकेट',
      'समिधा काठ (पलाँस, शमी) – २ केजी',
      'शुद्ध गाईको घ्यू – १ केजी',
      'हवन सामग्री (गुग्गुल, कपुर, साकल्य) – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'जनै र सुपारी – ११ वटा',
      'रोली, चन्दन, अबिर र सिन्दूर – १ सेट',
      'धूप, अगरबत्ती र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/grihapravesh_vastu_poster.jpg',
  },
  {
    id: 'ps_bhumi_pujan_shilanyas',
    nameNepali: 'भूमिपूजन, शिलान्यास एवं घरको जग पूजा सामग्री',
    nameEnglish: 'Bhumi Pujan & Foundation Stone (Shilanyas) Kit',
    category: 'grihapravesh_vastu',
    categoryNameNepali: 'गृहप्रवेश तथा वास्तु',
    description: 'घर निर्माण शुभारम्भ, जग पूजा, ५ वटा कलश, कूर्मासन (कछुवा) र शिलान्यास इँटा पूजन सामग्री।',
    tags: ['भूमिपूजन', 'शिलान्यास', 'जगपूजा', 'कूर्मासन', 'निर्माण'],
    suggestedPrice: 2150,
    samagriList: [
      'तामाको कूर्मासन (कछुवा) – १ थान',
      '५ वटा तामाको कलश र मङ्गल नरिवल – ५ सेट',
      'शिलान्यास सुवर्ण/चाँदी पत्र – १ सेट',
      'पञ्चरत्न (५ धातु/रत्न) – १ सेट',
      'चाँदीको नाग-नागिनी जोडी – १ सेट',
      'सप्तधान्य र सप्तमृत्तिका – १ सेट',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'समिधा काठ र हवन सामग्री – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'धूप, दीप, रोली, अबिर र चन्दन – १ सेट',
    ],
    imageUrl: '/images/puja_packages/grihapravesh_vastu_poster.jpg',
  },
  {
    id: 'ps_office_shop_inauguration',
    nameNepali: 'नूतन पसल, कार्यालय तथा व्यवसाय उद्घाटन पूजा सेट',
    nameEnglish: 'New Shop & Business Inauguration Puja Kit',
    category: 'grihapravesh_vastu',
    categoryNameNepali: 'गृहप्रवेश तथा वास्तु',
    description: 'पसल, उद्योग वा कार्यालय शुभारम्भ गर्दा लक्ष्मी-कुबेर पूजा, खातापाता स्वस्तिक र व्यापार वृद्धि हवन।',
    tags: ['पसलउद्घाटन', 'व्यवसाय', 'कार्यालय', 'लक्ष्मीकुबेर', 'व्यापारवृद्धि'],
    suggestedPrice: 2100,
    samagriList: [
      'लक्ष्मी-कुबेर यन्त्र – १ थान',
      'खातापाता स्वस्तिक रोली र चन्दन – १ सेट',
      'तोरण माला र रिबन – १ सेट',
      'चाँदीको सिक्का (गणेश-लक्ष्मी) – १ थान',
      'मङ्गल कलश र नरिवल – १ सेट',
      'पञ्चामृत सामग्री – १ सेट',
      'हवन समिधा र घ्यू – १ केजी',
      'सुपारी, ल्वाङ, सुकुमेल – २१ गेडा',
      'सगुन मिठाई र पञ्चमेवा – १ प्याकेट',
      'धूप, अगरबत्ती र आरती थाली – १ सेट',
    ],
    imageUrl: '/images/puja_packages/lakshmi_puja_poster.jpg',
  },

  // =========================================================================
  // ३. ग्रहशान्ति तथा दोषनिवारण (Graha Shanti & Anushthan)
  // =========================================================================
  {
    id: 'ps_navagraha_shanti_full',
    nameNepali: 'नवग्रह शान्ति तथा ग्रहदोष निवारण सम्पूर्ण २१ सामग्री',
    nameEnglish: 'Complete Navagraha Shanti 21 Samagri Kit',
    category: 'graha_shanti',
    categoryNameNepali: 'ग्रहशान्ति',
    description: 'सूर्यदेखि केतुसम्म ९ ग्रह शान्ति, महादशा-अन्तर्दशा निवारणका लागि शास्त्रीय २१ सामग्री सेट।',
    tags: ['नवग्रह', 'ग्रहशान्ति', 'महादशा', '९वस्त्र', '९अन्न'],
    suggestedPrice: 1950,
    samagriList: [
      '९ ग्रहका ९ रङ्गीन वस्त्र (रातो, सेतो, पहेंलो, हरियो, कालो आदि) – ९ थान',
      '९ ग्रहका ९ समिधा काठ (आँक, पलास, खयर, अपामार्ग, पीपल, डुम्री, शमी, दूबो, कुश) – १ सेट',
      '९ ग्रहका ९ प्रकारका धान्य (गहुँ, चामल, रहर, मुंग, चना, सेतो सिमी, तिल, मास, कुलथी) – ९ प्याकेट',
      'नवग्रह यन्त्र (ताम्रपत्र) – १ थान',
      'तामाको कलश र पूर्णपात्र – २ सेट',
      'शुद्ध गाईको घ्यू – १ केजी',
      'हवन सामग्री (साकल्य, गुग्गुल, जटामासी) – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'जनै (यज्ञोपवीत) – ९ जोर',
      'सुपारी र ल्वाङ-सुकुमेल – ५१ गेडा',
      'रोली, चन्दन, अबिर र केशरी – १ सेट',
      'पञ्चगव्य र पञ्चामृत सामग्री – १ सेट',
      'तामाको पञ्चपात्र, आचमनी र अर्घ्यपात्र – १ सेट',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
      'पञ्चमेवा र मौसमी फलफूल – १ सेट',
    ],
    imageUrl: '/images/puja_packages/navagraha_shanti_poster.jpg',
  },
  {
    id: 'ps_kalsarp_shanti_pkg',
    nameNepali: 'कालसर्प योग तथा नागदोष शान्ति पूजा सेट',
    nameEnglish: 'Kalsarp Yoga & Nagadosha Shanti Kit',
    category: 'graha_shanti',
    categoryNameNepali: 'ग्रहशान्ति',
    description: 'राहु-केतु जनित कालसर्प योग, पितृदोष तथा नागदोष निवारणका लागि चाँदीको नाग जोडी सहित।',
    tags: ['कालसर्प', 'नागदोष', 'राहुकेतु', 'चाँदीकोनाग', 'दोषशान्ति'],
    suggestedPrice: 2450,
    samagriList: [
      'चाँदीको नाग-नागिनी जोडी प्रतिमा – १ सेट',
      'राहु-केतु यन्त्र (ताम्रपत्र) – १ थान',
      'कालो तिल (शुद्ध) – ५०० ग्राम',
      'कालो मास – ५०० ग्राम',
      'सप्तधान्य (७ प्रकारका अन्न) – १ प्याकेट',
      'तामाको दुग्धपात्र र अर्घ्यपात्र – १ सेट',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'हवन समिधा र विशेष शान्ति हवन सामग्री – १ केजी',
      'जनै, सुपारी र कालो/नीलो वस्त्र – ३ जोर',
      'रोली, चन्दन, भस्म र अबिर – १ सेट',
      'धूप, अगरबत्ती र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/navagraha_shanti_poster.jpg',
  },
  {
    id: 'ps_mangal_dosh_shanti_pkg',
    nameNepali: 'मंगलदोष (अंगारक) शान्ति तथा भातपूजा सेट',
    nameEnglish: 'Mangal Dosha (Bhat Puja) Shanti Package',
    category: 'graha_shanti',
    categoryNameNepali: 'ग्रहशान्ति',
    description: 'विवाह बाधा निवारण, मांगलिक दोष शमन तथा रक्तविकार शान्तिका लागि मंगल भातपूजा सामग्री।',
    tags: ['मंगलदोष', 'मांगलिक', 'विवाहबाधा', 'भातपूजा', 'अंगारक'],
    suggestedPrice: 1750,
    samagriList: [
      'मंगल यन्त्र (ताम्रपत्र) – १ थान',
      'रातो वस्त्र (धोती र सल) – २ थान',
      'रातो मुगा भस्म/प्रतीक – १ थान',
      'मसुरो दाल – ५०० ग्राम',
      'रातो चन्दन र रक्तचन्दन माला – १ सेट',
      'खयरको समिधा काठ – १ केजी',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'हवन सामग्री (साकल्य, गुग्गुल) – ५०० ग्राम',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'सुपारी, ल्वाङ, सुकुमेल – २१ गेडा',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/navagraha_shanti_poster.jpg',
  },
  {
    id: 'ps_shani_sadhesati_shanti',
    nameNepali: 'शनि साढेसाती, अष्टम शनि एवं शनिदोष शान्ति सेट',
    nameEnglish: 'Shani Sadhesati & Kantaka Shani Shanti Kit',
    category: 'graha_shanti',
    categoryNameNepali: 'ग्रहशान्ति',
    description: 'शनि साढेसाती, ढैय्या तथा महादशाको अशुभ प्रभाव शमनका लागि कालो तिल, तेल, फलाम र शमी काठ।',
    tags: ['शनि', 'साढेसाती', 'अष्टमशनि', 'कालोतिल', 'शमीकाठ'],
    suggestedPrice: 1650,
    samagriList: [
      'कालो तिलको शुद्ध तेल – १ बोतल',
      'कालो तिल (शुद्ध) – ५०० ग्राम',
      'कालो मास – ५०० ग्राम',
      'फलामको औंठी / ताम्र शनि यन्त्र – १ सेट',
      'कालो वस्त्र – १ थान',
      'शमीको समिधा काठ – १ केजी',
      'शुद्ध गाईको घ्यू – २५० ग्राम',
      'हवन सामग्री र कालो धान्य – १ प्याकेट',
      'नीलो फूल र अपराजिता – १ सेट',
      'माटोको पाला दियो र बत्ती – १ सेट',
      'सुगन्धित धूप र कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/navagraha_shanti_poster.jpg',
  },
  {
    id: 'ps_mahamrityunjaya_hom_full',
    nameNepali: 'महामृत्युञ्जय होम एवं सवालाख जप अनुष्ठान सामग्री',
    nameEnglish: 'Mahamrityunjaya Homa & Health Anushthan Kit',
    category: 'vishesh_anushthan',
    categoryNameNepali: 'विशेष अनुष्ठान',
    description: 'आरोग्य, अकाल मृत्यु निवारण, रोगमुक्ति तथा दीर्घायुष्य महामृत्युञ्जय होम सामग्री सेट।',
    tags: ['महामृत्युञ्जय', 'आरोग्य', 'दीर्घायु', 'अग्निहोत्र', 'रोगमुक्ति'],
    suggestedPrice: 3200,
    samagriList: [
      'महामृत्युञ्जय यन्त्र – १ थान',
      '१०८ रुद्राक्ष जपमाला – १ थान',
      'तामाको हवन कुण्ड – १ थान',
      'अमृत वल्लरी (गुर्जो) र दूबो – १ सेट',
      'शुद्ध गुग्गुल र जटामासी – ५०० ग्राम',
      'शुद्ध गाईको घ्यू – १.५ केजी',
      'समिधा काठ (पिपल, आँप, शमी) – ३ केजी',
      'जौ, कालो तिल, कुश र अक्षता – १.५ केजी',
      'सर्वोषधी र सप्तमृत्तिका – १ सेट',
      'भीमसेनी शुद्ध कपूर – २ बट्टा',
      'पञ्चामृत किट (दूध, दही, घ्यू, मह, मिश्री) – १ सेट',
      'तामाको पञ्चपात्र र आचमनी – १ सेट',
      'धूप, अगरबत्ती र आरती थाली – १ सेट',
    ],
    imageUrl: '/images/puja_packages/rudrabhishek_shiva_poster.jpg',
  },
  {
    id: 'ps_rudrabhishek_laghurudra',
    nameNepali: 'रुद्राभिषेक, लघुरुद्र एवं महारुद्र अनुष्ठान सामग्री',
    nameEnglish: 'Rudrabhishek, Laghurudra & Maharudra Kit',
    category: 'vishesh_anushthan',
    categoryNameNepali: 'विशेष अनुष्ठान',
    description: 'एकादश रुद्री, पार्थिव शिवलिङ्ग पूजन, दुग्धधारा अभिषेक र रुद्राष्टाध्यायी हवन सामग्री।',
    tags: ['रुद्राभिषेक', 'लघुरुद्र', 'महारुद्र', 'शिवलिङ्ग', 'बेलपत्र'],
    suggestedPrice: 2450,
    samagriList: [
      'तामाको अभिषेक शृङ्गी (जलधारा पात्र) – १ थान',
      'पारद वा स्फटिक शिवलिङ्ग – १ थान',
      '१०८ बेलपत्र (त्रिदल) – १ टोकरी',
      'शुद्ध गाईको दूध, दही, घ्यू, मह, सख्खर (पञ्चामृत) – १ सेट',
      'गङ्गाजल, गुलाबजल र सुगन्धित अत्तर – १ सेट',
      'सेतो चन्दन, रक्त चन्दन र भस्म (विभूति) – १ सेट',
      'रुद्राक्ष माला (१०८ दाना) – १ थान',
      'आकको फूल, धतुरो र भाङ – १ सेट',
      'जनै र पहेँलो/सेतो वस्त्र – ५ जोर',
      'तामाको कलश र मङ्गल नरिवल – २ थान',
      'समिधा काठ र हवन सामग्री – २ केजी',
      'शुद्ध गाईको घ्यू – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'सुपारी, ल्वाङ र सुकुमेल – ५१ गेडा',
      'सुगन्धित धूप, धूपबत्ती र भीमसेनी कपूर – १ सेट',
      'पञ्चमेवा र मौसमी फलफूल – १ सेट',
      'तामाको पञ्चपात्र, आचमनी र अर्घ्यपात्र – १ सेट',
      'गरुड घण्टी र आरती थाली – १ सेट',
    ],
    imageUrl: '/images/puja_packages/rudrabhishek_shiva_poster.jpg',
  },

  // =========================================================================
  // ४. काम्य पूजा तथा मनोकामना सिद्धि (Kamya Pujas)
  // =========================================================================
  {
    id: 'ps_santana_gopala_puja',
    nameNepali: 'सन्तान प्राप्ति (सन्तानगोपाल एवं पुत्रकामेष्टि) पूजा सेट',
    nameEnglish: 'Santana Gopala & Putrakameshti Puja Kit',
    category: 'kamya_puja',
    categoryNameNepali: 'काम्य पूजा',
    description: 'सन्तान सुख, दीर्घायु पुत्र-पुत्री प्राप्ति तथा गर्भदोष निवारणका लागि सन्तानगोपाल पूजा सामग्री।',
    tags: ['सन्तानगोपाल', 'पुत्रकामेष्टि', 'सन्तानप्राप्ति', 'बालकृष्ण', 'मनोकामना'],
    suggestedPrice: 1950,
    samagriList: [
      'सन्तानगोपाल यन्त्र (ताम्रपत्र) – १ थान',
      'बालकृष्ण विग्रह / चित्र – १ थान',
      'शुद्ध नौनी (माखन) र मिश्री – १ सेट',
      'तुलसी मञ्जरी र तुलसीपत्र – १ टोकरी',
      'पहेँलो वस्त्र – १ थान',
      'पञ्चामृत किट (दूध, दही, घ्यू, मह, मिश्री) – १ सेट',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'हवन समिधा र हवन सामग्री – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ सेट',
      'जनै र सुपारी – ११ वटा',
      'पञ्चमेवा र ५ थरी फलफूल – १ सेट',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/satyanarayan_puja_poster.jpg',
  },
  {
    id: 'ps_lakshmi_dhanaprapti_pkg',
    nameNepali: 'धनप्राप्ति, श्रीवृद्धि एवं महालक्ष्मी-कुबेर पूजा सेट',
    nameEnglish: 'Dhanaprapti Mahalaxmi & Kuber Wealth Puja Kit',
    category: 'kamya_puja',
    categoryNameNepali: 'काम्य पूजा',
    description: 'आर्थिक समृद्धि, व्यापार सफलता, ऋणमुक्ति र धनवृद्धिका लागि कनकधारा एवं श्रीसूक्त पूजा सेट।',
    tags: ['धनप्राप्ति', 'महालक्ष्मी', 'कुबेर', 'श्रीयन्त्र', 'कमलगट्टा'],
    suggestedPrice: 2250,
    samagriList: [
      'श्री महालक्ष्मी-गणेश-कुबेर प्रतिमा / तस्वीर – १ थान',
      'श्री यन्त्र (तामा/स्फटिक) – १ थान',
      'कमलको फूल र कमलगट्टा माला – १ सेट',
      'चाँदीको सिक्का (गणेश-लक्ष्मी अङ्कित) – १ थान',
      'कौडा (पहेँलो कौडा) – ११ वटा',
      'गोमती चक्र – ११ वटा',
      'तामाको कलश र मङ्गल नरिवल – १ थान',
      'रातो र पहेँलो वस्त्र – २ थान',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'तिलको तेल र माटोका पाला दियो (२१ वटा) – १ सेट',
      'कपासको बत्ती – १ प्याकेट',
      'रोली, सिन्दूर, केशरी, चन्दन र अबिर – १ सेट',
      'अक्षता, जौ, तिल र कुश – १ सेट',
      'सुपारी र ल्वाङ-सुकुमेल – २१ गेडा',
      'पानको पात – ११ पाती',
      'पञ्चमेवा, लड्डु र बतासा – १ प्याकेट',
      'धूप, अगरबत्ती र भीमसेनी कपूर – १ सेट',
      'आरती थाली र घण्टी – १ सेट',
    ],
    imageUrl: '/images/puja_packages/lakshmi_puja_poster.jpg',
  },
  {
    id: 'ps_vidya_smriti_pariksha',
    nameNepali: 'विद्या प्राप्ति, बुद्धि-स्मृति वृद्धि एवं परीक्षा सफलता सेट',
    nameEnglish: 'Vidya & Saraswati Smriti Learning & Exam Kit',
    category: 'kamya_puja',
    categoryNameNepali: 'काम्य पूजा',
    description: 'विद्यार्थीहरूको एकाग्रता, स्मरणशक्ति वृद्धि, परीक्षामा सफलता तथा वाणी सिद्धिका लागि सरस्वती पूजा।',
    tags: ['विद्या', 'परीक्षासफलता', 'सरस्वती', 'मेधा', 'स्मरणशक्ति'],
    suggestedPrice: 1250,
    samagriList: [
      'सरस्वती यन्त्र – १ थान',
      'स्फटिक माला (१०८ दाना) – १ थान',
      'श्वेत चन्दन र रक्त चन्दन – १ सेट',
      'मयूर प्वाँखको कलम – १ थान',
      'पहेंलो-सेतो वस्त्र – १ थान',
      'ब्राह्मी घ्यू – २५० ग्राम',
      'धूप, दीप, अक्षता र कपूर – १ सेट',
      'पञ्चमेवा र मिश्री – १ प्याकेट',
      'जनै, सुपारी र पान – ५ वटा',
    ],
    imageUrl: '/images/puja_packages/ganesh_puja_poster.jpg',
  },
  {
    id: 'ps_shatru_badha_karyasiddhi',
    nameNepali: 'शत्रुबाधा निवारण, कार्यसिद्धि एवं हनुमान पूजा सेट',
    nameEnglish: 'Shatru Badha Nivaran & Karya Siddhi Hanuman Kit',
    category: 'kamya_puja',
    categoryNameNepali: 'काम्य पूजा',
    description: 'मुद्दा-मामिला विजय, शत्रु पराजय, नजरदोष निवारण र रोकिएका कार्य सम्पन्न गर्नका लागि।',
    tags: ['शत्रुबाधा', 'कार्यसिद्धि', 'हनुमान', 'बगलामुखी', 'विजय'],
    suggestedPrice: 1850,
    samagriList: [
      'हनुमान यन्त्र / बगलामुखी यन्त्र – १ थान',
      'शुद्ध सिन्दूर र चमेलीको तेल – १ सेट',
      'रातो लंगोट/वस्त्र – १ थान',
      'जनेउ र मौली – ५ जोर',
      'ल्वाङ, सुपाडी र पान – २१ वटा',
      'हवन समिधा र घ्यू – १ केजी',
      'घ्यूको दियो र कपुर – १ सेट',
      'पञ्चमेवा र सख्खर – १ प्याकेट',
    ],
    imageUrl: '/images/puja_packages/ganesh_puja_poster.jpg',
  },

  // =========================================================================
  // ५. श्राद्ध तथा पितृकर्म (Shraddha & Pitri Karma)
  // =========================================================================
  {
    id: 'ps_sohrashraddha_parvana_pkg',
    nameNepali: 'सोह्रश्राद्ध, एकोदिष्ट एवं पार्वण श्राद्ध सम्पूर्ण सामग्री',
    nameEnglish: 'Sohra Shraddha & Parvana Pitri Karma Package',
    category: 'shraddha_pitri',
    categoryNameNepali: 'श्राद्ध तथा पितृकर्म',
    description: 'सोह्रश्राद्ध (पितृपक्ष), एकोदिष्ट, पार्वण, वार्षिक श्राद्ध र तीर्थ श्राद्धका लागि शास्त्रीय सामग्री सेट।',
    tags: ['सोह्रश्राद्ध', 'एकोदिष्ट', 'पार्वण', 'कालोतिल', 'कुश', 'पिण्डदान'],
    suggestedPrice: 1450,
    samagriList: [
      'कालो तिल (शुद्ध पितृ तिल) – १ केजी',
      'कुश (शुद्ध वैदिक कुश) – १ मुठा',
      'कुशको ब्राह्मणी र पवित्री – ५ जोर',
      'जौ र अरुवा चामल (पिण्डदानका निमित्त) – १ केजी',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'शुद्ध मह (मधुपर्क निमित्त) – १ सानो सिसी',
      'गाईको काँचो दूध – १ लिटर',
      'तामाको तर्पण पात्र (तसली) र अर्घ्यपात्र – १ सेट',
      'तुलसीपत्र र भृङ्गराज – १ सेट',
      'सेतो चन्दन र गोपीचन्दन – १ सेट',
      'सुपारी र जनै (पितृ जनै) – ११ जोर',
      'सेतो धोती र सेतो उत्तरीय (ब्राह्मण वरण वस्त्र) – २ थान',
      'काँसको थाली र कचौरा – १ सेट',
      'पञ्चमेवा र मौसमी फलफूल – १ सेट',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
      'पितृ गायत्री मन्त्र पुस्तक र विधि – १ थान',
      'गङ्गाजल – १ बोतल',
    ],
    imageUrl: '/images/puja_packages/shraddha_pitri_poster.jpg',
  },
  {
    id: 'ps_nitya_pitri_tarpana_pkg',
    nameNepali: 'नित्य पितृ तर्पण एवं तीर्थ श्राद्ध (गया/मुक्तिनाथ) सेट',
    nameEnglish: 'Daily Pitri Tarpana & Gaya Tirtha Kit',
    category: 'shraddha_pitri',
    categoryNameNepali: 'श्राद्ध तथा पितृकर्म',
    description: 'दैनिक पितृ तर्पण, अमावस्या (औंसी) तर्पण तथा गया-काशी तीर्थ श्राद्ध संकल्प सामग्री।',
    tags: ['तर्पण', 'पितृतर्पण', 'गयाश्राद्ध', 'मुक्तिनाथ', 'कुशापवित्री'],
    suggestedPrice: 1150,
    samagriList: [
      'तामाको तर्पण अर्घ्यपात्र (तसली) – १ थान',
      'कुशको पवित्री – ५ थान',
      'पहाडी कालो तिल – ५०० ग्राम',
      'पहेंलो जौ – ५०० ग्राम',
      'तुलसी काठ / दल – १ सेट',
      'गङ्गाजल – १ बोतल',
      'सेतो जनै – ५ जोर',
      'सेतो चन्दन – १ थान',
      'धूप, दीप र कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/shraddha_pitri_poster.jpg',
  },
  {
    id: 'ps_tri_pindi_narayan_bali',
    nameNepali: 'त्रिपिण्डी श्राद्ध एवं नारायणबलि अनुष्ठान सेट',
    nameEnglish: 'Tripindi Shraddha & Narayana Bali Karma Kit',
    category: 'shraddha_pitri',
    categoryNameNepali: 'श्राद्ध तथा पितृकर्म',
    description: 'पितृदोष, प्रेतबाधा मुक्ति, अपमृत्यु शान्ति तथा वंशवृद्धिका लागि त्रिपिण्डी श्राद्ध सामग्री।',
    tags: ['त्रिपिण्डी', 'नारायणबलि', 'नागबलि', 'पितृदोष', 'प्रेतमुक्ति'],
    suggestedPrice: 2450,
    samagriList: [
      'विष्णु प्रतिमा / यन्त्र – १ थान',
      '३ प्रकारका पिण्ड सामग्री (जौ, तिल, सातु) – १ सेट',
      'सेतो, पहेंलो र कालो वस्त्र – ३ थान',
      'कुश, कालो तिल र जौ – १ केजी',
      'पञ्चामृत किट – १ सेट',
      'हवन समिधा र घ्यू – १.५ केजी',
      'तामाको तर्पण पात्र – १ थान',
      'जनै र सुपारी – ११ वटा',
      'गङ्गाजल र गोमूत्र – २ बोतल',
      'धूप, दीप र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/shraddha_pitri_poster.jpg',
  },

  // =========================================================================
  // ६. देवदेवी पूजा तथा व्रत-पर्व (Devadevi, Vrata & Parva)
  // =========================================================================
  {
    id: 'ps_satyanarayan_full_pkg',
    nameNepali: 'सत्यनारायण व्रतकथा पूजा सामग्री सम्पूर्ण सेट',
    nameEnglish: 'Satyanarayan Brata Katha Complete Package',
    category: 'vrata_parva',
    categoryNameNepali: 'व्रत तथा पर्व',
    description: 'पूर्णिमा, एकादशी तथा मासिक सत्यनारायण कथा, शालिग्राम, पञ्चामृत, तुलसी र मण्डप सामग्री।',
    tags: ['सत्यनारायण', 'व्रतकथा', 'पूर्णिमा', 'शालिग्राम', 'पञ्चामृत'],
    suggestedPrice: 1550,
    samagriList: [
      '४ केराको थाम (सजावट तोरण स्तम्भ) – १ सेट',
      'श्री शालिग्राम शिला / सत्यनारायण तस्वीर – १ थान',
      'तामाको कलश र मङ्गल नरिवल – २ थान',
      'तुलसी मञ्जरी र तुलसीपत्र – १ टोकरी',
      'पञ्चामृत सामग्री (दूध, दही, घ्यू, मह, मिश्री) – १ सेट',
      'सपाद भक्षण (सवा माना पीठो, सवा माना घ्यू, सवा माना चिनी) – १ सेट',
      'शुद्ध गाईको घ्यू – ५०० ग्राम',
      'समिधा काठ र हवन सामग्री – १ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'पञ्चरत्न र पञ्चपल्लव (५ पात) – १ सेट',
      'जनै र पहेँलो वस्त्र – ५ जोर',
      'सुपारी र ल्वाङ-सुकुमेल – ५१ गेडा',
      'पानको पात – २१ पाती',
      'रोली, चन्दन, अबिर र सिन्दूर – १ सेट',
      'पञ्चमेवा र ५ प्रकारका फलफूल – १ टोकरी',
      'श्री सत्यनारायण व्रत कथा पुस्तक – १ थान',
      'धूप, अगरबत्ती, दीप र भीमसेनी कपूर – १ सेट',
      'आरती थाली र घण्टी – १ सेट',
    ],
    imageUrl: '/images/puja_packages/satyanarayan_puja_poster.jpg',
  },
  {
    id: 'ps_durga_chandi_path_full',
    nameNepali: 'दुर्गा सप्तशती (चण्डी पाठ) एवं शतचण्डी अनुष्ठान सेट',
    nameEnglish: 'Durga Saptashati Chandi Path & Shatchandi Kit',
    category: 'vishesh_anushthan',
    categoryNameNepali: 'विशेष अनुष्ठान',
    description: 'बडादशैं, चैते दशैं, नवरात्र तथा मनोकामना सिद्धिका लागि चण्डी पाठ, नवार्ण मन्त्र र हवन सामग्री।',
    tags: ['चण्डीपाठ', 'दुर्गासप्तशती', 'दशैं', 'नवरात्र', 'शतचण्डी'],
    suggestedPrice: 2850,
    samagriList: [
      'श्री दुर्गा सप्तशती चण्डी पुस्तक – १ थान',
      'नवदुर्गा प्रतिमा / यन्त्र – १ थान',
      'रातो चुनरी, रातो वस्त्र र साडी – २ थान',
      'अखण्ड ज्योति दियो (पित्तल/तामा) – १ थान',
      'तामाको कलश र पानी नरिवल – ३ थान',
      'जौ, तिल, कुश र अक्षता – १.५ केजी',
      'शुद्ध गाईको घ्यू – २ केजी',
      'समिधा काठ (खयर, पिपल, शमी) – ५ केजी',
      'हवन सामग्री (साकल्य, गुग्गुल, कमल गट्टा, जटामासी) – २ केजी',
      'नवग्रह समिधा, नवग्रह वस्त्र र नवग्रह अन्न – १ सेट',
      'जौको जमरा उमार्ने माटो र जौ – १ सेट',
      'सौभाग्य सामग्री (सिन्दूर, पोते, काइँयो, ऐना, चुरा) – १ सेट',
      'रातो फूलमाला (गुलाफ/रक्तचन्दन) – ३ थान',
      'सुपारी, ल्वाङ, सुकुमेल – १०८ गेडा',
      'पानको पात – ५१ पाती',
      'पञ्चमेवा, नरिवल र मिष्ठान्न – १ केजी',
      'तामाको पञ्चपात्र, आचमनी र अर्घ्यपात्र – १ सेट',
      'शङ्ख, गरुड घण्टी र महाआरती थाली – १ सेट',
      'धूप, अगरबत्ती र भीमसेनी कपूर – १ सेट',
    ],
    imageUrl: '/images/puja_packages/durga_chandi_poster.jpg',
  },
  {
    id: 'ps_kuldevata_puja_pkg',
    nameNepali: 'कुलदेवता, कुलदेवी एवं देवाली पूजा सामग्री सेट',
    nameEnglish: 'Kuldevata & Kuldevi Devali Puja Package',
    category: 'kuldevata_puja',
    categoryNameNepali: 'कुलदेवता पूजा',
    description: 'कुलपूजा, देवाली, गोठ पूजा तथा वंश संरक्षणका लागि परम्परागत कुलदेवता पूजन सामग्री।',
    tags: ['कुलदेवता', 'कुलदेवी', 'देवाली', 'कुलपूजा', 'वंशसंरक्षण'],
    suggestedPrice: 2250,
    samagriList: [
      'कुल मन्दिर तोरण र ध्वजा (रातो/सेतो पताका) – २ थान',
      'तामाको त्रिशूल र घण्टी – १ सेट',
      'मङ्गल कलश र पानी नरिवल – २ थान',
      'शुद्ध गाईको घ्यू – १ केजी',
      'समिधा काठ र विशेष कुल हवन सामग्री – १.५ केजी',
      'जौ, तिल, कुश र अक्षता – १ केजी',
      'अक्षत चामल र रोटो/बाबर सामग्री – १ सेट',
      'जनै र मौली धागो – ५ जोर',
      'सुपारी, ल्वाङ र सुकुमेल – ५१ गेडा',
      'रोली, सिन्दूर, अबिर र केशरी – १ सेट',
      'पञ्चमेवा र मिष्ठान्न – १ केजी',
      'धूप, धूपी, अगरबत्ती र भीमसेनी कपूर – १ सेट',
      'तामाको पञ्चपात्र र आरती थाली – १ सेट',
    ],
    imageUrl: '/images/puja_packages/durga_chandi_poster.jpg',
  },
];

/**
 * Filter gallery items by search query and category
 */
export function getFilteredPujaGalleryItems(
  items: PujaGalleryItem[],
  categoryFilter: StoreCategoryKey | 'all',
  searchQuery: string = ''
): PujaGalleryItem[] {
  let filtered = items;

  if (categoryFilter !== 'all') {
    filtered = filtered.filter(item => item.category === categoryFilter);
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(item => {
      const matchName = item.nameNepali.toLowerCase().includes(query) || item.nameEnglish.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchTags = item.tags.some(tag => tag.toLowerCase().includes(query));
      const matchSamagri = item.samagriList?.some(s => s.toLowerCase().includes(query));
      return matchName || matchDesc || matchTags || matchSamagri;
    });
  }

  return filtered;
}

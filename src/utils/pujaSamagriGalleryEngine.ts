// ============================================================================
// बालानन्द वैदिक पसल - पूजा सामग्री तथा वैदिक उत्पादन ग्यालरी इन्जिन (50+ Items)
// (Comprehensive 50+ Vedic Puja Samagri & Ceremonial Graphics Engine)
// Features: Detailed Cultural Ceremony Graphics & Authentic Package Items
// ============================================================================

import { StoreCategoryKey, VEDIC_STORE_16_CATEGORIES } from '../types/vedicStoreTypes';

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
  | 'garbhadhana_simanta'        // सीमन्तोन्नयन: गर्भिणी आमालाई मन्त्राक्षता र पञ्चामृत आशीर्वाद
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
    bgSky: [string, string, string]; // Top, Mid, Bottom
    frameGold: string;
    accent: string;
  };
  highlightBadge?: string;
}

/**
 * Returns high-resolution poster image for ceremony and title
 */
export function getPosterImageForCeremony(sceneType: CeremonySceneType, titleNepali?: string): string {
  if (titleNepali && (titleNepali.includes('गणेश') || titleNepali.includes('विद्यारम्भ'))) {
    return '/images/puja_packages/ganesh_puja_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('विवाह') || titleNepali.includes('लग्न'))) {
    return '/images/puja_packages/vivaha_mandap_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('व्रतबन्ध') || titleNepali.includes('उपनयन') || titleNepali.includes('मुण्डन') || titleNepali.includes('चूडाकर्म') || titleNepali.includes('वेदारम्भ') || titleNepali.includes('समावर्तन') || titleNepali.includes('छेवर'))) {
    return '/images/puja_packages/bartabandha_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('पास्नी') || titleNepali.includes('अन्नप्राशन') || titleNepali.includes('कर्णवेध') || titleNepali.includes('निष्क्रमण'))) {
    return '/images/puja_packages/annaprashan_pasni_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('न्वारान') || titleNepali.includes('नामकरण') || titleNepali.includes('गर्भाधान') || titleNepali.includes('पुंसवन') || titleNepali.includes('सीमन्त') || titleNepali.includes('जातकर्म'))) {
    return '/images/puja_packages/nwaran_namakarana_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('रुद्र') || titleNepali.includes('शिव') || titleNepali.includes('महामृत्युञ्जय') || titleNepali.includes('लिङ्ग'))) {
    return '/images/puja_packages/rudrabhishek_shiva_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('सत्यनारायण') || titleNepali.includes('सन्तानगोपाल') || titleNepali.includes('एकादशी') || titleNepali.includes('पूर्णिमा'))) {
    return '/images/puja_packages/satyanarayan_puja_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('दुर्गा') || titleNepali.includes('चण्डी') || titleNepali.includes('कुलदेवता') || titleNepali.includes('देवाली') || titleNepali.includes('नवरात्र') || titleNepali.includes('दशैं'))) {
    return '/images/puja_packages/durga_chandi_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('लक्ष्मी') || titleNepali.includes('दीपावली') || titleNepali.includes('तिहार') || titleNepali.includes('व्यापार') || titleNepali.includes('कुबेर'))) {
    return '/images/puja_packages/lakshmi_puja_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('नवग्रह') || titleNepali.includes('कालसर्प') || titleNepali.includes('मंगल') || titleNepali.includes('दोष') || titleNepali.includes('शान्ति'))) {
    return '/images/puja_packages/navagraha_shanti_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('गृहप्रवेश') || titleNepali.includes('वास्तु') || titleNepali.includes('भूमि') || titleNepali.includes('शिलान्यास'))) {
    return '/images/puja_packages/grihapravesh_vastu_poster.jpg';
  }
  if (titleNepali && (titleNepali.includes('श्राद्ध') || titleNepali.includes('तर्पण') || titleNepali.includes('अन्त्येष्टि') || titleNepali.includes('पितृ') || titleNepali.includes('मोक्ष'))) {
    return '/images/puja_packages/shraddha_pitri_poster.jpg';
  }

  switch (sceneType) {
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
    case 'garbhadhana_simanta':
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

function _legacySvgGenerator(options: CeremonyGraphicOptions): string {
  const {
    sceneType,
    titleNepali,
    subtitleNepali,
    categoryNepali,
    samagriItems,
    theme,
    highlightBadge = 'वैदिक विधि प्रमाणित सम्पूर्ण प्याकेज'
  } = options;

  let sceneIllustrationSvg = '';

  switch (sceneType) {
    case 'vivah_mandap_sindur':
      // Traditional Nepali Wedding Mandap: Groom applying Sindur on Bride, Pandit, Sacred Fire, Family clapping
      sceneIllustrationSvg = `
        <!-- Traditional Nepali Vivaha Marwa Mandap -->
        <g id="vivah_mandap">
          <!-- Mandap Canopy / Red & Gold Velvet Drapes -->
          <path d="M120,80 Q480,40 840,80 L800,140 Q480,110 160,140 Z" fill="#991B1B" stroke="#FDE047" stroke-width="2.5"/>
          <path d="M160,140 Q480,110 800,140 L780,165 Q480,135 180,165 Z" fill="#B91C1C" opacity="0.9"/>
          <!-- Hanging Marigold & Mango Leaf Toran Garlands -->
          <g stroke="#F59E0B" stroke-width="3" fill="none">
            <path d="M160,140 Q240,175 320,140 Q400,175 480,140 Q560,175 640,140 Q720,175 800,140"/>
          </g>
          <!-- Banana Tree Pillars (केराको थाम) on 4 corners -->
          <g transform="translate(140, 140)">
            <rect x="-16" y="0" width="32" height="260" rx="8" fill="#15803D" stroke="#14532D" stroke-width="2"/>
            <path d="M-10,40 Q-60,10 -80,-20 Q-40,20 -10,45" fill="#16A34A"/>
            <path d="M10,80 Q70,40 90,10 Q50,55 10,85" fill="#16A34A"/>
          </g>
          <g transform="translate(820, 140)">
            <rect x="-16" y="0" width="32" height="260" rx="8" fill="#15803D" stroke="#14532D" stroke-width="2"/>
            <path d="M10,40 Q60,10 80,-20 Q40,20 10,45" fill="#16A34A"/>
            <path d="M-10,80 Q-70,40 -90,10 Q-50,55 -10,85" fill="#16A34A"/>
          </g>

          <!-- Central Havan Kunda with Sacred Wedding Agni -->
          <g transform="translate(480, 330)">
            <polygon points="-55,30 55,30 40,10 -40,10" fill="#9A3412" stroke="#FED7AA" stroke-width="1.5"/>
            <polygon points="-40,10 40,10 28,-6 -28,-6" fill="#C2410C"/>
            <!-- Rising Sacred Flame -->
            <path d="M0,-50 Q-18,-20 -10,0 Q0,8 10,0 Q18,-20 0,-50 Z" fill="#EA580C"/>
            <path d="M0,-42 Q-10,-18 -5,-2 Q0,4 5,-2 Q10,-18 0,-42 Z" fill="#FDE047"/>
            <path d="M0,-28 Q-4,-10 0,0 Q4,-10 0,-28 Z" fill="#FFFFFF"/>
            <!-- Mangal Kalash beside Fire -->
            <ellipse cx="-75" cy="15" rx="16" ry="12" fill="#EA580C" stroke="#7C2D12" stroke-width="1"/>
            <circle cx="-75" cy="-2" r="8" fill="#78350F"/>
            <circle cx="-75" cy="-2" r="2.5" fill="#DC2626"/>
          </g>

          <!-- GROOM (बेहुला) - Traditional Nepali Daura Suruwal & Dhaka Topi -->
          <g transform="translate(370, 240)">
            <!-- Groom Head & Dhaka Topi -->
            <ellipse cx="0" cy="-35" rx="16" ry="18" fill="#FCD34D"/>
            <!-- Nepali Dhaka Topi (Geometric pattern) -->
            <polygon points="-16,-45 0,-68 16,-45 -14,-45" fill="#991B1B" stroke="#FDE047" stroke-width="1"/>
            <path d="M-12,-48 L0,-62 L12,-48 Z" fill="#DC2626"/>
            <!-- Tilak on Forehead -->
            <line x1="0" y1="-42" x2="0" y2="-32" stroke="#DC2626" stroke-width="2"/>
            <circle cx="0" cy="-34" r="2" fill="#FDE047"/>
            <!-- Body (Daura Suruwal / Cream Coat) -->
            <path d="M-28,-15 L28,-15 L38,80 L-38,80 Z" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
            <!-- Red Shawl / Doshalla & Dubo Mala -->
            <path d="M-26,-15 Q0,45 26,-15" fill="none" stroke="#DC2626" stroke-width="4"/>
            <path d="M-22,-12 Q0,35 22,-12" fill="none" stroke="#16A34A" stroke-width="3"/> <!-- Dubo Mala -->
            <!-- Groom Hand raising Sindur to Bride's Maang -->
            <path d="M22,10 Q55,-10 75,-25" fill="none" stroke="#FCD34D" stroke-width="7" stroke-linecap="round"/>
            <circle cx="75" cy="-25" r="5" fill="#DC2626"/> <!-- Red Sindur in hand -->
          </g>

          <!-- BRIDE (बेहुली) - Red Saree, Golden Ornaments & Tilhari -->
          <g transform="translate(560, 250)">
            <!-- Bride Head & Ornate Red Veil (घूँघट) -->
            <path d="M-20,-45 Q0,-65 24,-45 L32,40 L-26,40 Z" fill="#DC2626" stroke="#FEF08A" stroke-width="1.5"/>
            <ellipse cx="0" cy="-32" rx="15" ry="17" fill="#FDE68A"/>
            <!-- Maang Tikka & Sindur Line on Forehead -->
            <line x1="-5" y1="-44" x2="-5" y2="-30" stroke="#DC2626" stroke-width="3"/>
            <circle cx="-5" cy="-44" r="3" fill="#FDE047"/>
            <!-- Tilhari / Pote Golden Necklace -->
            <path d="M-18,-15 Q-5,15 15,-15" fill="none" stroke="#16A34A" stroke-width="3.5"/> <!-- Green Pote -->
            <rect x="-8" y="2" width="12" height="6" rx="2" fill="#F59E0B" stroke="#B45309" stroke-width="1"/> <!-- Gold Tilhari -->
            <!-- Red Bridal Saree with Gold Zari Border -->
            <path d="M-30,-10 L25,-10 L35,70 L-35,70 Z" fill="#B91C1C" stroke="#FDE047" stroke-width="2"/>
            <path d="M-20,-10 Q0,40 20,-10" fill="none" stroke="#16A34A" stroke-width="3"/> <!-- Varmala -->
          </g>

          <!-- VEDIC PANDIT (पण्डित बाजे) on Left with Pothi reciting Mantras -->
          <g transform="translate(250, 270)">
            <ellipse cx="0" cy="-32" rx="14" ry="16" fill="#FDE68A"/>
            <circle cx="0" cy="-44" r="5" fill="#78350F"/> <!-- Shikha / Hair knot -->
            <line x1="-8" y1="-38" x2="8" y2="-38" stroke="#FFFFFF" stroke-width="2"/> <!-- Tripundra -->
            <circle cx="0" cy="-38" r="2" fill="#DC2626"/>
            <!-- Saffron Shawl & Janeu -->
            <path d="M-22,-10 L22,-10 L28,60 L-28,60 Z" fill="#EA580C"/>
            <line x1="-18,-10" x2="18,40" stroke="#FFFFFF" stroke-width="2.5"/> <!-- Janeu -->
            <!-- Pothi (Palm leaf manuscript / Book) in hand -->
            <rect x="12" y="10" width="32" height="18" rx="2" fill="#FEF08A" stroke="#B45309" stroke-width="1.5"/>
            <line x1="16" y1="16" x2="40" y2="16" stroke="#92400E" stroke-width="1"/>
            <line x1="16" y1="22" x2="36" y2="22" stroke="#92400E" stroke-width="1"/>
          </g>

          <!-- WITNESSING GUESTS / FAMILY (जन्ती र आफन्त) showering Akshata Flowers -->
          <g transform="translate(710, 270)">
            <ellipse cx="0" cy="-30" rx="13" ry="15" fill="#FDE68A"/>
            <polygon points="-14,-42 0,-58 14,-42 -12,-42" fill="#15803D"/>
            <path d="M-20,-10 L20,-10 L25,60 L-25,60 Z" fill="#0284C7"/>
            <!-- Hands Clapping / Showering Flowers -->
            <circle cx="-15" cy="5" r="4" fill="#FDE68A"/>
            <circle cx="-8" cy="2" r="4" fill="#FDE68A"/>
          </g>
          <!-- Showering Red & Yellow Akshata Petals floating down -->
          <g fill="#FDE047" opacity="0.9">
            <circle cx="430" cy="180" r="3.5"/><circle cx="470" cy="160" r="4"/><circle cx="510" cy="175" r="3"/>
            <circle cx="445" cy="210" r="3"/><circle cx="495" cy="200" r="3.5"/>
          </g>
          <g fill="#EF4444" opacity="0.85">
            <circle cx="450" cy="170" r="3"/><circle cx="490" cy="180" r="3.5"/><circle cx="530" cy="190" r="3"/>
          </g>
        </g>
      `;
      break;

    case 'bartabandha_upanayan':
      // Bartabandha: Batuk with Palasha Danda, Janeu, Shaved head Shikha, Guru giving Gayatri Diksha, Havan
      sceneIllustrationSvg = `
        <g id="bartabandha_scene">
          <!-- Vedic Pipal Tree & Sacred Saffron Canopy -->
          <path d="M140,80 Q480,45 820,80 L790,130 Q480,105 170,130 Z" fill="#D97706" stroke="#FEF08A" stroke-width="2"/>
          <g stroke="#16A34A" stroke-width="3" fill="none">
            <path d="M170,130 Q325,160 480,130 Q635,160 790,130"/>
          </g>

          <!-- Sacred Havan Fire in Center -->
          <g transform="translate(480, 335)">
            <polygon points="-50,25 50,25 35,5 -35,5" fill="#9A3412" stroke="#FED7AA" stroke-width="1.5"/>
            <path d="M0,-45 Q-15,-18 -8,0 Q0,6 8,0 Q15,-18 0,-45 Z" fill="#EA580C"/>
            <path d="M0,-35 Q-8,-14 -4,-2 Q0,4 4,-2 Q8,-14 0,-35 Z" fill="#FDE047"/>
          </g>

          <!-- GURU / PANDIT on Left giving Gayatri Mantra Upadesh -->
          <g transform="translate(330, 250)">
            <ellipse cx="0" cy="-35" rx="16" ry="18" fill="#FDE68A"/>
            <circle cx="0" cy="-48" r="6" fill="#78350F"/> <!-- Shikha -->
            <line x1="-8" y1="-40" x2="8" y2="-40" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="0" cy="-40" r="2.5" fill="#DC2626"/>
            <!-- Saffron Shawl covering Head and Batuk for Secret Gayatri Mantra -->
            <path d="M-28,-15 L32,-15 L40,85 L-35,85 Z" fill="#EA580C" stroke="#FDE047" stroke-width="1.5"/>
            <path d="M15,-50 Q45,-70 85,-40 L85,20 Q45,-10 15,-10 Z" fill="#F59E0B" opacity="0.4"/> <!-- Yellow Chaddar veil -->
          </g>

          <!-- BATUK (बटुक) - Shaved Head, Shikha, Yellow Dhoti, Janeu, Palasha Danda -->
          <g transform="translate(435, 265)">
            <!-- Shaved Head with Shikha (शिखा/टुप्पी) -->
            <ellipse cx="0" cy="-30" rx="14" ry="16" fill="#FDE68A"/>
            <path d="M-2,-45 Q8,-58 12,-48" stroke="#451A03" stroke-width="3.5" fill="none"/> <!-- Long Shikha tuft -->
            <circle cx="0" cy="-32" r="2.5" fill="#DC2626"/> <!-- Tilak -->
            
            <!-- Pure White Yajnopavita (जनै) across chest -->
            <path d="M-20,-5 L18,45" stroke="#FFFFFF" stroke-width="4"/>
            <path d="M-20,-5 L18,45" stroke="#F1F5F9" stroke-width="2" stroke-dasharray="4 2"/>
            
            <!-- Munj Mekhala (मुञ्ज मेखला कम्मरबन्द) -->
            <ellipse cx="0" cy="35" rx="18" ry="6" fill="none" stroke="#D97706" stroke-width="4"/>
            
            <!-- Yellow Pitambar / Geru Loincloth -->
            <path d="M-20,0 L20,0 L24,65 L-24,65 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="1.5"/>

            <!-- Palasha Danda (पलाँसको दण्ड) in Right Hand -->
            <line x1="26" y1="-50" x2="26" y2="75" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
            <line x1="26" y1="-50" x2="26" y2="75" stroke="#B45309" stroke-width="2"/>

            <!-- Bhiksha Patra in Left Hand -->
            <g transform="translate(-25, 20)">
              <ellipse cx="0" cy="0" rx="12" ry="8" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
              <circle cx="0" cy="-2" r="4" fill="#FEF08A"/>
            </g>
          </g>

          <!-- MOTHER / RELATIVES offering Bhiksha Rice into Batuk's bowl -->
          <g transform="translate(620, 260)">
            <ellipse cx="0" cy="-32" rx="14" ry="16" fill="#FDE68A"/>
            <path d="M-18,-45 Q0,-60 18,-45 L24,50 L-24,50 Z" fill="#DC2626" stroke="#FEF08A" stroke-width="1.5"/>
            <path d="M-22,-10 L22,-10 L26,70 L-26,70 Z" fill="#B91C1C"/>
            <!-- Hands pouring golden rice into bowl -->
            <path d="M-15,10 Q-35,15 -50,22" stroke="#FDE68A" stroke-width="5" stroke-linecap="round"/>
            <g fill="#FDE047">
              <circle cx="-52" cy="24" r="2.5"/><circle cx="-56" cy="27" r="2.5"/><circle cx="-50" cy="30" r="2.5"/>
            </g>
          </g>
        </g>
      `;
      break;

    case 'annaprashan_pasni':
      // Pasni / Annaprashan: Baby in Dhaka Topi, Silver Spoon feeding Kheer, Astamangala, Family blessing
      sceneIllustrationSvg = `
        <g id="pasni_scene">
          <!-- Festive Decorated Arch with Astamangala -->
          <path d="M150,90 Q480,55 810,90 L780,135 Q480,110 180,135 Z" fill="#991B1B" stroke="#FDE047" stroke-width="2"/>
          <circle cx="480" cy="110" r="16" fill="#F59E0B" stroke="#FFF" stroke-width="1.5"/>
          <text x="480" y="115" font-size="14" font-weight="bold" fill="#FFF" text-anchor="middle">ॐ</text>

          <!-- BABY (शिशु) in Center - Dhaka Topi, Red Velvet Dress -->
          <g transform="translate(480, 275)">
            <!-- Mother / Uncle Lap as base -->
            <ellipse cx="0" cy="35" rx="55" ry="30" fill="#B91C1C" stroke="#FDE047" stroke-width="1.5"/>
            
            <!-- Baby Body (Red Velvet Vest with Gold Embroidery) -->
            <path d="M-20,0 L20,0 L25,45 L-25,45 Z" fill="#DC2626" stroke="#FEF08A" stroke-width="2"/>
            
            <!-- Baby Chubby Head -->
            <circle cx="0" cy="-22" r="18" fill="#FEF08A"/>
            <!-- Tiny Nepali Dhaka Topi -->
            <polygon points="-15,-32 0,-52 15,-32 -13,-32" fill="#7F1D1D" stroke="#FDE047" stroke-width="1"/>
            <path d="M-10,-35 L0,-47 L10,-35 Z" fill="#DC2626"/>
            <!-- Auspicious Black & Red Tika on Baby Forehead -->
            <circle cx="0" cy="-24" r="3" fill="#DC2626"/>
            <circle cx="0" cy="-24" r="1.5" fill="#1C1917"/>
            <!-- Golden Anklets and Bangles (बाला र कल्ली) -->
            <circle cx="-16" cy="15" r="4" fill="#F59E0B"/>
            <circle cx="16" cy="15" r="4" fill="#F59E0B"/>
          </g>

          <!-- MATERNAL UNCLE / MAMA (मामा) on Left feeding Kheer with Silver Spoon -->
          <g transform="translate(320, 250)">
            <ellipse cx="0" cy="-35" rx="16" ry="18" fill="#FDE68A"/>
            <polygon points="-15,-46 0,-65 15,-46 -13,-46" fill="#15803D"/>
            <path d="M-26,-12 L26,-12 L32,80 L-32,80 Z" fill="#0284C7"/>
            <!-- Hand holding Shiny Silver Spoon towards Baby's mouth -->
            <path d="M18,10 Q65,5 110,-5" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/>
            <!-- Pure Silver Spoon with sweet Kheer -->
            <path d="M110,-5 L135,-8" stroke="#E2E8F0" stroke-width="3.5" stroke-linecap="round"/>
            <ellipse cx="138" cy="-8" rx="6" ry="4" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1"/>
            <circle cx="138" cy="-8" r="3" fill="#FEF08A"/> <!-- Golden Kheer drop -->
          </g>

          <!-- PURE SILVER KHEER BOWL (चाँदीको कचौरा) on Gold Table -->
          <g transform="translate(480, 360)">
            <ellipse cx="0" cy="0" rx="35" ry="14" fill="#CBD5E1" stroke="#94A3B8" stroke-width="2"/>
            <ellipse cx="0" cy="-3" rx="30" ry="10" fill="#F8FAFC"/>
            <ellipse cx="0" cy="-3" rx="24" ry="7" fill="#FEF08A"/> <!-- Kheer with Saffron & Almonds -->
            <circle cx="-6" cy="-4" r="2" fill="#D97706"/>
            <circle cx="6" cy="-2" r="2" fill="#D97706"/>
            <text x="0" y="24" font-size="11" font-weight="bold" fill="#FEF08A" text-anchor="middle">चाँदीको कचौरा र खीर</text>
          </g>

          <!-- ASTAMANGALA BRASS TRAY & FRUITS on Right -->
          <g transform="translate(650, 280)">
            <ellipse cx="0" cy="40" rx="42" ry="18" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
            <!-- Fruits & Sagun Supari -->
            <circle cx="-16" cy="32" r="10" fill="#EF4444"/> <!-- Apple -->
            <ellipse cx="6" cy="30" rx="14" ry="7" fill="#FDE047"/> <!-- Banana -->
            <circle cx="20" cy="34" r="8" fill="#F97316"/> <!-- Orange -->
            <circle cx="0" cy="24" r="7" fill="#78350F" stroke="#FDE68A" stroke-width="1"/> <!-- Supari -->
          </g>
        </g>
      `;
      break;

    case 'namakarana_nwaran':
      // Namakarana: Whispering name in ear with golden quill & honey, Surya worship, swaddled baby
      sceneIllustrationSvg = `
        <g id="namakarana_scene">
          <!-- Surya Devata Radiant Disk in Top Center -->
          <g transform="translate(480, 100)">
            <circle cx="0" cy="0" r="32" fill="#F59E0B" stroke="#FEF08A" stroke-width="3"/>
            <circle cx="0" cy="0" r="24" fill="#EA580C"/>
            <!-- Sun Rays -->
            <g stroke="#FDE047" stroke-width="3" stroke-linecap="round">
              <line x1="0" y1="-45" x2="0" y2="-36"/><line x1="0" y1="36" x2="0" y2="45"/>
              <line x1="-45" y1="0" x2="-36" y2="0"/><line x1="36" y1="0" x2="45" y2="0"/>
              <line x1="-32" y1="-32" x2="-25" y2="-25"/><line x1="25" y1="25" x2="32" y2="32"/>
              <line x1="32" y1="-32" x2="25" y2="-25"/><line x1="-25" y1="25" x2="-32" y2="32"/>
            </g>
          </g>

          <!-- Swaddled Newborn Baby on Velvet Cot -->
          <g transform="translate(480, 290)">
            <rect x="-65" y="-15" width="130" height="60" rx="16" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
            <!-- Baby Wrapped in Sacred Yellow Cloth -->
            <ellipse cx="-18" cy="10" rx="35" ry="18" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5"/>
            <circle cx="-32" cy="5" r="14" fill="#FDE68A"/> <!-- Baby Head -->
            <circle cx="-32" cy="0" r="2" fill="#DC2626"/> <!-- Tika -->
          </g>

          <!-- PANDIT / FATHER whispering Vedic Name with Golden Stylus (सुवर्ण शलाका) -->
          <g transform="translate(350, 240)">
            <ellipse cx="0" cy="-35" rx="16" ry="18" fill="#FDE68A"/>
            <circle cx="0" cy="-48" r="5" fill="#78350F"/>
            <line x1="-8" y1="-40" x2="8" y2="-40" stroke="#FFFFFF" stroke-width="2"/>
            <!-- Leaning down to whisper into baby ear -->
            <path d="M-25,-10 L25,-10 L30,80 L-30,80 Z" fill="#EA580C"/>
            <!-- Golden Needle / Quill touching ear with Honey -->
            <path d="M20,15 L95,45" stroke="#FDE047" stroke-width="4" stroke-linecap="round"/>
            <circle cx="95" cy="45" r="3" fill="#D97706"/> <!-- Honey drop -->
          </g>

          <!-- Honey & Ghee Cup (मधुसर्पि पात्र) and Mangal Kalash -->
          <g transform="translate(630, 280)">
            <ellipse cx="0" cy="20" rx="20" ry="12" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
            <ellipse cx="0" cy="16" rx="16" ry="8" fill="#D97706"/> <!-- Pure Honey & Ghee -->
            <text x="0" y="44" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">मधुसर्पि / सुवर्ण</text>
          </g>
        </g>
      `;
      break;

    case 'grihapravesh_kalash_door':
      // Grihapravesh: Couple holding Mangal Kalash entering carved wooden door with Toran
      sceneIllustrationSvg = `
        <g id="grihapravesh_scene">
          <!-- Beautiful Carved Wooden Doorway of New Home -->
          <g transform="translate(480, 220)">
            <!-- Outer Arch Frame -->
            <rect x="-180" y="-140" width="360" height="280" rx="12" fill="#78350F" stroke="#FDE047" stroke-width="3"/>
            <rect x="-160" y="-120" width="320" height="260" rx="8" fill="#FEF3C7"/>
            <!-- Open Carved Door Panels -->
            <rect x="-150" y="-110" width="135" height="245" fill="#9A3412" stroke="#451A03" stroke-width="2"/>
            <rect x="15" y="-110" width="135" height="245" fill="#9A3412" stroke="#451A03" stroke-width="2"/>
            <!-- Auspicious Swastika & Shubh Labh on Door Frame -->
            <g transform="translate(-110, -80)" stroke="#DC2626" stroke-width="3" fill="none">
              <path d="M-12,0 L12,0 M0,-12 L0,12 M-12,-12 L-12,0 M12,12 L12,0 M-12,12 L0,12 M12,-12 L0,-12"/>
            </g>
            <g transform="translate(110, -80)" stroke="#DC2626" stroke-width="3" fill="none">
              <path d="M-12,0 L12,0 M0,-12 L0,12 M-12,-12 L-12,0 M12,12 L12,0 M-12,12 L0,12 M12,-12 L0,-12"/>
            </g>
            <!-- Hanging Marigold & Mango Leaves Toran -->
            <path d="M-170,-130 Q0,-90 170,-130" stroke="#F59E0B" stroke-width="5" fill="none"/>
            <g fill="#16A34A">
              <polygon points="-80,-115 -70,-85 -60,-115"/><polygon points="0,-105 10,-75 20,-105"/><polygon points="80,-115 90,-85 100,-115"/>
            </g>
          </g>

          <!-- YAJAMANA COUPLE (पति-पत्नी) entering with Mangal Kalash & Arghya -->
          <g transform="translate(480, 280)">
            <!-- Wife (गृहलक्ष्मी) in Red Saree carrying Mangal Kalash on hands -->
            <g transform="translate(-45, 0)">
              <ellipse cx="0" cy="-35" rx="14" ry="16" fill="#FDE68A"/>
              <path d="M-16,-45 Q0,-60 16,-45 L20,40 L-20,40 Z" fill="#DC2626" stroke="#FEF08A" stroke-width="1"/>
              <path d="M-22,-10 L22,-10 L25,75 L-25,75 Z" fill="#B91C1C"/>
              <!-- Mangal Kalash in Hands -->
              <ellipse cx="0" cy="10" rx="18" ry="14" fill="#EA580C" stroke="#7C2D12" stroke-width="1.5"/>
              <circle cx="0" cy="-4" r="9" fill="#78350F"/> <!-- Coconut -->
              <circle cx="0" cy="-4" r="2.5" fill="#DC2626"/>
            </g>

            <!-- Husband in Daura Suruwal stepping in with Right Foot -->
            <g transform="translate(45, -5)">
              <ellipse cx="0" cy="-35" rx="15" ry="17" fill="#FDE68A"/>
              <polygon points="-14,-45 0,-62 14,-45 -12,-45" fill="#15803D"/>
              <path d="M-24,-12 L24,-12 L28,75 L-28,75 Z" fill="#0284C7"/>
              <!-- Arghya Patra in Hand -->
              <ellipse cx="-15" cy="15" rx="12" ry="7" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
            </g>
          </g>
        </g>
      `;
      break;

    case 'rudrabhishek_lingam_snan':
      // Rudrabhishek: Shivalinga, Copper Shringi pouring stream of milk/water, Belpatra, Bhasma
      sceneIllustrationSvg = `
        <g id="rudrabhishek_scene">
          <!-- Holy Kailash Temple Aura -->
          <circle cx="480" cy="220" r="140" fill="url(#blueHalo)"/>

          <!-- Suspended Copper Abhishek Shringi (शृङ्गी जलधारा पात्र) -->
          <g transform="translate(480, 110)">
            <path d="M-30,-20 L30,-20 L15,25 L-15,25 Z" fill="#C2410C" stroke="#FED7AA" stroke-width="1.5"/>
            <ellipse cx="0" cy="-20" rx="30" ry="10" fill="#EA580C"/>
            <!-- Continuous Stream of Pure Milk / Gangajal (दुग्धधारा) -->
            <line x1="0" y1="25" x2="0" y2="135" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
            <line x1="0" y1="25" x2="0" y2="135" stroke="#E0F2FE" stroke-width="2.5" stroke-linecap="round"/>
          </g>

          <!-- Sacred Black Shivalinga on Marble Yoni Peeth -->
          <g transform="translate(480, 270)">
            <!-- Yoni Peeth Base -->
            <ellipse cx="0" cy="45" rx="90" ry="30" fill="#18181B" stroke="#60A5FA" stroke-width="2.5"/>
            <path d="M-90,45 L-145,62 Q-150,56 -138,50 L-70,35 Z" fill="#27272A" stroke="#60A5FA" stroke-width="2"/> <!-- Snan Droni -->

            <!-- Shivalinga Sila -->
            <path d="M-40,40 C-40,-45 40,-45 40,40 Z" fill="#09090B" stroke="#93C5FD" stroke-width="2"/>
            
            <!-- Tripundra Bhasma & Red Bindu -->
            <line x1="-24" y1="-12" x2="24" y2="-12" stroke="#F1F5F9" stroke-width="3" stroke-linecap="round"/>
            <line x1="-24" y1="-6" x2="24" y2="-6" stroke="#F1F5F9" stroke-width="3" stroke-linecap="round"/>
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#F1F5F9" stroke-width="3" stroke-linecap="round"/>
            <circle cx="0" cy="-6" r="4.5" fill="#DC2626"/>

            <!-- 3-Leaf Bilva Patra (त्रिनेत्र बेलपत्र) -->
            <g transform="translate(0, -45)">
              <path d="M0,0 Q-20,-20 0,-40 Q20,-20 0,0" fill="#15803D" stroke="#14532D" stroke-width="1.5"/>
              <path d="M-8,-10 Q-30,-22 -20,-42 Q-2,-28 -8,-10" fill="#16A34A"/>
              <path d="M8,-10 Q30,-22 20,-42 Q2,-28 8,-10" fill="#16A34A"/>
            </g>

            <!-- 108 Rudraksha Mala Draped Around Lingam -->
            <path d="M-60,30 Q-70,75 0,82 Q70,75 60,30" fill="none" stroke="#78350F" stroke-width="7" stroke-dasharray="9 4"/>
          </g>

          <!-- Priest on Left Ringing Garuda Ghanti and offering Arghya -->
          <g transform="translate(260, 270)">
            <ellipse cx="0" cy="-35" rx="15" ry="17" fill="#FDE68A"/>
            <circle cx="0" cy="-48" r="5" fill="#78350F"/>
            <path d="M-24,-10 L24,-10 L28,75 L-28,75 Z" fill="#1E3A8A"/>
            <!-- Ringing Bell in Hand -->
            <path d="M22,5 L48,2" stroke="#FDE68A" stroke-width="5" stroke-linecap="round"/>
            <polygon points="48,-6 62,2 48,10" fill="#F59E0B" stroke="#B45309" stroke-width="1"/>
          </g>

          <!-- Golden Trishula and Damaru on Right -->
          <g transform="translate(700, 230)">
            <line x1="0" y1="-80" x2="0" y2="120" stroke="#F59E0B" stroke-width="4.5"/>
            <path d="M-22,-65 Q0,-105 22,-65 M0,-105 L0,-50" fill="none" stroke="#F59E0B" stroke-width="4"/>
            <!-- Damaru tied to Trishul -->
            <polygon points="-12,-30 12,-30 0,-15" fill="#78350F" stroke="#FDE68A" stroke-width="1"/>
            <polygon points="-12,0 12,0 0,-15" fill="#78350F" stroke="#FDE68A" stroke-width="1"/>
          </g>
        </g>
      `;
      break;

    case 'shraddha_pitri_tarpana':
      // Shraddha: Kusha mat, Black sesame Pindas, Tarpana, Tulsi, Ancestor blessings
      sceneIllustrationSvg = `
        <g id="shraddha_scene">
          <!-- Auspicious Southern Horizon & Sacred Ganga Ghat -->
          <path d="M120,380 Q480,330 840,380 L840,430 L120,430 Z" fill="#334155" opacity="0.6"/>

          <!-- Kusha Grass Mat (कुशासन) on Ground -->
          <g transform="translate(480, 340)">
            <rect x="-180" y="-20" width="360" height="70" rx="10" fill="#15803D" stroke="#166534" stroke-width="2"/>
            <g stroke="#86EFAC" stroke-width="1.5" opacity="0.7">
              <line x1="-160" y1="-10" x2="160" y2="-10"/>
              <line x1="-160" y1="10" x2="160" y2="10"/>
              <line x1="-160" y1="30" x2="160" y2="30"/>
            </g>
          </g>

          <!-- Sacred Pinda Patra (३ वटा पवित्र पिण्डहरू) on Banana Leaf -->
          <g transform="translate(480, 325)">
            <path d="M-90,20 Q0,50 90,20 Q80,-25 0,-15 Q-80,-25 -90,20 Z" fill="#16A34A" stroke="#14532D" stroke-width="2"/>
            <!-- 3 Sacred Rice & Black Sesame Pindas (पिण्ड) -->
            <ellipse cx="-45" cy="5" rx="18" ry="15" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
            <circle cx="-48" cy="2" r="2" fill="#000"/><circle cx="-42" cy="7" r="2" fill="#000"/> <!-- Black Til -->
            
            <ellipse cx="0" cy="0" rx="22" ry="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
            <circle cx="-5" cy="-4" r="2" fill="#000"/><circle cx="5" cy="2" r="2" fill="#000"/>
            <!-- Tulsi Patra on Central Pinda -->
            <path d="M0,-8 Q-8,-18 0,-24 Q8,-18 0,-8" fill="#15803D"/>

            <ellipse cx="45" cy="5" rx="18" ry="15" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
            <circle cx="42" cy="2" r="2" fill="#000"/><circle cx="48" cy="7" r="2" fill="#000"/>
          </g>

          <!-- YAJAMANA in White Cloth offering Tarpana with Kusha Pavitri -->
          <g transform="translate(320, 245)">
            <ellipse cx="0" cy="-35" rx="15" ry="17" fill="#FDE68A"/>
            <!-- White Silk Shawl (सेतो उत्तरीय) -->
            <path d="M-24,-12 L24,-12 L28,80 L-28,80 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
            <!-- Kusha Ring (पवित्री) on Right Hand pouring Water & Black Til -->
            <path d="M18,10 Q65,15 105,35" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/>
            <circle cx="105" cy="35" r="4" fill="#16A34A"/> <!-- Kusha ring -->
            <!-- Tarpana Water Stream -->
            <line x1="108" y1="38" x2="120" y2="75" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
          </g>

          <!-- Copper Tarpana Patra & Gangajal Kalash on Right -->
          <g transform="translate(640, 270)">
            <ellipse cx="0" cy="40" rx="35" ry="16" fill="#C2410C" stroke="#7C2D12" stroke-width="2"/>
            <ellipse cx="0" cy="35" rx="30" ry="12" fill="#38BDF8" opacity="0.8"/> <!-- Holy water with Til -->
            <circle cx="-8" cy="35" r="2" fill="#000"/><circle cx="6" cy="34" r="2" fill="#000"/>
            <text x="0" y="68" font-size="11" font-weight="bold" fill="#FEF08A" text-anchor="middle">पितृ तर्पण पात्र</text>
          </g>
        </g>
      `;
      break;

    case 'navagraha_shanti_altar':
      // Navagraha: 9-colored pedestals with 9 planetary deities, 9 woods, 9 grains
      sceneIllustrationSvg = `
        <g id="navagraha_scene">
          <!-- 9 Planetary Colored Mandalas in 3x3 Grid -->
          <g transform="translate(480, 210)">
            <!-- Central Golden Guru (बृहस्पति) -->
            <g transform="translate(0,0)">
              <rect x="-32" y="-32" width="64" height="64" rx="8" fill="#EAB308" stroke="#FEF08A" stroke-width="2"/>
              <circle cx="0" cy="-8" r="12" fill="#FEF08A"/>
              <text x="0" y="20" font-size="12" font-weight="bold" fill="#000" text-anchor="middle">बृहस्पति</text>
            </g>
            <!-- Surya: Red (Top Center) -->
            <g transform="translate(0,-80)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#DC2626" stroke="#FEF08A" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#FDE047"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">सूर्य</text>
            </g>
            <!-- Chandra: White (Top Left) -->
            <g transform="translate(-80,-80)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#E2E8F0"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#0F172A" text-anchor="middle">चन्द्र</text>
            </g>
            <!-- Mangal: Coral Red (Top Right) -->
            <g transform="translate(80,-80)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#EF4444" stroke="#FEF08A" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#FCA5A5"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">मङ्गल</text>
            </g>
            <!-- Budha: Green (Mid Left) -->
            <g transform="translate(-80,0)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#16A34A" stroke="#FEF08A" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#86EFAC"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">बुध</text>
            </g>
            <!-- Shukra: Silver (Mid Right) -->
            <g transform="translate(80,0)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#F1F5F9" stroke="#FEF08A" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#CBD5E1"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#0F172A" text-anchor="middle">शुक्र</text>
            </g>
            <!-- Shani: Black (Bottom Left) -->
            <g transform="translate(-80,80)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#1E293B" stroke="#FEF08A" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#64748B"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">शनि</text>
            </g>
            <!-- Rahu: Blue (Bottom Center) -->
            <g transform="translate(0,80)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#1E3A8A" stroke="#FEF08A" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#3B82F6"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">राहु</text>
            </g>
            <!-- Ketu: Brown (Bottom Right) -->
            <g transform="translate(80,80)">
              <rect x="-30" y="-30" width="60" height="60" rx="8" fill="#78350F" stroke="#FEF08A" stroke-width="1.5"/>
              <circle cx="0" cy="-6" r="10" fill="#D97706"/>
              <text x="0" y="18" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">केतु</text>
            </g>
          </g>

          <!-- 9 Samidha Wood Sticks & Supari in Foreground -->
          <g transform="translate(480, 370)">
            <g stroke="#78350F" stroke-width="4.5" stroke-linecap="round">
              <line x1="-120" y1="0" x2="-80" y2="0"/><line x1="-60" y1="0" x2="-20" y2="0"/>
              <line x1="0" y1="0" x2="40" y2="0"/><line x1="60" y1="0" x2="100" y2="0"/>
            </g>
            <text x="0" y="24" font-size="11" font-weight="bold" fill="#FEF08A" text-anchor="middle">९ ग्रहका ९ समिधा काठ, ९ वस्त्र र ९ सुपारी</text>
          </g>
        </g>
      `;
      break;

    case 'satyanarayan_banana_mandap':
      // Satyanarayan: 4 banana pillars, Shaligram, Tulsi, Panchamrit, Katha book
      sceneIllustrationSvg = `
        <g id="satyanarayan_scene">
          <!-- 4 Banana Tree Mandap Pillars -->
          <g transform="translate(240, 160)">
            <rect x="-14" y="0" width="28" height="230" rx="6" fill="#15803D" stroke="#14532D" stroke-width="2"/>
            <path d="M-10,30 Q-50,0 -70,-25 Q-30,10 -10,35" fill="#16A34A"/>
          </g>
          <g transform="translate(720, 160)">
            <rect x="-14" y="0" width="28" height="230" rx="6" fill="#15803D" stroke="#14532D" stroke-width="2"/>
            <path d="M10,30 Q50,0 70,-25 Q30,10 10,35" fill="#16A34A"/>
          </g>
          <path d="M240,160 Q480,120 720,160" stroke="#F59E0B" stroke-width="4" fill="none"/>

          <!-- Golden Altar Throne with Shaligram Sila -->
          <g transform="translate(480, 260)">
            <!-- Yellow Silk Base -->
            <rect x="-90" y="-40" width="180" height="110" rx="12" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
            
            <!-- Shaligram Sila on Silver Simhasana -->
            <ellipse cx="0" cy="-5" rx="38" ry="26" fill="#171717" stroke="#E2E8F0" stroke-width="2.5"/>
            <!-- Saffron & Sandalwood Tilak -->
            <line x1="0" y1="-20" x2="0" y2="4" stroke="#FDE047" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="0" cy="-8" r="3.5" fill="#DC2626"/>

            <!-- Tulsi Manjari on Top -->
            <g transform="translate(0, -22)">
              <path d="M0,0 Q-12,-14 0,-26 Q12,-14 0,0" fill="#16A34A"/>
            </g>

            <!-- Panchamrit Bowl & Prasad Plates -->
            <g transform="translate(-60, 45)">
              <ellipse cx="0" cy="0" rx="18" ry="10" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
              <text x="0" y="3" font-size="9" font-weight="bold" fill="#0284C7" text-anchor="middle">पञ्चामृत</text>
            </g>
            <g transform="translate(60, 45)">
              <ellipse cx="0" cy="0" rx="18" ry="10" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5"/>
              <text x="0" y="3" font-size="9" font-weight="bold" fill="#854D0E" text-anchor="middle">सपाद प्रसाद</text>
            </g>
          </g>
        </g>
      `;
      break;

    case 'lakshmi_deepawali_coins':
      // Lakshmi-Ganesh & Diwali: Gold coins pouring, 5 glowing Diyas, Pink Lotuses
      sceneIllustrationSvg = `
        <g id="lakshmi_scene">
          <!-- Radiance Aura -->
          <circle cx="480" cy="210" r="150" fill="url(#goldHalo)"/>

          <!-- Goddess Lakshmi & Ganesha Silhouettes on Blooming Lotus -->
          <g transform="translate(480, 220)">
            <!-- 8 Blooming Pink Lotus Petals -->
            <g fill="#F472B6" stroke="#BE185D" stroke-width="1.5">
              <path d="M0,45 Q-30,75 -60,45 Q-30,25 0,45 Z"/>
              <path d="M0,45 Q30,75 60,45 Q30,25 0,45 Z"/>
              <path d="M0,45 Q-45,30 -65,-5 Q-25,15 0,45 Z"/>
              <path d="M0,45 Q45,30 65,-5 Q25,15 0,45 Z"/>
              <path d="M0,45 Q0,-25 0,-60 Q-20,0 0,45 Z" fill="#FBCFE8"/>
            </g>
            <!-- Golden Deity Icons -->
            <g transform="translate(-40, -10)">
              <circle cx="0" cy="-25" r="14" fill="#F59E0B" stroke="#FEF08A" stroke-width="1.5"/>
              <path d="M-16,-10 L16,-10 L20,35 L-20,35 Z" fill="#D97706"/>
              <text x="0" y="48" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">श्री गणेश</text>
            </g>
            <g transform="translate(40, -10)">
              <circle cx="0" cy="-25" r="14" fill="#F59E0B" stroke="#FEF08A" stroke-width="1.5"/>
              <path d="M-16,-10 L16,-10 L20,35 L-20,35 Z" fill="#DC2626"/>
              <text x="0" y="48" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">महालक्ष्मी</text>
            </g>
          </g>

          <!-- Golden Pot (कलश) pouring Shiny Gold & Silver Coins -->
          <g transform="translate(480, 325)">
            <ellipse cx="0" cy="0" rx="28" ry="18" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
            <!-- Overflowing Gold Coins -->
            <g fill="#FDE047" stroke="#CA8A04" stroke-width="1">
              <circle cx="-15" cy="18" r="8"/><circle cx="0" cy="15" r="8.5"/><circle cx="15" cy="18" r="8"/>
              <circle cx="-25" cy="26" r="8"/><circle cx="-8" cy="28" r="8.5"/><circle cx="10" cy="28" r="8.5"/><circle cx="26" cy="26" r="8"/>
            </g>
          </g>

          <!-- 5 Traditional Glowing Diyas (पञ्चदीप) in Foreground -->
          <g transform="translate(480, 390)">
            <g transform="translate(-160, 0)">
              <ellipse cx="0" cy="5" rx="18" ry="8" fill="#F59E0B"/><circle cx="0" cy="-8" r="12" fill="#FDE047" opacity="0.6"/><path d="M0,-14 Q-5,-4 0,0 Q5,-4 0,-14" fill="#EA580C"/>
            </g>
            <g transform="translate(-80, 0)">
              <ellipse cx="0" cy="5" rx="18" ry="8" fill="#F59E0B"/><circle cx="0" cy="-8" r="12" fill="#FDE047" opacity="0.6"/><path d="M0,-14 Q-5,-4 0,0 Q5,-4 0,-14" fill="#EA580C"/>
            </g>
            <g transform="translate(0, 0)">
              <ellipse cx="0" cy="5" rx="22" ry="10" fill="#F59E0B"/><circle cx="0" cy="-12" r="16" fill="#FDE047" opacity="0.7"/><path d="M0,-20 Q-7,-6 0,0 Q7,-6 0,-20" fill="#EA580C"/>
            </g>
            <g transform="translate(80, 0)">
              <ellipse cx="0" cy="5" rx="18" ry="8" fill="#F59E0B"/><circle cx="0" cy="-8" r="12" fill="#FDE047" opacity="0.6"/><path d="M0,-14 Q-5,-4 0,0 Q5,-4 0,-14" fill="#EA580C"/>
            </g>
            <g transform="translate(160, 0)">
              <ellipse cx="0" cy="5" rx="18" ry="8" fill="#F59E0B"/><circle cx="0" cy="-8" r="12" fill="#FDE047" opacity="0.6"/><path d="M0,-14 Q-5,-4 0,0 Q5,-4 0,-14" fill="#EA580C"/>
            </g>
          </g>
        </g>
      `;
      break;

    default:
      // General Vedic Anushthan: Grand Sacred Havan Kunda with tiered steps, glowing Agni, Mangal Kalash
      sceneIllustrationSvg = `
        <g id="general_anushthan_scene">
          <!-- Auspicious Mandap Canopy -->
          <path d="M160,90 Q480,50 800,90 L770,135 Q480,110 190,135 Z" fill="#7C2D12" stroke="#FDE047" stroke-width="2"/>

          <!-- Grand 3-Tiered Copper Havan Kunda -->
          <g transform="translate(480, 275)">
            <polygon points="-120,60 120,60 90,20 -90,20" fill="#9A3412" stroke="#FED7AA" stroke-width="2"/>
            <polygon points="-90,20 90,20 65,-15 -65,-15" fill="#C2410C" stroke="#FED7AA" stroke-width="1.5"/>
            <polygon points="-65,-15 65,-15 45,-45 -45,-45" fill="#7C2D12" stroke="#FED7AA" stroke-width="1.5"/>

            <!-- Dry Samidha Wood Sticks -->
            <line x1="-35" y1="-25" x2="35" y2="-15" stroke="#78350F" stroke-width="9" stroke-linecap="round"/>
            <line x1="-30" y1="-15" x2="30" y2="-25" stroke="#571E06" stroke-width="9" stroke-linecap="round"/>

            <!-- High Sacred Agni Flame -->
            <path d="M0,-115 Q-35,-55 -18,-20 Q0,-5 18,-20 Q35,-55 0,-115 Z" fill="#EA580C" opacity="0.95"/>
            <path d="M0,-100 Q-24,-50 -12,-20 Q0,-10 12,-20 Q24,-50 0,-100 Z" fill="#F97316"/>
            <path d="M0,-85 Q-14,-40 -6,-22 Q0,-15 6,-22 Q14,-40 0,-85 Z" fill="#FDE047"/>
            <path d="M0,-65 Q-8,-32 -2,-24 Q0,-20 2,-24 Q8,-32 0,-65 Z" fill="#FFFFFF"/>
          </g>

          <!-- Mangal Kalash with Coconut on Left -->
          <g transform="translate(270, 275)">
            <ellipse cx="0" cy="20" rx="28" ry="22" fill="#C2410C" stroke="#7C2D12" stroke-width="2"/>
            <rect x="-18" y="5" width="36" height="5" fill="#DC2626"/>
            <path d="M0,0 Q-25,-25 -10,-40 Q0,-20 0,0" fill="#15803D"/>
            <path d="M0,0 Q25,-25 10,-40 Q0,-20 0,0" fill="#15803D"/>
            <circle cx="0" cy="-18" r="14" fill="#78350F" stroke="#FEF08A" stroke-width="1"/>
            <circle cx="0" cy="-20" r="3.5" fill="#DC2626"/>
            <text x="0" y="55" font-size="11" font-weight="bold" fill="#FEF08A" text-anchor="middle">मङ्गल कलश</text>
          </g>

          <!-- Shankha & Garuda Ghanti on Right -->
          <g transform="translate(690, 275)">
            <path d="M0,20 Q-25,0 -15,-25 Q0,-45 25,-25 Q35,0 15,30 Q5,40 0,20 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
            <ellipse cx="5" cy="-5" rx="10" ry="18" fill="#F1F5F9"/>
            <text x="5" y="0" font-size="11" font-weight="bold" fill="#D97706" text-anchor="middle">ॐ</text>
            <text x="5" y="55" font-size="11" font-weight="bold" fill="#FEF08A" text-anchor="middle">दक्षिणावर्ती शंख</text>
          </g>
        </g>
      `;
      break;
  }

  // Format Samagri Items List into a clean bulleted line
  const samagriFormatted = samagriItems.slice(0, 15).map((item, idx) => `${idx + 1}. ${item}`).join('   •   ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 700" width="100%" height="100%">
  <defs>
    <!-- Sky Background Gradient -->
    <linearGradient id="bgSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgSky[0]}"/>
      <stop offset="50%" stop-color="${theme.bgSky[1]}"/>
      <stop offset="100%" stop-color="${theme.bgSky[2]}"/>
    </linearGradient>

    <!-- Gold Frame Gradient -->
    <linearGradient id="frameGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- Radial Halos -->
    <radialGradient id="goldHalo" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#F59E0B" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blueHalo" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="#BAE6FD" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="#0284C7" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Shadows -->
    <filter id="sceneShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <!-- Background Sky / Temple Canvas -->
  <rect width="960" height="700" fill="url(#bgSkyGrad)"/>

  <!-- Divine Background Golden Halo Glow -->
  <circle cx="480" cy="260" r="320" fill="url(#goldHalo)"/>

  <!-- Traditional Ornamental Outer Border Frame -->
  <rect x="18" y="18" width="924" height="664" rx="22" fill="none" stroke="${theme.frameGold}" stroke-width="2.5" opacity="0.75"/>
  <rect x="26" y="26" width="908" height="648" rx="18" fill="none" stroke="url(#frameGoldGrad)" stroke-width="1.5" stroke-dasharray="16 8"/>

  <!-- Swastika & Kalash Corner Flourishes -->
  <g fill="${theme.frameGold}" opacity="0.9">
    <circle cx="46" cy="46" r="5"/><circle cx="914" cy="46" r="5"/>
    <circle cx="46" cy="654" r="5"/><circle cx="914" cy="654" r="5"/>
  </g>

  <!-- Top Category Chip Banner -->
  <g transform="translate(480, 50)">
    <rect x="-190" y="-16" width="380" height="32" rx="16" fill="#1C1917" stroke="url(#frameGoldGrad)" stroke-width="1.5"/>
    <text x="0" y="5" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="13" font-weight="bold" fill="#FEF08A" text-anchor="middle" letter-spacing="0.5">
      🇳🇵 बालानन्द वैदिक पसल • ${categoryNepali}
    </text>
  </g>

  <!-- ========================================================================= -->
  <!-- MAIN GRAPHIC ILLUSTRATION SCENE (चित्रमय संस्कार एवं अनुष्ठान दृश्य) -->
  <!-- ========================================================================= -->
  <g filter="url(#sceneShadow)">
    ${sceneIllustrationSvg}
  </g>

  <!-- ========================================================================= -->
  <!-- LOWER AUTHENTIC PACKAGING INFORMATION BANNER (पूजा सामान सूची ब्यानर) -->
  <!-- ========================================================================= -->
  <g transform="translate(480, 580)" filter="url(#sceneShadow)">
    <!-- Base Background Placard -->
    <rect x="-440" y="-70" width="880" height="140" rx="16" fill="#1C1917" stroke="url(#frameGoldGrad)" stroke-width="2.5"/>
    <rect x="-432" y="-62" width="864" height="124" rx="12" fill="#292524" opacity="0.95"/>

    <!-- Top Badge Row -->
    <g transform="translate(0, -40)">
      <rect x="-150" y="-12" width="300" height="24" rx="12" fill="#7A1C1C" stroke="#FEF08A" stroke-width="1"/>
      <text x="0" y="5" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" font-weight="bold" fill="#FEF08A" text-anchor="middle">
        ★ ${highlightBadge} ★
      </text>
    </g>

    <!-- Main Title Heading -->
    <text x="0" y="-10" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${titleNepali}
    </text>

    <!-- Subtitle / Tagline -->
    <text x="0" y="12" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" fill="#FDE047" text-anchor="middle">
      ${subtitleNepali}
    </text>

    <!-- Authentic Samagri Checklist Ribbon (सामग्री सूची) -->
    <g transform="translate(0, 36)">
      <rect x="-415" y="-13" width="830" height="26" rx="8" fill="#1C1917" stroke="#78350F" stroke-width="1"/>
      <text x="0" y="4" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="10.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">
        📋 प्याकेजमा समावेश मुख्य सामग्री: ${samagriFormatted}
      </text>
    </g>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// ५०+ सम्पूर्ण प्रामाणिक पूजा तथा वैदिक सामग्रीहरूको आधिकारिक ग्यालरी
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
      'गणेश मूर्ति (धातु/पीतल/माटो) – १ थान',
      'कलश (तामाको भाँडो) – १ थान',
      'नारियल – १ थान',
      'आँपको पात – ५/७ वटा',
      'पूजा वस्त्र (रातो/पहेंलो कपडा) – १ थान',
      'जनै (पवित्र धागो) – १ थान',
      'अक्षता (चामल) – १ प्याकेट',
      'सुपारी – ५/११ वटा',
      'पान – ५/११ पाती',
      'दूर्वा (दुबो) – १ गुच्छा',
      'फूलमाला / ताजा फूल – १ सेट',
      'फलफूल – १ सेट (केरा, स्याउ, सुन्तला आदि)',
      'मिठाई / मोदक – १ प्याकेट',
      'रोली, चन्दन, अबिर – १ सेट',
      'धूप, अगरबत्ती – १ प्याकेट',
      'घिउ (शुद्ध) – १ सानो डब्बा',
      'तेल (दीपका लागि) – १ बोतल',
      'कपूर – १ प्याकेट',
      'अक्षत, तिल, लव, मूंग – सानो प्याकेट',
      'पञ्चमेवा – १ प्याकेट',
      'नवधान्य – १ प्याकेट',
      'गणेश यन्त्र – १ थान',
      'पूजा पुस्तक (विधि सहित) – १ थान',
      'माचिस – १ प्याकेट',
      'घण्टी – १ थान',
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
    description: 'श्रेष्ठ तथा तेजस्वी सन्तान प्राप्तिका लागि वैदिक विधि अनुसार गरिने प्रथम संस्कार सामग्री।',
    tags: ['गर्भाधान', 'संस्कार', 'सन्तान', 'पञ्चगव्य', 'हवन'],
    suggestedPrice: 1200,
    samagriList: ['पञ्चगव्य', 'प्राकृतिक घ्यू', 'समिधा काठ', 'जौ-तिल', 'रोली-केशरी', 'मङ्गल कलश', 'सुपारी', 'जनै', 'धूप-दीप'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'garbhadhana_simanta',
      titleNepali: 'गर्भाधान संस्कार पूजा सामग्री सेट',
      subtitleNepali: 'सद्गुणी एवं तेजस्वी सन्तान प्राप्तिका लागि वैदिक मन्त्र विधि सामग्री',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['पञ्चगव्य', 'प्राकृतिक घ्यू', 'समिधा काठ', 'जौ-तिल', 'रोली-केशरी', 'मङ्गल कलश', 'सुपारी', 'जनै', 'धूप-दीप'],
      theme: {
        bgSky: ['#4A044E', '#701A75', '#2E1065'],
        frameGold: '#FDE68A',
        accent: '#E879F9',
      },
      highlightBadge: '१६ संस्कार • प्रथम संस्कार',
    }),
  },
  {
    id: 'ps_pumsavana',
    nameNepali: 'पुंसवन संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Pumsavana Sanskar Ritual Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'गर्भस्थ शिशुको मानसिक तथा शारीरिक विकास र संरक्षणका लागि गरिने द्वितीय संस्कार।',
    tags: ['पुंसवन', 'संस्कार', 'गर्भसंरक्षण', 'बरकोटुसा', 'औषधि'],
    suggestedPrice: 1350,
    samagriList: ['बरको टुसा', 'दही-घ्यू', 'पञ्चामृत', 'समिधा', 'सर्वोषधी', 'चाँदीको कचौरा', 'जौ-तिल', 'कलश'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'garbhadhana_simanta',
      titleNepali: 'पुंसवन संस्कार पूजा सामग्री सेट',
      subtitleNepali: 'गर्भस्थ शिशुको दीर्घायु एवं स्वास्थ्य वृद्धिका लागि शास्त्रीय सामग्री',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['बरको टुसा', 'दही-घ्यू', 'पञ्चामृत', 'समिधा', 'सर्वोषधी', 'चाँदीको कचौरा', 'जौ-तिल', 'कलश'],
      theme: {
        bgSky: ['#14532D', '#15803D', '#052E16'],
        frameGold: '#BBF7D0',
        accent: '#86EFAC',
      },
      highlightBadge: '१६ संस्कार • द्वितीय संस्कार',
    }),
  },
  {
    id: 'ps_simantonnayana',
    nameNepali: 'सीमन्तोन्नयन संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Simantonnayana Sanskar Ceremony Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'गर्भवती आमाको मानसिक प्रसन्नता तथा मङ्गल कामनाका लागि गरिने तृतीय संस्कार।',
    tags: ['सीमन्तोन्नयन', 'दहीभात', 'सिउँदो', 'मङ्गल', 'संस्कार'],
    suggestedPrice: 1450,
    samagriList: ['सिन्दूर', 'मौली', 'साली धानको अक्षता', 'पञ्चामृत', 'घ्यूको दियो', 'सेतो वस्त्र', 'सुपारी', 'सगुन'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'garbhadhana_simanta',
      titleNepali: 'सीमन्तोन्नयन संस्कार पूजा सामग्री सेट',
      subtitleNepali: 'गर्भवती आमाको मङ्गल कामना तथा सौम्य सन्तानका लागि सामग्री',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['सिन्दूर', 'मौली', 'साली धानको अक्षता', 'पञ्चामृत', 'घ्यूको दियो', 'सेतो वस्त्र', 'सुपारी', 'सगुन'],
      theme: {
        bgSky: ['#831843', '#9D174D', '#500724'],
        frameGold: '#FECDD3',
        accent: '#FB7185',
      },
      highlightBadge: '१६ संस्कार • तृतीय संस्कार',
    }),
  },
  {
    id: 'ps_jatakarma',
    nameNepali: 'जातकर्म संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Jatakarma Baby Birth Sanskar Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'शिशु जन्मिएलगत्तै सुवर्ण शलाकाले मह-घ्यू चटाउने तथा मेधाजनन संस्कार।',
    tags: ['जातकर्म', 'शिशुजन्म', 'सुवर्ण', 'मह', 'घ्यू', 'मेधाजनन'],
    suggestedPrice: 1100,
    samagriList: ['शुद्ध मह', 'गाईको घ्यू', 'सुवर्ण शलाका (सुनको सिन्का)', 'काँसको कचौरा', 'कुश', 'गङ्गाजल'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'namakarana_nwaran',
      titleNepali: 'जातकर्म संस्कार पूजा सामग्री सेट',
      subtitleNepali: 'शिशुको जन्म पश्चात् सुवर्ण र मह-घ्यू द्वारा मेधाजनन संस्कार',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['शुद्ध मह', 'गाईको घ्यू', 'सुवर्ण शलाका', 'काँसको कचौरा', 'कुश', 'गङ्गाजल'],
      theme: {
        bgSky: ['#78350F', '#B45309', '#451A03'],
        frameGold: '#FEF08A',
        accent: '#FDE047',
      },
      highlightBadge: '१६ संस्कार • चतुर्थ संस्कार',
    }),
  },
  {
    id: 'ps_namakarana_nwaran',
    nameNepali: 'नामकरण (न्वारान) संस्कार सम्पूर्ण पूजा सामग्री',
    nameEnglish: 'Namakarana (Nwaran) Complete Ritual Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: '११ औं दिनमा गरिने न्वारान, सूर्य दर्शन, गुप्त तथा राशि नामकरणका लागि सम्पूर्ण सामग्री।',
    tags: ['न्वारान', 'नामकरण', '११दिन', 'सूर्यदर्शन', 'राशि'],
    suggestedPrice: 1550,
    samagriList: ['मङ्गल कलश', 'पहेंलो कपडा', 'मह-घ्यू', 'सुवर्ण', 'पञ्चगव्य', 'धूप-दीप', 'जौ-तिल', 'सुपारी', 'काँचो धागो', 'नवग्रह अन्न'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'namakarana_nwaran',
      titleNepali: 'नामकरण (न्वारान) संस्कार सम्पूर्ण पूजा सामग्री',
      subtitleNepali: 'सूर्य दर्शन, नक्षत्र नामकरण एवं पञ्चगव्य शुद्धिकरणका लागि पूर्ण सेट',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['मङ्गल कलश', 'पहेंलो कपडा', 'मह-घ्यू', 'सुवर्ण', 'पञ्चगव्य', 'धूप-दीप', 'जौ-तिल', 'सुपारी', 'काँचो धागो', 'नवग्रह अन्न'],
      theme: {
        bgSky: ['#7C2D12', '#9A3412', '#431407'],
        frameGold: '#FED7AA',
        accent: '#FB923C',
      },
      highlightBadge: '१६ संस्कार • पञ्चम संस्कार',
    }),
  },
  {
    id: 'ps_nishkramana',
    nameNepali: 'निष्क्रमण संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Nishkramana Sanskar First Outing Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'चौथो महिनामा शिशुलाई पहिलोपटक घरबाहिर निकालेर सूर्य र चन्द्रमा दर्शन गराउने विधि।',
    tags: ['निष्क्रमण', 'सूर्यदर्शन', 'चन्द्रदर्शन', 'शिशु', 'संस्कार'],
    suggestedPrice: 950,
    samagriList: ['शंख', 'घण्टी', 'सूर्य अर्घ्यपात्र', 'चन्दन', 'अक्षता', 'फूलमाला', 'सगुन'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'namakarana_nwaran',
      titleNepali: 'निष्क्रमण संस्कार पूजा सामग्री सेट',
      subtitleNepali: 'शिशुलाई पहिलोपटक सूर्य-चन्द्र दर्शन तथा प्रकृतिको सामीप्यता',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['शंख', 'घण्टी', 'सूर्य अर्घ्यपात्र', 'चन्दन', 'अक्षता', 'फूलमाला', 'सगुन'],
      theme: {
        bgSky: ['#0F172A', '#1E293B', '#020617'],
        frameGold: '#BAE6FD',
        accent: '#38BDF8',
      },
      highlightBadge: '१६ संस्कार • षष्ठ संस्कार',
    }),
  },
  {
    id: 'ps_annaprashan_pasni_pkg',
    nameNepali: 'अन्नप्राशन (पास्नी) संस्कार सम्पूर्ण सामग्री सेट',
    nameEnglish: 'Annaprashana (Pasni) Complete Ceremony Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'छैटौं महिनामा शिशुलाई चाँदीको कचौरा-चम्चाले पहिलो अन्न (खीर) खुवाउने पास्नी संस्कार।',
    tags: ['पास्नी', 'अन्नप्राशन', 'खीर', 'चाँदीकचौरा', 'शिशु'],
    suggestedPrice: 1850,
    samagriList: ['चाँदीको कचौरा', 'चाँदीको चम्चा', 'पञ्चामृत खीर सामग्री', 'अष्टमङ्गल थाली', 'रेशमी वस्त्र', 'सगुन सुपारी', 'फूलमाला', 'दियो', 'धूप'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'annaprashan_pasni',
      titleNepali: 'अन्नप्राशन (पास्नी) संस्कार सम्पूर्ण सामग्री सेट',
      subtitleNepali: 'शिशुको पहिलो अन्न ग्रहण, चाँदीको कचौरा-चम्चा एवं अष्टमङ्गल सगुन',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['चाँदीको कचौरा', 'चाँदीको चम्चा', 'पञ्चामृत खीर सामग्री', 'अष्टमङ्गल थाली', 'रेशमी वस्त्र', 'सगुन सुपारी', 'फूलमाला', 'दियो', 'धूप'],
      theme: {
        bgSky: ['#854D0E', '#A16207', '#451A03'],
        frameGold: '#FEF08A',
        accent: '#FDE047',
      },
      highlightBadge: '१६ संस्कार • सप्तम संस्कार',
    }),
  },
  {
    id: 'ps_chudakarma_mundan_pkg',
    nameNepali: 'चूडाकर्म (मुण्डन/छेवर) संस्कार सामग्री सेट',
    nameEnglish: 'Chudakarma (Mundan) Ritual Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'शिशुको पहिलो कपाल काटी शिखा (टुप्पी) राख्ने र दीर्घायु-तेज प्राप्तिका लागि गरिने संस्कार।',
    tags: ['मुण्डन', 'चूडाकर्म', 'छेवर', 'शिखा', 'कपालकाट्ने'],
    suggestedPrice: 1250,
    samagriList: ['सुवर्ण/चाँदी कैंची/शलाका', 'दही-घ्यू-माखन', 'कुश', 'पहेँलो वस्त्र', 'हवन सामग्री', 'जौ-तिल', 'सुपारी'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'bartabandha_upanayan',
      titleNepali: 'चूडाकर्म (मुण्डन/छेवर) संस्कार सामग्री सेट',
      subtitleNepali: 'कपाल काटी शिखा स्थापना, मङ्गल स्नान एवं दीर्घायु हवन सामग्री',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['सुवर्ण/चाँदी कैंची', 'दही-घ्यू-माखन', 'कुश', 'पहेँलो वस्त्र', 'हवन सामग्री', 'जौ-तिल', 'सुपारी'],
      theme: {
        bgSky: ['#78350F', '#B45309', '#451A03'],
        frameGold: '#FEF08A',
        accent: '#FDE047',
      },
      highlightBadge: '१६ संस्कार • अष्टम संस्कार',
    }),
  },
  {
    id: 'ps_karnavedha_pkg',
    nameNepali: 'कर्णवेध संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Karnavedha (Ear Piercing) Ritual Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'शिशुको दुवै कान छेड्ने, बौद्धिक स्मरण शक्ति र आरोग्य वृद्धिका लागि गरिने संस्कार।',
    tags: ['कर्णवेध', 'कानछेड्ने', 'सुनकोसुई', 'आरोग्य', 'संस्कार'],
    suggestedPrice: 980,
    samagriList: ['सुवर्ण शलाका (सुनको सुई)', 'शुद्ध घ्यू', 'कपास', 'रोली-अक्षता', 'सगुन मिठाई', 'कलश'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'namakarana_nwaran',
      titleNepali: 'कर्णवेध संस्कार पूजा सामग्री सेट',
      subtitleNepali: 'सुवर्ण शलाकाद्वारा कर्णवेध, बुद्धि एवं स्मरण शक्ति अभिवृद्धि',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['सुवर्ण शलाका', 'शुद्ध घ्यू', 'कपास', 'रोली-अक्षता', 'सगुन मिठाई', 'कलश'],
      theme: {
        bgSky: ['#831843', '#9D174D', '#500724'],
        frameGold: '#FECDD3',
        accent: '#FB7185',
      },
      highlightBadge: '१६ संस्कार • नवम संस्कार',
    }),
  },
  {
    id: 'ps_vidyarambha_pkg',
    nameNepali: 'विद्यारम्भ एवं अक्षराम्भ संस्कार सेट',
    nameEnglish: 'Vidyarambha (Akshararambha) Learning Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'सरस्वती पूजा, मयूर प्वाँखले पाटीमा पहिलो अक्षर ॐ श्री गणेशाय नमः लेख्ने संस्कार।',
    tags: ['विद्यारम्भ', 'अक्षराम्भ', 'सरस्वती', 'पाटी', 'मयूरप्वाँख'],
    suggestedPrice: 850,
    samagriList: ['काठको पाटी', 'मयूर प्वाँखको कलम', 'साली धानको अक्षता', 'सरस्वती चित्र', 'पञ्चमेवा', 'घ्यूको दियो'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'general_vedic_anushthan',
      titleNepali: 'विद्यारम्भ एवं अक्षराम्भ संस्कार सेट',
      subtitleNepali: 'सरस्वती वन्दना, ॐकार लेखन तथा ज्ञान शुभारम्भ संस्कार',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['काठको पाटी', 'मयूर प्वाँखको कलम', 'साली धानको अक्षता', 'सरस्वती चित्र', 'पञ्चमेवा', 'घ्यूको दियो'],
      theme: {
        bgSky: ['#1E1B4B', '#312E81', '#0F172A'],
        frameGold: '#E0E7FF',
        accent: '#A5B4FC',
      },
      highlightBadge: '१६ संस्कार • दशम संस्कार',
    }),
  },
  {
    id: 'ps_upanayan_bartabandha_pkg',
    nameNepali: 'उपनयन (व्रतबन्ध) संस्कार सम्पूर्ण सामग्री प्याकेज',
    nameEnglish: 'Upanayana (Bartabandha) Complete Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'बटुकको यज्ञोपवीत धारण, गायत्री दीक्षा, पलाँस दण्ड, मेखला, भिक्षापात्र र हवन सामग्री।',
    tags: ['व्रतबन्ध', 'उपनयन', 'जनै', 'पलाँसदण्ड', 'गायत्री'],
    suggestedPrice: 2200,
    samagriList: ['शिखा जनै', 'मुञ्ज मेखला', 'पलाँस दण्ड', 'काठको खडाउँ', 'गेरु वस्त्र', 'भिक्षापात्र', 'मृगचर्म', 'कुश', 'गायत्री हवन सामग्री'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'bartabandha_upanayan',
      titleNepali: 'उपनयन (व्रतबन्ध) संस्कार सम्पूर्ण सामग्री प्याकेज',
      subtitleNepali: 'द्विजत्व प्राप्ति, गायत्री मन्त्र दीक्षा, यज्ञोपवीत एवं समावर्तन सामग्री',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['शिखा जनै', 'मुञ्ज मेखला', 'पलाँस दण्ड', 'काठको खडाउँ', 'गेरु वस्त्र', 'भिक्षापात्र', 'मृगचर्म', 'कुश', 'गायत्री हवन सामग्री'],
      theme: {
        bgSky: ['#78350F', '#B45309', '#451A03'],
        frameGold: '#FEF08A',
        accent: '#FDE047',
      },
      highlightBadge: '१६ संस्कार • एकादश संस्कार',
    }),
  },
  {
    id: 'ps_vedarambha_pkg',
    nameNepali: 'वेदारम्भ संस्कार पूजा सामग्री सेट',
    nameEnglish: 'Vedarambha (Vedic Studies Initiation) Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'चार वेद (ऋग्, यजुर्, साम, अथर्व) अध्ययन प्रारम्भका लागि गरिने वेदारम्भ होम सामग्री।',
    tags: ['वेदारम्भ', 'वेदपाठ', 'ऋग्वेद', 'यजुर्वेद', 'अध्ययन'],
    suggestedPrice: 1350,
    samagriList: ['चार वेद पुस्तक/प्रतीक', 'समिधा काठ', 'घ्यू', 'कुशासन', 'रुद्राक्ष', 'हवन सामग्री', 'दियो'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'general_vedic_anushthan',
      titleNepali: 'वेदारम्भ संस्कार पूजा सामग्री सेट',
      subtitleNepali: 'वेदाध्ययन प्रारम्भ, ऋषिपूजन एवं वैदिक ज्ञान साधना सामग्री',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['चार वेद प्रतीक', 'समिधा काठ', 'घ्यू', 'कुशासन', 'रुद्राक्ष', 'हवन सामग्री', 'दियो'],
      theme: {
        bgSky: ['#7C2D12', '#9A3412', '#431407'],
        frameGold: '#FED7AA',
        accent: '#FB923C',
      },
      highlightBadge: '१६ संस्कार • द्वादश संस्कार',
    }),
  },
  {
    id: 'ps_keshanta_godana_pkg',
    nameNepali: 'केशान्त एवं गोदान संस्कार सामग्री सेट',
    nameEnglish: 'Keshanta & Godana Sanskar Package',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: '१६ वर्षको उमेरमा पहिलोपटक दाह्री-कपाल खौरने तथा गुरु दक्षिणा गोदान संस्कार।',
    tags: ['केशान्त', 'गोदान', 'गुरूदक्षिणा', 'संस्कार'],
    suggestedPrice: 1650,
    samagriList: ['गोदान सङ्कल्प द्रव्य', 'पीताम्बर वस्त्र', 'कुश', 'कालो तिल', 'घ्यू', 'हवन सामग्री', 'पात्र'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'bartabandha_upanayan',
      titleNepali: 'केशान्त एवं गोदान संस्कार सामग्री सेट',
      subtitleNepali: 'ब्रह्मचर्य आश्रम शुद्धि, केशान्त मुण्डन एवं गुरु दक्षिणा गोदान',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['गोदान सङ्कल्प द्रव्य', 'पीताम्बर वस्त्र', 'कुश', 'कालो तिल', 'घ्यू', 'हवन सामग्री', 'पात्र'],
      theme: {
        bgSky: ['#854D0E', '#A16207', '#451A03'],
        frameGold: '#FEF08A',
        accent: '#FDE047',
      },
      highlightBadge: '१६ संस्कार • त्रयोदश संस्कार',
    }),
  },
  {
    id: 'ps_samavartana_pkg',
    nameNepali: 'समावर्तन (दीक्षान्त) संस्कार सामग्री सेट',
    nameEnglish: 'Samavartana (Graduation/Snataka) Ceremony Kit',
    category: 'sanskar_16',
    categoryNameNepali: '१६ संस्कार',
    description: 'गुरुकुल विद्या समाप्त गरी स्नातक उपाधि सहित गृहस्थ आश्रम प्रवेश गर्ने संस्कार।',
    tags: ['समावर्तन', 'स्नातक', 'दीक्षान्त', 'छत्र', 'खडाउँ'],
    suggestedPrice: 1750,
    samagriList: ['स्नातक वस्त्र (धोती-सल)', 'छत्र (छाता)', 'काठको खडाउँ', 'दण्ड', 'अञ्जन', 'सुगन्धित चन्दन', 'माला'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'bartabandha_upanayan',
      titleNepali: 'समावर्तन (दीक्षान्त) संस्कार सामग्री सेट',
      subtitleNepali: 'विद्या समाप्ति, स्नातक अलंकरण एवं गृहस्थाश्रम प्रवेश संस्कार',
      categoryNepali: '१६ संस्कार',
      samagriItems: ['स्नातक वस्त्र', 'छत्र (छाता)', 'काठको खडाउँ', 'दण्ड', 'अञ्जन', 'सुगन्धित चन्दन', 'माला'],
      theme: {
        bgSky: ['#1E3A8A', '#1E40AF', '#172554'],
        frameGold: '#93C5FD',
        accent: '#60A5FA',
      },
      highlightBadge: '१६ संस्कार • चतुर्दश संस्कार',
    }),
  },
  {
    id: 'ps_vivah_sanskar_pkg',
    nameNepali: 'विवाह संस्कार सम्पूर्ण कर्मकाण्ड मण्डप सेट',
    nameEnglish: 'Vivaha Sanskar Complete Marriage Ritual Kit',
    category: 'vivah_karma',
    categoryNameNepali: 'विवाह कर्मकाण्ड',
    description: 'सनातन वैदिक विवाह, कन्यादान, लगनगाँठो, सप्तपदी, सिन्दूरदान र स्वयंवरका लागि पूर्ण सेट।',
    tags: ['विवाह', 'लग्न', 'स्वयंवर', 'सिन्दूर', 'लगनगाँठो', 'सप्तपदी'],
    suggestedPrice: 3800,
    samagriList: ['सिन्दूरदानी', 'शुद्ध सिन्दूर', 'लगनगाँठो वस्त्र', 'स्वयंवर दुबोमाला जोडी', 'लाजा (लाभा)', 'पञ्चपल्लव', 'अर्घ्यपात्र', 'सुपारी', 'जनै', 'शङ्ख', 'मौली', 'अक्षता', 'हवन सामग्री'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'vivah_mandap_sindur',
      titleNepali: 'विवाह संस्कार सम्पूर्ण कर्मकाण्ड मण्डप सेट',
      subtitleNepali: 'बेहुला-बेहुली सिन्दूरदान, लगनगाँठो, सप्तपदी, स्वयंवर एवं मण्डप हवन सामग्री',
      categoryNepali: 'विवाह कर्मकाण्ड',
      samagriItems: ['सिन्दूरदानी', 'शुद्ध सिन्दूर', 'लगनगाँठो वस्त्र', 'स्वयंवर दुबोमाला जोडी', 'लाजा (लाभा)', 'पञ्चपल्लव', 'अर्घ्यपात्र', 'सुपारी', 'जनै', 'शङ्ख', 'मौली', 'अक्षता', 'हवन सामग्री'],
      theme: {
        bgSky: ['#831843', '#9D174D', '#500724'],
        frameGold: '#FDA4AF',
        accent: '#F43F5E',
      },
      highlightBadge: '१६ संस्कार • पञ्चदश संस्कार',
    }),
  },
  {
    id: 'ps_antyeshti_moksha_pkg',
    nameNepali: 'अन्त्येष्टि एवं मोक्ष तर्पण कर्मकाण्ड सेट',
    nameEnglish: 'Antyeshti & Moksha Karma Samagri Kit',
    category: 'antyeshti_karma',
    categoryNameNepali: 'अन्त्येष्टि कर्म',
    description: 'मृत्यु संस्कार, दशगात्र, एकादशाह, द्वादशाह र सपिण्डीकरणसम्मका सम्पूर्ण पितृमुक्ति सामग्री।',
    tags: ['अन्त्येष्टि', 'मृत्युसंस्कार', 'सपिण्डीकरण', 'विष्णुपद', 'पिण्डदान'],
    suggestedPrice: 1950,
    samagriList: ['सेतो कपडा (कफन)', 'तुलसी काठ', 'गङ्गाजल', 'कालो तिल', 'कुश', 'घ्यू', 'पिण्ड पात्र', 'माटोको भाँडा', 'दशाङ्ग धूप'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'shraddha_pitri_tarpana',
      titleNepali: 'अन्त्येष्टि एवं मोक्ष तर्पण कर्मकाण्ड सेट',
      subtitleNepali: 'जीवात्माको सद्गति, मोक्ष तर्पण, सपिण्डीकरण एवं शान्ति सामग्री',
      categoryNepali: 'अन्त्येष्टि कर्म',
      samagriItems: ['सेतो कपडा', 'तुलसी काठ', 'गङ्गाजल', 'कालो तिल', 'कुश', 'घ्यू', 'पिण्ड पात्र', 'माटोको भाँडा', 'दशाङ्ग धूप'],
      theme: {
        bgSky: ['#18181B', '#27272A', '#09090B'],
        frameGold: '#E4E4E7',
        accent: '#A1A1AA',
      },
      highlightBadge: '१६ संस्कार • षोडश (अन्तिम) संस्कार',
    }),
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
    suggestedPrice: 2400,
    samagriList: ['मङ्गल कलश', 'तोरण माला', 'पञ्चरत्न', 'सप्तधान्य', 'वास्तु यन्त्र', 'पञ्चगव्य', 'धूप-दीप', 'जौ-तिल', 'सुपारी', 'जनै', 'अबीर-केशरी', 'गाईको घ्यू'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'grihapravesh_kalash_door',
      titleNepali: 'गृहप्रवेश पूजा सामग्री सम्पूर्ण सेट',
      subtitleNepali: 'तोरणद्वार प्रवेश, मङ्गल कलश, कुलदेवता पूजन एवं वास्तु शमन सामग्री',
      categoryNepali: 'गृहप्रवेश तथा वास्तु',
      samagriItems: ['मङ्गल कलश', 'तोरण माला', 'पञ्चरत्न', 'सप्तधान्य', 'वास्तु यन्त्र', 'पञ्चगव्य', 'धूप-दीप', 'जौ-तिल', 'सुपारी', 'जनै', 'अबीर-केशरी', 'गाईको घ्यू'],
      theme: {
        bgSky: ['#7A1C1C', '#991B1B', '#450A0A'],
        frameGold: '#FDE68A',
        accent: '#F59E0B',
      },
      highlightBadge: 'नयाँ भवन मङ्गल प्रवेश प्याकेज',
    }),
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
    samagriList: ['वास्तुपुरुष यन्त्र', 'सप्तमृत्तिका', 'पञ्चगव्य', 'तामाको पिरामिड', 'पञ्चरत्न', 'सप्तधान्य', 'हवन समिधा', 'जौ-तिल', 'सुपारी', 'घ्यू'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'vastu_shanti_mandala',
      titleNepali: 'वास्तुशान्ति एवं वास्तुहोम पूजा प्याकेज',
      subtitleNepali: 'वास्तुदोष निवारण, वास्तुपुरुष मण्डल स्थापना एवं वास्तुहोम सामग्री',
      categoryNepali: 'गृहप्रवेश तथा वास्तु',
      samagriItems: ['वास्तुपुरुष यन्त्र', 'सप्तमृत्तिका', 'पञ्चगव्य', 'तामाको पिरामिड', 'पञ्चरत्न', 'सप्तधान्य', 'हवन समिधा', 'जौ-तिल', 'सुपारी', 'घ्यू'],
      theme: {
        bgSky: ['#14532D', '#15803D', '#052E16'],
        frameGold: '#BBF7D0',
        accent: '#4ADE80',
      },
      highlightBadge: 'वास्तुदोष निवारण प्रमाणित',
    }),
  },
  {
    id: 'ps_bhumi_pujan_shilanyas',
    nameNepali: 'भूमिपूजन, शिलान्यास एवं घरको जग पूजा सामग्री',
    nameEnglish: 'Bhumi Pujan & Foundation Stone (Shilanyas) Kit',
    category: 'grihapravesh_vastu',
    categoryNameNepali: 'गृहप्रवेश तथा वास्तु',
    description: 'घर निर्माण शुभारम्भ, जग पूजा, ५ वटा कलश, कूर्मासन (कछुवा) र शिलान्यास इँटा पूजन सामग्री।',
    tags: ['भूमिपूजन', 'शिलान्यास', 'जगपूजा', 'कूर्मासन', 'निर्माण'],
    suggestedPrice: 1850,
    samagriList: ['तामाको कूर्मासन (कछुवा)', '५ वटा तामाको कलश', 'शिलान्यास सुवर्ण/चाँदी पत्र', 'पञ्चरत्न', 'नाग-नागिनी जोडी', 'सप्तधान्य', 'धूप-दीप'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'bhumi_shilanyas_jag',
      titleNepali: 'भूमिपूजन, शिलान्यास एवं घरको जग पूजा सामग्री',
      subtitleNepali: 'भवन निर्माण शुभारम्भ, कूर्मासन, पञ्चकलश एवं शिलान्यास सामग्री',
      categoryNepali: 'गृहप्रवेश तथा वास्तु',
      samagriItems: ['तामाको कूर्मासन', '५ वटा तामाको कलश', 'शिलान्यास सुवर्ण पत्र', 'पञ्चरत्न', 'नाग-नागिनी जोडी', 'सप्तधान्य', 'धूप-दीप'],
      theme: {
        bgSky: ['#78350F', '#B45309', '#451A03'],
        frameGold: '#FEF08A',
        accent: '#FBBF24',
      },
      highlightBadge: 'भवन निर्माण प्रारम्भ शुभ साइत',
    }),
  },
  {
    id: 'ps_office_shop_inauguration',
    nameNepali: 'नूतन पसल, कार्यालय तथा व्यवसाय उद्घाटन पूजा सेट',
    nameEnglish: 'New Shop & Business Inauguration Puja Kit',
    category: 'grihapravesh_vastu',
    categoryNameNepali: 'गृहप्रवेश तथा वास्तु',
    description: 'पसल, उद्योग वा कार्यालय शुभारम्भ गर्दा लक्ष्मी-कुबेर पूजा, खातापाता स्वस्तिक र व्यापार वृद्धि हवन।',
    tags: ['पसलउद्घाटन', 'व्यवसाय', 'कार्यालय', 'लक्ष्मीकुबेर', 'व्यापारवृद्धि'],
    suggestedPrice: 1950,
    samagriList: ['लक्ष्मी-कुबेर यन्त्र', 'खातापाता स्वस्तिक रोली', 'तोरण माला', 'चाँदीको सिक्का', 'मङ्गल कलश', 'पञ्चामृत', 'हवन सामग्री', 'सगुन मिठाई'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'vyapar_vriddhi_kuber',
      titleNepali: 'नूतन पसल एवं व्यवसाय उद्घाटन पूजा सेट',
      subtitleNepali: 'लक्ष्मी-कुबेर पूजन, खातापाता स्वस्तिक एवं व्यापार वृद्धि हवन सामग्री',
      categoryNepali: 'गृहप्रवेश तथा वास्तु',
      samagriItems: ['लक्ष्मी-कुबेर यन्त्र', 'खातापाता स्वस्तिक रोली', 'तोरण माला', 'चाँदीको सिक्का', 'मङ्गल कलश', 'पञ्चामृत', 'हवन सामग्री', 'सगुन मिठाई'],
      theme: {
        bgSky: ['#1E1B4B', '#312E81', '#0F172A'],
        frameGold: '#C7D2FE',
        accent: '#818CF8',
      },
      highlightBadge: 'व्यापार वृद्धि एवं समृद्धि प्याकेज',
    }),
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
    suggestedPrice: 1650,
    samagriList: ['केशरी', 'जौ-तिल', 'काँचो धागो', 'पञ्चरत्न', 'रातो सर्सी', 'पञ्चपल्लव', 'रक्तचन्दन', '९ थरी अन्न', 'अगरबत्ती', 'श्रीखण्ड', 'अबीर', '९ थरी कपडा', 'बाटेको धूप', 'सर्वोषधी', 'सप्तमृत्तिका', 'जनै ९ थरी', 'कपुर', 'काटेको बत्ती', 'सुपारी ९ वटा', 'खड्क पाला', 'नवग्रह यन्त्र'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'navagraha_shanti_altar',
      titleNepali: 'नवग्रह शान्ति पूजा सामग्री सम्पूर्ण सेट',
      subtitleNepali: '९ ग्रह मण्डल, ९ वस्त्र, ९ समिधा काठ, नवधान्य एवं २१ सामग्री',
      categoryNepali: 'ग्रहशान्ति',
      samagriItems: ['केशरी', 'जौ-तिल', 'काँचो धागो', 'पञ्चरत्न', 'रातो सर्सी', 'पञ्चपल्लव', 'रक्तचन्दन', '९ थरी अन्न', 'अगरबत्ती', 'श्रीखण्ड', 'अबीर', '९ थरी कपडा', 'बाटेको धूप', 'सर्वोषधी', 'सप्तमृत्तिका', 'जनै ९ थरी', 'कपुर', 'काटेको बत्ती', 'सुपारी ९ वटा', 'नवग्रह'],
      theme: {
        bgSky: ['#1C1917', '#44403C', '#0C0A09'],
        frameGold: '#FEF08A',
        accent: '#F59E0B',
      },
      highlightBadge: 'शास्त्रीय २१ प्रकारका नवग्रह सामग्री',
    }),
  },
  {
    id: 'ps_kalsarp_shanti_pkg',
    nameNepali: 'कालसर्प योग तथा नागदोष शान्ति पूजा सेट',
    nameEnglish: 'Kalsarp Yoga & Nagadosha Shanti Kit',
    category: 'graha_shanti',
    categoryNameNepali: 'ग्रहशान्ति',
    description: 'राहु-केतु जनित कालसर्प योग, पितृदोष तथा नागदोष निवारणका लागि चाँदीको नाग जोडी सहित।',
    tags: ['कालसर्प', 'नागदोष', 'राहुकेतु', 'चाँदीकोनाग', 'दोषशान्ति'],
    suggestedPrice: 2200,
    samagriList: ['चाँदीको नाग-नागिनी जोडी', 'राहु-केतु यन्त्र', 'कालो तिल', 'कालो मास', 'सप्तधान्य', 'दुग्धपात्र', 'हवन सामग्री', 'सुपारी'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'kalsarp_mangal_dosha',
      titleNepali: 'कालसर्प योग तथा नागदोष शान्ति पूजा सेट',
      subtitleNepali: 'चाँदीको नाग-नागिनी जोडी, राहु-केतु यन्त्र एवं कालसर्प शान्ति हवन',
      categoryNepali: 'ग्रहशान्ति',
      samagriItems: ['चाँदीको नाग-नागिनी जोडी', 'राहु-केतु यन्त्र', 'कालो तिल', 'कालो मास', 'सप्तधान्य', 'दुग्धपात्र', 'हवन सामग्री', 'सुपारी'],
      theme: {
        bgSky: ['#0F172A', '#1E293B', '#020617'],
        frameGold: '#BAE6FD',
        accent: '#38BDF8',
      },
      highlightBadge: 'चाँदीको नाग-नागिनी जोडी समावेश',
    }),
  },
  {
    id: 'ps_mangal_dosh_shanti_pkg',
    nameNepali: 'मंगलदोष (अंगारक) शान्ति तथा भातपूजा सेट',
    nameEnglish: 'Mangal Dosha (Bhat Puja) Shanti Package',
    category: 'graha_shanti',
    categoryNameNepali: 'ग्रहशान्ति',
    description: 'विवाह बाधा निवारण, मांगलिक दोष शमन तथा रक्तविकार शान्तिका लागि मंगल भातपूजा सामग्री।',
    tags: ['मंगलदोष', 'मांगलिक', 'विवाहबाधा', 'भातपूजा', 'अंगारक'],
    suggestedPrice: 1550,
    samagriList: ['मंगल यन्त्र', 'रातो वस्त्र', 'रातो मुगा भस्म/प्रतीक', 'मसुरो दाल', 'रातो चन्दन', 'खयरको समिधा', 'हवन सामग्री', 'घ्यू'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'kalsarp_mangal_dosha',
      titleNepali: 'मंगलदोष (अंगारक) शान्ति पूजा सेट',
      subtitleNepali: 'मांगलिक दोष निवारण, विवाह योग प्रशस्त एवं मंगल भातपूजा सामग्री',
      categoryNepali: 'ग्रहशान्ति',
      samagriItems: ['मंगल यन्त्र', 'रातो वस्त्र', 'रातो मुगा प्रतीक', 'मसुरो दाल', 'रातो चन्दन', 'खयरको समिधा', 'हवन सामग्री', 'घ्यू'],
      theme: {
        bgSky: ['#7F1D1D', '#991B1B', '#450A0A'],
        frameGold: '#FECDD3',
        accent: '#EF4444',
      },
      highlightBadge: 'विवाह बाधा निवारक मंगल शान्ति',
    }),
  },
  {
    id: 'ps_shani_sadhesati_shanti',
    nameNepali: 'शनि साढेसाती, अष्टम शनि एवं शनिदोष शान्ति सेट',
    nameEnglish: 'Shani Sadhesati & Kantaka Shani Shanti Kit',
    category: 'graha_shanti',
    categoryNameNepali: 'ग्रहशान्ति',
    description: 'शनि साढेसाती, ढैय्या तथा महादशाको अशुभ प्रभाव शमनका लागि कालो तिल, तेल, फलाम र शमी काठ।',
    tags: ['शनि', 'साढेसाती', 'अष्टमशनि', 'कालोतिल', 'शमीकाठ'],
    suggestedPrice: 1400,
    samagriList: ['कालो तिलको शुद्ध तेल', 'कालो तिल', 'कालो मास', 'फलामको औंठी/पात्र', 'कालो वस्त्र', 'शमीको समिधा काठ', 'नीलम प्रतीक', 'दियो'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'navagraha_shanti_altar',
      titleNepali: 'शनि साढेसाती एवं शनिदोष शान्ति सेट',
      subtitleNepali: 'शनि कृपा प्राप्ति, कालो तिल-तेल, शमी समिधा एवं शनि होम सामग्री',
      categoryNepali: 'ग्रहशान्ति',
      samagriItems: ['कालो तिलको तेल', 'कालो तिल', 'कालो मास', 'फलामको औंठी', 'कालो वस्त्र', 'शमीको समिधा', 'नीलम प्रतीक', 'दियो'],
      theme: {
        bgSky: ['#18181B', '#27272A', '#09090B'],
        frameGold: '#FDE047',
        accent: '#71717A',
      },
      highlightBadge: 'शनि कृपा एवं दोष निवारक',
    }),
  },
  {
    id: 'ps_mahamrityunjaya_hom_full',
    nameNepali: 'महामृत्युञ्जय होम एवं सवालाख जप अनुष्ठान सामग्री',
    nameEnglish: 'Mahamrityunjaya Homa & Health Anushthan Kit',
    category: 'vishesh_anushthan',
    categoryNameNepali: 'विशेष अनुष्ठान',
    description: 'आरोग्य, अकाल मृत्यु निवारण, रोगमुक्ति तथा दीर्घायुष्य महामृत्युञ्जय होम सामग्री सेट।',
    tags: ['महामृत्युञ्जय', 'आरोग्य', 'दीर्घायु', 'अग्निहोत्र', 'रोगमुक्ति'],
    suggestedPrice: 2800,
    samagriList: ['महामृत्युञ्जय यन्त्र', '१०८ रुद्राक्ष जपमाला', 'तामाको हवन कुण्ड', 'अमृत वल्लरी (गुर्जो)', 'शुद्ध गुग्गुल', 'गाईको घ्यू', 'समिधा काठ', 'कालो तिल-जौ', 'सर्वोषधी', 'कपुर'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'mahamrityunjaya_havan',
      titleNepali: 'महामृत्युञ्जय होम एवं आरोग्य अनुष्ठान सामग्री',
      subtitleNepali: 'आरोग्य, अकाल मृत्यु निवारण, रोगमुक्ति एवं सवालाख जप होम सामग्री',
      categoryNepali: 'विशेष अनुष्ठान',
      samagriItems: ['महामृत्युञ्जय यन्त्र', '१०८ रुद्राक्ष जपमाला', 'तामाको हवन कुण्ड', 'गुर्जो', 'शुद्ध गुग्गुल', 'गाईको घ्यू', 'समिधा काठ', 'कालो तिल-जौ', 'सर्वोषधी', 'कपुर'],
      theme: {
        bgSky: ['#312E81', '#3730A3', '#1E1B4B'],
        frameGold: '#C7D2FE',
        accent: '#A5B4FC',
      },
      highlightBadge: 'आरोग्य एवं महामृत्युञ्जय अनुष्ठान',
    }),
  },
  {
    id: 'ps_rudrabhishek_laghurudra',
    nameNepali: 'रुद्राभिषेक, लघुरुद्र एवं महारुद्र अनुष्ठान सामग्री',
    nameEnglish: 'Rudrabhishek, Laghurudra & Maharudra Kit',
    category: 'vishesh_anushthan',
    categoryNameNepali: 'विशेष अनुष्ठान',
    description: 'एकादश रुद्री, पार्थिव शिवलिङ्ग पूजन, दुग्धधारा अभिषेक र रुद्राष्टाध्यायी हवन सामग्री।',
    tags: ['रुद्राभिषेक', 'लघुरुद्र', 'महारुद्र', 'शिवलिङ्ग', 'बेलपत्र'],
    suggestedPrice: 2100,
    samagriList: ['शिवलिङ्ग जलधारा पात्र (शृङ्गी)', 'त्रिनेत्र बेलपत्र', 'रुद्राक्ष माला', 'काशी भस्म', 'गङ्गाजल', 'पञ्चामृत किट', 'धतुरो', 'अष्टगन्ध', 'घ्यूको दियो', 'जौ-तिल'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'rudrabhishek_lingam_snan',
      titleNepali: 'रुद्राभिषेक एवं लघुरुद्र अनुष्ठान सामग्री',
      subtitleNepali: 'एकादश रुद्री, पार्थिव शिवलिङ्ग दुग्धधारा एवं शिव मन्त्र हवन सामग्री',
      categoryNepali: 'विशेष अनुष्ठान',
      samagriItems: ['शिवलिङ्ग शृङ्गी पात्र', 'त्रिनेत्र बेलपत्र', 'रुद्राक्ष माला', 'काशी भस्म', 'गङ्गाजल', 'पञ्चामृत किट', 'धतुरो', 'अष्टगन्ध', 'घ्यूको दियो', 'जौ-तिल'],
      theme: {
        bgSky: ['#1E3A8A', '#1E40AF', '#172554'],
        frameGold: '#93C5FD',
        accent: '#60A5FA',
      },
      highlightBadge: 'रुद्री एवं अभिषेक अनुष्ठान',
    }),
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
    suggestedPrice: 1750,
    samagriList: ['सन्तानगोपाल यन्त्र', 'बालकृष्ण विग्रह/चित्र', 'शुद्ध नौनी (माखन)', 'मिश्री', 'तुलसी मंजरी', 'पहेंलो वस्त्र', 'पञ्चामृत', 'हवन सामग्री', 'घ्यू'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'santana_gopala_puja',
      titleNepali: 'सन्तान प्राप्ति (सन्तानगोपाल) पूजा सामग्री सेट',
      subtitleNepali: 'सन्तान सुख, मेधावी पुत्र-पुत्री प्राप्ति एवं सन्तानगोपाल होम सामग्री',
      categoryNepali: 'काम्य पूजा',
      samagriItems: ['सन्तानगोपाल यन्त्र', 'बालकृष्ण विग्रह', 'शुद्ध माखन', 'मिश्री', 'तुलसी मंजरी', 'पहेंलो वस्त्र', 'पञ्चामृत', 'हवन सामग्री', 'घ्यू'],
      theme: {
        bgSky: ['#78350F', '#B45309', '#451A03'],
        frameGold: '#FEF08A',
        accent: '#FDE047',
      },
      highlightBadge: 'सन्तान सुख मनोकामना सिद्धि',
    }),
  },
  {
    id: 'ps_lakshmi_dhanaprapti_pkg',
    nameNepali: 'धनप्राप्ति, श्रीवृद्धि एवं महालक्ष्मी-कुबेर पूजा सेट',
    nameEnglish: 'Dhanaprapti Mahalaxmi & Kuber Wealth Puja Kit',
    category: 'kamya_puja',
    categoryNameNepali: 'काम्य पूजा',
    description: 'आर्थिक समृद्धि, व्यापार सफलता, ऋणमुक्ति र धनवृद्धिका लागि कनकधारा एवं श्रीसूक्त पूजा सेट।',
    tags: ['धनप्राप्ति', 'महालक्ष्मी', 'कुबेर', 'श्रीयन्त्र', 'कमलगट्टा'],
    suggestedPrice: 1950,
    samagriList: ['श्रीयन्त्र', 'कुबेर यन्त्र', 'कमलगट्टा माला', 'चाँदीको सिक्का', 'कौडा', 'गोमती चक्र', 'कमलको फूल', '५ वटा दियो', 'सुगन्धित धूप'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'lakshmi_deepawali_coins',
      titleNepali: 'धनप्राप्ति एवं महालक्ष्मी-कुबेर पूजा सेट',
      subtitleNepali: 'श्रीवृद्धि, ऐश्वर्य, कनकधारा मन्त्र साधना एवं व्यापार सफलता सामग्री',
      categoryNepali: 'काम्य पूजा',
      samagriItems: ['श्रीयन्त्र', 'कुबेर यन्त्र', 'कमलगट्टा माला', 'चाँदीको सिक्का', 'कौडा', 'गोमती चक्र', 'कमलको फूल', '५ वटा दियो', 'सुगन्धित धूप'],
      theme: {
        bgSky: ['#831843', '#9D174D', '#500724'],
        frameGold: '#FDE047',
        accent: '#F472B6',
      },
      highlightBadge: 'धन-समृद्धि एवं ऐश्वर्य प्राप्ति',
    }),
  },
  {
    id: 'ps_vidya_smriti_pariksha',
    nameNepali: 'विद्या प्राप्ति, बुद्धि-स्मृति वृद्धि एवं परीक्षा सफलता सेट',
    nameEnglish: 'Vidya & Saraswati Smriti Learning & Exam Kit',
    category: 'kamya_puja',
    categoryNameNepali: 'काम्य पूजा',
    description: 'विद्यार्थीहरूको एकाग्रता, स्मरणशक्ति वृद्धि, परीक्षामा सफलता तथा वाणी सिद्धिका लागि सरस्वती पूजा।',
    tags: ['विद्या', 'परीक्षासफलता', 'सरस्वती', 'मेधा', 'स्मरणशक्ति'],
    suggestedPrice: 1100,
    samagriList: ['सरस्वती यन्त्र', 'स्फटिक माला', 'श्वेत चन्दन', 'मयूर प्वाँख', 'पहेंलो-सेतो वस्त्र', 'ब्राह्मी घ्यू', 'धूप-दीप', 'अक्षता'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'vidyarambha_vedarambha',
      titleNepali: 'विद्या प्राप्ति एवं परीक्षा सफलता पूजा सेट',
      subtitleNepali: 'सरस्वती यन्त्र, मेधा बुद्धि वृद्धि एवं उच्च शिक्षा सफलता सामग्री',
      categoryNepali: 'काम्य पूजा',
      samagriItems: ['सरस्वती यन्त्र', 'स्फटिक माला', 'श्वेत चन्दन', 'मयूर प्वाँख', 'पहेंलो वस्त्र', 'ब्राह्मी घ्यू', 'धूप-दीप', 'अक्षता'],
      theme: {
        bgSky: ['#1E1B4B', '#312E81', '#0F172A'],
        frameGold: '#E0E7FF',
        accent: '#A5B4FC',
      },
      highlightBadge: 'विद्या एवं परीक्षा सफलता सिद्धि',
    }),
  },
  {
    id: 'ps_shatru_badha_karyasiddhi',
    nameNepali: 'शत्रुबाधा निवारण, कार्यसिद्धि एवं हनुमान पूजा सेट',
    nameEnglish: 'Shatru Badha Nivaran & Karya Siddhi Hanuman Kit',
    category: 'kamya_puja',
    categoryNameNepali: 'काम्य पूजा',
    description: 'मुद्दा-मामिला विजय, शत्रु पराजय, नजरदोष निवारण र रोकिएका कार्य सम्पन्न गर्नका लागि।',
    tags: ['शत्रुबाधा', 'कार्यसिद्धि', 'हनुमान', 'बगलामुखी', 'विजय'],
    suggestedPrice: 1650,
    samagriList: ['हनुमान यन्त्र / बगलामुखी यन्त्र', 'सिन्दूर (चमेलीको तेल)', 'रातो लंगोट/वस्त्र', 'जनेउ', 'ल्वाङ-सुपारी', 'हवन समिधा', 'घ्यूको दियो'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'general_vedic_anushthan',
      titleNepali: 'शत्रुबाधा निवारण एवं कार्यसिद्धि पूजा सेट',
      subtitleNepali: 'संकटमोचन हनुमान एवं बगलामुखी कृपा, सर्वकार्य सिद्धि सामग्री',
      categoryNepali: 'काम्य पूजा',
      samagriItems: ['हनुमान यन्त्र', 'बगलामुखी यन्त्र', 'चमेली सिन्दूर', 'रातो वस्त्र', 'जनेउ', 'ल्वाङ-सुपारी', 'हवन समिधा', 'घ्यूको दियो'],
      theme: {
        bgSky: ['#7C2D12', '#9A3412', '#431407'],
        frameGold: '#FED7AA',
        accent: '#EA580C',
      },
      highlightBadge: 'सर्वकार्य सिद्धि एवं विजय प्राप्ति',
    }),
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
    description: 'सोह्रश्राद्ध (पितृपक्ष), एकोदिष्ट, पार्वण, वार्षिक श्राद्ध र तीर्थ श्राद्धका लागि शास्त्रीय १२ सामग्री।',
    tags: ['सोह्रश्राद्ध', 'एकोदिष्ट', 'पार्वण', 'कालोतिल', 'कुश', 'पिण्डदान'],
    suggestedPrice: 1250,
    samagriList: ['सुपारी', 'जनै', 'धूप बत्ति', 'कपुर', 'केशरी', 'कुमकुम धूप', 'श्रीखण्ड', 'सेतो कपडा', 'घ्यू, मह', 'जौ तिल', 'मसला', 'अष्ट सुगन्ध'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'shraddha_pitri_tarpana',
      titleNepali: 'सोह्रश्राद्ध एवं पार्वण श्राद्ध सम्पूर्ण सामग्री सेट',
      subtitleNepali: 'पितृ तृप्ति, एकोदिष्ट, तीर्थ श्राद्ध एवं तर्पण-पिण्डदानका लागि १२ सामग्री',
      categoryNepali: 'श्राद्ध तथा पितृकर्म',
      samagriItems: ['सुपारी', 'जनै', 'धूप बत्ति', 'कपुर', 'केशरी', 'कुमकुम धूप', 'श्रीखण्ड', 'सेतो कपडा', 'घ्यू, मह', 'जौ तिल', 'मसला', 'अष्ट सुगन्ध'],
      theme: {
        bgSky: ['#27272A', '#3F3F46', '#18181B'],
        frameGold: '#FEF08A',
        accent: '#E4E4E7',
      },
      highlightBadge: 'शास्त्रीय १२ प्रकारका श्राद्ध सामग्री',
    }),
  },
  {
    id: 'ps_nitya_pitri_tarpana_pkg',
    nameNepali: 'नित्य पितृ तर्पण एवं तीर्थ श्राद्ध (गया/मुक्तिनाथ) सेट',
    nameEnglish: 'Daily Pitri Tarpana & Gaya Tirtha Kit',
    category: 'shraddha_pitri',
    categoryNameNepali: 'श्राद्ध तथा पितृकर्म',
    description: 'दैनिक पितृ तर्पण, अमावस्या (औंसी) तर्पण तथा गया-काशी तीर्थ श्राद्ध संकल्प सामग्री।',
    tags: ['तर्पण', 'पितृतर्पण', 'गयाश्राद्ध', 'मुक्तिनाथ', 'कुशापवित्री'],
    suggestedPrice: 950,
    samagriList: ['तामाको तर्पण अर्घ्यपात्र', 'कुशको पवित्री ३ थान', 'पहाडी कालो तिल', 'पहेंलो जौ', 'तुलसी काठ/दल', 'गङ्गाजल', 'सेतो जनै'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'shraddha_pitri_tarpana',
      titleNepali: 'नित्य पितृ तर्पण एवं तीर्थ श्राद्ध सेट',
      subtitleNepali: 'दैनिक तर्पण, औंसी तर्पण एवं गया-काशी तीर्थ संकल्प सामग्री',
      categoryNepali: 'श्राद्ध तथा पितृकर्म',
      samagriItems: ['तामाको तर्पण पात्र', 'कुशको पवित्री ३ थान', 'कालो तिल', 'पहेंलो जौ', 'तुलसी दल', 'गङ्गाजल', 'सेतो जनै'],
      theme: {
        bgSky: ['#334155', '#475569', '#1E293B'],
        frameGold: '#F8FAFC',
        accent: '#94A3B8',
      },
      highlightBadge: 'पितृ मुक्ति एवं नित्य तर्पण',
    }),
  },
  {
    id: 'ps_tri_pindi_narayan_bali',
    nameNepali: 'त्रिपिण्डी श्राद्ध एवं नारायणबलि अनुष्ठान सेट',
    nameEnglish: 'Tripindi Shraddha & Narayana Bali Karma Kit',
    category: 'shraddha_pitri',
    categoryNameNepali: 'श्राद्ध तथा पितृकर्म',
    description: 'पितृदोष, प्रेतबाधा मुक्ति, अपमृत्यु शान्ति तथा वंशवृद्धिका लागि त्रिपिण्डी श्राद्ध सामग्री।',
    tags: ['त्रिपिण्डी', 'नारायणबलि', 'नागबलि', 'पितृदोष', 'प्रेतमुक्ति'],
    suggestedPrice: 2200,
    samagriList: ['विष्णु प्रतिमा/यन्त्र', '३ प्रकारका पिण्ड सामग्री (जौ, तिल, सातु)', 'सेतो-पहेंलो-कालो वस्त्र', 'कुश', 'पञ्चामृत', 'हवन समिधा', 'घ्यू'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'shraddha_pitri_tarpana',
      titleNepali: 'त्रिपिण्डी श्राद्ध एवं नारायणबलि अनुष्ठान सेट',
      subtitleNepali: 'पितृदोष शमन, प्रेतबाधा मुक्ति एवं वंशवृद्धि त्रिपिण्डी सामग्री',
      categoryNepali: 'श्राद्ध तथा पितृकर्म',
      samagriItems: ['विष्णु यन्त्र', '३ पिण्ड सामग्री (जौ, तिल, सातु)', '३ रङ्गीन वस्त्र', 'कुश', 'पञ्चामृत', 'हवन समिधा', 'घ्यू'],
      theme: {
        bgSky: ['#1E1B4B', '#312E81', '#0F172A'],
        frameGold: '#FEF08A',
        accent: '#818CF8',
      },
      highlightBadge: 'पितृदोष एवं प्रेतमुक्ति अनुष्ठान',
    }),
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
    suggestedPrice: 1250,
    samagriList: ['शालिग्राम शिला/प्रतीक', 'पहेंलो रेशमी कपडा', 'तुलसी मंजरी', 'पञ्चामृत सामग्री', 'सपाद भक्षण (प्रसाद) सामग्री', 'सत्यनारायण पुस्तक', 'जौ-तिल', 'सुपारी', 'जनै', 'घ्यू'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'satyanarayan_banana_mandap',
      titleNepali: 'सत्यनारायण व्रतकथा पूजा सामग्री सम्पूर्ण सेट',
      subtitleNepali: 'पूर्णिमा एवं एकादशी सत्यनारायण कथा, पञ्चामृत एवं मण्डप सामग्री',
      categoryNepali: 'व्रत तथा पर्व',
      samagriItems: ['शालिग्राम प्रतीक', 'पहेंलो रेशमी कपडा', 'तुलसी मंजरी', 'पञ्चामृत सामग्री', 'सपाद भक्षण सामग्री', 'सत्यनारायण पुस्तक', 'जौ-तिल', 'सुपारी', 'जनै', 'घ्यू'],
      theme: {
        bgSky: ['#701A75', '#86198F', '#4A044E'],
        frameGold: '#FBCFE8',
        accent: '#F472B6',
      },
      highlightBadge: 'सम्पूर्ण सत्यनारायण व्रतकथा विधि',
    }),
  },
  {
    id: 'ps_durga_chandi_path_full',
    nameNepali: 'दुर्गा सप्तशती (चण्डी पाठ) एवं शतचण्डी अनुष्ठान सेट',
    nameEnglish: 'Durga Saptashati Chandi Path & Shatchandi Kit',
    category: 'vishesh_anushthan',
    categoryNameNepali: 'विशेष अनुष्ठान',
    description: 'बडादशैं, चैते दशैं, नवरात्र तथा मनोकामना सिद्धिका लागि चण्डी पाठ, नवार्ण मन्त्र र हवन सामग्री।',
    tags: ['चण्डीपाठ', 'दुर्गासप्तशती', 'दशैं', 'नवरात्र', 'शतचण्डी'],
    suggestedPrice: 2400,
    samagriList: ['दुर्गा सप्तशती ग्रन्थ', 'रातो चुनरी', 'अखण्ड ज्योति दियो', 'दुर्गा यन्त्र', 'हवन समिधा', 'शुद्ध घ्यू', 'जौ-तिल', 'कपुर', 'समिधा काठ', 'सर्वोषधी'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'durga_chandi_path',
      titleNepali: 'दुर्गा सप्तशती (चण्डी पाठ) अनुष्ठान सेट',
      subtitleNepali: 'नवरात्र दुर्गा पूजा, नवान्ह परायण, चण्डी हवन एवं देवी कृपा सामग्री',
      categoryNepali: 'विशेष अनुष्ठान',
      samagriItems: ['दुर्गा सप्तशती ग्रन्थ', 'रातो चुनरी', 'अखण्ड ज्योति दियो', 'दुर्गा यन्त्र', 'हवन समिधा', 'शुद्ध घ्यू', 'जौ-तिल', 'कपुर', 'समिधा काठ', 'सर्वोषधी'],
      theme: {
        bgSky: ['#831843', '#9D174D', '#500724'],
        frameGold: '#FECDD3',
        accent: '#FB7185',
      },
      highlightBadge: 'नवदुर्गा एवं शतचण्डी अनुष्ठान',
    }),
  },
  {
    id: 'ps_kuldevata_puja_pkg',
    nameNepali: 'कुलदेवता, कुलदेवी एवं देवाली पूजा सामग्री सेट',
    nameEnglish: 'Kuldevata & Kuldevi Devali Puja Package',
    category: 'kuldevata_puja',
    categoryNameNepali: 'कुलदेवता पूजा',
    description: 'कुलपूजा, देवाली, गोठ पूजा तथा वंश संरक्षणका लागि परम्परागत कुलदेवता पूजन सामग्री।',
    tags: ['कुलदेवता', 'कुलदेवी', 'देवाली', 'कुलपूजा', 'वंशसंरक्षण'],
    suggestedPrice: 1850,
    samagriList: ['त्रिशूल/खड्ग प्रतीक', 'धूप-दीप', 'अबीर-केशरी', 'घ्यू', 'अक्षता', 'रातो/सेतो ध्वजा', 'सुपारी', 'जनै', 'काँचो धागो', 'भोग/सगुन सामग्री'],
    imageUrl: createVedicCeremonyGraphicSvg({
      sceneType: 'kuldevata_devali_puja',
      titleNepali: 'कुलदेवता एवं कुलदेवी पूजा सामग्री सेट',
      subtitleNepali: 'वंश परम्परा, देवाली, कुल मन्दिर पूजन एवं कुलशान्ति सामग्री',
      categoryNepali: 'कुलदेवता पूजा',
      samagriItems: ['त्रिशूल/खड्ग प्रतीक', 'धूप-दीप', 'अबीर-केशरी', 'घ्यू', 'अक्षता', 'रातो/सेतो ध्वजा', 'सुपारी', 'जनै', 'काँचो धागो', 'सगुन सामग्री'],
      theme: {
        bgSky: ['#7C2D12', '#9A3412', '#431407'],
        frameGold: '#FED7AA',
        accent: '#FB923C',
      },
      highlightBadge: 'कुल परम्परा एवं वंश शान्ति',
    }),
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

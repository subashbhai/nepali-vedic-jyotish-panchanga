// ============================================================================
// बालानन्द वैदिक पसल - पूजा सामग्री तथा वैदिक उत्पादन ग्यालरी इन्जिन (50+ Items)
// (Comprehensive 50+ Puja Samagri & Vedic Items Image Gallery Engine)
// ============================================================================

export type PujaGalleryCategory =
  | 'puja_package'      // कर्मकाण्ड प्याकेज
  | 'havan_samagri'     // हवन तथा यज्ञ सामग्री
  | 'utensils_patra'    // शंख, घण्टी तथा पूजा पात्र
  | 'fragrance_dhoop'   // सुगन्ध, धूप, चन्दन र अबीर
  | 'ghee_gau'          // घ्यू, तेल तथा पञ्चगव्य
  | 'rudraksha_ratna'   // रुद्राक्ष, स्फटिक तथा यन्त्र
  | 'books_shastra'     // धार्मिक ग्रन्थ तथा पञ्चाङ्ग
  | 'cloth_janeu';      // वस्त्र, जनै तथा धार्मिक माला

export interface PujaGalleryItem {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  category: PujaGalleryCategory;
  categoryNameNepali: string;
  description: string;
  tags: string[];
  imageUrl: string;
  suggestedPrice?: number;
}

export const PUJA_GALLERY_CATEGORIES: Array<{ key: PujaGalleryCategory; label: string; icon: string }> = [
  { key: 'puja_package', label: 'कर्मकाण्ड प्याकेज (Packages)', icon: '📦' },
  { key: 'havan_samagri', label: 'हवन तथा यज्ञ सामग्री', icon: '🔥' },
  { key: 'utensils_patra', label: 'शंख, घण्टी तथा पूजा पात्र', icon: '🪔' },
  { key: 'fragrance_dhoop', label: 'धूप, चन्दन र अबीर', icon: '🌸' },
  { key: 'ghee_gau', label: 'घ्यू, तेल तथा पञ्चगव्य', icon: '🧈' },
  { key: 'rudraksha_ratna', label: 'रुद्राक्ष, स्फटिक र यन्त्र', icon: '📿' },
  { key: 'books_shastra', label: 'धार्मिक ग्रन्थ र पञ्चाङ्ग', icon: '📖' },
  { key: 'cloth_janeu', label: 'वस्त्र, जनै र धार्मिक माला', icon: '🧵' },
];

/**
 * Programmatic SVG generator that produces crisp, spiritual Vedic item artwork
 */
function createVedicItemSvg(options: {
  bgGradient: [string, string, string]; // Top, Mid, Bottom colors
  primarySymbol: string;                // Large icon/symbol/graphic representation
  subSymbol?: string;
  titleNepali: string;
  categoryNepali: string;
  accentColor: string;
  borderColor: string;
  decorativePattern?: string;
}): string {
  const {
    bgGradient,
    primarySymbol,
    subSymbol = 'ॐ',
    titleNepali,
    categoryNepali,
    accentColor,
    borderColor
  } = options;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}"/>
      <stop offset="50%" stop-color="${bgGradient[1]}"/>
      <stop offset="100%" stop-color="${bgGradient[2]}"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#FDE68A"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <radialGradient id="haloGrad" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#F59E0B" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bgGrad)"/>

  <!-- Halo / Aura glow -->
  <circle cx="400" cy="270" r="260" fill="url(#haloGrad)"/>

  <!-- Traditional Ornamental Border Frame -->
  <rect x="24" y="24" width="752" height="552" rx="20" fill="none" stroke="${borderColor}" stroke-width="3" stroke-dasharray="14 8" opacity="0.6"/>
  <rect x="34" y="34" width="732" height="532" rx="16" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>

  <!-- Corner Flourishes -->
  <g fill="${accentColor}" opacity="0.8">
    <!-- Top-Left -->
    <path d="M42 62 C42 42, 62 42, 62 42 L62 48 C48 48, 48 62, 48 62 Z"/>
    <circle cx="56" cy="56" r="4"/>
    <!-- Top-Right -->
    <path d="M758 62 C758 42, 738 42, 738 42 L738 48 C752 48, 752 62, 752 62 Z"/>
    <circle cx="744" cy="56" r="4"/>
    <!-- Bottom-Left -->
    <path d="M42 538 C42 558, 62 558, 62 558 L62 552 C48 552, 48 538, 48 538 Z"/>
    <circle cx="56" cy="544" r="4"/>
    <!-- Bottom-Right -->
    <path d="M758 538 C758 558, 738 558, 738 558 L738 552 C752 552, 752 538, 752 538 Z"/>
    <circle cx="744" cy="544" r="4"/>
  </g>

  <!-- Background Mandala Wheel Subtle Motif -->
  <g transform="translate(400, 260)" stroke="${accentColor}" stroke-width="1.5" fill="none" opacity="0.25">
    <circle r="180" stroke-dasharray="6 6"/>
    <circle r="140"/>
    <circle r="100"/>
    <circle r="60"/>
    <line x1="-190" y1="0" x2="190" y2="0"/>
    <line x1="0" y1="-190" x2="0" y2="190"/>
    <line x1="-134" y1="-134" x2="134" y2="134"/>
    <line x1="-134" y1="134" x2="134" y2="-134"/>
  </g>

  <!-- Central Altar / Product Pedestal Platform -->
  <ellipse cx="400" cy="380" rx="280" ry="40" fill="#000000" opacity="0.4" filter="url(#shadow)"/>
  <ellipse cx="400" cy="375" rx="250" ry="32" fill="${accentColor}" opacity="0.3"/>
  <ellipse cx="400" cy="370" rx="230" ry="24" fill="url(#goldGrad)" opacity="0.8"/>

  <!-- Top Category Chip -->
  <g transform="translate(400, 75)">
    <rect x="-140" y="-18" width="280" height="36" rx="18" fill="#1C1917" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="0" y="5" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FDE68A" text-anchor="middle" letter-spacing="1">
      🇳🇵 बालानन्द वैदिक भण्डार • ${categoryNepali}
    </text>
  </g>

  <!-- Main Primary Sacred Symbol / Illustration -->
  <g transform="translate(400, 260)" filter="url(#shadow)">
    <circle r="110" fill="#1C1917" stroke="url(#goldGrad)" stroke-width="4"/>
    <circle r="98" fill="${bgGradient[1]}" stroke="${borderColor}" stroke-width="1.5"/>
    <text x="0" y="32" font-family="'Noto Sans Devanagari', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif" font-size="88" text-anchor="middle" fill="#FFFFFF">
      ${primarySymbol}
    </text>
  </g>

  <!-- Sub-Badge Symbol (Top Right of Badge) -->
  <g transform="translate(490, 180)">
    <circle r="26" fill="#7A1C1C" stroke="#FDE68A" stroke-width="2" filter="url(#shadow)"/>
    <text x="0" y="8" font-family="'Noto Sans Devanagari', sans-serif" font-size="20" font-weight="bold" fill="#FDE68A" text-anchor="middle">
      ${subSymbol}
    </text>
  </g>

  <!-- Bottom Title Banner Placard -->
  <g transform="translate(400, 485)" filter="url(#shadow)">
    <!-- Banner Shadow & Base -->
    <rect x="-310" y="-38" width="620" height="76" rx="16" fill="#1C1917" stroke="url(#goldGrad)" stroke-width="2"/>
    <rect x="-304" y="-32" width="608" height="64" rx="12" fill="#292524" opacity="0.9"/>
    
    <!-- Title Text -->
    <text x="0" y="-4" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${titleNepali}
    </text>
    <text x="0" y="20" font-family="Arial, sans-serif" font-size="13" fill="#FDE68A" text-anchor="middle" letter-spacing="0.5">
      ★ १००% शुद्ध, वैदिक विधि प्रमाणित तथा प्रामाणिक सामग्री ★
    </text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// ५० वटा सम्पूर्ण प्रामाणिक पूजा तथा वैदिक सामग्रीहरूको आधिकारिक ग्यालरी
// ============================================================================
export const PUJA_SAMAGRI_GALLERY_DATABASE: PujaGalleryItem[] = [
  // =========================================================================
  // १. कर्मकाण्ड प्याकेज (१० वटा मुख्य प्याकेजहरू)
  // =========================================================================
  {
    id: 'ps_grihapravesh',
    nameNepali: 'गृहप्रवेश पूजा सामग्री सम्पूर्ण सेट',
    nameEnglish: 'Griha Pravesh Puja Complete Set Package',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'गृहप्रवेश तथा वास्तु पूजाका लागि आवश्यक सम्पूर्ण ४२ प्रकारका पूजा सामग्रीहरूको तयारी सेट।',
    tags: ['गृहप्रवेश', 'वास्तु', 'कलश', 'हवन', 'नयाँ घर', 'प्याकेज'],
    suggestedPrice: 2200,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#7A1C1C', '#991B1B', '#450A0A'],
      primarySymbol: '🏺', // Kalash
      subSymbol: '🏠',
      titleNepali: 'गृहप्रवेश पूजा सामग्री सेट',
      categoryNepali: 'कर्मकाण्ड प्याकेज',
      accentColor: '#F59E0B',
      borderColor: '#FDE68A',
    }),
  },
  {
    id: 'ps_vivah_kit',
    nameNepali: 'विवाह पूजा सामग्री सम्पूर्ण सेट',
    nameEnglish: 'Complete Vedic Marriage Ritual Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'सनातन वैदिक विवाह संस्कारका लागि चाहिने सम्पूर्ण लग्नमण्डप, स्वयंवर, सिन्दूर र हवन सामग्री सेट।',
    tags: ['विवाह', 'लग्न', 'स्वयंवर', 'सिन्दूर', 'लगनगाँठो', 'विवाह सेट'],
    suggestedPrice: 3400,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#831843', '#9D174D', '#500724'],
      primarySymbol: '💍',
      subSymbol: '🚩',
      titleNepali: 'विवाह पूजा सामग्री सम्पूर्ण सेट',
      categoryNepali: 'विवाह संस्कार',
      accentColor: '#F43F5E',
      borderColor: '#FDA4AF',
    }),
  },
  {
    id: 'ps_bartabandha',
    nameNepali: 'व्रतबन्ध तथा उपनयन पूजा सामग्री सेट',
    nameEnglish: 'Bartabandha & Upanayan Ritual Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'बटुकको व्रतबन्ध संस्कारका लागि मृगछाला, पलाँसको दण्ड, जनै, गेरु वस्त्र, मेखला र हवन सामग्री।',
    tags: ['व्रतबन्ध', 'उपनयन', 'बटुक', 'जनै', 'दण्ड', 'गायत्री'],
    suggestedPrice: 1850,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#78350F', '#B45309', '#451A03'],
      primarySymbol: '📜',
      subSymbol: '🕉️',
      titleNepali: 'व्रतबन्ध उपनयन पूजा सामग्री सेट',
      categoryNepali: 'उपनयन संस्कार',
      accentColor: '#FBBF24',
      borderColor: '#FDE68A',
    }),
  },
  {
    id: 'ps_rudrabhishek',
    nameNepali: 'रुद्राभिषेक तथा शिवपूजा सामग्री Package',
    nameEnglish: 'Rudrabhishek & Shiva Puja Samagri Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'एकादश रुद्री, पार्थिव शिवलिङ्ग पूजन र रुद्राभिषेकका लागि सम्पूर्ण पञ्चामृत, बेलपत्र, भस्म र पूजन सामग्री।',
    tags: ['रुद्राभिषेक', 'शिवपूजा', 'रुद्री', 'बेलपत्र', 'गंगाजल', 'भस्म'],
    suggestedPrice: 1250,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#1E3A8A', '#1E40AF', '#172554'],
      primarySymbol: '🔱',
      subSymbol: '🌿',
      titleNepali: 'रुद्राभिषेक तथा शिवपूजा सामग्री',
      categoryNepali: 'शिव आराधना',
      accentColor: '#60A5FA',
      borderColor: '#93C5FD',
    }),
  },
  {
    id: 'ps_mahamrityunjaya',
    nameNepali: 'महामृत्युञ्जय अनुष्ठान सामग्री सेट',
    nameEnglish: 'Mahamrityunjaya Anushthan Samagri Set',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'आरोग्य, आयुवृद्धि तथा ग्रहपीडा निवारण महामृत्युञ्जय जप एवं हवनका लागि सम्पूर्ण सामग्री।',
    tags: ['महामृत्युञ्जय', 'आरोग्य', 'अनुष्ठान', 'हवन', 'शान्ति'],
    suggestedPrice: 1650,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#312E81', '#3730A3', '#1E1B4B'],
      primarySymbol: '🕉️',
      subSymbol: '✨',
      titleNepali: 'महामृत्युञ्जय अनुष्ठान सामग्री',
      categoryNepali: 'आरोग्य अनुष्ठान',
      accentColor: '#A5B4FC',
      borderColor: '#C7D2FE',
    }),
  },
  {
    id: 'ps_satyanarayan',
    nameNepali: 'सत्यनारायण व्रतकथा पूजा सामग्री सेट',
    nameEnglish: 'Satyanarayan Puja Samagri Full Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'पूर्णिमा तथा मासिक सत्यनारायण कथा, पञ्चामृत, तुलसी, सपाद भक्षण (प्रसाद) तथा मण्डप सामग्री।',
    tags: ['सत्यनारायण', 'कथा', 'पूर्णिमा', 'पञ्चामृत', 'विष्णु'],
    suggestedPrice: 950,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#701A75', '#86198F', '#4A044E'],
      primarySymbol: '🪷',
      subSymbol: '🚩',
      titleNepali: 'सत्यनारायण व्रतकथा सामग्री सेट',
      categoryNepali: 'विष्णु आराधना',
      accentColor: '#F472B6',
      borderColor: '#FBCFE8',
    }),
  },
  {
    id: 'ps_navagraha_shanti',
    nameNepali: 'नवग्रह शान्ति तथा ग्रहदोष निवारण सेट',
    nameEnglish: 'Navagraha Shanti & Graha Dosha Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'सूर्यदेखि केतुसम्म ९ वटै ग्रहहरूको समिधा काठ, नवग्रह अन्न, नवग्रह वस्त्र र हवन सामग्री।',
    tags: ['नवग्रह', 'शान्ति', 'दोषनिवारण', 'ग्रह', 'हवनकाठ'],
    suggestedPrice: 1450,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#14532D', '#166534', '#052E16'],
      primarySymbol: '☀️',
      subSymbol: '🪐',
      titleNepali: 'नवग्रह शान्ति पूजा सामग्री सेट',
      categoryNepali: 'ग्रह शान्ति',
      accentColor: '#4ADE80',
      borderColor: '#86EFAC',
    }),
  },
  {
    id: 'ps_vastu_shanti',
    nameNepali: 'वास्तु शान्ति तथा भूमि पूजन सेट',
    nameEnglish: 'Vastu Shanti & Bhumi Pujan Samagri Set',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'घडेरी जग हाल्दा, पिल्लर पूजा, शिलान्यास तथा वास्तुदोष निवारणका लागि सम्पूर्ण वैदिक सामग्री।',
    tags: ['वास्तु', 'शिलान्यास', 'भूमिपूजन', 'जगपूजा', 'पिल्लर'],
    suggestedPrice: 2100,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#854D0E', '#A16207', '#422006'],
      primarySymbol: '🧭',
      subSymbol: '🧱',
      titleNepali: 'वास्तु शान्ति तथा भूमि पूजन सेट',
      categoryNepali: 'वास्तु कर्मकाण्ड',
      accentColor: '#FACC15',
      borderColor: '#FEF08A',
    }),
  },
  {
    id: 'ps_shraddha_pitri',
    nameNepali: 'पितृ कार्य तथा श्राद्ध पूजा सामग्री सेट',
    nameEnglish: 'Pitri Shraddha Ritual Samagri Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'सोह्र श्राद्ध, एकोद्दिष्ट तथा पार्वण श्राद्धका लागि कुश, कालो तिल, जौ, पिण्डपात्र र तर्पण सामग्री।',
    tags: ['श्राद्ध', 'पितृ', 'पिण्डदान', 'तर्पण', 'कालोतिल', 'कुश'],
    suggestedPrice: 850,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#292524', '#44403C', '#1C1917'],
      primarySymbol: '🌾',
      subSymbol: '🙏',
      titleNepali: 'पितृ कार्य तथा श्राद्ध पूजा सामग्री',
      categoryNepali: 'पितृ संस्कार',
      accentColor: '#D6D3D1',
      borderColor: '#E7E5E4',
    }),
  },
  {
    id: 'ps_pasni_kit',
    nameNepali: 'पास्नी (अन्नप्राशन) संस्कार पूजा सामग्री',
    nameEnglish: 'Pasni / Annaprashan Ceremony Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'शिशुको पास्नीका लागि चाँदीको चम्चा, कचौरा, रातो मखमली कपडा, खीर सामग्री र गणेश पूजा सेट।',
    tags: ['पास्नी', 'अन्नप्राशन', 'शिशु', 'खीर', 'चाँदीको कचौरा'],
    suggestedPrice: 1750,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#BE185D', '#DB2777', '#831843'],
      primarySymbol: '🥣',
      subSymbol: '👶',
      titleNepali: 'पास्नी (अन्नप्राशन) पूजा सामग्री',
      categoryNepali: 'बाल संस्कार',
      accentColor: '#F472B6',
      borderColor: '#FCE7F3',
    }),
  },

  // =========================================================================
  // २. हवन तथा यज्ञ सामग्री (७ वटा)
  // =========================================================================
  {
    id: 'ps_havan_samidha',
    nameNepali: 'अष्टगन्ध हवन समिधा काठ (५ केजी प्याक)',
    nameEnglish: 'Havan Samidha Sacred Wood Pack (5kg)',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन तथा यज्ञ सामग्री',
    description: 'पिपल, समी, आँक, पलास र खयरको सुकेको शुद्ध समिधा काठ हवनका लागि।',
    tags: ['हवनकाठ', 'समिधा', 'यज्ञ', 'पिपल', 'पलास'],
    suggestedPrice: 450,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#78350F', '#92400E', '#451A03'],
      primarySymbol: '🪵',
      subSymbol: '🔥',
      titleNepali: 'अष्टगन्ध हवन समिधा काठ',
      categoryNepali: 'हवन सामग्री',
      accentColor: '#F59E0B',
      borderColor: '#FDE68A',
    }),
  },
  {
    id: 'ps_navagraha_wood',
    nameNepali: 'विशेष नवग्रह हवन काठ सेट (९ ग्रह समिधा)',
    nameEnglish: 'Navagraha 9 Planet Sacred Wood Set',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन तथा यज्ञ सामग्री',
    description: '९ वटै ग्रहहरूको वैदिक विधान अनुसारको अलग्गै समिधा काठ प्याकेट।',
    tags: ['नवग्रहकाठ', 'समिधा', 'ग्रहशान्ति'],
    suggestedPrice: 350,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#15803D', '#166534', '#14532D'],
      primarySymbol: '🌿',
      subSymbol: '☀️',
      titleNepali: 'विशेष नवग्रह हवन काठ सेट',
      categoryNepali: 'हवन सामग्री',
      accentColor: '#86EFAC',
      borderColor: '#BBF7D0',
    }),
  },
  {
    id: 'ps_guggul_loban',
    nameNepali: 'शुद्ध हिमाली गुग्गुल र लोबान (५०० ग्राम)',
    nameEnglish: 'Pure Himalayan Guggul & Loban',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन तथा यज्ञ सामग्री',
    description: 'हवन तथा दैनिक घर धुपिङ्का लागि नकारात्मक ऊर्जा हटाउने शुद्ध गुग्गुल र लोबान।',
    tags: ['गुग्गुल', 'लोबान', 'धूप', 'हवन'],
    suggestedPrice: 550,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#451A03', '#78350F', '#292524'],
      primarySymbol: '🪨',
      subSymbol: '💨',
      titleNepali: 'शुद्ध हिमाली गुग्गुल र लोबान',
      categoryNepali: 'हवन सुगन्ध',
      accentColor: '#D97706',
      borderColor: '#FCD34D',
    }),
  },
  {
    id: 'ps_havan_kunda_copper',
    nameNepali: 'तामाको शुद्ध हवन कुण्ड (Copper Havan Kunda)',
    nameEnglish: 'Pure Copper Vedic Havan Kunda',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन तथा यज्ञ सामग्री',
    description: 'दैनिक तथा विशेष अनुष्ठानका लागि ३ तहको शुद्ध तामाको वैदिक हवन कुण्ड।',
    tags: ['हवनकुण्ड', 'तामा', 'यज्ञकुण्ड', 'हवन'],
    suggestedPrice: 1800,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#9A3412', '#C2410C', '#7C2D12'],
      primarySymbol: '🔥',
      subSymbol: '🏺',
      titleNepali: 'तामाको शुद्ध हवन कुण्ड',
      categoryNepali: 'यज्ञ सामग्री',
      accentColor: '#FB923C',
      borderColor: '#FFEDD5',
    }),
  },
  {
    id: 'ps_havan_sruva_wood',
    nameNepali: 'हवन काठको स्रुवा र स्रुच सेट (Wooden Ladles)',
    nameEnglish: 'Vedic Wooden Havan Ladles Sruva & Sruch',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन तथा यज्ञ सामग्री',
    description: 'विकिर र घृत आहुतिका लागि शास्त्रोक्त काठबाट निर्मित शुद्ध स्रुवा र स्रुच जोडी।',
    tags: ['स्रुवा', 'स्रुच', 'घृतआहुति', 'हवनकाठ'],
    suggestedPrice: 480,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#854D0E', '#A16207', '#713F12'],
      primarySymbol: '🥄',
      subSymbol: '✨',
      titleNepali: 'हवन काठको स्रुवा र स्रुच सेट',
      categoryNepali: 'यज्ञ सामग्री',
      accentColor: '#FACC15',
      borderColor: '#FEF08A',
    }),
  },
  {
    id: 'ps_jau_til_sarvaushadhi',
    nameNepali: 'जौ, कालो तिल र सर्वोषधि प्याकेट',
    nameEnglish: 'Jau, Black Til & Sarvaushadhi Pack',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन तथा यज्ञ सामग्री',
    description: 'पूजा, तर्पण तथा हवनका लागि शुद्ध पहेँलो जौ, कालो तिल र १०८ प्रकारका जडीबुटी सर्वोषधि।',
    tags: ['जौ', 'तिल', 'सर्वोषधि', 'पूजा', 'हवन'],
    suggestedPrice: 280,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#3F3F46', '#52525B', '#27272A'],
      primarySymbol: '🌾',
      subSymbol: '🌱',
      titleNepali: 'जौ, कालो तिल र सर्वोषधि',
      categoryNepali: 'पूजन द्रव्य',
      accentColor: '#E4E4E7',
      borderColor: '#F4F4F5',
    }),
  },
  {
    id: 'ps_pancharatna_sapta_dhanya',
    nameNepali: 'पञ्चरत्न र सप्तधान्य सेट (Pancha Ratna)',
    nameEnglish: 'Pancha Ratna & Sapta Dhanya Kit',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन तथा यज्ञ सामग्री',
    description: 'कलश स्थापन, जग पूजा तथा मण्डप पूजनका लागि ५ रत्न र ७ प्रकारका पवित्र अन्न।',
    tags: ['पञ्चरत्न', 'सप्तधान्य', 'कलश', 'जगपूजा'],
    suggestedPrice: 320,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#831843', '#9D174D', '#500724'],
      primarySymbol: '💎',
      subSymbol: '🌾',
      titleNepali: 'पञ्चरत्न र सप्तधान्य सेट',
      categoryNepali: 'पूजन द्रव्य',
      accentColor: '#F43F5E',
      borderColor: '#FECDD3',
    }),
  },

  // =========================================================================
  // ३. शंख, घण्टी तथा पूजा पात्र (७ वटा)
  // =========================================================================
  {
    id: 'ps_dakshinavarti_shankha',
    nameNepali: 'प्राकृतिक दक्षिणावर्ती शंख (Natural Shankha)',
    nameEnglish: 'Natural Dakshinavarti Lakshmi Shankha',
    category: 'utensils_patra',
    categoryNameNepali: 'शंख, घण्टी तथा पूजा पात्र',
    description: 'लक्ष्मी कृपा तथा वास्तुदोष निवारणका लागि जल तर्पण योग्य पवित्र दक्षिणावर्ती शंख।',
    tags: ['शंख', 'दक्षिणावर्ती', 'लक्ष्मी', 'पूजापात्र'],
    suggestedPrice: 2400,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#0F766E', '#115E59', '#134E4A'],
      primarySymbol: '🐚',
      subSymbol: '💧',
      titleNepali: 'प्राकृतिक दक्षिणावर्ती शंख',
      categoryNepali: 'पवित्र शंख',
      accentColor: '#2DD4BF',
      borderColor: '#99F6E4',
    }),
  },
  {
    id: 'ps_garuda_bell',
    nameNepali: 'काँसको शुद्ध गरुड घण्टी (Brass Garuda Bell)',
    nameEnglish: 'Pure Brass Garuda Puja Bell',
    category: 'utensils_patra',
    categoryNameNepali: 'शंख, घण्टी तथा पूजा पात्र',
    description: 'दिव्य ध्वनिसहितको हस्तनिर्मित काँस/पित्तलको गरुड आकृति युक्त पूजा घण्टी।',
    tags: ['घण्टी', 'गरुड', 'काँस', 'पित्तल', 'पूजा'],
    suggestedPrice: 650,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#B45309', '#D97706', '#78350F'],
      primarySymbol: '🔔',
      subSymbol: '🦅',
      titleNepali: 'काँसको शुद्ध गरुड घण्टी',
      categoryNepali: 'पूजा पात्र',
      accentColor: '#FDE68A',
      borderColor: '#FEF3C7',
    }),
  },
  {
    id: 'ps_copper_kalash_panchapatra',
    nameNepali: 'तामाको कलश, पञ्चपात्र र आचमनी सेट',
    nameEnglish: 'Copper Kalash & Panchapatra Set',
    category: 'utensils_patra',
    categoryNameNepali: 'शंख, घण्टी तथा पूजा पात्र',
    description: 'शुद्ध तामाबाट बनेको पञ्चपात्र, अर्घ्यपात्र, आचमनी र पूर्ण कलश सेट।',
    tags: ['कलश', 'पञ्चपात्र', 'आचमनी', 'तामा'],
    suggestedPrice: 850,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#9A3412', '#C2410C', '#7C2D12'],
      primarySymbol: '🏺',
      subSymbol: '🥄',
      titleNepali: 'तामाको कलश र पञ्चपात्र सेट',
      categoryNepali: 'पूजा पात्र',
      accentColor: '#FDBA74',
      borderColor: '#FFEDD5',
    }),
  },
  {
    id: 'ps_pancha_aarti_diya',
    nameNepali: 'पित्तलको पञ्चारती दीप (Brass 5-Wick Aarti)',
    nameEnglish: 'Brass Pancha Aarti 5-Lamp Stand',
    category: 'utensils_patra',
    categoryNameNepali: 'शंख, घण्टी तथा पूजा पात्र',
    description: 'मन्दिर तथा दैनिक सन्ध्या आरतीका लागि ५ मुखे शुद्ध पित्तलको पञ्चारती दीप।',
    tags: ['आरती', 'पञ्चारती', 'दीप', 'पित्तल'],
    suggestedPrice: 750,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#A16207', '#CA8A04', '#713F12'],
      primarySymbol: '🪔',
      subSymbol: '✨',
      titleNepali: 'पित्तलको पञ्चारती दीप',
      categoryNepali: 'आरती दीप',
      accentColor: '#FDE047',
      borderColor: '#FEF9C3',
    }),
  },
  {
    id: 'ps_akhanda_jyoti_diya',
    nameNepali: 'सिसाको कभरसहितको अखण्ड ज्योति दिया',
    nameEnglish: 'Akhanda Jyoti Brass Diya with Glass Cover',
    category: 'utensils_patra',
    categoryNameNepali: 'शंख, घण्टी तथा पूजा पात्र',
    description: 'नवरात्र, अनुष्ठान तथा अखण्ड दीप बाल्न सिसाको हावा छेक्ने कभर भएको सुरक्षित दिया।',
    tags: ['अखण्डज्योति', 'दिया', 'सिसा', 'नवरात्र'],
    suggestedPrice: 950,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#C2410C', '#EA580C', '#9A3412'],
      primarySymbol: '🕯️',
      subSymbol: '🛡️',
      titleNepali: 'अखण्ड ज्योति सुरक्षित दिया',
      categoryNepali: 'दीप पात्र',
      accentColor: '#FED7AA',
      borderColor: '#FFF7ED',
    }),
  },
  {
    id: 'ps_shaligram_sila',
    nameNepali: 'प्राकृतिक गण्डकी शालिग्राम शिला',
    nameEnglish: 'Original Gandaki River Shaligram Sila',
    category: 'utensils_patra',
    categoryNameNepali: 'शंख, घण्टी तथा पूजा पात्र',
    description: 'कालीगण्डकीको पवित्र जलबाट प्राप्त चक्र अंकित प्रामाणिक शालिग्राम शिला।',
    tags: ['शालिग्राम', 'कालीगण्डकी', 'विष्णु', 'शिला'],
    suggestedPrice: 3500,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#18181B', '#27272A', '#09090B'],
      primarySymbol: '⚫',
      subSymbol: '🕉️',
      titleNepali: 'प्राकृतिक गण्डकी शालिग्राम शिला',
      categoryNepali: 'पवित्र शिला',
      accentColor: '#A1A1AA',
      borderColor: '#E4E4E7',
    }),
  },
  {
    id: 'ps_silver_arghya_patra',
    nameNepali: 'चाँदीको शुद्ध अर्घ्यपात्र र आचमनी',
    nameEnglish: 'Pure Silver Arghya Patra & Spoon',
    category: 'utensils_patra',
    categoryNameNepali: 'शंख, घण्टी तथा पूजा पात्र',
    description: 'सूर्य अर्घ्य, देव तर्पण तथा भगवानको अभिषेकका लागि शुद्ध चाँदीको अर्घ्यपात्र।',
    tags: ['चाँदी', 'अर्घ्यपात्र', 'आचमनी', 'सूर्यअर्घ्य'],
    suggestedPrice: 4200,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#475569', '#64748B', '#334155'],
      primarySymbol: '🥄',
      subSymbol: '☀️',
      titleNepali: 'चाँदीको शुद्ध अर्घ्यपात्र',
      categoryNepali: 'चाँदी पात्र',
      accentColor: '#CBD5E1',
      borderColor: '#F1F5F9',
    }),
  },

  // =========================================================================
  // ४. सुगन्ध, धूप, चन्दन र अबीर (६ वटा)
  // =========================================================================
  {
    id: 'ps_kasturi_devdaru_agarbatti',
    nameNepali: 'प्राकृतिक कस्तुरी र देवदारु अगरबत्ती (प्रिमियम)',
    nameEnglish: 'Pure Kasturi & Devdaru Incense Sticks',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप, चन्दन र अबीर',
    description: 'प्राकृतिक जडीबुटी, देवदारु र कस्तुरी सुगन्धयुक्त धूवाँरहित शुद्ध अगरबत्ती।',
    tags: ['अगरबत्ती', 'कस्तुरी', 'देवदारु', 'धूप'],
    suggestedPrice: 175,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#831843', '#9D174D', '#500724'],
      primarySymbol: '🌸',
      subSymbol: '💨',
      titleNepali: 'कस्तुरी र देवदारु अगरबत्ती',
      categoryNepali: 'वैदिक सुगन्ध',
      accentColor: '#F472B6',
      borderColor: '#FCE7F3',
    }),
  },
  {
    id: 'ps_rakta_shweta_chandan',
    nameNepali: 'रक्त चन्दन र श्वेत चन्दन काठ / धुलो',
    nameEnglish: 'Pure Red & White Sandalwood Stick/Powder',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप, चन्दन र अबीर',
    description: 'भगवानको तिलक तथा पूजनका लागि प्रामाणिक रातो र सेतो चन्दन काठ एवं सिलौटो।',
    tags: ['चन्दन', 'रक्तचन्दन', 'श्वेतचन्दन', 'तिलक'],
    suggestedPrice: 650,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#991B1B', '#B91C1C', '#7F1D1D'],
      primarySymbol: '🪵',
      subSymbol: '🔴',
      titleNepali: 'रक्त चन्दन र श्वेत चन्दन काठ',
      categoryNepali: 'तिलक द्रव्य',
      accentColor: '#FCA5A5',
      borderColor: '#FEE2E2',
    }),
  },
  {
    id: 'ps_kumkum_sindur_abir',
    nameNepali: 'अष्टगन्ध कुङ्कुम, सिन्दूर, केसरी र अबीर सेट',
    nameEnglish: 'Ashtagandha Kumkum, Sindur & Abir Kit',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप, चन्दन र अबीर',
    description: 'देवी-देवता पूजन, नवरात्र तथा संस्कारका लागि शुद्ध रासायनिकरहित सिन्दूर र अबीर।',
    tags: ['सिन्दूर', 'कुङ्कुम', 'केसरी', 'अबीर'],
    suggestedPrice: 220,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#9F1239', '#BE123C', '#881337'],
      primarySymbol: '🔴',
      subSymbol: '🌺',
      titleNepali: 'कुङ्कुम, सिन्दूर र अबीर सेट',
      categoryNepali: 'पूजन द्रव्य',
      accentColor: '#FDA4AF',
      borderColor: '#FFE4E6',
    }),
  },
  {
    id: 'ps_shiva_bhasma_vibhuti',
    nameNepali: 'शुद्ध शिव विभूति भस्म (Sacred Bhasma)',
    nameEnglish: 'Pure Shiva Vibhuti Bhasma Powder',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप, चन्दन र अबीर',
    description: 'गाईको गोबर र जडीबुटीबाट विधिवत् तयार पारिएको त्रिपुण्ड्र धारण गर्ने शुद्ध भस्म।',
    tags: ['भस्म', 'विभूति', 'शिव', 'त्रिपुण्ड्र'],
    suggestedPrice: 150,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#334155', '#475569', '#1E293B'],
      primarySymbol: '⚪',
      subSymbol: '🔱',
      titleNepali: 'शुद्ध शिव विभूति भस्म',
      categoryNepali: 'पवित्र भस्म',
      accentColor: '#94A3B8',
      borderColor: '#E2E8F0',
    }),
  },
  {
    id: 'ps_bhimseni_camphor',
    nameNepali: 'भीमसेनी शुद्ध प्राकृतिक कपूर (Bhimseni Camphor)',
    nameEnglish: 'Original Bhimseni Natural Camphor (250g)',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप, चन्दन र अबीर',
    description: 'आरती तथा हवनका लागि कालो नहुने, औषधीय गुणयुक्त १००% शुद्ध भीमसेनी कपूर।',
    tags: ['कपूर', 'भीमसेनी', 'आरती', 'हवन'],
    suggestedPrice: 380,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#047857', '#059669', '#064E3B'],
      primarySymbol: '🧊',
      subSymbol: '✨',
      titleNepali: 'भीमसेनी शुद्ध प्राकृतिक कपूर',
      categoryNepali: 'आरती द्रव्य',
      accentColor: '#6EE7B7',
      borderColor: '#A7F3D0',
    }),
  },
  {
    id: 'ps_divine_attar',
    nameNepali: 'गुलाब, मोगरा र चमेली दिव्य पूजा अत्तर',
    nameEnglish: 'Pure Divine Puja Attar / Natural Fragrance',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप, चन्दन र अबीर',
    description: 'ठाकुरजी तथा देवी-देवताको स्नान र वस्त्र सुवासित गर्न अर्पण गरिने प्राकृतिक अत्तर।',
    tags: ['अत्तर', 'सुगन्ध', 'गुलाब', 'पूजाअत्तर'],
    suggestedPrice: 290,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#701A75', '#86198F', '#4A044E'],
      primarySymbol: '🧪',
      subSymbol: '🌹',
      titleNepali: 'दिव्य पूजा अत्तर (Attar)',
      categoryNepali: 'वैदिक सुगन्ध',
      accentColor: '#F472B6',
      borderColor: '#FCE7F3',
    }),
  },

  // =========================================================================
  // ५. घ्यू, तेल तथा पञ्चगव्य (४ वटा)
  // =========================================================================
  {
    id: 'ps_himalayan_cow_ghee',
    nameNepali: 'हिमाली शुद्ध गाईको घ्यू (Pure Organic Cow Ghee)',
    nameEnglish: 'Pure Organic Himalayan Cow Ghee (1 Litre)',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू, तेल तथा पञ्चगव्य',
    description: 'पूजा, आरती तथा यज्ञ हवनका लागि प्रयोग गरिने १००% शुद्ध अर्गानिक गाईको घ्यू।',
    tags: ['घ्यू', 'गाईकोघ्यू', 'हवन', 'अर्गानिक'],
    suggestedPrice: 1200,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#B45309', '#D97706', '#78350F'],
      primarySymbol: '🧈',
      subSymbol: '🐄',
      titleNepali: 'हिमाली शुद्ध गाईको घ्यू',
      categoryNepali: 'पवित्र घृत',
      accentColor: '#FDE68A',
      borderColor: '#FEF3C7',
    }),
  },
  {
    id: 'ps_sesame_oil_puja',
    nameNepali: 'कालो तिलको शुद्ध पूजा तेल (Sesame Puja Oil)',
    nameEnglish: 'Pure Black Sesame Oil for Diya & Havan',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू, तेल तथा पञ्चगव्य',
    description: 'शनि देव पूजा, दीप प्रज्वलन तथा तर्पणका लागि शुद्ध कालो तिलको पेलेको तेल।',
    tags: ['तिलकोतेल', 'शनिपूजा', 'दियोतेल', 'कालोतिल'],
    suggestedPrice: 420,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#1C1917', '#292524', '#0C0A09'],
      primarySymbol: '🛢️',
      subSymbol: '🪐',
      titleNepali: 'कालो तिलको शुद्ध पूजा तेल',
      categoryNepali: 'दीप तेल',
      accentColor: '#FACC15',
      borderColor: '#FEF08A',
    }),
  },
  {
    id: 'ps_panchagavya_kit',
    nameNepali: 'वैदिक शुद्ध पञ्चगव्य सामग्री सेट',
    nameEnglish: 'Authentic Panchagavya Purification Kit',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू, तेल तथा पञ्चगव्य',
    description: 'देहशुद्धि, यज्ञ प्रारम्भ तथा वास्तु शमनका लागि गाईको दूध, दही, घ्यू, गोबर र गोमूत्र सेट।',
    tags: ['पञ्चगव्य', 'गोमूत्र', 'देहशुद्धि', 'गाई'],
    suggestedPrice: 350,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#15803D', '#166534', '#14532D'],
      primarySymbol: '🥛',
      subSymbol: '🐄',
      titleNepali: 'वैदिक शुद्ध पञ्चगव्य सेट',
      categoryNepali: 'शुद्धि द्रव्य',
      accentColor: '#86EFAC',
      borderColor: '#BBF7D0',
    }),
  },
  {
    id: 'ps_mustard_lamp_oil',
    nameNepali: 'शुद्ध तोरीको दियो तेल (Mustard Lamp Oil)',
    nameEnglish: 'Pure Mustard Oil for Daily Deepam',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू, तेल तथा पञ्चगव्य',
    description: 'दैनिक सन्ध्या दीप तथा अखण्ड बत्तीका लागि शुद्ध काठको कोलमा पेलेको तोरीको तेल।',
    tags: ['तोरीकोतेल', 'दियोतेल', 'बत्ती'],
    suggestedPrice: 320,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#854D0E', '#A16207', '#713F12'],
      primarySymbol: '🪔',
      subSymbol: '🌾',
      titleNepali: 'शुद्ध तोरीको दियो तेल',
      categoryNepali: 'दीप तेल',
      accentColor: '#FDE047',
      borderColor: '#FEF9C3',
    }),
  },

  // =========================================================================
  // ६. रुद्राक्ष, स्फटिक तथा यन्त्र (६ वटा)
  // =========================================================================
  {
    id: 'ps_rudraksha_mala_108',
    nameNepali: 'पञ्चमुखी नेपाली रुद्राक्ष माला (१०८ दाना)',
    nameEnglish: 'Original 5-Mukhi Nepali Rudraksha Mala (108)',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष, स्फटिक र यन्त्र',
    description: 'मन्त्र जप तथा कण्ठ धारणका लागि प्रमाणित प्राकृतिक ५ मुखी नेपाली रुद्राक्ष माला।',
    tags: ['रुद्राक्ष', '१०८माला', 'जपमाला', 'पञ्चमुखी'],
    suggestedPrice: 750,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#78350F', '#92400E', '#451A03'],
      primarySymbol: '📿',
      subSymbol: '🕉️',
      titleNepali: 'नेपाली रुद्राक्ष माला (१०८ दाना)',
      categoryNepali: 'जप माला',
      accentColor: '#F59E0B',
      borderColor: '#FDE68A',
    }),
  },
  {
    id: 'ps_sphatik_shriyantra',
    nameNepali: 'प्राकृतिक स्फटिक श्रीयन्त्र (Sphatik Shri Yantra)',
    nameEnglish: 'Original Pure Sphatik Crystal Shri Yantra',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष, स्फटिक र यन्त्र',
    description: 'धन, समृद्धि र ऐश्वर्य वृद्धिका लागि प्राणप्रतिष्ठित प्राकृतिक स्फटिक श्रीयन्त्र।',
    tags: ['श्रीयन्त्र', 'स्फटिक', 'लक्ष्मी', 'ऐश्वर्य'],
    suggestedPrice: 2800,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#0284C7', '#0369A1', '#075985'],
      primarySymbol: '💎',
      subSymbol: '🔺',
      titleNepali: 'स्फटिक श्रीयन्त्र (Shri Yantra)',
      categoryNepali: 'पवित्र यन्त्र',
      accentColor: '#38BDF8',
      borderColor: '#BAE6FD',
    }),
  },
  {
    id: 'ps_sphatik_shivalinga',
    nameNepali: 'स्फटिक शिवलिङ्ग (Pure Crystal Shivalinga)',
    nameEnglish: 'Original Sphatik Crystal Shivalinga',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष, स्फटिक र यन्त्र',
    description: 'गृहपूजा तथा जल अभिषेकका लागि पवित्र एवं शीतलता प्रदान गर्ने स्फटिक शिवलिङ्ग।',
    tags: ['शिवलिङ्ग', 'स्फटिक', 'अभिषेक', 'शिव'],
    suggestedPrice: 1950,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#0369A1', '#0284C7', '#0C4A6E'],
      primarySymbol: '🔱',
      subSymbol: '💎',
      titleNepali: 'प्राकृतिक स्फटिक शिवलिङ्ग',
      categoryNepali: 'शिवलिङ्ग',
      accentColor: '#7DD3FC',
      borderColor: '#E0F2FE',
    }),
  },
  {
    id: 'ps_tulsi_mala_kanthi',
    nameNepali: 'मूल वृन्दावन तुलसी कण्ठी माला',
    nameEnglish: 'Original Vrindavan Tulsi Kanthi Mala',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष, स्फटिक र यन्त्र',
    description: 'भगवान् विष्णु तथा कृष्ण भक्तिका लागि कण्ठमा धारण गरिने पवित्र काठको तुलसी माला।',
    tags: ['तुलसीमाला', 'कण्ठी', 'वृन्दावन', 'विष्णु'],
    suggestedPrice: 350,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#166534', '#15803D', '#14532D'],
      primarySymbol: '🌿',
      subSymbol: '📿',
      titleNepali: 'वृन्दावन तुलसी कण्ठी माला',
      categoryNepali: 'वैष्णव माला',
      accentColor: '#86EFAC',
      borderColor: '#DCFCE7',
    }),
  },
  {
    id: 'ps_kamal_gatta_mala',
    nameNepali: 'कमल गट्टा माला (कमलको बीउको माला)',
    nameEnglish: 'Original Kamal Gatta (Lotus Seed) Mala',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष, स्फटिक र यन्त्र',
    description: 'महालक्ष्मी मन्त्र साधना तथा धन प्राप्ति जपका लागि कमलको बीउबाट निर्मित माला।',
    tags: ['कमलगट्टा', 'कमलमाला', 'महालक्ष्मी', 'जप'],
    suggestedPrice: 480,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#831843', '#9D174D', '#500724'],
      primarySymbol: '🪷',
      subSymbol: '📿',
      titleNepali: 'कमल गट्टा (कमल बीउ) माला',
      categoryNepali: 'लक्ष्मी माला',
      accentColor: '#F472B6',
      borderColor: '#FCE7F3',
    }),
  },
  {
    id: 'ps_ek_mukhi_rudraksha',
    nameNepali: 'एक मुखी काजु दाना नेपाली रुद्राक्ष',
    nameEnglish: 'Original 1-Mukhi Kaju Dana Rudraksha',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष, स्फटिक र यन्त्र',
    description: 'साक्षात् शिव स्वरूप, एकाग्रता तथा आत्मिक शक्तिको सर्वोच्च १ मुखी रुद्राक्ष।',
    tags: ['एकमुखी', 'रुद्राक्ष', 'शिव', 'नेपाली'],
    suggestedPrice: 5500,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#451A03', '#78350F', '#292524'],
      primarySymbol: '📿',
      subSymbol: '👁️',
      titleNepali: 'एक मुखी नेपाली रुद्राक्ष',
      categoryNepali: 'दुर्लभ रुद्राक्ष',
      accentColor: '#FBBF24',
      borderColor: '#FEF3C7',
    }),
  },

  // =========================================================================
  // ७. धार्मिक ग्रन्थ तथा पञ्चाङ्ग (६ वटा)
  // =========================================================================
  {
    id: 'ps_bhagavad_gita',
    nameNepali: 'श्रीमद्भगवद्गीता (नेपाली अनुवाद र भावार्थ सहित)',
    nameEnglish: 'Shrimad Bhagavad Gita (Nepali Translation)',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ र पञ्चाङ्ग',
    description: 'महर्षि वेदव्यास रचित ७०० श्लोकको नेपाली सरल अनुवाद सहितको आधिकारिक ग्रन्थ।',
    tags: ['भगवद्गीता', 'गीता', 'महाभारत', 'ग्रन्थ'],
    suggestedPrice: 550,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#7A1C1C', '#991B1B', '#450A0A'],
      primarySymbol: '📖',
      subSymbol: '🦚',
      titleNepali: 'श्रीमद्भगवद्गीता (नेपाली)',
      categoryNepali: 'धार्मिक ग्रन्थ',
      accentColor: '#F59E0B',
      borderColor: '#FDE68A',
    }),
  },
  {
    id: 'ps_durga_saptashati',
    nameNepali: 'श्री दुर्गा सप्तशती (चण्डी पाठ) - नेपाली टीका',
    nameEnglish: 'Shree Durga Saptashati (Chandi Path)',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ र पञ्चाङ्ग',
    description: 'नवरात्र तथा चण्डी पाठका लागि सम्पूर्ण कवच, अर्गला, कीलक र १३ अध्यायको नेपाली ग्रन्थ।',
    tags: ['दुर्गासप्तशती', 'चण्डी', 'नवरात्र', 'मार्कण्डेयपुराण'],
    suggestedPrice: 600,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#9F1239', '#BE123C', '#881337'],
      primarySymbol: '🔱',
      subSymbol: '📖',
      titleNepali: 'श्री दुर्गा सप्तशती (चण्डी)',
      categoryNepali: 'देवी ग्रन्थ',
      accentColor: '#FB7185',
      borderColor: '#FFE4E6',
    }),
  },
  {
    id: 'ps_swasthani_brata',
    nameNepali: 'श्री स्वस्थानी व्रतकथा (सचित्र तथा शुद्ध संस्करण)',
    nameEnglish: 'Shree Swasthani Brata Katha (Illustrated)',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ र पञ्चाङ्ग',
    description: 'माघ महिनाको एक महिने स्वस्थानी व्रत कथा, ३१ अध्याय, आरती र पूजा विधि सहित।',
    tags: ['स्वस्थानी', 'माघमाहात्म्य', 'कथा', 'व्रत'],
    suggestedPrice: 350,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#854D0E', '#A16207', '#713F12'],
      primarySymbol: '📜',
      subSymbol: '🪷',
      titleNepali: 'श्री स्वस्थानी व्रतकथा',
      categoryNepali: 'व्रतकथा',
      accentColor: '#FACC15',
      borderColor: '#FEF08A',
    }),
  },
  {
    id: 'ps_rudri_shiva_puja',
    nameNepali: 'शुक्लयजुर्वेदीय रुद्री तथा शिवपूजा पद्धति',
    nameEnglish: 'Shukla Yajurvediya Rudri & Shiva Puja Vidhi',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ र पञ्चाङ्ग',
    description: 'वैदिक मन्त्र, रुद्राष्टाध्यायी, चमकम तथा नमकम् सहितको प्रामाणिक कर्मकाण्ड पुस्तक।',
    tags: ['रुद्री', 'यजुर्वेद', 'शिवपूजा', 'पद्धति'],
    suggestedPrice: 420,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#1E3A8A', '#1E40AF', '#172554'],
      primarySymbol: '🕉️',
      subSymbol: '📖',
      titleNepali: 'रुद्री तथा शिवपूजा पद्धति',
      categoryNepali: 'वैदिक संहिता',
      accentColor: '#60A5FA',
      borderColor: '#BFDBFE',
    }),
  },
  {
    id: 'ps_karmakanda_manjari',
    nameNepali: 'कर्मकाण्ड विधि र मन्त्र मञ्जरी (संस्कार पुस्तक)',
    nameEnglish: 'Karmakanda Vidhi & Mantra Manjari',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ र पञ्चाङ्ग',
    description: 'पण्डित तथा पुरोहितहरूका लागि सम्पूर्ण नित्यकर्म, विवाह, व्रतबन्ध तथा श्राद्ध विधि संग्रह।',
    tags: ['कर्मकाण्ड', 'मन्त्रमञ्जरी', 'पुरोहित', 'संस्कार'],
    suggestedPrice: 750,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#4C1D95', '#5B21B6', '#2E1065'],
      primarySymbol: '📚',
      subSymbol: '🪔',
      titleNepali: 'कर्मकाण्ड विधि मन्त्र मञ्जरी',
      categoryNepali: 'कर्मकाण्ड ग्रन्थ',
      accentColor: '#A78BFA',
      borderColor: '#DDD6FE',
    }),
  },
  {
    id: 'ps_balananda_panchanga_book',
    nameNepali: 'बालानन्द बृहत् नेपाली पञ्चाङ्ग (वार्षिक भित्तेपात्रो)',
    nameEnglish: 'Balananda Brihat Nepali Panchanga Book',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ र पञ्चाङ्ग',
    description: 'वार्षिक ३६५ दिनको ग्रह स्पष्ट, लग्न, चाडपर्व, साइत तथा ज्योतिषीय कुण्डली तालिका।',
    tags: ['पञ्चाङ्ग', 'पात्रो', 'बालानन्द', 'साइत'],
    suggestedPrice: 250,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#7A1C1C', '#991B1B', '#5A1212'],
      primarySymbol: '📅',
      subSymbol: '☀️',
      titleNepali: 'बालानन्द बृहत् पञ्चाङ्ग पुस्तक',
      categoryNepali: 'वार्षिक पञ्चाङ्ग',
      accentColor: '#F59E0B',
      borderColor: '#FDE68A',
    }),
  },

  // =========================================================================
  // ८. वस्त्र, जनै तथा धार्मिक माला (४ वटा)
  // =========================================================================
  {
    id: 'ps_hand_twisted_janeu',
    nameNepali: 'हातले बाटेको शुद्ध वैदिक जनै (यज्ञोपवीत - ५ जोडी)',
    nameEnglish: 'Pure Hand-Twisted Vedic Janeu (5 Pairs)',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र, जनै र धार्मिक माला',
    description: '९ तन्तु र ३ ग्रन्थियुक्त काँचो धागोबाट हातले बाटेको शुद्ध गायत्री मन्त्रित जनै।',
    tags: ['जनै', 'यज्ञोपवीत', 'गायत्री', 'श्रावणी'],
    suggestedPrice: 150,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#B45309', '#D97706', '#78350F'],
      primarySymbol: '🧵',
      subSymbol: '🕉️',
      titleNepali: 'हातले बाटेको शुद्ध वैदिक जनै',
      categoryNepali: 'यज्ञोपवीत',
      accentColor: '#FDE68A',
      borderColor: '#FEF3C7',
    }),
  },
  {
    id: 'ps_pitambar_puja_dhoti',
    nameNepali: 'पहेँलो र रातो पूजा पीताम्बर धोती (Pitambar Cloth)',
    nameEnglish: 'Pure Silk Pitambar Yellow Puja Dhoti',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र, जनै र धार्मिक माला',
    description: 'पूजा, अनुष्ठान तथा मन्दिर सेवामा लगाइने शुद्ध रेशमी पहेँलो धोती र उत्तरीय गम्छा।',
    tags: ['पीताम्बर', 'धोती', 'वस्त्र', 'पूजाकपडा'],
    suggestedPrice: 850,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#CA8A04', '#EAB308', '#854D0E'],
      primarySymbol: '👘',
      subSymbol: '✨',
      titleNepali: 'पूजा पीताम्बर धोती वस्त्र',
      categoryNepali: 'पूजा वस्त्र',
      accentColor: '#FEF08A',
      borderColor: '#FEF9C3',
    }),
  },
  {
    id: 'ps_devi_chunari_scarf',
    nameNepali: 'माताको रातो जरी चुनरी तथा पछ्यौरी',
    nameEnglish: 'Devi Mata Red Zari Embroidered Chunari',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र, जनै र धार्मिक माला',
    description: 'नवदुर्गा, महालक्ष्मी तथा देवी पूजनमा अर्पण गरिने सुनौलो जरी किनारा भएको रातो चुनरी।',
    tags: ['चुनरी', 'पछ्यौरी', 'देवी', 'नवरात्र', 'रातो'],
    suggestedPrice: 250,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#BE123C', '#E11D48', '#881337'],
      primarySymbol: '🧣',
      subSymbol: '🌺',
      titleNepali: 'माताको रातो जरी चुनरी',
      categoryNepali: 'देवी वस्त्र',
      accentColor: '#FDA4AF',
      borderColor: '#FFE4E6',
    }),
  },
  {
    id: 'ps_kusha_ring_asana',
    nameNepali: 'पवित्र कुशको औँठी (पवित्री) र कुश आसन सेट',
    nameEnglish: 'Sacred Kusha Grass Ring & Asana Mat',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र, जनै र धार्मिक माला',
    description: 'पूजा, जप तथा श्राद्ध कर्म गर्दा अनामिका औंलामा लगाइने कुशको पवित्री र बस्ने आसन।',
    tags: ['कुश', 'पवित्री', 'कुशासन', 'जप'],
    suggestedPrice: 280,
    imageUrl: createVedicItemSvg({
      bgGradient: ['#3F6212', '#4D7C0F', '#365314'],
      primarySymbol: '🌾',
      subSymbol: '🧘',
      titleNepali: 'कुशको पवित्री र आसन सेट',
      categoryNepali: 'पूजा साधन',
      accentColor: '#A3E635',
      borderColor: '#D9F99D',
    }),
  },
];

/**
 * Get all gallery items with optional category and search filter
 */
export function getFilteredPujaGalleryItems(options?: {
  category?: PujaGalleryCategory | 'all';
  searchQuery?: string;
}): PujaGalleryItem[] {
  const { category = 'all', searchQuery = '' } = options || {};
  const query = searchQuery.trim().toLowerCase();

  return PUJA_SAMAGRI_GALLERY_DATABASE.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    if (!matchesCategory) return false;

    if (!query) return true;

    return (
      item.nameNepali.toLowerCase().includes(query) ||
      item.nameEnglish.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query))
    );
  });
}

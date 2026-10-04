// ============================================================================
// बालानन्द वैदिक पसल - पूजा सामग्री तथा वैदिक उत्पादन ग्यालरी इन्जिन (50+ Items)
// (Comprehensive 50+ Puja Samagri & Vedic Items Image Gallery Engine)
// Features: Detailed 3D-perspective Vedic Pooja Thali compositions & authentic items
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
  samagriList?: string[]; // Authentic items list printed on package insert
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
 * Visual Anushthan / Puja Thali types for customized 3D vector rendering
 */
export type VedicThaliType =
  | 'grihapravesh'
  | 'vivah'
  | 'bartabandha'
  | 'rudrabhishek'
  | 'mahamrityunjaya'
  | 'satyanarayan'
  | 'navagraha'
  | 'shraddha'
  | 'vastu'
  | 'pasni'
  | 'lakshmi_deepawali'
  | 'havan_kunda'
  | 'utensil_set'
  | 'fragrance_chandan'
  | 'ghee_oil'
  | 'rudraksha_yantra'
  | 'book_scripture'
  | 'cloth_janeu'
  | 'general_thali';

interface VedicThaliOptions {
  thaliType: VedicThaliType;
  titleNepali: string;
  subtitleNepali?: string;
  categoryNepali: string;
  samagriItems: string[]; // List of authentic ingredients/items printed on packaging
  theme: {
    bgStart: string;
    bgMid: string;
    bgEnd: string;
    accent: string;
    rimGold: string;
  };
  highlightBadge?: string;
}

/**
 * Generates an SVG vector graphic of a decorated Vedic Pooja Thali (पूजा थाली)
 * with authentic ritual items arranged as per classical scriptures.
 */
function createVedicThaliItemSvg(options: VedicThaliOptions): string {
  const {
    thaliType,
    titleNepali,
    subtitleNepali = '१००% शुद्ध, वैदिक विधि प्रमाणित तथा प्रामाणिक सामग्री',
    categoryNepali,
    samagriItems,
    theme,
    highlightBadge = 'शास्त्रीय प्रमाणिक प्याकेज'
  } = options;

  // Render specific items in the central Thali depending on the ritual
  let ritualSpecificSvg = '';

  switch (thaliType) {
    case 'navagraha':
      // 9 Colors of Navagraha Vastra + 9 Supari + 9 Grains + Navagraha Yantra
      ritualSpecificSvg = `
        <!-- Navagraha 9 Colored Patches & Yantra Grid -->
        <g transform="translate(400, 260)">
          <!-- Navagraha Yantra Base -->
          <rect x="-85" y="-85" width="170" height="170" rx="10" fill="#1C1917" stroke="#F59E0B" stroke-width="2.5" opacity="0.95"/>
          <!-- 9 Chambers (3x3) representing Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu -->
          <!-- Row 1 -->
          <rect x="-78" y="-78" width="48" height="48" rx="4" fill="#DC2626" stroke="#FEF08A" stroke-width="1"/> <!-- Surya: Red -->
          <text x="-54" y="-48" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">सूर्य</text>
          <circle cx="-54" cy="-62" r="6" fill="#FDE047"/>

          <rect x="-24" y="-78" width="48" height="48" rx="4" fill="#F8FAFC" stroke="#FEF08A" stroke-width="1"/> <!-- Chandra: White -->
          <text x="0" y="-48" font-size="12" font-weight="bold" fill="#0F172A" text-anchor="middle">चन्द्र</text>
          <circle cx="0" cy="-62" r="6" fill="#E2E8F0"/>

          <rect x="30" y="-78" width="48" height="48" rx="4" fill="#EF4444" stroke="#FEF08A" stroke-width="1"/> <!-- Mangal: Coral Red -->
          <text x="54" y="-48" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">मङ्गल</text>
          <circle cx="54" cy="-62" r="6" fill="#FCA5A5"/>

          <!-- Row 2 -->
          <rect x="-78" y="-24" width="48" height="48" rx="4" fill="#16A34A" stroke="#FEF08A" stroke-width="1"/> <!-- Budha: Green -->
          <text x="-54" y="6" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">बुध</text>
          <circle cx="-54" cy="-8" r="6" fill="#86EFAC"/>

          <rect x="-24" y="-24" width="48" height="48" rx="4" fill="#EAB308" stroke="#FEF08A" stroke-width="1.5"/> <!-- Guru: Golden Yellow (Center) -->
          <text x="0" y="6" font-size="12" font-weight="bold" fill="#000" text-anchor="middle">बृहस्पति</text>
          <circle cx="0" cy="-8" r="7" fill="#FEF08A" stroke="#B45309" stroke-width="1"/>

          <rect x="30" y="-24" width="48" height="48" rx="4" fill="#F1F5F9" stroke="#FEF08A" stroke-width="1"/> <!-- Shukra: Silver White -->
          <text x="54" y="6" font-size="12" font-weight="bold" fill="#0F172A" text-anchor="middle">शुक्र</text>
          <circle cx="54" cy="-8" r="6" fill="#CBD5E1"/>

          <!-- Row 3 -->
          <rect x="-78" y="30" width="48" height="48" rx="4" fill="#1E293B" stroke="#FEF08A" stroke-width="1"/> <!-- Shani: Black/Dark Blue -->
          <text x="-54" y="60" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">शनि</text>
          <circle cx="-54" cy="46" r="6" fill="#64748B"/>

          <rect x="-24" y="30" width="48" height="48" rx="4" fill="#1E3A8A" stroke="#FEF08A" stroke-width="1"/> <!-- Rahu: Deep Indigo -->
          <text x="0" y="60" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">राहु</text>
          <circle cx="0" cy="46" r="6" fill="#3B82F6"/>

          <rect x="30" y="30" width="48" height="48" rx="4" fill="#78350F" stroke="#FEF08A" stroke-width="1"/> <!-- Ketu: Smoky Brown -->
          <text x="54" y="60" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">केतु</text>
          <circle cx="54" cy="46" r="6" fill="#D97706"/>
        </g>
        <!-- 9 Supari & 9 Janeu surrounding -->
        <g transform="translate(400, 260)">
          <path d="M-120,-60 Q-140,0 -120,60 Q-100,100 -40,120" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="8 3" opacity="0.9"/>
          <circle cx="-135" cy="-20" r="10" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
          <circle cx="-135" cy="20" r="10" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
          <circle cx="-100" cy="110" r="10" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
          <circle cx="135" cy="-20" r="10" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
          <circle cx="135" cy="20" r="10" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
          <circle cx="100" cy="110" r="10" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
        </g>
      `;
      break;

    case 'shraddha':
      // White cloth, Kusha Grass Pavitri, Black Til, Jau, Tulsi, Ghee, Honey
      ritualSpecificSvg = `
        <g transform="translate(400, 260)">
          <!-- Pure White Silk Cloth folded -->
          <rect x="-110" y="-85" width="220" height="170" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" filter="url(#thaliDropShadow)"/>
          <rect x="-100" y="-75" width="200" height="150" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
          
          <!-- Kusha Pavitri (Sacred Kusha Grass Mat & Ring) -->
          <g stroke="#15803D" stroke-width="2.5" fill="none">
            <path d="M-80,-50 Q-40,-70 0,-50 Q40,-30 80,-50"/>
            <path d="M-85,-40 Q-40,-60 0,-40 Q40,-20 85,-40"/>
            <path d="M-75,-30 Q-40,-50 0,-30 Q40,-10 75,-30"/>
          </g>
          <!-- Kusha Pavitri Ring -->
          <circle cx="0" cy="-25" r="16" fill="none" stroke="#16A34A" stroke-width="3"/>
          <path d="M-8,-10 L8,-40 M-4,-8 L12,-36" stroke="#16A34A" stroke-width="2"/>

          <!-- Black Til (कालो तिल) Bowl -->
          <g transform="translate(-50, 25)">
            <ellipse cx="0" cy="0" rx="34" ry="22" fill="#1C1917" stroke="#F59E0B" stroke-width="2"/>
            <ellipse cx="0" cy="-3" rx="30" ry="17" fill="#09090B"/>
            <circle cx="-10" cy="-5" r="2" fill="#71717A"/>
            <circle cx="8" cy="-8" r="2" fill="#71717A"/>
            <circle cx="0" cy="-2" r="2" fill="#71717A"/>
            <text x="0" y="16" font-size="10" font-weight="bold" fill="#FDE047" text-anchor="middle">कालो तिल</text>
          </g>

          <!-- Jau (पहेंलो जौ) Bowl -->
          <g transform="translate(50, 25)">
            <ellipse cx="0" cy="0" rx="34" ry="22" fill="#B45309" stroke="#F59E0B" stroke-width="2"/>
            <ellipse cx="0" cy="-3" rx="30" ry="17" fill="#FDE047"/>
            <ellipse cx="-8" cy="-5" rx="4" ry="2" fill="#CA8A04"/>
            <ellipse cx="6" cy="-8" rx="4" ry="2" fill="#CA8A04"/>
            <ellipse cx="0" cy="-2" rx="4" ry="2" fill="#CA8A04"/>
            <text x="0" y="16" font-size="10" font-weight="bold" fill="#78350F" text-anchor="middle">जौ</text>
          </g>

          <!-- Tulsi Leaves (पवित्र तुलसी दल) -->
          <g transform="translate(0, -65)">
            <path d="M0,0 Q-15,-15 0,-30 Q15,-15 0,0" fill="#15803D" stroke="#14532D" stroke-width="1"/>
            <path d="M-10,-10 Q-25,-20 -15,-35 Q-5,-25 -10,-10" fill="#16A34A"/>
            <path d="M10,-10 Q25,-20 15,-35 Q5,-25 10,-10" fill="#16A34A"/>
          </g>
        </g>
      `;
      break;

    case 'rudrabhishek':
      // Shivalinga, Belpatra, Rudraksha Mala, Bhasma, Trishula
      ritualSpecificSvg = `
        <g transform="translate(400, 250)">
          <!-- Sacred Shivalinga Base (Yoni Peeth) -->
          <ellipse cx="0" cy="40" rx="85" ry="28" fill="#1C1917" stroke="#60A5FA" stroke-width="2"/>
          <path d="M-85,40 L-130,55 Q-135,50 -125,45 L-65,30 Z" fill="#262626" stroke="#60A5FA" stroke-width="1.5"/> <!-- Snan Droni -->
          
          <!-- Shivalinga Lingam Sila -->
          <path d="M-38,35 C-38,-40 38,-40 38,35 Z" fill="url(#shivalingaGrad)" stroke="#93C5FD" stroke-width="2"/>
          
          <!-- Tripundra Bhasma & Red Bindu on Shivalinga -->
          <line x1="-22" y1="-10" x2="22" y2="-10" stroke="#F1F5F9" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="-22" y1="-5" x2="22" y2="-5" stroke="#F1F5F9" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="-22" y1="0" x2="22" y2="0" stroke="#F1F5F9" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="0" cy="-5" r="4" fill="#DC2626"/>

          <!-- 3-Leaf Bilva Patra (त्रिनेत्र बेलपत्र) on Top -->
          <g transform="translate(0, -42)">
            <path d="M0,0 Q-18,-18 0,-36 Q18,-18 0,0" fill="#15803D" stroke="#14532D" stroke-width="1.2"/>
            <path d="M-8,-8 Q-28,-18 -18,-36 Q-2,-24 -8,-8" fill="#16A34A" stroke="#14532D" stroke-width="1"/>
            <path d="M8,-8 Q28,-18 18,-36 Q2,-24 8,-8" fill="#16A34A" stroke="#14532D" stroke-width="1"/>
            <circle cx="0" cy="-18" r="2.5" fill="#FDE047"/>
          </g>

          <!-- Rudraksha Rosary draped around -->
          <path d="M-55,25 Q-65,65 0,72 Q65,65 55,25" fill="none" stroke="#78350F" stroke-width="6" stroke-dasharray="8 4"/>
          <!-- Trishula & Damaru Silhouette -->
          <g transform="translate(95, -15)">
            <line x1="0" y1="-50" x2="0" y2="70" stroke="#F59E0B" stroke-width="3"/>
            <path d="M-15,-40 Q0,-65 15,-40 M0,-65 L0,-30" fill="none" stroke="#F59E0B" stroke-width="3"/>
          </g>
        </g>
      `;
      break;

    case 'satyanarayan':
      // Shaligram, Yellow Silk, Tulsi, Panchamrit, Banana leaf
      ritualSpecificSvg = `
        <g transform="translate(400, 260)">
          <!-- Banana Leaf slice -->
          <path d="M-120,40 Q0,80 120,40 Q110,-40 0,-30 Q-110,-40 -120,40 Z" fill="#15803D" stroke="#166534" stroke-width="2"/>
          <line x1="-115" y1="40" x2="115" y2="40" stroke="#86EFAC" stroke-width="2" stroke-dasharray="6 4"/>

          <!-- Yellow Pitambar Cloth Base -->
          <rect x="-70" y="-70" width="140" height="110" rx="10" fill="#FACC15" stroke="#CA8A04" stroke-width="2" filter="url(#thaliDropShadow)"/>
          
          <!-- Shaligram Sila (Sacred Black Stone) on Silver Asana -->
          <ellipse cx="0" cy="-15" rx="42" ry="30" fill="#171717" stroke="#E2E8F0" stroke-width="2.5"/>
          <ellipse cx="-8" cy="-22" rx="14" ry="8" fill="#404040" opacity="0.6"/>
          <!-- Gold & Sandalwood Tilak on Shaligram -->
          <line x1="0" y1="-30" x2="0" y2="-5" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
          <circle cx="0" cy="-18" r="3" fill="#DC2626"/>

          <!-- Tulsi Manjari on Top of Shaligram -->
          <g transform="translate(0, -32)">
            <path d="M0,0 Q-12,-12 0,-24 Q12,-12 0,0" fill="#16A34A"/>
            <circle cx="0" cy="-20" r="2" fill="#86EFAC"/>
          </g>

          <!-- Panchamrit 5-Bowl Sacred Set -->
          <g transform="translate(-85, -20)">
            <circle cx="0" cy="0" r="18" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
            <text x="0" y="4" font-size="9" font-weight="bold" fill="#0284C7" text-anchor="middle">पञ्चामृत</text>
          </g>
          <g transform="translate(85, -20)">
            <circle cx="0" cy="0" r="18" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5"/>
            <text x="0" y="4" font-size="9" font-weight="bold" fill="#854D0E" text-anchor="middle">प्रसाद</text>
          </g>
        </g>
      `;
      break;

    case 'vivah':
      // Sindurdan, Lagan Gantho (Red-Yellow knot), Varmala Dubo, Conch, Supari
      ritualSpecificSvg = `
        <g transform="translate(400, 260)">
          <!-- Red & Yellow Lagan Gantho Cloth Swatch tied with knot -->
          <path d="M-110,-40 C-60,-70 60,-70 110,-40 C90,60 -90,60 -110,-40 Z" fill="#DC2626" stroke="#FEF08A" stroke-width="2"/>
          <path d="M-60,-50 C-10,-80 80,-50 60,30 C10,50 -40,30 -60,-50 Z" fill="#FACC15" opacity="0.85"/>
          <!-- Central Sacred Knot (लगनगाँठो) with Supari & Coin -->
          <circle cx="0" cy="-10" r="24" fill="#B91C1C" stroke="#FDE047" stroke-width="3"/>
          <circle cx="0" cy="-10" r="12" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/> <!-- Supari -->
          
          <!-- Sindurdan (Brass/Silver Vermilion Container) filled with Red Sindur -->
          <g transform="translate(-65, 20)">
            <path d="M-22,10 L-18,-15 L18,-15 L22,10 Z" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"/>
            <ellipse cx="0" cy="-15" rx="18" ry="8" fill="#DC2626"/>
            <text x="0" y="24" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">सिन्दूरदानी</text>
          </g>

          <!-- Dubo & Marigold Varmala (स्वयंवर माला) -->
          <g transform="translate(65, 20)">
            <ellipse cx="0" cy="0" rx="28" ry="18" fill="none" stroke="#16A34A" stroke-width="4"/>
            <circle cx="-16" cy="0" r="6" fill="#F97316"/>
            <circle cx="0" cy="14" r="6" fill="#FDE047"/>
            <circle cx="16" cy="0" r="6" fill="#F97316"/>
            <text x="0" y="24" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">स्वयंवर माला</text>
          </g>
        </g>
      `;
      break;

    case 'bartabandha':
      // Shikha Janeu, Munj Mekhala, Palasha Danda, Wooden Kharau, Bhiksha Patra
      ritualSpecificSvg = `
        <g transform="translate(400, 260)">
          <!-- Geru / Peetambar Silk Shawl -->
          <rect x="-105" y="-75" width="210" height="150" rx="12" fill="#EA580C" stroke="#FED7AA" stroke-width="2" filter="url(#thaliDropShadow)"/>
          
          <!-- Pure White Shikha Janeu (यज्ञोपवीत) looped prominently -->
          <ellipse cx="-20" cy="-10" rx="55" ry="40" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="12 4"/>
          <ellipse cx="-20" cy="-10" rx="50" ry="36" fill="none" stroke="#F1F5F9" stroke-width="2"/>
          <circle cx="20" cy="-35" r="7" fill="#F59E0B" stroke="#FFF" stroke-width="1.5"/> <!-- Brahma Granthi knot -->

          <!-- Palasha Danda (पलाँसको दण्ड) diagonally placed -->
          <line x1="-80" y1="50" x2="80" y2="-60" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
          <line x1="-80" y1="50" x2="80" y2="-60" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>

          <!-- Wooden Kharau (काठको खडाउँ) -->
          <g transform="translate(50, 25)">
            <ellipse cx="0" cy="0" rx="16" ry="30" fill="#9A3412" stroke="#FED7AA" stroke-width="1.5"/>
            <circle cx="0" cy="-15" r="5" fill="#F59E0B"/>
            <text x="0" y="20" font-size="9" font-weight="bold" fill="#FFF" text-anchor="middle">खडाउँ</text>
          </g>

          <!-- Bhiksha Patra with Akshata -->
          <g transform="translate(-60, 25)">
            <ellipse cx="0" cy="0" rx="24" ry="16" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"/>
            <ellipse cx="0" cy="-3" rx="20" ry="12" fill="#FEF08A"/>
            <text x="0" y="20" font-size="9" font-weight="bold" fill="#FFF" text-anchor="middle">भिक्षापात्र</text>
          </g>
        </g>
      `;
      break;

    case 'havan_kunda':
      // Copper Havan Kunda with Sacred Agni, Samidha sticks, Sruva ladle, Guggul
      ritualSpecificSvg = `
        <g transform="translate(400, 265)">
          <!-- Copper Havan Kunda Tiered Pyramid Steps -->
          <polygon points="-110,60 110,60 85,25 -85,25" fill="#9A3412" stroke="#FDBA74" stroke-width="2"/>
          <polygon points="-85,25 85,25 65,-5 -65,-5" fill="#C2410C" stroke="#FDBA74" stroke-width="1.5"/>
          <polygon points="-65,-5 65,-5 45,-30 -45,-30" fill="#7C2D12" stroke="#FDBA74" stroke-width="1.5"/>

          <!-- Samidha Wood Sticks (समिधा काठहरू) inside Kunda -->
          <line x1="-35" y1="-15" x2="35" y2="-5" stroke="#78350F" stroke-width="8" stroke-linecap="round"/>
          <line x1="-30" y1="-5" x2="30" y2="-15" stroke="#571E06" stroke-width="8" stroke-linecap="round"/>
          <line x1="-25" y1="-22" x2="25" y2="-22" stroke="#9A3412" stroke-width="6" stroke-linecap="round"/>

          <!-- Sacred Agni / Holy Fire (प्रज्वलित अग्नि) with Multilayer Glow -->
          <path d="M0,-85 Q-28,-40 -15,-15 Q0,-5 15,-15 Q28,-40 0,-85 Z" fill="#EA580C" opacity="0.9"/>
          <path d="M0,-80 Q-20,-40 -10,-20 Q0,-10 10,-20 Q20,-40 0,-80 Z" fill="#F97316"/>
          <path d="M0,-70 Q-12,-35 -6,-22 Q0,-15 6,-22 Q12,-35 0,-70 Z" fill="#FDE047"/>
          <path d="M0,-55 Q-6,-30 -2,-24 Q0,-20 2,-24 Q6,-30 0,-55 Z" fill="#FFFFFF"/>

          <!-- Sruva / Wooden Havan Ladle on the side -->
          <g transform="translate(85, -10)">
            <line x1="-15" y1="50" x2="25" y2="-40" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
            <ellipse cx="25" cy="-40" rx="10" ry="6" fill="#B45309" stroke="#FDE68A" stroke-width="1.5"/>
            <text x="5" y="45" font-size="9" font-weight="bold" fill="#FED7AA" text-anchor="middle">स्रुवा/स्रुच</text>
          </g>
        </g>
      `;
      break;

    case 'grihapravesh':
    case 'vastu':
    default:
      // Standard Magnificent Vedic Thali with Kalash, Yantra, Diya, and Katoris
      ritualSpecificSvg = `
        <g transform="translate(400, 260)">
          <!-- Ashtadal Padma (8-petaled Sacred Golden Lotus) Engraved in Center -->
          <g fill="#F59E0B" stroke="#D97706" stroke-width="1.2" opacity="0.85">
            <!-- 8 Petals -->
            <path d="M0,0 Q-16,-30 0,-60 Q16,-30 0,0 Z"/>
            <path d="M0,0 Q30,-16 60,0 Q30,16 0,0 Z"/>
            <path d="M0,0 Q16,30 0,60 Q-16,30 0,0 Z"/>
            <path d="M0,0 Q-30,16 -60,0 Q-30,-16 0,0 Z"/>
            <path d="M0,0 Q-28,-28 -42,-42 Q-14,-42 0,0 Z"/>
            <path d="M0,0 Q28,-28 42,-42 Q42,-14 0,0 Z"/>
            <path d="M0,0 Q28,28 42,42 Q14,42 0,0 Z"/>
            <path d="M0,0 Q-28,28 -42,42 Q-42,14 0,0 Z"/>
            <!-- Center Om Jewel -->
            <circle cx="0" cy="0" r="22" fill="#7A1C1C" stroke="#FEF08A" stroke-width="2"/>
            <text x="0" y="7" font-family="'Noto Sans Devanagari', sans-serif" font-size="18" font-weight="bold" fill="#FEF08A" text-anchor="middle">ॐ</text>
          </g>
        </g>
      `;
      break;
  }

  // Format Samagri Items List into 2 or 3 lines of crisp pill chips
  const samagriFormatted = samagriItems.slice(0, 14).map((item, idx) => `${idx + 1}. ${item}`).join('   •   ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 680" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgStart}"/>
      <stop offset="45%" stop-color="${theme.bgMid}"/>
      <stop offset="100%" stop-color="${theme.bgEnd}"/>
    </linearGradient>

    <!-- Metallic Gold Gradient for Thali Rim -->
    <linearGradient id="goldThaliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="25%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#FFFBEB"/>
      <stop offset="75%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>

    <!-- Brass Inner Plate Gradient -->
    <radialGradient id="brassInnerGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.8"/>
      <stop offset="80%" stop-color="#B45309" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#78350F" stop-opacity="0.95"/>
    </radialGradient>

    <!-- Divine Halo Glow -->
    <radialGradient id="haloGlow" cx="50%" cy="42%" r="48%">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.5"/>
      <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.25"/>
      <stop offset="80%" stop-color="#D97706" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Shivalinga Gradient -->
    <linearGradient id="shivalingaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="40%" stop-color="#404040"/>
      <stop offset="70%" stop-color="#171717"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>

    <!-- Copper Kalash Gradient -->
    <linearGradient id="copperKalashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C2410C"/>
      <stop offset="35%" stop-color="#FED7AA"/>
      <stop offset="70%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#7C2D12"/>
    </linearGradient>

    <!-- Diya Flame Radial Glow -->
    <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="30%" stop-color="#FEF08A"/>
      <stop offset="65%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Drop Shadows -->
    <filter id="thaliDropShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.75"/>
    </filter>
    <filter id="itemShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="900" height="680" fill="url(#bgGrad)"/>

  <!-- Divine Aura & Radiance -->
  <circle cx="450" cy="280" r="340" fill="url(#haloGlow)"/>

  <!-- Sacred Geometric Background Mandala Patterns (Subtle) -->
  <g transform="translate(450, 275)" stroke="${theme.accent}" stroke-width="1.2" fill="none" opacity="0.18">
    <circle r="260" stroke-dasharray="10 8"/>
    <circle r="230"/>
    <circle r="200" stroke-dasharray="6 4"/>
    <circle r="170"/>
    <polygon points="0,-250 250,0 0,250 -250,0"/>
    <polygon points="-177,-177 177,-177 177,177 -177,177"/>
  </g>

  <!-- Traditional Ornamental Outer Border Frame -->
  <rect x="20" y="20" width="860" height="640" rx="20" fill="none" stroke="${theme.rimGold}" stroke-width="2.5" opacity="0.7"/>
  <rect x="28" y="28" width="844" height="624" rx="16" fill="none" stroke="url(#goldThaliGrad)" stroke-width="1.5" stroke-dasharray="16 8"/>

  <!-- Corner Flourishes (Swastika & Floral motif) -->
  <g fill="${theme.rimGold}" opacity="0.85">
    <!-- Top-Left Corner -->
    <path d="M40,55 L55,55 L55,40 L48,40 L48,48 L40,48 Z"/>
    <circle cx="50" cy="50" r="3"/>
    <!-- Top-Right Corner -->
    <path d="M860,55 L845,55 L845,40 L852,40 L852,48 L860,48 Z"/>
    <circle cx="850" cy="50" r="3"/>
    <!-- Bottom-Left Corner -->
    <path d="M40,625 L55,625 L55,640 L48,640 L48,632 L40,632 Z"/>
    <circle cx="50" cy="630" r="3"/>
    <!-- Bottom-Right Corner -->
    <path d="M860,625 L845,625 L845,640 L852,640 L852,632 L860,632 Z"/>
    <circle cx="850" cy="630" r="3"/>
  </g>

  <!-- Top Authentic Badge Pill -->
  <g transform="translate(450, 52)">
    <rect x="-180" y="-16" width="360" height="32" rx="16" fill="#1C1917" stroke="url(#goldThaliGrad)" stroke-width="1.5"/>
    <text x="0" y="5" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="13" font-weight="bold" fill="#FEF08A" text-anchor="middle" letter-spacing="0.5">
      🇳🇵 बालानन्द वैदिक भण्डार • ${categoryNepali}
    </text>
  </g>

  <!-- ========================================================================= -->
  <!-- THE SACRED 3D BRASS POOJA THALI (पूजा थाली) -->
  <!-- ========================================================================= -->
  <g transform="translate(50, 15)">
    <!-- Thali Outer Drop Shadow Base -->
    <circle cx="400" cy="260" r="215" fill="#000000" opacity="0.4" filter="url(#thaliDropShadow)"/>

    <!-- Thali Outer Engraved Rim (Brass Gold) -->
    <circle cx="400" cy="260" r="208" fill="url(#goldThaliGrad)" stroke="#78350F" stroke-width="3"/>
    
    <!-- Scalloped / Beaded Rim Pattern (Golden Beads) -->
    <circle cx="400" cy="260" r="198" fill="none" stroke="#78350F" stroke-width="4" stroke-dasharray="6 4"/>
    <circle cx="400" cy="260" r="192" fill="none" stroke="#FFFBEB" stroke-width="1.5"/>

    <!-- Thali Inner Plate (Brass/Bronze Radial Sheen) -->
    <circle cx="400" cy="260" r="186" fill="url(#brassInnerGrad)" stroke="#92400E" stroke-width="2"/>
    <circle cx="400" cy="260" r="150" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-dasharray="8 6" opacity="0.6"/>

    <!-- RITUAL SPECIFIC ITEMS (Placed in center of Thali) -->
    ${ritualSpecificSvg}

    <!-- ===================================================================== -->
    <!-- STANDARD SACRED PUJA ITEMS BEAUTIFULLY ARRANGED IN THE THALI -->
    <!-- ===================================================================== -->

    <!-- 1. MANGAL KALASH (कलश / पञ्चपात्र) - Top Left -->
    <g transform="translate(265, 160)" filter="url(#itemShadow)">
      <!-- Kalash Pot Body (Copper/Brass) -->
      <ellipse cx="0" cy="15" rx="30" ry="24" fill="url(#copperKalashGrad)" stroke="#7C2D12" stroke-width="1.5"/>
      <path d="M-18,-4 L18,-4 L22,8 L-22,8 Z" fill="#EA580C" stroke="#7C2D12" stroke-width="1"/>
      <ellipse cx="0" cy="-4" rx="20" ry="8" fill="#FED7AA" stroke="#C2410C" stroke-width="1.5"/>
      <!-- Red Mauli (काँचो धागो) tied around neck -->
      <rect x="-18" y="2" width="36" height="5" rx="2" fill="#DC2626" stroke="#FEF08A" stroke-width="0.8"/>
      <!-- 5 Mango Leaves (पञ्चपल्लव) -->
      <path d="M0,-4 Q-25,-30 -10,-45 Q-2,-25 0,-4" fill="#15803D" stroke="#14532D" stroke-width="1"/>
      <path d="M0,-4 Q25,-30 10,-45 Q2,-25 0,-4" fill="#15803D" stroke="#14532D" stroke-width="1"/>
      <path d="M0,-4 Q-35,-15 -30,-32 Q-12,-15 0,-4" fill="#16A34A" stroke="#14532D" stroke-width="1"/>
      <path d="M0,-4 Q35,-15 30,-32 Q12,-15 0,-4" fill="#16A34A" stroke="#14532D" stroke-width="1"/>
      <path d="M0,-4 Q0,-35 0,-50 Q8,-30 0,-4" fill="#22C55E" stroke="#14532D" stroke-width="1"/>
      <!-- Coconut (श्रीफल) on Top -->
      <ellipse cx="0" cy="-22" rx="14" ry="18" fill="#78350F" stroke="#FDE68A" stroke-width="1"/>
      <circle cx="0" cy="-24" r="3" fill="#DC2626"/> <!-- Tilak on Coconut -->
      <!-- Label -->
      <text x="0" y="46" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">मङ्गल कलश</text>
    </g>

    <!-- 2. GLOWING DIYA / OIL LAMP (घ्यूको दियो) - Top Right -->
    <g transform="translate(535, 160)" filter="url(#itemShadow)">
      <!-- Diya Brass Base -->
      <ellipse cx="0" cy="18" rx="28" ry="14" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      <ellipse cx="0" cy="12" rx="24" ry="10" fill="#FEF08A" stroke="#B45309" stroke-width="1"/>
      <!-- Diya Lip with Wick -->
      <path d="M-15,10 Q0,0 15,10 Q0,20 -15,10 Z" fill="#B45309"/>
      <circle cx="0" cy="6" r="3" fill="#1C1917"/> <!-- Wick tip -->
      <!-- Radiant Flame Halo -->
      <circle cx="0" cy="-12" r="35" fill="url(#flameGlow)" opacity="0.8"/>
      <!-- Layered Flame -->
      <path d="M0,-35 Q-14,-15 -6,4 Q0,10 6,4 Q14,-15 0,-35 Z" fill="#EA580C"/>
      <path d="M0,-30 Q-9,-12 -4,2 Q0,6 4,2 Q9,-12 0,-30 Z" fill="#FDE047"/>
      <path d="M0,-22 Q-4,-8 -2,0 Q0,2 2,0 Q4,-8 0,-22 Z" fill="#FFFFFF"/>
      <!-- Label -->
      <text x="0" y="44" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">घ्यूको दियो</text>
    </g>

    <!-- 3. PUJA KATORI 1: RED KUMKUM / ABIR (रातो कुमकुम / अबीर) - Right Mid -->
    <g transform="translate(555, 260)" filter="url(#itemShadow)">
      <ellipse cx="0" cy="6" rx="24" ry="16" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      <ellipse cx="0" cy="2" rx="20" ry="12" fill="#B91C1C"/>
      <path d="M-16,2 Q0,-16 16,2 Q0,8 -16,2 Z" fill="#DC2626"/>
      <circle cx="0" cy="-4" r="3" fill="#EF4444"/>
      <text x="0" y="28" font-size="9" font-weight="bold" fill="#FEF08A" text-anchor="middle">कुमकुम/अबीर</text>
    </g>

    <!-- 4. PUJA KATORI 2: YELLOW KESHARI / CHANDAN (केशरी / चन्दन) - Left Mid -->
    <g transform="translate(245, 260)" filter="url(#itemShadow)">
      <ellipse cx="0" cy="6" rx="24" ry="16" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      <ellipse cx="0" cy="2" rx="20" ry="12" fill="#D97706"/>
      <path d="M-16,2 Q0,-16 16,2 Q0,8 -16,2 Z" fill="#FACC15"/>
      <circle cx="0" cy="-4" r="3" fill="#FEF08A"/>
      <text x="0" y="28" font-size="9" font-weight="bold" fill="#FEF08A" text-anchor="middle">केशरी/चन्दन</text>
    </g>

    <!-- 5. PUJA KATORI 3: WHITE AKSHATA (अक्षता चामल) - Bottom Left -->
    <g transform="translate(280, 350)" filter="url(#itemShadow)">
      <ellipse cx="0" cy="6" rx="24" ry="16" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      <ellipse cx="0" cy="2" rx="20" ry="12" fill="#F8FAFC"/>
      <circle cx="-6" cy="0" r="2" fill="#E2E8F0"/>
      <circle cx="4" cy="-2" r="2" fill="#E2E8F0"/>
      <circle cx="0" cy="3" r="2" fill="#E2E8F0"/>
      <text x="0" y="28" font-size="9" font-weight="bold" fill="#FEF08A" text-anchor="middle">अक्षता</text>
    </g>

    <!-- 6. PUJA KATORI 4: JAU & TIL (जौ-तिल) - Bottom Right -->
    <g transform="translate(520, 350)" filter="url(#itemShadow)">
      <ellipse cx="0" cy="6" rx="24" ry="16" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      <ellipse cx="0" cy="2" rx="20" ry="12" fill="#1C1917"/>
      <!-- Til & Jau grains -->
      <circle cx="-6" cy="0" r="2" fill="#000"/>
      <circle cx="6" cy="2" r="2" fill="#000"/>
      <ellipse cx="0" cy="-2" rx="4" ry="2" fill="#FDE047"/>
      <text x="0" y="28" font-size="9" font-weight="bold" fill="#FEF08A" text-anchor="middle">जौ-तिल</text>
    </g>

    <!-- 7. BETEL NUTS (सुपारी) & SACRED THREAD (काँचो धागो) - Bottom Center -->
    <g transform="translate(400, 385)" filter="url(#itemShadow)">
      <!-- 3 Polished Supari Nuts -->
      <circle cx="-22" cy="0" r="11" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
      <circle cx="-25" cy="-3" r="3" fill="#A16207" opacity="0.6"/>
      
      <circle cx="0" cy="-5" r="13" fill="#571E06" stroke="#FDE68A" stroke-width="1.5"/>
      <circle cx="-3" cy="-9" r="4" fill="#A16207" opacity="0.6"/>
      
      <circle cx="22" cy="0" r="11" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
      <circle cx="19" cy="-3" r="3" fill="#A16207" opacity="0.6"/>
      
      <!-- Red Mauli thread wrapping around Supari -->
      <path d="M-30,-2 Q0,-12 30,-2" fill="none" stroke="#DC2626" stroke-width="2.5"/>
      <text x="0" y="22" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">सुपारी / जनै</text>
    </g>

    <!-- 8. FRESH MARIGOLD (सयपत्री फूल) - Scattered on Thali -->
    <g transform="translate(345, 175)">
      <!-- Flower 1 -->
      <circle cx="0" cy="0" r="12" fill="#F97316"/>
      <circle cx="0" cy="0" r="9" fill="#FDE047"/>
      <circle cx="0" cy="0" r="4" fill="#EA580C"/>
    </g>
    <g transform="translate(455, 175)">
      <!-- Flower 2 -->
      <circle cx="0" cy="0" r="12" fill="#F97316"/>
      <circle cx="0" cy="0" r="9" fill="#FDE047"/>
      <circle cx="0" cy="0" r="4" fill="#EA580C"/>
    </g>

    <!-- 9. BATEKO DHOOP & INCENSE WITH AROMA SWIRLS (बाटेको धूप र अगरबत्ती) -->
    <g transform="translate(190, 330)">
      <!-- Dhoop Sticks -->
      <line x1="0" y1="20" x2="20" y2="-40" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
      <line x1="8" y1="20" x2="28" y2="-36" stroke="#78350F" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Glowing Red Embers -->
      <circle cx="20" cy="-40" r="3" fill="#EF4444"/>
      <circle cx="28" cy="-36" r="2.5" fill="#EF4444"/>
      <!-- Aroma Smoke Swirls -->
      <path d="M20,-42 Q10,-65 25,-85 Q40,-105 20,-125" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.65" stroke-linecap="round"/>
      <path d="M28,-38 Q40,-60 25,-80 Q10,-100 30,-120" fill="none" stroke="#FEF08A" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>
    </g>

    <!-- 10. DAKSHINAVARTI SHANKHA & GARUDA GHANTI (शंख र घण्टी) on Outer Sides -->
    <!-- Shankha (Left) -->
    <g transform="translate(170, 200)" filter="url(#itemShadow)">
      <path d="M0,20 Q-25,0 -15,-25 Q0,-45 25,-25 Q35,0 15,30 Q5,40 0,20 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
      <ellipse cx="5" cy="-5" rx="10" ry="18" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
      <text x="5" y="0" font-size="10" font-weight="bold" fill="#D97706" text-anchor="middle">ॐ</text>
    </g>

    <!-- Garuda Ghanti (Right) -->
    <g transform="translate(630, 200)" filter="url(#itemShadow)">
      <path d="M-14,20 L14,20 L10,-5 L-10,-5 Z" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      <ellipse cx="0" cy="20" rx="14" ry="6" fill="#D97706"/>
      <line x1="0" y1="-5" x2="0" y2="-30" stroke="#F59E0B" stroke-width="3"/>
      <circle cx="0" cy="-32" r="5" fill="#FEF08A" stroke="#78350F" stroke-width="1"/>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- LOWER AUTHENTIC PACKAGING INFORMATION BANNER (पूजा सामान सूची ब्यानर) -->
  <!-- Matches the exact style of traditional Nepali Puja Packet Inserts -->
  <!-- ========================================================================= -->
  <g transform="translate(450, 565)" filter="url(#thaliDropShadow)">
    <!-- Base Background Card -->
    <rect x="-420" y="-72" width="840" height="144" rx="16" fill="#1C1917" stroke="url(#goldThaliGrad)" stroke-width="2.5"/>
    <rect x="-412" y="-64" width="824" height="128" rx="12" fill="#292524" opacity="0.95"/>

    <!-- Top Badge Row -->
    <g transform="translate(0, -42)">
      <rect x="-140" y="-12" width="280" height="24" rx="12" fill="#7A1C1C" stroke="#FEF08A" stroke-width="1"/>
      <text x="0" y="5" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" font-weight="bold" fill="#FEF08A" text-anchor="middle">
        ★ ${highlightBadge} ★
      </text>
    </g>

    <!-- Main Title Heading -->
    <text x="0" y="-12" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="23" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${titleNepali}
    </text>

    <!-- Subtitle / Tagline -->
    <text x="0" y="10" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" fill="#FDE047" text-anchor="middle">
      ${subtitleNepali}
    </text>

    <!-- Authentic Samagri Checklist Ribbon (जस्तो शास्त्रीय किताव र प्याकेटमा लेखिएको हुन्छ) -->
    <g transform="translate(0, 36)">
      <rect x="-395" y="-14" width="790" height="28" rx="8" fill="#1C1917" stroke="#78350F" stroke-width="1"/>
      <text x="0" y="4" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="11" font-weight="bold" fill="#FEF3C7" text-anchor="middle">
        📋 मुख्य सामग्री: ${samagriFormatted}
      </text>
    </g>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// ५०+ वटा सम्पूर्ण प्रामाणिक पूजा तथा वैदिक सामग्रीहरूको आधिकारिक ग्यालरी
// (Detailed Puja Samagri Database with accurate items list for each Anushthan)
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
    samagriList: ['मङ्गल कलश', 'तोरण', 'पञ्चरत्न', 'सप्तधान्य', 'वास्तु यन्त्र', 'पञ्चगव्य', 'धूप', 'दीप', 'जौ-तिल', 'सुपारी', 'जनै', 'अबीर-केशरी', 'घ्यू'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'grihapravesh',
      titleNepali: 'गृहप्रवेश पूजा सामग्री सम्पूर्ण सेट',
      subtitleNepali: 'नयाँ घर प्रवेश, वास्तु शान्ति तथा कुलदेवता पूजनका लागि सम्पूर्ण तयारी',
      categoryNepali: 'कर्मकाण्ड प्याकेज',
      samagriItems: ['मङ्गल कलश', 'तोरण', 'पञ्चरत्न', 'सप्तधान्य', 'वास्तु यन्त्र', 'पञ्चगव्य', 'धूप', 'दीप', 'जौ-तिल', 'सुपारी', 'जनै', 'अबीर', 'घ्यू'],
      theme: {
        bgStart: '#7A1C1C',
        bgMid: '#991B1B',
        bgEnd: '#450A0A',
        accent: '#F59E0B',
        rimGold: '#FDE68A',
      },
      highlightBadge: '४२ प्रकारका शास्त्रीय सामग्री समावेश',
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
    samagriList: ['सिन्दूरदानी', 'लगनगाँठो वस्त्र', 'स्वयंवर दुबोमाला', 'लाजा/लाभा', 'पञ्चपल्लव', 'अर्घ्यपात्र', 'सुपारी', 'जनै', 'शङ्ख', 'मौली', 'अक्षता', 'हवन सामग्री'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'vivah',
      titleNepali: 'विवाह पूजा सामग्री सम्पूर्ण सेट',
      subtitleNepali: 'वैदिक विवाह विधि, कन्यादान, सप्तपदी तथा स्वयंवरका लागि पूर्ण सेट',
      categoryNepali: 'विवाह संस्कार',
      samagriItems: ['सिन्दूरदानी', 'लगनगाँठो वस्त्र', 'स्वयंवर दुबोमाला', 'लाजा/लाभा', 'पञ्चपल्लव', 'अर्घ्यपात्र', 'सुपारी', 'जनै', 'शङ्ख', 'मौली', 'अक्षता', 'हवन सामग्री'],
      theme: {
        bgStart: '#831843',
        bgMid: '#9D174D',
        bgEnd: '#500724',
        accent: '#F43F5E',
        rimGold: '#FDA4AF',
      },
      highlightBadge: 'विवाह मण्डप तथा स्वयंवर प्याकेज',
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
    samagriList: ['शिखा जनै', 'मुञ्ज मेखला', 'पलाँस दण्ड', 'काठको खडाउँ', 'गेरु/पीताम्बर', 'भिक्षापात्र', 'कुश', 'अक्षता', 'गायत्री हवन सामग्री', 'सुपारी'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'bartabandha',
      titleNepali: 'व्रतबन्ध उपनयन पूजा सामग्री सेट',
      subtitleNepali: 'बटुक उपनयन, गायत्री मन्त्र दीक्षा तथा समावर्तन संस्कारका लागि सम्पूर्ण सामग्री',
      categoryNepali: 'उपनयन संस्कार',
      samagriItems: ['शिखा जनै', 'मुञ्ज मेखला', 'पलाँस दण्ड', 'काठको खडाउँ', 'गेरु/पीताम्बर', 'भिक्षापात्र', 'कुश', 'अक्षता', 'गायत्री हवन सामग्री', 'सुपारी'],
      theme: {
        bgStart: '#78350F',
        bgMid: '#B45309',
        bgEnd: '#451A03',
        accent: '#FBBF24',
        rimGold: '#FDE68A',
      },
      highlightBadge: 'बटुक संस्कार सम्पूर्ण प्याकेज',
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
    samagriList: ['शिवलिङ्ग', 'त्रिनेत्र बेलपत्र', 'रुद्राक्ष माला', 'भस्म/विभूति', 'गंगाजल', 'पञ्चामृत', 'धतुरो', 'अबीर-केशरी', 'घ्यूको दियो', 'जौ-तिल', 'सुपारी'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'rudrabhishek',
      titleNepali: 'रुद्राभिषेक तथा शिवपूजा सामग्री Package',
      subtitleNepali: 'एकादश रुद्री, पार्थिव शिवलिङ्ग पूजन एवं महाशिवरात्रि अभिषेकका लागि',
      categoryNepali: 'शिव आराधना',
      samagriItems: ['शिवलिङ्ग', 'त्रिनेत्र बेलपत्र', 'रुद्राक्ष माला', 'भस्म/विभूति', 'गंगाजल', 'पञ्चामृत', 'धतुरो', 'अबीर-केशरी', 'घ्यूको दियो', 'जौ-तिल', 'सुपारी'],
      theme: {
        bgStart: '#1E3A8A',
        bgMid: '#1E40AF',
        bgEnd: '#172554',
        accent: '#60A5FA',
        rimGold: '#93C5FD',
      },
      highlightBadge: 'रुद्री एवं शिव अभिषेक सामग्री',
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
    samagriList: ['महामृत्युञ्जय यन्त्र', '१०८ रुद्राक्ष माला', 'तामाको हवन कुण्ड', 'समिधा', 'गुग्गुल', 'कालो तिल-जौ', 'गाईको घ्यू', 'दीप', 'सर्वोषधी', 'कपुर'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'havan_kunda',
      titleNepali: 'महामृत्युञ्जय अनुष्ठान सामग्री सेट',
      subtitleNepali: 'आरोग्य, अकाल मृत्यु निवारण तथा सवालाख जप एवं हवनका लागि पूर्ण सेट',
      categoryNepali: 'आरोग्य अनुष्ठान',
      samagriItems: ['महामृत्युञ्जय यन्त्र', '१०८ रुद्राक्ष माला', 'तामाको हवन कुण्ड', 'समिधा', 'गुग्गुल', 'कालो तिल-जौ', 'गाईको घ्यू', 'दीप', 'सर्वोषधी', 'कपुर'],
      theme: {
        bgStart: '#312E81',
        bgMid: '#3730A3',
        bgEnd: '#1E1B4B',
        accent: '#A5B4FC',
        rimGold: '#C7D2FE',
      },
      highlightBadge: 'आरोग्य एवं दीर्घायु अनुष्ठान',
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
    samagriList: ['शालिग्राम शिला', 'पहेँलो रेशमी कपडा', 'तुलसी मंजरी', 'पञ्चामृत', 'केराको पात', 'पञ्चमेवा', 'सत्यनारायण पुस्तक', 'जौ-तिल', 'सुपारी', 'जनै', 'घ्यू'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'satyanarayan',
      titleNepali: 'सत्यनारायण व्रतकथा सामग्री सेट',
      subtitleNepali: 'पूर्णिमा, एकादशी तथा मासिक सत्यनारायण कथा एवं पञ्चामृत पूजन',
      categoryNepali: 'विष्णु आराधना',
      samagriItems: ['शालिग्राम शिला', 'पहेँलो रेशमी कपडा', 'तुलसी मंजरी', 'पञ्चामृत', 'केराको पात', 'पञ्चमेवा', 'सत्यनारायण पुस्तक', 'जौ-तिल', 'सुपारी', 'जनै', 'घ्यू'],
      theme: {
        bgStart: '#701A75',
        bgMid: '#86198F',
        bgEnd: '#4A044E',
        accent: '#F472B6',
        rimGold: '#FBCFE8',
      },
      highlightBadge: 'सत्यनारायण कथा सम्पूर्ण विधि',
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
    // Authentic 21 items extracted from packaging:
    samagriList: [
      'केशरी', 'जौ-तिल', 'काँचो धागो', 'पञ्चरत्न', 'रातो सर्सी', 'पञ्चपल्लव', 'रक्तचन्दन', 
      '९ थरी अन्न', 'अगरबत्ती', 'श्रीखण्ड चन्दन', 'अबीर', '९ थरी कपडा', 'बाटेको धूप', 
      'सर्वोषधी', 'सप्तमृत्तिका', 'जनै ९ थरी', 'कपुर', 'काटेको बत्ती', 'सुपारी ९ वटा', 'खड्क पाला', 'नवग्रह यन्त्र'
    ],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'navagraha',
      titleNepali: 'नवग्रह पूजा सामग्री सम्पूर्ण सेट',
      subtitleNepali: '९ ग्रह शान्ति, ग्रहदोष निवारण, महादशा-अन्तर्दशा शान्तिका लागि २१ प्रकारका सामग्री',
      categoryNepali: 'नवग्रह शान्ति',
      samagriItems: ['केशरी', 'जौ-तिल', 'काँचो धागो', 'पञ्चरत्न', 'रातो सर्सी', 'पञ्चपल्लव', 'रक्तचन्दन', '९ थरी अन्न', 'अगरबत्ती', 'श्रीखण्ड', 'अबीर', '९ थरी कपडा', 'बाटेको धूप', 'सर्वोषधी', 'सप्तमृत्तिका', 'जनै ९ थरी', 'कपुर', 'काटेको बत्ती', 'सुपारी ९ वटा', 'नवग्रह'],
      theme: {
        bgStart: '#1C1917',
        bgMid: '#44403C',
        bgEnd: '#0C0A09',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: '२१ प्रकारका शास्त्रीय नवग्रह सामग्री',
    }),
  },
  {
    id: 'ps_vastu_shanti',
    nameNepali: 'वास्तुदोष निवारण तथा वास्तुशान्ति प्याकेज',
    nameEnglish: 'Complete Vastu Shanti Ritual Package',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'घर, पसल वा व्यावसायिक भवनको वास्तुदोष निवारण, शङ्ख स्थापना र वास्तुपुरुष पूजन सामग्री।',
    tags: ['वास्तु', 'शान्ति', 'दोषनिवारण', 'वास्तुपुरुष', 'तामाकोपात्र'],
    suggestedPrice: 2400,
    samagriList: ['वास्तु यन्त्र', 'सप्तमृत्तिका', 'पञ्चगव्य', 'तामाको शङ्ख', 'पञ्चरत्न', 'सप्तधान्य', 'धूप', 'दीप', 'हवन सामग्री', 'जौ-तिल', 'सुपारी'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'vastu',
      titleNepali: 'वास्तुशान्ति तथा दोषनिवारण प्याकेज',
      subtitleNepali: 'घर, भवन तथा प्रतिष्ठानको वास्तुदोष निवारण एवं वास्तुपुरुष पूजन',
      categoryNepali: 'वास्तु कर्मकाण्ड',
      samagriItems: ['वास्तु यन्त्र', 'सप्तमृत्तिका', 'पञ्चगव्य', 'तामाको शङ्ख', 'पञ्चरत्न', 'सप्तधान्य', 'धूप', 'दीप', 'हवन सामग्री', 'जौ-तिल', 'सुपारी'],
      theme: {
        bgStart: '#14532D',
        bgMid: '#15803D',
        bgEnd: '#052E16',
        accent: '#4ADE80',
        rimGold: '#BBF7D0',
      },
      highlightBadge: 'वास्तुपुरुष एवं पञ्चरत्न समावेश',
    }),
  },
  {
    id: 'ps_shraddha_kit',
    nameNepali: 'श्राद्ध तथा पितृकार्य पूजा सामग्री सेट',
    nameEnglish: 'Shraddha & Pitri Karma Ritual Samagri Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'एकपार्वण, सोह्र श्राद्ध, तीर्थ श्राद्ध तथा बरखी श्राद्धका लागि आवश्यक सम्पूर्ण पितृ सामग्री।',
    tags: ['श्राद्ध', 'पितृकार्य', 'सोह्रश्राद्ध', 'कालोतिल', 'कुश', 'पिण्ड'],
    suggestedPrice: 1100,
    // Authentic 12 items extracted directly from packaging insert:
    samagriList: [
      'सुपारी', 'जनै', 'धूप बत्ति', 'कपुर', 'केशरी', 'कुमकुम धूप', 
      'श्रीखण्ड', 'सेतो कपडा', 'घ्यू, मह', 'जौ तिल', 'मसला', 'अष्ट सुगन्ध'
    ],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'shraddha',
      titleNepali: 'श्राद्ध पूजा सामग्री सम्पूर्ण सेट',
      subtitleNepali: 'सोह्र श्राद्ध, एकपार्वण, तीर्थ श्राद्ध तथा पितृ तृप्तिका लागि शास्त्रीय १२ सामग्री',
      categoryNepali: 'पितृ कर्मकाण्ड',
      samagriItems: ['सुपारी', 'जनै', 'धूप बत्ति', 'कपुर', 'केशरी', 'कुमकुम धूप', 'श्रीखण्ड', 'सेतो कपडा', 'घ्यू, मह', 'जौ तिल', 'मसला', 'अष्ट सुगन्ध'],
      theme: {
        bgStart: '#27272A',
        bgMid: '#3F3F46',
        bgEnd: '#18181B',
        accent: '#E4E4E7',
        rimGold: '#FEF08A',
      },
      highlightBadge: '१२ प्रकारका शास्त्रीय श्राद्ध सामग्री',
    }),
  },
  {
    id: 'ps_pasni_annaprashan',
    nameNepali: 'पास्नी (अन्नप्राशन) पूजा सामग्री सम्पूर्ण सेट',
    nameEnglish: 'Pasni / Annaprashan Ceremony Samagri Kit',
    category: 'puja_package',
    categoryNameNepali: 'कर्मकाण्ड प्याकेज',
    description: 'शिशुको पहिलो अन्नप्राशन (पास्नी) संस्कारका लागि चाँदीको कचौरा, चम्चा, सगुन, पञ्चामृत र पूजन सामग्री।',
    tags: ['पास्नी', 'अन्नप्राशन', 'शिशु', 'चाँदी', 'सगुन'],
    suggestedPrice: 1350,
    samagriList: ['चाँदीको कचौरा', 'चाँदीको चम्चा', 'पञ्चामृत', 'रेशमी वस्त्र', 'सगुन सुपारी', 'पञ्चरत्न', 'अक्षता', 'केशरी', 'दियो', 'धूप', 'जनै'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'pasni',
      titleNepali: 'पास्नी (अन्नप्राशन) पूजा सामग्री सेट',
      subtitleNepali: 'शिशुको अन्नप्राशन संस्कार, सगुन, चाँदीको कचौरा-चम्चा एवं मङ्गल पूजन',
      categoryNepali: 'बाल संस्कार',
      samagriItems: ['चाँदीको कचौरा', 'चाँदीको चम्चा', 'पञ्चामृत', 'रेशमी वस्त्र', 'सगुन सुपारी', 'पञ्चरत्न', 'अक्षता', 'केशरी', 'दियो', 'धूप', 'जनै'],
      theme: {
        bgStart: '#854D0E',
        bgMid: '#A16207',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'अन्नप्राशन संस्कार सम्पूर्ण सेट',
    }),
  },

  // =========================================================================
  // २. हवन तथा यज्ञ सामग्री (७ वटा)
  // =========================================================================
  {
    id: 'ps_samidha_wood',
    nameNepali: 'प्राकृतिक समिधा काठ (पलाँस, खयर र पिपल)',
    nameEnglish: 'Natural Sacred Havan Samidha Wood Sticks (1kg)',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन सामग्री',
    description: 'शास्त्रोक्त विधि अनुसार सुकाइएको शुद्ध पलाँस, खयर, समी, पिपल र वरको समिधा काठ।',
    tags: ['समिधा', 'काठ', 'हवन', 'यज्ञ', 'पलाँस'],
    suggestedPrice: 350,
    samagriList: ['पलाँस काठ', 'खयर काठ', 'समी काठ', 'पिपल काठ', 'वर काठ', 'कपुर'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'havan_kunda',
      titleNepali: 'प्राकृतिक समिधा काठ (पलाँस, खयर र पिपल)',
      subtitleNepali: 'यज्ञ, हवन तथा अग्निहोत्रका लागि शुद्ध वैदिक समिधा काठ',
      categoryNepali: 'हवन सामग्री',
      samagriItems: ['पलाँस', 'खयर', 'समी', 'पिपल', 'वर', 'कपुर', 'घ्यू'],
      theme: {
        bgStart: '#7C2D12',
        bgMid: '#9A3412',
        bgEnd: '#431407',
        accent: '#FB923C',
        rimGold: '#FED7AA',
      },
      highlightBadge: '१००% प्राकृतिक सुकेको समिधा',
    }),
  },
  {
    id: 'ps_navagraha_wood',
    nameNepali: '९ ग्रह समिधा काठ सेट (९ थरी शास्त्रीय काठ)',
    nameEnglish: 'Navagraha 9 Sacred Wood Samidha Set',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन सामग्री',
    description: 'आँक (सूर्य), पलास (चन्द्र), खयर (मङ्गल), अपामार्ग (बुध), पिपल (गुरु), औदुम्बर (शुक्र), शमी (शनि), दुर्वा (राहु), कुश (केतु)।',
    tags: ['नवग्रह', 'समिधा', '९काठ', 'ग्रहशान्ति', 'अग्निहोत्र'],
    suggestedPrice: 550,
    samagriList: ['आँक', 'पलास', 'खयर', 'अपामार्ग', 'पिपल', 'गूलर', 'शमी', 'दुर्वा', 'कुश'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'navagraha',
      titleNepali: '९ ग्रह समिधा काठ सेट (९ थरी शास्त्रीय काठ)',
      subtitleNepali: 'सूर्यदेखि केतुसम्म ९ वटै ग्रहका आधिकारिक वैदिक समिधा काठहरू',
      categoryNepali: 'हवन सामग्री',
      samagriItems: ['आँक (सूर्य)', 'पलास (चन्द्र)', 'खयर (मङ्गल)', 'अपामार्ग (बुध)', 'पिपल (गुरु)', 'गूलर (शुक्र)', 'शमी (शनि)', 'दुर्वा (राहु)', 'कुश (केतु)'],
      theme: {
        bgStart: '#1C1917',
        bgMid: '#292524',
        bgEnd: '#0C0A09',
        accent: '#F59E0B',
        rimGold: '#FDE68A',
      },
      highlightBadge: '९ ग्रहका ९ वटै वैदिक काठहरू',
    }),
  },
  {
    id: 'ps_guggul_loban',
    nameNepali: 'शुद्ध गुग्गुल, लोबान र दशाङ्ग धूप (हवन स्पेशल)',
    nameEnglish: 'Pure Guggul, Loban & Dashang Havan Resin (500g)',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन सामग्री',
    description: 'वातावरण शुद्धि, नकारात्मक ऊर्जा निवारण र दिव्य सुगन्धयुक्त उच्च गुणस्तरको गुग्गुल र लोबान।',
    tags: ['गुग्गुल', 'लोबान', 'दशाङ्ग', 'धूप', 'सुगन्ध'],
    suggestedPrice: 480,
    samagriList: ['शुद्ध गुग्गुल', 'लोबान', 'दशाङ्ग', 'कपुर', 'चन्दन धुलो', 'अगरबत्ती'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'havan_kunda',
      titleNepali: 'शुद्ध गुग्गुल, लोबान र दशाङ्ग धूप',
      subtitleNepali: 'वातावरण शुद्धि, नकारात्मक ऊर्जा निवारण र दिव्य सुगन्धयुक्त हवन सामग्री',
      categoryNepali: 'हवन सामग्री',
      samagriItems: ['शुद्ध गुग्गुल', 'लोबान', 'दशाङ्ग', 'कपुर', 'चन्दन धुलो', 'भीमसेनी कपुर'],
      theme: {
        bgStart: '#451A03',
        bgMid: '#78350F',
        bgEnd: '#1C1917',
        accent: '#FBBF24',
        rimGold: '#FDE68A',
      },
      highlightBadge: 'हिमाली प्राकृतिक गुग्गुल',
    }),
  },
  {
    id: 'ps_havan_kunda_copper',
    nameNepali: 'शुद्ध तामाको हस्तनिर्मित हवन कुण्ड (१०x१० इन्च)',
    nameEnglish: 'Pure Handcrafted Copper Havan Kunda',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन सामग्री',
    description: 'तीन मेखलायुक्त, उत्कृष्ट तामाको पाताबाट बनेको टिकाउ र शास्त्रोक्त हवन कुण्ड।',
    tags: ['हवनकुण्ड', 'तामा', 'यज्ञ', 'मेखला', 'कुण्ड'],
    suggestedPrice: 1850,
    samagriList: ['तामाको हवन कुण्ड', 'तामाको स्ट्यान्ड', 'स्रुवा', 'स्रुच', 'कपुर'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'havan_kunda',
      titleNepali: 'शुद्ध तामाको हस्तनिर्मित हवन कुण्ड',
      subtitleNepali: 'तीन मेखलायुक्त, उत्कृष्ट तामाबाट बनेको टिकाउ र शास्त्रोक्त हवन कुण्ड',
      categoryNepali: 'हवन सामग्री',
      samagriItems: ['तामाको हवन कुण्ड', 'तामाको स्ट्यान्ड', 'स्रुवा', 'स्रुच', 'कपुर'],
      theme: {
        bgStart: '#7C2D12',
        bgMid: '#9A3412',
        bgEnd: '#431407',
        accent: '#FB923C',
        rimGold: '#FED7AA',
      },
      highlightBadge: '१००% शुद्ध तामा (Copper)',
    }),
  },
  {
    id: 'ps_sruva_sruch',
    nameNepali: 'काठको स्रुवा र स्रुच जोडी (हवन चम्चा)',
    nameEnglish: 'Wooden Sruva & Sruch Ladle Pair for Havan',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन सामग्री',
    description: 'पलाँस/खयरको काठबाट बनेको शास्त्रीय हवन घ्यू अर्पण गर्ने लामो स्रुवा र स्रुच।',
    tags: ['स्रुवा', 'स्रुच', 'काठकोचम्चा', 'हवन', 'आहुति'],
    suggestedPrice: 420,
    samagriList: ['स्रुवा (ठूलो)', 'स्रुच (सानो)', 'घ्यू पात्र'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'havan_kunda',
      titleNepali: 'काठको स्रुवा र स्रुच जोडी (हवन चम्चा)',
      subtitleNepali: 'पलाँस र खयरको काठबाट निर्मित शास्त्रीय हवन आहुति चम्चा जोडी',
      categoryNepali: 'हवन सामग्री',
      samagriItems: ['स्रुवा (ठूलो)', 'स्रुच (सानो)', 'घ्यू पात्र'],
      theme: {
        bgStart: '#78350F',
        bgMid: '#92400E',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'काष्ठ निर्मित शास्त्रीय पात्र',
    }),
  },
  {
    id: 'ps_jau_til_sarvaushadhi',
    nameNepali: 'हवन जौ, कालो तिल र सर्वौषधि प्याक (१ केजी)',
    nameEnglish: 'Havan Barley, Black Sesame & Sarvaushadhi (1kg)',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन सामग्री',
    description: 'शुद्ध छाँटिएको पहेंलो जौ, पहाडी कालो तिल र १० प्रकारका सर्वौषधि जडीबुटी मिश्रण।',
    tags: ['जौ', 'कालोतिल', 'सर्वौषधि', 'हवन', 'यज्ञ'],
    suggestedPrice: 320,
    samagriList: ['पहेंलो जौ', 'कालो तिल', 'सर्वौषधि १० जडीबुटी', 'सुगन्धित चूर्ण'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'हवन जौ, कालो तिल र सर्वौषधि प्याक',
      subtitleNepali: 'शुद्ध छाँटिएको पहेंलो जौ, पहाडी कालो तिल र १० प्रकारका सर्वौषधि मिश्रण',
      categoryNepali: 'हवन सामग्री',
      samagriItems: ['पहेंलो जौ', 'कालो तिल', 'सर्वौषधि १० जडीबुटी', 'सुगन्धित चूर्ण'],
      theme: {
        bgStart: '#1C1917',
        bgMid: '#292524',
        bgEnd: '#0C0A09',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: '१० प्रकारका सर्वौषधि मिश्रण',
    }),
  },
  {
    id: 'ps_pancharatna_saptadhanya',
    nameNepali: 'पञ्चरत्न एवं सप्तधान्य किट (कलश स्थापना)',
    nameEnglish: 'Pancharatna & Saptadhanya Kalash Kit',
    category: 'havan_samagri',
    categoryNameNepali: 'हवन सामग्री',
    description: 'कलश स्थापना तथा वास्तुका लागि ५ रत्न (मोती, मुगा, सुन, चाँदी, तामा) र ७ अन्न।',
    tags: ['पञ्चरत्न', 'सप्तधान्य', 'कलश', 'वास्तु', 'रत्न'],
    suggestedPrice: 650,
    samagriList: ['मोती', 'मुगा', 'सुन/चाँदी पत्र', 'तामा', 'सप्तधान्य (७ अन्न)', 'पञ्चपल्लव'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'पञ्चरत्न एवं सप्तधान्य किट (कलश स्थापना)',
      subtitleNepali: 'कलश स्थापना तथा वास्तु पूजाका लागि ५ पवित्र रत्न एवं ७ थरी अन्न',
      categoryNepali: 'हवन सामग्री',
      samagriItems: ['मोती', 'मुगा', 'सुन/चाँदी पत्र', 'तामा', 'सप्तधान्य (७ अन्न)', 'पञ्चपल्लव'],
      theme: {
        bgStart: '#1E1B4B',
        bgMid: '#312E81',
        bgEnd: '#0F172A',
        accent: '#818CF8',
        rimGold: '#C7D2FE',
      },
      highlightBadge: '५ पवित्र रत्न एवं ७ अन्न',
    }),
  },

  // =========================================================================
  // ३. शंख, घण्टी तथा पूजा पात्र (७ वटा)
  // =========================================================================
  {
    id: 'ps_dakshinavarti_shankha',
    nameNepali: 'प्राकृतिक दक्षिणावर्ती शंख (लक्ष्मी शंख)',
    nameEnglish: 'Authentic Dakshinavarti Shankha (Lakshmi Conch)',
    category: 'utensils_patra',
    categoryNameNepali: 'पूजा पात्र',
    description: 'धन, समृद्धि र वास्तु दोष निवारणका लागि दुर्लभ प्राकृतिक दक्षिणावर्ती शंख स्ट्यान्ड सहित।',
    tags: ['दक्षिणावर्ती', 'शंख', 'लक्ष्मी', 'समृद्धि', 'वास्तु'],
    suggestedPrice: 3200,
    samagriList: ['दक्षिणावर्ती शंख', 'पित्तलको स्ट्यान्ड', 'गंगाजल', 'चन्दन'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'प्राकृतिक दक्षिणावर्ती शंख (लक्ष्मी शंख)',
      subtitleNepali: 'धन, समृद्धि र वास्तु दोष निवारणका लागि दुर्लभ प्राकृतिक शंख स्ट्यान्ड सहित',
      categoryNepali: 'पूजा पात्र',
      samagriItems: ['दक्षिणावर्ती शंख', 'पित्तलको स्ट्यान्ड', 'गंगाजल', 'चन्दन'],
      theme: {
        bgStart: '#0F172A',
        bgMid: '#1E293B',
        bgEnd: '#020617',
        accent: '#38BDF8',
        rimGold: '#BAE6FD',
      },
      highlightBadge: 'प्राकृतिक दक्षिणावर्ती शंख',
    }),
  },
  {
    id: 'ps_garuda_bell',
    nameNepali: 'काँसको गरुड घण्टी (सुमधुर नाद)',
    nameEnglish: 'Traditional Bronze Garuda Bell (Pooja Ghanti)',
    category: 'utensils_patra',
    categoryNameNepali: 'पूजा पात्र',
    description: 'उच्च गुणस्तरको काँसबाट बनेको, गरुड भगवानको मूर्ति अंकित सुमधुर गुञ्जनयुक्त घण्टी।',
    tags: ['घण्टी', 'गरुड', 'काँस', 'आरती', 'नाद'],
    suggestedPrice: 950,
    samagriList: ['काँसको गरुड घण्टी', 'घण्टी स्ट्यान्ड'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'काँसको गरुड घण्टी (सुमधुर नाद)',
      subtitleNepali: 'काँसबाट बनेको, गरुड भगवानको मूर्ति अंकित सुमधुर गुञ्जनयुक्त घण्टी',
      categoryNepali: 'पूजा पात्र',
      samagriItems: ['काँसको गरुड घण्टी', 'घण्टी स्ट्यान्ड'],
      theme: {
        bgStart: '#451A03',
        bgMid: '#78350F',
        bgEnd: '#1C1917',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'सुमधुर ॐकार नाद',
    }),
  },
  {
    id: 'ps_kalash_panchapatra',
    nameNepali: 'तामाको कलश र पञ्चपात्र-आचमनी सेट',
    nameEnglish: 'Pure Copper Kalash & Panchapatra Achamani Set',
    category: 'utensils_patra',
    categoryNameNepali: 'पूजा पात्र',
    description: 'दैनिक पूजा तथा मङ्गल कर्मका लागि शुद्ध तामाको कलश, पञ्चपात्र र चम्चा (आचमनी)।',
    tags: ['कलश', 'पञ्चपात्र', 'आचमनी', 'तामा', 'जलपात्र'],
    suggestedPrice: 850,
    samagriList: ['तामाको कलश', 'पञ्चपात्र', 'आचमनी चम्चा', 'अर्घ्यपात्र'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'तामाको कलश र पञ्चपात्र-आचमनी सेट',
      subtitleNepali: 'दैनिक पूजा तथा मङ्गल कर्मका लागि शुद्ध तामाको कलश, पञ्चपात्र र आचमनी',
      categoryNepali: 'पूजा पात्र',
      samagriItems: ['तामाको कलश', 'पञ्चपात्र', 'आचमनी चम्चा', 'अर्घ्यपात्र'],
      theme: {
        bgStart: '#7C2D12',
        bgMid: '#9A3412',
        bgEnd: '#431407',
        accent: '#FB923C',
        rimGold: '#FED7AA',
      },
      highlightBadge: '१००% शुद्ध तामा सेट',
    }),
  },
  {
    id: 'ps_pancha_aarti_diya',
    nameNepali: 'पित्तलको पञ्चमुखी आरती दियो (Pancha Aarti)',
    nameEnglish: 'Brass 5-Tier Pancha Aarti Lamp with Handle',
    category: 'utensils_patra',
    categoryNameNepali: 'पूजा पात्र',
    description: 'हातले समात्ने काठ/पित्तलको हेन्डल भएको ५ मुखी परम्परागत मन्दिर आरती दियो।',
    tags: ['आरती', 'पञ्चमुखी', 'दियो', 'पित्तल', 'दीप'],
    suggestedPrice: 750,
    samagriList: ['पञ्चमुखी आरती दियो', 'कपुरदानी', 'घ्यू बत्ती'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'पित्तलको पञ्चमुखी आरती दियो',
      subtitleNepali: 'हेन्डल भएको ५ मुखी परम्परागत मन्दिर एवं सन्ध्या आरती दियो',
      categoryNepali: 'पूजा पात्र',
      samagriItems: ['पञ्चमुखी आरती दियो', 'कपुरदानी', 'घ्यू बत्ती'],
      theme: {
        bgStart: '#78350F',
        bgMid: '#B45309',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: '५ मुखी परम्परागत आरती',
    }),
  },
  {
    id: 'ps_akhanda_jyoti_diya',
    nameNepali: 'काँचको चिम्नीयुक्त अखण्ड ज्योति दियो',
    nameEnglish: 'Brass Akhanda Jyoti Diya with Glass Chimney',
    category: 'utensils_patra',
    categoryNameNepali: 'पूजा पात्र',
    description: 'नौरथा (दशैं), नवरात्र तथा अनुष्ठानमा २४ घण्टा ननिभ्ने काँचको कभर भएको पित्तलको दियो।',
    tags: ['अखण्डज्योति', 'दियो', 'चिम्नी', 'नवरात्र', 'दशैं'],
    suggestedPrice: 680,
    samagriList: ['पित्तलको दियो', 'काँचको चिम्नी', 'काटेको बत्ती प्याक'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'काँचको चिम्नीयुक्त अखण्ड ज्योति दियो',
      subtitleNepali: 'नवरात्र तथा अनुष्ठानमा २४ सै घण्टा ननिभ्ने काँचको कभर भएको दियो',
      categoryNepali: 'पूजा पात्र',
      samagriItems: ['पित्तलको दियो', 'काँचको चिम्नी', 'काटेको बत्ती प्याक'],
      theme: {
        bgStart: '#1C1917',
        bgMid: '#44403C',
        bgEnd: '#0C0A09',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: '२४ घण्टा अखण्ड दीप',
    }),
  },
  {
    id: 'ps_shaligram_sila',
    nameNepali: 'प्राकृतिक गण्डकी शालिग्राम शिला (सुदर्शन)',
    nameEnglish: 'Authentic Gandaki River Shaligram Sila',
    category: 'utensils_patra',
    categoryNameNepali: 'पूजा पात्र',
    description: 'कालीगण्डकी नदीबाट प्राप्त चक्र अंकित पवित्र प्राकृतिक सुदर्शन शालिग्राम शिला।',
    tags: ['शालिग्राम', 'गण्डकी', 'सुदर्शन', 'विष्णु', 'शिला'],
    suggestedPrice: 2800,
    samagriList: ['शालिग्राम शिला', 'चाँदीको सिंहासन', 'तुलसी', 'चन्दन'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'satyanarayan',
      titleNepali: 'प्राकृतिक गण्डकी शालिग्राम शिला (सुदर्शन)',
      subtitleNepali: 'कालीगण्डकी नदीबाट प्राप्त चक्र अंकित पवित्र प्राकृतिक शालिग्राम शिला',
      categoryNepali: 'पूजा पात्र',
      samagriItems: ['शालिग्राम शिला', 'चाँदीको सिंहासन', 'तुलसी', 'चन्दन'],
      theme: {
        bgStart: '#18181B',
        bgMid: '#27272A',
        bgEnd: '#09090B',
        accent: '#A1A1AA',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'कालीगण्डकीको प्राकृतिक शिला',
    }),
  },
  {
    id: 'ps_silver_arghyapatra',
    nameNepali: 'चाँदीको जल अर्घ्यपात्र र शङ्ख स्ट्यान्ड',
    nameEnglish: 'Pure Silver Arghya Patra & Shankha Base',
    category: 'utensils_patra',
    categoryNameNepali: 'पूजा पात्र',
    description: 'सूर्य अर्घ्य तथा देवपूजनका लागि शुद्ध चाँदीबाट बनेको कलशाकार अर्घ्यपात्र।',
    tags: ['चाँदी', 'अर्घ्यपात्र', 'सूर्यार्घ्य', 'चाँदीपात्र'],
    suggestedPrice: 2500,
    samagriList: ['चाँदीको अर्घ्यपात्र', 'चाँदीको आचमनी'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'चाँदीको जल अर्घ्यपात्र र शङ्ख स्ट्यान्ड',
      subtitleNepali: 'सूर्य अर्घ्य तथा देवपूजनका लागि शुद्ध चाँदीबाट बनेको अर्घ्यपात्र',
      categoryNepali: 'पूजा पात्र',
      samagriItems: ['चाँदीको अर्घ्यपात्र', 'चाँदीको आचमनी'],
      theme: {
        bgStart: '#334155',
        bgMid: '#475569',
        bgEnd: '#1E293B',
        accent: '#94A3B8',
        rimGold: '#F8FAFC',
      },
      highlightBadge: 'शुद्ध चाँदी निर्मित',
    }),
  },

  // =========================================================================
  // ४. सुगन्ध, धूप, चन्दन र अबीर (६ वटा)
  // =========================================================================
  {
    id: 'ps_kasturi_devdaru_agarbatti',
    nameNepali: 'प्राकृतिक कस्तुरी र देवदारु अगरबत्ती (प्रिमियम)',
    nameEnglish: 'Natural Kasturi & Himalayan Cedar Incense (250g)',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप र चन्दन',
    description: 'हिमाली जडीबुटी, कस्तुरी सुगन्ध र देवदारुको तेलबाट निर्मित रसायनरहित प्राकृतिक अगरबत्ती।',
    tags: ['अगरबत्ती', 'कस्तुरी', 'देवदारु', 'धूप', 'सुगन्ध'],
    suggestedPrice: 280,
    samagriList: ['कस्तुरी अगरबत्ती', 'देवदारु धूप', 'धूप स्ट्यान्ड'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'प्राकृतिक कस्तुरी र देवदारु अगरबत्ती',
      subtitleNepali: 'हिमाली जडीबुटी, कस्तुरी सुगन्ध र देवदारुको तेलबाट निर्मित अगरबत्ती',
      categoryNepali: 'धूप र चन्दन',
      samagriItems: ['कस्तुरी अगरबत्ती', 'देवदारु धूप', 'धूप स्ट्यान्ड'],
      theme: {
        bgStart: '#4A044E',
        bgMid: '#701A75',
        bgEnd: '#2E1065',
        accent: '#E879F9',
        rimGold: '#F5D0FE',
      },
      highlightBadge: 'रसायनरहित १००% प्राकृतिक',
    }),
  },
  {
    id: 'ps_rakta_shweta_chandan',
    nameNepali: 'शुद्ध रक्तचन्दन र श्रीखण्ड श्वेत चन्दन काठ',
    nameEnglish: 'Pure Red & White Sandalwood Sticks with Grinding Stone',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप र चन्दन',
    description: 'भगवानको तिलक तथा पूजनका लागि मलयगिरी श्रीखण्ड र रक्तचन्दन काठ सिलौटा (पाटा) सहित।',
    tags: ['चन्दन', 'रक्तचन्दन', 'श्रीखण्ड', 'तिलक', 'पाटा'],
    suggestedPrice: 750,
    samagriList: ['श्रीखण्ड चन्दन काठ', 'रक्तचन्दन काठ', 'चन्दन घोट्ने पाटा/सिलौटा'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'शुद्ध रक्तचन्दन र श्रीखण्ड श्वेत चन्दन काठ',
      subtitleNepali: 'भगवानको तिलक तथा पूजनका लागि मलयगिरी श्रीखण्ड र रक्तचन्दन काठ सिलौटा सहित',
      categoryNepali: 'धूप र चन्दन',
      samagriItems: ['श्रीखण्ड चन्दन काठ', 'रक्तचन्दन काठ', 'चन्दन घोट्ने पाटा/सिलौटा'],
      theme: {
        bgStart: '#78350F',
        bgMid: '#92400E',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'मलयगिरी चन्दन काठ',
    }),
  },
  {
    id: 'ps_kumkum_sindur_abir',
    nameNepali: 'प्राकृतिक कुमकुम, सिन्दूर, केशरी र अबीर सेट',
    nameEnglish: 'Natural Herbal Kumkum, Sindur, Keshari & Abir Pack',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप र चन्दन',
    description: 'बेसार र प्राकृतिक फूलको रसबाट बनेको छालाका लागि सुरक्षित शुद्ध कुमकुम र सिन्दूर।',
    tags: ['कुमकुम', 'सिन्दूर', 'केशरी', 'अबीर', 'तिलक'],
    suggestedPrice: 220,
    samagriList: ['रातो कुमकुम', 'शुद्ध सिन्दूर', 'पहेंलो केशरी', 'रङ्गीन अबीर'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'प्राकृतिक कुमकुम, सिन्दूर, केशरी र अबीर सेट',
      subtitleNepali: 'बेसार र प्राकृतिक फूलको रसबाट बनेको छालाका लागि सुरक्षित शुद्ध कुमकुम र सिन्दूर',
      categoryNepali: 'धूप र चन्दन',
      samagriItems: ['रातो कुमकुम', 'शुद्ध सिन्दूर', 'पहेंलो केशरी', 'रङ्गीन अबीर'],
      theme: {
        bgStart: '#831843',
        bgMid: '#9D174D',
        bgEnd: '#500724',
        accent: '#FB7185',
        rimGold: '#FECDD3',
      },
      highlightBadge: 'हर्बल एवं रसायनमुक्त',
    }),
  },
  {
    id: 'ps_shiva_bhasma_vibhuti',
    nameNepali: 'काशी विश्वनाथ मन्दिर भस्म एवं शुद्ध विभूति',
    nameEnglish: 'Sacred Shiva Bhasma Vibhuti from Kashi',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप र चन्दन',
    description: 'गाईको गोबर (गोमय) र सुगन्धित द्रव्यबाट वैदिक विधिले तयार पारिएको त्रिपुण्ड्र विभूति।',
    tags: ['भस्म', 'विभूति', 'शिव', 'त्रिपुण्ड्र', 'काशी'],
    suggestedPrice: 180,
    samagriList: ['गोमय भस्म', 'सुगन्धित विभूति'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'rudrabhishek',
      titleNepali: 'काशी विश्वनाथ मन्दिर भस्म एवं शुद्ध विभूति',
      subtitleNepali: 'गाईको गोबर (गोमय) र सुगन्धित द्रव्यबाट वैदिक विधिले तयार पारिएको विभूति',
      categoryNepali: 'धूप र चन्दन',
      samagriItems: ['गोमय भस्म', 'सुगन्धित विभूति'],
      theme: {
        bgStart: '#1E293B',
        bgMid: '#334155',
        bgEnd: '#0F172A',
        accent: '#94A3B8',
        rimGold: '#E2E8F0',
      },
      highlightBadge: 'वैदिक गोमय भस्म',
    }),
  },
  {
    id: 'ps_bhimseni_kapoor',
    nameNepali: 'शुद्ध भीमसेनी कपुर (Original Bhimseni Camphor 250g)',
    nameEnglish: 'Pure Natural Bhimseni Camphor Crystals',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप र चन्दन',
    description: 'आरती गर्दा कालो धुवाँ नआउने र पूर्ण जल्ने १००% शुद्ध प्राकृतिक भीमसेनी कपुर।',
    tags: ['कपुर', 'भीमसेनी', 'आरती', 'कपुरदानी', 'सुगन्ध'],
    suggestedPrice: 420,
    samagriList: ['भीमसेनी कपुर ढिक्का (२५० ग्राम)', 'आरती कपुर'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'शुद्ध भीमसेनी कपुर (Original Crystals)',
      subtitleNepali: 'आरती गर्दा कालो धुवाँ नआउने र पूर्ण जल्ने १००% शुद्ध प्राकृतिक भीमसेनी कपुर',
      categoryNepali: 'धूप र चन्दन',
      samagriItems: ['भीमसेनी कपुर ढिक्का', 'आरती कपुर'],
      theme: {
        bgStart: '#0F172A',
        bgMid: '#1E293B',
        bgEnd: '#020617',
        accent: '#38BDF8',
        rimGold: '#BAE6FD',
      },
      highlightBadge: '१००% शुद्ध प्राकृतिक कपुर',
    }),
  },
  {
    id: 'ps_divine_attar',
    nameNepali: 'देव पूजन प्राकृतिक अत्तर (गुलाब, चमेली र चन्दन)',
    nameEnglish: 'Divine Pooja Attar Roll-on (Rose, Jasmine, Sandalwood)',
    category: 'fragrance_dhoop',
    categoryNameNepali: 'धूप र चन्दन',
    description: 'भगवानको विग्रह तथा वस्त्रमा अर्पण गर्नका लागि मदिरामुक्त (Non-alcoholic) शुद्ध अत्तर।',
    tags: ['अत्तर', 'गुलाब', 'चन्दन', 'सुगन्ध', 'पूजा'],
    suggestedPrice: 320,
    samagriList: ['गुलाब अत्तर', 'चमेली अत्तर', 'चन्दन अत्तर'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'देव पूजन प्राकृतिक अत्तर (गुलाब, चमेली र चन्दन)',
      subtitleNepali: 'भगवानको विग्रह तथा वस्त्रमा अर्पण गर्नका लागि मदिरामुक्त शुद्ध अत्तर',
      categoryNepali: 'धूप र चन्दन',
      samagriItems: ['गुलाब अत्तर', 'चमेली अत्तर', 'चन्दन अत्तर'],
      theme: {
        bgStart: '#831843',
        bgMid: '#BE185D',
        bgEnd: '#500724',
        accent: '#F472B6',
        rimGold: '#FBCFE8',
      },
      highlightBadge: 'मदिरामुक्त (Non-alcoholic)',
    }),
  },

  // =========================================================================
  // ५. घ्यू, तेल तथा पञ्चगव्य (४ वटा)
  // =========================================================================
  {
    id: 'ps_himalayan_cow_ghee',
    nameNepali: 'स्थानीय पहाडी गाईको शुद्ध घ्यू (A2 Himalayan Ghee 1L)',
    nameEnglish: 'Pure Himalayan Grass-fed Cow Ghee (A2 Bilona)',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू तथा तेल',
    description: 'दियो बाल्न, हवन गर्न तथा पञ्चामृतका लागि काठको मदानीले मथिएको परम्परागत बिलोना घ्यू।',
    tags: ['घ्यू', 'गाईकोघ्यू', 'बिलोना', 'A2', 'हवनघ्यू'],
    suggestedPrice: 1450,
    samagriList: ['A2 शुद्ध गाईको घ्यू (१ लिटर)', 'घ्यूको दियो'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'स्थानीय पहाडी गाईको शुद्ध घ्यू (A2 Ghee)',
      subtitleNepali: 'दियो बाल्न, हवन गर्न तथा पञ्चामृतका लागि काठको मदानीले मथिएको बिलोना घ्यू',
      categoryNepali: 'घ्यू तथा तेल',
      samagriItems: ['A2 गाईको घ्यू', 'घ्यूको दियो'],
      theme: {
        bgStart: '#78350F',
        bgMid: '#B45309',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'परम्परागत बिलोना मन्थन घ्यू',
    }),
  },
  {
    id: 'ps_sesame_puja_oil',
    nameNepali: 'कालो तिलको शुद्ध तेल (शनि तथा नवग्रह दीपका लागि)',
    nameEnglish: 'Pure Black Sesame Oil for Shani & Graha Puja (1L)',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू तथा तेल',
    description: 'शनिवार, शनि साढेसाती, नवग्रह शान्ति र भैरव पूजामा दियो बाल्नका लागि शुद्ध तिलको तेल।',
    tags: ['तिलकोतेल', 'शनि', 'दियो', 'नवग्रह', 'भैरव'],
    suggestedPrice: 520,
    samagriList: ['कालो तिलको तेल (१ लिटर)', 'शनि दीप'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'कालो तिलको शुद्ध तेल (शनि तथा नवग्रह दीप)',
      subtitleNepali: 'शनिवार, शनि साढेसाती, नवग्रह शान्ति र भैरव पूजामा दियो बाल्नका लागि',
      categoryNepali: 'घ्यू तथा तेल',
      samagriItems: ['कालो तिलको तेल', 'शनि दीप'],
      theme: {
        bgStart: '#18181B',
        bgMid: '#27272A',
        bgEnd: '#09090B',
        accent: '#71717A',
        rimGold: '#FDE047',
      },
      highlightBadge: 'शनि दोष निवारक तेल',
    }),
  },
  {
    id: 'ps_panchagavya_kit',
    nameNepali: 'शुद्ध पञ्चगव्य किट (शुद्धिकरण एवं प्रायश्चित)',
    nameEnglish: 'Pure Vedic Panchagavya Purification Kit',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू तथा तेल',
    description: 'गाईको दूध, दही, घ्यू, गोमूत्र र गोबरको रसबाट शास्त्रोक्त विधिले तयार पारिएको पञ्चगव्य।',
    tags: ['पञ्चगव्य', 'शुद्धिकरण', 'गोमूत्र', 'प्रायश्चित', 'गाई'],
    suggestedPrice: 380,
    samagriList: ['गाईको दूध', 'दही', 'घ्यू', 'गोमूत्र', 'गोमय'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'शुद्ध पञ्चगव्य किट (शुद्धिकरण एवं प्रायश्चित)',
      subtitleNepali: 'गाईको दूध, दही, घ्यू, गोमूत्र र गोमयबाट शास्त्रोक्त विधिले तयार पारिएको किट',
      categoryNepali: 'घ्यू तथा तेल',
      samagriItems: ['गाईको दूध', 'दही', 'घ्यू', 'गोमूत्र', 'गोमय'],
      theme: {
        bgStart: '#854D0E',
        bgMid: '#A16207',
        bgEnd: '#451A03',
        accent: '#FACC15',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'शास्त्रोक्त पञ्चगव्य घटक',
    }),
  },
  {
    id: 'ps_mustard_lamp_oil',
    nameNepali: 'परम्परागत शुद्ध तोरीको तेल (दैनिक पूजा दीप)',
    nameEnglish: 'Pure Cold Pressed Mustard Oil for Daily Lamp',
    category: 'ghee_gau',
    categoryNameNepali: 'घ्यू तथा तेल',
    description: 'दैनिक सन्ध्या आरती तथा कुलदेवता मन्दिरमा दियो बाल्नका लागि काठको कोल्हुको तोरीको तेल।',
    tags: ['तोरीकोतेल', 'दियो', 'सन्ध्या', 'आरती', 'कोल्हु'],
    suggestedPrice: 340,
    samagriList: ['तोरीको तेल (१ लिटर)', 'काटेको बत्ती'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'परम्परागत शुद्ध तोरीको तेल (दैनिक पूजा दीप)',
      subtitleNepali: 'दैनिक सन्ध्या आरती तथा कुलदेवता मन्दिरमा दियो बाल्नका लागि तोरीको तेल',
      categoryNepali: 'घ्यू तथा तेल',
      samagriItems: ['तोरीको तेल', 'काटेको बत्ती'],
      theme: {
        bgStart: '#78350F',
        bgMid: '#B45309',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'काष्ठ कोल्हु पेलिएको तेल',
    }),
  },

  // =========================================================================
  // ६. रुद्राक्ष, स्फटिक तथा यन्त्र (६ वटा)
  // =========================================================================
  {
    id: 'ps_rudraksha_mala_108',
    nameNepali: '५ मुखी १०८ दाना नेपाली रुद्राक्ष माला (प्रमाणित)',
    nameEnglish: 'Original 5-Mukhi 108 Beads Nepali Rudraksha Mala',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष र यन्त्र',
    description: 'मन्त्र जप तथा धारणाका लागि संखुवासभा/भोजपुरको प्राकृतिक ५ मुखी रुद्राक्ष माला।',
    tags: ['रुद्राक्ष', '५मुखी', '१०८माला', 'जपमाला', 'नेपाल'],
    suggestedPrice: 950,
    samagriList: ['१०८ रुद्राक्ष माला', 'प्रमाणीकरण प्रमाणपत्र', 'रातो थैली'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'rudrabhishek',
      titleNepali: '५ मुखी १०८ दाना नेपाली रुद्राक्ष माला',
      subtitleNepali: 'मन्त्र जप तथा धारणाका लागि पूर्वी नेपालको प्राकृतिक ५ मुखी रुद्राक्ष',
      categoryNepali: 'रुद्राक्ष र यन्त्र',
      samagriItems: ['१०८ रुद्राक्ष माला', 'प्रमाणीकरण प्रमाणपत्र', 'रातो थैली'],
      theme: {
        bgStart: '#451A03',
        bgMid: '#78350F',
        bgEnd: '#1C1917',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'पूर्वी नेपालको प्राकृतिक रुद्राक्ष',
    }),
  },
  {
    id: 'ps_sphatik_shri_yantra',
    nameNepali: 'प्राकृतिक स्फटिक श्री यन्त्र (धन-समृद्धि)',
    nameEnglish: 'Natural Quartz Crystal Sphatik Shri Yantra',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष र यन्त्र',
    description: 'घर तथा व्यापारमा महालक्ष्मीको कृपा, ऐश्वर्य र वास्तु दोष निवारणका लागि ३D स्फटिक श्री यन्त्र।',
    tags: ['स्फटिक', 'श्रीयन्त्र', 'महालक्ष्मी', 'समृद्धि', 'यन्त्र'],
    suggestedPrice: 2400,
    samagriList: ['स्फटिक श्रीयन्त्र', 'कमल आसन', 'गंगाजल'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'प्राकृतिक स्फटिक श्री यन्त्र (धन-समृद्धि)',
      subtitleNepali: 'महालक्ष्मी कृपा, ऐश्वर्य र वास्तु दोष निवारणका लागि ३D स्फटिक श्री यन्त्र',
      categoryNepali: 'रुद्राक्ष र यन्त्र',
      samagriItems: ['स्फटिक श्रीयन्त्र', 'कमल आसन', 'गंगाजल'],
      theme: {
        bgStart: '#1E1B4B',
        bgMid: '#312E81',
        bgEnd: '#0F172A',
        accent: '#A5B4FC',
        rimGold: '#E0E7FF',
      },
      highlightBadge: 'प्राकृतिक स्फटिक (Quartz Crystal)',
    }),
  },
  {
    id: 'ps_sphatik_shivalinga',
    nameNepali: 'पवित्र स्फटिक शिवलिङ्ग (अभिषेक स्पेशल)',
    nameEnglish: 'Pure Natural Sphatik Shivalinga for Daily Puja',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष र यन्त्र',
    description: 'दैनिक दुग्धाभिषेक तथा जलार्पणका लागि अति पवित्र पारदर्शी स्फटिक शिवलिङ्ग।',
    tags: ['स्फटिक', 'शिवलिङ्ग', 'शिव', 'अभिषेक', 'पारदर्शी'],
    suggestedPrice: 1950,
    samagriList: ['स्फटिक शिवलिङ्ग', 'चाँदीको जलहरी', 'बेलपत्र'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'rudrabhishek',
      titleNepali: 'पवित्र स्फटिक शिवलिङ्ग (अभिषेक स्पेशल)',
      subtitleNepali: 'दैनिक दुग्धाभिषेक तथा जलार्पणका लागि अति पवित्र पारदर्शी स्फटिक शिवलिङ्ग',
      categoryNepali: 'रुद्राक्ष र यन्त्र',
      samagriItems: ['स्फटिक शिवलिङ्ग', 'चाँदीको जलहरी', 'बेलपत्र'],
      theme: {
        bgStart: '#0F172A',
        bgMid: '#1E293B',
        bgEnd: '#020617',
        accent: '#60A5FA',
        rimGold: '#93C5FD',
      },
      highlightBadge: 'पारदर्शी प्राकृतिक स्फटिक',
    }),
  },
  {
    id: 'ps_tulsi_kanthi_mala',
    nameNepali: 'शुद्ध तुलसी कण्ठी माला र जप माला (वृन्दावन)',
    nameEnglish: 'Pure Original Tulsi Kanthi & Chanting Mala',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष र यन्त्र',
    description: 'गलामा लगाउने ३ फेरो तुलसी कण्ठी माला तथा १०८ दानाको जप माला।',
    tags: ['तुलसीमाला', 'कण्ठी', 'जपमाला', 'वैष्णव', 'तुलसी'],
    suggestedPrice: 450,
    samagriList: ['३ फेरो तुलसी कण्ठी', '१०८ तुलसी जपमाला'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'satyanarayan',
      titleNepali: 'शुद्ध तुलसी कण्ठी माला र जप माला',
      subtitleNepali: 'गलामा लगाउने ३ फेरो तुलसी कण्ठी माला तथा १०८ दानाको जप माला',
      categoryNepali: 'रुद्राक्ष र यन्त्र',
      samagriItems: ['३ फेरो तुलसी कण्ठी', '१०८ तुलसी जपमाला'],
      theme: {
        bgStart: '#14532D',
        bgMid: '#15803D',
        bgEnd: '#052E16',
        accent: '#86EFAC',
        rimGold: '#BBF7D0',
      },
      highlightBadge: 'शुद्ध काष्ठ तुलसी माला',
    }),
  },
  {
    id: 'ps_kamal_gatta_mala',
    nameNepali: 'कमल गट्टा माला (१०८ दाना - लक्ष्मी मन्त्र साधना)',
    nameEnglish: 'Original Lotus Seed Kamal Gatta Mala (108 Beads)',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष र यन्त्र',
    description: 'महालक्ष्मी, कनकधारा तथा श्रीसूक्त मन्त्र साधनाका लागि कमलको बीउबाट बनेको माला।',
    tags: ['कमलगट्टा', 'कमल', 'महालक्ष्मी', 'साधना', 'लक्ष्मी'],
    suggestedPrice: 580,
    samagriList: ['१०८ कमलगट्टा माला', 'रातो रेशमी थैली'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'कमल गट्टा माला (१०८ दाना - लक्ष्मी साधना)',
      subtitleNepali: 'महालक्ष्मी, कनकधारा तथा श्रीसूक्त मन्त्र साधनाका लागि कमलको बीउको माला',
      categoryNepali: 'रुद्राक्ष र यन्त्र',
      samagriItems: ['१०८ कमलगट्टा माला', 'रातो रेशमी थैली'],
      theme: {
        bgStart: '#831843',
        bgMid: '#9D174D',
        bgEnd: '#500724',
        accent: '#F472B6',
        rimGold: '#FBCFE8',
      },
      highlightBadge: 'कमलको बीउ (Lotus Seed)',
    }),
  },
  {
    id: 'ps_ek_mukhi_rudraksha',
    nameNepali: '१ मुखी काजु दाना रुद्राक्ष (चाँदीको क्यापिङ सहित)',
    nameEnglish: '1-Mukhi Half Moon Rudraksha with Silver Capping',
    category: 'rudraksha_ratna',
    categoryNameNepali: 'रुद्राक्ष र यन्त्र',
    description: 'साक्षात शिव स्वरूप १ मुखी रुद्राक्ष, शुद्ध चाँदीको क्यापिङ र ल्याब प्रमाणपत्र सहित।',
    tags: ['१मुखी', 'रुद्राक्ष', 'चाँदी', 'शिवस्वरूप', 'ल्याबटेस्ट'],
    suggestedPrice: 3800,
    samagriList: ['१ मुखी रुद्राक्ष', 'चाँदीको क्यापिङ', 'ल्याब टेस्ट सर्टिफिकेट', 'गंगाजल'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'rudrabhishek',
      titleNepali: '१ मुखी काजु दाना रुद्राक्ष (चाँदी क्यापिङ)',
      subtitleNepali: 'साक्षात शिव स्वरूप १ मुखी रुद्राक्ष, चाँदी क्यापिङ र ल्याब प्रमाणपत्र सहित',
      categoryNepali: 'रुद्राक्ष र यन्त्र',
      samagriItems: ['१ मुखी रुद्राक्ष', 'चाँदी क्यापिङ', 'ल्याब सर्टिफिकेट'],
      theme: {
        bgStart: '#312E81',
        bgMid: '#3730A3',
        bgEnd: '#1E1B4B',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'ल्याब प्रमाणित १००% शुद्ध',
    }),
  },

  // =========================================================================
  // ७. धार्मिक ग्रन्थ तथा पञ्चाङ्ग (६ वटा)
  // =========================================================================
  {
    id: 'ps_bhagavad_gita',
    nameNepali: 'श्रीमद्भगवद्गीता (नेपाली सरल भावानुवाद सहित)',
    nameEnglish: 'Shrimad Bhagavad Gita (Sanskrit-Nepali Deluxe Hardbound)',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ',
    description: '१८ अध्याय, मूल संस्कृत श्लोक, पदच्छेद, अन्वय र सरल नेपाली व्याख्या सहितको ठूलो अक्षर ग्रन्थ।',
    tags: ['भगवद्गीता', 'गीता', 'कृष्ण', 'महाभारत', 'संस्कृत'],
    suggestedPrice: 650,
    samagriList: ['श्रीमद्भगवद्गीता पुस्तक', 'तुलसी दल', 'चन्दन'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'satyanarayan',
      titleNepali: 'श्रीमद्भगवद्गीता (नेपाली सरल व्याख्या)',
      subtitleNepali: '१८ अध्याय, मूल संस्कृत श्लोक, अन्वय र सरल नेपाली व्याख्या सहितको ग्रन्थ',
      categoryNepali: 'धार्मिक ग्रन्थ',
      samagriItems: ['श्रीमद्भगवद्गीता', 'तुलसी दल', 'चन्दन'],
      theme: {
        bgStart: '#7C2D12',
        bgMid: '#9A3412',
        bgEnd: '#431407',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'संस्कृत एवं सरल नेपाली भावानुवाद',
    }),
  },
  {
    id: 'ps_durga_saptashati_chandi',
    nameNepali: 'दुर्गा सप्तशती (चण्डी पाठ) - विधि एवं कवच सहित',
    nameEnglish: 'Durga Saptashati Chandi Path (Large Script)',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ',
    description: 'नवान्ह परायण, देवी कवच, अर्गला, कीलक, १३ अध्याय तथा सिद्ध कुञ्जिका स्तोत्र सहित।',
    tags: ['दुर्गासप्तशती', 'चण्डी', 'दशैं', 'नवरात्र', 'देवीस्तोत्र'],
    suggestedPrice: 480,
    samagriList: ['दुर्गा सप्तशती पुस्तक', 'रातो वस्त्र', 'रोली-अक्षता'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'दुर्गा सप्तशती (चण्डी पाठ) - कवच सहित',
      subtitleNepali: 'नवान्ह परायण, देवी कवच, अर्गला, कीलक, १३ अध्याय र सिद्ध कुञ्जिका स्तोत्र',
      categoryNepali: 'धार्मिक ग्रन्थ',
      samagriItems: ['दुर्गा सप्तशती', 'रातो वस्त्र', 'रोली-अक्षता'],
      theme: {
        bgStart: '#831843',
        bgMid: '#9D174D',
        bgEnd: '#500724',
        accent: '#FB7185',
        rimGold: '#FECDD3',
      },
      highlightBadge: 'सम्पूर्ण १३ अध्याय एवं स्तोत्र',
    }),
  },
  {
    id: 'ps_swasthani_bratakatha',
    nameNepali: 'श्री स्वस्थानी व्रतकथा (चित्रमय ३१ अध्याय)',
    nameEnglish: 'Shree Swasthani Brata Katha (Illustrated 31 Chapters)',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ',
    description: 'माघ महिनामा पाठ गरिने परम्परागत श्री स्वस्थानी व्रतकथा, पूजा विधि र आरती सहित।',
    tags: ['स्वस्थानी', 'व्रतकथा', 'माघ', 'पौष', 'आरती'],
    suggestedPrice: 350,
    samagriList: ['श्री स्वस्थानी पुस्तक', '१०८ अक्षता', '१०८ बेलपत्र'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'satyanarayan',
      titleNepali: 'श्री स्वस्थानी व्रतकथा (चित्रमय ३१ अध्याय)',
      subtitleNepali: 'माघ महिनामा पाठ गरिने परम्परागत श्री स्वस्थानी व्रतकथा, विधि र आरती',
      categoryNepali: 'धार्मिक ग्रन्थ',
      samagriItems: ['श्री स्वस्थानी पुस्तक', '१०८ अक्षता', '१०८ बेलपत्र'],
      theme: {
        bgStart: '#701A75',
        bgMid: '#86198F',
        bgEnd: '#4A044E',
        accent: '#F472B6',
        rimGold: '#FBCFE8',
      },
      highlightBadge: 'सम्पूर्ण ३१ अध्याय सचित्र',
    }),
  },
  {
    id: 'ps_rudri_shiva_puja',
    nameNepali: 'शुक्ल यजुर्वेदीय रुद्राष्टाध्यायी (रुद्री पाठ)',
    nameEnglish: 'Shukla Yajurvediya Rudrashtadhyayi (Rudri Path)',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ',
    description: 'वैदिक स्वर र शुद्ध पाठ सहितको शुक्लयजुर्वेदीय रुद्री, चमकम र पुरुषसूक्त।',
    tags: ['रुद्री', 'रुद्राष्टाध्यायी', 'यजुर्वेद', 'शिव', 'चमकम'],
    suggestedPrice: 380,
    samagriList: ['रुद्राष्टाध्यायी पुस्तक', 'रुद्राक्ष', 'भस्म'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'rudrabhishek',
      titleNepali: 'शुक्ल यजुर्वेदीय रुद्राष्टाध्यायी (रुद्री)',
      subtitleNepali: 'वैदिक स्वर सहितको शुक्लयजुर्वेदीय रुद्री, चमकम र पुरुषसूक्त',
      categoryNepali: 'धार्मिक ग्रन्थ',
      samagriItems: ['रुद्राष्टाध्यायी पुस्तक', 'रुद्राक्ष', 'भस्म'],
      theme: {
        bgStart: '#1E3A8A',
        bgMid: '#1E40AF',
        bgEnd: '#172554',
        accent: '#60A5FA',
        rimGold: '#93C5FD',
      },
      highlightBadge: 'वैदिक स्वर सहित मूल पाठ',
    }),
  },
  {
    id: 'ps_karmakanda_manjari',
    nameNepali: 'कर्मकाण्ड मञ्जरी एवं नित्य पूजा विधि ग्रन्थ',
    nameEnglish: 'Karmakanda Manjari & Daily Ritual Guide',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ',
    description: 'पण्डित तथा यजमान दुवैका लागि उपयोगी सम्पूर्ण कर्मकाण्ड, संकल्प, हवन र पूजा पद्धति।',
    tags: ['कर्मकाण्ड', 'पद्धति', 'पूजाविधि', 'संकल्प', 'हवन'],
    suggestedPrice: 520,
    samagriList: ['कर्मकाण्ड मञ्जरी ग्रन्थ', 'कुश', 'पञ्चपात्र'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'कर्मकाण्ड मञ्जरी एवं नित्य पूजा विधि',
      subtitleNepali: 'सम्पूर्ण कर्मकाण्ड, संकल्प, हवन तथा वैदिक पूजा पद्धतिको प्रामाणिक ग्रन्थ',
      categoryNepali: 'धार्मिक ग्रन्थ',
      samagriItems: ['कर्मकाण्ड मञ्जरी', 'कुश', 'पञ्चपात्र'],
      theme: {
        bgStart: '#451A03',
        bgMid: '#78350F',
        bgEnd: '#1C1917',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'कर्मकाण्ड एवं पूजा पद्धति गाइड',
    }),
  },
  {
    id: 'ps_balananda_panchanga_book',
    nameNepali: 'बालानन्द राष्ट्रिय वैदिक पञ्चाङ्ग (वार्षिक क्यालेन्डर)',
    nameEnglish: 'Balananda National Vedic Panchanga Annual Almanac',
    category: 'books_shastra',
    categoryNameNepali: 'धार्मिक ग्रन्थ',
    description: 'तिथि, वार, नक्षत्र, योग, करण, विवाह-व्रतबन्ध साइत र सूर्य-चन्द्र ग्रहण विवरण सहित।',
    tags: ['पञ्चाङ्ग', 'पात्रो', 'साइत', 'ग्रहगोचर', 'बालानन्द'],
    suggestedPrice: 250,
    samagriList: ['वार्षिक पञ्चाङ्ग पात्रो', 'साइत तालिका'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'बालानन्द राष्ट्रिय वैदिक पञ्चाङ्ग',
      subtitleNepali: 'तिथि, नक्षत्र, योग, करण, विवाह-व्रतबन्ध साइत र ग्रहण विस्तृत विवरण',
      categoryNepali: 'धार्मिक ग्रन्थ',
      samagriItems: ['वार्षिक पञ्चाङ्ग', 'साइत तालिका'],
      theme: {
        bgStart: '#1C1917',
        bgMid: '#44403C',
        bgEnd: '#0C0A09',
        accent: '#F59E0B',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'नेपाल पञ्चाङ्ग निर्णायक विकास समिति स्वीकृत',
    }),
  },

  // =========================================================================
  // ८. वस्त्र, जनै तथा धार्मिक माला (४ वटा)
  // =========================================================================
  {
    id: 'ps_hand_twisted_janeu',
    nameNepali: 'हातले बाटिएको शुद्ध शिखा जनै (१२ वटाको बन्डल)',
    nameEnglish: 'Handmade Pure Cotton Vedic Janeu (Yajnopavita 12-Pack)',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र र जनै',
    description: '९ तन्तु र ब्रह्मग्रन्थी युक्त हातले कातेको शुद्ध कपासको वैदिक जनै (यज्ञोपवीत)।',
    tags: ['जनै', 'यज्ञोपवीत', 'कपास', 'ब्रह्मग्रन्थी', 'शिखा'],
    suggestedPrice: 240,
    samagriList: ['हातले बाटिएको शुद्ध जनै १२ थान', 'सुपारी', 'केशरी'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'bartabandha',
      titleNepali: 'हातले बाटिएको शुद्ध शिखा जनै (१२ थान)',
      subtitleNepali: '९ तन्तु र ब्रह्मग्रन्थी युक्त हातले कातेको शुद्ध कपासको वैदिक यज्ञोपवीत',
      categoryNepali: 'वस्त्र र जनै',
      samagriItems: ['हातले बाटिएको शुद्ध जनै १२ थान', 'सुपारी', 'केशरी'],
      theme: {
        bgStart: '#78350F',
        bgMid: '#B45309',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: '९ तन्तु एवं ब्रह्मग्रन्थी प्रमाणित',
    }),
  },
  {
    id: 'ps_pitambar_dhoti',
    nameNepali: 'शुद्ध पहेँलो पीताम्बर रेशमी धोती र उत्तरीय',
    nameEnglish: 'Pure Saffron Pitambar Silk Dhoti & Shawl Set',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र र जनै',
    description: 'पूजा, अनुष्ठान तथा मन्दिर दर्शनका लागि पञ्चकच्छ धोती र काँधमा ओढ्ने उत्तरीय सल।',
    tags: ['पीताम्बर', 'धोती', 'रेशमी', 'उत्तरीय', 'वस्त्र'],
    suggestedPrice: 1250,
    samagriList: ['पहेँलो रेशमी धोती', 'उत्तरीय सल', 'पञ्चकच्छ'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'satyanarayan',
      titleNepali: 'शुद्ध पहेँलो पीताम्बर रेशमी धोती र उत्तरीय',
      subtitleNepali: 'पूजा, अनुष्ठान तथा मन्दिर दर्शनका लागि पञ्चकच्छ धोती र उत्तरीय सल',
      categoryNepali: 'वस्त्र र जनै',
      samagriItems: ['पहेँलो रेशमी धोती', 'उत्तरीय सल', 'पञ्चकच्छ'],
      theme: {
        bgStart: '#854D0E',
        bgMid: '#A16207',
        bgEnd: '#451A03',
        accent: '#FDE047',
        rimGold: '#FEF08A',
      },
      highlightBadge: 'शुद्ध प्राकृतिक रेशम (Silk)',
    }),
  },
  {
    id: 'ps_devi_chunari_scarf',
    nameNepali: 'माता दुर्गा/कालीको जरी चुनरी एवं रातो वस्त्र',
    nameEnglish: 'Mata Durga Golden Zari Chunari & Red Scarf',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र र जनै',
    description: 'नवदुर्गा, काली तथा लक्ष्मी मातालाई अर्पण गर्नका लागि सुनौलो जरी भएको रातो चुनरी।',
    tags: ['चुनरी', 'दुर्गा', 'काली', 'जरी', 'रातोवस्त्र'],
    suggestedPrice: 320,
    samagriList: ['सुनौलो जरी चुनरी', 'सिन्दूर', 'कुमकुम'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'general_thali',
      titleNepali: 'माता दुर्गा/कालीको जरी चुनरी एवं रातो वस्त्र',
      subtitleNepali: 'नवदुर्गा, काली तथा लक्ष्मी मातालाई अर्पण गर्नका लागि सुनौलो जरी चुनरी',
      categoryNepali: 'वस्त्र र जनै',
      samagriItems: ['सुनौलो जरी चुनरी', 'सिन्दूर', 'कुमकुम'],
      theme: {
        bgStart: '#831843',
        bgMid: '#9D174D',
        bgEnd: '#500724',
        accent: '#FB7185',
        rimGold: '#FECDD3',
      },
      highlightBadge: 'सुनौलो जरी किनारा',
    }),
  },
  {
    id: 'ps_kusha_ring_asana',
    nameNepali: 'पवित्र कुशको औंठी (पवित्री) र कुशको आसन',
    nameEnglish: 'Sacred Kusha Grass Pavitri Ring & Meditation Asana',
    category: 'cloth_janeu',
    categoryNameNepali: 'वस्त्र र जनै',
    description: 'वैदिक पूजा, जप तथा तर्पणका लागि पवित्र कुशबाट हातले उनिएको आसन र पवित्र औंठी।',
    tags: ['कुश', 'पवित्री', 'कुशासन', 'तर्पण', 'आसन'],
    suggestedPrice: 280,
    samagriList: ['कुशको आसन', 'कुशको पवित्री औंठी ३ थान', 'कालो तिल'],
    imageUrl: createVedicThaliItemSvg({
      thaliType: 'shraddha',
      titleNepali: 'पवित्र कुशको औंठी (पवित्री) र कुशको आसन',
      subtitleNepali: 'वैदिक पूजा, जप तथा तर्पणका लागि पवित्र कुशबाट हातले उनिएको आसन र औंठी',
      categoryNepali: 'वस्त्र र जनै',
      samagriItems: ['कुशको आसन', 'कुशको पवित्री औंठी ३ थान', 'कालो तिल'],
      theme: {
        bgStart: '#14532D',
        bgMid: '#166534',
        bgEnd: '#052E16',
        accent: '#86EFAC',
        rimGold: '#BBF7D0',
      },
      highlightBadge: 'प्राकृतिक पवित्र कुश निर्मित',
    }),
  },
];

/**
 * Filter gallery items by search query and category
 */
export function getFilteredPujaGalleryItems(
  items: PujaGalleryItem[],
  categoryFilter: PujaGalleryCategory | 'all',
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

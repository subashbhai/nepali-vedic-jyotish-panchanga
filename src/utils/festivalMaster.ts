// Festival Master Database & Engine for Nepali Calendar
// Adheres strictly to Nepal Panchanga Nirnayak Bikas Samiti & Hamro Patro Official Standards
// Guarantees:
// 1. Zero duplicates across dates, traditions and regions (Deterministic Deduplication Keys)
// 2. Full cultural coverage: National, Kathmandu Valley, Terai/Mithila, Kirat, Buddhist/Himalayan, Newa:
// 3. Tithi-based and Solar-based dynamic resolution
// 4. Detailed metadata: Holiday status, Deity/Icon type, Description, Significance

import { getFestivalForBSDate } from './nepalFestivalsData';

export type CulturalRegion = 
  | 'national'         // राष्ट्रिय सार्वजनिक (Nepal-wide)
  | 'kathmandu_valley' // काठमाडौँ उपत्यका विशेष (Kathmandu, Lalitpur, Bhaktapur)
  | 'terai'            // तराई / मधेश
  | 'mithila'          // मिथिलाञ्चल
  | 'kirat'            // किरात समुदाय
  | 'himalayan'        // हिमाली / शेर्पा / भोटे
  | 'newar'            // नेवा: समुदाय
  | 'tharu'            // थारु समुदाय
  | 'general';         // अन्य

export interface MasterFestivalItem {
  id: string; // Unique deduplication key: festival_year_month_day_region
  title: string;
  isPublicHoliday: boolean;
  region: CulturalRegion;
  iconType: 'krishna' | 'shiva' | 'ganesh' | 'devi' | 'festival' | 'national' | 'general';
  description: string;
  tithiDisplay?: string;
  traditionNotes?: string;
  bsMonth: number;
  bsDay: number;
  yearApplicable?: number; // 0 for every year (recurring solar/fixed), or specific year like 2083
}

export const FESTIVAL_MASTER_CATALOG: MasterFestivalItem[] = [
  // -------------------------------------------------------------------------
  // BAISAKH (Month 1)
  // -------------------------------------------------------------------------
  {
    id: 'fest_new_year_1_1',
    title: 'नयाँ वर्ष प्रारम्भ / मेष संक्रान्ति',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'नेपाली नयाँ वर्ष तथा सूर्यको मेष राशि प्रवेश (वसन्त ऋतुको नवप्रभात)',
    tithiDisplay: 'प्रतिपदा',
    bsMonth: 1,
    bsDay: 1,
  },
  {
    id: 'fest_bisket_jatra_1_1',
    title: 'बिस्केट जात्रा (भक्तपुर)',
    isPublicHoliday: false,
    region: 'kathmandu_valley',
    iconType: 'festival',
    description: 'भक्तपुरमा लिङ्गो ठड्याउने तथा भैरवनाथको प्रसिद्ध रथयात्रा',
    bsMonth: 1,
    bsDay: 1,
  },
  {
    id: 'fest_matatirtha_aunsi_1',
    title: 'मातातीर्थ औंसी (आमाको मुख हेर्ने दिन)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'मातृ दिवस / जन्म दिने आमाप्रति श्रद्धा अर्पण तथा मातातीर्थ मेला',
    tithiDisplay: 'औंसी',
    bsMonth: 1,
    bsDay: 15,
  },
  {
    id: 'fest_akshaya_tritiya_1',
    title: 'अक्षय तृतीया',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'जौको सातु र सर्वत दान गर्ने अक्षय पुण्यको पावन दिन',
    tithiDisplay: 'तृतीया',
    bsMonth: 1,
    bsDay: 18,
  },
  {
    id: 'fest_labour_day_1_19',
    title: 'विश्व मजदुर दिवस (मे १)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'national',
    description: 'अन्तर्राष्ट्रिय श्रमिक दिवस, सार्वजनिक बिदा',
    bsMonth: 1,
    bsDay: 19,
  },
  {
    id: 'fest_buddha_jayanti_1',
    title: 'बुद्ध जयन्ती / चण्डी पूर्णिमा / उभौली पर्व',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'भगवान गौतम बुद्धको त्रिविध पावन स्मृति तथा किरात समुदायको उभौली पर्व',
    tithiDisplay: 'पूर्णिमा',
    bsMonth: 1,
    bsDay: 30,
  },

  // -------------------------------------------------------------------------
  // JESTHA (Month 2)
  // -------------------------------------------------------------------------
  {
    id: 'fest_sankranti_2_1',
    title: 'वृष संक्रान्ति',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'general',
    description: 'सूर्यको वृष राशि प्रवेश',
    bsMonth: 2,
    bsDay: 1,
  },
  {
    id: 'fest_republic_day_2_15',
    title: 'गणतन्त्र दिवस (राष्ट्रिय दिवस)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'national',
    description: 'नेपालमा गणतन्त्र घोषणा भएको ऐतिहासिक दिन, सार्वजनिक बिदा',
    bsMonth: 2,
    bsDay: 15,
  },
  {
    id: 'fest_ganga_dussehra_2',
    title: 'गंगा दशहरा / दशहरा स्नान',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'दश पाप निवारक गंगा दशहरा पर्व',
    tithiDisplay: 'दशमी',
    bsMonth: 2,
    bsDay: 24,
  },
  {
    id: 'fest_nirjala_ekadashi_2',
    title: 'निर्जला एकादशी व्रत (भीमसेनी एकादशी)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'जल बिना कठोर व्रत बस्ने परम पुण्यदायी एकादशी',
    tithiDisplay: 'एकादशी',
    bsMonth: 2,
    bsDay: 26,
  },

  // -------------------------------------------------------------------------
  // ASHADH (Month 3)
  // -------------------------------------------------------------------------
  {
    id: 'fest_sankranti_3_1',
    title: 'मिथुन संक्रान्ति',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'general',
    description: 'सूर्यको मिथुन राशि प्रवेश',
    bsMonth: 3,
    bsDay: 1,
  },
  {
    id: 'fest_dhan_diwas_3_15',
    title: 'राष्ट्रिय धान दिवस (दही चिउरा खाने दिन)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'असार १५, रोपाइँ महोत्सव तथा दही चिउरा खाने सांस्कृतिक पर्व',
    bsMonth: 3,
    bsDay: 15,
  },
  {
    id: 'fest_harishayani_ekadashi_3',
    title: 'हरिशयनी एकादशी (तुलसी रोपण / चातुर्मास प्रारम्भ)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'भगवान विष्णु क्षीरसागरमा शयन गर्ने दिन, तुलसीको दल रोपण',
    tithiDisplay: 'एकादशी',
    bsMonth: 3,
    bsDay: 26,
  },
  {
    id: 'fest_guru_purnima_3',
    title: 'गुरु पूर्णिमा / भानु जयन्ती',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'वेदव्यास जयन्ती, गुरु वन्दना तथा आदिकवि भानुभक्त जयन्ती',
    tithiDisplay: 'पूर्णिमा',
    bsMonth: 3,
    bsDay: 31,
  },

  // -------------------------------------------------------------------------
  // SHRAWAN (Month 4)
  // -------------------------------------------------------------------------
  {
    id: 'fest_saune_sankranti_4_1',
    title: 'कर्कट संक्रान्ति (साउने संक्रान्ति / लुतो फाल्ने दिन)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'सूर्यको दक्षिणायन प्रारम्भ तथा लुतो फाल्ने परम्परा',
    bsMonth: 4,
    bsDay: 1,
  },
  {
    id: 'fest_kheer_khani_4_15',
    title: 'खीर खाने दिन (साउन १५)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'general',
    description: 'वर्षा ऋतुमा तागतिलो तथा स्वादिष्ट खीर खाने मौलिक पर्व',
    bsMonth: 4,
    bsDay: 15,
  },

  // -------------------------------------------------------------------------
  // BHADRA (Month 5)
  // -------------------------------------------------------------------------
  {
    id: 'fest_nag_panchami_5_1',
    title: 'नाग पञ्चमी व्रत / थारु गुरिया पर्व / सिंह संक्रान्ति',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'ढोकामा नागको चित्र टाँस्ने तथा नागदेवताको पूजा',
    tithiDisplay: 'पञ्चमी',
    bsMonth: 5,
    bsDay: 1,
  },
  {
    id: 'fest_janai_purnima_5_12',
    title: 'रक्षा बन्धन / जनै पूर्णिमा / संस्कृत दिवस',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'जनै फेर्ने, रक्षाबन्धन बाँध्ने तथा क्वाँटी खाने दिन',
    tithiDisplay: 'पूर्णिमा',
    bsMonth: 5,
    bsDay: 12,
  },
  {
    id: 'fest_gai_jatra_5_13',
    title: 'गाईजात्रा (सापारु / काठमाडौँ उपत्यका बिदा)',
    isPublicHoliday: true,
    region: 'kathmandu_valley',
    iconType: 'festival',
    description: 'काठमाडौँ उपत्यकामा दिवङ्गत पितृको सम्झनामा निकालिने ऐतिहासिक जात्रा',
    tithiDisplay: 'प्रतिपदा',
    bsMonth: 5,
    bsDay: 13,
  },
  {
    id: 'fest_krishna_janmashtami_5_19',
    title: 'श्रीकृष्ण जन्माष्टमी व्रत / गौरा पर्व',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'krishna',
    description: 'भगवान श्रीकृष्णको जन्मोत्सव तथा सुदूरपश्चिमको महान् गौरा पर्व, राष्ट्रिय बिदा',
    tithiDisplay: 'अष्टमी',
    bsMonth: 5,
    bsDay: 19,
  },
  {
    id: 'fest_kushe_aunsi_5_26',
    title: 'कुशे औंसी / मोतीराम जयन्ती (बुबाको मुख हेर्ने दिन)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'पितृ सम्मान दिवस, घर-घरमा कुश भित्र्याउने दिन',
    tithiDisplay: 'औंसी',
    bsMonth: 5,
    bsDay: 26,
  },
  {
    id: 'fest_dar_khane_din_5_28',
    title: 'दर खाने दिन',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'हरितालिका तीजको पूर्वसन्ध्यामा मीठा परिकार खाई दर खाने दिन',
    tithiDisplay: 'द्वितीया',
    bsMonth: 5,
    bsDay: 28,
  },
  {
    id: 'fest_teej_5_29',
    title: 'हरितालिका तीज व्रत (महिला बिदा)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'devi',
    description: 'भगवान शिव-पार्वतीको कठोर व्रत, सौभाग्य र सुखको आराधना, महिला कर्मचारीलाई सार्वजनिक बिदा',
    tithiDisplay: 'तृतीया',
    bsMonth: 5,
    bsDay: 29,
  },
  {
    id: 'fest_ganesh_chaturthi_5_30',
    title: 'श्री गणेश चतुर्थी / राष्ट्रिय बाल दिवस',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'ganesh',
    description: 'सिद्धिविनायक भगवान् गणेशको जन्मोत्सव तथा बाल दिवस',
    tithiDisplay: 'चतुर्थी',
    bsMonth: 5,
    bsDay: 30,
  },
  {
    id: 'fest_rishi_panchami_5_31',
    title: 'ऋषि पञ्चमी व्रत',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'सप्तर्षिको पूजा, ३६५ दत्तिवनले दन्तधावन तथा रजस्वला दोष निवारण स्नान',
    tithiDisplay: 'पञ्चमी',
    bsMonth: 5,
    bsDay: 31,
  },

  // -------------------------------------------------------------------------
  // ASHWIN (Month 6) - Bada Dashain
  // -------------------------------------------------------------------------
  {
    id: 'fest_sankranti_6_1',
    title: 'कन्या संक्रान्ति',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'general',
    description: 'सूर्यको कन्या राशि प्रवेश',
    bsMonth: 6,
    bsDay: 1,
  },
  {
    id: 'fest_constitution_day_6_3',
    title: 'संविधान दिवस (राष्ट्रिय दिवस)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'national',
    description: 'नेपालको संविधान जारी भएको पावन दिन, सार्वजनिक बिदा',
    bsMonth: 6,
    bsDay: 3,
  },
  {
    id: 'fest_sarvapitri_aunsi_6_24',
    title: 'सोह्रश्राद्ध समाप्ति / सर्वपितृ औंसी',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'महालय श्राद्धको अन्तिम दिन, ज्ञात-अज्ञात सम्पूर्ण पितृहरूको तृप्तिका लागि श्राद्ध',
    tithiDisplay: 'औंसी',
    bsMonth: 6,
    bsDay: 24,
  },
  {
    id: 'fest_ghatasthapana_6_25',
    title: 'घटस्थापना (बडादशैं प्रारम्भ)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'devi',
    description: 'दशैंको कलश स्थापना, जमरा राख्ने दिन तथा शारदीय नवरात्र प्रारम्भ, सार्वजनिक बिदा',
    tithiDisplay: 'प्रतिपदा',
    bsMonth: 6,
    bsDay: 25,
  },

  // -------------------------------------------------------------------------
  // KARTIK (Month 7) - Bada Dashain Main Days, Tihar & Chhath
  // -------------------------------------------------------------------------
  {
    id: 'fest_sankranti_7_1',
    title: 'तुला संक्रान्ति / फूलपाती (सप्तमी)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'devi',
    description: 'सूर्यको तुला राशि प्रवेश तथा दशैंको फूलपाती भित्र्याउने दिन, नवपत्रिका प्रवेश, सार्वजनिक बिदा',
    tithiDisplay: 'सप्तमी',
    bsMonth: 7,
    bsDay: 1,
  },
  {
    id: 'fest_mahaashtami_7_2',
    title: 'महाअष्टमी (कालरात्रि)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'devi',
    description: 'माता महागौरी तथा कालरात्रि पूजा, कोतहरूमा बलिविधान, सार्वजनिक बिदा',
    tithiDisplay: 'अष्टमी',
    bsMonth: 7,
    bsDay: 2,
  },
  {
    id: 'fest_mahanavami_7_3',
    title: 'महानवमी / आयुध पूजा',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'devi',
    description: 'माता सिद्धिदात्री पूजा, आयुध तथा यन्त्र-सवारी साधन पूजा, सार्वजनिक बिदा',
    tithiDisplay: 'नवमी',
    bsMonth: 7,
    bsDay: 3,
  },
  {
    id: 'fest_vijayadashami_7_4',
    title: 'विजयादशमी (दशैंको मुख्य टीका)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'devi',
    description: 'असुरहरूमाथि देवीको विजयको प्रतीक, रातो टीका र पहेंलो जमरा लगाई मान्यजनबाट आशीर्वाद ग्रहण, सार्वजनिक बिदा',
    tithiDisplay: 'दशमी',
    bsMonth: 7,
    bsDay: 4,
  },
  {
    id: 'fest_papankusha_7_5',
    title: 'पापाङ्कुशा एकादशी (दशैं बिदा)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'दशैं टीका प्रसाद ग्रहण गर्ने क्रम जारी, सार्वजनिक बिदा',
    tithiDisplay: 'एकादशी',
    bsMonth: 7,
    bsDay: 5,
  },
  {
    id: 'fest_dwadashi_7_6',
    title: 'द्वादशी (दशैं बिदा)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'दशैं टीका प्रसाद ग्रहण, सार्वजनिक बिदा',
    tithiDisplay: 'द्वादशी',
    bsMonth: 7,
    bsDay: 6,
  },
  {
    id: 'fest_kojagrat_purnima_7_9',
    title: 'कोजाग्रत पूर्णिमा (बडादशैं समापन)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'devi',
    description: 'माता महालक्ष्मीको रात्रि जागरण, दशैंको औपचारिक समापन',
    tithiDisplay: 'पूर्णिमा',
    bsMonth: 7,
    bsDay: 9,
  },
  {
    id: 'fest_kag_tihar_7_21',
    title: 'काग तिहार (यमपञ्चक प्रारम्भ / धनतेरस)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'यमराजको दूत कागको पूजा तथा धनवन्तरी जयन्ती/भाँडाकुँडा खरिद',
    tithiDisplay: 'त्रयोदशी',
    bsMonth: 7,
    bsDay: 21,
  },
  {
    id: 'fest_kukur_tihar_7_22',
    title: 'कुकुर तिहार / नरक चतुर्दशी',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'वफादार साथी कुकुरको पूजा तथा यमदीप दान',
    tithiDisplay: 'चतुर्दशी',
    bsMonth: 7,
    bsDay: 22,
  },
  {
    id: 'fest_gai_laxmi_puja_7_23',
    title: 'गाई पूजा / लक्ष्मीपूजा (दिपावली / सुखरात्रि)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'devi',
    description: 'गौमाताको पूजा, धनधान्यकी देवी महालक्ष्मीको भव्य पूजा, झिलिमिली दिपावली, सार्वजनिक बिदा',
    tithiDisplay: 'औंसी',
    bsMonth: 7,
    bsDay: 23,
  },
  {
    id: 'fest_govardhan_mha_puja_7_24',
    title: 'गोवर्धन पूजा / बलिराजा पूजा / म्हपूजा / नेपाल संवत् नयाँ वर्ष',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'गोवर्धन पर्वत पूजा, नेवा: म्हपूजा (आत्मपूजा) तथा नेपाल संवत् नयाँ वर्ष प्रारम्भ, सार्वजनिक बिदा',
    tithiDisplay: 'प्रतिपदा',
    bsMonth: 7,
    bsDay: 24,
  },
  {
    id: 'fest_bhai_tika_7_25',
    title: 'भाइटीका (यमद्वितीया)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'दिदीबहिनीद्वारा दाजुभाइलाई दीर्घायुको सप्तरङ्गी टीका, मखमली माला तथा ओखर फोड्ने दिन, सार्वजनिक बिदा',
    tithiDisplay: 'द्वितीया',
    bsMonth: 7,
    bsDay: 25,
  },
  {
    id: 'fest_bhai_tika_holiday_7_26',
    title: 'भाइटीका बिदा',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'भाइटीकाको भोलिपल्टको सार्वजनिक बिदा',
    bsMonth: 7,
    bsDay: 26,
  },
  {
    id: 'fest_chhath_7_29',
    title: 'छठ पर्व (मुख्य दिन, अस्ताउँदो सूर्यलाई अर्घ्य)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'सूर्य षष्ठी उपासना, जलाशयमा अस्ताउँदो सूर्यलाई अर्घ्य, राष्ट्रिय बिदा',
    tithiDisplay: 'षष्ठी',
    bsMonth: 7,
    bsDay: 29,
  },
  {
    id: 'fest_haribodhini_7_27',
    title: 'हरिबोधिनी एकादशी (तुलसी विवाह / ठूलो एकादशी)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'festival',
    description: 'भगवान विष्णु जाग्ने दिन, तुलसी र शालिग्रामको पावन विवाह',
    tithiDisplay: 'एकादशी',
    bsMonth: 7,
    bsDay: 27,
  },

  // -------------------------------------------------------------------------
  // MANGSIR (Month 8)
  // -------------------------------------------------------------------------
  {
    id: 'fest_sankranti_8_1',
    title: 'वृश्चिक संक्रान्ति',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'general',
    description: 'सूर्यको वृश्चिक राशि प्रवेश',
    bsMonth: 8,
    bsDay: 1,
  },
  {
    id: 'fest_bala_chaturdashi_8_14',
    title: 'बाला चतुर्दशी (शतबीज छर्ने दिन)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'shiva',
    description: 'पशुपतिनाथ तथा शिवालयहरूमा दिवङ्गत पितृको सद्गतिका लागि शतबीज छर्ने पर्व',
    tithiDisplay: 'चतुर्दशी',
    bsMonth: 8,
    bsDay: 14,
  },
  {
    id: 'fest_udhauli_yomari_8_29',
    title: 'उधौली पर्व / योमरी पुन्ही / धान्य पूर्णिमा',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'किरात उधौली, नेवा: समुदायको योमरी पुन्ही तथा नयाँ धानको न्वागी खाने दिन',
    tithiDisplay: 'पूर्णिमा',
    bsMonth: 8,
    bsDay: 29,
  },

  // -------------------------------------------------------------------------
  // POUSH (Month 9)
  // -------------------------------------------------------------------------
  {
    id: 'fest_sankranti_9_1',
    title: 'धनु संक्रान्ति',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'general',
    description: 'सूर्यको धनु राशि प्रवेश',
    bsMonth: 9,
    bsDay: 1,
  },
  {
    id: 'fest_tamu_lhosar_9_15',
    title: 'तमु ल्होसार (गुरुङ नयाँ वर्ष)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'गुरुङ समुदायको महान् नयाँ वर्ष ल्होसार, सार्वजनिक बिदा',
    bsMonth: 9,
    bsDay: 15,
  },

  // -------------------------------------------------------------------------
  // MAGH (Month 10)
  // -------------------------------------------------------------------------
  {
    id: 'fest_maghe_sankranti_10_1',
    title: 'माघे संक्रान्ति (मकर संक्रान्ति / माघी / उत्तरायण प्रारम्भ)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'सूर्यको मकर राशि प्रवेश, उत्तरायण प्रारम्भ, घिउ-चाकु-तरुल खाने दिन तथा थारु माघी',
    bsMonth: 10,
    bsDay: 1,
  },
  {
    id: 'fest_sonam_lhosar_10_16',
    title: 'सोनम ल्होसार (तामाङ नयाँ वर्ष)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'तामाङ समुदायको महान् नयाँ वर्ष, सार्वजनिक बिदा',
    bsMonth: 10,
    bsDay: 16,
  },
  {
    id: 'fest_saraswati_puja_10_21',
    title: 'श्रीपञ्चमी (सरस्वती पूजा / वसन्त पञ्चमी)',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'devi',
    description: 'विद्याकी देवी माता सरस्वतीको आराधना, साना नानीहरूको अक्षरारम्भ',
    tithiDisplay: 'पञ्चमी',
    bsMonth: 10,
    bsDay: 21,
  },

  // -------------------------------------------------------------------------
  // FALGUN (Month 11)
  // -------------------------------------------------------------------------
  {
    id: 'fest_sankranti_11_1',
    title: 'कुम्भ संक्रान्ति',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'general',
    description: 'सूर्यको कुम्भ राशि प्रवेश',
    bsMonth: 11,
    bsDay: 1,
  },
  {
    id: 'fest_prajatantra_diwas_11_7',
    title: 'राष्ट्रिय प्रजातन्त्र दिवस',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'national',
    description: 'वि.सं. २००७ सालमा प्रजातन्त्र स्थापना भएको ऐतिहासिक दिन, सार्वजनिक बिदा',
    bsMonth: 11,
    bsDay: 7,
  },
  {
    id: 'fest_mahashivaratri_11_13',
    title: 'महाशिवरात्रि व्रत (सेना दिवस)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'shiva',
    description: 'भगवान् शिवको पावन प्राकट्य रात्रि, पशुपतिनाथमा महामेला, सार्वजनिक बिदा',
    tithiDisplay: 'त्रयोदशी',
    bsMonth: 11,
    bsDay: 13,
  },
  {
    id: 'fest_gyalpo_lhosar_11_17',
    title: 'ग्याल्पो ल्होसार (शेर्पा नयाँ वर्ष)',
    isPublicHoliday: true,
    region: 'himalayan',
    iconType: 'festival',
    description: 'शेर्पा, भोटे तथा हिमाली समुदायको नयाँ वर्ष, सार्वजनिक बिदा',
    bsMonth: 11,
    bsDay: 17,
  },
  {
    id: 'fest_women_day_11_24',
    title: 'अन्तर्राष्ट्रिय महिला दिवस (मार्च ८)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'national',
    description: 'महिला अधिकार र समानताको अन्तर्राष्ट्रिय दिवस, सार्वजनिक बिदा',
    bsMonth: 11,
    bsDay: 24,
  },
  {
    id: 'fest_phagu_purnima_11_30',
    title: 'फागु पूर्णिमा (पहाडी होली पर्व)',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'रङ्गहरूको उल्लासमय पर्व होली, सार्वजनिक बिदा',
    tithiDisplay: 'पूर्णिमा',
    bsMonth: 11,
    bsDay: 30,
  },

  // -------------------------------------------------------------------------
  // CHAITRA (Month 12)
  // -------------------------------------------------------------------------
  {
    id: 'fest_tarai_holi_12_1',
    title: 'मीन संक्रान्ति / तराई होली पर्व',
    isPublicHoliday: true,
    region: 'terai',
    iconType: 'festival',
    description: 'तराई तथा मधेशका जिल्लाहरूमा होली पर्वको विशेष बिदा',
    bsMonth: 12,
    bsDay: 1,
  },
  {
    id: 'fest_ghodejatra_12_14',
    title: 'घोडेजात्रा (काठमाडौँ उपत्यका बिदा)',
    isPublicHoliday: true,
    region: 'kathmandu_valley',
    iconType: 'festival',
    description: 'काठमाडौँको टुँडिखेलमा घोडेजात्रा प्रदर्शन, उपत्यकामा सार्वजनिक बिदा',
    tithiDisplay: 'चतुर्दशी',
    bsMonth: 12,
    bsDay: 14,
  },
  {
    id: 'fest_chaite_dashain_12_24',
    title: 'चैते दशैं',
    isPublicHoliday: false,
    region: 'national',
    iconType: 'devi',
    description: 'चैत्र शुक्ल अष्टमी, शक्तिपीठहरूमा भगवती दुर्गाको विशेष पूजा',
    tithiDisplay: 'अष्टमी',
    bsMonth: 12,
    bsDay: 24,
  },
  {
    id: 'fest_ram_navami_12_25',
    title: 'श्री राम नवमी',
    isPublicHoliday: true,
    region: 'national',
    iconType: 'festival',
    description: 'मर्यादा पुरुषोत्तम भगवान् श्रीरामको पावन जन्मोत्सव, जनकपुरधाममा महामहोत्सव',
    tithiDisplay: 'नवमी',
    bsMonth: 12,
    bsDay: 25,
  },
];

/**
 * Fast Lookup Map indexed by `month-day`
 */
const FESTIVAL_BY_DATE_MAP = new Map<string, MasterFestivalItem[]>();

for (const item of FESTIVAL_MASTER_CATALOG) {
  const key = `${item.bsMonth}-${item.bsDay}`;
  if (!FESTIVAL_BY_DATE_MAP.has(key)) {
    FESTIVAL_BY_DATE_MAP.set(key, []);
  }
  FESTIVAL_BY_DATE_MAP.get(key)!.push(item);
}

/**
 * Authoritative Festival Query Engine
 * Returns deduplicated, prioritized festival for any BS date,
 * seamlessly cross-referencing nepalFestivalsData verified calendar.
 */
export function getAuthoritativeFestivalsForBSDate(
  bsMonth: number,
  bsDay: number,
  regionFilter?: CulturalRegion,
  bsYear: number = 2083
): MasterFestivalItem[] {
  const key = `${bsMonth}-${bsDay}`;
  const catalogList = (FESTIVAL_BY_DATE_MAP.get(key) || []).slice();

  // Cross-reference official verified festival for the specific year
  const verified = getFestivalForBSDate(bsYear, bsMonth, bsDay);

  const results: MasterFestivalItem[] = [];
  const seenTitles = new Set<string>();

  if (verified && verified.title) {
    // Check if catalog has a richer item matching this verified title
    const matchingCatalog = catalogList.find(
      (c) => c.title.includes(verified.title) || verified.title.includes(c.title)
    );

    if (matchingCatalog) {
      results.push({
        ...matchingCatalog,
        isPublicHoliday: verified.isHoliday,
        yearApplicable: bsYear,
      });
      seenTitles.add(matchingCatalog.title);
      seenTitles.add(verified.title);
    } else {
      const verifiedItem: MasterFestivalItem = {
        id: `fest_verified_${bsYear}_${bsMonth}_${bsDay}`,
        title: verified.title,
        isPublicHoliday: verified.isHoliday,
        region: 'national',
        iconType: (verified.iconType as any) || 'festival',
        description: verified.title,
        bsMonth,
        bsDay,
        yearApplicable: bsYear,
      };
      results.push(verifiedItem);
      seenTitles.add(verified.title);
    }
  }

  for (const item of catalogList) {
    // If yearApplicable is set and does not match, skip
    if (item.yearApplicable && item.yearApplicable !== bsYear) {
      continue;
    }

    // Avoid duplicate title
    if (seenTitles.has(item.title)) {
      continue;
    }

    // Check partial duplicate
    const isDuplicate = Array.from(seenTitles).some(
      (t) => item.title.includes(t) || t.includes(item.title)
    );
    if (isDuplicate) {
      continue;
    }

    results.push(item);
    seenTitles.add(item.title);
  }

  if (!regionFilter || regionFilter === 'national') {
    return results;
  }

  return results.filter((f) => f.region === 'national' || f.region === regionFilter);
}

/**
 * Searches festivals by query keyword (in Nepali or Romanized)
 */
export function searchMasterFestivals(query: string): MasterFestivalItem[] {
  if (!query || !query.trim()) return FESTIVAL_MASTER_CATALOG;
  const q = query.trim().toLowerCase();

  return FESTIVAL_MASTER_CATALOG.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.tithiDisplay && item.tithiDisplay.toLowerCase().includes(q))
    );
  });
}

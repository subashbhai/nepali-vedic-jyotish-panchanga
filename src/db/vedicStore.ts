import {
  Product,
  StoreCoupon,
  StoreOrder,
  StoreReview,
  CartItem,
  StoreCategoryKey,
  OrderStatus,
  PaymentMethod,
  DeliveryMethod,
  EsewaPaymentSubmission,
  DailyCashRegister,
  SalesReturn,
  InventoryLog,
  AuditLog,
  StoreUserRole
} from '../types/vedicStoreTypes';
import { PUJA_SAMAGRI_GALLERY_DATABASE } from '../utils/pujaSamagriGalleryEngine';

const STORAGE_KEYS = {
  PRODUCTS: 'balananda_vedic_products_v4',
  ORDERS: 'balananda_vedic_orders_v1',
  COUPONS: 'balananda_vedic_coupons_v1',
  CART: 'balananda_vedic_cart_v1',
  WISHLIST: 'balananda_vedic_wishlist_v1',
  REVIEWS: 'balananda_vedic_reviews_v1',
  AUDIT_LOGS: 'balananda_vedic_audit_logs_v1',
  INVENTORY_LOGS: 'balananda_vedic_inventory_logs_v1',
  CASH_REGISTER: 'balananda_vedic_cash_register_v1',
  SALES_RETURNS: 'balananda_vedic_sales_returns_v1',
};

const getGalleryImg = (id: string, fallbackIdx = 0): string => {
  const found = PUJA_SAMAGRI_GALLERY_DATABASE.find(i => i.id === id);
  return found?.imageUrl || PUJA_SAMAGRI_GALLERY_DATABASE[fallbackIdx]?.imageUrl || '';
};

// 25+ Realistic Demo Products
export const INITIAL_DEMO_PRODUCTS: Product[] = [
  // 1. Puja Package - Grihapravesh
  {
    id: 'prod_pkg_grihapravesh',
    sku: 'PKG-GHP-001',
    barcode: '890100100101',
    nameNepali: 'गृहप्रवेश पूजा सामग्री सम्पूर्ण सेट (Package)',
    nameEnglish: 'Griha Pravesh Puja Complete Set Package',
    category: 'puja_package',
    subCategory: 'कर्मकाण्ड प्याकेज',
    shortDescription: 'गृहप्रवेश र वास्तु पूजाका लागि आवश्यक सम्पूर्ण ४२ प्रकारका पूजा सामग्रीहरूको तयारी प्याकेज।',
    fullDescription: 'नयाँ घरको गृहप्रवेश गर्दा वैदिक विधि अनुसार वास्तु शमन, नवग्रह पूजन, गणेश पूजन, कलश स्थापन तथा हवनका लागि आवश्यक सम्पूर्ण शुद्ध सामग्रीहरू व्यवस्थित रूपमा यस सेटमा उपलब्ध छ।',
    packageItems: [
      'तामाको कलश १ थान',
      'तामाको पञ्चपात्र र अर्घ्यपात्र सेट',
      'शुद्ध गाईको घ्यू ५०० ग्राम',
      'हवन सामग्री प्याकेट (५०० ग्राम)',
      'समिधा काठ (अम्बा, पिपल, शमी) २ केजी',
      'केसर र रातो चन्दन काठ',
      'अक्षता (अक्षत धान/चामल)',
      'कपूर, धूप र दीप धागो',
      'मौली धागो (कच्चा धागो र पोते)',
      'कुश, टपरी र दुना सेट',
      'अबीर, केोसरी, सिन्दूर र गुलाल',
      'जौ, तिल, सर्वोषधि र पञ्चरत्न',
      'यज्ञोपवीत (जनै) ५ जोडी',
      'शंख र सानो पूजा घण्टी'
    ],
    purchasePrice: 1800,
    sellingPrice: 2500,
    discountPrice: 2200,
    stockQuantity: 28,
    minStockLevel: 5,
    supplier: 'बालानन्द वैदिक सामग्री भण्डार',
    unit: 'सेट',
    weightGram: 4500,
    rating: 4.9,
    reviewsCount: 34,
    imageUrl: getGalleryImg('ps_grihapravesh', 0),
    isActive: true,
    isFeatured: true,
    isPopular: true,
    isBestSeller: true,
  },

  // 2. Puja Package - Vivah
  {
    id: 'prod_pkg_vivah',
    sku: 'PKG-VVH-002',
    barcode: '890100100102',
    nameNepali: 'विवाह पूजा सामग्री सम्पूर्ण सेट',
    nameEnglish: 'Complete Vedic Marriage Ritual Kit',
    category: 'puja_package',
    subCategory: 'विवाह सामग्री',
    shortDescription: 'सनातन वैदिक विवाह संस्कारका लागि चाहिने सम्पूर्ण लग्नमण्डप, स्वयंवर र हवन सामग्री सेट।',
    fullDescription: 'वैदिक विवाह विधि सम्पन्न गर्न चाहिने लगनगाँठो, माला, कुशाग्र, हवन सामग्री, सिन्दूर, मौली, पञ्चरत्न, सप्तपदी वस्त्र र पूजा पात्रहरू सहितको प्रामाणिक सेट।',
    packageItems: [
      'स्वयंवर दुबो र फूलमाला जोडी',
      'लगनगाँठो रातो/पहेंलो कपडा',
      'शुद्ध सिन्दूर र काँसको कचौरा',
      'तामाको अर्घ्य पात्र र कलश',
      'लाजा (धानको खैरो/लाभा) १ केजी',
      'हवन सामग्री र घ्यू',
      'यज्ञोपवीत र दुबो',
      'पञ्चगव्य सामग्री सेट'
    ],
    purchasePrice: 2800,
    sellingPrice: 3800,
    discountPrice: 3400,
    stockQuantity: 15,
    minStockLevel: 3,
    supplier: 'नेपाल वैदिक स्टोर, काठमाडौं',
    unit: 'सेट',
    weightGram: 5200,
    rating: 5.0,
    reviewsCount: 19,
    imageUrl: getGalleryImg('ps_vivah_kit', 1),
    isActive: true,
    isFeatured: true,
    isPopular: true,
  },

  // 3. Puja Package - Bartabandha
  {
    id: 'prod_pkg_bartabandha',
    sku: 'PKG-BRT-003',
    barcode: '890100100103',
    nameNepali: 'व्रतबन्ध तथा उपनयन पूजा सामग्री सेट',
    nameEnglish: 'Bartabandha & Upanayan Ritual Kit',
    category: 'puja_package',
    subCategory: 'संस्कार सामग्री',
    shortDescription: 'बटुकको व्रतबन्ध संस्कारका लागि मृगछाला, पलाँसको दण्ड, जनै, गेरु वस्त्र र हवन सामग्री।',
    fullDescription: 'उपनयन (व्रतबन्ध) संस्कारका लागि धर्मशास्त्र अनुसार आवश्यक बटुक वस्त्र, मेखला, जनै, दण्ड, भिक्षा पात्र, पञ्चगव्य र गायत्री जप पूजा सामग्री।',
    packageItems: [
      'पलाँस/बेलको दण्ड',
      'मेखला मुञ्ज धागो',
      'गेरु र पहेँलो धोती वस्त्र',
      'शुद्ध यज्ञोपवीत (जनै)',
      'भिक्षा पात्र र अक्षता',
      'गायत्री हवन सामग्री'
    ],
    purchasePrice: 1500,
    sellingPrice: 2100,
    discountPrice: 1850,
    stockQuantity: 20,
    minStockLevel: 4,
    unit: 'सेट',
    weightGram: 3100,
    rating: 4.8,
    reviewsCount: 15,
    imageUrl: getGalleryImg('ps_bartabandha', 2),
    isActive: true,
    isFeatured: true,
  },

  // 4. Rudrabhisheka Package
  {
    id: 'prod_pkg_rudra',
    sku: 'PKG-RDR-004',
    barcode: '890100100104',
    nameNepali: 'रुद्राभिषेक तथा शिवपूजा सामग्री Package',
    nameEnglish: 'Rudrabhisheka & Shiva Puja Package',
    category: 'puja_package',
    subCategory: 'शिव पूजा',
    shortDescription: 'एकादश रुद्री, पार्थिव शिवलिङ्ग पूजन र रुद्राभिषेकका लागि सम्पूर्ण जल-दुग्ध-भस्म र बेलपत्र सामग्री।',
    fullDescription: 'भगवान् शिवको प्रिय रुद्राभिषेक अनुष्ठानका लागि शुद्ध भस्म, बेलपत्र, धतुरो, श्रीखण्ड चन्दन, गङ्गाजल, पञ्चामृत र अष्टगन्ध तयार प्याकेज।',
    packageItems: [
      'शुद्ध भस्म र अष्टगन्ध',
      'श्रीखण्ड चन्दन र रोली',
      'तामाको शिवलिङ्ग जलधारी पात्र',
      'गङ्गाजल र केवडा जल',
      'रुद्राक्ष माला र कुश'
    ],
    purchasePrice: 900,
    sellingPrice: 1400,
    discountPrice: 1250,
    stockQuantity: 35,
    minStockLevel: 5,
    unit: 'प्याकेट',
    weightGram: 2200,
    rating: 4.9,
    reviewsCount: 42,
    imageUrl: getGalleryImg('ps_rudrabhishek', 3),
    isActive: true,
    isPopular: true,
    isBestSeller: true,
  },

  // 4b. Navagraha Shanti Package
  {
    id: 'prod_pkg_navagraha',
    sku: 'PKG-NVG-005',
    barcode: '890100100105',
    nameNepali: 'नवग्रह शान्ति तथा ग्रहदोष निवारण सामग्री सेट',
    nameEnglish: 'Navagraha Shanti Complete 21 Samagri Kit',
    category: 'puja_package',
    subCategory: 'कर्मकाण्ड प्याकेज',
    shortDescription: 'केशरी, जौ-तिल, काँचो धागो, पञ्चरत्न, रातो सर्सी, पञ्चपल्लव, रक्तचन्दन, ९ थरी अन्न, ९ थरी कपडा सहित २१ सामग्री।',
    fullDescription: 'सूर्यदेखि केतुसम्म ९ वटै ग्रहहरूको शान्ति, महादशा-अन्तर्दशा निवारणका लागि शास्त्रीय २१ प्रकारका सम्पूर्ण सामग्रीहरूको प्रामाणिक प्याकेज।',
    packageItems: [
      'केशरी र अबीर',
      'जौ र कालो तिल',
      'काँचो धागो (मौली)',
      'पञ्चरत्न एवं सप्तमृत्तिका',
      'रातो सर्सी र पञ्चपल्लव',
      'रक्तचन्दन र श्रीखण्ड चन्दन',
      '९ थरी अन्न (नवधान्य)',
      '९ थरी कपडा (नवग्रह वस्त्र)',
      'बाटेको धूप र अगरबत्ती',
      'सर्वोषधी र कपुर',
      'काटेको बत्ती र ९ सुपारी',
      'खड्क पाला र नवग्रह यन्त्र'
    ],
    purchasePrice: 1100,
    sellingPrice: 1650,
    discountPrice: 1450,
    stockQuantity: 30,
    minStockLevel: 5,
    supplier: 'बालानन्द वैदिक सामग्री भण्डार',
    unit: 'सेट',
    weightGram: 2800,
    rating: 5.0,
    reviewsCount: 52,
    imageUrl: getGalleryImg('ps_navagraha_shanti', 6),
    isActive: true,
    isFeatured: true,
    isPopular: true,
    isBestSeller: true,
  },

  // 4c. Shraddha Pitri Karma Package
  {
    id: 'prod_pkg_shraddha',
    sku: 'PKG-SRD-006',
    barcode: '890100100106',
    nameNepali: 'श्राद्ध तथा पितृकार्य पूजा सामग्री सेट',
    nameEnglish: 'Shraddha & Pitri Karma 12 Samagri Package',
    category: 'puja_package',
    subCategory: 'कर्मकाण्ड प्याकेज',
    shortDescription: 'सुपारी, जनै, धूप बत्ति, कपुर, केशरी, कुमकुम धूप, श्रीखण्ड, सेतो कपडा, घ्यू, मह, जौ-तिल, अष्टसुगन्ध।',
    fullDescription: 'सोह्र श्राद्ध, एकपार्वण, तीर्थ श्राद्ध तथा बरखी श्राद्धका लागि शास्त्रीय विधि अनुसार तयार पारिएको १२ प्रकारका सम्पूर्ण शुद्ध सामग्री।',
    packageItems: [
      'सुपारी',
      'पवित्र जनै',
      'धूप बत्ति',
      'कपुर',
      'केशरी',
      'कुमकुम धूप',
      'श्रीखण्ड चन्दन',
      'सेतो कपडा (धोती/वस्त्र)',
      'शुद्ध गाईको घ्यू र मह',
      'जौ र कालो तिल',
      'पूजा मसला',
      'अष्ट सुगन्ध'
    ],
    purchasePrice: 800,
    sellingPrice: 1250,
    discountPrice: 1100,
    stockQuantity: 40,
    minStockLevel: 6,
    supplier: 'बालानन्द वैदिक सामग्री भण्डार',
    unit: 'सेट',
    weightGram: 1900,
    rating: 4.9,
    reviewsCount: 48,
    imageUrl: getGalleryImg('ps_shraddha_kit', 8),
    isActive: true,
    isFeatured: true,
    isPopular: true,
    isBestSeller: true,
  },

  // 4d. Satyanarayan Puja Package
  {
    id: 'prod_pkg_satyanarayan',
    sku: 'PKG-STN-007',
    barcode: '890100100107',
    nameNepali: 'सत्यनारायण व्रतकथा पूजा सामग्री सेट',
    nameEnglish: 'Satyanarayan Brata Katha Samagri Kit',
    category: 'puja_package',
    subCategory: 'कर्मकाण्ड प्याकेज',
    shortDescription: 'शालिग्राम, पहेँलो वस्त्र, पञ्चामृत सामग्री, तुलसी मंजरी, सपाद भक्षण (प्रसाद) तथा मण्डप सामग्री।',
    fullDescription: 'पूर्णिमा, एकादशी तथा मासिक सत्यनारायण कथा पूजनका लागि आवश्यक सम्पूर्ण पञ्चामृत, वस्त्र, ग्रन्थ, चन्दन र दीप सामग्री।',
    packageItems: [
      'पहेँलो रेशमी कपडा',
      'तुलसी मंजरी',
      'पञ्चामृत सामग्री किट',
      'सत्यनारायण व्रतकथा पुस्तक',
      'पञ्चमेवा र अक्षता',
      'जौ-तिल र सुपारी',
      'शुद्ध गाईको घ्यू र कपुर'
    ],
    purchasePrice: 700,
    sellingPrice: 1100,
    discountPrice: 950,
    stockQuantity: 25,
    minStockLevel: 4,
    supplier: 'बालानन्द वैदिक सामग्री भण्डार',
    unit: 'सेट',
    weightGram: 2100,
    rating: 4.9,
    reviewsCount: 36,
    imageUrl: getGalleryImg('ps_satyanarayan', 5),
    isActive: true,
    isFeatured: true,
  },

  // 5. Puja Samagri - Pure Ghee
  {
    id: 'prod_ghee_cow',
    sku: 'SMG-GHE-005',
    barcode: '890100200101',
    nameNepali: 'हिमाली शुद्ध गाईको घ्यू (Pure Organic Cow Ghee)',
    nameEnglish: 'Pure Organic Himalayan Cow Ghee 1KG',
    category: 'puja_samagri',
    shortDescription: 'पूजा, आरती तथा यज्ञ हवनका लागि प्रयोग गरिने १००% शुद्ध अर्गानिक गाईको घ्यू।',
    fullDescription: 'पहाडी तथा हिमाली गाईको दूधबाट परम्परागत मधानी विधिद्वारा तयार पारिएको सात्त्विक र सुगन्धित घ्यू। पूजा र हवनका लागि अत्यन्त उत्तम।',
    purchasePrice: 950,
    sellingPrice: 1300,
    discountPrice: 1200,
    stockQuantity: 60,
    minStockLevel: 10,
    supplier: 'हिमाली अर्गानिक डेरी',
    unit: 'केजी',
    weightGram: 1000,
    rating: 4.9,
    reviewsCount: 88,
    imageUrl: getGalleryImg('ps_himalayan_cow_ghee', 20),
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
  },

  // 6. Dhoop & Incense
  {
    id: 'prod_dhoop_kasturi',
    sku: 'SMG-DHP-006',
    barcode: '890100200102',
    nameNepali: 'प्राकृतिक कस्तूरी र देवदारु अगरबत्ती (प्रिमियम)',
    nameEnglish: 'Premium Natural Incense Sticks 250g',
    category: 'puja_samagri',
    shortDescription: 'प्राकृतिक जडीबुटी, देवदारु र कस्तूरी सुगन्धयुक्त धुआँरहित धूप अगरबत्ती।',
    fullDescription: 'पूजाकोठा र ध्यानकक्षलाई सुगन्धित र पवित्र बनाउन जडीबुटीहरूको सम्मिश्रणबाट निर्मित धूप। रसायनरहित।',
    purchasePrice: 120,
    sellingPrice: 200,
    discountPrice: 175,
    stockQuantity: 120,
    minStockLevel: 20,
    unit: 'प्याकेट',
    weightGram: 250,
    rating: 4.7,
    reviewsCount: 56,
    imageUrl: getGalleryImg('ps_kasturi_devdaru_agarbatti', 14),
    isActive: true,
    isNewArrival: true,
  },

  // 7. Camphor / Kapoor
  {
    id: 'prod_kapoor_bhimseni',
    sku: 'SMG-KPR-007',
    barcode: '890100200103',
    nameNepali: 'भीमसेनी शुद्ध प्राकृतिक कपूर (Pure Bhimseni Camphor)',
    nameEnglish: 'Pure Bhimseni Camphor 100g',
    category: 'puja_samagri',
    shortDescription: 'आरती र वातावरण शुद्धीकरणका लागि शतप्रतिशत शुद्ध भीमसेनी कपूर।',
    fullDescription: 'पानीमा तैरिने र प्रज्वलित गर्दा खरानी नरहने सक्कली भीमसेनी कपूर। सकारात्मक ऊर्जा अभिवृद्धि गर्न उपयोगी।',
    purchasePrice: 220,
    sellingPrice: 350,
    discountPrice: 300,
    stockQuantity: 45,
    minStockLevel: 8,
    unit: 'प्याकेट',
    weightGram: 100,
    rating: 4.9,
    reviewsCount: 39,
    imageUrl: getGalleryImg('ps_bhimseni_camphor', 18),
    isActive: true,
  },

  // 8. Copper Kalash & Panchapatra Set
  {
    id: 'prod_copper_thali_set',
    sku: 'SMG-CPR-008',
    barcode: '890100200104',
    nameNepali: 'तामाको पूजा थाली, कलश र पञ्चपात्र-अर्घ्यपात्र सेट',
    nameEnglish: 'Pure Copper Puja Thali Set with Kalash & Panchapatra',
    category: 'puja_samagri',
    shortDescription: 'हस्तनिर्मित शुद्ध तामाको पूजा थाली, घण्टी, आरती दीप, कलश र अर्घ्यपात्र सेट।',
    fullDescription: 'पाटनका कालिगडद्वारा परम्परागत ढोका र बुट्टा कुँदेर बनाइएको शुद्ध तामाको टिकाऊ पूजा सेट।',
    purchasePrice: 1200,
    sellingPrice: 1800,
    discountPrice: 1600,
    stockQuantity: 18,
    minStockLevel: 3,
    unit: 'सेट',
    weightGram: 1100,
    rating: 5.0,
    reviewsCount: 27,
    imageUrl: getGalleryImg('ps_copper_kalash_panchapatra', 9),
    isActive: true,
    isFeatured: true,
  },

  // 9. Shankha (Conch Shell)
  {
    id: 'prod_shankha_blow',
    sku: 'SMG-SHK-009',
    barcode: '890100200105',
    nameNepali: 'दक्षिणावर्ती/बजाउने शुद्ध प्राकृतिक शंख (Original Shankha)',
    nameEnglish: 'Original Natural Blowing Shankha',
    category: 'puja_samagri',
    shortDescription: 'पूजा आरतीमा बजाइने मधुर ध्वनि उत्पन्न गर्ने सक्कली प्राकृतिक समुद्र शंख।',
    fullDescription: 'वास्तु दोष निवारण र वातावरणमा सकारात्मक कम्पन ल्याउन सहयोगी शुद्ध प्राकृतिक शंख।',
    purchasePrice: 1100,
    sellingPrice: 1650,
    discountPrice: 1500,
    stockQuantity: 12,
    minStockLevel: 2,
    unit: 'थान',
    weightGram: 650,
    rating: 4.8,
    reviewsCount: 31,
    imageUrl: getGalleryImg('ps_dakshinavarti_shankha', 7),
    isActive: true,
  },

  // 10. Book - Bhagavad Gita
  {
    id: 'prod_bk_gita',
    sku: 'BOK-GIT-010',
    barcode: '890100300101',
    nameNepali: 'श्रीमद्भगवद्गीता (नेपाली अनुवाद र भावार्थ सहित)',
    nameEnglish: 'Shrimad Bhagavad Gita Nepali Translation',
    category: 'religious_books',
    shortDescription: 'महर्षि वेदव्यास रचित ७०० श्लोकको नेपाली अर्थ र व्याख्या सहितको हार्डकभर ग्रन्थ।',
    fullDescription: 'जीवनदर्शन, योग, कर्मयोग र भक्ति ज्ञानले भरिपूर्ण श्रीमद्भगवद्गीताको सरल र सुबोध नेपाली भाषामा व्याख्या।',
    purchasePrice: 400,
    sellingPrice: 650,
    discountPrice: 550,
    stockQuantity: 50,
    minStockLevel: 10,
    unit: 'पुस्तक',
    weightGram: 700,
    rating: 5.0,
    reviewsCount: 112,
    imageUrl: getGalleryImg('ps_bhagavad_gita', 30),
    isActive: true,
    isFeatured: true,
    isPopular: true,
    isBestSeller: true,
    bookDetails: {
      author: 'महर्षि वेदव्यास (अनुवाद: पं. बालानन्द भट्टराई)',
      publisher: 'बालानन्द वैदिक प्रकाशन',
      pages: 580,
      language: 'नेपाली',
      subject: 'श्रीमद्भगवद्गीता / धर्मशास्त्र'
    }
  },

  // 11. Book - Swasthani
  {
    id: 'prod_bk_swasthani',
    sku: 'BOK-SWA-011',
    barcode: '890100300102',
    nameNepali: 'श्रीस्वस्थानी व्रतकथा तथा महात्म्य (सचित्र बृहत्)',
    nameEnglish: 'Shree Swasthani Brata Katha Illustrated',
    category: 'religious_books',
    shortDescription: 'पौष शुक्ल पूर्णिमादेखि माघ शुक्ल पूर्णिमासम्म वाचन गरिने सचित्र ३१ अध्याय स्वस्थानी।',
    fullDescription: 'भगवान् शिव र श्री स्वस्थानी परमेश्वरीको व्रतविधि, कथा र आरती सहितको ठूलो अक्षरमा छापिएको बृहत् संस्करण।',
    purchasePrice: 250,
    sellingPrice: 400,
    discountPrice: 350,
    stockQuantity: 40,
    minStockLevel: 8,
    unit: 'पुस्तक',
    weightGram: 500,
    rating: 4.9,
    reviewsCount: 64,
    imageUrl: getGalleryImg('ps_swasthani_brata', 32),
    isActive: true,
    bookDetails: {
      author: 'वेदव्यास रचित (नेपाली संस्करण)',
      publisher: 'नेपाल धार्मिक ग्रन्थ भण्डार',
      pages: 360,
      language: 'नेपाली',
      subject: 'व्रतकथा / पुराण'
    }
  },

  // 12. Book - Karmakanda Bhaskar
  {
    id: 'prod_bk_karmakanda',
    sku: 'BOK-KRM-012',
    barcode: '890100300103',
    nameNepali: 'कर्मकाण्ड भास्कर (षोडश संस्कार र नित्यपूजा विधि)',
    nameEnglish: 'Karmakanda Bhaskar Ritual Guidebook',
    category: 'religious_books',
    shortDescription: 'पण्डित तथा कर्मकाण्डका साधकहरूका लागि उपयोगी सम्पूर्ण मन्त्र र प्रयोग विधि पुस्तिका।',
    fullDescription: 'नित्य कर्म, सन्ध्यावन्दन, देवपूजन, पाञ्चायन पूजा, हवन, रुद्री र संस्कार कर्मको स्पष्ट सस्वर मन्त्र र विधि।',
    purchasePrice: 500,
    sellingPrice: 800,
    discountPrice: 700,
    stockQuantity: 30,
    minStockLevel: 5,
    unit: 'पुस्तक',
    weightGram: 620,
    rating: 4.8,
    reviewsCount: 29,
    imageUrl: getGalleryImg('ps_karmakanda_manjari', 34),
    isActive: true,
    bookDetails: {
      author: 'पं. बालानन्द ज्योतिषाचार्य',
      publisher: 'बालानन्द प्रकाशन',
      pages: 440,
      language: 'संस्कृत',
      subject: 'कर्मकाण्ड / प्रयोग पद्धति'
    }
  },

  // 13. Book - Muhurta Chintamani
  {
    id: 'prod_bk_muhurta',
    sku: 'BOK-MHT-013',
    barcode: '890100300104',
    nameNepali: 'मुहूर्त चिन्तामणि (नेपाली टीका र उदाहरण सहित)',
    nameEnglish: 'Muhurta Chintamani Jyotish Book',
    category: 'jyotish',
    shortDescription: 'शुभ विवाह, गृहप्रवेश, यात्रा र व्रतबन्धको सही मुहूर्त चयन गर्ने प्रामाणिक ग्रन्थ।',
    fullDescription: 'ज्योतिष शास्त्रको मुहूर्त खण्डको सर्वमान्य ग्रन्थ मुहूर्त चिन्तामणिको नेपाली व्याख्या र गणना उदाहरण सहित।',
    purchasePrice: 450,
    sellingPrice: 700,
    discountPrice: 600,
    stockQuantity: 25,
    minStockLevel: 5,
    unit: 'पुस्तक',
    weightGram: 550,
    rating: 4.9,
    reviewsCount: 33,
    imageUrl: getGalleryImg('ps_balananda_panchanga_book', 35),
    isActive: true,
    bookDetails: {
      author: 'दैवज्ञ रामदेव (व्याख्या: ज्योतिषाचार्य)',
      publisher: 'ज्योतिष अनुसन्धान केन्द्र',
      pages: 480,
      language: 'नेपाली',
      subject: 'ज्योतिष / मुहूर्त'
    }
  },

  // 14. Rudraksha - 5 Mukhi Original Nepal
  {
    id: 'prod_rudraksha_5m',
    sku: 'JYT-RUD-014',
    barcode: '890100400101',
    nameNepali: '५ मुखी नेपाली रुद्राक्ष माला (१०८ दाना - प्रमाणित)',
    nameEnglish: 'Original 5 Mukhi Nepali Rudraksha Mala (108 Beads)',
    category: 'jyotish',
    shortDescription: 'स्वास्थ्य, एकाग्रता र मानसिक शान्तिका लागि १०८ दाना सक्कली नेपाली रुद्राक्ष माला।',
    fullDescription: 'संखुवासभा तथा भोजपुरको प्राकृतिक बोटबाट प्राप्त ५ मुखी रुद्राक्षलाई रेशमी धागोमा उनिएको प्रमाणित माला।',
    purchasePrice: 600,
    sellingPrice: 1000,
    discountPrice: 850,
    stockQuantity: 35,
    minStockLevel: 5,
    unit: 'थान',
    weightGram: 180,
    rating: 4.9,
    reviewsCount: 77,
    imageUrl: getGalleryImg('ps_rudraksha_mala_108', 24),
    isActive: true,
    isFeatured: true,
    isPopular: true,
  },

  // 15. Rudraksha - 7 Mukhi Mahalaxmi
  {
    id: 'prod_rudraksha_7m',
    sku: 'JYT-RUD-015',
    barcode: '890100400102',
    nameNepali: '७ मुखी महालक्ष्मी रुद्राक्ष दाना (प्रमाणपत्र सहित)',
    nameEnglish: 'Original 7 Mukhi Mahalaxmi Rudraksha Bead with Certificate',
    category: 'jyotish',
    shortDescription: 'धन वृद्धि, व्यापार सफलता र शनी दोष निवारणका लागि ७ मुखी रुद्राक्ष दाना।',
    fullDescription: 'देवी महालक्ष्मी र शनि ग्रहको कृपा प्राप्त गराउने प्राकृतिक ठूलो आकारको ७ मुखी नेपाली रुद्राक्ष।',
    purchasePrice: 1500,
    sellingPrice: 2500,
    discountPrice: 2100,
    stockQuantity: 10,
    minStockLevel: 2,
    unit: 'थान',
    weightGram: 25,
    rating: 5.0,
    reviewsCount: 22,
    imageUrl: getGalleryImg('ps_ek_mukhi_rudraksha', 29),
    isActive: true,
  },

  // 16. Yantra - Shree Yantra Copper
  {
    id: 'prod_yantra_shree',
    sku: 'YNT-SHR-016',
    barcode: '890100500101',
    nameNepali: 'सिद्ध श्रीयन्त्र (तामा/पित्तल कुँदेको - ६x६ इन्च)',
    nameEnglish: 'Pran Pratishthit Shree Yantra Plate 6x6 inch',
    category: 'yantra',
    shortDescription: 'सकारात्मक ऊर्जा, ऐश्वर्य र समृद्धिदायक प्राण-प्रतिष्ठित श्रीयन्त्र।',
    fullDescription: 'शास्त्रोक्त ज्यामितीय संरचना अनुसार शुद्ध तामाको पातामा स्वर्ण लेपन गरी मन्त्रद्वारा अभिमन्त्रित श्रीयन्त्र।',
    purchasePrice: 700,
    sellingPrice: 1200,
    discountPrice: 1050,
    stockQuantity: 20,
    minStockLevel: 4,
    unit: 'थान',
    weightGram: 320,
    rating: 4.8,
    reviewsCount: 38,
    imageUrl: getGalleryImg('ps_sphatik_shriyantra', 25),
    isActive: true,
    isFeatured: true,
  },

  // 17. Yantra - Navagraha Yantra
  {
    id: 'prod_yantra_navagraha',
    sku: 'YNT-NVG-017',
    barcode: '890100500102',
    nameNepali: 'नवग्रह यन्त्र (९ ग्रहको कुण्डली दोष शमन यन्त्र)',
    nameEnglish: 'Navagraha Yantra Frame for Planet Peace',
    category: 'yantra',
    shortDescription: 'सूर्य, चन्द्र, मङ्गल आदि ९ वटै ग्रहको प्रतिकूल प्रभाव कम गर्ने नवग्रह यन्त्र फ्रेम।',
    fullDescription: 'कुण्डलीमा ग्रहदोष भएका व्यक्तिहरूले घरको पूजाकोठा वा कार्यकक्षमा राख्न अति उत्तम नवग्रह चक्र यन्त्र।',
    purchasePrice: 850,
    sellingPrice: 1400,
    discountPrice: 1200,
    stockQuantity: 15,
    minStockLevel: 3,
    unit: 'थान',
    weightGram: 450,
    rating: 4.9,
    reviewsCount: 18,
    imageUrl: getGalleryImg('ps_navagraha_shanti', 6),
    isActive: true,
  },

  // 18. Vastu - Vastu Dosh Nivaran Pyramid
  {
    id: 'prod_vastu_pyramid',
    sku: 'VST-PYR-018',
    barcode: '890100600101',
    nameNepali: 'पित्तलको वास्तु दोष निवारण पिरामिड (Multi Pyramid)',
    nameEnglish: 'Brass Vastu Dosh Correction Pyramid',
    category: 'vastu',
    shortDescription: 'घर, पसल र भवनको दिशा दोष र वास्तु असन्तुलन हटाउने बहु-पिरामिड उपकरण।',
    fullDescription: 'भवन नभत्काई वास्तु दोष शमन गर्न उत्तर-पूर्व वा मुख्य ढोकामा स्थापना गरिने शुद्ध पित्तलको वास्तु पिरामिड।',
    purchasePrice: 900,
    sellingPrice: 1500,
    discountPrice: 1300,
    stockQuantity: 14,
    minStockLevel: 3,
    unit: 'थान',
    weightGram: 550,
    rating: 4.7,
    reviewsCount: 25,
    imageUrl: getGalleryImg('ps_vastu_shanti', 7),
    isActive: true,
  },

  // 19. Vastu - Vastu Compass & Direction Book
  {
    id: 'prod_vastu_compass_bk',
    sku: 'VST-CMP-019',
    barcode: '890100600102',
    nameNepali: 'वास्तु दिशा दर्शक कम्पास र आधुनिक वास्तुविज्ञान पुस्तक',
    nameEnglish: 'Professional Vastu Compass & Book Kit',
    category: 'vastu',
    shortDescription: '३६० डिग्री १६ दिशा नाप्ने कम्पास र गृह निर्माण वास्तु नियम दिग्दर्शन।',
    fullDescription: 'आफ्नो घर वा घडेरीको सही दिशा पहिचान गरी ढोका, भान्छा, सुत्ने कोठा र पूजाकोठाको वास्तु स्थिति जाँच गर्ने किट।',
    purchasePrice: 650,
    sellingPrice: 1100,
    discountPrice: 950,
    stockQuantity: 22,
    minStockLevel: 4,
    unit: 'सेट',
    weightGram: 400,
    rating: 4.8,
    reviewsCount: 17,
    imageUrl: getGalleryImg('ps_vastu_shanti', 7),
    isActive: true,
  },

  // 20. Book - Vastu Shastra Big
  {
    id: 'prod_bk_vastu_big',
    sku: 'BOK-VST-020',
    barcode: '890100300105',
    nameNepali: 'बृहत् वास्तुराज वल्लभ र आधुनिक गृह वास्तु',
    nameEnglish: 'Brihat Vastu Rajvallabh & Modern Architecture',
    category: 'religious_books',
    shortDescription: 'वास्तु शास्त्रको प्राचीन मानक ग्रन्थ र नक्सा डिजाइन मार्गदर्शन।',
    fullDescription: 'महाराजा विश्वकर्मा परम्परा अनुसार निर्मित भवन वास्तु, व्यावसायिक कम्प्लेक्स र मन्दिर वास्तु विधान।',
    purchasePrice: 550,
    sellingPrice: 900,
    discountPrice: 780,
    stockQuantity: 18,
    minStockLevel: 3,
    unit: 'पुस्तक',
    weightGram: 680,
    rating: 4.9,
    reviewsCount: 30,
    imageUrl: getGalleryImg('ps_karmakanda_manjari', 34),
    isActive: true,
    bookDetails: {
      author: 'मण्डन सूत्रधार (अनुवाद: वास्तुविद्)',
      publisher: 'वैदिक वास्तु अनुसन्धान',
      pages: 520,
      language: 'नेपाली',
      subject: 'वास्तुशास्त्र / गृहनिर्माण'
    }
  },

  // 21. Panchanga & Patro Book
  {
    id: 'prod_bk_panchanga_patro',
    sku: 'BOK-PNC-021',
    barcode: '890100300106',
    nameNepali: 'नेपाली तोयनाथ/बालानन्द पञ्चाङ्ग पात्रो (बृहत्)',
    nameEnglish: 'Nepali Brihat Panchanga Patro Book',
    category: 'jyotish',
    shortDescription: 'वर्षभरिका व्रत, पर्व, मुहूर्त, ग्रहगोचर र दैनिक सूर्योदय-सूर्यास्त तालिका।',
    fullDescription: 'नेपाल पञ्चाङ्ग निर्णायक विकास समितिबाट स्वीकृत आधिकारिक पञ्चाङ्ग ग्रन्थ।',
    purchasePrice: 150,
    sellingPrice: 250,
    discountPrice: 220,
    stockQuantity: 80,
    minStockLevel: 15,
    unit: 'पुस्तक',
    weightGram: 350,
    rating: 5.0,
    reviewsCount: 95,
    imageUrl: getGalleryImg('ps_balananda_panchanga_book', 35),
    isActive: true,
    isBestSeller: true,
  },

  // 22. Hawan Samagri Mix
  {
    id: 'prod_hawan_samagri_1kg',
    sku: 'SMG-HWN-022',
    barcode: '890100200106',
    nameNepali: '५१ जडीबुटीयुक्त दिव्य हवन सामग्री (१ केजी)',
    nameEnglish: '51 Herb Divine Hawan Samagri Mix 1kg',
    category: 'puja_samagri',
    shortDescription: 'यज्ञ, गायत्री हवन, नवग्रह पूजा र गायत्री अनुष्ठानका लागि ५१ प्रकारका जडीबुटी मिश्रण।',
    fullDescription: 'गुग्गुल, जटामसी, केशर, श्रीखण्ड, अगर, तगर, कपूरकाचरी, चन्दन र जौ-तिल मिसाइएको सात्त्विक हवन सामग्री।',
    purchasePrice: 250,
    sellingPrice: 420,
    discountPrice: 360,
    stockQuantity: 50,
    minStockLevel: 10,
    unit: 'प्याकेट',
    weightGram: 1000,
    rating: 4.8,
    reviewsCount: 51,
    imageUrl: getGalleryImg('ps_havan_samidha', 10),
    isActive: true,
  },

  // 23. Janai & Janeu (Yajnopavita)
  {
    id: 'prod_janai_cotton',
    sku: 'SMG-JNI-023',
    barcode: '890100200107',
    nameNepali: 'शुद्ध कपासको ६ डोरा जनै (यज्ञोपवीत - १० जोडी)',
    nameEnglish: 'Pure Cotton Yajnopavita Janai (10 Pairs)',
    category: 'puja_samagri',
    shortDescription: 'ऋषितर्पणी तथा नित्य धारणका लागि हस्तनिर्मित अभिमन्त्रित ६ डोरा जनै।',
    fullDescription: 'ब्राह्मण तथा उपनीत साधकहरूका लागि शास्त्रोक्त धागो र ग्रन्थीबाट तयार पारिएको १० जोडी जनै सेट।',
    purchasePrice: 150,
    sellingPrice: 250,
    discountPrice: 220,
    stockQuantity: 70,
    minStockLevel: 15,
    unit: 'प्याकेट',
    weightGram: 150,
    rating: 4.9,
    reviewsCount: 44,
    imageUrl: getGalleryImg('ps_hand_twisted_janeu', 36),
    isActive: true,
  },

  // 24. Low Stock Product Demo (for Inventory Alert test)
  {
    id: 'prod_shiva_brass_statue',
    sku: 'SMG-SHV-024',
    barcode: '890100200108',
    nameNepali: 'अष्टधातु निर्मित नटराज/शिव प्रतिमा (Brass Shiva Idol)',
    nameEnglish: 'Ashtadhatu Brass Shiva Idol 8 inch',
    category: 'puja_samagri',
    shortDescription: 'पूजाकोठामा सजाउन र साधनाका लागि निर्मित हस्तकला शिव मूर्ति।',
    fullDescription: 'अष्टधातुको टल्कने चमक र उत्कृष्ट कलाकारिता सहितको शिव प्रतिमा।',
    purchasePrice: 2200,
    sellingPrice: 3500,
    discountPrice: 3200,
    stockQuantity: 2, // Low stock demo!
    minStockLevel: 5,
    unit: 'थान',
    weightGram: 1800,
    rating: 5.0,
    reviewsCount: 12,
    imageUrl: getGalleryImg('ps_rudrabhishek', 3),
    isActive: true,
  },

  // 25. Out of Stock Product Demo (for Inventory Out of stock test)
  {
    id: 'prod_sphatika_lingam',
    sku: 'SMG-SPH-025',
    barcode: '890100200109',
    nameNepali: 'शुद्ध स्फटिक शिवलिङ्ग (Pure Crystal Lingam)',
    nameEnglish: 'Pure Original Sphatika Crystal Shivlingam',
    category: 'puja_samagri',
    shortDescription: 'मनोकामना पूर्ति र सकारात्मक ऊर्जा प्रवाहका लागि प्रामाणिक स्फटिक लिङ्ग।',
    fullDescription: 'प्राकृतिक पारदर्शी स्फटिकबाट बनेको शिवलिङ्ग। जल तथा दुग्धाभिषेक गर्न सकिने।',
    purchasePrice: 2500,
    sellingPrice: 3900,
    discountPrice: 3500,
    stockQuantity: 0, // Out of Stock demo!
    minStockLevel: 3,
    unit: 'थान',
    weightGram: 280,
    rating: 4.9,
    reviewsCount: 20,
    imageUrl: getGalleryImg('ps_sphatik_shivalinga', 26),
    isActive: true,
  }
];

// Initial Demo Coupons
export const INITIAL_DEMO_COUPONS: StoreCoupon[] = [
  {
    id: 'cup_wel10',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 1000,
    expiryDate: '2026-12-31',
    usageLimit: 100,
    usedCount: 14,
    isActive: true,
  },
  {
    id: 'cup_puja20',
    code: 'PUJA20',
    type: 'percentage',
    value: 15,
    minOrderAmount: 2000,
    expiryDate: '2026-11-30',
    usageLimit: 50,
    usedCount: 8,
    isActive: true,
  },
  {
    id: 'cup_book15',
    code: 'BOOK15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 500,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usedCount: 32,
    isActive: true,
  },
  {
    id: 'cup_vedic100',
    code: 'VEDIC100',
    type: 'fixed',
    value: 100,
    minOrderAmount: 1500,
    expiryDate: '2026-12-31',
    usageLimit: 50,
    usedCount: 5,
    isActive: true,
  }
];

// Initial Sample Orders for Dashboard Metrics
export const INITIAL_DEMO_ORDERS: StoreOrder[] = [
  {
    id: 'ord_1001',
    orderNumber: 'VP-2026-0801',
    orderType: 'ONLINE',
    customerName: 'रामप्रसाद शर्मा',
    customerPhone: '9851023456',
    customerAddress: 'नयाँ बानेश्वर, काठमाडौँ',
    deliveryMethod: 'standard',
    deliveryCharge: 150,
    items: [
      { productId: 'prod_pkg_grihapravesh', productName: 'गृहप्रवेश पूजा सामग्री सम्पूर्ण सेट (Package)', unitPrice: 2200, quantity: 1, subtotal: 2200 },
      { productId: 'prod_ghee_cow', productName: 'हिमाली शुद्ध गाईको घ्यू', unitPrice: 1200, quantity: 1, subtotal: 1200 },
    ],
    subtotal: 3400,
    discountAmount: 100,
    couponCode: 'VEDIC100',
    totalAmount: 3450,
    paymentMethod: 'cod',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-08-08 10:15 AM' },
      { status: 'Order Confirmed', timestamp: '2026-08-08 10:30 AM' },
      { status: 'Preparing', timestamp: '2026-08-08 11:00 AM' },
      { status: 'Packed', timestamp: '2026-08-08 01:00 PM' },
      { status: 'Dispatched', timestamp: '2026-08-08 02:30 PM' },
      { status: 'Out for Delivery', timestamp: '2026-08-08 04:00 PM' },
      { status: 'Delivered', timestamp: '2026-08-08 05:15 PM' },
    ],
    createdAt: '2026-08-08T10:15:00Z',
    createdRole: 'Customer',
  },
  {
    id: 'ord_1002',
    orderNumber: 'VP-2026-0802',
    orderType: 'OFFLINE_POS',
    customerName: 'हरिहर ज्ञवाली (काउन्टर बिक्री)',
    customerPhone: '9841234567',
    customerAddress: 'काउन्टर पिकअप - बालानन्द पसल',
    deliveryMethod: 'store_pickup',
    deliveryCharge: 0,
    items: [
      { productId: 'prod_bk_gita', productName: 'श्रीमद्भगवद्गीता (नेपाली अनुवाद)', unitPrice: 550, quantity: 2, subtotal: 1100 },
      { productId: 'prod_rudraksha_5m', productName: '५ मुखी नेपाली रुद्राक्ष माला', unitPrice: 850, quantity: 1, subtotal: 850 },
    ],
    subtotal: 1950,
    discountAmount: 150,
    totalAmount: 1800,
    paymentMethod: 'store_pickup',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-08-09 09:00 AM' },
      { status: 'Delivered', timestamp: '2026-08-09 09:05 AM' }
    ],
    createdAt: '2026-08-09T09:00:00Z',
    createdRole: 'Staff',
  },
  {
    id: 'ord_1003',
    orderNumber: 'VP-2026-0803',
    orderType: 'ONLINE',
    customerName: 'सरिता केसी',
    customerPhone: '9801987654',
    customerAddress: 'ललितपुर - कुपण्डोल',
    deliveryMethod: 'express',
    deliveryCharge: 250,
    items: [
      { productId: 'prod_pkg_rudra', productName: 'रुद्राभिषेक तथा शिवपूजा सामग्री Package', unitPrice: 1250, quantity: 1, subtotal: 1250 },
      { productId: 'prod_kapoor_bhimseni', productName: 'भीमसेनी शुद्ध प्राकृतिक कपूर', unitPrice: 300, quantity: 2, subtotal: 600 }
    ],
    subtotal: 1850,
    discountAmount: 0,
    totalAmount: 2100,
    paymentMethod: 'online',
    paymentStatus: 'Paid',
    orderStatus: 'Out for Delivery',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-08-09 10:00 AM' },
      { status: 'Order Confirmed', timestamp: '2026-08-09 10:10 AM' },
      { status: 'Preparing', timestamp: '2026-08-09 10:30 AM' },
      { status: 'Dispatched', timestamp: '2026-08-09 11:15 AM' },
      { status: 'Out for Delivery', timestamp: '2026-08-09 11:30 AM' },
    ],
    createdAt: '2026-08-09T10:00:00Z',
    createdRole: 'Customer',
  }
];

// In-memory Caches
let memoryVedicProducts: Product[] | null = null;
let memoryVedicOrders: StoreOrder[] | null = null;
let memoryVedicCoupons: StoreCoupon[] | null = null;
let memoryVedicCart: CartItem[] | null = null;
let memoryVedicWishlist: string[] | null = null;

// Helper Storage Functions
export const getStoredProducts = (): Product[] => {
  if (memoryVedicProducts) return memoryVedicProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_DEMO_PRODUCTS));
      memoryVedicProducts = INITIAL_DEMO_PRODUCTS;
      return INITIAL_DEMO_PRODUCTS;
    }
    memoryVedicProducts = JSON.parse(raw);
    return memoryVedicProducts!;
  } catch (e) {
    console.error('Failed to load products:', e);
    return INITIAL_DEMO_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]): void => {
  memoryVedicProducts = products;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
};

export const getStoredOrders = (): StoreOrder[] => {
  if (memoryVedicOrders) return memoryVedicOrders;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
      memoryVedicOrders = INITIAL_DEMO_ORDERS;
      return INITIAL_DEMO_ORDERS;
    }
    memoryVedicOrders = JSON.parse(raw);
    return memoryVedicOrders!;
  } catch (e) {
    console.error('Failed to load orders:', e);
    return INITIAL_DEMO_ORDERS;
  }
};

export const saveOrders = (orders: StoreOrder[]): void => {
  memoryVedicOrders = orders;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
};

export const getStoredCoupons = (): StoreCoupon[] => {
  if (memoryVedicCoupons) return memoryVedicCoupons;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_DEMO_COUPONS));
      memoryVedicCoupons = INITIAL_DEMO_COUPONS;
      return INITIAL_DEMO_COUPONS;
    }
    memoryVedicCoupons = JSON.parse(raw);
    return memoryVedicCoupons!;
  } catch (e) {
    console.error('Failed to load coupons:', e);
    return INITIAL_DEMO_COUPONS;
  }
};

export const saveCoupons = (coupons: StoreCoupon[]): void => {
  memoryVedicCoupons = coupons;
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons:', e);
  }
};

export const getStoredCart = (): CartItem[] => {
  if (memoryVedicCart) return memoryVedicCart;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    memoryVedicCart = raw ? JSON.parse(raw) : [];
    return memoryVedicCart!;
  } catch (e) {
    console.error('Failed to load cart:', e);
    return [];
  }
};

export const saveCart = (cart: CartItem[]): void => {
  memoryVedicCart = cart;
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
};

export const getStoredWishlist = (): string[] => {
  if (memoryVedicWishlist) return memoryVedicWishlist;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    memoryVedicWishlist = raw ? JSON.parse(raw) : [];
    return memoryVedicWishlist!;
  } catch (e) {
    console.error('Failed to load wishlist:', e);
    return [];
  }
};

export const saveWishlist = (wishlistProductIds: string[]): void => {
  memoryVedicWishlist = wishlistProductIds;
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistProductIds));
  } catch (e) {
    console.error('Failed to save wishlist:', e);
  }
};

export const getStoredAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [
      {
        id: 'aud_1',
        user: 'मनिष भट्टराई',
        role: 'SUPER_ADMIN',
        action: 'System Initialized',
        details: 'वैदिक पसल मोड्युल सुचारु भयो',
        timestamp: new Date().toLocaleString('ne-NP')
      }
    ];
  } catch (e) {
    return [];
  }
};

export const saveAuditLogs = (logs: AuditLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 300)));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }
};

export const addAuditLog = (
  user: string,
  role: StoreUserRole,
  action: string,
  details: string
): void => {
  const logs = getStoredAuditLogs();
  const newLog: AuditLog = {
    id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user,
    role,
    action,
    details,
    timestamp: new Date().toLocaleString('ne-NP')
  };
  saveAuditLogs([newLog, ...logs]);
};

export const getStoredInventoryLogs = (): InventoryLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addInventoryLog = (
  productId: string,
  productName: string,
  transactionType: InventoryLog['transactionType'],
  quantityChange: number,
  previousStock: number,
  newStock: number,
  performedBy: string,
  referenceId?: string
): void => {
  try {
    const logs = getStoredInventoryLogs();
    const newLog: InventoryLog = {
      id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productId,
      productName,
      transactionType,
      quantityChange,
      previousStock,
      newStock,
      referenceId,
      performedBy,
      timestamp: new Date().toLocaleString('ne-NP')
    };
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify([newLog, ...logs].slice(0, 500)));
  } catch (e) {
    console.error('Failed to log inventory:', e);
  }
};

export const getStoredDailyCashRegister = (): DailyCashRegister => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_REGISTER);
    if (raw) {
      const parsed: DailyCashRegister = JSON.parse(raw);
      if (parsed.date === today) return parsed;
    }
  } catch (e) {
    console.error('Failed to load cash register:', e);
  }

  // Calculate today's cash sales from existing orders
  const orders = getStoredOrders();
  const todayCashSales = orders
    .filter(o => o.orderType === 'OFFLINE_POS' && (o.paymentMethod === 'cash' || o.paymentMethod === 'store_pickup') && o.createdAt.startsWith(today))
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const newReg: DailyCashRegister = {
    date: today,
    openingCash: 2000, // Default opening float
    cashSales: todayCashSales,
    cashRefunds: 0,
    expectedClosingCash: 2000 + todayCashSales,
    actualClosingCash: 2000 + todayCashSales,
    difference: 0,
    notes: 'दैनिक काउन्टर ओपनिङ क्यास रु. २,००० सेट गरिएको छ।',
    updatedBy: 'काउन्टर म्यानेजर',
    updatedAt: new Date().toLocaleString('ne-NP')
  };
  localStorage.setItem(STORAGE_KEYS.CASH_REGISTER, JSON.stringify(newReg));
  return newReg;
};

export const saveDailyCashRegister = (reg: DailyCashRegister): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CASH_REGISTER, JSON.stringify(reg));
  } catch (e) {
    console.error('Failed to save cash register:', e);
  }
};

export const getStoredSalesReturns = (): SalesReturn[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES_RETURNS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveSalesReturns = (returns: SalesReturn[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES_RETURNS, JSON.stringify(returns));
  } catch (e) {
    console.error('Failed to save sales returns:', e);
  }
};

// Check if an eSewa Transaction ID is unique across all orders
export const validateTransactionIdUnique = (transactionId: string, currentOrderId?: string): boolean => {
  if (!transactionId || !transactionId.trim()) return true;
  const cleanTx = transactionId.trim().toLowerCase();
  const orders = getStoredOrders();
  
  const existing = orders.find(o => {
    if (currentOrderId && o.id === currentOrderId) return false;
    return o.esewaDetails?.transactionId?.trim().toLowerCase() === cleanTx;
  });

  return !existing;
};

// Submit eSewa Payment details from Customer
export const submitEsewaPayment = (
  orderId: string,
  submission: {
    transactionId: string;
    paidAmount: number;
    paymentDate: string;
    paymentTime: string;
    slipUrl?: string;
  }
): { success: boolean; message: string; order?: StoreOrder } => {
  if (!validateTransactionIdUnique(submission.transactionId, orderId)) {
    return {
      success: false,
      message: 'यो eSewa Transaction ID पहिले नै प्रयोग भइसकेको छ।'
    };
  }

  const orders = getStoredOrders();
  let updatedOrder: StoreOrder | undefined;

  const updatedOrders = orders.map(ord => {
    if (ord.id === orderId) {
      const esewaDetails: EsewaPaymentSubmission = {
        ...submission,
        verificationStatus: 'Verification Pending',
        submittedAt: new Date().toLocaleString('ne-NP')
      };

      updatedOrder = {
        ...ord,
        paymentMethod: 'esewa',
        paymentStatus: 'Verification Pending',
        esewaDetails,
        statusHistory: [
          ...ord.statusHistory,
          {
            status: 'Verification Pending',
            timestamp: new Date().toLocaleString('ne-NP'),
            note: `eSewa भुक्तानी विवरण सबमिट गरियो (Txn ID: ${submission.transactionId})`
          }
        ]
      };
      return updatedOrder;
    }
    return ord;
  });

  if (updatedOrder) {
    saveOrders(updatedOrders);
    addAuditLog(
      updatedOrder.customerName,
      'CUSTOMER',
      'eSewa Payment Submitted',
      `Order ${updatedOrder.orderNumber} को लागि eSewa Txn: ${submission.transactionId} र रकम रु. ${submission.paidAmount} विवरण सबमिट गरियो`
    );
    return { success: true, message: 'eSewa भुक्तानी विवरण सफलतापूर्वक सबमिट भयो। एडमिन प्रमाणीकरण बाँकी छ।', order: updatedOrder };
  }

  return { success: false, message: 'अर्डर भेटिएन।' };
};

// Admin verify eSewa Payment
export const verifyEsewaPayment = (
  orderId: string,
  action: 'APPROVE' | 'REJECT' | 'REQUEST_REUPLOAD',
  adminName: string = 'स्टोर एडमिन',
  rejectionReason?: string
): StoreOrder[] => {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId && ord.esewaDetails) {
      let newVerificationStatus: EsewaPaymentSubmission['verificationStatus'] = 'Verification Pending';
      let newPaymentStatus = ord.paymentStatus;
      let newOrderStatus = ord.orderStatus;
      let noteStr = '';

      if (action === 'APPROVE') {
        newVerificationStatus = 'Paid';
        newPaymentStatus = 'Paid';
        newOrderStatus = 'Payment Confirmed';
        noteStr = `eSewa भुक्तानी स्वीकृत (Approved by ${adminName})`;
      } else if (action === 'REJECT') {
        newVerificationStatus = 'Rejected';
        newPaymentStatus = 'Rejected';
        noteStr = `eSewa भुक्तानी अस्वीकृत (Rejected: ${rejectionReason || 'अमान्य विवरण'})`;
      } else {
        newVerificationStatus = 'Reupload Requested';
        noteStr = `नयाँ Payment Slip re-upload गर्न अनुरोध गरिएको छ।`;
      }

      const updatedEsewa: EsewaPaymentSubmission = {
        ...ord.esewaDetails,
        verificationStatus: newVerificationStatus,
        verifiedBy: adminName,
        verifiedAt: new Date().toLocaleString('ne-NP'),
        rejectionReason: rejectionReason || ord.esewaDetails.rejectionReason
      };

      const updatedOrder: StoreOrder = {
        ...ord,
        paymentStatus: newPaymentStatus,
        orderStatus: newOrderStatus,
        esewaDetails: updatedEsewa,
        statusHistory: [
          ...ord.statusHistory,
          {
            status: action === 'APPROVE' ? 'Payment Confirmed' : action === 'REJECT' ? 'Rejected' : 'Reupload Requested',
            timestamp: new Date().toLocaleString('ne-NP'),
            note: noteStr,
            updatedBy: adminName
          }
        ]
      };

      addAuditLog(
        adminName,
        'STORE_ADMIN',
        `eSewa Payment ${action}`,
        `Order ${ord.orderNumber} को eSewa भुक्तानी status: ${newVerificationStatus} गरियो।`
      );

      return updatedOrder;
    }
    return ord;
  });

  saveOrders(updated);
  return updated;
};

// Admin confirm COD Payment Received
export const markCodPaymentReceived = (orderId: string, adminName: string = 'स्टोर एडमिन'): StoreOrder[] => {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId) {
      const updatedOrder: StoreOrder = {
        ...ord,
        paymentStatus: 'Paid',
        statusHistory: [
          ...ord.statusHistory,
          {
            status: 'Paid',
            timestamp: new Date().toLocaleString('ne-NP'),
            note: `Cash on Delivery भुक्तानी प्राप्त भयो (${adminName} द्वारा)`,
            updatedBy: adminName
          }
        ]
      };

      addAuditLog(
        adminName,
        'STORE_ADMIN',
        'COD Payment Confirmed',
        `Order ${ord.orderNumber} को COD रकम रु. ${ord.totalAmount} बुझिलिएको दर्ता भयो।`
      );

      return updatedOrder;
    }
    return ord;
  });

  saveOrders(updated);
  return updated;
};

// Generate Unique POS Offline Bill Number
export const generateOfflineBillNumber = (): string => {
  const orders = getStoredOrders();
  const offlineOrders = orders.filter(o => o.billNumber);
  const nextNum = offlineOrders.length + 1;
  const currentFiscalYear = '2083'; // Nepali Fiscal Year 2082/83
  return `OFF-${currentFiscalYear}-${String(nextNum).padStart(6, '0')}`;
};

// Create / Submit a new Online Order
export const createOnlineOrder = (
  cart: CartItem[],
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    gpsLocation?: { lat: number; lng: number };
    deliveryInstruction?: string;
  },
  deliveryMethod: DeliveryMethod,
  deliveryCharge: number,
  paymentMethod: PaymentMethod,
  appliedCoupon?: StoreCoupon
): StoreOrder => {
  const products = getStoredProducts();
  const orders = getStoredOrders();

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.sellingPrice;
    return acc + price * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const now = new Date();
  const orderNumStr = `VP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: StoreOrder = {
    id: `ord_${Date.now()}`,
    orderNumber: orderNumStr,
    orderType: 'ONLINE',
    customerName: customerInfo.name,
    customerPhone: customerInfo.phone,
    customerAddress: customerInfo.address,
    gpsLocation: customerInfo.gpsLocation,
    deliveryInstruction: customerInfo.deliveryInstruction,
    deliveryMethod,
    deliveryCharge,
    items: cart.map(item => ({
      productId: item.product.id,
      productName: item.product.nameNepali,
      unitPrice: item.product.discountPrice ?? item.product.sellingPrice,
      quantity: item.quantity,
      subtotal: (item.product.discountPrice ?? item.product.sellingPrice) * item.quantity
    })),
    subtotal,
    discountAmount,
    couponCode: appliedCoupon?.code,
    totalAmount: grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod === 'online' || paymentMethod === 'esewa' ? 'Pending' : 'Pending',
    orderStatus: 'Order Placed',
    statusHistory: [
      {
        status: 'Order Placed',
        timestamp: new Date().toLocaleString('ne-NP'),
        note: 'ग्राहकद्वारा अनलाइन अर्डर दर्ता भयो'
      }
    ],
    createdAt: new Date().toISOString(),
    createdRole: 'Customer'
  };

  // Decrement Stock & Log Inventory
  const updatedProducts = products.map(p => {
    const cartMatch = cart.find(ci => ci.product.id === p.id);
    if (cartMatch) {
      const newStock = Math.max(0, p.stockQuantity - cartMatch.quantity);
      addInventoryLog(
        p.id,
        p.nameNepali,
        'Online Order',
        -cartMatch.quantity,
        p.stockQuantity,
        newStock,
        customerInfo.name,
        newOrder.id
      );
      return { ...p, stockQuantity: newStock };
    }
    return p;
  });

  saveProducts(updatedProducts);
  saveOrders([newOrder, ...orders]);

  addAuditLog(
    customerInfo.name,
    'CUSTOMER',
    'Online Order Placed',
    `नयाँ अर्डर ${orderNumStr} (रु. ${grandTotal.toLocaleString('ne-NP')}) दर्ता भयो`
  );

  // If coupon used, update coupon used count
  if (appliedCoupon) {
    const coupons = getStoredCoupons();
    const updatedCoupons = coupons.map(c => c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c);
    saveCoupons(updatedCoupons);
  }

  // Clear Cart
  saveCart([]);

  return newOrder;
};

// Process Offline POS Counter Sale
export const processPOSSale = (
  items: CartItem[],
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
    isWalkIn?: boolean;
  },
  discountAmount: number = 0,
  paymentMethod: PaymentMethod = 'cash',
  amountReceived: number = 0,
  salespersonName: string = 'काउन्टर प्रतिनिधि',
  esewaTxnId?: string
): StoreOrder => {
  const products = getStoredProducts();
  const orders = getStoredOrders();

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.sellingPrice;
    return acc + price * item.quantity;
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, amountReceived - grandTotal) : 0;

  const now = new Date();
  const orderNumStr = `POS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const billNumStr = generateOfflineBillNumber();

  let esewaDetails: EsewaPaymentSubmission | undefined = undefined;
  if (paymentMethod === 'esewa' && esewaTxnId) {
    esewaDetails = {
      transactionId: esewaTxnId,
      paidAmount: grandTotal,
      paymentDate: now.toISOString().split('T')[0],
      paymentTime: now.toLocaleTimeString('ne-NP'),
      verificationStatus: 'Paid',
      verifiedBy: salespersonName,
      verifiedAt: new Date().toLocaleString('ne-NP'),
      submittedAt: new Date().toLocaleString('ne-NP')
    };
  }

  const posOrder: StoreOrder = {
    id: `ord_pos_${Date.now()}`,
    orderNumber: orderNumStr,
    billNumber: billNumStr,
    orderType: 'OFFLINE_POS',
    customerName: customerInfo.name.trim() || (customerInfo.isWalkIn ? 'काउन्टर ग्राहक (Walk-in)' : 'अज्ञात ग्राहक'),
    customerPhone: customerInfo.phone || '',
    customerAddress: customerInfo.address || 'बालानन्द स्टोर काउन्टर',
    isWalkIn: customerInfo.isWalkIn ?? true,
    deliveryMethod: 'store_pickup',
    deliveryCharge: 0,
    items: items.map(item => ({
      productId: item.product.id,
      productName: item.product.nameNepali,
      unitPrice: item.product.discountPrice ?? item.product.sellingPrice,
      quantity: item.quantity,
      subtotal: (item.product.discountPrice ?? item.product.sellingPrice) * item.quantity
    })),
    subtotal,
    discountAmount,
    totalAmount: grandTotal,
    amountReceived,
    changeAmount,
    salespersonName,
    paymentMethod,
    paymentStatus: 'Paid',
    esewaDetails,
    orderStatus: 'Delivered',
    statusHistory: [
      {
        status: 'Delivered',
        timestamp: new Date().toLocaleString('ne-NP'),
        note: `पसल काउन्टरमा नगद/eSewa बिक्री बिल No: ${billNumStr} जारी गरियो`,
        updatedBy: salespersonName
      }
    ],
    createdAt: new Date().toISOString(),
    createdRole: 'Staff'
  };

  // Decrement Stock & Log Inventory
  const updatedProducts = products.map(p => {
    const cartMatch = items.find(ci => ci.product.id === p.id);
    if (cartMatch) {
      const newStock = Math.max(0, p.stockQuantity - cartMatch.quantity);
      addInventoryLog(
        p.id,
        p.nameNepali,
        'Offline Sale',
        -cartMatch.quantity,
        p.stockQuantity,
        newStock,
        salespersonName,
        billNumStr
      );
      return { ...p, stockQuantity: newStock };
    }
    return p;
  });

  saveProducts(updatedProducts);
  saveOrders([posOrder, ...orders]);

  // Update Cash Register if cash sale
  if (paymentMethod === 'cash' || paymentMethod === 'store_pickup') {
    const reg = getStoredDailyCashRegister();
    const updatedReg: DailyCashRegister = {
      ...reg,
      cashSales: reg.cashSales + grandTotal,
      expectedClosingCash: reg.openingCash + reg.cashSales + grandTotal - reg.cashRefunds,
      actualClosingCash: reg.openingCash + reg.cashSales + grandTotal - reg.cashRefunds,
      updatedAt: new Date().toLocaleString('ne-NP')
    };
    saveDailyCashRegister(updatedReg);
  }

  addAuditLog(
    salespersonName,
    'STORE_STAFF',
    'POS Bill Created',
    `काउन्टर बिल ${billNumStr} (रु. ${grandTotal.toLocaleString('ne-NP')}) सफलतापूर्वक जारी भयो`
  );

  return posOrder;
};

// Process Sales Return
export const processSalesReturn = (
  originalOrderId: string,
  returnedItems: { productId: string; quantity: number }[],
  reason: string,
  adminName: string = 'स्टोर एडमिन'
): { success: boolean; message: string; returnRecord?: SalesReturn } => {
  const orders = getStoredOrders();
  const products = getStoredProducts();
  const order = orders.find(o => o.id === originalOrderId || o.billNumber === originalOrderId);

  if (!order) {
    return { success: false, message: 'सम्बन्धित अर्डर/बिल भेटिएन।' };
  }

  let totalRefund = 0;
  const returnItemDetails: SalesReturn['items'] = [];

  const updatedProducts = products.map(p => {
    const retMatch = returnedItems.find(ri => ri.productId === p.id);
    if (retMatch && retMatch.quantity > 0) {
      const orderItem = order.items.find(oi => oi.productId === p.id);
      const unitRate = orderItem ? orderItem.unitPrice : p.sellingPrice;
      const subtotal = unitRate * retMatch.quantity;
      totalRefund += subtotal;

      returnItemDetails.push({
        productId: p.id,
        productName: p.nameNepali,
        quantity: retMatch.quantity,
        unitPrice: unitRate,
        subtotalRefund: subtotal
      });

      const newStock = p.stockQuantity + retMatch.quantity;
      addInventoryLog(
        p.id,
        p.nameNepali,
        'Sales Return',
        retMatch.quantity,
        p.stockQuantity,
        newStock,
        adminName,
        order.billNumber || order.orderNumber
      );

      return { ...p, stockQuantity: newStock };
    }
    return p;
  });

  saveProducts(updatedProducts);

  const returns = getStoredSalesReturns();
  const returnRecord: SalesReturn = {
    id: `ret_${Date.now()}`,
    returnNumber: `RET-${Date.now().toString().slice(-6)}`,
    originalOrderOrBillId: order.id,
    originalOrderOrBillNumber: order.billNumber || order.orderNumber,
    customerName: order.customerName,
    items: returnItemDetails,
    totalRefundAmount: totalRefund,
    reason,
    createdAt: new Date().toISOString(),
    createdBy: adminName
  };

  saveSalesReturns([returnRecord, ...returns]);

  // Update order status if full return
  const updatedOrders = orders.map(o => {
    if (o.id === order.id) {
      return {
        ...o,
        orderStatus: 'Returned' as OrderStatus,
        paymentStatus: 'Refunded' as const,
        statusHistory: [
          ...o.statusHistory,
          {
            status: 'Returned' as OrderStatus,
            timestamp: new Date().toLocaleString('ne-NP'),
            note: `बिक्री फिर्ता दर्ता भयो (फिर्ता रकम रु. ${totalRefund}) - कारण: ${reason}`,
            updatedBy: adminName
          }
        ]
      };
    }
    return o;
  });

  saveOrders(updatedOrders);

  addAuditLog(
    adminName,
    'STORE_ADMIN',
    'Sales Return Processed',
    `बिल/अर्डर ${order.billNumber || order.orderNumber} बाट रु. ${totalRefund} को बिक्री फिर्ता स्वीकृत भयो`
  );

  return { success: true, message: 'बिक्री फिर्ता प्रक्रिया र स्टक रिस्टोर सम्पन्न भयो।', returnRecord };
};

// Update Status of Order
export const updateOrderStatus = (
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  adminName: string = 'स्टोर एडमिन'
): StoreOrder[] => {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId) {
      const history = [...ord.statusHistory, { status: newStatus, timestamp: new Date().toLocaleString('ne-NP'), note, updatedBy: adminName }];
      const paymentStatus = newStatus === 'Delivered' ? ('Paid' as const) : ord.paymentStatus;
      
      addAuditLog(
        adminName,
        'STORE_ADMIN',
        'Order Status Change',
        `अर्डर ${ord.orderNumber} को स्थिति [${newStatus}] मा परिवर्तन गरियो।`
      );

      return {
        ...ord,
        orderStatus: newStatus,
        paymentStatus,
        statusHistory: history
      };
    }
    return ord;
  });
  saveOrders(updated);
  return updated;
};

// Reset Demo Data
export const resetStoreDemoData = (): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_DEMO_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
  localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_DEMO_COUPONS));
  localStorage.removeItem(STORAGE_KEYS.CART);
  localStorage.removeItem(STORAGE_KEYS.WISHLIST);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.INVENTORY_LOGS);
  localStorage.removeItem(STORAGE_KEYS.CASH_REGISTER);
  localStorage.removeItem(STORAGE_KEYS.SALES_RETURNS);
};

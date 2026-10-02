// ============================================================================
// बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग केन्द्र - प्रत्यक्ष ग्रह गोचर समाचार इन्जिन
// ============================================================================
// Real-time Planetary Transit Journalism & 12-Rashi Astrological Impact Engine
// ============================================================================

import { PlanetPosition, PlanetName, RashiName } from '../types/astrology';
import { RASHI_DATA } from '../data/rashiData';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface RashiTransitImpact {
  rashiId: number;
  rashiName: RashiName;
  symbol: string;
  houseFromRashi: number;
  houseNameNepali: string;
  impactType: 'अत्यन्त शुभ' | 'शुभ' | 'मध्यम' | 'कष्ट/सावधानी';
  impactBadgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
  luckyColor: string;
  luckyNumber: string;
  favorableDay: string;
}

export interface GrahaGocharNewsArticle {
  id: string;
  planet: PlanetName;
  planetEnglish: string;
  symbol: string;
  avatarIcon: string;
  title: string;
  headline: string;
  leadSummary: string;
  fullBody: string;
  classicalReference: string;
  mundaneImpact: string;
  
  // Astronomical parameters
  currentRashi: RashiName;
  currentRashiId: number;
  degreeStr: string;
  nakshatra: string;
  nakshatraId: number;
  pada: number;
  nakshatraLord: string;
  motionStatus: string; // "मार्गी" | "वक्री (Retrograde)" | "अस्त (Combust)" | "उच्च" | "नीच" | "स्वगृह"
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: string;
  
  // Quick categorization
  beneficiaryRashis: RashiName[];
  cautionaryRashis: RashiName[];
  
  // All 12 signs breakdown
  rashiImpacts: RashiTransitImpact[];
  
  // Editorial metadata
  author: string;
  authorRole: string;
  publishedAtBS: string;
  publishedAtAD: string;
  readTimeMinutes: number;
  viewsCount: number;
  coverImageUrl: string;
}

export interface ConsolidatedRashiReport {
  rashiId: number;
  rashiName: RashiName;
  symbol: string;
  element: string;
  lord: string;
  overallScorePercent: number;
  overallNature: 'अत्यन्त अनुकूल' | 'अनुकूल' | 'मिश्रित' | 'सावधानीपूर्ण';
  favorablePlanets: { planet: PlanetName; house: number; note: string }[];
  challengingPlanets: { planet: PlanetName; house: number; note: string }[];
  sadeSatiOrDhaiyyaStatus?: string;
  primaryRemedy: string;
  dailyAdvice: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
}

// House Name Mapping
const HOUSE_NAMES: Record<number, string> = {
  1: 'प्रथम भाव (तनु / लग्न भाव)',
  2: 'द्वितीय भाव (धन तथा वाणी भाव)',
  3: 'तृतीय भाव (सहज तथा पराक्रम भाव)',
  4: 'चतुर्थ भाव (सुख तथा मातृ भाव)',
  5: 'पञ्चम भाव (पुत्र तथा बुद्धि भाव)',
  6: 'षष्ठम भाव (शत्रु तथा रोग भाव)',
  7: 'सप्तम भाव (जाया तथा साझेदारी भाव)',
  8: 'अष्टम भाव (आयु तथा मृत्यु भाव)',
  9: 'नवम भाव (धर्म तथा भाग्य भाव)',
  10: 'दशम भाव (कर्म तथा राज्य भाव)',
  11: 'एकादश भाव (आय तथा लाभ भाव)',
  12: 'द्वादश भाव (व्यय तथा मोक्ष भाव)',
};

// Cover Images for each of the 9 Grahas
const GRAHA_COVER_IMAGES: Record<PlanetName, string> = {
  'सूर्य': 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=1000&auto=format&fit=crop&q=80',
  'चन्द्र': 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1000&auto=format&fit=crop&q=80',
  'मंगल': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1000&auto=format&fit=crop&q=80',
  'बुध': 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1000&auto=format&fit=crop&q=80',
  'गुरु': 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=1000&auto=format&fit=crop&q=80',
  'शुक्र': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1000&auto=format&fit=crop&q=80',
  'शनि': 'https://images.unsplash.com/photo-1614314107768-6018061b5b72?w=1000&auto=format&fit=crop&q=80',
  'राहु': 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80',
  'केतु': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
};

// Individual Planet Astrological News Data Generators
function getSuryaHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  switch (house) {
    case 3:
      return {
        impactType: 'अत्यन्त शुभ',
        badgeColor: 'bg-emerald-600 text-white',
        summary: 'सूर्यदेव तृतीय भावमा गोचर गर्दा साहस, पराक्रम, मान-सम्मान र सरकारी कार्यमा पूर्ण विजय प्राप्त हुनेछ।',
        careerFinance: 'कार्यक्षेत्रमा प्रभुत्व, नयाँ जिम्मेवारी प्राप्ति तथा व्यापारिक सम्झौताबाट मनग्ये आर्थिक लाभ मिल्नेछ।',
        familyHealth: 'भाइबहिनीसँगको सम्बन्ध सुधार हुनेछ, शारीरिक आरोग्यता, स्फूर्ति र आत्मविश्वास उच्च रहनेछ।',
        remedy: 'बिहान तामाको पात्रबाट सूर्यलाई रातो चन्दन र अक्षतायुक्त जल अर्पण गर्नुहोस्।',
      };
    case 6:
      return {
        impactType: 'अत्यन्त शुभ',
        badgeColor: 'bg-emerald-600 text-white',
        summary: 'छैटौँ भावको सूर्यले समस्त शत्रुहरूको दमन, रोगबाट मुक्ति र कानुनी वा प्रतिस्पर्धात्मक परीक्षामा अपार सफलता दिलाउँछ।',
        careerFinance: 'आर्थिक ऋण तथा दायित्व चुक्ता हुनेछ, नयाँ रोजगारी वा पदोन्नतिको ढोका खुल्नेछ।',
        familyHealth: 'दीर्घकालीन रोगमा सुधार आउनेछ, मानसिक दृढता र शारीरिक बलमा उल्लेखनीय वृद्धि हुनेछ।',
        remedy: 'आदित्य हृदय स्तोत्रको नियमित पाठ गर्ने तथा गाईलाई गहुँको रोटी खुवाउने।',
      };
    case 10:
      return {
        impactType: 'अत्यन्त शुभ',
        badgeColor: 'bg-emerald-600 text-white',
        summary: 'दशम भावमा सूर्यदेव कुलदीपक योग समान रहने हुँदा राज्यसम्मान, राजनीति तथा प्रशासनिक उच्च पद प्राप्त हुनेछ।',
        careerFinance: 'व्यापारमा अत्यधिक उन्नति, उच्च अधिकारीहरूसँग निकटता र स्थायी सम्पत्ति जोड्ने सुअवसर बन्नेछ।',
        familyHealth: 'पिताको मान-प्रतिष्ठामा वृद्धि, पारिवारिक गौरव बढ्ने तथा स्वास्थ्य उत्तम रहनेछ।',
        remedy: 'पिता वा मान्यजनको पाउ छोएर आशीर्वाद लिने र ॐ घृणिः सूर्याय नमः मन्त्र १०८ पटक जप गर्ने।',
      };
    case 11:
      return {
        impactType: 'अत्यन्त शुभ',
        badgeColor: 'bg-emerald-600 text-white',
        summary: 'एकादश भावको सूर्यले सबै प्रकारका मनोकांक्षा पूरा गराउँछ र विविध स्रोतहरूबाट प्रचुर धनलाभ गराउँछ।',
        careerFinance: 'रोकिएको धन हात पर्नेछ, बहुराष्ट्रिय वा सरकारी परियोजनाहरूबाट विशाल आर्थिक उपार्जन हुनेछ।',
        familyHealth: 'ठूला दाजुभाइ तथा प्रतिष्ठित मित्रहरूको साथ पाइनेछ, मानसिक आनन्द र आरोग्य प्राप्त हुनेछ।',
        remedy: 'आइतबारको दिन रातो वस्त्र वा तामाको भाँडो गरिब वा मन्दिरमा दान गर्नुहोस्।',
      };
    case 1:
      return {
        impactType: 'मध्यम',
        badgeColor: 'bg-amber-600 text-white',
        summary: 'लग्नमा सूर्यको प्रभावले आत्मविश्वास र तेज बढ्नेछ तापनि अहंकार र पित्त विकारबाट जोगिनुपर्छ।',
        careerFinance: 'काममा नेतृत्वदायी भूमिका मिल्नेछ तर साझेदारसँग अहंकारका कारण सामान्य मनमुटाव हुन सक्छ।',
        familyHealth: 'टाउको दुख्ने वा आँखामा जलन हुन सक्छ, प्रशस्त पानी पिउने र रिस नियन्त्रण गर्ने।',
        remedy: 'बिहान गायत्री मन्त्रको जप गर्ने र रातो चन्दनको तिलक लगाउने।',
      };
    case 2:
      return {
        impactType: 'कष्ट/सावधानी',
        badgeColor: 'bg-rose-600 text-white',
        summary: 'दोस्रो भावको सूर्यले बोलीमा रुखोपन ल्याउन सक्ने भएकाले आर्थिक तथा पारिवारिक संवादमा धैर्यता आवश्यक छ।',
        careerFinance: 'अनावश्यक विलासितामा धन खर्च हुन सक्छ, ठूलो नयाँ लगानी गर्दा अग्रजको सल्लाह लिनुहोला।',
        familyHealth: 'मुख वा दाँत सम्बन्धी सामान्य समस्या हुन सक्छ, कुटुम्बसँग विवादबाट टाढा रहनु उपयुक्त हुन्छ।',
        remedy: 'आइतबार नुन कम खाने (अलिनो व्रत) र सूर्य गायत्री मन्त्र जप गर्ने।',
      };
    case 4:
      return {
        impactType: 'कष्ट/सावधानी',
        badgeColor: 'bg-rose-600 text-white',
        summary: 'चौथो भावमा सूर्यले मनमा अशान्ति र पारिवारिक सुखमा केही तनाव उत्पन्न गराउन सक्छ।',
        careerFinance: 'कार्यक्षेत्रमा दौडधुप बढी हुनेछ, घरजग्गाको कागजातमा हस्ताक्षर गर्दा होसियार रहनुहोला।',
        familyHealth: 'आमाको स्वास्थ्यमा विशेष ख्याल राख्नुपर्छ, छाती वा रक्तचापको नियमित जाँच गराउनुहोला।',
        remedy: 'शिवलिङ्गमा जल अर्पण गर्ने र घरको ईशान कोणमा शुद्ध घ्युको दीप बाल्ने।',
      };
    case 5:
      return {
        impactType: 'मध्यम',
        badgeColor: 'bg-amber-600 text-white',
        summary: 'पाँचौँ भावको सूर्यले बौद्धिक क्षमता बढाउने भए पनि सन्तान र प्रेम सम्बन्धमा केही असमझदारी ल्याउन सक्छ।',
        careerFinance: 'बौद्धिक कार्य, अनुसन्धान र परामर्श क्षेत्रमा राम्रो लाभ हुनेछ, जोखिमपूर्ण लगानी नगर्नुहोला।',
        familyHealth: 'पेट वा पाचन प्रणालीमा गडबडी हुन सक्छ, खानपानमा सात्त्विक आहार अपनाउनुहोला।',
        remedy: 'आइतबार विद्यार्थीलाई रातो कलम वा शैक्षिक सामग्री दान गर्नुहोस्।',
      };
    case 7:
      return {
        impactType: 'कष्ट/सावधानी',
        badgeColor: 'bg-rose-600 text-white',
        summary: 'सातौँ भावको सूर्यले जीवनसाथी तथा व्यावसायिक साझेदारसँग वैचारिक मतभेद गराउन सक्ने भएकाले संयम हुनुपर्छ।',
        careerFinance: 'साझेदारी व्यापारमा पारदर्शिता राख्नुहोला, यात्रा गर्दा सामान र समयको पूर्वयोजना बनाउनुहोला।',
        familyHealth: 'दाम्पत्य जीवनमा एकअर्काको भावनाको कदर गर्नुहोस्, ज्वरो वा थकावटबाट सतर्क रहनुहोस्।',
        remedy: 'सूर्यदेवलाई रातो फूल अर्पण गर्ने र लक्ष्मी-नारायणको पूजा गर्ने।',
      };
    case 8:
      return {
        impactType: 'कष्ट/सावधानी',
        badgeColor: 'bg-rose-700 text-white',
        summary: 'आठौँ भावको सूर्य गोचरले स्वास्थ्य तथा सरकारी झमेलाबाट विशेष सतर्कता अपनाउन निर्देश गर्दछ।',
        careerFinance: 'अकस्मात आर्थिक दायित्व थपिन सक्छ, गोप्य कार्यहरूमा गोपनीयता कायम राख्नुहोला।',
        familyHealth: 'अग्नि, धारिलो हतियार र तीव्र गतिको सवारी साधनबाट जोगिनुहोला, नियमित व्यायाम गर्नुहोस्।',
        remedy: 'महामृत्युञ्जय मन्त्र जप गर्ने र रातो गाईलाई गुड र गहुँ खुवाउने।',
      };
    case 9:
      return {
        impactType: 'शुभ',
        badgeColor: 'bg-blue-600 text-white',
        summary: 'नवम भावमा सूर्यको आगमनले धर्म, संस्कार, तीर्थाटन र उच्च अध्ययनमा रुचि बढाउनेछ।',
        careerFinance: 'भाग्यले साथ दिनेछ, दूरदराजको यात्राबाट लाभ हुनेछ, आध्यात्मिक क्षेत्रमा लगानी शुभ रहनेछ।',
        familyHealth: 'गुरु तथा पिताको स्वास्थ्यमा ध्यान दिनुहोला, आत्मबल र धर्मप्रतिको निष्ठा दृढ रहनेछ।',
        remedy: 'बिहान सूर्य नमस्कार गर्ने र मन्दिरमा तामाको दियो दान गर्ने।',
      };
    case 12:
    default:
      return {
        impactType: 'कष्ट/सावधानी',
        badgeColor: 'bg-rose-600 text-white',
        summary: 'बाह्रौँ भावमा सूर्यले अनावश्यक यात्रा, अस्पतालको खर्च र नेत्र सम्बन्धी समस्या निम्त्याउन सक्छ।',
        careerFinance: 'वैदेशिक कारोबारमा लाभ भए पनि स्वदेशी लगानीमा खर्च बढी हुनेछ, बजेट सन्तुलन मिलाउनुहोला।',
        familyHealth: 'अनिद्रा र आँखाको समस्या देखिन सक्छ, राति ढिलासम्म मोबाइल नहेर्नुहोला।',
        remedy: 'आइतबार काँचो दूध र जल पीपलमा चढाउने तथा "ॐ सूर्याय नमः" को जप गर्ने।',
      };
  }
}

function getChandraHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  const auspicious = [1, 3, 6, 7, 10, 11].includes(house);
  if (house === 8) {
    return {
      impactType: 'कष्ट/सावधानी',
      badgeColor: 'bg-rose-700 text-white',
      summary: 'चन्द्रमा आठौँ भावमा रहँदा अष्टम चन्द्र दोष लाग्ने भएकाले नयाँ काम सुरु नगर्नु र मानसिक तनावबाट जोगिनुहोला।',
      careerFinance: 'आर्थिक लेनदेनमा ठगीको जोखिम हुन सक्छ, जोखिमयुक्त सम्झौता आज स्थगित गर्नुहोस्।',
      familyHealth: 'चोटपटक तथा जल भयबाट जोगिनुहोला, मन अशान्त हुन सक्छ, ध्यान र प्राणायाम गर्नुहोस्।',
      remedy: 'भगवान् शिवजीलाई काँचो दूध र जल अर्पण गर्नुहोस् तथा ॐ नमः शिवाय जप गर्नुहोस्।',
    };
  }
  if (auspicious) {
    return {
      impactType: 'शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `चन्द्रमा ${house} औँ भावमा शुभ गोचर गर्दा मानसिक शान्ति, पारिवारिक सुख र कार्यसिद्धि मिल्नेछ।`,
      careerFinance: 'व्यापारमा तरल पुँजीको लाभ हुनेछ, नयाँ व्यक्तिहरूसँगको भेटघाट फलदायी रहनेछ।',
      familyHealth: 'मन प्रसन्न रहनेछ, आमा तथा स्त्री वर्गबाट सहयोग प्राप्त हुनेछ, स्वास्थ्य उत्तम रहनेछ।',
      remedy: 'सेतो चामल, दूध वा चाँदीको वस्तु दान गर्नुहोस् वा आमाको पाउ छुनुहोस्।',
    };
  }
  return {
    impactType: 'मध्यम',
    badgeColor: 'bg-amber-600 text-white',
    summary: `चन्द्रमा ${house} औँ भावमा मध्यम प्रभावकारी रहेकाले भावनामा बहकिएर निर्णय नलिनुहोला।`,
    careerFinance: 'दैनिक कार्य सामान्य गतिमा अघि बढ्नेछ, खर्चमा नियन्त्रण राख्नु राम्रो हुन्छ।',
    familyHealth: 'चिसो वा कफ सम्बन्धी समस्याबाट बच्नुहोला, पर्याप्त विश्राम लिनुहोस्।',
    remedy: 'शिव स्तोत्र पाठ गर्नुहोस् र जल खेर नफाल्नुहोस्।',
  };
}

function getMangalHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  if ([3, 6, 11].includes(house)) {
    return {
      impactType: 'अत्यन्त शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `सेनापति मंगल ${house} औँ भावमा रहँदा अद्भुत पराक्रम, शत्रुमाथि पूर्ण विजय र जग्गा-जमिन लाभ हुनेछ।`,
      careerFinance: 'इन्जिनियरिङ, ठेक्कापट्टा, सुरक्षा निकाय तथा रियल इस्टेटमा ठूलो धन उपार्जन हुनेछ।',
      familyHealth: 'शारीरिक स्फूर्ति, बल र रक्तसञ्चार बलियो रहनेछ, भाइहरूको पूर्ण सहयोग प्राप्त हुनेछ।',
      remedy: 'मंगलबार हनुमान चालीसा वा बजरंग बाण पाठ गर्नुहोस् र सिन्दूर अर्पण गर्नुहोस्।',
    };
  }
  if ([1, 2, 4, 7, 8, 12].includes(house)) {
    return {
      impactType: 'कष्ट/सावधानी',
      badgeColor: 'bg-rose-600 text-white',
      summary: `मंगलदेव ${house} औँ भावमा गोचर गर्दा रिस, चोटपटक र रक्त सम्बन्धी समस्याबाट जोगिनुपर्छ।`,
      careerFinance: 'कार्यस्थलमा सहकर्मीसँग विवाद हुन नदिनुहोला, आर्थिक जोखिम नलिनुहोला।',
      familyHealth: 'गाडी चलाउँदा विशेष सतर्क रहनुहोला, दाम्पत्य वा पारिवारिक विवादमा मौन रहनु हितकर हुन्छ।',
      remedy: 'रातो मसुरोको दाल वा सख्खर मंगलबार दान गर्नुहोस् र ॐ अं अंगारकाय नमः जप गर्नुहोस्।',
    };
  }
  return {
    impactType: 'मध्यम',
    badgeColor: 'bg-amber-600 text-white',
    summary: `मंगल ${house} औँ भावमा सामान्य फलदायी छ, कडा परिश्रमले मात्र सफलता मिल्नेछ।`,
    careerFinance: 'नयाँ योजनामा अघि बढ्दा अनुभवी व्यक्तिको सल्लाह लिनुहोला।',
    familyHealth: 'पेट वा छालामा गर्मी बढ्न सक्छ, शीतल आहार लिनुहोस्।',
    remedy: 'हनुमान मन्दिरमा दर्शन गरी रातो फल अर्पण गर्नुहोस्।',
  };
}

function getBudhaHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  if ([2, 4, 6, 8, 10, 11].includes(house)) {
    return {
      impactType: 'अत्यन्त शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `बुद्धिदाता बुध ${house} औँ भावमा गोचर गर्दा बौद्धिक कार्य, सञ्चार, व्यापार र अध्ययनमा उत्कृष्ट सफलता मिल्नेछ।`,
      careerFinance: 'वाणीको प्रभावले नयाँ ग्राहक तथा व्यापारिक सम्झौता हात पर्नेछ, शेयर बजार र लेखा कार्यमा लाभ हुनेछ।',
      familyHealth: 'मित्रजन तथा मामाघरबाट सहयोग मिल्नेछ, स्नायु प्रणाली र स्मरणशक्ति प्रखर रहनेछ।',
      remedy: 'बुधबार भगवान् गणेशजीलाई २१ मुन्ठा दुबो र लड्डु चढाउनुहोस्।',
    };
  }
  return {
    impactType: 'मध्यम',
    badgeColor: 'bg-amber-600 text-white',
    summary: `बुध ${house} औँ भावमा रहेकाले कागजी सम्झौता र सञ्चारमा दोहोरो अर्थ नलाग्ने गरी काम गर्नुहोला।`,
    careerFinance: 'व्यापारमा उधारो नदिनुहोला, इमेल वा फोन वार्तामा स्पष्टता राख्नुहोला।',
    familyHealth: 'छाला वा एलर्जीको समस्या हुन सक्छ, हरिया सागसब्जी बढी खानुहोस्।',
    remedy: 'हरियो मुंगको दाल दान गर्नुहोस् र ॐ बुं बुधाय नमः जप गर्नुहोस्।',
  };
}

function getGuruHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  if ([2, 5, 7, 9, 11].includes(house)) {
    return {
      impactType: 'अत्यन्त शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `देवगुरु बृहस्पति ${house} औँ भावमा अमृत समान फलदायी हुनुहुन्छ; ज्ञान, सन्तान, भाग्य र आर्थिक समृद्धिमा महायोग बन्नेछ।`,
      careerFinance: 'रोकिएका ठूला कार्यहरू सम्पन्न हुनेछन्, नयाँ लगानीबाट दीर्घकालीन लाभ र प्रतिष्ठा वृद्धि हुनेछ।',
      familyHealth: 'परिवारमा मङ्गलोत्सव वा धार्मिक अनुष्ठान हुनेछ, सन्तान सुख र गुरुको कृपा प्राप्त हुनेछ।',
      remedy: 'बिहीबार पहेँलो वस्त्र लगाउने, चनाको दाल दान गर्ने र ॐ बृं बृहस्पतये नमः जप गर्ने।',
    };
  }
  return {
    impactType: 'मध्यम',
    badgeColor: 'bg-amber-600 text-white',
    summary: `देवगुरु ${house} औँ भावमा गोचर गर्दा धार्मिक खर्च बढ्ने र काममा केही विलम्ब हुन सक्छ तर अन्ततः शुभ रहनेछ।`,
    careerFinance: 'अनावश्यक ठूलो ऋण नलिनुहोला, आफ्ना गुरु वा अग्रजको मार्गनिर्देशनमा हिँड्नुहोस्।',
    familyHealth: 'कलेजो वा मोटोपना सम्बन्धी समस्यामा ध्यान दिनुहोला, प्राणायाम गर्नुहोस्।',
    remedy: 'विष्णु सहस्रनाम पाठ गर्ने वा मन्दिरमा केरा र बेसार दान गर्ने।',
  };
}

function getShukraHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  if ([1, 2, 3, 4, 5, 8, 9, 11, 12].includes(house)) {
    return {
      impactType: 'अत्यन्त शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `दैत्यगुरु शुक्र ${house} औँ भावमा रहँदा सुख, सौन्दर्य, वाहन, विलासिता र भौतिक ऐश्वर्यको आनन्द प्राप्त हुनेछ।`,
      careerFinance: 'कला, साहित्य, फेसन, होटल तथा मनोरञ्जन क्षेत्रबाट मनग्ये आम्दानी हुनेछ।',
      familyHealth: 'दाम्पत्य जीवन मधुर रहनेछ, नयाँ वस्त्र र आभूषण खरिद गर्ने योग बन्नेछ।',
      remedy: 'शुक्रबार महालक्ष्मी मन्दिरमा सेतो खीर वा मिश्री चढाउनुहोस्।',
    };
  }
  return {
    impactType: 'मध्यम',
    badgeColor: 'bg-amber-600 text-white',
    summary: `शुक्र ${house} औँ भावमा केही कमजोर रहेकाले विपरीत लिङ्गीसँगको सम्बन्ध र फजुल खर्चमा नियन्त्रण राख्नुहोला।`,
    careerFinance: 'सौन्दर्य प्रसाधन वा विलासितामा बजेटभन्दा बढी खर्च हुन सक्छ, सतर्क रहनुहोला।',
    familyHealth: 'मधुमेह वा मूत्र विकारबाट सजग रहनुहोस्, सरसफाइमा ध्यान दिनुहोस्।',
    remedy: 'सेतो चामल र चिनी गरिबलाई दान गर्नुहोस् र श्री सूक्त पाठ गर्नुहोस्।',
  };
}

function getShaniHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  if ([3, 6, 11].includes(house)) {
    return {
      impactType: 'अत्यन्त शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `न्यायाधीश शनिदेव ${house} औँ भावमा महाबली हुनुहुन्छ; शत्रु परास्त, राज्यपद प्राप्ति र ठूलो स्थिर सम्पत्ति लाभ हुनेछ।`,
      careerFinance: 'पुराना कानुनी झमेला समाधान हुनेछन्, उद्योग, फलाम, खानी तथा निर्माण क्षेत्रमा ठूलो धन आर्जन हुनेछ।',
      familyHealth: 'दीर्घायु र आरोग्य लाभ हुनेछ, सेवक तथा श्रमिक वर्गबाट पूर्ण सहयोग मिल्नेछ।',
      remedy: 'शनिबार पीपलको रुखमुनि तोरीको तेलको दीप बाल्ने र शनि चालिसा पाठ गर्ने।',
    };
  }
  if ([12, 1, 2].includes(house)) {
    const phase = house === 12 ? 'प्रथम चरण (सिरमा)' : house === 1 ? 'द्वितीय चरण (हृदयमा - शिखर)' : 'तृतीय चरण (गोडामा)';
    return {
      impactType: 'कष्ट/सावधानी',
      badgeColor: 'bg-rose-700 text-white',
      summary: `शनिदेवको साढेसातीको ${phase} प्रभाव छ; कडा परिश्रम, धैर्यता र आर्थिक कारोबारमा विशेष सतर्कता राख्नुहोला।`,
      careerFinance: 'नयाँ जोखिमपूर्ण लगानी नगर्नुहोला, काममा ढिलाइ भए पनि धैर्यतापूर्वक निरन्तरता दिनुहोस्।',
      familyHealth: 'मानसिक तनाव र अनिद्राबाट जोगिनुहोला, ज्येष्ठ नागरिक तथा असहायलाई सहयोग गर्नुहोस्।',
      remedy: 'छायापात्र दान (तोरीको तेलमा आफ्नो मुख हेरेर दान गर्ने), कालो तिल र मासको दाल दान गर्ने।',
    };
  }
  if (house === 4 || house === 8) {
    const dType = house === 4 ? 'चौथो भावको कण्टक शनि ढैय्या' : 'आठौँ भावको अष्टम शनि ढैय्या';
    return {
      impactType: 'कष्ट/सावधानी',
      badgeColor: 'bg-rose-700 text-white',
      summary: `शनिदेवको ${dType} चलिरहेकाले स्वास्थ्य, सवारी साधन तथा घरजग्गा सम्बन्धी निर्णयमा अत्यधिक सावधानी आवश्यक छ।`,
      careerFinance: 'कार्यक्षेत्रमा अचानक परिवर्तन वा जिम्मेवारीको बोझ हुन सक्छ, धैर्यता नगुमाउनुहोला।',
      familyHealth: 'छाती, घुँडा वा नसा सम्बन्धी समस्याबाट सतर्क रहनुहोला, बाटो काट्दा ध्यान दिनुहोला।',
      remedy: 'महामृत्युञ्जय मन्त्रको नियमित १०८ जप गर्ने र हनुमानजीलाई तेल-सिन्दूर चढाउने।',
    };
  }
  return {
    impactType: 'मध्यम',
    badgeColor: 'bg-amber-600 text-white',
    summary: `शनिदेव ${house} औँ भावमा सामान्य छन्; अनुशासन, इमानदारिता र मिहिनेतले कार्य सम्पन्न हुनेछ।`,
    careerFinance: 'सजिलै केही पाइने छैन, निरन्तरको लगनशीलताले मात्रै फल दिनेछ।',
    familyHealth: 'शारीरिक थकावट हुन सक्छ, समयमै सुत्ने र उठ्ने बानी बसाल्नुहोला।',
    remedy: 'शनि मन्त्र "ॐ शं शनैश्चराय नमः" जप गर्नुहोस् र कालो कुकुरलाई रोटी खुवाउनुहोस्।',
  };
}

function getRahuHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  if ([3, 6, 11].includes(house)) {
    return {
      impactType: 'अत्यन्त शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `छायाग्रह राहु ${house} औँ भावमा आकस्मिक चमत्कारिक फलदायी हुनुहुन्छ; वैदेशिक अवसर, अचानक धनलाभ र शत्रु विजय हुनेछ।`,
      careerFinance: 'प्रविधि, मिडिया, विदेश व्यापार तथा अनलाइन कारोबारबाट अप्रत्याशित ठूलो फाइदा मिल्नेछ।',
      familyHealth: 'आत्मविश्वास उच्च रहनेछ, पुराना जटिल समस्याहरू अचानक हल हुनेछन्।',
      remedy: 'दुर्गा सप्तशती वा देवी कवचको पाठ गर्ने, चराचुरुङ्गीलाई चारो हाल्ने।',
    };
  }
  return {
    impactType: 'कष्ट/सावधानी',
    badgeColor: 'bg-rose-600 text-white',
    summary: `राहु ${house} औँ भावमा रहेकाले भ्रम, गलत संगत, अनावश्यक शङ्का र कानुनी झमेलाबाट टाढै रहनुहोला।`,
    careerFinance: 'लोभ वा छिटो धनी हुने प्रलोभनमा नफस्नुहोला, शेयर वा सट्टेबाजीबाट टाढै बस्नु हितकर हुन्छ।',
    familyHealth: 'मानसिक बेचैनी, पेटमा ग्यास वा निद्रामा गडबडी हुन सक्छ, ध्यान साधना गर्नुहोस्।',
    remedy: 'राहु मन्त्र "ॐ रां राहवे नमः" जप गर्ने, कालो तिल वा नरिवल बग्दो नदीमा बगाउने।',
  };
}

function getKetuHousePhala(house: number): {
  impactType: RashiTransitImpact['impactType'];
  badgeColor: string;
  summary: string;
  careerFinance: string;
  familyHealth: string;
  remedy: string;
} {
  if ([3, 6, 11, 12].includes(house)) {
    return {
      impactType: 'अत्यन्त शुभ',
      badgeColor: 'bg-emerald-600 text-white',
      summary: `मोक्षकारक केतु ${house} औँ भावमा आध्यात्मिक चिन्तन, गूढ विद्या, साधना तथा गुप्त धनलाभ गराउनुहुनेछ।`,
      careerFinance: 'अनुसन्धान, चिकित्सा, आयुर्वेद तथा आध्यात्मिक परामर्श कार्यमा उच्च सफलता मिल्नेछ।',
      familyHealth: 'आत्मिक शान्ति, साधनामा सिद्धि र मानसिक एकाग्रता बढ्नेछ।',
      remedy: 'गणेश सङ्कटनाशन स्तोत्र पाठ गर्ने र कुकुरलाई मीठो रोटी खुवाउने।',
    };
  }
  return {
    impactType: 'मध्यम',
    badgeColor: 'bg-amber-600 text-white',
    summary: `केतु ${house} औँ भावमा रहेकाले भौतिक कार्यमा केही वैराग्य वा उदासीनता आउन सक्छ; एकाग्र भई काम गर्नुहोस्।`,
    careerFinance: 'काममा बीचमै छोड्ने बानीबाट बच्नुहोला, साझेदारीमा शङ्का नगर्नुहोला।',
    familyHealth: 'चोटपटक, एलर्जी वा संक्रमणबाट सावधान रहनुहोला, सरसफाइमा ध्यान दिनुहोस्।',
    remedy: 'केतु मन्त्र "ॐ कें केतवे नमः" जप गर्ने र गरिबलाई कम्बल वा कालो-सेतो तिल दान गर्ने।',
  };
}

// ----------------------------------------------------------------------------
// Master Article Generator for each of the 9 Grahas
// ----------------------------------------------------------------------------
export function generateLiveGrahaGocharNews(
  transitPlanets: PlanetPosition[] = [],
  todayBS: string = 'आज',
  todayAD: string = 'today'
): GrahaGocharNewsArticle[] {
  const safePlanets = Array.isArray(transitPlanets) ? transitPlanets : [];
  const planetList: PlanetName[] = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'];
  const articles: GrahaGocharNewsArticle[] = [];

  planetList.forEach((pName, index) => {
    const foundPlanet = safePlanets.find((p) => p && p.name === pName) || safePlanets[index];
    const planetPos = foundPlanet || {
      id: pName,
      name: pName,
      englishName: pName,
      symbol: '☉',
      longitude: 0,
      degree: 15,
      minutes: 0,
      seconds: 0,
      formattedDegree: "१५° ००' ००\"",
      rashiId: 1,
      rashiName: 'मेष',
      nakshatraId: 1,
      nakshatraName: 'अश्विनी',
      nakshatraLord: 'केतु',
      pada: 1,
      bhava: 1,
      speed: 1,
      isRetrograde: false,
      isCombust: false,
      dignity: 'समराशि'
    };

    const currentRashiId = typeof planetPos.rashiId === 'number' ? planetPos.rashiId : 1;
    const currentRashiName = planetPos.rashiName || RASHI_DATA[currentRashiId - 1]?.name || 'मेष';
    const degreeStr = planetPos.formattedDegree || `${toDevanagariNumerals(planetPos.degree ?? 15)}° ${toDevanagariNumerals(planetPos.minutes ?? 0)}'`;
    const nakshatra = planetPos.nakshatraName || 'अश्विनी';
    const pada = typeof planetPos.pada === 'number' ? planetPos.pada : 1;
    const nakshatraLord = planetPos.nakshatraLord || 'देवता';
    const isRetrograde = !!planetPos.isRetrograde;
    const isCombust = !!planetPos.isCombust;
    const dignity = planetPos.dignity || 'समराशि';

    let motionStatus = 'मार्गी (Direct)';
    if (isRetrograde) motionStatus = 'वक्री (Retrograde)';
    if (isCombust) motionStatus += ' • अस्त (Combust)';
    if (dignity === 'उच्च') motionStatus += ' • उच्च राशि';
    if (dignity === 'नीच') motionStatus += ' • नीच राशि';
    if (dignity === 'स्वक्षेत्र') motionStatus += ' • स्वगृह';

    // Calculate impacts for all 12 Rashis
    const rashiImpacts: RashiTransitImpact[] = RASHI_DATA.map((rashi) => {
      const houseFromRashi = ((currentRashiId - rashi.id + 12) % 12) + 1;
      const houseNameNepali = HOUSE_NAMES[houseFromRashi] || `${houseFromRashi} औँ भाव`;

      let phala;
      switch (pName) {
        case 'सूर्य': phala = getSuryaHousePhala(houseFromRashi); break;
        case 'चन्द्र': phala = getChandraHousePhala(houseFromRashi); break;
        case 'मंगल': phala = getMangalHousePhala(houseFromRashi); break;
        case 'बुध': phala = getBudhaHousePhala(houseFromRashi); break;
        case 'गुरु': phala = getGuruHousePhala(houseFromRashi); break;
        case 'शुक्र': phala = getShukraHousePhala(houseFromRashi); break;
        case 'शनि': phala = getShaniHousePhala(houseFromRashi); break;
        case 'राहु': phala = getRahuHousePhala(houseFromRashi); break;
        case 'केतु': phala = getKetuHousePhala(houseFromRashi); break;
        default: phala = getSuryaHousePhala(houseFromRashi); break;
      }

      // Lucky attributes for this sign under this planet
      const luckyColors: Record<string, string> = {
        'मेष': 'रातो / पहेँलो', 'वृष': 'सेतो / गुलाबी', 'मिथुन': 'हरियो / आकासे',
        'कर्कट': 'दूधिया सेतो / चाँदी', 'सिंह': 'रातो / सुनौलो', 'कन्या': 'गाढा हरियो',
        'तुला': 'चम्किलो सेतो / क्रिम', 'वृश्चिक': 'गाढा रातो / मरुन', 'धनु': 'पहेँलो / सुन्तला',
        'मकर': 'नीलो / कालो', 'कुम्भ': 'आसमानी नीलो', 'मीन': 'पहेँलो / केसरिया'
      };

      const luckyNumbers: Record<string, string> = {
        'मेष': '१, ९', 'वृष': '२, ६', 'मिथुन': '३, ५', 'कर्कट': '२, ४',
        'सिंह': '१, ५', 'कन्या': '५, ६', 'तुला': '६, ७', 'वृश्चिक': '९, ३',
        'धनु': '३, ९', 'मकर': '८, ६', 'कुम्भ': '८, ७', 'मीन': '३, १२'
      };

      const favorableDays: Record<string, string> = {
        'सूर्य': 'आइतबार', 'चन्द्र': 'सोमबार', 'मंगल': 'मंगलबार', 'बुध': 'बुधबार',
        'गुरु': 'बिहीबार', 'शुक्र': 'शुक्रबार', 'शनि': 'शनिबार', 'राहु': 'शनिबार/बुधबार', 'केतु': 'मंगलबार/बिहीबार'
      };

      return {
        rashiId: rashi.id,
        rashiName: rashi.name,
        symbol: rashi.symbol,
        houseFromRashi,
        houseNameNepali,
        impactType: phala.impactType,
        impactBadgeColor: phala.badgeColor,
        summary: phala.summary,
        careerFinance: phala.careerFinance,
        familyHealth: phala.familyHealth,
        remedy: phala.remedy,
        luckyColor: luckyColors[rashi.name] || 'शुभ रङ्ग',
        luckyNumber: luckyNumbers[rashi.name] || '१, ९',
        favorableDay: favorableDays[pName] || 'सोमबार',
      };
    });

    const beneficiaryRashis = rashiImpacts
      .filter((i) => i.impactType === 'अत्यन्त शुभ' || i.impactType === 'शुभ')
      .map((i) => i.rashiName);

    const cautionaryRashis = rashiImpacts
      .filter((i) => i.impactType === 'कष्ट/सावधानी')
      .map((i) => i.rashiName);

    // Planet-specific News Metadata
    let title = '';
    let headline = '';
    let leadSummary = '';
    let fullBody = '';
    let classicalReference = '';
    let mundaneImpact = '';

    switch (pName) {
      case 'सूर्य':
        title = `सूर्यदेवको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा प्रत्यक्ष गोचर: राष्ट्रिय तथा १२ राशिमा पर्ने समग्र प्रभाव`;
        headline = `🔴 प्रत्यक्ष खगोल बुलेटिन: आत्मा र मान-सम्मानका कारक सूर्यदेव ${currentRashiName} राशिमा ${degreeStr} मा सञ्चारित`;
        leadSummary = `वैदिक ज्योतिषका अधिपति भगवान् सूर्यदेव हाल ${currentRashiName} राशि तथा ${nakshatra} नक्षत्रको चरण ${toDevanagariNumerals(pada)} मा भ्रमणशील हुनुहुन्छ। यस गोचरले विशेष गरी ${beneficiaryRashis.join(', ')} राशिका जातकहरूलाई राज्य सम्मान, पराक्रम र धन ऐश्वर्य प्रदान गर्नेछ भने ${cautionaryRashis.join(', ')} राशिले स्वास्थ्य र अहंकारमा विशेष संयम अपनाउनुपर्नेछ।`;
        fullBody = `भगवान् सूर्यदेव समस्त जगतका आत्मा र प्रत्यक्ष देवता हुनुहुन्छ। सूर्यको गोचर चालले पृथ्वीको मौसम, राजनीतिक नेतृत्व, प्रशासनिक निर्णय तथा जनमानसमा आत्मविश्वासको सञ्चार गराउँछ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार (वृहत्संहिता तथा फलदीपिका):**
गोचरमा सूर्यदेव चन्द्र राशिबाट ३, ६, १० र ११ औँ भावमा शुभ फलदायक मानिनुहुन्छ। यी भावहरूमा सूर्यको आगमन हुँदा रोकिएका सरकारी कामहरू बन्ने, प्रशासनिक अधिकार प्राप्त हुने र शत्रुहरू स्वतः परास्त हुने शास्त्रीय प्रमाण छ। बाँकी भावहरूमा सूर्यले पित्त विकार, शारीरिक उष्णता र मानसिक दम्भ ल्याउन सक्ने भएकाले संयम अपनाउनुपर्छ।`;
        classicalReference = 'वृहत्संहिता (गोचर अध्याय) तथा फलदीपिका (श्लोक ४–६)';
        mundaneImpact = 'प्रशासनिक क्षेत्रमा कडा नियम लागू हुने, सरकारी राजस्वमा वृद्धि हुने र सुन-चाँदीको बजारमा स्थिरता आउने संकेत।';
        break;

      case 'चन्द्र':
        title = `मन र जलका कारक चन्द्रमाको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा तीव्र गोचर सञ्चार`;
        headline = `🔴 प्रत्यक्ष चन्द्र बुलेटिन: चन्द्रमा ${currentRashiName} राशिमा ${degreeStr} मा सक्रिय, दैनिक मानसिक र आर्थिक तरङ्ग`;
        leadSummary = `प्रत्येक सवा दुई दिनमा राशि परिवर्तन गर्ने मनका कारक चन्द्रमा हाल ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा अवस्थित हुनुहुन्छ। यस गोचरले गर्दा आज ${beneficiaryRashis.join(', ')} राशिलाई मानसिक शान्ति र आर्थिक समृद्धि मिल्नेछ भने ${cautionaryRashis.join(', ')} राशिमा मानसिक चञ्चलता र अष्टम चन्द्रको प्रभाव रहनेछ।`;
        fullBody = `चन्द्रमा वैदिक ज्योतिषमा मन, भावना, माता र जल तत्त्वका स्वामी हुनुहुन्छ। दैनिक गोचरमा चन्द्रमाको स्थिति नै हाम्रो मनोदशा र मुड निर्धारण गर्ने प्रमुख कारक हो।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार (मानसागरी तथा जातकाभरणम्):**
चन्द्रमा जन्म चन्द्र राशिबाट १, ३, ६, ७, १० र ११ औँ भावमा गोचर गर्दा उत्तम भोजन, वस्त्रलाभ, पारिवारिक सुख र व्यापारमा तरलता प्रदान गर्नुहुन्छ। आठौँ भावमा चन्द्रमा रहँदा 'अष्टम चन्द्र' लाग्ने भएकाले यस अवधिमा महत्त्वपूर्ण नयाँ कार्य सुरु नगर्नु र मानसिक तनावबाट जोगिनु शास्त्रीय नियम छ।`;
        classicalReference = 'जातकाभरणम् (चन्द्र गोचर फल) तथा मानसागरी';
        mundaneImpact = 'दुग्ध व्यवसाय, जलस्रोत, शेयर बजारको उतारचढाव तथा जनमानसमा भावनात्मक संवेदनशीलता वृद्धि हुनेछ।';
        break;

      case 'मंगल':
        title = `सेनापति मंगलको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा पराक्रमी गोचर: ऊर्जा र साहसको प्रवाह`;
        headline = `🔴 मंगल गोचर समाचार: रक्त र भूमिकारक मंगल ${currentRashiName} राशिमा ${degreeStr} मा गोचररत`;
        leadSummary = `शौर्य, भूमि र पराक्रमका प्रतीक मंगलदेव हाल ${currentRashiName} राशि तथा ${nakshatra} नक्षत्रको पाउ ${toDevanagariNumerals(pada)} मा गतिमान हुनुहुन्छ। यस गोचरले ${beneficiaryRashis.join(', ')} राशिलाई अद्भुत साहस, कानुनी विजय र जग्गा-जमिनको लाभ दिलाउनेछ भने ${cautionaryRashis.join(', ')} राशिले रिस र दुर्घटनाबाट बच्नुपर्नेछ।`;
        fullBody = `मंगलदेव नवग्रह मण्डलका सेनापति हुनुहुन्छ। उहाँको प्रभावले मानिसमा दृढ संकल्प, प्राविधिक सीप र प्रतिस्पर्धी क्षमता पैदा गर्दछ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार (फलदीपिका मंगल गोचर):**
मंगलदेव चन्द्र राशिबाट ३, ६ र ११ औँ भावमा अत्यन्त शुभ फलदायी हुनुहुन्छ। यी भावहरूमा मंगल रहँदा शत्रुहरू परास्त हुने, कर्जा चुक्ता हुने र निर्माण क्षेत्रमा विशाल सफलता मिल्ने गर्दछ। १, २, ४, ७, ८ र १२ भावमा भने रक्त विकार, चोटपटक र दाम्पत्य खटपट गराउने भएकाले हनुमानजीको आराधना अनिवार्य मानिन्छ।`;
        classicalReference = 'फलदीपिका अध्याय २६ (श्लोक ७) तथा बृहत्पाराशर होराशास्त्र';
        mundaneImpact = 'सुरक्षा निकायमा सक्रियता, पूर्वाधार तथा निर्माण कार्यमा तीव्रता, रियल इस्टेट बजारमा उत्साहजनक कारोबार।';
        break;

      case 'बुध':
        title = `बुद्धिदाता बुधको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा शुभ सञ्चार: व्यापार र शिक्षामा नयाँ आयाम`;
        headline = `🔴 बुध गोचर अपडेट: वाणी र व्यापारका स्वामी बुध ${currentRashiName} राशिमा ${degreeStr} मा सञ्चारित`;
        leadSummary = `तर्क, गणित र सञ्चारका अधिपति बुधदेव हाल ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा विराजमान हुनुहुन्छ। यस गोचरले ${beneficiaryRashis.join(', ')} राशिलाई अध्ययन, व्यापार, बौद्धिक प्रतिस्पर्धा र लेखा कार्यमा उच्च सफलता दिलाउनेछ।`;
        fullBody = `बुधदेव नवग्रहका राजकुमार मानिनुहुन्छ। उहाँको गोचर प्रभावले विद्यार्थीहरूमा प्रखर स्मरणशक्ति, व्यापारीहरूमा नाफा र लेखक/पत्रकारहरूमा उत्कृष्ट सिर्जनशीलता ल्याउँछ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार:**
बुधदेव चन्द्र राशिबाट २, ४, ६, ८, १० र ११ औँ भावमा गोचर गर्दा अत्यन्त शुभ मानिन्छ। यी भावहरूमा बुधले मीठो बोली, नयाँ साथीभाइको संगत, परीक्षामा सफलता र व्यापारिक सम्झौताबाट आकस्मिक धनलाभ गराउँछन्।`;
        classicalReference = 'मुहूर्तचिन्तामणि तथा फलदीपिका (बुध प्रभाव)';
        mundaneImpact = 'सूचना प्रविधि, डिजिटल सञ्चार, शेयर बजार तथा शैक्षिक गतिविधिहरूमा सकारात्मक सुधार।';
        break;

      case 'गुरु':
        title = `देवगुरु बृहस्पतिको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा महागोचर: ज्ञान, सन्तान र ऐश्वर्यको वर्षा`;
        headline = `🔴 महागोचर बुलेटिन: धर्म र भाग्योदयका कारक देवगुरु बृहस्पति ${currentRashiName} राशिमा ${degreeStr} मा स्थित`;
        leadSummary = `समस्त देवगणका गुरु तथा ब्रह्माण्डका महान् शुभ ग्रह बृहस्पति हाल ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा गोचर गर्दै हुनुहुन्छ। यस गोचरले विशेष गरी ${beneficiaryRashis.join(', ')} राशिका जातकहरूलाई विवाह योग, पुत्र लाभ, उच्च शिक्षा र धनधान्यको अपार वृद्धि गराउनेछ।`;
        fullBody = `देवगुरु बृहस्पति नवग्रह मण्डलका सबैभन्दा परोपकारी र शुभ फल प्रदायक ग्रह हुनुहुन्छ। उहाँको दृष्टि जहाँ पर्छ, त्यहाँ अमृत वर्षा समान कल्याण हुने शास्त्रीय वचन छ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार (वृहत्संहिता तथा जातकपारिजात):**
बृहस्पति चन्द्र राशिबाट २, ५, ७, ९ र ११ औँ भावमा गोचर गर्दा राजयोग समान फल प्रदान गर्नुहुन्छ। दोस्रोमा धन, पाँचौँमा सन्तान र बुद्धि, सातौँमा विवाह र व्यापार, नवौँमा महाभाग्य र एघारौँमा सर्वतोमुखी लाभ प्राप्त हुन्छ। अन्य भावमा भने धार्मिक खर्च र संयमताको खाँचो पर्दछ।`;
        classicalReference = 'जातकपारिजात (गोचर फलाध्याय) तथा वृहत्संहिता';
        mundaneImpact = 'न्यायपालिकामा सकारात्मक सुधार, धार्मिक तथा सांस्कृतिक उत्सवहरूमा जनसहभागिता, अर्थतन्त्रमा दीर्घकालीन स्थायित्व।';
        break;

      case 'शुक्र':
        title = `दैत्यगुरु शुक्रको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा सौन्दर्यमय गोचर: सुख, प्रेम र वैभव`;
        headline = `🔴 शुक्र गोचर समाचार: ऐश्वर्य र कलाका अधिपति शुक्रदेव ${currentRashiName} राशिमा ${degreeStr} मा गोचररत`;
        leadSummary = `भौतिक सुख, सौन्दर्य र दाम्पत्यका कारक शुक्रदेव हाल ${currentRashiName} राशि तथा ${nakshatra} नक्षत्रमा भ्रमणशील हुनुहुन्छ। यस गोचरले ${beneficiaryRashis.join(', ')} राशिलाई प्रेम सम्बन्ध, वाहन सुख र विलासिताका साधनहरू जुटाउन मद्दत गर्नेछ।`;
        fullBody = `शुक्रदेव कला, सङ्गीत, सौन्दर्य, फेसन र दाम्पत्य सुखका प्रत्यक्ष कारक हुनुहुन्छ। उहाँको अनुकूल गोचरले जीवनमा रोमान्स र आर्थिक सहजता ल्याउँछ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार:**
शुक्रदेव प्रायः धेरै भावहरू (१, २, ३, ४, ५, ८, ९, ११ र १२) मा शुभ फल दिने ग्रह हुनुहुन्छ। बाह्रौँ भावमा शुक्र रहँदा पनि शय्या सुख र विलासितामा शुभ मानिन्छ। केवल ६, ७ र १० औँ भावमा भने दाम्पत्य खटपट र अपमानबाट जोगिनुपर्छ।`;
        classicalReference = 'फलदीपिका तथा मानसागरी (शुक्र गोचर फल)';
        mundaneImpact = 'पर्यटन, होटल, मनोरञ्जन र फेसन उद्योगमा उछाल, सुन-गहना खरिद-बिक्रीमा वृद्धि।';
        break;

      case 'शनि':
        title = `न्यायाधीश शनिदेवको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा ऐतिहासिक गोचर: साढेसाती, ढैय्या र कर्मफल`;
        headline = `🔴 शनि गोचर महाबुलेटिन: कर्मफलदाता शनिदेव ${currentRashiName} राशिमा ${degreeStr} मा गोचररत (साढेसाती र ढैय्याको पूर्ण विश्लेषण)`;
        leadSummary = `न्याय र कर्मका देवता शनिदेव हाल ${currentRashiName} राशि तथा ${nakshatra} नक्षत्रमा विराजमान हुनुहुन्छ। यस गोचरले ${beneficiaryRashis.join(', ')} राशिलाई स्थायी सम्पत्ति, शत्रु विजय र अधिकार दिलाउनेछ भने साढेसाती तथा ढैय्या चल्ने राशिहरूले विशेष सतर्कता र उपाय अवलम्बन गर्नुपर्नेछ।`;
        fullBody = `शनिदेव निष्पक्ष न्यायाधीश हुनुहुन्छ। उहाँले मानिसलाई उसको सत्कर्म र दुष्कर्म अनुसार फल प्रदान गर्नुहुन्छ। शनिदेवको गोचरले समाजमा अनुशासन, श्रमको सम्मान र आध्यात्मिक वैराग्य जगाउँछ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार (शनि गोचर तथा साढेसाती):**
शनिदेव चन्द्र राशिबाट ३, ६ र ११ औँ भावमा गोचर गर्दा अभूतपूर्व सफलता, शत्रु दमन र स्थिर सम्पत्ति लाभ गराउनुहुन्छ। १२, १ र २ भावमा साढेसाती (७.५ वर्ष) तथा ४ र ८ भावमा ढैय्या (२.५ वर्ष) चल्ने भएकाले यस अवधिमा मानसिक संयम, गरिब सेवा र नियमित शनि-हनुमान उपासना अनिवार्य छ।`;
        classicalReference = 'बृहत्पाराशर होराशास्त्र तथा शनि महात्म्य';
        mundaneImpact = 'श्रमिक आन्दोलन तथा अधिकार प्राप्ति, कानुनी सुधार, पूर्वाधार र धातु उद्योगमा दीर्घकालीन परिवर्तन।';
        break;

      case 'राहु':
        title = `छायाग्रह राहुको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा रहस्यमय गोचर: अप्रत्याशित सफलता र सतर्कता`;
        headline = `🔴 राहु गोचर विशेष: कुटनीति र वैदेशिक सफलताका कारक राहु ${currentRashiName} राशिमा ${degreeStr} मा स्थित`;
        leadSummary = `सधैँ वक्री चालमा रहने रहस्यमय छायाग्रह राहु हाल ${currentRashiName} राशि तथा ${nakshatra} नक्षत्रमा भ्रमणशील हुनुहुन्छ। यस गोचरले ${beneficiaryRashis.join(', ')} राशिलाई अचानक धनलाभ र वैदेशिक सफलता दिलाउनेछ भने अन्य राशिले भ्रम र गलत निर्णयबाट जोगिनुपर्नेछ।`;
        fullBody = `राहु आधुनिक युगमा प्रविधि, राजनीति, वैदेशिक भ्रमण, इन्टरनेट र अप्रत्याशित लाभ-हानिका मुख्य कारक हुन्। राहुले कूटनीतिक चतुरता र ठूला अवसरहरू प्रदान गर्दछ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार:**
राहुदेव चन्द्र राशिबाट ३, ६ र ११ औँ भावमा गोचर गर्दा सिंह समान पराक्रम र अचानक अथाह धनलाभ गराउनुहुन्छ। अन्य भावमा भने मानसिक भ्रम, शङ्का र अनिद्रा निम्त्याउन सक्ने भएकाले दुर्गा कवचको पाठ उत्तम मानिन्छ।`;
        classicalReference = 'वृहत्संहिता तथा राहु स्तोत्र';
        mundaneImpact = 'प्रविधि, साइबर सुरक्षा, कृत्रिम बुद्धिमत्ता (AI) र कूटनीतिक सम्बन्धहरूमा अप्रत्याशित विकास।';
        break;

      case 'केतु':
        title = `मोक्षकारक केतुको ${currentRashiName} राशि र ${nakshatra} नक्षत्रमा आध्यात्मिक गोचर: अन्तर्ज्ञान र साधना`;
        headline = `🔴 केतु गोचर अपडेट: वैराग्य र गूढ विद्याका अधिपति केतु ${currentRashiName} राशिमा ${degreeStr} मा गोचररत`;
        leadSummary = `मोक्ष र आध्यात्मिक चेतनाका कारक केतुदेव हाल ${currentRashiName} राशि तथा ${nakshatra} नक्षत्रमा विराजमान हुनुहुन्छ। यस गोचरले ${beneficiaryRashis.join(', ')} राशिलाई आत्मज्ञान, अनुसन्धान र धार्मिक साधनामा उच्च सिद्धि दिलाउनेछ।`;
        fullBody = `केतुदेव भौतिक बन्धनबाट मुक्त गराई आत्मिक ज्ञान तर्फ लैजाने मोक्षकारक ग्रह हुन्। उहाँको प्रभावले मानिसलाई गम्भीर चिन्तन, रहस्यमय विद्या र ईश्वरभक्ति प्रदान गर्दछ।

**वर्तमान खगोलीय स्थिति:**
- वर्तमान राशि: **${currentRashiName}** (${degreeStr})
- नक्षत्र: **${nakshatra}** (चरण ${toDevanagariNumerals(pada)}), नक्षत्र स्वामी: **${nakshatraLord}**
- गति तथा अवस्था: **${motionStatus}**

**शास्त्रीय आधार:**
केतुदेव चन्द्र राशिबाट ३, ६, ११ र १२ भावमा शुभ फल प्रदान गर्नुहुन्छ। बाह्रौँ भावको केतुले मोक्षको ढोका खोल्ने शास्त्रीय मान्यता छ। १, २, ५, ७, ८ भावमा भने भौतिक उदासीनता र चोटपटकबाट बच्न गणेशजीको आराधना फलदायी हुन्छ।`;
        classicalReference = 'गणेश पुराण तथा मानसागरी (केतु अध्याय)';
        mundaneImpact = 'योग, ध्यान, प्राकृतिक चिकित्सा र आध्यात्मिक संस्थाहरूको प्रभाव वृद्धि।';
        break;
    }

    articles.push({
      id: `graha_news_${pName}_${todayAD}`,
      planet: pName,
      planetEnglish: planetPos.englishName || pName,
      symbol: planetPos.symbol || '☉',
      avatarIcon: planetPos.symbol,
      title,
      headline,
      leadSummary,
      fullBody,
      classicalReference,
      mundaneImpact,
      currentRashi: currentRashiName,
      currentRashiId,
      degreeStr,
      nakshatra,
      nakshatraId: planetPos.nakshatraId || 1,
      pada,
      nakshatraLord,
      motionStatus,
      isRetrograde,
      isCombust,
      dignity,
      beneficiaryRashis,
      cautionaryRashis,
      rashiImpacts,
      author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
      authorRole: 'वरिष्ठ फलित ज्योतिषाचार्य मण्डल',
      publishedAtBS: todayBS,
      publishedAtAD: todayAD,
      readTimeMinutes: 4,
      viewsCount: 1500 + index * 120,
      coverImageUrl: GRAHA_COVER_IMAGES[pName] || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80',
    });
  });

  return articles;
}

// ----------------------------------------------------------------------------
// Consolidated Forecast for a Single Selected Rashi (All 9 Planets)
// ----------------------------------------------------------------------------
export function getConsolidatedRashiTransitForecast(
  targetRashiId: number,
  transitPlanets: PlanetPosition[]
): ConsolidatedRashiReport {
  const rashi = RASHI_DATA.find((r) => r.id === targetRashiId) || RASHI_DATA[0];
  const allArticles = generateLiveGrahaGocharNews(transitPlanets, 'आज', 'today');

  const favorablePlanets: ConsolidatedRashiReport['favorablePlanets'] = [];
  const challengingPlanets: ConsolidatedRashiReport['challengingPlanets'] = [];
  let favorableCount = 0;

  allArticles.forEach((art) => {
    const impact = art.rashiImpacts.find((i) => i.rashiId === targetRashiId);
    if (!impact) return;

    if (impact.impactType === 'अत्यन्त शुभ' || impact.impactType === 'शुभ') {
      favorableCount += impact.impactType === 'अत्यन्त शुभ' ? 2 : 1;
      favorablePlanets.push({
        planet: art.planet,
        house: impact.houseFromRashi,
        note: impact.summary,
      });
    } else if (impact.impactType === 'कष्ट/सावधानी') {
      challengingPlanets.push({
        planet: art.planet,
        house: impact.houseFromRashi,
        note: impact.summary,
      });
    }
  });

  // Score out of 100
  const score = Math.min(95, Math.max(30, Math.round((favorableCount / 14) * 100) + 20));
  let overallNature: ConsolidatedRashiReport['overallNature'] = 'मिश्रित';
  if (score >= 75) overallNature = 'अत्यन्त अनुकूल';
  else if (score >= 60) overallNature = 'अनुकूल';
  else if (score <= 45) overallNature = 'सावधानीपूर्ण';

  // Check Saturn Sade Sati / Dhaiyya for this sign
  const shani = transitPlanets.find((p) => p.name === 'शनि');
  let sadeSatiOrDhaiyyaStatus = 'कुनै साढेसाती वा ढैय्या छैन';
  if (shani) {
    const houseFromRashi = ((shani.rashiId - targetRashiId + 12) % 12) + 1;
    if (houseFromRashi === 12) sadeSatiOrDhaiyyaStatus = 'शनिको साढेसाती सुरु (१२औँ भावको प्रथम चरण)';
    else if (houseFromRashi === 1) sadeSatiOrDhaiyyaStatus = 'शनिको साढेसाती शिखर (१लौँ भावको द्वितीय चरण)';
    else if (houseFromRashi === 2) sadeSatiOrDhaiyyaStatus = 'शनिको साढेसाती अन्तिम (२औँ भावको तृतीय चरण)';
    else if (houseFromRashi === 4) sadeSatiOrDhaiyyaStatus = 'कण्टक शनिको ढैय्या (चौथो भावको २.५ वर्ष)';
    else if (houseFromRashi === 8) sadeSatiOrDhaiyyaStatus = 'अष्टम शनिको ढैय्या (आठौँ भावको २.५ वर्ष)';
  }

  const luckyColors: Record<number, string> = {
    1: 'रातो तथा पहेँलो', 2: 'सेतो तथा गुलाबी', 3: 'हरियो तथा आकासे', 4: 'दूधिया सेतो तथा चाँदी',
    5: 'रातो तथा सुनौलो', 6: 'गाढा हरियो', 7: 'चम्किलो सेतो', 8: 'गाढा रातो तथा कत्थई',
    9: 'पहेँलो तथा केसरिया', 10: 'नीलो तथा कालो', 11: 'आसमानी नीलो', 12: 'पहेँलो तथा सुन्तला'
  };

  const luckyNumbers: Record<number, string> = {
    1: '१, ९', 2: '२, ७', 3: '३, ५', 4: '२, ४',
    5: '१, ५', 6: '५, ६', 7: '६, ७', 8: '९, ३',
    9: '३, ९', 10: '८, ६', 11: '८, ७', 12: '३, १२'
  };

  const luckyDirections: Record<number, string> = {
    1: 'पूर्व', 2: 'दक्षिण-पूर्व', 3: 'पश्चिम', 4: 'उत्तर',
    5: 'पूर्व', 6: 'उत्तर-पश्चिम', 7: 'पश्चिम', 8: 'उत्तर',
    9: 'उत्तर-पूर्व (ईशान)', 10: 'दक्षिण', 11: 'पश्चिम', 12: 'उत्तर-पूर्व (ईशान)'
  };

  return {
    rashiId: targetRashiId,
    rashiName: rashi.name,
    symbol: rashi.symbol,
    element: rashi.element,
    lord: rashi.lord,
    overallScorePercent: score,
    overallNature,
    favorablePlanets,
    challengingPlanets,
    sadeSatiOrDhaiyyaStatus,
    primaryRemedy: `${rashi.lord} मन्त्रको नियमित जप, कुलदेवताको स्मरण र आज बिहान सूर्यलाई अर्घ्य दिनुहोस्।`,
    dailyAdvice: 'महत्त्वपूर्ण निर्णय लिँदा शुभ समय र अनुभवी व्यक्तिको राय लिनुहोस्। वादविवादबाट टाढै रहनु उत्तम हुनेछ।',
    luckyColor: luckyColors[targetRashiId] || 'पहेँलो',
    luckyNumber: luckyNumbers[targetRashiId] || '१, ९',
    luckyDirection: luckyDirections[targetRashiId] || 'पूर्व',
  };
}

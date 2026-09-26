/**
 * Tibetan Astrology 20-Domain Prediction Engine (२० क्षेत्र फलादेश)
 * Grounded in Vaidurya Karpo (वैदूर्य कार्पो) & Classical Jungtsi
 * Brihat Jyotish Professional ERP
 */

import {
  TibetanYearInfo,
  TibetanLifeForces,
  TibetanMewa,
  TibetanParkha,
  TibetanPredictionItem
} from '../../types/tibetanAstrology';
import { getRuleEvidenceById } from '../rules/sources/tibetan/tibetanSourceRegistry';

export function generateTibetanPredictions(
  yearInfo: TibetanYearInfo,
  lifeForces: TibetanLifeForces,
  mewa: TibetanMewa,
  parkha: TibetanParkha
): TibetanPredictionItem[] {
  const { animal, element, polarity } = yearInfo;
  const { sog, lu, wang, lungta, la } = lifeForces;

  return [
    // १. व्यक्तित्व (Personality)
    {
      topicId: 'personality',
      categoryNepali: 'मूल स्वभाव एवं स्वरूप',
      titleNepali: '१. व्यक्तित्व (Personality & Character Aura)',
      headlineNepali: `${animal.nameNepali} र ${element.nameNepali} को समिश्रणबाट बनेको प्रभावकारी व्यक्तित्व`,
      detailedTextNepali: `वैदूर्य कार्पो ग्रन्थ अनुसार ${animal.nameNepali} राशिको अन्तर्निहित स्वभाव र ${element.nameNepali} तत्वको तेजले तपाईंलाई आत्मविश्वासी, दृढ निश्चयी र लक्ष्यप्रति समर्पित बनाएको छ। ${polarity} प्रकृतिका कारण तपाईंको सोचमा गहनता र निर्णय क्षमतामा स्पष्टता पाइन्छ। मेवा ${mewa.nameNepali} को प्रभावले व्यक्तित्वमा एक किसिमको गम्भीरता र अरूलाई आकर्षित गर्ने स्वाभाविक क्षमता विद्यमान छ।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: [
        'सजग र परिस्थितिलाई तुरुन्त बुझ्न सक्ने प्रखर चेतना',
        'अरूको विश्वास सजिलै आर्जन गर्न सक्ने व्यक्तित्व',
        'चुनौतीपूर्ण अवस्थामा पनि धैर्य नगुमाउने दृढता'
      ],
      challengingIndicators: [
        'कहिलेकाहीं अत्यधिक आत्मकेन्द्रित वा हठी हुने सम्भावना',
        'भावना तुरुन्त व्यक्त नगर्दा भित्री गुम्स्याइ'
      ],
      remediesNepali: [
        'शान्ति र सन्तुलनका लागि नियमित मञ्जुश्री मन्त्र (ॐ अर पचन धीः) पाठ',
        'तत्व मैत्रीका लागि हल्का प्राकृतिक रङ्गका पहिरन प्रयोग'
      ],
      evidence: getRuleEvidenceById('TIB_RULE_YEAR_ANIMAL_01')
    },

    // २. स्वभाव (Nature & Temperament)
    {
      topicId: 'temperament',
      categoryNepali: 'मूल स्वभाव एवं स्वरूप',
      titleNepali: '२. स्वभाव र मानसिक प्रवृत्ति (Temperament & Mental Dispositions)',
      headlineNepali: `${animal.nature} ऊर्जा र ${mewa.element.nameNepali} तत्वको मानसिक तरङ्ग`,
      detailedTextNepali: `तपाईंको भित्री स्वभाव शान्त तर कर्ममा तीव्र छ। बाहिरबाट सौम्य देखिए पनि भित्रबाट स्पष्ट नीति र आत्मसम्मान बोकेको स्वभाव रहन्छ। परम्परागत ज्युङ्ची नियम अनुसार ${animal.fixedElementId === 'fire' || animal.fixedElementId === 'wood' ? 'उत्साही, सिर्जनशील र द्रुत कार्यसम्पादन' : 'धैर्यवान्, व्यावहारिक र गहिरो सोचाइ'} भएको प्रकृति देखिन्छ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: ['कर्तव्यपरायणता र निष्ठा', 'स्पष्ट कार्ययोजना बनाउने बानी', 'मित्रजनप्रति उदार भाव'],
      challengingIndicators: ['अचानक रिस उठ्ने वा निर्णयमा हतार गर्ने प्रवृत्ति', 'आलोचनालाई सहजै पचाउन नसक्नु'],
      remediesNepali: ['बिहानीको समयमा १५ मिनेट शान्त श्वासप्रश्वास ध्यान', 'आमा वा अग्रजको सल्लाह सम्मानपूर्वक ग्रहण गर्नु'],
      evidence: getRuleEvidenceById('TIB_RULE_YEAR_ANIMAL_01')
    },

    // ३. जीवनशक्ति (Sog / Life Force)
    {
      topicId: 'life_force',
      categoryNepali: 'ऊर्जा एवं प्राण',
      titleNepali: '३. जीवनशक्ति (Sog - प्राण एवं आयुको सूक्ष्म आधार)',
      headlineNepali: `सोग ऊर्जा: ${sog.levelNepali} (${sog.strengthPercentage}%) - मूल प्राणबल`,
      detailedTextNepali: `सोग जीवनको मूल प्राण र मुटुको सूक्ष्म ऊर्जा हो। तपाईंको सोग तत्व ${sog.element.nameNepali} रहेको छ, जसको जन्म वर्षको तत्वसँग सम्बन्ध '${sog.relationWithYearElement}' छ। ${sog.traditionalSignificance} यसले जीवनमा विपत्तिहरूसँग लड्ने आन्तरिक प्रतिरोध क्षमता र जीवन बाँच्ने अदम्य चाहनालाई सबल बनाउँछ।`,
      strengthStatus: sog.strengthPercentage >= 70 ? 'उत्तम' : 'मध्यम',
      favorableIndicators: ['बलियो प्राणशक्ति र आत्मबल', 'आकस्मिक संकटबाट बच्ने स्वाभाविक ईश्वरीय रक्षा'],
      challengingIndicators: [sog.strengthPercentage < 60 ? 'ऋतु परिवर्तनका समयमा प्राण-ऊर्जामा सुस्तता' : 'मानसिक थकान'],
      remediesNepali: [sog.supportingRemedy, 'तारा मन्त्र (ॐ तारे तुत्तारे तुरे सोहा) को नियमित जप'],
      evidence: getRuleEvidenceById('TIB_RULE_LIFE_FORCES_03')
    },

    // ४. स्वास्थ्यसम्बन्धी परम्परागत संकेत
    {
      topicId: 'health_signals',
      categoryNepali: 'ऊर्जा एवं प्राण',
      titleNepali: '४. स्वास्थ्यसम्बन्धी परम्परागत संकेत (Traditional Vitality Indicators)',
      headlineNepali: `लु (शारीरिक कलेवर) स्तर: ${lu.levelNepali} - पञ्चतत्व सन्तुलन`,
      detailedTextNepali: `[सूचना: यो कुनै मेडिकल परीक्षण वा चिकित्सकीय निदान होइन।] परम्परागत सोवा रिग्पा एवं ज्युङ्ची शास्त्र अनुसार तपाईंको लु धातु ${lu.element.nameNepali} ले शरीरमा वायु (रुङ), पित्त (त्रिपा) र कफ (बेकेन) को सन्तुलनमा प्रभाव पार्दछ। ${lu.element.nameNepali} तत्वले गर्दा खानपान र मौसमी चिसो/तातोमा विशेष सन्तुलन राख्न सल्लाह दिइन्छ।`,
      strengthStatus: lu.strengthPercentage >= 65 ? 'शुभ' : 'सावधानी',
      favorableIndicators: ['स्वस्थ जीवनशैली अपनाएमा दीर्घायु र आरोग्य', 'शारीरिक स्फूर्ति'],
      challengingIndicators: ['समयमा खाना नखाने वा अनिन्द्राले पाचन र नसामा असर'],
      remediesNepali: ['सन्तुलित तातो झोलिलो आहार र प्रशस्त जलपान', 'चिकित्सकीय परामर्शलाई सधैं प्राथमिकता दिनु'],
      evidence: getRuleEvidenceById('TIB_RULE_LIFE_FORCES_03')
    },

    // ५. शिक्षा (Education)
    {
      topicId: 'education',
      categoryNepali: 'कर्म एवं विद्या',
      titleNepali: '५. शिक्षा, बौद्धिक क्षमता र अध्ययन (Education & Knowledge)',
      headlineNepali: `${mewa.nameNepali} को प्रभावले अनुसन्धानमूलक र व्यवहारिक विद्या`,
      detailedTextNepali: `तपाईंको मेवा ${mewa.nameNepali} ले बौद्धिक गहिराइ र नयाँ ज्ञान आर्जन गर्ने तीव्र कौतुहलतालाई दर्शाउँछ। प्राविधिक, व्यवस्थापकीय, अनुसन्धान वा प्रशासनिक विधामा तपाईंको ध्यान चाँडै केन्द्रित हुन्छ। पारम्परिक ग्रन्थ अनुसार निरन्तर अभ्यासले उच्च शैक्षिक डिग्री र प्रमाणपत्र हासिल गर्न सकिने संकेत गर्दछ।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: ['गम्भीर पुस्तक तथा सिद्धान्त बुझ्ने क्षमता', 'परीक्षामा एकाग्रता र स्मृति शक्ति'],
      challengingIndicators: ['रुचि नभएको विषयमा छिटो अल्छी लाग्ने प्रवृत्ति'],
      remediesNepali: ['अध्ययन कोठामा पूर्व वा उत्तर-पूर्व (पार्खा ${parkha.nameNepali} को शुभ दिशा) तर्फ फर्केर पढ्नु', 'सरस्वती वा मञ्जुश्री मन्त्र जप'],
      evidence: getRuleEvidenceById('TIB_RULE_MEWA_MAGIC_04')
    },

    // ६. पेशा (Career & Profession)
    {
      topicId: 'career',
      categoryNepali: 'कर्म एवं विद्या',
      titleNepali: '६. पेशा एवं सेवा क्षेत्र (Career, Job & Calling)',
      headlineNepali: `वाङ (प्रभाव) तत्व ${wang.element.nameNepali} र पार्खा ${parkha.nameNepali} को अनुकूल कार्यक्षेत्र`,
      detailedTextNepali: `वाङ सामर्थ्यको शक्तिले तपाईंलाई अरूको अधीनमा लामो समय रहनु भन्दा निर्णय लिन पाउने पद, व्यवस्थापन, कूटनीति, इन्जिनियरिङ, सूचना प्रविधि वा राज्य सेवामा अधिक सफलता प्रदान गर्दछ। ${animal.nameNepali} को चतुरता र ${element.nameNepali} को प्रभावले कार्यस्थलमा जिम्मेवारीपूर्वक नेतृत्व लिने अवसर प्राप्त हुन्छ।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: ['कार्यस्थलमा विश्वसनीय र भरपर्दो छवि', 'समस्या समाधानमा कुशल रणनीति'],
      challengingIndicators: ['अनावश्यक सहकर्मी प्रतिस्पर्धाबाट मानसिक तनाव'],
      remediesNepali: ['कार्यकक्षको टेबुलमा जीवनदाता दिशा तर्फ शुभ प्रतीक राख्नु', 'सहकर्मीहरूसँग विनम्र संवाद'],
      evidence: getRuleEvidenceById('TIB_RULE_LIFE_FORCES_03')
    },

    // ७. व्यवसाय (Business & Trade)
    {
      topicId: 'business',
      categoryNepali: 'कर्म एवं विद्या',
      titleNepali: '७. व्यवसाय र उद्यमशीलता (Business & Entrepreneurship)',
      headlineNepali: `स्वतन्त्र उद्यमशीलता र ${element.nameNepali} सम्बद्ध व्यापारमा शुभ योग`,
      detailedTextNepali: `स्वतन्त्र व्यवसायमा तपाईंको जोखिम उठाउने क्षमता प्रशंसनीय रहन्छ। विशेष गरी ${element.id === 'water' ? 'जल, तरल पदार्थ, परामर्श र यातायात' : element.id === 'wood' ? 'कृषि, फर्निचर, शैक्षिक र डिजाइन' : element.id === 'fire' ? 'ऊर्जा, रेस्टुरेन्ट, प्रविधि र सौन्दर्य' : element.id === 'earth' ? 'घरजग्गा, निर्माण र खनिज' : 'धातु, मेसिनरी र वित्तीय क्षेत्र'} मा उद्यम गर्दा तुलनात्मक रूपमा उच्च सफलता मिल्ने शास्त्रीय आधार छ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: ['बजारको आवश्यकता पहिले नै बुझ्ने दूरदृष्टि', 'सम्बन्ध विस्तारबाट नयाँ ग्राहक आकर्षण'],
      challengingIndicators: ['साझेदारी व्यवसाय गर्दा कानुनी सम्झौता स्पष्ट नहुनु'],
      remediesNepali: ['साझेदार छनोट गर्दा पशु राशिको त्रि-सङ्गम (मित्र राशि) लाई प्राथमिकता दिनु', 'नियमित धनवृद्धि जप'],
      evidence: getRuleEvidenceById('TIB_RULE_FIVE_ELEMENTS_02')
    },

    // ८. आर्थिक अवस्था (Financial Stability)
    {
      topicId: 'wealth',
      categoryNepali: 'सम्पत्ति एवं वैभव',
      titleNepali: '८. आर्थिक अवस्था र धन वृद्धि (Financial Stability & Wealth)',
      headlineNepali: `वाङ शक्ति र मेवा ${mewa.number} को प्रभाव: स्थिर धन आर्जन`,
      detailedTextNepali: `आर्थिक दृष्टिले तपाईंको जीवनमा निरन्तर आम्दानीका स्रोतहरू बन्नेछन्। मध्यम उमेरपछि अचल सम्पत्ति र बचतमा उल्लेखनीय वृद्धि हुने योग देखिन्छ। फजुल खर्च नियन्त्रण गर्न सकेमा आर्थिक संकट कहिल्यै लामो समय टिक्ने छैन।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: ['दीर्घकालीन लगानीमा लाभ', 'विपत्तिमा पनि आर्थिक स्रोत जुट्ने सौभाग्य'],
      challengingIndicators: ['अति उदारताका कारण ऋण वा सापटी फस्ने सम्भावना'],
      remediesNepali: ['पहेंलो वा धातुको भाँडोमा घरको समृद्ध दिशामा अक्षता र सिक्का राख्नु', 'आर्थिक लेन-देन लिखित राख्नु'],
      evidence: getRuleEvidenceById('TIB_RULE_MEWA_MAGIC_04')
    },

    // ९. परिवार (Family Dynamics)
    {
      topicId: 'family',
      categoryNepali: 'सम्बन्ध एवं समाज',
      titleNepali: '९. पारिवारिक सुख र सद्भाव (Family Relations)',
      headlineNepali: `पारिवारिक दायित्व निर्वाह र आत्मीयता`,
      detailedTextNepali: `तपाईं परिवारको महत्वपूर्ण खम्बा हुनुहुन्छ। आफ्ना मातापिता, दाजुभाइ तथा नातागोताप्रति आदरभाव रहन्छ। कहिलेकाहीं वैचारिक भिन्नता भए पनि संकटका बेला परिवारको ढाल बनेर उभिने तपाईंको उदात्त बानी प्रशंसनीय छ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: ['परिवारमा ज्येष्ठ सदस्यको आशीर्वाद', 'घरायसी मामिलामा मध्यस्थता गर्ने दक्षता'],
      challengingIndicators: ['अपेक्षा बढी राख्दा निराशा महसुस हुनु'],
      remediesNepali: ['कुलदेवता एवं पितृको सम्मान र महिनामा एकपटक पारिवारिक जमघट'],
      evidence: getRuleEvidenceById('TIB_RULE_YEAR_ANIMAL_01')
    },

    // १०. विवाह र प्रेम सम्बन्ध (Marriage & Partnership)
    {
      topicId: 'marriage',
      categoryNepali: 'सम्बन्ध एवं समाज',
      titleNepali: '१०. विवाह, प्रेम तथा सहजीवन (Marriage & Harmony)',
      headlineNepali: `अनुकूल त्रि-सङ्गम राशिसँगको मिलनले जीवनमा सुख र समृद्धि`,
      detailedTextNepali: `तपाईंको लागि ${animal.compatibleAnimalsNepali.join(', ')} राशि भएका जीवनसाथी अति शुभ र सहयोगी सिद्ध हुन्छन्। विपरीत राशि ${animal.enemyAnimalNepali} सँग सम्बन्ध जोड्दा तत्व शान्ति उपाय आवश्यक पर्छ। सहजीवनमा आपसी समझदारी र संवाद नै सबैभन्दा ठूलो बल हुनेछ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: ['जीवनसाथीबाट मानसिक र आर्थिक भरथेग', 'सौहार्दपूर्ण दाम्पत्य जीवन'],
      challengingIndicators: ['अहङ्कारको टकराव हुँदा मौनता साधेर दूरी बढ्नु'],
      remediesNepali: ['दम्पती बीच रातो वा हरियो सौहार्द धागो/मणि धारण', 'समान उद्देश्य र सहकार्य'],
      evidence: getRuleEvidenceById('TIB_RULE_COMPATIBILITY_06')
    },

    // ११. सन्तान (Children & Lineage)
    {
      topicId: 'children',
      categoryNepali: 'सम्बन्ध एवं समाज',
      titleNepali: '११. सन्तान सुख एवं वंशवृद्धि (Children & Lineage)',
      headlineNepali: `योग्य र आज्ञाकारी सन्तानको योग`,
      detailedTextNepali: `सन्तान पक्षबाट सुख र सन्तोष प्राप्त हुने योग छ। सन्तानले विद्या र कलामा नाम कमाउने सम्भावना प्रबल छ। प्रारम्भिक बाल्यकालमा स्वास्थ्य र संस्कारमा उचित ध्यान दिएमा उनीहरू कुलको गौरव बन्नेछन्।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: ['सन्तानको प्रगतिबाट गौरव', 'पारिवारिक सम्बन्धमा मिठास'],
      challengingIndicators: ['सन्तानको जिद्दीपनामा संयमपूर्वक सम्झाउनुपर्ने'],
      remediesNepali: ['सन्तानको दीर्घायु र विद्याका लागि नियमित प्रार्थना एवं पठनपाठनमा सहयोग'],
      evidence: getRuleEvidenceById('TIB_RULE_LIFE_FORCES_03')
    },

    // १२. यात्रा (Travel & Relocation)
    {
      topicId: 'travel',
      categoryNepali: 'गति एवं विस्तार',
      titleNepali: '१२. यात्रा र स्थानान्तरण (Travel & Mobility)',
      headlineNepali: `पार्खा ${parkha.nameNepali} को अनुकूल दिशामा फलदायी यात्रा`,
      detailedTextNepali: `पार्खा दिशा विचार गर्दा तपाईंको लागि ${parkha.directions[0]?.direction || 'दक्षिण'} र ${parkha.directions[1]?.direction || 'पूर्व'} दिशाको यात्राले सुखद परिणाम र नयाँ अवसर दिनेछ। प्रतिकूल दिशामा यात्रा गर्दा बिहानको शुभ समय हेरेर मात्र निस्कनु श्रेयस्कर हुन्छ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: ['तीर्थाटन र प्राकृतिक यात्राबाट मानसिक शान्ति', 'व्यावसायिक भ्रमणमा नयाँ सम्झौता'],
      challengingIndicators: ['हतारमा यात्रा गर्दा कागजात वा सामान हराउने भय'],
      remediesNepali: ['यात्रा सुरु गर्नुअघि सेतो अक्षता वा जल स्पर्श गरी इष्टदेव स्मरण गर्नु'],
      evidence: getRuleEvidenceById('TIB_RULE_PARKHA_TRIGRAM_05')
    },

    // १३. विदेशसम्बन्धी संकेत (Foreign Endeavors)
    {
      topicId: 'foreign',
      categoryNepali: 'गति एवं विस्तार',
      titleNepali: '१३. विदेश यात्रा र अन्तर्राष्ट्रिय सम्भावना (Foreign Endeavors)',
      headlineNepali: `लुङता (पवन-अश्व) को गति र वैदेशिक सफलता`,
      detailedTextNepali: `लुङताको तत्व ${lungta.element.nameNepali} ले तपाईंलाई जन्मस्थान भन्दा टाढा वा विदेशमा सम्मान, विद्या र धन आर्जन गर्ने सकारात्मक अवसर प्रदान गर्दछ। विशेष गरी बहुराष्ट्रिय कम्पनी, अध्ययन वा अन्तर्राष्ट्रिय व्यापारमा प्रगति हुने शुभ संकेत छ।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: ['अन्तर्राष्ट्रिय सम्पर्कबाट फाइदा', 'वैदेशिक भिसा र कागजात प्राप्तिमा सहजता'],
      challengingIndicators: ['विदेशमा बस्दा सुरुवाती चरणमा संस्कृतिक घुलमिलमा केही असहजता'],
      remediesNepali: ['पहाडको टाकुरामा वा खुला स्थानमा लुङता ध्वजा फहराउनु'],
      evidence: getRuleEvidenceById('TIB_RULE_LIFE_FORCES_03')
    },

    // १४. सामाजिक जीवन (Social Life & Community)
    {
      topicId: 'social',
      categoryNepali: 'सम्बन्ध एवं समाज',
      titleNepali: '१४. सामाजिक प्रतिष्ठा र जनसम्पर्क (Social Standing)',
      headlineNepali: `समुदायमा सम्मानित स्थान र विश्वासिलो व्यक्तित्व`,
      detailedTextNepali: `तपाईं समाजमा एक भलाद्मी, सहयोगी र न्यायप्रेमी व्यक्तिका रूपमा परिचित हुनुहुनेछ। सामाजिक संघसंस्था, धार्मिक वा परोपकारी कार्यमा संलग्न हुँदा नेतृत्वदायी भूमिका निर्वाह गर्ने अवसर मिल्दछ।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: ['विवादमा निष्पक्ष मध्यस्थकर्ताको भूमिका', 'मित्रमण्डलीमा उच्च कदर'],
      challengingIndicators: ['अरूको विवादमा धेरै फस्दा आफ्नो समय खेर जानु'],
      remediesNepali: ['अशक्त र वृद्धजनको सेवा, महिनाको एकपटक अन्नदान'],
      evidence: getRuleEvidenceById('TIB_RULE_YEAR_ANIMAL_01')
    },

    // १५. मानसिक/भावनात्मक प्रवृत्ति
    {
      topicId: 'mind',
      categoryNepali: 'मूल स्वभाव एवं स्वरूप',
      titleNepali: '१५. मानसिक एवं भावनात्मक प्रवृत्ति (Mind & Emotional Balance)',
      headlineNepali: `ला (सूक्ष्म चेतना) शक्ति: ${la.levelNepali} - मानसिक स्थिरता`,
      detailedTextNepali: `ला शक्ति तपाईंको चेतनाको गहिराइ हो। ला तत्व ${la.element.nameNepali} भएकाले तपाईं भित्री रूपमा संवेदनशील र विवेकशील हुनुहुन्छ। अत्यधिक तनाव वा अनिन्द्राबाट बच्न सकेमा ध्यान र विचारमा अद्वितीय स्पष्टता कायम रहन्छ।`,
      strengthStatus: la.strengthPercentage >= 65 ? 'शुभ' : 'सावधानी',
      favorableIndicators: ['गहिरो अन्तर्ज्ञान र पूर्वाभास', 'कला, संगीत र साहित्यप्रतिको आकर्षण'],
      challengingIndicators: ['अनावश्यक चिन्ता र विगतका कुरा मनमा खेलाइरहने बानी'],
      remediesNepali: [la.supportingRemedy, 'नियमित प्राणायम र सकारात्मक आत्मसंवाद'],
      evidence: getRuleEvidenceById('TIB_RULE_LIFE_FORCES_03')
    },

    // १६. वार्षिक फलादेश (Annual Forecast)
    {
      topicId: 'annual_forecast',
      categoryNepali: 'कालचक्र एवं गोचर',
      titleNepali: '१६. वर्तमान वर्षको फलादेश (Current Annual Cycle Forecast)',
      headlineNepali: `चालु वर्षको तत्व र जन्म तत्वको आपसी तालमेल`,
      detailedTextNepali: `वर्तमान वर्षमा तपाईंको जीवन-ऊर्जा सक्रिय अवस्थामा छ। नयाँ योजना थाल्न, आर्थिक लगानी गर्न र पारिवारिक विस्तारका लागि यो वर्ष अनुकूल रहनेछ। वर्षको उत्तरार्धमा कार्यक्षेत्रमा पदोन्नति वा नयाँ जिम्मेवारी थपिने सम्भावना छ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: ['अड्किएका कामहरू सम्पन्न हुने शुभ समय', 'आर्थिक लाभ र नयाँ लगानीको अवसर'],
      challengingIndicators: ['मौसमी रुघाखोकी र थकानबाट जोगिनुपर्ने'],
      remediesNepali: ['वर्षको सुरुमा त्सेदो (दीर्घायु सूत्र) पाठ वा श्रवण', 'लुङता ध्वजा प्रतिस्थापन'],
      evidence: getRuleEvidenceById('TIB_RULE_FIVE_ELEMENTS_02')
    },

    // १७. मासिक फलादेश (Monthly Forecast)
    {
      topicId: 'monthly_forecast',
      categoryNepali: 'कालचक्र एवं गोचर',
      titleNepali: '१७. मासिक तरङ्ग फलादेश (Monthly Energy Rhythm)',
      headlineNepali: `चन्द्रमास अनुसार तत्वको उतारचढाव`,
      detailedTextNepali: `प्रत्येक महिनाको शुक्ल पक्ष तपाईंको कार्य आरम्भका लागि विशेष ऊर्जावान् रहनेछ। विशेष गरी पूर्णिमा र अष्टमीका दिनहरूमा ध्यान, साधना र महत्वपूर्ण निर्णयहरू गर्दा सफलता मिल्नेछ। कृष्ण पक्षको अन्त्यमा भने विश्राम र योजना निर्माणमा ध्यान दिनु राम्रो हुन्छ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: ['महिनाको पहिलो र दोस्रो सातामा कार्यसिद्धि', 'सकारात्मक आर्थिक प्रवाह'],
      challengingIndicators: ['महिनाको अन्त्यतिर खर्चमा वृद्धि'],
      remediesNepali: ['प्रत्येक महिनाको अष्टमीमा दीप प्रज्वलन'],
      evidence: getRuleEvidenceById('TIB_RULE_FIVE_ELEMENTS_02')
    },

    // १८. दैनिक फलादेश (Daily Rhythm)
    {
      topicId: 'daily_forecast',
      categoryNepali: 'कालचक्र एवं गोचर',
      titleNepali: '१८. दैनिक फलादेश एवं जीवन-वार (Daily Planetary Rhythms)',
      headlineNepali: `शुभ दिन: ${animal.soulDayNepali} (सोग-जा) | सावधानी दिन: ${animal.dangerDayNepali} (शे-जा)`,
      detailedTextNepali: `तपाईंको राशिको प्राण-वार (सोग-जा) ${animal.soulDayNepali} हो। यो दिन नयाँ काम, व्यापार सम्झौता, यात्रा र महत्त्वपूर्ण भेटघाटका लागि सर्वथा शुभ मानिन्छ। यसको विपरीत संकट-वार (शे-जा) ${animal.dangerDayNepali} मा ठूला जोखिम लिनु हुँदैन र विवादबाट जोगिनुपर्छ।`,
      strengthStatus: 'शुभ',
      favorableIndicators: [`${animal.soulDayNepali} मा थालेका काममा पूर्ण सफलता`, 'दैनिक कार्यतालिका अनुसार काम गर्दा उच्च उत्पादकत्व'],
      challengingIndicators: [`${animal.dangerDayNepali} मा मानसिक उद्वेग वा सानातिना विवादको जोखिम`],
      remediesNepali: [`${animal.dangerDayNepali} का दिन शान्त रहने र दान-पुण्य गर्नु उत्तम`],
      evidence: getRuleEvidenceById('TIB_RULE_YEAR_ANIMAL_01')
    },

    // १९. शुभ/सावधानी समय (Auspicious & Obstacle Periods)
    {
      topicId: 'auspicious_periods',
      categoryNepali: 'कालचक्र एवं गोचर',
      titleNepali: '१९. शुभ समय एवं संकट निवारण (Dung-kor & Auspicious Timing)',
      headlineNepali: `आयु चक्र (Dung-kor) र बाधा निवारक सावधानी`,
      detailedTextNepali: `तिब्बती परम्परा अनुसार प्रत्येक १२ वर्षको अन्तरालमा आफ्नै पशु वर्ष दोहोरिँदा (डुङ-कोर / Dung-kor जस्तै १२, २४, ३६, ४८, ६०, ७२ औं वर्ष) ऊर्जा संवेदनशील हुन्छ। यस्तो वर्षमा नयाँ ठूला जोखिमभन्दा स्वास्थ्य, साधना र परोपकारमा समय दिनु शास्त्रीय नियम हो।`,
      strengthStatus: 'मध्यम',
      favorableIndicators: ['अध्यात्म र आत्मविकासका लागि विशिष्ट समय', 'अग्रजहरूको मार्गदर्शन लाभदायी'],
      challengingIndicators: ['अचानक स्वास्थ्य समस्या वा मानसिक तनाव देखिन सक्ने'],
      remediesNepali: ['डुङ-कोर वर्षमा महाकाल, तारा वा छ्योक्योङ पूजापाठ गराउनु परम्परागत रूपमा उत्तम'],
      evidence: getRuleEvidenceById('TIB_RULE_YEAR_ANIMAL_01')
    },

    // २०. परम्परागत उपाय (Traditional Remedies)
    {
      topicId: 'remedies',
      categoryNepali: 'उपाय एवं साधना',
      titleNepali: '२०. परम्परागत हिमाली-तिब्बती उपाय (Classical Remedies & Mantras)',
      headlineNepali: `पञ्चरङ्गी लुङता, तारा मन्त्र र तत्व सन्तुलन साधना`,
      detailedTextNepali: `१. पञ्चतत्व सन्तुलनका लागि घरको छत वा प्राकृतिक स्थानमा पञ्चरङ्गी मन्त्र ध्वजा (लुङता) फहराउनुहोस्।\n२. विघ्न विनाशका लागि हरित तारा मन्त्र: 'ॐ तारे तुत्तारे तुरे सोहा' को दैनिक १०८ पटक जप गर्नुहोस्।\n३. विद्या र बुद्धिका लागि मञ्जुश्री मन्त्र: 'ॐ अर पचन धीः' को अभ्यास गर्नुहोस्।\n४. जीवदया र प्राणी रक्षा (त्सेथार): माछा वा पशुपन्छीलाई बचाउने वा आहार दिने कार्यले आयु र आरोग्य वृद्धि गर्दछ।`,
      strengthStatus: 'उत्तम',
      favorableIndicators: ['सकारात्मक ऊर्जामा तीव्र वृद्धि', 'पारिवारिक सुखशान्ति र दीर्घायु'],
      challengingIndicators: ['अविश्वासपूर्वक गर्दा फल नहुने'],
      remediesNepali: ['सदाचार, करुणा र सकारात्मक विचार नै सर्वश्रेष्ठ उपाय'],
      evidence: getRuleEvidenceById('TIB_RULE_FIVE_ELEMENTS_02')
    }
  ];
}

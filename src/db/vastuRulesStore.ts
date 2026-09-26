import { convertADToBS } from '../utils/nepaliCalendar';

export type VastuDirection =
  | 'ईशान' // उत्तर-पूर्व (NE)
  | 'पूर्व' // पूर्व (E)
  | 'आग्नेय' // दक्षिण-पूर्व (SE)
  | 'दक्षिण' // दक्षिण (S)
  | 'नैऋत्य' // दक्षिण-पश्चिम (SW)
  | 'पश्चिम' // पश्चिम (W)
  | 'वायव्य' // उत्तर-पश्चिम (NW)
  | 'उत्तर' // उत्तर (N)
  | 'ब्रह्मस्थान'; // मध्यभाग (Center)

export type PanchaTattva = 'जल' | 'अग्नि' | 'पृथ्वी' | 'वायु' | 'आकाश';

export interface VastuRule {
  id: string;
  ruleId?: string; // Optional alias for id
  ruleName: string; // नियमको नाम (उदा. "ईशान कोणमा पूजाकोठा वा पवित्र स्थान")
  name?: string; // Optional alias for ruleName
  governingDirection: VastuDirection; // मुख्य दिशा
  direction?: VastuDirection; // Optional alias for governingDirection
  area: string; // क्षेत्र / कोठाको प्रकार (उदा. "पूजाकोठा", "भान्छाघर", "मुख्य प्रवेशद्वार")
  calculationLogic: string; // गणना विधि तथा मूल्याङ्कन तर्क
  classicalSource: string; // शास्त्रीय प्रमाण / स्रोत
  activeStatus: boolean; // सक्रिय / निष्क्रिय अवस्था
  isActive?: boolean; // Optional alias for activeStatus
  element?: PanchaTattva; // पञ्चतत्त्व (जल, अग्नि, पृथ्वी, वायु, आकाश)
  rulingDeity?: string; // दिक्पाल / देवता
  scoreWeightage?: number; // १०० मा अङ्क भार
  effectDescription?: string; // शुभ वा अशुभ फल
  remedy?: string; // वास्तु दोष निवारण उपाय
  updatedAtBS?: string; // अद्यावधिक मिति (वि.सं.)
}

const STORAGE_KEY_VASTU_RULES = 'sukdev_vedic_vastu_rules_v1';

// प्रारम्भिक वैदिक वास्तु नियम संग्रह (Classical Vedic Vastu Seed Rules)
export const INITIAL_VASTU_RULES: VastuRule[] = [
  {
    id: 'vastu_rule_1',
    ruleName: 'ईशान कोणमा देवस्थान तथा जल स्रोत स्थापन',
    governingDirection: 'ईशान',
    area: 'पूजाकोठा',
    calculationLogic: 'ईशान (उत्तर-पूर्व) मा पूजाकोठा, ध्यानकक्ष वा शुद्ध जल स्रोत भएमा शतप्रतिशत (१०/१०) शुभ फल। शौचालय वा फोहोर भएमा कडा वास्तुदोष (-८ अङ्क)।',
    classicalSource: 'विश्वकर्मा प्रकाश (अध्याय २, श्लोक १५)',
    activeStatus: true,
    element: 'जल',
    rulingDeity: 'ईश / रुद्र (शिव)',
    scoreWeightage: 10,
    effectDescription: 'मानसिक शान्ति, आध्यात्मिक उन्नति, वंश वृद्धि तथा सुस्वास्थ्य लाभ।',
    remedy: 'यदि शौचालय भएमा ईशान कोणमा तामाको कलशमा जल राखी नित्य रुद्रजाप गर्ने र पहेँलो/सेतो रङ प्रयोग गर्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_2',
    ruleName: 'आग्नेय कोणमा महानस (भान्छाघर) स्थापन',
    governingDirection: 'आग्नेय',
    area: 'भान्छाघर',
    calculationLogic: 'आग्नेय (दक्षिण-पूर्व) कोणमा चुलो/भान्छा भएमा +१० अङ्क। ईशान वा नैऋत्यमा चुलो भएमा अग्निसम्बन्धी दोष (-७ अङ्क)।',
    classicalSource: 'समराङ्गणसूत्रधार (अध्याय ४-५)',
    activeStatus: true,
    element: 'अग्नि',
    rulingDeity: 'अग्निदेव',
    scoreWeightage: 10,
    effectDescription: 'उत्तम स्वास्थ्य, पाचक अग्नि मजबुत, परिवारमा उर्जा तथा समृद्धि।',
    remedy: 'भान्छा गलत दिशामा भएमा आग्नेय कोणमा हरियो/रातो बल्ब निरन्तर बाल्ने र सूर्ययन्त्र स्थापना गर्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_3',
    ruleName: 'नैऋत्य कोणमा गृहस्वामी शयनकक्ष तथा भारी भण्डारण',
    governingDirection: 'नैऋत्य',
    area: 'शयनकक्ष',
    calculationLogic: 'घरको मुख्य साहु/गृहस्वामीको शयनकक्ष नैऋत्य (दक्षिण-पश्चिम) मा हुनुपर्छ (+१० अङ्क)। ईशानमा मुख्य शयनकक्ष भएमा निर्णय क्षमता कमजोर (-६ अङ्क)।',
    classicalSource: 'मयमतम् (अध्याय १२)',
    activeStatus: true,
    element: 'पृथ्वी',
    rulingDeity: 'निरृति (राक्षस/पृथ्वी)',
    scoreWeightage: 10,
    effectDescription: 'स्थायित्व, समाजमा अधिकार तथा नेतृत्व क्षमता वृद्धि, सुदृढ आर्थिक अवस्था।',
    remedy: 'नैऋत्य कोणमा राहु यन्त्र राख्ने, गहुँलो वा माटोको रङको प्रयोग गर्ने र भारी सामान भण्डारण गर्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_4',
    ruleName: 'वायव्य कोणमा अतिथि गृह तथा बालबालिका कक्ष',
    governingDirection: 'वायव्य',
    area: 'बालबालिकाकक्ष',
    calculationLogic: 'वायव्य (उत्तर-पश्चिम) मा पाहुनाकोठा, बालबालिकाको शयनकक्ष वा सवारी पार्किङ उपयुक्त (+९ अङ्क)।',
    classicalSource: 'बृहत्संहिता (अध्याय ५३, श्लोक ८५)',
    activeStatus: true,
    element: 'वायु',
    rulingDeity: 'वायुदेव',
    scoreWeightage: 9,
    effectDescription: 'सम्बन्धमा गतिशीलता, अतिथि सत्कारमा वृद्धि, व्यापारमा निरन्तर ग्राहक आगमन।',
    remedy: 'वायव्य दोष भएमा वायुदेवताको प्रार्थना गर्ने, सेतो रङ प्रयोग गर्ने र हनुमान चालिसा पाठ गर्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_5',
    ruleName: 'पूर्व दिशामा मुख्य द्वार तथा प्रकाश प्रवेश',
    governingDirection: 'पूर्व',
    area: 'मुख्य प्रवेशद्वार',
    calculationLogic: 'मुख्य प्रवेशद्वार पूर्व वा उत्तर दिशामा हुनु अत्यन्त शुभ (+१० अङ्क)। दक्षिण-पश्चिममा द्वार भएमा सङ्कट (-९ अङ्क)।',
    classicalSource: 'विश्वकर्मा प्रकाश (अध्याय ४)',
    activeStatus: true,
    element: 'अग्नि',
    rulingDeity: 'इन्द्र (सूर्य)',
    scoreWeightage: 10,
    effectDescription: 'सकारात्मक उर्जा, प्रतिष्ठा, कार्यसिद्धि तथा सूर्यको रश्मिको प्रत्यक्ष लाभ।',
    remedy: 'द्वार दोष निवारणका लागि मुख्य ढोकामा पञ्चमुखी हनुमान वा तामाको सूर्ययन्त्र झुन्ड्याउने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_6',
    ruleName: 'उत्तर दिशामा धनस्थान तथा तिजोरी स्थापन',
    governingDirection: 'उत्तर',
    area: 'तिजोरी / ढुकुटी',
    calculationLogic: 'उत्तर दिशा कुबेरको स्थान भएकाले तिजोरी/ढुकुटी उत्तरतर्फ फर्कने गरी राख्दा +१० अङ्क।',
    classicalSource: 'मानसार (वास्तुशास्त्र ग्रन्थ)',
    activeStatus: true,
    element: 'जल',
    rulingDeity: 'कुबेर / लक्ष्मी',
    scoreWeightage: 10,
    effectDescription: 'निरन्तर धन आगमन, व्यापारमा वृद्धि तथा सम्पत्ति सुरक्षा।',
    remedy: 'उत्तर दिशामा हरियो बोटबिरुवा वा कुबेर यन्त्र स्थापना गर्ने, रातो रङ प्रयोग नगर्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_7',
    ruleName: 'ब्रह्मस्थान निष्कलङ्क तथा खुला राख्ने नियम',
    governingDirection: 'ब्रह्मस्थान',
    area: 'ब्रह्मस्थान',
    calculationLogic: 'घरको मध्य भाग (ब्रह्मस्थान) सधैं खुला, हलुका, सफा र प्रकाशयुक्त हुनुपर्छ (+१० अङ्क)। यहाँ खम्बा, पर्खाल वा शौचालय भए कडा महादोष (-१० अङ्क)।',
    classicalSource: 'बृहत्संहिता (अध्याय ५३, श्लोक ६०)',
    activeStatus: true,
    element: 'आकाश',
    rulingDeity: 'ब्रह्मा',
    scoreWeightage: 10,
    effectDescription: 'समग्र घरमा प्राणउर्जाको सन्तुलन, निरोगी जीवन तथा गृहकलह मुक्ति।',
    remedy: 'ब्रह्मस्थानको गम्भीर दोष हटाउन तामाको तार वा वास्तु पिरामिड जडान गरी गायत्री मन्त्र पाठ गर्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_8',
    ruleName: 'पश्चिम-वायव्य वा दक्षिण-पश्चिममा शौचालय नियम',
    governingDirection: 'पश्चिम',
    area: 'शौचालय',
    calculationLogic: 'शौचालय पश्चिम-वायव्य वा दक्षिण दिशाको मध्यमा हुनुपर्छ। ईशान वा पूर्वमा भएमा कडा स्वास्थ तथा मानसिक दोष (-९ अङ्क)।',
    classicalSource: 'अपराजितपृच्छा (अध्याय ७२)',
    activeStatus: true,
    element: 'वायु',
    rulingDeity: 'वरुण',
    scoreWeightage: 8,
    effectDescription: 'शरीरबाट दूषित पदार्थ निष्कासन सरह नकारात्मक उर्जाको उचित विसर्जन।',
    remedy: 'शौचालय गलत ठाउँमा भए ढोकामा वास्तु समुद्री नुनको कचौरा राख्ने र सिसाको गिलास राख्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
  {
    id: 'vastu_rule_9',
    ruleName: 'दक्षिण वा पश्चिम भागमा अग्लो सिँढी स्थापन',
    governingDirection: 'दक्षिण',
    area: 'सिँढी',
    calculationLogic: 'सिँढी दक्षिण, पश्चिम वा नैऋत्यमा घडीको सुई घुम्ने दिशा (Clockwise) मा बन्नुपर्छ (+९ अङ्क)। ईशानमा सिँढी भएमा भारी दोष (-८ अङ्क)।',
    classicalSource: 'समराङ्गणसूत्रधार (अध्याय ६)',
    activeStatus: true,
    element: 'पृथ्वी',
    rulingDeity: 'यमदेव',
    scoreWeightage: 9,
    effectDescription: 'पारिवारिक प्रगतिमा निरन्तरता, आर्थिक स्थायित्व तथा दुर्घटनाबाट बचावट।',
    remedy: 'ईशानको सिँढी दोष हटाउन पहिलो खुड्किलामा तामाको पत्ती गाड्ने वा पहेलो प्रकाश बाल्ने।',
    updatedAtBS: '२०८१-०४-०१',
  },
];

/**
 * प्रारम्भिक वैदिक वास्तु नियमहरू प्राप्त गर्ने हेल्पर (Helper to get foundational Vastu rules with aliases populated)
 */
export function getInitialVastuRules(): VastuRule[] {
  return INITIAL_VASTU_RULES.map((rule) => ({
    ...rule,
    ruleId: rule.id,
    name: rule.ruleName,
    direction: rule.governingDirection,
    isActive: rule.activeStatus,
  }));
}

/**
 * भण्डारणबाट वास्तु नियमहरू प्राप्त गर्ने
 */
export function getStoredVastuRules(): VastuRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VASTU_RULES);
    if (!raw) {
      saveVastuRules(INITIAL_VASTU_RULES);
      return INITIAL_VASTU_RULES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveVastuRules(INITIAL_VASTU_RULES);
      return INITIAL_VASTU_RULES;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse Vastu rules from localStorage:', e);
    return INITIAL_VASTU_RULES;
  }
}

/**
 * वास्तु नियमहरू सुरक्षित गर्ने
 */
export function saveVastuRules(rules: VastuRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VASTU_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save Vastu rules to localStorage:', e);
  }
}

/**
 * नयाँ वास्तु नियम थप्ने
 */
export function addVastuRule(data: Omit<VastuRule, 'id' | 'updatedAtBS'>): VastuRule {
  const rules = getStoredVastuRules();
  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;

  const newRule: VastuRule = {
    ...data,
    id: `vastu_rule_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    activeStatus: data.activeStatus ?? true,
    updatedAtBS: todayBS,
  };

  const updated = [newRule, ...rules];
  saveVastuRules(updated);
  return newRule;
}

/**
 * वास्तु नियम अद्यावधिक गर्ने
 */
export function updateVastuRule(id: string, updates: Partial<Omit<VastuRule, 'id'>>): VastuRule | null {
  const rules = getStoredVastuRules();
  const index = rules.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;

  const updatedRule: VastuRule = {
    ...rules[index],
    ...updates,
    updatedAtBS: todayBS,
  };

  rules[index] = updatedRule;
  saveVastuRules(rules);
  return updatedRule;
}

/**
 * नियमको सक्रिय अवस्था फेरबदल गर्ने (Active / Inactive Toggle)
 */
export function toggleVastuRuleStatus(id: string, activeStatus?: boolean): VastuRule | null {
  const rules = getStoredVastuRules();
  const rule = rules.find((r) => r.id === id);
  if (!rule) return null;

  const nextStatus = activeStatus !== undefined ? activeStatus : !rule.activeStatus;
  return updateVastuRule(id, { activeStatus: nextStatus });
}

/**
 * नियम हटाउने
 */
export function deleteVastuRule(id: string): boolean {
  const rules = getStoredVastuRules();
  const filtered = rules.filter((r) => r.id !== id);
  if (filtered.length === rules.length) return false;

  saveVastuRules(filtered);
  return true;
}

/**
 * सुरुवाती नियमहरूमा पुनर्स्थापना गर्ने (Reset to Defaults)
 */
export function resetVastuRulesToDefault(): VastuRule[] {
  saveVastuRules(INITIAL_VASTU_RULES);
  return INITIAL_VASTU_RULES;
}

/**
 * दिशा अनुसार वास्तु नियमहरू खोज्ने
 */
export function getVastuRulesByDirection(direction: VastuDirection, onlyActive = true): VastuRule[] {
  const rules = getStoredVastuRules();
  return rules.filter((r) => r.governingDirection === direction && (!onlyActive || r.activeStatus));
}

/**
 * क्षेत्र (Area/Room) अनुसार वास्तु नियमहरू खोज्ने
 */
export function getVastuRulesByArea(area: string, onlyActive = true): VastuRule[] {
  const rules = getStoredVastuRules();
  const searchArea = area.toLowerCase().trim();
  return rules.filter(
    (r) =>
      r.area.toLowerCase().includes(searchArea) && (!onlyActive || r.activeStatus)
  );
}

/**
 * वास्तु क्षेत्र मूल्याङ्कन गर्ने (Vastu Direction & Area Evaluator)
 */
export function evaluateVastuArea(
  areaName: string,
  placedDirection: VastuDirection
): {
  score: number;
  isFavorable: boolean;
  matchingRule?: VastuRule;
  recommendation: string;
  remedy?: string;
  source?: string;
} {
  const rules = getStoredVastuRules().filter((r) => r.activeStatus);

  // १. प्रत्यक्ष दिशा र क्षेत्र मेल खाने नियम खोज्ने
  const matchedRule = rules.find(
    (r) =>
      r.governingDirection === placedDirection &&
      r.area.toLowerCase().includes(areaName.toLowerCase())
  );

  if (matchedRule) {
    return {
      score: matchedRule.scoreWeightage || 10,
      isFavorable: true,
      matchingRule: matchedRule,
      recommendation: matchedRule.effectDescription || `${placedDirection} मा ${areaName} रहनु अत्यन्त उत्तम तथा वास्तुसम्मत छ।`,
      remedy: matchedRule.remedy,
      source: matchedRule.classicalSource,
    };
  }

  // २. यदि क्षेत्र अर्को दिशाका लागि तोकिएको थियो भने
  const idealRuleForArea = rules.find((r) => r.area.toLowerCase().includes(areaName.toLowerCase()));

  if (idealRuleForArea) {
    return {
      score: 3, // दोषयुक्त
      isFavorable: false,
      matchingRule: idealRuleForArea,
      recommendation: `${areaName} का लागि उत्तम दिशा ${idealRuleForArea.governingDirection} हो। ${placedDirection} मा रहँदा आंशिक वा पूर्ण वास्तुदोष उत्पन्न हुन सक्छ।`,
      remedy: idealRuleForArea.remedy || `${placedDirection} दिशामा उपयुक्त वास्तु यन्त्र वा प्रकाश तथा जल संशोधन उपाय गर्नुहोस्।`,
      source: idealRuleForArea.classicalSource,
    };
  }

  // ३. सामान्य मूल्याङ्कन
  return {
    score: 5,
    isFavorable: true,
    recommendation: `${placedDirection} दिशामा ${areaName} को स्थिति सामान्य छ। दिशा अनुकूल राख्न सरसफाइ तथा पर्याप्त प्रकाशमा ध्यान दिनुहोस्।`,
  };
}

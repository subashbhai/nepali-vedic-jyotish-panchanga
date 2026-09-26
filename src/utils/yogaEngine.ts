import { 
  PlanetPosition, 
  LagnaInfo, 
  PlanetName, 
  VimshottariDashaResult, 
  GocharTransitResult 
} from '../types/astrology';
import { 
  DetailedYogaResult, 
  DetailedDoshaResult, 
  PlanetaryRelationshipGraph, 
  YogaDashaGocharLink 
} from '../types/yogaDoshaTypes';
import { 
  calculatePlanetaryRelationships, 
  getHouseLord,
  SIGN_LORDS
} from './planetaryRelationshipEngine';
import { 
  YOGA_RULE_REGISTRY, 
  DOSHA_RULE_REGISTRY 
} from './yogaRuleRegistry';

export function evaluateAllYogasAndDoshas(
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  dashaResult?: VimshottariDashaResult,
  gocharResult?: GocharTransitResult
): {
  yogas: DetailedYogaResult[];
  doshas: DetailedDoshaResult[];
  relationshipGraph: PlanetaryRelationshipGraph;
  dashaLinks: YogaDashaGocharLink[];
  summaryNepali: {
    totalYogasCount: number;
    activeYogasCount: number;
    totalDoshasCount: number;
    activeDoshasCount: number;
    description: string;
  };
} {
  const graph = calculatePlanetaryRelationships(lagna, planets);
  const yogas: DetailedYogaResult[] = [];
  const doshas: DetailedDoshaResult[] = [];

  const getPlanet = (name: PlanetName) => planets.find((p) => p.name === name);
  const sun = getPlanet('सूर्य');
  const moon = getPlanet('चन्द्र');
  const mars = getPlanet('मंगल');
  const mercury = getPlanet('बुध');
  const jupiter = getPlanet('गुरु');
  const venus = getPlanet('शुक्र');
  const saturn = getPlanet('शनि');
  const rahu = getPlanet('राहु');
  const ketu = getPlanet('केतु');

  const isKendra = (bhava: number) => [1, 4, 7, 10].includes(bhava);
  const isTrikona = (bhava: number) => [1, 5, 9].includes(bhava);
  const isDusthana = (bhava: number) => [6, 8, 12].includes(bhava);

  // Helper to find lord of a house
  const houseLord = (houseNum: number) => getHouseLord(lagna.rashiId, houseNum);

  // ----------------------------------------------------
  // 1. Kendra-Trikona Rajayoga (Dharma-Karmadhipati)
  // ----------------------------------------------------
  const kendraLords = [1, 4, 7, 10].map(houseLord);
  const trikonaLords = [1, 5, 9].map(houseLord);

  const rajayogaFormations: string[] = [];
  const formingRajayogaPlanets: Set<PlanetName> = new Set();

  kendraLords.forEach((kLordName) => {
    trikonaLords.forEach((tLordName) => {
      if (kLordName === tLordName) return; // Same planet e.g. Mars for Cancer lagna
      const kPlanet = getPlanet(kLordName);
      const tPlanet = getPlanet(tLordName);

      if (kPlanet && tPlanet) {
        if (kPlanet.bhava === tPlanet.bhava) {
          rajayogaFormations.push(`${kLordName} (केन्द्रेश) र ${tLordName} (त्रिकोणेश) भाव ${kPlanet.bhava} मा युतिबद्ध छन्`);
          formingRajayogaPlanets.add(kLordName);
          formingRajayogaPlanets.add(tLordName);
        }
      }
    });
  });

  const rajaRuleDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_RAJAYOGA_KENDRA_TRIKONA')!;
  if (rajayogaFormations.length > 0) {
    yogas.push({
      id: 'yoga_rajayoga_kendra_trikona',
      ruleCode: rajaRuleDef.ruleCode,
      nameNepali: rajaRuleDef.nameNepali,
      nameSanskrit: rajaRuleDef.nameSanskrit,
      category: rajaRuleDef.category,
      status: 'सक्रिय',
      strengthPercentage: 92,
      formingPlanets: Array.from(formingRajayogaPlanets),
      housesInvolved: [1, 4, 5, 7, 9, 10],
      rashisInvolved: [],
      formingCausesNepali: rajayogaFormations,
      descriptionNepali: `कुण्डलीमा केन्द्र र त्रिकोणका स्वामीहरू बीच शुभ सम्बन्ध स्थापित भएकाले राजयोग बनेको छ। यसले उच्च राजकीय/प्रशासनिक सफलता, मान-सम्मान र नेतृत्व क्षमता प्रदान गर्दछ।`,
      classicalProof: rajaRuleDef.classicalProof,
    });
  }

  // ----------------------------------------------------
  // 2. Dhanayoga (2, 5, 9, 11)
  // ----------------------------------------------------
  const lord2 = getPlanet(houseLord(2));
  const lord5 = getPlanet(houseLord(5));
  const lord9 = getPlanet(houseLord(9));
  const lord11 = getPlanet(houseLord(11));
  const lagnesha = getPlanet(houseLord(1));

  const dhanaCauses: string[] = [];
  const dhanaPlanets: Set<PlanetName> = new Set();

  if (lord2 && lord11 && lord2.bhava === lord11.bhava) {
    dhanaCauses.push(`द्वितीयेश ${lord2.name} र एकादशेश ${lord11.name} भाव ${lord2.bhava} मा युतिबद्ध छन्`);
    dhanaPlanets.add(lord2.name);
    dhanaPlanets.add(lord11.name);
  }
  if (lord5 && lord9 && lord5.bhava === lord9.bhava) {
    dhanaCauses.push(`पञ्चमेश ${lord5.name} र नवमेश ${lord9.name} भाव ${lord5.bhava} मा एकत्र छन्`);
    dhanaPlanets.add(lord5.name);
    dhanaPlanets.add(lord9.name);
  }
  if (lagnesha && lord11 && lagnesha.bhava === lord11.bhava) {
    dhanaCauses.push(`लग्नेश ${lagnesha.name} र लाभेश ${lord11.name} भाव ${lagnesha.bhava} मा स्थित छन्`);
    dhanaPlanets.add(lagnesha.name);
    dhanaPlanets.add(lord11.name);
  }

  const dhanaRuleDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_DHANAYOGA_2_5_9_11')!;
  if (dhanaCauses.length > 0) {
    yogas.push({
      id: 'yoga_dhanayoga_2_5_9_11',
      ruleCode: dhanaRuleDef.ruleCode,
      nameNepali: dhanaRuleDef.nameNepali,
      nameSanskrit: dhanaRuleDef.nameSanskrit,
      category: dhanaRuleDef.category,
      status: 'सक्रिय',
      strengthPercentage: 88,
      formingPlanets: Array.from(dhanaPlanets),
      housesInvolved: [2, 5, 9, 11],
      rashisInvolved: [],
      formingCausesNepali: dhanaCauses,
      descriptionNepali: `धन, भाग्य र लाभ भावका स्वामीहरूको शुभ संयोजनले गर्दा महाधन योग निर्मित भएको छ। यसले व्यापार, भूमि र लगानीबाट निरन्तर आर्थिक उन्नति गराउँछ।`,
      classicalProof: dhanaRuleDef.classicalProof,
    });
  }

  // ----------------------------------------------------
  // 3. Vipareeta Rajayogas (Harsha, Sarala, Vimala)
  // ----------------------------------------------------
  const lord6 = getPlanet(houseLord(6));
  const lord8 = getPlanet(houseLord(8));
  const lord12 = getPlanet(houseLord(12));

  if (lord6 && isDusthana(lord6.bhava)) {
    const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_VIPAREETA_HARSHA')!;
    yogas.push({
      id: 'yoga_vipareeta_harsha',
      ruleCode: rDef.ruleCode,
      nameNepali: rDef.nameNepali,
      nameSanskrit: rDef.nameSanskrit,
      category: rDef.category,
      status: 'सक्रिय',
      strengthPercentage: 82,
      formingPlanets: [lord6.name],
      housesInvolved: [6, lord6.bhava],
      rashisInvolved: [lord6.rashiName],
      formingCausesNepali: [`षष्ठेश ${lord6.name} दुष्ट भाव ${lord6.bhava} मा स्थित छ`],
      descriptionNepali: `षष्ठेश त्रिक भावमा रहेकाले हर्ष विपरीत राजयोग बनेको छ। यसले शत्रुमाथि विजय, उत्तम स्वास्थ्य र संकटबाट मुक्ति दिन्छ।`,
      classicalProof: rDef.classicalProof,
    });
  }

  if (lord8 && isDusthana(lord8.bhava)) {
    const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_VIPAREETA_SARALA')!;
    yogas.push({
      id: 'yoga_vipareeta_sarala',
      ruleCode: rDef.ruleCode,
      nameNepali: rDef.nameNepali,
      nameSanskrit: rDef.nameSanskrit,
      category: rDef.category,
      status: 'सक्रिय',
      strengthPercentage: 84,
      formingPlanets: [lord8.name],
      housesInvolved: [8, lord8.bhava],
      rashisInvolved: [lord8.rashiName],
      formingCausesNepali: [`अष्टमेश ${lord8.name} दुष्ट भाव ${lord8.bhava} मा स्थित छ`],
      descriptionNepali: `अष्टमेश त्रिक भावमा रहेकाले सरल विपरीत राजयोग बनेको छ। यसले दीर्घायु, विद्वता र अप्रत्याशित सफलता दिन्छ।`,
      classicalProof: rDef.classicalProof,
    });
  }

  if (lord12 && isDusthana(lord12.bhava)) {
    const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_VIPAREETA_VIMALA')!;
    yogas.push({
      id: 'yoga_vipareeta_vimala',
      ruleCode: rDef.ruleCode,
      nameNepali: rDef.nameNepali,
      nameSanskrit: rDef.nameSanskrit,
      category: rDef.category,
      status: 'सक्रिय',
      strengthPercentage: 82,
      formingPlanets: [lord12.name],
      housesInvolved: [12, lord12.bhava],
      rashisInvolved: [lord12.rashiName],
      formingCausesNepali: [`द्वादशेश ${lord12.name} दुष्ट भाव ${lord12.bhava} मा स्थित छ`],
      descriptionNepali: `द्वादशेश त्रिक भावमा रहेकाले विमल विपरीत राजयोग बनेको छ। यसले मितव्ययिता, स्वतन्त्र विचार र विदेश सफलता दिन्छ।`,
      classicalProof: rDef.classicalProof,
    });
  }

  // ----------------------------------------------------
  // 4. Pancha Mahapurusha Yogas
  // ----------------------------------------------------
  const evaluateMahapurusha = (planet: PlanetPosition | undefined, ruleCode: string) => {
    if (!planet) return;
    if (isKendra(planet.bhava) && ['उच्च', 'स्वक्षेत्र'].includes(planet.dignity)) {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === ruleCode)!;
      yogas.push({
        id: `yoga_${ruleCode.toLowerCase()}`,
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: planet.dignity === 'उच्च' ? 95 : 90,
        formingPlanets: [planet.name],
        housesInvolved: [planet.bhava],
        rashisInvolved: [planet.rashiName],
        formingCausesNepali: [`${planet.name} केन्द्र भाव ${planet.bhava} मा ${planet.dignity} (${planet.rashiName}) मा स्थित छ`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    }
  };

  evaluateMahapurusha(mars, 'YOGA_RUCHAKA_MAHAPURUSHA');
  evaluateMahapurusha(mercury, 'YOGA_BHADRA_MAHAPURUSHA');
  evaluateMahapurusha(jupiter, 'YOGA_HAMSA_MAHAPURUSHA');
  evaluateMahapurusha(venus, 'YOGA_MALAVYA_MAHAPURUSHA');
  evaluateMahapurusha(saturn, 'YOGA_SASA_MAHAPURUSHA');

  // ----------------------------------------------------
  // 5. Neechabhanga Rajayoga (नीचभङ्ग राजयोग)
  // ----------------------------------------------------
  planets.forEach((p) => {
    if (p.dignity === 'नीच') {
      const dispositorName = SIGN_LORDS[p.rashiId];
      const dispositorPlanet = getPlanet(dispositorName);
      const neechbhangaCauses: string[] = [];

      if (dispositorPlanet) {
        if (isKendra(dispositorPlanet.bhava)) {
          neechbhangaCauses.push(`नीच ग्रह ${p.name} को राशि स्वामी ${dispositorName} लग्नबाट केन्द्र (${dispositorPlanet.bhava} औँ भाव) मा छ`);
        }
        if (moon && isKendra(((dispositorPlanet.bhava - moon.bhava + 12) % 12) + 1)) {
          neechbhangaCauses.push(`राशि स्वामी ${dispositorName} चन्द्रमाबाट केन्द्र भावमा छ`);
        }
      }

      if (neechbhangaCauses.length > 0) {
        const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_NEECHABHANGA_RAJAYOGA')!;
        yogas.push({
          id: `yoga_neechabhanga_${p.id}`,
          ruleCode: rDef.ruleCode,
          nameNepali: `नीचभङ्ग राजयोग (${p.name})`,
          nameSanskrit: `नीचभङ्गराजयोगः (${p.name})`,
          category: rDef.category,
          status: 'सक्रिय',
          strengthPercentage: 85,
          formingPlanets: [p.name, dispositorName],
          housesInvolved: [p.bhava, dispositorPlanet?.bhava || 0],
          rashisInvolved: [p.rashiName],
          formingCausesNepali: neechbhangaCauses,
          cancellationCausesNepali: [`${p.name} नीच अवस्थामा भए तापनि शास्त्रीय सर्त पूरा भई नीचता भङ्ग भएको छ`],
          descriptionNepali: `${p.name} नीच राशिमा भए तापनि राशि स्वामीको बलियो केन्द्र स्थितिका कारण नीचता भङ्ग भई नीchabhanga Rajayoga बनेको छ।`,
          classicalProof: rDef.classicalProof,
        });
      }
    }
  });

  // ----------------------------------------------------
  // 6. Gajakesari & Budhaditya
  // ----------------------------------------------------
  if (jupiter && moon) {
    const houseFromMoon = ((jupiter.bhava - moon.bhava + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(houseFromMoon) && jupiter.dignity !== 'नीच') {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_GAJAKESARI')!;
      yogas.push({
        id: 'yoga_gajakesari',
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: jupiter.dignity === 'उच्च' ? 96 : 85,
        formingPlanets: ['गुरु', 'चन्द्र'],
        housesInvolved: [moon.bhava, jupiter.bhava],
        rashisInvolved: [moon.rashiName, jupiter.rashiName],
        formingCausesNepali: [`देवगुरु बृहस्पति चन्द्रमाबाट ${houseFromMoon} औँ केन्द्र भावमा स्थित छन्`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    }
  }

  if (sun && mercury && sun.bhava === mercury.bhava) {
    const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_BUDHADITYA')!;
    yogas.push({
      id: 'yoga_budhaditya',
      ruleCode: rDef.ruleCode,
      nameNepali: rDef.nameNepali,
      nameSanskrit: rDef.nameSanskrit,
      category: rDef.category,
      status: 'सक्रिय',
      strengthPercentage: mercury.isCombust ? 60 : 88,
      formingPlanets: ['सूर्य', 'बुध'],
      housesInvolved: [sun.bhava],
      rashisInvolved: [sun.rashiName],
      formingCausesNepali: [`सूर्य र बुध भाव ${sun.bhava} (${sun.rashiName}) मा एकापसमा युतिबद्ध छन्`],
      descriptionNepali: rDef.descriptionNepali,
      classicalProof: rDef.classicalProof,
    });
  }

  // ----------------------------------------------------
  // 7. Sun Yogas (Vesi, Vasi, Ubhayachari)
  // ----------------------------------------------------
  if (sun) {
    const house2FromSun = ((sun.bhava) % 12) + 1;
    const house12FromSun = ((sun.bhava - 2 + 12) % 12) + 1;

    const planets2nd = planets.filter((p) => p.bhava === house2FromSun && !['सूर्य', 'राहु', 'केतु'].includes(p.name));
    const planets12th = planets.filter((p) => p.bhava === house12FromSun && !['सूर्य', 'राहु', 'केतु'].includes(p.name));

    if (planets2nd.length > 0 && planets12th.length > 0) {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_UBHAYACHARI')!;
      yogas.push({
        id: 'yoga_ubhayachari',
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: 85,
        formingPlanets: ['सूर्य', ...planets2nd.map((p) => p.name), ...planets12th.map((p) => p.name)],
        housesInvolved: [sun.bhava, house2FromSun, house12FromSun],
        rashisInvolved: [sun.rashiName],
        formingCausesNepali: [`सूर्यको २ औँ भावमा ${planets2nd.map((p) => p.name).join(', ')} र १२ औँ भावमा ${planets12th.map((p) => p.name).join(', ')} छन्`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    } else if (planets2nd.length > 0) {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_VESI')!;
      yogas.push({
        id: 'yoga_vesi',
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: 78,
        formingPlanets: ['सूर्य', ...planets2nd.map((p) => p.name)],
        housesInvolved: [sun.bhava, house2FromSun],
        rashisInvolved: [sun.rashiName],
        formingCausesNepali: [`सूर्यको २ औँ भावमा ${planets2nd.map((p) => p.name).join(', ')} स्थित छन्`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    } else if (planets12th.length > 0) {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_VASI')!;
      yogas.push({
        id: 'yoga_vasi',
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: 78,
        formingPlanets: ['सूर्य', ...planets12th.map((p) => p.name)],
        housesInvolved: [sun.bhava, house12FromSun],
        rashisInvolved: [sun.rashiName],
        formingCausesNepali: [`सूर्यको १२ औँ भावमा ${planets12th.map((p) => p.name).join(', ')} स्थित छन्`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    }
  }

  // ----------------------------------------------------
  // 8. Moon Yogas (Sunapha, Anapha, Durdhara)
  // ----------------------------------------------------
  if (moon) {
    const house2FromMoon = ((moon.bhava) % 12) + 1;
    const house12FromMoon = ((moon.bhava - 2 + 12) % 12) + 1;

    const planets2nd = planets.filter((p) => p.bhava === house2FromMoon && !['सूर्य', 'चन्द्र', 'राहु', 'केतु'].includes(p.name));
    const planets12th = planets.filter((p) => p.bhava === house12FromMoon && !['सूर्य', 'चन्द्र', 'राहु', 'केतु'].includes(p.name));

    if (planets2nd.length > 0 && planets12th.length > 0) {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_DURDHARA')!;
      yogas.push({
        id: 'yoga_durdhara',
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: 86,
        formingPlanets: ['चन्द्र', ...planets2nd.map((p) => p.name), ...planets12th.map((p) => p.name)],
        housesInvolved: [moon.bhava, house2FromMoon, house12FromMoon],
        rashisInvolved: [moon.rashiName],
        formingCausesNepali: [`चन्द्रमाको २ औँ भावमा ${planets2nd.map((p) => p.name).join(', ')} र १२ औँ भावमा ${planets12th.map((p) => p.name).join(', ')} स्थित छन्`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    } else if (planets2nd.length > 0) {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_SUNAPHA')!;
      yogas.push({
        id: 'yoga_sunapha',
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: 80,
        formingPlanets: ['चन्द्र', ...planets2nd.map((p) => p.name)],
        housesInvolved: [moon.bhava, house2FromMoon],
        rashisInvolved: [moon.rashiName],
        formingCausesNepali: [`चन्द्रमाको २ औँ भावमा ${planets2nd.map((p) => p.name).join(', ')} स्थित छन्`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    } else if (planets12th.length > 0) {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_ANAPHA')!;
      yogas.push({
        id: 'yoga_anapha',
        ruleCode: rDef.ruleCode,
        nameNepali: rDef.nameNepali,
        nameSanskrit: rDef.nameSanskrit,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: 80,
        formingPlanets: ['चन्द्र', ...planets12th.map((p) => p.name)],
        housesInvolved: [moon.bhava, house12FromMoon],
        rashisInvolved: [moon.rashiName],
        formingCausesNepali: [`चन्द्रमाको १२ औँ भावमा ${planets12th.map((p) => p.name).join(', ')} स्थित छन्`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    }
  }

  // Add Parivartana Yogas from graph
  graph.parivartanaYogas.forEach((py) => {
    if (py.type === 'महा') {
      const rDef = YOGA_RULE_REGISTRY.find((r) => r.ruleCode === 'YOGA_PARIVARTANA_MAHA')!;
      yogas.push({
        id: `yoga_parivartana_${py.planet1}_${py.planet2}`,
        ruleCode: rDef.ruleCode,
        nameNepali: `${rDef.nameNepali} (${py.planet1} ↔ ${py.planet2})`,
        nameSanskrit: `${rDef.nameSanskrit}`,
        category: rDef.category,
        status: 'सक्रिय',
        strengthPercentage: 90,
        formingPlanets: [py.planet1, py.planet2],
        housesInvolved: [py.house1, py.house2],
        rashisInvolved: [],
        formingCausesNepali: [`${py.planet1} (भाव ${py.house1}) र ${py.planet2} (भाव ${py.house2}) बीच आपसी राशि परिवर्तन`],
        descriptionNepali: rDef.descriptionNepali,
        classicalProof: rDef.classicalProof,
      });
    }
  });

  // ====================================================
  // EVALUATE DOSHAS
  // ====================================================

  // 1. Mangal Dosha (मङ्गल दोष)
  if (mars) {
    const mangalHouses = [1, 4, 7, 8, 12];
    const isLagnaMangal = mangalHouses.includes(mars.bhava);

    let isMoonMangal = false;
    if (moon) {
      const houseFromMoon = ((mars.bhava - moon.bhava + 12) % 12) + 1;
      isMoonMangal = mangalHouses.includes(houseFromMoon);
    }

    let isVenusMangal = false;
    if (venus) {
      const houseFromVenus = ((mars.bhava - venus.bhava + 12) % 12) + 1;
      isVenusMangal = mangalHouses.includes(houseFromVenus);
    }

    if (isLagnaMangal || isMoonMangal || isVenusMangal) {
      const dDef = DOSHA_RULE_REGISTRY.find((d) => d.ruleCode === 'DOSHA_MANGAL')!;
      const formingRules: string[] = [];
      if (isLagnaMangal) formingRules.push(`लग्नबाट ${mars.bhava} औँ भावमा मंगल स्थित छ`);
      if (isMoonMangal && moon) formingRules.push(`चन्द्रमाबाट ${((mars.bhava - moon.bhava + 12) % 12) + 1} औँ भावमा मंगल छ`);
      if (isVenusMangal && venus) formingRules.push(`शुक्रबाट ${((mars.bhava - venus.bhava + 12) % 12) + 1} औँ भावमा मंगल छ`);

      const triggeredCancellations: string[] = [];
      if (['उच्च', 'स्वक्षेत्र'].includes(mars.dignity)) {
        triggeredCancellations.push(`मंगल स्वक्षेत्र (${mars.rashiName}) वा उच्च स्थितिमा भएकाले दोष शमित भयो`);
      }
      if ([5, 9].includes(lagna.rashiId)) { // Leo or Sagittarius Lagna
        triggeredCancellations.push(`सिंह/धनु लग्न भएकाले मंगल दोष लाग्दैन`);
      }
      if (jupiter && [1, 4, 7, 8, 12].includes(((jupiter.bhava - mars.bhava + 12) % 12) + 1)) {
        triggeredCancellations.push(`देवगुरु बृहस्पतिले मंगलमाथि पूर्ण शुभ दृष्टि दिएकाले दोष भङ्ग भयो`);
      }

      const isCancelled = triggeredCancellations.length > 0;

      doshas.push({
        id: 'dosha_mangal',
        ruleCode: dDef.ruleCode,
        nameNepali: dDef.nameNepali,
        nameSanskrit: dDef.nameSanskrit,
        category: dDef.category,
        status: isCancelled ? 'भङ्ग' : 'सक्रिय',
        isCancelled,
        severityLabel: isCancelled ? 'शमित / भङ्ग' : (isLagnaMangal && isMoonMangal ? 'उच्च' : 'मध्यम'),
        formingPlanets: ['मंगल'],
        housesInvolved: [mars.bhava],
        formingRulesNepali: formingRules,
        cancellationRulesTriggeredNepali: triggeredCancellations,
        descriptionNepali: isCancelled 
          ? `मंगल दोष निर्माण भए तापनि शास्त्रीय नियमअनुसार दोष पूर्ण रूपमा शमित/भङ्ग भएको छ।`
          : `लग्न/चन्द्र/शुक्रबाट प्रतिकूल भावमा मंगल रहेकाले मङ्गल दोष कायम छ।`,
        classicalProof: dDef.classicalProof,
        remediesNepali: dDef.remediesNepali,
      });
    }
  }

  // 2. Kal Sarp Dosha (कालसर्प दोष)
  if (rahu && ketu) {
    const mainPlanets = [sun, moon, mars, mercury, jupiter, venus, saturn].filter(Boolean) as PlanetPosition[];
    const rLong = rahu.longitude;
    const kLong = ketu.longitude;

    const side1 = mainPlanets.filter((p) => {
      if (rLong < kLong) return p.longitude > rLong && p.longitude < kLong;
      return p.longitude > rLong || p.longitude < kLong;
    });

    const isFullKalSarp = side1.length === 7 || side1.length === 0;
    const isPartialKalSarp = side1.length === 6 || side1.length === 1;

    if (isFullKalSarp || isPartialKalSarp) {
      const dDef = DOSHA_RULE_REGISTRY.find((d) => d.ruleCode === 'DOSHA_KAL_SARP')!;
      const triggeredCancellations: string[] = [];

      if (jupiter && isKendra(jupiter.bhava)) {
        triggeredCancellations.push(`बृहस्पति केन्द्र भाव (${jupiter.bhava}) मा बलियो रहेकाले कालसर्प दोष प्रभावहीन बनेको छ`);
      }

      const isCancelled = triggeredCancellations.length > 0;

      doshas.push({
        id: 'dosha_kal_sarp',
        ruleCode: dDef.ruleCode,
        nameNepali: isFullKalSarp ? 'पूर्ण कालसर्प दोष' : 'आंशिक कालसर्प दोष',
        nameSanskrit: dDef.nameSanskrit,
        category: dDef.category,
        status: isCancelled ? 'भङ्ग' : 'सक्रिय',
        isCancelled,
        severityLabel: isCancelled ? 'शमित / भङ्ग' : (isFullKalSarp ? 'उच्च' : 'निम्न'),
        formingPlanets: ['राहु', 'केतु'],
        housesInvolved: [rahu.bhava, ketu.bhava],
        formingRulesNepali: [
          isFullKalSarp 
            ? `सबै सात ग्रहहरू राहु (${rahu.rashiName}) र केतु (${ketu.rashiName}) को एकै अक्षमा सीमित छन्`
            : `छ वटा ग्रहहरू राहु-केतुको अक्षभित्र परेकाले आंशिक कालसर्प बनेको छ`
        ],
        cancellationRulesTriggeredNepali: triggeredCancellations,
        descriptionNepali: isCancelled 
          ? `कालसर्प योग बने तापनि गुरुको केन्द्र स्थितिले दोष भङ्ग भएको छ।`
          : `ग्रहहरू राहु-केतुको अक्षमा घेरिएकाले कालसर्प योग कायम छ।`,
        classicalProof: dDef.classicalProof,
        remediesNepali: dDef.remediesNepali,
      });
    }
  }

  // 3. Grahan Dosha
  if ((sun && rahu && sun.bhava === rahu.bhava) || (moon && rahu && moon.bhava === rahu.bhava) || (sun && ketu && sun.bhava === ketu.bhava) || (moon && ketu && moon.bhava === ketu.bhava)) {
    const dDef = DOSHA_RULE_REGISTRY.find((d) => d.ruleCode === 'DOSHA_GRAHAN')!;
    const formingP: PlanetName[] = [];
    if (sun && rahu && sun.bhava === rahu.bhava) formingP.push('सूर्य', 'राहु');
    if (moon && rahu && moon.bhava === rahu.bhava) formingP.push('चन्द्र', 'राहु');
    if (sun && ketu && sun.bhava === ketu.bhava) formingP.push('सूर्य', 'केतु');
    if (moon && ketu && moon.bhava === ketu.bhava) formingP.push('चन्द्र', 'केतु');

    doshas.push({
      id: 'dosha_grahan',
      ruleCode: dDef.ruleCode,
      nameNepali: dDef.nameNepali,
      nameSanskrit: dDef.nameSanskrit,
      category: dDef.category,
      status: 'सक्रिय',
      isCancelled: false,
      severityLabel: 'मध्यम',
      formingPlanets: Array.from(new Set(formingP)),
      housesInvolved: [sun?.bhava || moon?.bhava || 1],
      formingRulesNepali: [`सूर्य/चन्द्रमासँग राहु/केतु एउटै भावमा युतिबद्ध रहेकाले ग्रहण दोष बनेको छ`],
      cancellationRulesTriggeredNepali: [],
      descriptionNepali: dDef.descriptionNepali,
      classicalProof: dDef.classicalProof,
      remediesNepali: dDef.remediesNepali,
    });
  }

  // 4. Guru Chandal Dosha
  if (jupiter && (rahu || ketu)) {
    const isRahuConj = rahu && jupiter.bhava === rahu.bhava;
    const isKetuConj = ketu && jupiter.bhava === ketu.bhava;

    if (isRahuConj || isKetuConj) {
      const dDef = DOSHA_RULE_REGISTRY.find((d) => d.ruleCode === 'DOSHA_GURU_CHANDAL')!;
      const triggeredCancellations: string[] = [];

      if (['उच्च', 'स्वक्षेत्र'].includes(jupiter.dignity)) {
        triggeredCancellations.push(`गुरुदेव धनु/मीन/कर्कट (${jupiter.rashiName}) मा स्वक्षेत्र/उच्च रहेकाले दोष भङ्ग भएको छ`);
      }

      const isCancelled = triggeredCancellations.length > 0;

      doshas.push({
        id: 'dosha_guru_chandal',
        ruleCode: dDef.ruleCode,
        nameNepali: dDef.nameNepali,
        nameSanskrit: dDef.nameSanskrit,
        category: dDef.category,
        status: isCancelled ? 'भङ्ग' : 'सक्रिय',
        isCancelled,
        severityLabel: isCancelled ? 'शमित / भङ्ग' : 'मध्यम',
        formingPlanets: isRahuConj ? ['गुरु', 'राहु'] : ['गुरु', 'केतु'],
        housesInvolved: [jupiter.bhava],
        formingRulesNepali: [`देवगुरु बृहस्पति र ${isRahuConj ? 'राहु' : 'केतु'} भाव ${jupiter.bhava} मा युतिबद्ध छन्`],
        cancellationRulesTriggeredNepali: triggeredCancellations,
        descriptionNepali: dDef.descriptionNepali,
        classicalProof: dDef.classicalProof,
        remediesNepali: dDef.remediesNepali,
      });
    }
  }

  // 5. Kemadruma Dosha
  if (moon) {
    const house2FromMoon = ((moon.bhava) % 12) + 1;
    const house12FromMoon = ((moon.bhava - 2 + 12) % 12) + 1;

    const planets2nd = planets.filter((p) => p.bhava === house2FromMoon && !['सूर्य', 'चन्द्र', 'राहु', 'केतु'].includes(p.name));
    const planets12th = planets.filter((p) => p.bhava === house12FromMoon && !['सूर्य', 'चन्द्र', 'राहु', 'केतु'].includes(p.name));

    if (planets2nd.length === 0 && planets12th.length === 0) {
      const dDef = DOSHA_RULE_REGISTRY.find((d) => d.ruleCode === 'DOSHA_KEMADRUMA')!;
      const triggeredCancellations: string[] = [];

      // Check if any planet is in Kendra from Lagna
      const kendraPlanets = planets.filter((p) => isKendra(p.bhava) && !['राहु', 'केतु'].includes(p.name));
      if (kendraPlanets.length > 0) {
        triggeredCancellations.push(`लग्नबाट केन्द्र भावमा ${kendraPlanets.map((p) => p.name).join(', ')} रहेकाले केमद्रुम दोष पूर्ण भङ्ग भयो`);
      }

      const isCancelled = triggeredCancellations.length > 0;

      doshas.push({
        id: 'dosha_kemadruma',
        ruleCode: dDef.ruleCode,
        nameNepali: dDef.nameNepali,
        nameSanskrit: dDef.nameSanskrit,
        category: dDef.category,
        status: isCancelled ? 'भङ्ग' : 'सक्रिय',
        isCancelled,
        severityLabel: isCancelled ? 'शमित / भङ्ग' : 'मध्यम',
        formingPlanets: ['चन्द्र'],
        housesInvolved: [moon.bhava],
        formingRulesNepali: [`चन्द्रमाको २ औँ र १२ औँ दुवै भावमा कुनै पनि मुख्य ग्रह नभएकाले केमद्रुम अवस्था छ`],
        cancellationRulesTriggeredNepali: triggeredCancellations,
        descriptionNepali: dDef.descriptionNepali,
        classicalProof: dDef.classicalProof,
        remediesNepali: dDef.remediesNepali,
      });
    }
  }

  // ----------------------------------------------------
  // Dasha Links
  // ----------------------------------------------------
  const dashaLinks: YogaDashaGocharLink[] = [];

  if (dashaResult?.currentMahadasha) {
    const mdPlanet = dashaResult.currentMahadasha.planet;
    const adPlanet = dashaResult.currentAntardasha?.planet;

    yogas.forEach((y) => {
      const isMdActive = y.formingPlanets.includes(mdPlanet);
      const isAdActive = adPlanet ? y.formingPlanets.includes(adPlanet) : false;

      if (isMdActive || isAdActive) {
        dashaLinks.push({
          yogaId: y.id,
          yogaName: y.nameNepali,
          isActiveInMahadasha: isMdActive,
          isActiveInAntardasha: isAdActive,
          activeDashaPlanet: isMdActive ? mdPlanet : adPlanet,
          transitInfluenceSummaryNepali: `वर्तमान ${mdPlanet} महादशा ${isAdActive ? `र ${adPlanet} अन्तरदशा` : ''} मा यो ${y.nameNepali} विशेष रूपमा फलदायी तथा सक्रिय रहनेछ।`,
        });
      }
    });
  }

  const activeYogas = yogas.filter((y) => y.status === 'सक्रिय');
  const activeDoshas = doshas.filter((d) => d.status === 'सक्रिय');

  return {
    yogas,
    doshas,
    relationshipGraph: graph,
    dashaLinks,
    summaryNepali: {
      totalYogasCount: yogas.length,
      activeYogasCount: activeYogas.length,
      totalDoshasCount: doshas.length,
      activeDoshasCount: activeDoshas.length,
      description: `कुल ${yogas.length} योग मध्ये ${activeYogas.length} योग सक्रिय छन् र कुल ${doshas.length} दोष मध्ये ${activeDoshas.length} दोष सक्रिय छन्।`,
    },
  };
}

/**
 * Backward compatibility wrapper returning YogaRuleResult[]
 */
export function evaluateYogas(lagna: LagnaInfo, planets: PlanetPosition[]): import('../types/astrology').YogaRuleResult[] {
  const result = evaluateAllYogasAndDoshas(lagna, planets);
  return result.yogas.map((y) => ({
    id: y.id,
    name: y.nameNepali,
    nameSanskrit: y.nameSanskrit,
    category: y.category as any,
    isPresent: y.status === 'सक्रिय',
    strengthPercentage: y.strengthPercentage,
    formingPlanets: y.formingPlanets,
    housesInvolved: y.housesInvolved,
    descriptionNepali: y.descriptionNepali,
    classicalReference: `${y.classicalProof.textNameNepali} (${y.classicalProof.chapter}, ${y.classicalProof.shlokaOrVerse})`,
    remedies: y.formingCausesNepali,
  }));
}


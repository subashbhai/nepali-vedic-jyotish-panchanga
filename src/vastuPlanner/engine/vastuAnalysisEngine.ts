// Deterministic Vastu Analysis Engine for Building Planner
// बालानन्द कर्मकाण्ड
import { 
  VastuPlannerProject, 
  VastuAnalysisResult, 
  VastuAnalysisItem, 
  CompassDirection 
} from '../types';
import { 
  ROOM_VASTU_RULES, 
  ENTRANCE_VASTU_RATING, 
  DIRECTION_NAMES_NEPALI 
} from '../rules/vastuRules';

export function analyzeVastuBuildingPlan(project: VastuPlannerProject): VastuAnalysisResult {
  const items: VastuAnalysisItem[] = [];
  let totalScore = 0;
  let maxScore = 0;

  // 1. PLOT SHAPE & RATIO
  const shape = project.plotShape;
  const ratio = project.plotLength / (project.plotWidth || 1);
  maxScore += 15;
  if (shape === 'square') {
    totalScore += 15;
    items.push({
      id: 'plot-shape',
      title: 'जग्गाको आकार (वर्गाकार)',
      category: 'भू-आकृति',
      direction: 'चारै दिशा',
      status: 'recommended',
      observation: 'जग्गा समकोण र चारै भुजा बराबर भएको वर्गाकार छ।',
      recommendation: 'वर्गाकार जग्गा वास्तुशास्त्रमा सर्वोत्तम मानिन्छ। यसले सर्वतोभद्र समृद्धि र मानसिक शान्ति दिन्छ।',
      vedicRemedy: 'यस्तो जग्गामा चारै सुरमा वास्तु कलश स्थापना गरी जग हाल्नु उत्तम हुन्छ।'
    });
  } else if (shape === 'rectangular' && ratio >= 1 && ratio <= 2) {
    totalScore += 14;
    items.push({
      id: 'plot-shape',
      title: 'जग्गाको आकार (आयताकार १:२ अनुपात)',
      category: 'भू-आकृति',
      direction: 'चारै दिशा',
      status: 'recommended',
      observation: `जग्गाको लम्बाइ र चौडाइको अनुपात १:${ratio.toFixed(2)} छ।`,
      recommendation: '१:२ भित्रको आयताकार जग्गा वास्तु अनुसार अत्यन्त शुभ र भवन निर्माणका लागि उपयुक्त हुन्छ।',
      vedicRemedy: 'भवन निर्माण गर्दा पनि यही अनुपात कायम राख्न प्रयास गर्नुहोस्।'
    });
  } else if (shape === 'l_shaped') {
    totalScore += 6;
    items.push({
      id: 'plot-shape',
      title: 'L-आकारको जग्गा (कुना काटिएको)',
      category: 'भू-आकृति',
      direction: 'कुना काटिएको',
      status: 'caution',
      observation: 'जग्गामा कुनै एक कुना काटिएको वा थपिएको (L-आकार) अवस्था छ।',
      recommendation: 'काटिएको भागमा वास्तु पिरामिड, सिमाना पर्खाल वा खुला बगैँचा बनाएर मुख्य घरलाई आयताकार बनाउनुहोस्।',
      vedicRemedy: 'काटिएको कोणमा तामाको तार तथा पञ्चरत्न विजारोपण गरी दोष निवारण गर्नुहोस्।'
    });
  } else {
    totalScore += 8;
    items.push({
      id: 'plot-shape',
      title: 'अनियमित जग्गा (Irregular Boundary)',
      category: 'भू-आकृति',
      direction: 'असमान भुजाहरू',
      status: 'caution',
      observation: 'जग्गाको चारैतिरका सिमाना असमान लम्बाइका छन्।',
      recommendation: 'भवनको प्लिन्थ लेभल अनिवार्य रूपमा समकोण (९०°) बनाएर आयताकार वा वर्गाकारमा मात्र निर्माण गर्नुहोस्। बाँकी असमान भाग कम्पाउन्डभित्र बगैँचा वा पार्किङमा छोड्नुहोस्।',
      vedicRemedy: 'जग्गाको चारै सुरमा अष्टधातु पिरामिड दबाएर वास्तु सन्तुलन मिलाउनुहोस्।'
    });
  }

  // 2. ENTRANCE & ROAD VASTU
  const primaryRoad = project.roads.find(r => r.isMainRoad) || project.roads[0];
  const entranceDir: CompassDirection = primaryRoad ? primaryRoad.direction : 'N';
  const entranceRating = ENTRANCE_VASTU_RATING[entranceDir] || { rating: 'acceptable', notesNepali: 'सामान्य प्रवेश' };
  
  maxScore += 20;
  if (entranceRating.rating === 'recommended') {
    totalScore += 20;
  } else if (entranceRating.rating === 'acceptable') {
    totalScore += 14;
  } else if (entranceRating.rating === 'caution') {
    totalScore += 9;
  } else {
    totalScore += 4;
  }

  items.push({
    id: 'entrance-road',
    title: `मुख्य प्रवेशद्वार तथा बाटो (${DIRECTION_NAMES_NEPALI[entranceDir]?.name || entranceDir})`,
    category: 'प्रवेशद्वार',
    direction: entranceDir,
    status: entranceRating.rating,
    observation: `सडक ${DIRECTION_NAMES_NEPALI[entranceDir]?.name || entranceDir} तर्फ रहेको छ।`,
    recommendation: entranceRating.notesNepali,
    vedicRemedy: entranceRating.rating === 'conflict'
      ? 'नैऋत्य द्वार भएमा ढोकाको बाहिर पञ्चमुखी हनुमान जीको तस्बिर वा तामाको स्वस्तिक/त्रिशूल स्थापना अनिवार्य गर्नुहोस्।'
      : entranceRating.rating === 'caution'
      ? 'मुख्यद्वारमा ॐ, स्वस्तिक र शुभ-लाभ अङ्कित गर्नुहोस् तथा ढोकाको चौघेरामा पहेँलो पीताम्बर रङ्ग प्रयोग गर्नुहोस्।'
      : 'प्रवेशद्वारलाई सधैं प्रकाशयुक्त, स्वच्छ र सुन्दर तोरणले सुसज्जित राख्नुहोस्।'
  });

  // Multiple roads bonus/insight
  if (project.roads.length >= 2) {
    items.push({
      id: 'corner-plot',
      title: 'दुई वा बढी दिशामा बाटो (Corner / Multi-Road Plot)',
      category: 'बाटो/सडक',
      direction: project.roads.map(r => r.direction).join(', '),
      status: (entranceDir === 'N' || entranceDir === 'E' || entranceDir === 'NE') ? 'recommended' : 'acceptable',
      observation: `जग्गाको ${project.roads.length} तिर बाटो जोडिएको छ।`,
      recommendation: 'कुनामा बाटो भएको जग्गामा प्रकाश र हावाको प्रवाह उत्तम हुन्छ। मुख्य गेट उत्तर वा पूर्वतर्फको बाटोमा राख्नु सबैभन्दा फलदायी हुन्छ।',
      vedicRemedy: 'दक्षिण वा पश्चिमको बाटोबाट सवारी साधनको प्रवेश र उत्तर/पूर्वबाट मुख्य पैदल प्रवेशद्वार बनाउनुहोस्।'
    });
  }

  // 3. SETBACKS & OPEN SPACE DISTRIBUTION
  maxScore += 15;
  const sb = project.buildingReqs.setbacks;
  const northEastOpen = (sb.north || 0) + (sb.east || 0);
  const southWestOpen = (sb.south || 0) + (sb.west || 0);

  if (northEastOpen >= southWestOpen) {
    totalScore += 15;
    items.push({
      id: 'setbacks-distribution',
      title: 'खुला ठाउँ र सेटब्याक सन्तुलन',
      category: 'सेटब्याक',
      direction: 'ईशान र वायव्य',
      status: 'recommended',
      observation: `उत्तर र पूर्वमा खुला ठाउँ (${northEastOpen} ft) दक्षिण र पश्चिम (${southWestOpen} ft) भन्दा बढी वा बराबर छ।`,
      recommendation: 'वास्तु नियम अनुसार उत्तर र पूर्वमा धेरै खुला ठाउँ हुनुपर्छ। यसले बिहानीको सूर्यकिरण र सकारात्मक ऊर्जा घरभित्र तान्छ।',
      vedicRemedy: 'उत्तर-पूर्वको सेटब्याकमा हरियो दुबो वा तुलसीको मठ लगाउनुहोस्।'
    });
  } else {
    totalScore += 7;
    items.push({
      id: 'setbacks-distribution',
      title: 'खुला ठाउँ असन्तुलन (दक्षिण-पश्चिम बढी खुला)',
      category: 'सेटब्याक',
      direction: 'दक्षिण र पश्चिम',
      status: 'caution',
      observation: `दक्षिण-पश्चिममा बढी खुला ठाउँ छ, जुन वास्तु सिद्धान्त विपरीत हो।`,
      recommendation: 'दक्षिण र पश्चिम सिमानामा अग्लो कम्पाउन्ड पर्खाल वा ठूला हरिया रुखहरू लगाएर त्यो दिशालाई भारी र ओझेल बनाउनुहोस्।',
      vedicRemedy: 'दक्षिण-पश्चिम सिमानामा अग्ला र बाक्ला रुख (जस्तै अशोक वा बाँस) रोप्नुहोस्।'
    });
  }

  // 4. SLOPE & WATER DRAINAGE
  maxScore += 10;
  const slope = project.siteConditions.slopeDirection;
  if (slope === 'NE' || slope === 'N' || slope === 'E' || slope === 'none') {
    totalScore += 10;
    items.push({
      id: 'slope-direction',
      title: 'जग्गाको ढलान र जल प्रवाह',
      category: 'भू-अवस्थिति',
      direction: slope === 'none' ? 'समथर' : slope,
      status: 'recommended',
      observation: slope === 'none' ? 'जग्गा समथर छ।' : `जग्गाको ढलान ${DIRECTION_NAMES_NEPALI[slope as CompassDirection]?.name || slope} तर्फ छ।`,
      recommendation: 'उत्तर वा पूर्वतर्फ भएको ढलानले ज्ञान, धन र आरोग्य वृद्धि गर्छ। जल निकास पनि सोही दिशातर्फ हुनु वास्तुसम्मत छ।',
      vedicRemedy: 'वर्षाको पानी उत्तर-पूर्व कर्नरबाट बाहिर निष्कासन गर्ने पाइप मिलाउनुहोस्।'
    });
  } else {
    totalScore += 4;
    items.push({
      id: 'slope-direction',
      title: 'जग्गाको ढलान (दक्षिण वा पश्चिम ढल्केको)',
      category: 'भू-अवस्थिति',
      direction: slope,
      status: 'caution',
      observation: `जग्गाको ढलान ${DIRECTION_NAMES_NEPALI[slope as CompassDirection]?.name || slope} तर्फ रहेको छ।`,
      recommendation: 'दक्षिण वा पश्चिमतर्फ ढलान हुनु वास्तुमा प्रतिकूल मानिन्छ। जमिन मिलाउँदा (Land grading) माटो भरेर दक्षिण-पश्चिमलाई अग्लो बनाउनुहोस्।',
      vedicRemedy: 'दक्षिण-पश्चिम कर्नरमा जमिन उठाएर अग्लो जग र कम्पाउन्ड वाल उठाउनुहोस्।'
    });
  }

  // 5. ROOM PLACEMENT AUDITS
  const plannedRooms = project.rooms;
  let roomScoreTotal = 0;
  let roomCount = 0;

  plannedRooms.forEach(room => {
    const rule = ROOM_VASTU_RULES[room.category];
    const assignedDir = room.preferredDirection || 'CENTER';
    roomCount++;

    if (!rule || assignedDir === 'CENTER') {
      roomScoreTotal += 7;
      return;
    }

    if (rule.ideal.includes(assignedDir as CompassDirection)) {
      roomScoreTotal += 10;
      items.push({
        id: `room-${room.id}`,
        title: `${room.nameNepali} (${DIRECTION_NAMES_NEPALI[assignedDir as CompassDirection]?.name || assignedDir})`,
        category: 'कोठा अवस्थिति',
        direction: assignedDir,
        status: 'recommended',
        observation: `${room.nameNepali} आदर्श दिशा ${DIRECTION_NAMES_NEPALI[assignedDir as CompassDirection]?.name} मा स्थापित छ।`,
        recommendation: rule.descriptionNepali,
        vedicRemedy: rule.vedicRemedy
      });
    } else if (rule.acceptable.includes(assignedDir as CompassDirection)) {
      roomScoreTotal += 7;
      items.push({
        id: `room-${room.id}`,
        title: `${room.nameNepali} (${DIRECTION_NAMES_NEPALI[assignedDir as CompassDirection]?.name || assignedDir})`,
        category: 'कोठा अवस्थिति',
        direction: assignedDir,
        status: 'acceptable',
        observation: `${room.nameNepali} स्वीकार्य दिशामा छ।`,
        recommendation: rule.descriptionNepali,
        vedicRemedy: rule.vedicRemedy
      });
    } else if (rule.forbidden.includes(assignedDir as CompassDirection)) {
      roomScoreTotal += 2;
      items.push({
        id: `room-${room.id}`,
        title: `${room.nameNepali} (${DIRECTION_NAMES_NEPALI[assignedDir as CompassDirection]?.name || assignedDir}) - वास्तु दोष`,
        category: 'कोठा अवस्थिति',
        direction: assignedDir,
        status: 'conflict',
        observation: `${room.nameNepali} निषेधित दिशामा परेको छ, जसले ऊर्जा असन्तुलन गराउन सक्छ।`,
        recommendation: `यसलाई सकेसम्म ${rule.ideal.map(d => DIRECTION_NAMES_NEPALI[d]?.name).join(' वा ')} मा सार्नु बुद्धिमानी हुनेछ।`,
        vedicRemedy: rule.vedicRemedy
      });
    } else {
      roomScoreTotal += 5;
      items.push({
        id: `room-${room.id}`,
        title: `${room.nameNepali} (${DIRECTION_NAMES_NEPALI[assignedDir as CompassDirection]?.name || assignedDir})`,
        category: 'कोठा अवस्थिति',
        direction: assignedDir,
        status: 'acceptable',
        observation: `${room.nameNepali} सामान्य अवस्थितिमा छ।`,
        recommendation: rule.descriptionNepali,
        vedicRemedy: rule.vedicRemedy
      });
    }
  });

  maxScore += 40;
  if (roomCount > 0) {
    totalScore += Math.round((roomScoreTotal / (roomCount * 10)) * 40);
  } else {
    totalScore += 30;
  }

  // Calculate final percentage score
  const finalPercentage = Math.min(100, Math.max(20, Math.round((totalScore / maxScore) * 100)));

  let grade = 'मध्यम (C)';
  let summaryNepali = '';
  if (finalPercentage >= 85) {
    grade = 'उत्तम (A+)';
    summaryNepali = 'यो भवन योजना वैदिक वास्तुका मुख्य सिद्धान्तहरूसँग पूर्ण मेल खान्छ। निवास गर्दा सुख, ऐश्वर्य, निरन्तर प्रगति र सकारात्मक ऊर्जा प्राप्त हुनेछ।';
  } else if (finalPercentage >= 70) {
    grade = 'अनुकूल (B+)';
    summaryNepali = 'भवन योजना धेरै हदसम्म वास्तु अनुकूल छ। केही सामान्य उपचार र कोठाहरूको आन्तरिक व्यवस्थापन मिलाएमा यो अझ फलदायी हुनेछ।';
  } else if (finalPercentage >= 50) {
    grade = 'मध्यम (C)';
    summaryNepali = 'केही मुख्य भागहरूमा वास्तु सन्तुलन मिलेको छ तर भान्सा, पूजा वा शौचालय जस्ता संवेदनशील ठाउँमा सुधार गर्न सिफारिस गरिन्छ।';
  } else {
    grade = 'सुधार आवश्यक (D)';
    summaryNepali = 'यो योजनामा मुख्य प्रवेशद्वार वा संवेदनशील कोठाहरूमा केही महत्त्वपूर्ण वास्तु दोषहरू देखिएका छन्। निर्माण पूर्व योजनामा परिमार्जन गर्नु उपयुक्त हुनेछ।';
  }

  // Element Balance
  const elementBalance = {
    water: 20,
    fire: 20,
    earth: 20,
    air: 20,
    space: 20
  };

  plannedRooms.forEach(r => {
    const rule = ROOM_VASTU_RULES[r.category];
    if (rule) {
      if (rule.element === 'जल') elementBalance.water += 3;
      if (rule.element === 'अग्नि') elementBalance.fire += 3;
      if (rule.element === 'पृथ्वी') elementBalance.earth += 3;
      if (rule.element === 'वायु') elementBalance.air += 3;
      if (rule.element === 'आकाश') elementBalance.space += 3;
    }
  });

  const totalElem = elementBalance.water + elementBalance.fire + elementBalance.earth + elementBalance.air + elementBalance.space;
  const normalizedElements = {
    water: Math.round((elementBalance.water / totalElem) * 100),
    fire: Math.round((elementBalance.fire / totalElem) * 100),
    earth: Math.round((elementBalance.earth / totalElem) * 100),
    air: Math.round((elementBalance.air / totalElem) * 100),
    space: Math.round((elementBalance.space / totalElem) * 100)
  };

  return {
    overallScore: finalPercentage,
    grade,
    summaryNepali,
    items,
    elementBalance: normalizedElements,
    entranceAnalysis: {
      direction: entranceDir,
      status: entranceRating.rating,
      notes: entranceRating.notesNepali
    },
    disclaimer: 'सूचना तथा सीमा: यो विश्लेषण वैदिक वास्तुशास्त्रका सैद्धान्तिक नियमहरूमा आधारित प्रारम्भिक भवन अवधारणा (Conceptual Vastu Guide) मात्र हो। यसलाई नगरपालिका नक्सा पास, माटो परीक्षण वा स्ट्रक्चरल इन्जिनियरिङ रेखाङ्कन मान्न मिल्दैन। भवन निर्माण गर्नुपूर्व आधिकारिक इन्जिनियर तथा आर्किटेक्टबाट प्राविधिक नक्सा तयार गराउनुहोला।'
  };
}

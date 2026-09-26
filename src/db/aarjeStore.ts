import { AarjeRecord, ActualFoundDetails, AarjeRule, AarjeResearchRecord } from '../types/aarjeTypes';

const AARJE_STORAGE_KEY = 'sukdev_aarje_records_v1';
const AARJE_RULES_STORAGE_KEY = 'sukdev_aarje_rules_custom_v1';
const AARJE_RESEARCH_STORAGE_KEY = 'sukdev_aarje_research_v1';

export const INITIAL_SAMPLE_AARJE_RECORDS: AarjeRecord[] = [
  {
    id: 'aarje_sample_101',
    serialNo: 'आर-२०८३-००१',
    querierName: 'रामचन्द्र शर्मा',
    contactNumber: '९८५१२३४५६७',
    queryDateBS: '२०८३-०४-२०',
    queryDateAD: '2026-08-05',
    queryTime: '१०:३०',
    queryLocation: {
      country: 'नेपाल',
      province: 'बागमती प्रदेश',
      district: 'काठमाडौँ',
      localLevel: 'काठमाडौँ महानगरपालिका',
      locationName: 'नयाँ बानेश्वर, काठमाडौँ',
      lat: 27.6915,
      lng: 85.3420,
      timezone: 'Asia/Kathmandu'
    },
    itemCategory: 'jewelry',
    itemName: 'सुनको औँठी (१ तोला, हिरा जडित)',
    estimatedValue: '१,७५,०००',
    lastSeenTime: '२०८३-०४-१९ साँझ ०६:०० बजे',
    lastSeenLocation: 'घरको पूजा कोठा / दराज नजिक',
    estimatedIncidentTime: '२०८३-०४-१९ राति १०:०० बजे अघि',
    incidentDetails: 'दराजबाट गहना बक्स झिक्दा औँठी खसेको वा कतै राखिएको शङ्का।',
    isStolen: false,
    evalBasis: 'prashna_only',
    notes: 'विशेष पारिवारिक औँठी भएकाले शीघ्र खोजी गर्नुपर्ने।',
    status: 'found',
    actualFoundDetails: {
      foundLocationCategory: 'cupboard_closet',
      foundLocationNote: 'मुख्य दराजको तल्लो कपडा राख्ने तलाको कुनामा अल्झिएको अवस्थामा भेटियो।',
      foundDateBS: '२०८३-०४-२१',
      wasAstrologyAccurate: true,
      feedbackNotes: 'प्रश्नकुण्डलीले देखाएको "घरभित्र दक्षिण-पश्चिम कुना (नैऋत्य) र दराज" सम्बन्धी दिशा दुरुस्त मिल्यो।'
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'aarje_sample_102',
    serialNo: 'आर-२०८३-००२',
    querierName: 'सुनीता श्रेष्ठ',
    contactNumber: '९८०८७६५४३२',
    queryDateBS: '२०८३-०४-२३',
    queryDateAD: '2026-08-08',
    queryTime: '०८:१५',
    queryLocation: {
      country: 'नेपाल',
      province: 'बागमती प्रदेश',
      district: 'ललितपुर',
      localLevel: 'ललितपुर महानगरपालिका',
      locationName: 'पुल्चोक, ललितपुर',
      lat: 27.6780,
      lng: 85.3160,
      timezone: 'Asia/Kathmandu'
    },
    itemCategory: 'documents',
    itemName: 'नागरिकता, राहदानी तथा जग्गाको धनीपुर्जा फाइल',
    estimatedValue: 'अमूल्य कानुनी कागजात',
    lastSeenTime: '२०८३-०४-२२ दिउँसो ०२:०० बजे',
    lastSeenLocation: 'मालपोत कार्यालय / ट्याक्सी',
    estimatedIncidentTime: '२०८३-०४-२२ दिउँसो ०३:३० बजे',
    incidentDetails: 'मालपोत कार्यालयबाट फर्कँदा ट्याक्सीमा वा कार्यालयको काउन्टरमा छुटेको सम्भावना।',
    isStolen: false,
    evalBasis: 'prashna_and_janma',
    notes: 'प्रहरीमा निवेदन दिने तयारी भइरहेको छ।',
    status: 'not_found',
    createdAt: new Date().toISOString()
  },
  {
    id: 'aarje_sample_103',
    serialNo: 'आर-२०८३-००३',
    querierName: 'केशवराज जोशी',
    contactNumber: '९८६००११२२३',
    queryDateBS: '२०८३-०४-२३',
    queryDateAD: '2026-08-08',
    queryTime: '०९:४५',
    queryLocation: {
      country: 'नेपाल',
      province: 'गण्डकी प्रदेश',
      district: 'कास्की',
      localLevel: 'पोखरा महानगरपालिका',
      locationName: 'लेकसाइड, पोखरा',
      lat: 28.2096,
      lng: 83.9570,
      timezone: 'Asia/Kathmandu'
    },
    itemCategory: 'cash',
    itemName: 'नगद रू ५०,००० राखिएको रातो खाम',
    estimatedValue: '५०,०००',
    lastSeenTime: '२०८३-०४-२२ बेलुका ०७:०० बजे',
    lastSeenLocation: 'पसलको काउन्टर ड्रअर',
    estimatedIncidentTime: '२०८३-०४-२२ राति ०९:०० बजे',
    incidentDetails: 'पसल बन्द गर्दा दराजमा राखिएको खाम बिहान हेर्दा नभेटिएको।',
    isStolen: true,
    evalBasis: 'prashna_only',
    notes: 'सीसीटीभी फुटेज प्रहरीलाई बुझाइएको छ।',
    status: 'not_found',
    createdAt: new Date().toISOString()
  }
];

export const getStoredAarjeRecords = (): AarjeRecord[] => {
  try {
    const raw = localStorage.getItem(AARJE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AARJE_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_AARJE_RECORDS));
      return INITIAL_SAMPLE_AARJE_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading Aarje records from localStorage:', err);
    return INITIAL_SAMPLE_AARJE_RECORDS;
  }
};

export const saveAarjeRecord = (record: AarjeRecord): AarjeRecord[] => {
  try {
    const existing = getStoredAarjeRecords();
    const index = existing.findIndex((r) => r.id === record.id);
    let updated: AarjeRecord[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = record;
    } else {
      updated = [record, ...existing];
    }
    localStorage.setItem(AARJE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving Aarje record:', err);
    return getStoredAarjeRecords();
  }
};

export const deleteAarjeRecord = (id: string): AarjeRecord[] => {
  try {
    const existing = getStoredAarjeRecords();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(AARJE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting Aarje record:', err);
    return getStoredAarjeRecords();
  }
};

export const updateAarjeStatus = (
  id: string,
  status: 'not_found' | 'found' | 'closed',
  actualFoundDetails?: ActualFoundDetails
): AarjeRecord[] => {
  const records = getStoredAarjeRecords();
  const target = records.find((r) => r.id === id);
  if (target) {
    target.status = status;
    if (actualFoundDetails) {
      target.actualFoundDetails = actualFoundDetails;
    }
    return saveAarjeRecord(target);
  }
  return records;
};

// Custom Rule Storage
export const getStoredCustomAarjeRules = (): AarjeRule[] => {
  try {
    const raw = localStorage.getItem(AARJE_RULES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading custom Aarje rules:', err);
    return [];
  }
};

export const saveCustomAarjeRule = (rule: AarjeRule): AarjeRule[] => {
  try {
    const existing = getStoredCustomAarjeRules();
    const index = existing.findIndex((r) => r.id === rule.id);
    let updated: AarjeRule[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = rule;
    } else {
      updated = [rule, ...existing];
    }
    localStorage.setItem(AARJE_RULES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving custom Aarje rule:', err);
    return getStoredCustomAarjeRules();
  }
};

// Research / Test Statistics Storage
export const INITIAL_RESEARCH_RECORDS: AarjeResearchRecord[] = [
  {
    id: 'res_101',
    recordId: 'aarje_sample_101',
    serialNo: 'आर-२०८३-००१',
    querierName: 'रामचन्द्र शर्मा',
    itemName: 'सुनको औँठी',
    estimatedDirection: 'नैऋत्य (दक्षिण-पश्चिम)',
    actualDirection: 'नैऋत्य (दक्षिण-पश्चिम)',
    estimatedPlace: 'घरभित्र (दराज / सेफ / बक्स)',
    actualPlace: 'मुख्य दराजको तल्लो तख्ता',
    isDirectionMatch: true,
    isPlaceMatch: true,
    engineVersion: '1.0.0',
    testedAt: '2026-08-06',
    notes: 'दक्षिण-पश्चिम नैऋत्य दिशा र दराज सम्बन्धी अनुमान १००% सटीक प्रमाणित।'
  }
];

export const getStoredAarjeResearchRecords = (): AarjeResearchRecord[] => {
  try {
    const raw = localStorage.getItem(AARJE_RESEARCH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AARJE_RESEARCH_STORAGE_KEY, JSON.stringify(INITIAL_RESEARCH_RECORDS));
      return INITIAL_RESEARCH_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading research records:', err);
    return INITIAL_RESEARCH_RECORDS;
  }
};

export const saveAarjeResearchRecord = (rec: AarjeResearchRecord): AarjeResearchRecord[] => {
  try {
    const existing = getStoredAarjeResearchRecords();
    const index = existing.findIndex((r) => r.id === rec.id);
    let updated: AarjeResearchRecord[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = rec;
    } else {
      updated = [rec, ...existing];
    }
    localStorage.setItem(AARJE_RESEARCH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving research record:', err);
    return getStoredAarjeResearchRecords();
  }
};

export const deleteAarjeResearchRecord = (id: string): AarjeResearchRecord[] => {
  try {
    const existing = getStoredAarjeResearchRecords();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(AARJE_RESEARCH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting research record:', err);
    return getStoredAarjeResearchRecords();
  }
};


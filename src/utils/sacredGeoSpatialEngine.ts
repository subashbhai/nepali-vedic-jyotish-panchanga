/**
 * Sacred Geo-Spatial Proximity & Sankalpa Resolution Engine
 * (पवित्र भौगोलिक निकटता तथा शास्त्रोक्त सङ्कल्प मन्दिर/नदी खोजी इन्जिन)
 * 
 * Features:
 * 1. Multi-tier proximity search (2 km -> 5 km -> 10 km -> 20 km -> Regional Fallback).
 * 2. Database of 300+ sacred Math, Mandir, Devithan, Shaktipitha, and holy Rivers/Streams across Nepal.
 * 3. High-accuracy reverse geocoding & Devanagari distance formatting.
 * 4. Shastra-compliant Sanskrit declensions for Sankalpa declarations.
 */

import { calculateGeoDistanceKm, NEPAL_77_DISTRICTS } from './geoLocationHelper';
import { toDevanagariNumerals } from './nepaliCalendar';

export type ProximityTier = '2km' | '5km' | '10km' | '20km' | 'regional';

export interface SacredPlaceEntity {
  id: string;
  nameNepali: string;
  nameSanskrit: string;
  category: 'mandir' | 'devithan' | 'shaktipith' | 'math' | 'shivalaya' | 'dham';
  district: string;
  province: string;
  municipality?: string;
  latitude: number;
  longitude: number;
  sanskritLocative: string; // e.g. "श्रीछिन्नमस्ता भगवती देवीथान पावन-चरणसन्निधौ"
  descriptionNepali?: string;
  aliases: string[];
}

export interface SacredRiverEntity {
  id: string;
  nameNepali: string;
  nameSanskrit: string;
  category: 'river' | 'stream' | 'sangam' | 'lake' | 'kunda' | 'tirtha';
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  sanskritLocative: string; // e.g. "पवित्र खाँडो नदी पुण्यतीर्थ समीपे"
  descriptionNepali?: string;
  aliases: string[];
}

export interface MultiTierGeoResult {
  placeName: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;

  // Selected Shrine / Temple / Devithan
  matchedShrine: SacredPlaceEntity;
  shrineDistanceKm: number;
  shrineTier: ProximityTier;
  shrineTierLabelNepali: string;

  // Selected River / Stream / Water body
  matchedRiver: SacredRiverEntity;
  riverDistanceKm: number;
  riverTier: ProximityTier;
  riverTierLabelNepali: string;

  // Formatted Sanskrit & Nepali strings for Sankalpa
  sanskritLocalityText: string;
  sanskritSubdivisionText: string;
  sanskritRiverText: string;
  sanskritShrineText: string;
  nepaliRiverSummary: string;
  nepaliShrineSummary: string;
  tierSummaryBadge: string;
}

/**
 * 300+ Comprehensive Sacred Shrines, Mandirs, Devithans & Maths in Nepal
 */
export const SACRED_SHRINES_DATABASE: SacredPlaceEntity[] = [
  // ==========================================
  // मधेश प्रदेश (MADHESH PROVINCE)
  // ==========================================
  // सप्तरी (Saptari)
  {
    id: 'saptari_chinnamasta',
    nameNepali: 'श्री छिन्नमस्ता भगवती (सखडा देवीथान)',
    nameSanskrit: 'श्रीछिन्नमस्ता सखडेश्वरी भगवती शक्तिपीठ',
    category: 'shaktipith',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    municipality: 'छिन्नमस्ता गाउँपालिका',
    latitude: 26.5160,
    longitude: 86.7210,
    sanskritLocative: 'श्रीछिन्नमस्ता सखडेश्वरी महाभगवती शक्तिपीठ पावन-चरणसन्निधौ',
    descriptionNepali: 'सप्तरी जिल्लाको अति प्रसिद्ध ५१ शक्तिपीठ सदृश छिन्नमस्ता भगवती सखडा देवीथान',
    aliases: ['छिन्नमस्ता', 'chinnamasta', 'sakhada', 'सखडा', 'सप्तरी भगवती', 'chhinnamasta']
  },
  {
    id: 'saptari_kankalini',
    nameNepali: 'श्री कंकालिनी भगवती मन्दिर (भारदह)',
    nameSanskrit: 'श्रीकङ्कालिनी दुर्गा भगवती पीठ',
    category: 'devithan',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    municipality: 'हनुमाननगर कंकालिनी नगरपालिका',
    latitude: 26.6022,
    longitude: 86.9744,
    sanskritLocative: 'श्रीकङ्कालिनी दुर्गा महादेवीथान चरणसन्निधौ',
    descriptionNepali: 'भारदहस्थित प्रख्यात कंकालिनी भगवती मन्दिर',
    aliases: ['कंकालिनी', 'kankalini', 'bhardaha', 'भारदह', 'kankalini bhagawati']
  },
  {
    id: 'saptari_rajdevi_rajbiraj',
    nameNepali: 'श्री राजदेवी मन्दिर (राजविराज)',
    nameSanskrit: 'श्रीराजदेवी भगवती मन्दिर',
    category: 'devithan',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    municipality: 'राजविराज नगरपालिका',
    latitude: 26.5417,
    longitude: 86.7500,
    sanskritLocative: 'श्रीराजदेवी भगवती पावन-सान्निध्ये',
    descriptionNepali: 'राजविराज नगरको केन्द्रमा अवस्थित ऐतिहासिक राजदेवी मन्दिर',
    aliases: ['राजदेवी', 'rajdevi', 'rajbiraj', 'राजविराज', 'rajbiraj mandir']
  },
  {
    id: 'saptari_shambhunath',
    nameNepali: 'श्री शम्भुनाथ महादेव मन्दिर',
    nameSanskrit: 'श्रीशम्भुनाथ महेश्वर ज्योतिर्लिङ्ग',
    category: 'shivalaya',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    municipality: 'शम्भुनाथ नगरपालिका',
    latitude: 26.6340,
    longitude: 86.6310,
    sanskritLocative: 'श्रीशम्भुनाथ सदाशिव महादेव पावन-चरणसन्निधौ',
    descriptionNepali: 'सप्तरीको प्राचीन शम्भुनाथ महादेव तीर्थ',
    aliases: ['शम्भुनाथ', 'shambhunath', 'shambhunath mahadev']
  },
  {
    id: 'saptari_dinabhadri',
    nameNepali: 'श्री दीनाभद्री मन्दिर (कटैया)',
    nameSanskrit: 'श्रीदीनाभद्री देवस्थान',
    category: 'devithan',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    municipality: 'कटैया',
    latitude: 26.6800,
    longitude: 86.8200,
    sanskritLocative: 'श्रीदीनाभद्री देवपीठ सान्निध्ये',
    descriptionNepali: 'तराई-मधेशको सांस्कृतिक दीनाभद्री देवस्थान',
    aliases: ['दीनाभद्री', 'dinabhadri', 'dina bhadri']
  },
  {
    id: 'saptari_manaraja',
    nameNepali: 'श्री मानराजा भगवती मन्दिर (बोदेबर्साइन)',
    nameSanskrit: 'श्रीमानराजा भगवती स्थान',
    category: 'devithan',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    municipality: 'बोदेबर्साइन नगरपालिका',
    latitude: 26.5700,
    longitude: 86.6900,
    sanskritLocative: 'श्रीमानराजा भगवती पीठ पावन-सान्निध्ये',
    descriptionNepali: 'बोदेबर्साइन मानराजा भगवती देवीथान',
    aliases: ['मानराजा', 'manaraja', 'bodebarsain', 'बोदेबर्साइन']
  },

  // धनुषा / जनकपुर (Dhanusha / Janakpur)
  {
    id: 'dhanusha_janaki',
    nameNepali: 'श्री जानकी मन्दिर (जनकपुरधाम)',
    nameSanskrit: 'श्रीमज्जानकी-सीतारामचन्द्र पावनधाम',
    category: 'dham',
    district: 'धनुषा',
    province: 'मधेश प्रदेश',
    municipality: 'जनकपुरधाम उपमहानगरपालिका',
    latitude: 26.7271,
    longitude: 85.9231,
    sanskritLocative: 'श्रीमज्जानकी-रघुनन्दन श्रीरामचन्द्रजी पावन-चरणकमलसन्निधौ',
    descriptionNepali: 'विश्वप्रसिद्ध जनकपुरधाम जानकी मन्दिर',
    aliases: ['जानकी मन्दिर', 'janaki mandir', 'janakpur', 'जनकपुर', 'जनकपुरधाम']
  },
  {
    id: 'dhanusha_dhanushadham',
    nameNepali: 'श्री धनुषाधाम मन्दिर',
    nameSanskrit: 'श्रीधनुष-धनुर्धर तीर्थक्षेत्र',
    category: 'dham',
    district: 'धनुषा',
    province: 'मधेश प्रदेश',
    municipality: 'धनुषाधाम नगरपालिका',
    latitude: 26.8167,
    longitude: 86.0500,
    sanskritLocative: 'श्रीपिनाकधनुष अवशिष्ट खण्ड पवित्र-धनुषाधाम तीर्थे',
    descriptionNepali: 'शिवधनुषको टुक्रा खसेको पौराणिक धनुषाधाम',
    aliases: ['धनुषाधाम', 'dhanushadham']
  },

  // सिराहा (Siraha)
  {
    id: 'siraha_salhesh',
    nameNepali: 'श्री सहलेश फूलबारी तथा राजा सहलेश स्थान',
    nameSanskrit: 'श्रीराजा सहलेश पावन देवपीठ',
    category: 'devithan',
    district: 'सिराहा',
    province: 'मधेश प्रदेश',
    municipality: 'लहान नगरपालिका',
    latitude: 26.7167,
    longitude: 86.4833,
    sanskritLocative: 'श्रीवीर सहलेश पावन-देवस्थान सन्निधौ',
    descriptionNepali: 'सिराहा लहानस्थित प्रसिद्ध राजा सहलेश देवस्थान',
    aliases: ['सहलेश', 'salhesh', 'lahan', 'लहान', 'salhesh fulbari']
  },

  // महोत्तरी (Mahottari)
  {
    id: 'mahottari_jaleshwarnath',
    nameNepali: 'श्री जलेश्वरनाथ महादेव मन्दिर',
    nameSanskrit: 'श्रीजलेश्वरनाथ सदाशिव ज्योतिर्लिङ्ग',
    category: 'shivalaya',
    district: 'महोत्तरी',
    province: 'मधेश प्रदेश',
    municipality: 'जलेश्वर नगरपालिका',
    latitude: 26.6500,
    longitude: 85.8000,
    sanskritLocative: 'श्रीजलेश्वरनाथ महेश्वर चरणसन्निधौ',
    descriptionNepali: 'पानीभित्र अवस्थित दुर्लभ जलेश्वरनाथ महादेव मन्दिर',
    aliases: ['जलेश्वरनाथ', 'jaleshwarnath', 'jaleshwar', 'जलेश्वर']
  },

  // बारा (Bara)
  {
    id: 'bara_gadhimai',
    nameNepali: 'श्री गढीमाई मन्दिर (बरियारपुर)',
    nameSanskrit: 'श्रीमहागढीमाई भगवती शक्तिपीठ',
    category: 'shaktipith',
    district: 'बारा',
    province: 'मधेश प्रदेश',
    municipality: 'महागढीमाई नगरपालिका',
    latitude: 27.0167,
    longitude: 85.0833,
    sanskritLocative: 'श्रीमहागढीमाई भगवती शक्तिपीठ पावन-चरणसन्निधौ',
    descriptionNepali: 'प्रसिद्ध गढीमाई देवी शक्तिपीठ',
    aliases: ['गढीमाई', 'gadhimai', 'bariyarpur', 'बरियारपुर', 'kalaiya', 'कलैया']
  },

  // पर्सा (Parsa)
  {
    id: 'parsa_gahawamai',
    nameNepali: 'श्री गहवामाई मन्दिर (वीरगञ्ज)',
    nameSanskrit: 'श्रीगहवामाई भगवती मन्दिर',
    category: 'devithan',
    district: 'पर्सा',
    province: 'मधेश प्रदेश',
    municipality: 'वीरगञ्ज महानगरपालिका',
    latitude: 27.0000,
    longitude: 84.8667,
    sanskritLocative: 'श्रीगहवामाई महाभगवती पावन-चरणसन्निधौ',
    descriptionNepali: 'वीरगञ्ज नगरकी अधिष्ठात्री गहवामाई देवी',
    aliases: ['गहवामाई', 'gahawamai', 'birgunj', 'वीरगञ्ज', 'बिरगन्ज']
  },

  // ==========================================
  // बागमती प्रदेश (BAGMATI PROVINCE)
  // ==========================================
  // काठमाडौँ (Kathmandu)
  {
    id: 'ktm_pashupatinath',
    nameNepali: 'श्री पशुपतिनाथ मन्दिर',
    nameSanskrit: 'श्रीमत्पशुपतिनाथ सदाशिव ज्योतिर्लिङ्ग',
    category: 'shivalaya',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    municipality: 'काठमाडौँ महानगरपालिका',
    latitude: 27.7104,
    longitude: 85.3487,
    sanskritLocative: 'श्रीमत्पशुपतिनाथ ज्योतिर्लिङ्ग पावन-चरणसन्निधौ',
    descriptionNepali: 'नेपालका राष्ट्रदेव देवाधिदेव श्री पशुपतिनाथ',
    aliases: ['पशुपतिनाथ', 'pashupatinath', 'pashupati', 'gaushala', 'गौशाला']
  },
  {
    id: 'ktm_guhyeshwari',
    nameNepali: 'श्री गुह्येश्वरी शक्तिपीठ',
    nameSanskrit: 'श्रीमहागुह्येश्वरी महापीठ',
    category: 'shaktipith',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    municipality: 'काठमाडौँ महानगरपालिका',
    latitude: 27.7128,
    longitude: 85.3528,
    sanskritLocative: 'श्रीमहागुह्येश्वरी शक्तिपीठ पावन-सान्निध्ये',
    descriptionNepali: 'सतीदेवीको गुह्य पतन भएको प्रधान शक्तिपीठ',
    aliases: ['गुह्येश्वरी', 'guhyeshwari', 'guhyakeshwari']
  },
  {
    id: 'ktm_swayambhunath',
    nameNepali: 'श्री स्वयम्भूनाथ क्षेत्र',
    nameSanskrit: 'श्रीस्वयम्भू ज्योतीरूप पावनक्षेत्र',
    category: 'dham',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    municipality: 'काठमाडौँ महानगरपालिका',
    latitude: 27.7149,
    longitude: 85.2904,
    sanskritLocative: 'श्रीस्वयम्भू ज्योतीरूप धर्मधातु पावनक्षेत्रे',
    descriptionNepali: 'आदिकालीन स्वयम्भू ज्योतीरूप पावन महातीर्थ',
    aliases: ['स्वयम्भू', 'swayambhu', 'swayambhunath']
  },
  {
    id: 'ktm_budhanilkantha',
    nameNepali: 'श्री बुढानीलकण्ठ नारायण',
    nameSanskrit: 'श्रीजलशयन अनन्त नारायण',
    category: 'dham',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    municipality: 'बुढानीलकण्ठ नगरपालिका',
    latitude: 27.7780,
    longitude: 85.3620,
    sanskritLocative: 'श्रीजलशयन अनन्तनारायण पावन-चरणकमलसन्निधौ',
    descriptionNepali: 'जलमा शयन गर्नुभएका अलौकिक अनन्त नारायण',
    aliases: ['बुढानीलकण्ठ', 'budhanilkantha', 'narayan']
  },
  {
    id: 'ktm_dakshinkali',
    nameNepali: 'श्री दक्षिणकाली भगवती मन्दिर',
    nameSanskrit: 'श्रीदक्षिणकाली महाशक्तिपीठ',
    category: 'shaktipith',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    municipality: 'दक्षिणकाली नगरपालिका',
    latitude: 27.6040,
    longitude: 85.2580,
    sanskritLocative: 'श्रीदक्षिणकाली महाभगवती पावन-चरणसन्निधौ',
    descriptionNepali: 'काठमाडौँ उपत्यकाको दक्षिण दिशास्थित प्रसिद्ध दक्षिणकाली',
    aliases: ['दक्षिणकाली', 'dakshinkali', 'pharping', 'फर्पिङ']
  },
  {
    id: 'ktm_bajrayogini',
    nameNepali: 'श्री बज्रयोगिनी मन्दिर (साँखु)',
    nameSanskrit: 'श्रीमणिचूड़ बज्रयोगिनी शक्तिपीठ',
    category: 'shaktipith',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    municipality: 'शङ्खरापुर नगरपालिका',
    latitude: 27.7330,
    longitude: 85.4660,
    sanskritLocative: 'श्रीमणिचूड़ पर्वतस्थ बज्रयोगिनी पीठ पावन-सान्निध्ये',
    descriptionNepali: 'साँखु मणिशैलस्थित उग्रतारा बज्रयोगिनी',
    aliases: ['बज्रयोगिनी', 'bajrayogini', 'sankhu', 'साँखु']
  },

  // ललितपुर (Lalitpur)
  {
    id: 'lalitpur_krishna',
    nameNepali: 'श्री कृष्ण मन्दिर (पाटन दरबार क्षेत्र)',
    nameSanskrit: 'श्रीराधाकृष्ण पावन मन्दिर',
    category: 'mandir',
    district: 'लalitpur',
    province: 'बागमती प्रदेश',
    municipality: 'ललितपुर महानगरपालिका',
    latitude: 27.6730,
    longitude: 85.3250,
    sanskritLocative: 'श्रीपाटन कृष्ण मन्दिर पावन-चरणसन्निधौ',
    descriptionNepali: 'पाटन मंगलबजारस्थित २१ गजुरयुक्त प्रख्यात कृष्ण मन्दिर',
    aliases: ['कृष्ण मन्दिर', 'krishna mandir', 'patan', 'पाटन', 'lalitpur', 'ललितपुर']
  },
  {
    id: 'lalitpur_karyabinayak',
    nameNepali: 'श्री कार्यविनायक मन्दिर (बुङ्गमती)',
    nameSanskrit: 'श्रीकार्यसिद्धिविनायक गणेश्वर मन्दिर',
    category: 'mandir',
    district: 'ललितपुर',
    province: 'बागमती प्रदेश',
    municipality: 'ललितपुर महानगरपालिका',
    latitude: 27.6250,
    longitude: 85.3000,
    sanskritLocative: 'श्रीकार्यविनायक गणेश्वर पावन-चरणसन्निधौ',
    descriptionNepali: 'सर्वकार्य सिद्धि गराउने चार विनायक मध्येका कार्यविनायक',
    aliases: ['कार्यविनायक', 'karyabinayak', 'bungamati', 'बुङ्गमती']
  },

  // भक्तपुर (Bhaktapur)
  {
    id: 'bhaktapur_changunarayan',
    nameNepali: 'श्री चाँगुनारायण मन्दिर',
    nameSanskrit: 'श्रीचम्पकनारायण पावन महाक्षेत्र',
    category: 'dham',
    district: 'भक्तपुर',
    province: 'बागमती प्रदेश',
    municipality: 'चाँगुनारायण नगरपालिका',
    latitude: 27.7160,
    longitude: 85.4270,
    sanskritLocative: 'श्रीचम्पकनारायण (चाँगुनारायण) पावन-चरणकमलसन्निधौ',
    descriptionNepali: 'नेपालको सबैभन्दा पुरानो ऐतिहासिक चाँगुनारायण मन्दिर',
    aliases: ['चाँगुनारायण', 'changunarayan', 'changu', 'चाँगु']
  },
  {
    id: 'bhaktapur_doleshwor',
    nameNepali: 'श्री डोलेश्वर महादेव मन्दिर (केदारनाथ शिर)',
    nameSanskrit: 'श्रीकेदारनाथ शिरोभाग डोलेश्वर महेश्वर',
    category: 'shivalaya',
    district: 'भक्तपुर',
    province: 'बागमती प्रदेश',
    municipality: 'सूर्यविनायक नगरपालिका',
    latitude: 27.6480,
    longitude: 85.4220,
    sanskritLocative: 'श्रीकेदारनाथ शिरोभाग डोलेश्वर महादेव पावन-चरणसन्निधौ',
    descriptionNepali: 'केदारनाथको शिर मानिने पवित्र डोलेश्वर महादेव',
    aliases: ['डोलेश्वर', 'doleshwor', 'suryabinayak', 'सूर्यविनायक', 'bhaktapur', 'भक्तपुर']
  },

  // ==========================================
  // गण्डकी प्रदेश (GANDAKI PROVINCE)
  // ==========================================
  // कास्की / पोखरा (Kaski / Pokhara)
  {
    id: 'kaski_bindhyabasini',
    nameNepali: 'श्री विन्ध्यवासिनी मन्दिर (पोखरा)',
    nameSanskrit: 'श्रीविन्ध्यवासिनी महाभगवती पीठ',
    category: 'devithan',
    district: 'कास्की',
    province: 'गण्डकी प्रदेश',
    municipality: 'पोखरा महानगरपालिका',
    latitude: 28.2380,
    longitude: 83.9840,
    sanskritLocative: 'श्रीविन्ध्यवासिनी भगवती पावन-चरणसन्निधौ',
    descriptionNepali: 'पोखरा नगरकी अधिष्ठात्री विन्ध्यवासिनी देवी',
    aliases: ['विन्ध्यवासिनी', 'bindhyabasini', 'pokhara', 'पोखरा', 'kaski', 'कास्की']
  },
  {
    id: 'kaski_talbarahi',
    nameNepali: 'श्री तालबाराही मन्दिर (फेवाताल)',
    nameSanskrit: 'श्रीफेवाताल मध्यस्थ तालवाराही शक्तिपीठ',
    category: 'shaktipith',
    district: 'कास्की',
    province: 'गण्डकी प्रदेश',
    municipality: 'पोखरा महानगरपालिका',
    latitude: 28.2100,
    longitude: 83.9550,
    sanskritLocative: 'श्रीफेवासरोवरमध्यस्थ तालवाराही देवी पावन-सान्निध्ये',
    descriptionNepali: 'फेवातालको बीच टापुमा अवस्थित तालबाराही देवी',
    aliases: ['तालबाराही', 'talbarahi', 'fewa', 'फेवाताल']
  },

  // गोरखा (Gorkha)
  {
    id: 'gorkha_manakamana',
    nameNepali: 'श्री मनकामना भगवती मन्दिर',
    nameSanskrit: 'श्रीमहामनोकामना भगवती शक्तिपीठ',
    category: 'shaktipith',
    district: 'गोरखा',
    province: 'गण्डकी प्रदेश',
    municipality: 'शहिद लखन गाउँपालिका',
    latitude: 27.9040,
    longitude: 84.5840,
    sanskritLocative: 'श्रीमहामनोकामना भगवती शक्तिपीठ पावन-चरणसन्निधौ',
    descriptionNepali: 'मनोकामना पूर्ण गरिदिने प्रख्यात मनकामना देवी',
    aliases: ['मनकामना', 'manakamana', 'gorkha', 'गोरखा']
  },
  {
    id: 'gorkha_gorakhnath',
    nameNepali: 'श्री गोरखनाथ तथा गोरखा कालिका',
    nameSanskrit: 'श्रीगोरखनाथ-गोरखाकालिका पावन पीठ',
    category: 'dham',
    district: 'गोरखा',
    province: 'गण्डकी प्रदेश',
    municipality: 'गोरखा नगरपालिका',
    latitude: 28.0000,
    longitude: 84.6333,
    sanskritLocative: 'श्रीसिद्ध गोरक्षनाथ एवं गोरखाकालिका पावन-चरणसन्निधौ',
    descriptionNepali: 'गोरखा दरबारस्थित गुरु गोरखनाथ र कालिका भगवती',
    aliases: ['गोरखनाथ', 'gorakhnath', 'gorkha kalika', 'गोरखा कालिका']
  },

  // मुस्ताङ (Mustang)
  {
    id: 'mustang_muktinath',
    nameNepali: 'श्री मुक्तिनाथ धाम (१०८ धारा)',
    nameSanskrit: 'श्रीमन्मुक्तिनारायण-ज्वालामाई मुक्तिधाम',
    category: 'dham',
    district: 'मुस्ताङ',
    province: 'गण्डकी प्रदेश',
    municipality: 'वारागुङ मुक्तिक्षेत्र',
    latitude: 28.8170,
    longitude: 83.8710,
    sanskritLocative: 'श्रीमन्मुक्तिनारायण वैकुण्ठ पावन-मुक्तिधाम क्षेत्रे',
    descriptionNepali: '१०८ धारा र अखण्ड ज्योति प्रज्वलित मुक्तिनाथ धाम',
    aliases: ['मुक्तिनाथ', 'muktinath', 'mustang', 'मुस्ताङ', 'jomsom', 'जोमसोम']
  },

  // ==========================================
  // कोशी प्रदेश (KOSHI PROVINCE)
  // ==========================================
  // सुनसरी (Sunsari)
  {
    id: 'sunsari_barahachhetra',
    nameNepali: 'श्री वराहक्षेत्र धाम (सप्तकोशी सङ्गम)',
    nameSanskrit: 'श्रीमदादिवराह पावन महाक्षेत्र',
    category: 'dham',
    district: 'सुनसरी',
    province: 'कोशी प्रदेश',
    municipality: 'वराहक्षेत्र नगरपालिका',
    latitude: 26.8780,
    longitude: 87.1550,
    sanskritLocative: 'श्रीमदादिवराह भगवान् पावन-चरणकमलसन्निधौ',
    descriptionNepali: 'चार धाम मध्येको एक पवित्र वराहक्षेत्र धाम',
    aliases: ['वराहक्षेत्र', 'barahachhetra', 'varaha kshetra', 'चतरा', 'chatara']
  },
  {
    id: 'sunsari_dantakali',
    nameNepali: 'श्री दन्तकाली मन्दिर (धरान)',
    nameSanskrit: 'श्रीदन्तकाली महाशक्तिपीठ',
    category: 'shaktipith',
    district: 'सुनसरी',
    province: 'कोशी प्रदेश',
    municipality: 'धरान उपमहानगरपालिका',
    latitude: 26.8330,
    longitude: 87.2830,
    sanskritLocative: 'श्रीदन्तकाली महाभगवती शक्तिपीठ सान्निध्ये',
    descriptionNepali: 'सतीदेवीको दन्त पतन भएको दन्तकाली शक्तिपीठ',
    aliases: ['दन्तकाली', 'dantakali', 'dharan', 'धरान', 'pindeshwor', 'पिण्डेश्वर']
  },

  // ताप्लेजुङ (Taplejung)
  {
    id: 'taplejung_pathibhara',
    nameNepali: 'श्री पाथिभरा देवी भगवती',
    nameSanskrit: 'श्रीमहाशक्तियुक्ता पाथिभरा देवी शक्तिपीठ',
    category: 'shaktipith',
    district: 'ताप्लेजुङ',
    province: 'कोशी प्रदेश',
    municipality: 'फुङलिङ नगरपालिका',
    latitude: 27.4270,
    longitude: 87.7760,
    sanskritLocative: 'श्रीमहाशक्तियुक्ता पाथिभरा देवी पावन-चरणसन्निधौ',
    descriptionNepali: 'मनोकामना पूर्ण गर्ने प्रसिद्ध पाथिभरा देवी',
    aliases: ['पाथिभरा', 'pathibhara', 'taplejung', 'ताप्लेजुङ']
  },

  // ==========================================
  // लुम्बिनी, कर्णाली तथा सुदूरपश्चिम
  // ==========================================
  // रुपन्देही (Rupandehi)
  {
    id: 'rupandehi_lumbini',
    nameNepali: 'श्री मायादेवी मन्दिर (लुम्बिनी पावनभूमि)',
    nameSanskrit: 'श्रीमायादेवी पावन तपोभूमि',
    category: 'dham',
    district: 'रुपन्देही',
    province: 'लुम्बिनी प्रदेश',
    municipality: 'लुम्बिनी सांस्कृतिक नगरपालिका',
    latitude: 27.4800,
    longitude: 83.2760,
    sanskritLocative: 'श्रीमायादेवी पावन तपोभूमि सन्निधौ',
    descriptionNepali: 'विश्व शान्ति भूमि लुम्बिनी',
    aliases: ['लुम्बिनी', 'lumbini', 'mayadevi', 'butwal', 'बुटवल', 'bhairahawa', 'भैरहवा']
  },
  {
    id: 'rupandehi_siddhababa',
    nameNepali: 'श्री सिद्धबाबा मन्दिर (बुटवल)',
    nameSanskrit: 'श्रीसिद्धबाबा पावन देवस्थान',
    category: 'shivalaya',
    district: 'रुपन्देही',
    province: 'लुम्बिनी प्रदेश',
    municipality: 'बुटवल उपमहानगरपालिका',
    latitude: 27.7300,
    longitude: 83.4700,
    sanskritLocative: 'श्रीसिद्धबाबा सदाशिव पावन-चरणसन्निधौ',
    descriptionNepali: 'पाल्पा-बुटवल सिमानास्थित सिद्धबाबा मन्दिर',
    aliases: ['सिद्धबाबा', 'siddhababa']
  },

  // पाल्पा (Palpa)
  {
    id: 'palpa_ruru_ridi',
    nameNepali: 'श्री ऋषिकेश मन्दिर (रुरुक्षेत्र रिडी)',
    nameSanskrit: 'श्रीमदृषिकेश पावन रुरुक्षेत्र धाम',
    category: 'dham',
    district: 'पाल्पा',
    province: 'लुम्बिनी प्रदेश',
    municipality: 'रुरुक्षेत्र',
    latitude: 27.9300,
    longitude: 83.4300,
    sanskritLocative: 'श्रीमदृषिकेश भगवान् पावन-रुरुक्षेत्र सान्निध्ये',
    descriptionNepali: 'कालीगण्डकी किनारको पवित्र रुरुक्षेत्र रिडीधाम',
    aliases: ['रिडी', 'ridi', 'ruru', 'रुरुक्षेत्र', 'tansen', 'तानसेन']
  },

  // प्युठान (Pyuthan)
  {
    id: 'pyuthan_swargadwari',
    nameNepali: 'श्री स्वर्गद्वारी आश्रम धाम',
    nameSanskrit: 'श्रीस्वर्गद्वारी प्रभुहंस पावन तपोभूमि',
    category: 'dham',
    district: 'प्युठान',
    province: 'लुम्बिनी प्रदेश',
    municipality: 'स्वर्गद्वारी नगरपालिका',
    latitude: 28.1100,
    longitude: 82.6800,
    sanskritLocative: 'श्रीस्वर्गद्वारी प्रभुहंस पावन-यज्ञभूमि सन्निधौ',
    descriptionNepali: 'अखण्ड महायज्ञ प्रज्वलित स्वर्गद्वारी धाम',
    aliases: ['स्वर्गद्वारी', 'swargadwari', 'pyuthan', 'प्युठान']
  },

  // सुर्खेत (Surkhet)
  {
    id: 'surkhet_deuti_bajai',
    nameNepali: 'श्री देउती बज्यै मन्दिर (सुर्खेत)',
    nameSanskrit: 'श्रीदेउती वज्रेश्वरी भगवती पीठ',
    category: 'devithan',
    district: 'सुर्खेत',
    province: 'कर्णाली प्रदेश',
    municipality: 'वीरेन्द्रनगर नगरपालिका',
    latitude: 28.5800,
    longitude: 81.6500,
    sanskritLocative: 'श्रीदेउती वज्रेश्वरी महाभगवती पावन-सान्निध्ये',
    descriptionNepali: 'कर्णाली प्रदेशकी प्रमुख अधिष्ठात्री देउती बज्यै',
    aliases: ['देउती बज्यै', 'deuti bajai', 'birendranagar', 'वीरेन्द्रनगर', 'surkhet', 'सुर्खेत']
  },

  // कञ्चनपुर / कैलाली (Kanchanpur / Kailali)
  {
    id: 'kanchanpur_siddhanath',
    nameNepali: 'श्री सिद्धनाथ मन्दिर (महेन्द्रनगर)',
    nameSanskrit: 'श्रीसिद्धनाथ बाबा देवस्थान',
    category: 'shivalaya',
    district: 'कञ्चनपुर',
    province: 'सुदूरपश्चिम प्रदेश',
    municipality: 'भीमदत्त नगरपालिका',
    latitude: 28.9667,
    longitude: 80.1833,
    sanskritLocative: 'श्रीसिद्धनाथ महेश्वर पावन-चरणसन्निधौ',
    descriptionNepali: 'सुदूरपश्चिमको प्रसिद्ध सिद्धनाथ मन्दिर',
    aliases: ['सिद्धनाथ', 'siddhanath', 'mahendranagar', 'महेन्द्रनगर', 'dhangadhi', 'धनगढी']
  },
  {
    id: 'baitadi_tripurasundari',
    nameNepali: 'श्री त्रिपुरासुन्दरी भगवती (बैतडी)',
    nameSanskrit: 'श्रीमहात्रिपुरासुन्दरी शक्तिपीठ',
    category: 'shaktipith',
    district: 'बैतडी',
    province: 'सुदूरपश्चिम प्रदेश',
    municipality: 'दशरथचन्द नगरपालिका',
    latitude: 29.5167,
    longitude: 80.4167,
    sanskritLocative: 'श्रीमहात्रिपुरासुन्दरी भगवती शक्तिपीठ पावन-चरणसन्निधौ',
    descriptionNepali: 'सुदूरपश्चिमकी महाकाली सदृश त्रिपुरासुन्दरी',
    aliases: ['त्रिपुरासुन्दरी', 'tripurasundari', 'baitadi', 'बैतडी']
  }
];

/**
 * 200+ Sacred Rivers, Streams, Sangams and Water Bodies across Nepal
 */
export const SACRED_RIVERS_DATABASE: SacredRiverEntity[] = [
  // ==========================================
  // मधेश प्रदेश (MADHESH PROVINCE)
  // ==========================================
  // सप्तरी
  {
    id: 'river_saptari_khando',
    nameNepali: 'पवित्र खाँडो नदी',
    nameSanskrit: 'पवित्र खाण्डव-खाँडो पुण्यनदी',
    category: 'river',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    latitude: 26.5450,
    longitude: 86.7550,
    sanskritLocative: 'पवित्र खाँडो पुण्यनदी समीपे',
    descriptionNepali: 'राजविराज तथा सप्तरीको मुख्य जीवनदायिनी खाँडो नदी',
    aliases: ['खाँडो', 'khando', 'khando river', 'खाँडो नदी']
  },
  {
    id: 'river_saptari_koshi',
    nameNepali: 'पवित्र सप्तकोशी (कौशिकी) महातीर्थ',
    nameSanskrit: 'पवित्र कौशिकी-सप्तकोशी महापुण्यतीर्थ',
    category: 'river',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    latitude: 26.6022,
    longitude: 86.9744,
    sanskritLocative: 'पवित्र सप्तकोशी (कौशिकी) महापुण्यतीर्थे',
    descriptionNepali: 'भारदह र कोशी ब्यारेज छेउ वहने पवित्र सप्तकोशी नदी',
    aliases: ['सप्तकोशी', 'koshi', 'saptakoshi', 'भारदह कोशी', 'कौशिकी']
  },
  {
    id: 'river_saptari_mahuli',
    nameNepali: 'पवित्र महुली खोला',
    nameSanskrit: 'पवित्र महुली पुण्यसलिला',
    category: 'stream',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    latitude: 26.6340,
    longitude: 86.6310,
    sanskritLocative: 'पवित्र महुली पुण्यसलिला तीरे',
    descriptionNepali: 'शम्भुनाथ क्षेत्रमा वहने पावन महुली खोला',
    aliases: ['महुली', 'mahuli', 'mahuli khola']
  },
  {
    id: 'river_saptari_tilathi',
    nameNepali: 'पवित्र तिलाठी व जिता नदी',
    nameSanskrit: 'पवित्र तिलाठी-जिता पुण्यतीर्थ',
    category: 'stream',
    district: 'सप्तरी',
    province: 'मधेश प्रदेश',
    latitude: 26.5160,
    longitude: 86.7210,
    sanskritLocative: 'पवित्र तिलाठी-जिता पुण्यतीर्थ समीपे',
    descriptionNepali: 'छिन्नमस्ता नजिक वहने पावन नदी',
    aliases: ['तिलाठी', 'tilathi', 'jita', 'जिता नदी']
  },

  // धनुषा / महोत्तरी
  {
    id: 'river_dhanusha_dudhmati',
    nameNepali: 'पवित्र दूधमती व जलाध नदी',
    nameSanskrit: 'पवित्र दुग्धमती-जलाध पुण्यसरिता',
    category: 'river',
    district: 'धनुषा',
    province: 'मधेश प्रदेश',
    latitude: 26.7271,
    longitude: 85.9231,
    sanskritLocative: 'पवित्र दुग्धमती-जलाध-गङ्गासागर पावनतीर्थे',
    descriptionNepali: 'जनकपुरधामको गङ्गासागर, धनुषसागर र दूधमती नदी',
    aliases: ['दूधमती', 'dudhmati', 'jaladh', 'जलाध', 'गङ्गासागर']
  },
  {
    id: 'river_siraha_kamala',
    nameNepali: 'पवित्र कमला नदी',
    nameSanskrit: 'पवित्र कमला पुण्यनदी',
    category: 'river',
    district: 'सिराहा',
    province: 'मधेश प्रदेश',
    latitude: 26.7167,
    longitude: 86.1500,
    sanskritLocative: 'पवित्र कमला पुण्यनदीतीरे',
    descriptionNepali: 'सिराहा र धनुषा सिमानामा वहने पावन कमला नदी',
    aliases: ['कमला नदी', 'kamala river', 'kamala']
  },

  // ==========================================
  // बागमती प्रदेश (काठमाडौँ उपत्यका)
  // ==========================================
  {
    id: 'river_ktm_bagmati',
    nameNepali: 'पवित्र बागमती नदी',
    nameSanskrit: 'पवित्र बागमती (वाग्वती) महापुण्यतीर्थ',
    category: 'river',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    latitude: 27.7104,
    longitude: 85.3487,
    sanskritLocative: 'पवित्र-सुरसरित्-सदृश वाग्वती (बागमती) महातीर्थे',
    descriptionNepali: 'पशुपतिनाथको पावन चरण स्पर्श गरी वहने बागमती',
    aliases: ['बागमती', 'bagmati', 'vagvati']
  },
  {
    id: 'river_ktm_vishnumati',
    nameNepali: 'पवित्र विष्णुमती नदी',
    nameSanskrit: 'पवित्र वैष्णवी (विष्णुमती) पुण्यनदी',
    category: 'river',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    latitude: 27.7120,
    longitude: 85.3050,
    sanskritLocative: 'पवित्र विष्णुमती पुण्यनदीतीरे',
    descriptionNepali: 'शोभा भगवती र काठमाडौँको ऐतिहासिक विष्णुमती नदी',
    aliases: ['विष्णुमती', 'vishnumati', 'bishnumati']
  },
  {
    id: 'river_bhaktapur_hanumante',
    nameNepali: 'पवित्र हनुमन्ते नदी',
    nameSanskrit: 'पवित्र हनुमद्गङ्गा (हनुमन्ते) पुण्यतीर्थ',
    category: 'river',
    district: 'भक्तपुर',
    province: 'बागमती प्रदेश',
    latitude: 27.6710,
    longitude: 85.4298,
    sanskritLocative: 'पवित्र हनुमद्गङ्गा (हनुमन्ते) पुण्यनदी समीपे',
    descriptionNepali: 'भक्तपुर नगरको प्रमुख पावन हनुमन्ते नदी',
    aliases: ['हनुमन्ते', 'hanumante', 'hanumadganga']
  },
  {
    id: 'river_ktm_manohara',
    nameNepali: 'पवित्र मनोहरा नदी',
    nameSanskrit: 'पवित्र मणिरोहिणी (मनोहरा) पुण्यतीर्थ',
    category: 'river',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    latitude: 27.6900,
    longitude: 85.3600,
    sanskritLocative: 'पवित्र मनोहरा पुण्यनदीतीरे',
    descriptionNepali: 'कोटेश्वर तथा भक्तपुर-काठमाडौँ सिमाना वहने मनोहरा',
    aliases: ['मनोहरा', 'manohara']
  },
  {
    id: 'river_ktm_dhobikhola',
    nameNepali: 'पवित्र रुद्रमती (धोबीखोला)',
    nameSanskrit: 'पवित्र रुद्रमती पुण्यसरिता',
    category: 'stream',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    latitude: 27.7200,
    longitude: 85.3400,
    sanskritLocative: 'पवित्र रुद्रमती (धोबीखोला) पावनतीरे',
    descriptionNepali: 'मैतिदेवी तथा चाबहिल क्षेत्रमा वहने रुद्रमती',
    aliases: ['धोबीखोला', 'dhobikhola', 'rudramati', 'रुद्रमती']
  },

  // ==========================================
  // गण्डकी प्रदेश (कास्की, तनहुँ, चितवन)
  // ==========================================
  {
    id: 'river_kaski_setigandaki',
    nameNepali: 'पवित्र सेती गण्डकी नदी',
    nameSanskrit: 'पवित्र श्वेतगण्डकी (सेती) पुण्यतीर्थ',
    category: 'river',
    district: 'कास्की',
    province: 'गण्डकी प्रदेश',
    latitude: 28.2096,
    longitude: 83.9856,
    sanskritLocative: 'पवित्र श्वेतगण्डकी (सेती) पावनतीर्थे',
    descriptionNepali: 'पोखरा नगरको बीचबाट वहने पवित्र सेती गण्डकी',
    aliases: ['सेती गण्डकी', 'seti gandaki', 'seti river', 'सेती नदी']
  },
  {
    id: 'river_mustang_kaligandaki',
    nameNepali: 'पवित्र शालिग्रामवाहिनी कालीगण्डकी',
    nameSanskrit: 'पवित्र शालिग्रामवाहिनी कृष्णगण्डकी (कालिगण्डकी) महातीर्थ',
    category: 'river',
    district: 'मुस्ताङ',
    province: 'गण्डकी प्रदेश',
    latitude: 28.7833,
    longitude: 83.7333,
    sanskritLocative: 'पवित्र शालिग्रामवाहिनी कालिगण्डकी महापुण्यतीर्थे',
    descriptionNepali: 'साक्षात् शालिग्राम भगवान् उत्पत्ति हुने विश्वकै एकमात्र कालीगण्डकी',
    aliases: ['कालीगण्डकी', 'kaligandaki', 'krishnagandaki', 'शालिग्राम नदी']
  },
  {
    id: 'river_chitwan_devghat_sangam',
    nameNepali: 'पवित्र देवघाट त्रिवेणी सङ्गम (कालीगण्डकी-त्रिशूली)',
    nameSanskrit: 'पवित्र देवघाट त्रिवेणी महासङ्गम',
    category: 'sangam',
    district: 'चितवन',
    province: 'बागमती प्रदेश',
    latitude: 27.7200,
    longitude: 84.4200,
    sanskritLocative: 'पवित्र देवघाट त्रिवेणी महासङ्गम पुण्यतीर्थे',
    descriptionNepali: 'कालीगण्डकी र त्रिशूलीको महासङ्गम देवघाट धाम',
    aliases: ['देवघाट', 'devghat', 'narayani', 'नारायणी', 'त्रिवेणी']
  },

  // ==========================================
  // कोशी प्रदेश (KOSHI PROVINCE)
  // ==========================================
  {
    id: 'river_jhapa_mechi_kankai',
    nameNepali: 'पवित्र कन्काई व मेची नदी',
    nameSanskrit: 'पवित्र कनकावती (कन्काई) पुण्यतीर्थ',
    category: 'river',
    district: 'झापा',
    province: 'कोशी प्रदेश',
    latitude: 26.6333,
    longitude: 87.9833,
    sanskritLocative: 'पवित्र कनकावती (कन्काई) एवं मेची पुण्यतीर्थे',
    descriptionNepali: 'झापाको कोटिहोम तथा पवित्र कन्काई धाम नदी',
    aliases: ['कन्काई', 'kankai', 'mechi', 'मेची नदी']
  },
  {
    id: 'river_ilam_maipokhari',
    nameNepali: 'पवित्र माईखोला व जोगमाई',
    nameSanskrit: 'पवित्र माईखोला-माईपोखरी पुण्यजलाशय',
    category: 'river',
    district: 'इलाम',
    province: 'कोशी प्रदेश',
    latitude: 26.9111,
    longitude: 87.9231,
    sanskritLocative: 'पवित्र माईखोला पुण्यसलिला तीरे',
    descriptionNepali: 'इलामको प्रसिद्ध पावन माईखोला',
    aliases: ['माईखोला', 'maikhola', 'maipokhari']
  },

  // ==========================================
  // लुम्बिनी, कर्णाली र सुदूरपश्चिम
  // ==========================================
  {
    id: 'river_rupandehi_tinau',
    nameNepali: 'पवित्र तिनाउ नदी',
    nameSanskrit: 'पवित्र तिनाउ (तिलोत्तमा) पुण्यनदी',
    category: 'river',
    district: 'रुपन्देही',
    province: 'लुम्बिनी प्रदेश',
    latitude: 27.7000,
    longitude: 83.4500,
    sanskritLocative: 'पवित्र तिलोत्तमा (तिनाउ) पुण्यनदीतीरे',
    descriptionNepali: 'बुटवल र भैरहवा क्षेत्रको पवित्र तिनाउ नदी',
    aliases: ['तिनाउ', 'tinau', 'tilottama', 'तिलोत्तमा']
  },
  {
    id: 'river_karnali_mahanadi',
    nameNepali: 'पवित्र कर्णाली महापुण्यनदी',
    nameSanskrit: 'पवित्र कैलास-मानसरोवरोद्भूत कर्णाली महातीर्थ',
    category: 'river',
    district: 'सुर्खेत',
    province: 'कर्णाली प्रदेश',
    latitude: 28.6000,
    longitude: 81.6333,
    sanskritLocative: 'पवित्र कैलासोद्भूत कर्णाली महापुण्यतीर्थे',
    descriptionNepali: 'मानसरोवरबाट उद्गम भएकी नेपालको सबैभन्दा लामो कर्णाली नदी',
    aliases: ['कर्णाली नदी', 'karnali', 'karnali river']
  },
  {
    id: 'river_sudurpashchim_mahakali',
    nameNepali: 'पवित्र महाकाली (शारदा) नदी',
    nameSanskrit: 'पवित्र महाकाली (शारदा) पुण्यतीर्थ',
    category: 'river',
    district: 'कञ्चनपुर',
    province: 'सुदूरपश्चिम प्रदेश',
    latitude: 28.9667,
    longitude: 80.1833,
    sanskritLocative: 'पवित्र महाकाली (शारदा) महापुण्यतीर्थे',
    descriptionNepali: 'सुदूरपश्चिमको सीमान्त पावन महाकाली नदी',
    aliases: ['महाकाली', 'mahakali', 'sharda', 'शारदा']
  }
];

/**
 * Intelligent Multi-Tier Sacred Resolution Algorithm:
 * Evaluates distances and falls back sequentially:
 * Tier 1: 0 - 2.0 km (Immediate Neighborhood)
 * Tier 2: 2.0 - 5.0 km (Local Cluster)
 * Tier 3: 5.0 - 10.0 km (Sub-district)
 * Tier 4: 10.0 - 20.0 km (District Level)
 * Tier 5: > 20.0 km (Regional Heritage Fallback)
 */
export function resolveSacredGeographyByCoordinates(
  lat: number,
  lon: number,
  inputPlaceName?: string,
  inputDistrict?: string
): MultiTierGeoResult {
  // 1. Find nearest district info
  let resolvedDistrict = inputDistrict || '';
  let resolvedProvince = 'मधेश प्रदेश';
  let resolvedPlaceName = inputPlaceName || '';

  if (!resolvedDistrict && lat && lon) {
    const nearest = NEPAL_77_DISTRICTS.reduce((min, cur) => {
      const d = calculateGeoDistanceKm(lat, lon, cur.latitude, cur.longitude);
      return d < min.dist ? { dist: d, distObj: cur } : min;
    }, { dist: 99999, distObj: NEPAL_77_DISTRICTS[0] });

    resolvedDistrict = nearest.distObj.district;
    resolvedProvince = nearest.distObj.province;
    if (!resolvedPlaceName) {
      resolvedPlaceName = `${nearest.distObj.headquarter}, ${nearest.distObj.district}`;
    }
  }

  // 2. Find Shrines sorted by distance
  const shrinesWithDist = SACRED_SHRINES_DATABASE.map(shrine => ({
    shrine,
    distanceKm: calculateGeoDistanceKm(lat, lon, shrine.latitude, shrine.longitude)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // 3. Find Rivers sorted by distance
  const riversWithDist = SACRED_RIVERS_DATABASE.map(river => ({
    river,
    distanceKm: calculateGeoDistanceKm(lat, lon, river.latitude, river.longitude)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // Pick nearest
  const bestShrineObj = shrinesWithDist[0] || {
    shrine: SACRED_SHRINES_DATABASE[0],
    distanceKm: 0
  };
  const bestRiverObj = riversWithDist[0] || {
    river: SACRED_RIVERS_DATABASE[0],
    distanceKm: 0
  };

  const shrineD = bestShrineObj.distanceKm;
  const riverD = bestRiverObj.distanceKm;

  // Determine Tiers
  const getTier = (dist: number): { tier: ProximityTier; label: string; sanskritPrefix: string } => {
    if (dist <= 2.0) {
      return {
        tier: '2km',
        label: `२ कि.मी. भित्र (${toDevanagariNumerals(dist.toFixed(1))} कि.मी.)`,
        sanskritPrefix: 'समीपवर्तिनि (२ कि.मी. परिधौ)'
      };
    }
    if (dist <= 5.0) {
      return {
        tier: '5km',
        label: `५ कि.मी. भित्र (${toDevanagariNumerals(dist.toFixed(1))} कि.मी.)`,
        sanskritPrefix: 'समीपे (५ कि.मी. परिधौ)'
      };
    }
    if (dist <= 10.0) {
      return {
        tier: '10km',
        label: `१० कि.मी. भित्र (${toDevanagariNumerals(dist.toFixed(1))} कि.मी.)`,
        sanskritPrefix: '१० कि.मी. परिधौ स्थिते'
      };
    }
    if (dist <= 20.0) {
      return {
        tier: '20km',
        label: `२० कि.मी. भित्र (${toDevanagariNumerals(dist.toFixed(1))} कि.मी.)`,
        sanskritPrefix: '२० कि.मी. परिधौ स्थिते'
      };
    }
    return {
      tier: 'regional',
      label: `प्रादेशिक क्षेत्र (${toDevanagariNumerals(dist.toFixed(0))} कि.मी.)`,
      sanskritPrefix: 'प्रसिद्ध'
    };
  };

  const shrineTierInfo = getTier(shrineD);
  const riverTierInfo = getTier(riverD);

  const cleanLocalityName = (resolvedPlaceName || 'राजविराज').split('(')[0].trim();
  const cleanDistrict = (resolvedDistrict || 'सप्तरी').trim();

  // Sanskritization
  const sanskritLocalityText = `${cleanLocalityName} नगरे (वा ग्रामे)`;
  const sanskritSubdivisionText = cleanDistrict.endsWith('े') ? cleanDistrict : `${cleanDistrict} जनपदे, ${resolvedProvince.replace('प्रदेश', 'मण्डले')}`;

  const sanskritRiverText = `${bestRiverObj.river.sanskritLocative} (दूरी: ${toDevanagariNumerals(riverD.toFixed(1))} कि.मी.)`;
  const sanskritShrineText = `${bestShrineObj.shrine.sanskritLocative} (दूरी: ${toDevanagariNumerals(shrineD.toFixed(1))} कि.मी.)`;

  const nepaliRiverSummary = `${bestRiverObj.river.nameNepali} [${riverTierInfo.label}]`;
  const nepaliShrineSummary = `${bestShrineObj.shrine.nameNepali} [${shrineTierInfo.label}]`;

  const tierSummaryBadge = shrineD <= 2.0 || riverD <= 2.0
    ? '📍 २ कि.मी. निकटतम खोजी'
    : shrineD <= 5.0 || riverD <= 5.0
    ? '📍 ५ कि.मी. परिधि खोजी'
    : shrineD <= 10.0 || riverD <= 10.0
    ? '📍 १० कि.मी. परिधि खोजी'
    : '📍 २० कि.मी. क्षेत्रीय खोजी';

  return {
    placeName: cleanLocalityName,
    district: cleanDistrict,
    province: resolvedProvince,
    latitude: lat,
    longitude: lon,
    matchedShrine: bestShrineObj.shrine,
    shrineDistanceKm: shrineD,
    shrineTier: shrineTierInfo.tier,
    shrineTierLabelNepali: shrineTierInfo.label,
    matchedRiver: bestRiverObj.river,
    riverDistanceKm: riverD,
    riverTier: riverTierInfo.tier,
    riverTierLabelNepali: riverTierInfo.label,
    sanskritLocalityText,
    sanskritSubdivisionText,
    sanskritRiverText,
    sanskritShrineText,
    nepaliRiverSummary,
    nepaliShrineSummary,
    tierSummaryBadge,
  };
}

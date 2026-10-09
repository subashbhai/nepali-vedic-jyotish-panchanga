/**
 * Vedic Sankalpa & Maha Sankalpa Generation Engine (वैदिक सङ्कल्प तथा महासङ्कल्प इन्जिन)
 * Formulates shastra-compliant Vedic declarations based on real-time Panchanga,
 * Graha positions (planetary transits), and geographical sacred coordinates (Country, District, Sacred River, Deity).
 */

import { PanchangaData, BirthDetails, PlanetPosition, LocationData } from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';
import { calculateGeoDistanceKm, getStoredUserLocation } from './geoLocationHelper';
import { getVedicRituInfo, getRituSanskritLocative, getAyanaForBSMonth } from './vedicRituEngine';
import { resolveSacredGeographyByCoordinates, MultiTierGeoResult } from './sacredGeoSpatialEngine';

export interface SacredLocationInfo {
  countrySanskrit: string; // e.g. नेपाल देशे
  subdivisionSanskrit: string; // e.g. बागमती मण्डले
  localitySanskrit: string; // e.g. काष्ठमण्डप नगरे (काठमाडौँ)
  sacredRiverSanskrit: string; // e.g. पवित्र बागमती-विष्णुमती-मनोहरा पुण्यतीर्थे
  prominentDeitySanskrit: string; // e.g. श्रीपशुपतिनाथ-गुह्येश्वरी-स्वयम्भू चरणसन्निधौ
  riverNepali: string;
  deityNepali: string;
  riverTierLabel?: string;
  shrineTierLabel?: string;
  tierSummaryBadge?: string;
  shrineDistanceKm?: number;
  riverDistanceKm?: number;
  tierResult?: MultiTierGeoResult;
}

export interface SacredGeoDefinition {
  district: string;
  subdivision: string;
  locality: string;
  riverSanskrit: string;
  deitySanskrit: string;
  riverNepali: string;
  deityNepali: string;
  lat: number;
  lon: number;
  aliases: string[];
}

/**
 * Comprehensive Sacred Geography of Nepal (नेपालका ७७ वटै जिल्लाका पवित्र नदी, तीर्थ तथा प्रसिद्ध देवपीठ/मन्दिर)
 * Shastra-compliant Sanskrit declarations & authentic Nepali names with geographic coordinates.
 */
export const NEPAL_SACRED_GEOGRAPHY: Record<string, SacredGeoDefinition> = {
  // ==========================================
  // कोशी प्रदेश (KOSHI PROVINCE - 14 Districts)
  // ==========================================
  'झापा': {
    district: 'झापा',
    subdivision: 'कोशी मण्डले',
    locality: 'भद्रपुर-विर्तामोड क्षेत्रे',
    riverSanskrit: 'पवित्र मेची-कन्काई-विरिङ पुण्यतीर्थे',
    deitySanskrit: 'श्रीअर्जुनधारा-सताक्षीधाम-किच्चकवध चरणसन्निधौ',
    riverNepali: 'मेची, कन्काई र विरिङ नदी',
    deityNepali: 'श्री अर्जुनधारा तथा सताक्षीधाम',
    lat: 26.6333,
    lon: 87.9833,
    aliases: ['झापा', 'jhapa', 'birtamode', 'विर्तामोड', 'bhadrapur', 'भद्रपुर', 'damak', 'दमक', 'kakarbhitta', 'काँकडभिट्टा']
  },
  'मोरङ': {
    district: 'मोरङ',
    subdivision: 'कोशी मण्डले',
    locality: 'विराटनगर नगरे',
    riverSanskrit: 'पवित्र बक्राहा-केशल्या नदीतीरे विराटक्षेत्रे',
    deitySanskrit: 'श्रीविराटेश्वर महादेव-काली मन्दिर चरणसन्निधौ',
    riverNepali: 'बक्राहा र केशल्या नदी',
    deityNepali: 'श्री विराटेश्वर महादेव तथा काली मन्दिर',
    lat: 26.4525,
    lon: 87.2718,
    aliases: ['मोरङ', 'morang', 'biratnagar', 'विराटनगर', 'बिराटनगर', 'urlabari', 'उर्लाबारी']
  },
  'सुनसरी': {
    district: 'सुनसरी',
    subdivision: 'कोशी मण्डले',
    locality: 'धरान-इटहरी-वराहक्षेत्रे',
    riverSanskrit: 'पवित्र सप्तकोशीतीरे पिण्डेश्वर-कौशिकी पुण्यतीर्थे',
    deitySanskrit: 'श्रीवराहक्षेत्र-दन्तकाली-पिण्डेश्वर चरणसन्निधौ',
    riverNepali: 'सप्तकोशी नदी र वराहक्षेत्र',
    deityNepali: 'श्री वराहक्षेत्र, दन्तकाली तथा पिण्डेश्वर',
    lat: 26.8125,
    lon: 87.2833,
    aliases: ['सुनसरी', 'sunsari', 'dharan', 'धरान', 'itahari', 'इटहरी', 'barahachhetra', 'वराहक्षेत्र', 'inaruwa', 'इनरुवा']
  },
  'इलाम': {
    district: 'इलाम',
    subdivision: 'कोशी मण्डले',
    locality: 'इलाम नगरे',
    riverSanskrit: 'पवित्र माईखोला-जोगमाई पुण्यजलाशयक्षेत्रे',
    deitySanskrit: 'श्रीमाईपोखरी-गजुरमुखी-सिंहवाहिनी भगवती चरणसन्निधौ',
    riverNepali: 'माईखोला र जोगमाई',
    deityNepali: 'श्री माईपोखरी तथा गजुरमुखी',
    lat: 26.9111,
    lon: 87.9231,
    aliases: ['इलाम', 'ilam', 'pashupatinagar', 'पशुपतिनगर', 'maipokhari', 'माईपोखरी']
  },
  'पाँचथर': {
    district: 'पाँचथर',
    subdivision: 'कोशी मण्डले',
    locality: 'फिदिम नगरे',
    riverSanskrit: 'पवित्र हेँवाखोला-काबेली पुण्यतीर्थे',
    deitySanskrit: 'श्रीलब्रेकुटी-फिदिम शिवालय चरणसन्निधौ',
    riverNepali: 'हेँवाखोला र काबेली नदी',
    deityNepali: 'श्री लब्रेकुटी तथा फिदिम शिवालय',
    lat: 27.1500,
    lon: 87.7500,
    aliases: ['पाँचथर', 'panchthar', 'phidim', 'फिदिम']
  },
  'ताप्लेजुङ': {
    district: 'ताप्लेजुङ',
    subdivision: 'कोशी मण्डले',
    locality: 'फुङलिङ पाथिभरा क्षेत्रे',
    riverSanskrit: 'पवित्र तमोर नदीतीरे पाथिभरा पुण्यशिखरे',
    deitySanskrit: 'श्रीमहाशक्तियुक्ता पाथिभरा देवी चरणसन्निधौ',
    riverNepali: 'तमोर नदी',
    deityNepali: 'श्री पाथिभरा देवी भगवती',
    lat: 27.3500,
    lon: 87.6667,
    aliases: ['ताप्लेजुङ', 'taplejung', 'fungling', 'फुङलिङ', 'pathibhara', 'पाथिभरा']
  },
  'सङ्खुवासभा': {
    district: 'सङ्खुवासभा',
    subdivision: 'कोशी मण्डले',
    locality: 'खाँदबारी नगरे',
    riverSanskrit: 'पवित्र अरुण नदीतीरे शिवधारा क्षेत्रे',
    deitySanskrit: 'श्रीशिवधारा-मनकामना महादेव चरणसन्निधौ',
    riverNepali: 'अरुण नदी',
    deityNepali: 'श्री शिवधारा तथा मनकामना',
    lat: 27.3750,
    lon: 87.2167,
    aliases: ['सङ्खुवासभा', 'संखुवासभा', 'sankhuwasabha', 'khandbari', 'खाँदबारी']
  },
  'तेह्रथुम': {
    district: 'तेह्रथुम',
    subdivision: 'कोशी मण्डले',
    locality: 'म्याङलुङ नगरे',
    riverSanskrit: 'पवित्र मयाङखोला-तमोर नदीतीरे',
    deitySanskrit: 'श्रीसिद्धकाली भगवती चरणसन्निधौ',
    riverNepali: 'मयाङखोला र तमोर',
    deityNepali: 'श्री सिद्धकाली मन्दिर',
    lat: 27.1333,
    lon: 87.5333,
    aliases: ['तेह्रथुम', 'tehrathum', 'myanglung', 'म्याङलुङ']
  },
  'धनकुटा': {
    district: 'धनकुटा',
    subdivision: 'कोशी मण्डले',
    locality: 'धनकुटा नगरे',
    riverSanskrit: 'पवित्र तमोर नदीतीरे विश्रान्ति क्षेत्रे',
    deitySanskrit: 'श्रीनिशान भगवती-विश्रान्ति मन्दिर चरणसन्निधौ',
    riverNepali: 'तमोर नदी',
    deityNepali: 'श्री निशान भगवती तथा विश्रान्ति',
    lat: 26.9833,
    lon: 87.3333,
    aliases: ['धनकुटा', 'dhankuta', 'bhedetar', 'भेडेटार']
  },
  'भोजपुर': {
    district: 'भोजपुर',
    subdivision: 'कोशी मण्डले',
    locality: 'भोजपुर नगरे',
    riverSanskrit: 'पवित्र अरुण-सुनकोशी पुण्यतीर्थे',
    deitySanskrit: 'श्रीसिद्धकाली-टक्सार गणेश चरणसन्निधौ',
    riverNepali: 'अरुण र सुनकोशी नदी',
    deityNepali: 'श्री सिद्धकाली तथा टक्सार गणेश',
    lat: 27.1708,
    lon: 87.0458,
    aliases: ['भोजपुर', 'bhojpur', 'taksar', 'टक्सार']
  },
  'खोटाङ': {
    district: 'खोटाङ',
    subdivision: 'कोशी मण्डले',
    locality: 'हलेसी धाम क्षेत्रे',
    riverSanskrit: 'पवित्र दूधकोशी-सुनकोशी सङ्गमतीर्थे',
    deitySanskrit: 'श्रीहलेसी महादेव (पूर्वको पशुपतिनाथ) चरणसन्निधौ',
    riverNepali: 'दूधकोशी र सुनकोशी नदी',
    deityNepali: 'श्री हलेसी महादेव (पूर्वको पशुपति)',
    lat: 27.2000,
    lon: 86.7833,
    aliases: ['खोटाङ', 'khotang', 'halesi', 'हलेसी', 'diktel', 'दिक्तेल']
  },
  'सोलुखुम्बु': {
    district: 'सोलुखुम्बु',
    subdivision: 'कोशी मण्डले',
    locality: 'सगरमाथा पावनक्षेत्रे',
    riverSanskrit: 'पवित्र दूधकोशी-इम्जाखोला हिमवत्पुण्यतीर्थे',
    deitySanskrit: 'श्रीत्याङबोचे-ज्वालामुखी महादेव चरणसन्निधौ',
    riverNepali: 'दूधकोशी र इम्जा खोला',
    deityNepali: 'श्री त्याङबोचे तथा सगरमाथा क्षेत्र',
    lat: 27.5000,
    lon: 86.5833,
    aliases: ['सोलुखुम्बु', 'solukhumbu', 'salleri', 'सल्लेरी', 'namche', 'नाम्चे', 'lukla', 'लुक्ला']
  },
  'ओखलढुङ्गा': {
    district: 'ओखलढुङ्गा',
    subdivision: 'कोशी मण्डले',
    locality: 'ओखलढुङ्गा नगरे',
    riverSanskrit: 'पवित्र लिखु-सुनकोशी पुण्यतीर्थे',
    deitySanskrit: 'श्रीककनी देवी-पोकली भगवती चरणसन्निधौ',
    riverNepali: 'लिखु र सुनकोशी नदी',
    deityNepali: 'श्री ककनी देवी तथा पोकली',
    lat: 27.3167,
    lon: 86.5000,
    aliases: ['ओखलढुङ्गा', 'okhaldhunga', 'pokali', 'पोकली']
  },
  'उदयपुर': {
    district: 'उदयपुर',
    subdivision: 'कोशी मण्डले',
    locality: 'गाईघाट त्रियुगा क्षेत्रे',
    riverSanskrit: 'पवित्र त्रियुगा-सप्तकोशी पुण्यतीर्थे',
    deitySanskrit: 'श्रीरौतापोखरी भगवती-चौदण्डीगढी चरणसन्निधौ',
    riverNepali: 'त्रियुगा र सप्तकोशी नदी',
    deityNepali: 'श्री रौतापोखरी तथा चौदण्डीगढी',
    lat: 26.7900,
    lon: 86.7000,
    aliases: ['उदयपुर', 'udayapur', 'gaighat', 'गाईघाट', 'rautapokhari', 'रौतापोखरी']
  },

  // ==========================================
  // मधेश प्रदेश (MADHESH PROVINCE - 8 Districts)
  // ==========================================
  'सप्तरी': {
    district: 'सप्तरी',
    subdivision: 'मधेश प्रदेशे',
    locality: 'राजविराज छिन्नमस्ता क्षेत्रे',
    riverSanskrit: 'पवित्र कोशी-खाँडो नदीतीरे छिन्नमस्ता पीठक्षेत्रे',
    deitySanskrit: 'श्रीछिन्नमस्ता भगवती (सखडा) चरणसन्निधौ',
    riverNepali: 'सप्तकोशी र खाँडो नदी',
    deityNepali: 'श्री छिन्नमस्ता भगवती (सखडा)',
    lat: 26.5417,
    lon: 86.7500,
    aliases: ['सप्तरी', 'saptari', 'rajbiraj', 'राजविराज', 'chhinnamasta', 'छिन्नमस्ता']
  },
  'सिराहा': {
    district: 'सिराहा',
    subdivision: 'मधेश प्रदेशे',
    locality: 'लहान-सिराहा क्षेत्रे',
    riverSanskrit: 'पवित्र कमला-बलान नदीतीरे',
    deitySanskrit: 'श्रीकमलामाई-सलहेश फूलबारी चरणसन्निधौ',
    riverNepali: 'कमला र बलान नदी',
    deityNepali: 'श्री कमलामाई तथा राजा सलहेश',
    lat: 26.6500,
    lon: 86.2000,
    aliases: ['सिराहा', 'siraha', 'lahan', 'लहान']
  },
  'धनुषा': {
    district: 'धनुषा',
    subdivision: 'मधेश प्रदेशे',
    locality: 'जनकपुरधाम विदेहक्षेत्रे',
    riverSanskrit: 'पवित्र दुग्धमती नदीतीरे गङ्गासागर-धनुषसागर पुण्यतीर्थे',
    deitySanskrit: 'श्रीमज्जगज्जननी जानकी-श्रीरामचन्द्र चरणसन्निधौ',
    riverNepali: 'दुग्धमती नदी र गङ्गासागर',
    deityNepali: 'श्री जानकी मन्दिर तथा राम मन्दिर',
    lat: 26.7271,
    lon: 85.9231,
    aliases: ['धनुषा', 'dhanusha', 'janakpur', 'जनकपुर', 'janakpurdham', 'जनकपुरधाम']
  },
  'महोत्तरी': {
    district: 'महोत्तरी',
    subdivision: 'मधेश प्रदेशे',
    locality: 'जलेश्वरनाथ क्षेत्रे',
    riverSanskrit: 'पवित्र रातो-विगही नदीतीरे जलेश्वर तीर्थे',
    deitySanskrit: 'श्रीजलेश्वरनाथ महादेव चरणसन्निधौ',
    riverNepali: 'रातो र विगही नदी',
    deityNepali: 'श्री जलेश्वरनाथ महादेव',
    lat: 26.6500,
    lon: 85.8000,
    aliases: ['महोत्तरी', 'mahottari', 'jaleshwor', 'जलेश्वर', 'bardibas', 'बर्दिबास']
  },
  'सर्लाही': {
    district: 'सर्लाही',
    subdivision: 'मधेश प्रदेशे',
    locality: 'मलङ्गवा क्षेत्रे',
    riverSanskrit: 'पवित्र बागमती-लखनदेही नदीतीरे',
    deitySanskrit: 'श्रीचतुर्भुज नारायण-नाढीमन ताल चरणसन्निधौ',
    riverNepali: 'बागमती र लखनदेही नदी',
    deityNepali: 'श्री चतुर्भुज नारायण मन्दिर',
    lat: 26.8500,
    lon: 85.5500,
    aliases: ['सर्लाही', 'sarlahi', 'malangwa', 'मलङ्गवा', 'barahathawa', 'बरहथवा']
  },
  'रौतहट': {
    district: 'रौतहट',
    subdivision: 'मधेश प्रदेशे',
    locality: 'गौर-शिवनगर क्षेत्रे',
    riverSanskrit: 'पवित्र बागमती-लालबकैया नदीतीरे',
    deitySanskrit: 'श्रीशिवनगर महादेव मन्दिर चरणसन्निधौ',
    riverNepali: 'बागमती र लालबकैया नदी',
    deityNepali: 'श्री शिवनगर महादेव',
    lat: 26.7667,
    lon: 85.2833,
    aliases: ['रौतहट', 'rautahat', 'gaur', 'गौर', 'chandrapur', 'चन्द्रपुर']
  },
  'बारा': {
    district: 'बारा',
    subdivision: 'मधेश प्रदेशे',
    locality: 'सिम्रौनगढ-गढीमाई क्षेत्रे',
    riverSanskrit: 'पवित्र पसाहा-बकैया नदीतीरे गढीमाई शक्तिपीठक्षेत्रे',
    deitySanskrit: 'श्रीगढीमाई भगवती-कङ्काली माई चरणसन्निधौ',
    riverNepali: 'पसाहा र बकैया नदी',
    deityNepali: 'श्री गढीमाई भगवती तथा कङ्काली',
    lat: 27.0333,
    lon: 85.0000,
    aliases: ['बारा', 'bara', 'kalaiya', 'कलैया', 'gadhimai', 'गढीमाई', 'simara', 'सिमरा']
  },
  'पर्सा': {
    district: 'पर्सा',
    subdivision: 'मधेश प्रदेशे',
    locality: 'वीरगञ्ज नगरे',
    riverSanskrit: 'पवित्र सिर्सिया नदीतीरे गहवामाई क्षेत्रे',
    deitySanskrit: 'श्रीगहवामाई भगवती-विन्ध्यवासिनी चरणसन्निधौ',
    riverNepali: 'सिर्सिया नदी',
    deityNepali: 'श्री गहवामाई तथा विन्ध्यवासिनी',
    lat: 27.0000,
    lon: 84.8667,
    aliases: ['पर्सा', 'parsa', 'birgunj', 'वीरगञ्ज', 'बिरगन्ज']
  },

  // ==========================================
  // बागमती प्रदेश (BAGMATI PROVINCE - 13 Districts)
  // ==========================================
  'काठमाडौँ': {
    district: 'काठमाडौँ',
    subdivision: 'बागमती मण्डले',
    locality: 'काष्ठमण्डप नगरे',
    riverSanskrit: 'पवित्र बागमती-विष्णुमती-मनोहरा पुण्यतीर्थे',
    deitySanskrit: 'श्रीपशुपतिनाथ-गुह्येश्वरी-स्वयम्भू चरणसन्निधौ',
    riverNepali: 'बागमती र विष्णुमती नदी',
    deityNepali: 'श्री पशुपतिनाथ तथा गुह्येश्वरी',
    lat: 27.7172,
    lon: 85.3240,
    aliases: ['काठमाडौँ', 'काठमाडौं', 'kathmandu', 'ktm', 'काष्ठमण्डप', 'thamel', 'बानेश्वर']
  },
  'ललितपुर': {
    district: 'ललितपुर',
    subdivision: 'बागमती मण्डले',
    locality: 'ललितपत्तन नगरे',
    riverSanskrit: 'पवित्र बागमती-गोदावरी पुण्यसलिला क्षेत्रे',
    deitySanskrit: 'श्रीकृष्ण-रातोमच्छिन्द्रनाथ चरणसन्निधौ',
    riverNepali: 'बागमती र गोदावरी खोला',
    deityNepali: 'श्रीकृष्ण मन्दिर तथा पाटन दरबार क्षेत्र',
    lat: 27.6644,
    lon: 85.3188,
    aliases: ['ललितपुर', 'lalitpur', 'patan', 'पाटन', 'godawari', 'गोदावरी', 'pulchowk', 'पुल्चोक']
  },
  'भक्तपुर': {
    district: 'भक्तपुर',
    subdivision: 'बागमती मण्डले',
    locality: 'भक्तपुर भादगाउँ नगरे',
    riverSanskrit: 'पवित्र हनुमन्ते-मनोहरा पुण्यतीर्थे',
    deitySanskrit: 'श्रीचाँगुनारायण-दत्तात्रेय-नवदुर्गा चरणसन्निधौ',
    riverNepali: 'हनुमन्ते र मनोहरा नदी',
    deityNepali: 'श्री चाँगुनारायण तथा दत्तात्रेय',
    lat: 27.6710,
    lon: 85.4298,
    aliases: ['भक्तपुर', 'bhaktapur', 'bhadgaon', 'भादगाउँ', 'changunarayan', 'चाँगुनारायण', 'suryabinayak', 'सूर्यविनायक']
  },
  'काभ्रेपलाञ्चोक': {
    district: 'काभ्रेपलाञ्चोक',
    subdivision: 'बागमती मण्डले',
    locality: 'बनेपा-धुलिखेल क्षेत्रे',
    riverSanskrit: 'पवित्र रोशी-पुण्यमाता नदीतीरे चण्डेश्वरी पीठक्षेत्रे',
    deitySanskrit: 'श्रीचण्डेश्वरी भगवती-धनेश्वर महादेव चरणसन्निधौ',
    riverNepali: 'रोशी र पुण्यमाता नदी',
    deityNepali: 'श्री चण्डेश्वरी तथा धनेश्वर महादेव',
    lat: 27.6167,
    lon: 85.5500,
    aliases: ['काभ्रेपलाञ्चोक', 'काभ्रे', 'kavre', 'kavrepalanchok', 'banepa', 'बनेपा', 'dhulikhel', 'धुलिखेल', 'panauti', 'पनौती']
  },
  'सिन्धुपाल्चोक': {
    district: 'सिन्धुपाल्चोक',
    subdivision: 'बागमती मण्डले',
    locality: 'हेलम्बु-चौतारा क्षेत्रे',
    riverSanskrit: 'पवित्र भोटेकोशी-इन्द्रावती सङ्गमतीर्थे',
    deitySanskrit: 'श्रीगौराती भीमेश्वर-पाल्चोक भगवती चरणसन्निधौ',
    riverNepali: 'भोटेकोशी र इन्द्रावती नदी',
    deityNepali: 'श्री गौराती भीमेश्वर तथा पाल्चोक भगवती',
    lat: 27.7667,
    lon: 85.7167,
    aliases: ['सिन्धुपाल्चोक', 'sindhupalchok', 'chautara', 'चौतारा', 'melamchi', 'मेलम्ची']
  },
  'दोलखा': {
    district: 'दोलखा',
    subdivision: 'बागमती मण्डले',
    locality: 'दोलखा भीमेश्वर क्षेत्रे',
    riverSanskrit: 'पवित्र तामाकोशी नदीतीरे भीमेश्वर धामक्षेत्रे',
    deitySanskrit: 'श्रीदोलखा भीमसेन (भीमेश्वर) चरणसन्निधौ',
    riverNepali: 'तामाकोशी नदी',
    deityNepali: 'श्री दोलखा भीमसेन',
    lat: 27.6667,
    lon: 86.0500,
    aliases: ['दोलखा', 'dolkha', 'charikot', 'चरीकोट', 'bhimeshwar', 'भीमेश्वर']
  },
  'रामेछाप': {
    district: 'रामेछाप',
    subdivision: 'बागमती मण्डले',
    locality: 'मन्थली-खाँडादेवी क्षेत्रे',
    riverSanskrit: 'पवित्र तामाकोशी-सुनकोशी सङ्गमतीर्थे',
    deitySanskrit: 'श्रीखाँडादेवी भगवती चरणसन्निधौ',
    riverNepali: 'तामाकोशी र सुनकोशी नदी',
    deityNepali: 'श्री खाँडादेवी भगवती',
    lat: 27.3333,
    lon: 86.0833,
    aliases: ['रामेछाप', 'ramechhap', 'manthali', 'मन्थली', 'khandadevi', 'खाँडादेवी']
  },
  'सिन्धुली': {
    district: 'सिन्धुली',
    subdivision: 'बागमती मण्डले',
    locality: 'सिन्धुलीगढी क्षेत्रे',
    riverSanskrit: 'पवित्र कमला-मरिण नदीतीरे',
    deitySanskrit: 'श्रीभद्रकाली-कमलामाई चरणसन्निधौ',
    riverNepali: 'कमला र मरिण नदी',
    deityNepali: 'श्री भद्रकाली तथा कमलामाई',
    lat: 27.2500,
    lon: 85.9167,
    aliases: ['सिन्धुली', 'sindhuli', 'kamalamai', 'कमलामाई']
  },
  'नुवाकोट': {
    district: 'नुवाकोट',
    subdivision: 'बागमती मण्डले',
    locality: 'ऐतिहासिक नुवाकोट क्षेत्रे',
    riverSanskrit: 'पवित्र त्रिशूली-तादी नदीतीरे भैरवी क्षेत्रे',
    deitySanskrit: 'श्रीनिरञ्जना भैरवी भगवती चरणसन्निधौ',
    riverNepali: 'त्रिशूली र तादी नदी',
    deityNepali: 'श्री नुवाकोट भैरवी भगवती',
    lat: 27.9167,
    lon: 85.1667,
    aliases: ['नुवाकोट', 'nuwakot', 'bidur', 'विदुर', 'battar', 'बट्टार']
  },
  'रसुवा': {
    district: 'रसुवा',
    subdivision: 'बागमती मण्डले',
    locality: 'गोसाइँकुण्ड पावनतीर्थे',
    riverSanskrit: 'पवित्र त्रिशूली नदी उद्गम गोसाइँकुण्ड सरोवरे',
    deitySanskrit: 'श्रीगोसाइँकुण्डेश्वर नीलकण्ठ महादेव चरणसन्निधौ',
    riverNepali: 'त्रिशूली नदी र गोसाइँकुण्ड',
    deityNepali: 'श्री गोसाइँकुण्ड महादेव',
    lat: 28.1167,
    lon: 85.3000,
    aliases: ['रसुवा', 'rasuwa', 'gosaikunda', 'गोसाइँकुण्ड', 'dhunche', 'धुन्चे']
  },
  'धादिङ': {
    district: 'धादिङ',
    subdivision: 'बागमती मण्डले',
    locality: 'धादिङ त्रिपुरासुन्दरी क्षेत्रे',
    riverSanskrit: 'पवित्र त्रिशूली-आँखुखोला सङ्गमक्षेत्रे',
    deitySanskrit: 'श्रीत्रिपुरासुन्दरी भगवती चरणसन्निधौ',
    riverNepali: 'त्रिशूली र आँखुखोला',
    deityNepali: 'श्री त्रिपुरासुन्दरी भगवती',
    lat: 27.8667,
    lon: 84.9000,
    aliases: ['धादिङ', 'dhading', 'tripurasundari', 'त्रिपुरासुन्दरी']
  },
  'मकवानपुर': {
    district: 'मकवानपुर',
    subdivision: 'बागमती मण्डले',
    locality: 'हेटौँडा नगरे',
    riverSanskrit: 'पवित्र सामरी-कर्रा-राप्ती नदीतीरे',
    deitySanskrit: 'श्रीभुटनदेवी-चुरियामाई चरणसन्निधौ',
    riverNepali: 'सामरी र कर्रा खोला',
    deityNepali: 'श्री भुटनदेवी तथा चुरियामाई',
    lat: 27.4167,
    lon: 85.0333,
    aliases: ['मकवानपुर', 'makwanpur', 'hetauda', 'हेटौँडा', 'भिमफेदी']
  },
  'चितवन': {
    district: 'चितवन',
    subdivision: 'बागमती मण्डले',
    locality: 'देवघाट-भरतपुर क्षेत्रे',
    riverSanskrit: 'पवित्र नारायणी-सप्तगण्डकी-त्रिशूली देवघाट सङ्गमपुण्यतीर्थे',
    deitySanskrit: 'श्रीहरिहरक्षेत्र-मौलाकालिका भगवती चरणसन्निधौ',
    riverNepali: 'नारायणी नदी र देवघाट सङ्गम',
    deityNepali: 'श्री देवघाटधाम तथा मौलाकालिका',
    lat: 27.6833,
    lon: 84.4333,
    aliases: ['चितवन', 'chitwan', 'bharatpur', 'भरतपुर', 'narayangarh', 'नारायणगढ', 'devghat', 'देवघाट']
  },

  // ==========================================
  // गण्डकी प्रदेश (GANDAKI PROVINCE - 11 Districts)
  // ==========================================
  'कास्की': {
    district: 'कास्की',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'पोखरा नगरे',
    riverSanskrit: 'पवित्र सेतीगण्डकीतीरे फेवाताल पुण्यजलाशयक्षेत्रे',
    deitySanskrit: 'श्रीविन्ध्यवासिनी-तालवाराही भगवती चरणसन्निधौ',
    riverNepali: 'सेतीगण्डकी र फेवाताल',
    deityNepali: 'श्री विन्ध्यवासिनी तथा तालवाराही',
    lat: 28.2096,
    lon: 83.9856,
    aliases: ['कास्की', 'kaski', 'pokhara', 'पोखरा', 'lekhnath', 'लेखनाथ']
  },
  'तनहुँ': {
    district: 'तनहुँ',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'व्यासक्षेत्र-दमौली नगरे',
    riverSanskrit: 'पवित्र मादी-सेतीगण्डकी सङ्गम व्यासगुफा पुण्यतीर्थे',
    deitySanskrit: 'श्रीवेदव्यास तपोभूमि-छाब्दीवाराही चरणसन्निधौ',
    riverNepali: 'मादी र सेतीगण्डकी सङ्गम',
    deityNepali: 'श्री व्यास गुफा तथा छाब्दीवाराही',
    lat: 27.9667,
    lon: 84.2833,
    aliases: ['तनहुँ', 'tanahun', 'damauli', 'दमौली', 'chhabdi', 'छाब्दी']
  },
  'गोरखा': {
    district: 'गोरखा',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'गोरखा ऐतिहासिक क्षेत्रे',
    riverSanskrit: 'पवित्र त्रिशूली-दरौंदी नदीतीरे मनकामना क्षेत्रे',
    deitySanskrit: 'श्रीगोरखनाथ-मनकामना भगवती चरणसन्निधौ',
    riverNepali: 'त्रिशूली र दरौंदी नदी',
    deityNepali: 'श्री गोरखनाथ तथा मनकामना',
    lat: 28.0000,
    lon: 84.6333,
    aliases: ['गोरखा', 'gorkha', 'manakamana', 'मनकामना']
  },
  'लमजुङ': {
    district: 'लमजुङ',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'बेसीसहर क्षेत्रे',
    riverSanskrit: 'पवित्र मर्स्याङ्दी नदीतीरे ईशानेश्वर क्षेत्रे',
    deitySanskrit: 'श्रीईशानेश्वर महादेव (करापु)-लमजुङ कालिका चरणसन्निधौ',
    riverNepali: 'मर्स्याङ्दी नदी',
    deityNepali: 'श्री ईशानेश्वर महादेव तथा लमजुङ कालिका',
    lat: 28.2333,
    lon: 84.3833,
    aliases: ['लमजुङ', 'lamjung', 'besisahar', 'बेसीसहर']
  },
  'स्याङ्जा': {
    district: 'स्याङ्जा',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'छायाँक्षेत्र-पुतलीबजार नगरे',
    riverSanskrit: 'पवित्र आँधीखोला-कालिगण्डकी पुण्यतीर्थे',
    deitySanskrit: 'श्रीछायाँक्षेत्र-छाङ्छाङ्दी भगवती चरणसन्निधौ',
    riverNepali: 'आँधीखोला र कालीगण्डकी',
    deityNepali: 'श्री छायाँक्षेत्र तथा छाङ्छाङ्दी',
    lat: 28.1000,
    lon: 83.8667,
    aliases: ['स्याङ्जा', 'syangja', 'waling', 'वालिङ', 'putalibazar', 'पुतलीबजार']
  },
  'पर्वत': {
    district: 'पर्वत',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'कुश्मा मोदीवेणी क्षेत्रे',
    riverSanskrit: 'पवित्र कालिगण्डकी-मोदीखोला मोदीवेणी सङ्गमतीर्थे',
    deitySanskrit: 'श्रीगुप्तेश्वर महादेव-अल्पेश्वर चरणसन्निधौ',
    riverNepali: 'कालीगण्डकी र मोदीवेणी सङ्गम',
    deityNepali: 'श्री गुप्तेश्वर महादेव',
    lat: 28.2167,
    lon: 83.6833,
    aliases: ['पर्वत', 'parbat', 'kushma', 'कुश्मा', 'gupteshwor', 'गुप्तेश्वर']
  },
  'बागलुङ': {
    district: 'बागलुङ',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'बागलुङ पञ्चकोट क्षेत्रे',
    riverSanskrit: 'पवित्र कालिगण्डकी-काठेखोला सङ्गमक्षेत्रे शालिग्रामतीर्थे',
    deitySanskrit: 'श्रीकालिका भगवती-पञ्चकोट चरणसन्निधौ',
    riverNepali: 'कालीगण्डकी र काठेखोला',
    deityNepali: 'श्री बागलुङ कालिका भगवती तथा पञ्चकोट',
    lat: 28.2667,
    lon: 83.6000,
    aliases: ['बागलुङ', 'baglung', 'kalika', 'कालिका', 'panchakot', 'पञ्चकोट']
  },
  'म्याग्दी': {
    district: 'म्याग्दी',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'बेनी गलेश्वर क्षेत्रे',
    riverSanskrit: 'पवित्र कालिगण्डकी-म्याग्दीखोला सङ्गमतीर्थे',
    deitySanskrit: 'श्रीगलेश्वर महादेव चरणसन्निधौ',
    riverNepali: 'कालीगण्डकी र म्याग्दी खोला',
    deityNepali: 'श्री गलेश्वर महादेव',
    lat: 28.3500,
    lon: 83.5667,
    aliases: ['म्याग्दी', 'myagdi', 'beni', 'बेनी', 'galeshwor', 'गलेश्वर']
  },
  'मुस्ताङ': {
    district: 'मुस्ताङ',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'मुक्तिनाथ धामक्षेत्रे',
    riverSanskrit: 'पवित्र शालिग्रामवाहिनी कालिगण्डकी उद्गमतीर्थे',
    deitySanskrit: 'श्रीमुक्तिनाथ-ज्वालामाई चरणसन्निधौ',
    riverNepali: 'कालीगण्डकी नदी उद्गमस्थल',
    deityNepali: 'श्री मुक्तिनाथ भगवान्',
    lat: 28.7833,
    lon: 83.7333,
    aliases: ['मुस्ताङ', 'mustang', 'muktinath', 'मुक्तिनाथ', 'jomsom', 'जोमसोम']
  },
  'मनाङ': {
    district: 'मनाङ',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'मनाङ हिमवत्क्षेत्रे',
    riverSanskrit: 'पवित्र मर्स्याङ्दी उद्गमतीर्थे तिलिचो सरोवरे',
    deitySanskrit: 'श्रीब्रागा गुम्बा-स्थानीय ईश चरणसन्निधौ',
    riverNepali: 'मर्स्याङ्दी नदी र तिलिचो ताल',
    deityNepali: 'श्री तिलिचो तीर्थ तथा ब्रागा गुम्बा',
    lat: 28.5500,
    lon: 84.2333,
    aliases: ['मनाङ', 'manang', 'chame', 'चामे', 'tilicho', 'तिलिचो']
  },
  'नवलपरासी पूर्व': {
    district: 'नवलपरासी पूर्व',
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'कावासोती-देवचुली क्षेत्रे',
    riverSanskrit: 'पवित्र नारायणी-त्रिवेणी सङ्गमपुण्यतीर्थे',
    deitySanskrit: 'श्रीत्रिवेणीधाम-मौलाकालिका भगवती चरणसन्निधौ',
    riverNepali: 'नारायणी नदी र त्रिवेणी धाम',
    deityNepali: 'श्री त्रिवेणीधाम तथा मौलाकालिका',
    lat: 27.6500,
    lon: 84.1167,
    aliases: ['नवलपरासी पूर्व', 'नवलपुर', 'nawalpur', 'kawasoti', 'कावासोती', 'gaindakot', 'गैँडाकोट']
  },

  // ==========================================
  // लुम्बिनी प्रदेश (LUMBINI PROVINCE - 12 Districts)
  // ==========================================
  'पाल्पा': {
    district: 'पाल्पा',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'रुरुक्षेत्र-तानसेन नगरे',
    riverSanskrit: 'पवित्र कालिगण्डकीतीरे रुरुक्षेत्र ऋषिकेश पुण्यतीर्थे',
    deitySanskrit: 'श्रीऋषिकेश मन्दिर-भैरवस्थान भगवती चरणसन्निधौ',
    riverNepali: 'कालीगण्डकी र रुरुक्षेत्र',
    deityNepali: 'श्री ऋषिकेश मन्दिर तथा भैरवस्थान',
    lat: 27.8667,
    lon: 83.5500,
    aliases: ['पाल्पा', 'palpa', 'tansen', 'तानसेन', 'ridi', 'रिडी', 'ruru', 'रुरुक्षेत्र']
  },
  'नवलपरासी पश्चिम': {
    district: 'नवलपरासी पश्चिम',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'रामग्राम-परासी क्षेत्रे',
    riverSanskrit: 'पवित्र झरही-नारायणी नदीतीरे',
    deitySanskrit: 'श्रीपाल्हीनन्दन-रामग्राम स्तूपक्षेत्रे',
    riverNepali: 'झरही नदी',
    deityNepali: 'श्री पाल्हीनन्दन तथा रामग्राम',
    lat: 27.5333,
    lon: 83.6667,
    aliases: ['नवलपरासी पश्चिम', 'परासी', 'parasi', 'ramgram', 'रामग्राम']
  },
  'रुपन्देही': {
    district: 'रुपन्देही',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'बुटवल-भैरहवा-लुम्बिनी क्षेत्रे',
    riverSanskrit: 'पवित्र तिनाउ-दानव नदीतीरे लुम्बिनी तपोभूमि क्षेत्रे',
    deitySanskrit: 'श्रीमायादेवी-सिद्धबाबा चरणसन्निधौ',
    riverNepali: 'तिनाउ नदी र लुम्बिनी क्षेत्र',
    deityNepali: 'श्री सिद्धबाबा मन्दिर तथा लुम्बिनी',
    lat: 27.7000,
    lon: 83.4500,
    aliases: ['रुपन्देही', 'rupandehi', 'butwal', 'बुटवल', 'bhairahawa', 'भैरहवा', 'lumbini', 'लुम्बिनी']
  },
  'कपिलवस्तु': {
    district: 'कपिलवस्तु',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'तौलिहवा प्राचीन क्षेत्रे',
    riverSanskrit: 'पवित्र वाणगङ्गा नदीतीरे',
    deitySanskrit: 'श्रीतौलेश्वरनाथ महादेव चरणसन्निधौ',
    riverNepali: 'वाणगङ्गा नदी',
    deityNepali: 'श्री तौलेश्वरनाथ महादेव',
    lat: 27.5500,
    lon: 83.0500,
    aliases: ['कपिलवस्तु', 'kapilvastu', 'taulihawa', 'तौलिहवा', 'banganga', 'वाणगङ्गा']
  },
  'अर्घाखाँची': {
    district: 'अर्घाखाँची',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'सन्धिखर्क सुपादेउराली क्षेत्रे',
    riverSanskrit: 'पवित्र वाणगङ्गा-बाङ्गी खोलातीरे',
    deitySanskrit: 'श्रीसुपादेउराली भगवती चरणसन्निधौ',
    riverNepali: 'वाणगङ्गा र बाङ्गी खोला',
    deityNepali: 'श्री सुपा देउराली मन्दिर',
    lat: 27.9167,
    lon: 83.1333,
    aliases: ['अर्घाखाँची', 'arghakhanchi', 'sandhikharka', 'सन्धिखर्क', 'supadeurali', 'सुपादेउराली']
  },
  'गुल्मी': {
    district: 'गुल्मी',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'तम्घास रेसुङ्गा धामक्षेत्रे',
    riverSanskrit: 'पवित्र बडिगाड-कालिगण्डकीतीरे रेसुङ्गा तपोभूभौ',
    deitySanskrit: 'श्रीरेसुङ्गाधाम तपोभूमि-शृङ्गीऋषि चरणसन्निधौ',
    riverNepali: 'बडिगाड र कालीगण्डकी',
    deityNepali: 'श्री रेसुङ्गा धाम तथा शृङ्गीऋषि',
    lat: 28.0667,
    lon: 83.2500,
    aliases: ['गुल्मी', 'gulmi', 'tamghas', 'तम्घास', 'resunga', 'रेसुङ्गा']
  },
  'रोल्पा': {
    district: 'रोल्पा',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'लिवाङ जलजला क्षेत्रे',
    riverSanskrit: 'पवित्र माडीखोलातीरे जलजला पावनक्षेत्रे',
    deitySanskrit: 'श्रीजलजला देवी-बराह मन्दिर चरणसन्निधौ',
    riverNepali: 'माडी खोला',
    deityNepali: 'श्री जलजला देवी',
    lat: 28.3000,
    lon: 82.6333,
    aliases: ['रोल्पा', 'rolpa', 'liwarg', 'लिवाङ', 'jaljala', 'जलजला']
  },
  'प्युठान': {
    district: 'प्युठान',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'स्वर्गद्वारी पावनक्षेत्रे',
    riverSanskrit: 'पवित्र झिमरुक-माडी नदीतीरे स्वर्गद्वारी धामे',
    deitySanskrit: 'श्रीस्वर्गद्वारी प्रभुहंस तपोभूमि चरणसन्निधौ',
    riverNepali: 'झिमरुक र माडी नदी',
    deityNepali: 'श्री स्वर्गद्वारी आश्रमधाम',
    lat: 28.1000,
    lon: 82.9000,
    aliases: ['प्युठान', 'pyuthan', 'swargadwari', 'स्वर्गद्वारी']
  },
  'दाङ': {
    district: 'दाङ',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'घोराही-तुलसीपुर उपत्यकाक्षेत्रे',
    riverSanskrit: 'पवित्र बबई-राप्ती नदीतीरे धारपानी क्षेत्रे',
    deitySanskrit: 'श्रीपाण्डवेश्वर महादेव (धारपानी)-अम्बिकेश्वरी चरणसन्निधौ',
    riverNepali: 'बबई नदी र धारापानी',
    deityNepali: 'श्री धारापानी पाण्डवेश्वर तथा अम्बिकेश्वरी',
    lat: 28.0333,
    lon: 82.3000,
    aliases: ['दाङ', 'dang', 'ghorahi', 'घोराही', 'tulsipur', 'तुलसीपुर', 'dharapani', 'धारापानी']
  },
  'बाँके': {
    district: 'बाँके',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'नेपालगञ्ज नगरे',
    riverSanskrit: 'पवित्र राप्ती नदीतीरे बागेश्वरी क्षेत्रे',
    deitySanskrit: 'श्रीबागेश्वरी भगवती चरणसन्निधौ',
    riverNepali: 'राप्ती नदी',
    deityNepali: 'श्री बागेश्वरी भगवती',
    lat: 28.0500,
    lon: 81.6167,
    aliases: ['बाँके', 'banke', 'nepalgunj', 'नेपालगञ्ज', 'नेपालगन्ज', 'kohalpur', 'कोहलपुर']
  },
  'बर्दिया': {
    district: 'बर्दिया',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'गुलरिया ठाकुरद्वारा क्षेत्रे',
    riverSanskrit: 'पवित्र कर्णाली-गेरुवा-बबई नदीतीरे',
    deitySanskrit: 'श्रीठाकुरबाबा महादेव चरणसन्निधौ',
    riverNepali: 'कर्णाली र बबई नदी',
    deityNepali: 'श्री ठाकुरबाबा मन्दिर',
    lat: 28.2333,
    lon: 81.3333,
    aliases: ['बर्दिया', 'bardia', 'gulariya', 'गुलरिया', 'thakurbaba', 'ठाकुरबाबा']
  },
  'रुकुम पूर्व': {
    district: 'रुकुम पूर्व',
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'रुकुमकोट कमलदह क्षेत्रे',
    riverSanskrit: 'पवित्र सानीभेरी नदीतीरे',
    deitySanskrit: 'श्रीदेउराली भगवती-कमलदह तीर्थे',
    riverNepali: 'सानीभेरी नदी र कमलदह',
    deityNepali: 'श्री देउराली भगवती',
    lat: 28.6000,
    lon: 82.6333,
    aliases: ['रुकुम पूर्व', 'rukum east', 'rukumkot', 'रुकुमकोट']
  },

  // ==========================================
  // कर्णाली प्रदेश (KARNALI PROVINCE - 10 Districts)
  // ==========================================
  'सुर्खेत': {
    district: 'सुर्खेत',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'वीरेन्द्रनगर उपत्यकाक्षेत्रे',
    riverSanskrit: 'पवित्र भेरी नदीतीरे बुलबुले पावनक्षेत्रे',
    deitySanskrit: 'श्रीदेउतीबज्यै भगवती-काँक्रेविहार चरणसन्निधौ',
    riverNepali: 'भेरी नदी र बुलबुले',
    deityNepali: 'श्री देउती बज्यै तथा काँक्रेविहार',
    lat: 28.6000,
    lon: 81.6333,
    aliases: ['सुर्खेत', 'surkhet', 'birendranagar', 'वीरेन्द्रनगर', 'deutibajyai', 'देउतीबज्यै']
  },
  'दैलेख': {
    district: 'दैलेख',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'पञ्चकोशी तीर्थक्षेत्रे',
    riverSanskrit: 'पवित्र लोहोरे-छामघाट नदीतीरे पञ्चकोशी धामे',
    deitySanskrit: 'श्रीशिरस्थान-नाभिस्थान-पादुका ज्वाला चरणसन्निधौ',
    riverNepali: 'लोहोरे र छामघाट नदी',
    deityNepali: 'श्री पञ्चकोशी धाम (शिरस्थान, नाभिस्थान)',
    lat: 28.8333,
    lon: 81.7167,
    aliases: ['दैलेख', 'dailekh', 'panchakoshi', 'पञ्चकोशी', 'shirasthan', 'शिरस्थान']
  },
  'जाजरकोट': {
    district: 'जाजरकोट',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'खलङ्गा जाजरकोट क्षेत्रे',
    riverSanskrit: 'पवित्र भेरी नदीतीरे',
    deitySanskrit: 'श्रीकालिका मन्दिर-जगतीपुर चरणसन्निधौ',
    riverNepali: 'भेरी नदी',
    deityNepali: 'श्री कालिका मन्दिर',
    lat: 28.7000,
    lon: 82.2000,
    aliases: ['जाजरकोट', 'jajarkot']
  },
  'रुकुम पश्चिम': {
    district: 'रुकुम पश्चिम',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'मुसिकोट क्षेत्रे',
    riverSanskrit: 'पवित्र सानीभेरी नदीतीरे',
    deitySanskrit: 'श्रीडिग्रे शाइकुमारी भगवती चरणसन्निधौ',
    riverNepali: 'सानीभेरी नदी',
    deityNepali: 'श्री डिग्रे शाइकुमारी भगवती',
    lat: 28.6333,
    lon: 82.4667,
    aliases: ['रुकुम पश्चिम', 'rukum west', 'musikot', 'मुसिकोट', 'digre', 'डिग्रे']
  },
  'सल्यान': {
    district: 'सल्यान',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'खलङ्गा खैराबाङ क्षेत्रे',
    riverSanskrit: 'पवित्र शारदा नदीतीरे खैराबाङ क्षेत्रे',
    deitySanskrit: 'श्रीखैराबाङ भुवनेश्वरी भगवती चरणसन्निधौ',
    riverNepali: 'शारदा नदी',
    deityNepali: 'श्री खैराबाङ भुवनेश्वरी भगवती',
    lat: 28.3667,
    lon: 82.1667,
    aliases: ['सल्यान', 'salyan', 'sharda', 'शारदा', 'khairabang', 'खैराबाङ']
  },
  'जुम्ला': {
    district: 'जुम्ला',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'चन्दननाथ पावनक्षेत्रे',
    riverSanskrit: 'पवित्र तिला-हिमा नदीतीरे चन्दननाथ धामे',
    deitySanskrit: 'श्रीचन्दननाथ-भैरवनाथ स्वामी चरणसन्निधौ',
    riverNepali: 'तिला र हिमा नदी',
    deityNepali: 'श्री चन्दननाथ तथा भैरवनाथ',
    lat: 29.2750,
    lon: 82.1833,
    aliases: ['जुम्ला', 'jumla', 'chandannath', 'चन्दननाथ']
  },
  'कालीकोट': {
    district: 'कालीकोट',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'मान्म पञ्चदेवल क्षेत्रे',
    riverSanskrit: 'पवित्र कर्णाली-तिला सङ्गमपुण्यतीर्थे',
    deitySanskrit: 'श्रीबडिमालिका-पञ्चदेवल चरणसन्निधौ',
    riverNepali: 'कर्णाली र तिला नदी',
    deityNepali: 'श्री बडिमालिका तथा पञ्चदेवल',
    lat: 29.1333,
    lon: 81.8000,
    aliases: ['कालीकोट', 'कालिकोट', 'kalikot', 'manma', 'मान्म']
  },
  'मुगु': {
    district: 'मुगु',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'रारा सरोवर छायाँनाथ क्षेत्रे',
    riverSanskrit: 'पवित्र मुगु कर्णाली नदीतीरे रारा ताल सरोवरे',
    deitySanskrit: 'श्रीछायाँनाथ महादेव चरणसन्निधौ',
    riverNepali: 'मुगु कर्णाली र रारा ताल',
    deityNepali: 'श्री छायाँनाथ महादेव',
    lat: 29.5833,
    lon: 82.1667,
    aliases: ['मुगु', 'mugu', 'rara', 'रारा', 'gamgadhi', 'गमगढी']
  },
  'हुम्ला': {
    district: 'हुम्ला',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'सिमिकोट खार्पुनाथ क्षेत्रे',
    riverSanskrit: 'पवित्र कर्णाली नदी उद्गमक्षेत्रे मानसरोवर सन्निधौ',
    deitySanskrit: 'श्रीखार्पुनाथ शिव चरणसन्निधौ',
    riverNepali: 'कर्णाली नदी',
    deityNepali: 'श्री खार्पुनाथ महादेव',
    lat: 29.9667,
    lon: 81.8333,
    aliases: ['हुम्ला', 'humla', 'simikot', 'सिमिकोट', 'kharpunaath', 'खार्पुनाथ']
  },
  'डोल्पा': {
    district: 'डोल्पा',
    subdivision: 'कर्णाली प्रदेशे',
    locality: 'फोक्सुण्डो तपोभूमि क्षेत्रे',
    riverSanskrit: 'पवित्र भेरी नदीतीरे शे-फोक्सुण्डो पुण्यजलाशये',
    deitySanskrit: 'श्रीबाला त्रिपुरासुन्दरी भगवती चरणसन्निधौ',
    riverNepali: 'भेरी नदी र शे-फोक्सुण्डो',
    deityNepali: 'श्री बाला त्रिपुरासुन्दरी',
    lat: 28.9833,
    lon: 82.9000,
    aliases: ['डोल्पा', 'dolpa', 'phoksundo', 'फोक्सुण्डो', 'dunai', 'दुनै']
  },

  // ==========================================
  // सुदूरपश्चिम प्रदेश (SUDURPASHCHIM - 9 Districts)
  // ==========================================
  'कैलाली': {
    district: 'कैलाली',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'धनगढी-गोदावरी क्षेत्रे',
    riverSanskrit: 'पवित्र कर्णाली-मोहना नदीतीरे बेहडाबाबा क्षेत्रे',
    deitySanskrit: 'श्रीबेहडाबाबा महादेव-गोदावरी धाम चरणसन्निधौ',
    riverNepali: 'कर्णाली र मोहना नदी',
    deityNepali: 'श्री बेहडाबाबा मन्दिर तथा गोदावरी धाम',
    lat: 28.6833,
    lon: 80.6000,
    aliases: ['कैलाली', 'kailali', 'dhangadhi', 'धनगढी', 'attariya', 'अत्तरिया', 'behada', 'बेहडाबाबा']
  },
  'कञ्चनपुर': {
    district: 'कञ्चनपुर',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'महेन्द्रनगर भीमदत्त क्षेत्रे',
    riverSanskrit: 'पवित्र महाकाली नदीतीरे सिद्धनाथ क्षेत्रे',
    deitySanskrit: 'श्रीसिद्धनाथ बाबा-झिलमिला भगवती चरणसन्निधौ',
    riverNepali: 'महाकाली नदी',
    deityNepali: 'श्री सिद्धनाथ मन्दिर तथा झिलमिला',
    lat: 28.9667,
    lon: 80.1833,
    aliases: ['कञ्चनपुर', 'kanchanpur', 'mahendranagar', 'महेन्द्रनगर', 'bhimdatta', 'भीमदत्त', 'siddhanath', 'सिद्धनाथ']
  },
  'डडेल्धुरा': {
    district: 'डडेल्धुरा',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'उग्रतारा पावनक्षेत्रे',
    riverSanskrit: 'पवित्र रङ्गुन-महाकाली नदीतीरे उग्रतारा क्षेत्रे',
    deitySanskrit: 'श्रीउग्रतारा भगवती-घटालबाबा चरणसन्निधौ',
    riverNepali: 'रङ्गुन खोला र महाकाली',
    deityNepali: 'श्री उग्रतारा भगवती तथा घटालबाबा',
    lat: 29.3000,
    lon: 80.5833,
    aliases: ['डडेल्धुरा', 'dadeldhura', 'ugratara', 'उग्रतारा', 'ghatalbaba', 'घटालबाबा']
  },
  'बैतडी': {
    district: 'बैतडी',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'दशरथचन्द निङ्गलाशैनी क्षेत्रे',
    riverSanskrit: 'पवित्र महाकाली-चौल्यानी नदीतीरे',
    deitySanskrit: 'श्रीत्रिपुरासुन्दरी-निङ्गलाशैनी भगवती चरणसन्निधौ',
    riverNepali: 'महाकाली र चौल्यानी नदी',
    deityNepali: 'श्री त्रिपुरासुन्दरी तथा निङ्गलाशैनी',
    lat: 29.5167,
    lon: 80.4167,
    aliases: ['बैतडी', 'baitadi', 'ninglashaini', 'निङ्गलाशैनी', 'patam', 'पाटन']
  },
  'दार्चुला': {
    district: 'दार्चुला',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'खलङ्गा मालिकार्जुन क्षेत्रे',
    riverSanskrit: 'पवित्र महाकाली नदीतीरे मालिकार्जुन धामक्षेत्रे',
    deitySanskrit: 'श्रीमालिकार्जुन धाम (शिव ज्योतिर्लिङ्ग) चरणसन्निधौ',
    riverNepali: 'महाकाली नदी',
    deityNepali: 'श्री मालिकार्जुन धाम',
    lat: 29.8500,
    lon: 80.5333,
    aliases: ['दार्चुला', 'darchula', 'khalanga', 'मालिकार्जुन', 'malikarjun']
  },
  'डोटी': {
    district: 'डोटी',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'दिपायल-सिलगढी क्षेत्रे',
    riverSanskrit: 'पवित्र सेती नदीतीरे शैलेश्वरी शक्तिपीठक्षेत्रे',
    deitySanskrit: 'श्रीशैलेश्वरी भगवती चरणसन्निधौ',
    riverNepali: 'सेती नदी',
    deityNepali: 'श्री शैलेश्वरी भगवती',
    lat: 29.2667,
    lon: 80.9333,
    aliases: ['डोटी', 'doti', 'dipayal', 'दिपायल', 'silgadhi', 'सिलगढी', 'shaileshwori', 'शैलेश्वरी']
  },
  'अछाम': {
    district: 'अछाम',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'वैद्यनाथ धामक्षेत्रे',
    riverSanskrit: 'पवित्र बूढीगङ्गा-कैलाशखोला सङ्गम वैद्यनाथ धामे',
    deitySanskrit: 'श्रीवैद्यनाथ ज्योतिर्लिङ्ग महादेव चरणसन्निधौ',
    riverNepali: 'बूढीगङ्गा र कैलाश खोला',
    deityNepali: 'श्री वैद्यनाथ ज्योतिर्लिङ्ग धाम',
    lat: 29.1167,
    lon: 81.2833,
    aliases: ['अछाम', 'achham', 'mangalsen', 'मङ्गलसेन', 'vaidyanath', 'वैद्यनाथ']
  },
  'बाजुरा': {
    district: 'बाजुरा',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'मार्तडी बडिमालिका क्षेत्रे',
    riverSanskrit: 'पवित्र बूढीगङ्गा नदीतीरे',
    deitySanskrit: 'श्रीबडिमालिका भगवती शक्तिपीठ चरणसन्निधौ',
    riverNepali: 'बूढीगङ्गा नदी',
    deityNepali: 'श्री बडिमालिका भगवती',
    lat: 29.5000,
    lon: 81.5000,
    aliases: ['बाजुरा', 'bajura', 'badimalika', 'बडिमालिका', 'martadi', 'मार्तडी']
  },
  'बझाङ': {
    district: 'बझाङ',
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'चैनपुर सुर्मासरोवर क्षेत्रे',
    riverSanskrit: 'पवित्र सेती नदीतीरे सुर्मासरोवर तीर्थे',
    deitySanskrit: 'श्रीसुर्मादेवी भगवती चरणसन्निधौ',
    riverNepali: 'सेती नदी र सुर्मा सरोवर',
    deityNepali: 'श्री सुर्मादेवी भगवती',
    lat: 29.5667,
    lon: 81.2000,
    aliases: ['बझाङ', 'bajhang', 'chainpur', 'चैनपुर', 'surmasarowar', 'सुर्मासरोवर']
  }
};

/**
 * Resolves sacred location coordinates (river, temple, area) for a given location or coordinates
 */
export function getSacredLocationInfo(
  locationOrName?: string | LocationData | null,
  coordinates?: { latitude: number; longitude: number }
): SacredLocationInfo {
  const defaultKathmanduInfo: SacredLocationInfo = {
    countrySanskrit: 'नेपाल देशे',
    subdivisionSanskrit: 'बागमती मण्डले',
    localitySanskrit: 'काष्ठमण्डप नगरे',
    sacredRiverSanskrit: 'पवित्र बागमती-विष्णुमती-मनोहरा पुण्यतीर्थे',
    prominentDeitySanskrit: 'श्रीपशुपतिनाथ-गुह्येश्वरी-स्वयम्भू चरणसन्निधौ',
    riverNepali: 'बागमती र विष्णुमती नदी',
    deityNepali: 'श्री पशुपतिनाथ तथा गुह्येश्वरी'
  };

  // 1. Extract inputs
  let inputName = '';
  let inputDistrict = '';
  let lat = coordinates?.latitude;
  let lon = coordinates?.longitude;

  if (locationOrName && typeof locationOrName === 'object') {
    inputName = locationOrName.name || '';
    inputDistrict = locationOrName.district || '';
    if (!lat && locationOrName.latitude) lat = locationOrName.latitude;
    if (!lon && locationOrName.longitude) lon = locationOrName.longitude;
  } else if (typeof locationOrName === 'string') {
    inputName = locationOrName.trim();
  }

  // 2. If nothing was supplied, try stored user location
  if (!inputName && !inputDistrict && (!lat || !lon)) {
    const stored = getStoredUserLocation();
    if (stored) {
      inputName = stored.name || '';
      inputDistrict = stored.district || '';
      if (!lat) lat = stored.latitude;
      if (!lon) lon = stored.longitude;
    }
  }

  // 3. Check for coordinates inside string if still missing e.g. "27.71, 85.32"
  if ((!lat || !lon) && inputName) {
    const coordMatch = inputName.match(/([0-9]{2}\.[0-9]+)[^\d]+([0-9]{2}\.[0-9]+)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lon = parseFloat(coordMatch[2]);
    }
  }

  // Helper to convert definition to SacredLocationInfo
  // If coordinates are available, perform full multi-tier sacred geographic search (2km -> 5km -> 10km -> 20km)
  if (lat && lon && lat >= 25.0 && lat <= 31.5 && lon >= 79.0 && lon <= 89.5) {
    const tiered = resolveSacredGeographyByCoordinates(lat, lon, inputName, inputDistrict);
    return {
      countrySanskrit: 'नेपाल देशे',
      subdivisionSanskrit: tiered.sanskritSubdivisionText,
      localitySanskrit: tiered.sanskritLocalityText,
      sacredRiverSanskrit: tiered.sanskritRiverText,
      prominentDeitySanskrit: tiered.sanskritShrineText,
      riverNepali: tiered.nepaliRiverSummary,
      deityNepali: tiered.nepaliShrineSummary,
      riverTierLabel: tiered.riverTierLabelNepali,
      shrineTierLabel: tiered.shrineTierLabelNepali,
      tierSummaryBadge: tiered.tierSummaryBadge,
      shrineDistanceKm: tiered.shrineDistanceKm,
      riverDistanceKm: tiered.riverDistanceKm,
      tierResult: tiered,
    };
  }

  // 4. District Direct Match
  if (inputDistrict) {
    const cleanDist = inputDistrict.trim().toLowerCase();
    for (const [key, data] of Object.entries(NEPAL_SACRED_GEOGRAPHY)) {
      if (key === inputDistrict || data.aliases.some(a => a.toLowerCase() === cleanDist || cleanDist.includes(a.toLowerCase()))) {
        const tiered = resolveSacredGeographyByCoordinates(data.lat, data.lon, inputName || data.locality, key);
        return {
          countrySanskrit: 'नेपाल देशे',
          subdivisionSanskrit: data.subdivision,
          localitySanskrit: data.locality,
          sacredRiverSanskrit: tiered.sanskritRiverText,
          prominentDeitySanskrit: tiered.sanskritShrineText,
          riverNepali: tiered.nepaliRiverSummary,
          deityNepali: tiered.nepaliShrineSummary,
          riverTierLabel: tiered.riverTierLabelNepali,
          shrineTierLabel: tiered.shrineTierLabelNepali,
          tierSummaryBadge: tiered.tierSummaryBadge,
          shrineDistanceKm: tiered.shrineDistanceKm,
          riverDistanceKm: tiered.riverDistanceKm,
          tierResult: tiered,
        };
      }
    }
  }

  // 5. Name Fuzzy / Substring Match
  if (inputName) {
    const cleanText = inputName.toLowerCase().replace(/[\(\)\[\],\/]/g, ' ');
    const tokens = cleanText.split(/\s+/).filter(Boolean);

    for (const [key, data] of Object.entries(NEPAL_SACRED_GEOGRAPHY)) {
      // Check if key or any alias is matched
      if (cleanText.includes(key.toLowerCase()) || data.aliases.some(a => cleanText.includes(a.toLowerCase()))) {
        const tiered = resolveSacredGeographyByCoordinates(data.lat, data.lon, inputName, key);
        return {
          countrySanskrit: 'नेपाल देशे',
          subdivisionSanskrit: data.subdivision,
          localitySanskrit: data.locality,
          sacredRiverSanskrit: tiered.sanskritRiverText,
          prominentDeitySanskrit: tiered.sanskritShrineText,
          riverNepali: tiered.nepaliRiverSummary,
          deityNepali: tiered.nepaliShrineSummary,
          riverTierLabel: tiered.riverTierLabelNepali,
          shrineTierLabel: tiered.shrineTierLabelNepali,
          tierSummaryBadge: tiered.tierSummaryBadge,
          shrineDistanceKm: tiered.shrineDistanceKm,
          riverDistanceKm: tiered.riverDistanceKm,
          tierResult: tiered,
        };
      }
      for (const tok of tokens) {
        if (tok.length > 2 && (key.toLowerCase().includes(tok) || data.aliases.some(a => a.toLowerCase() === tok))) {
          const tiered = resolveSacredGeographyByCoordinates(data.lat, data.lon, inputName, key);
          return {
            countrySanskrit: 'नेपाल देशे',
            subdivisionSanskrit: data.subdivision,
            localitySanskrit: data.locality,
            sacredRiverSanskrit: tiered.sanskritRiverText,
            prominentDeitySanskrit: tiered.sanskritShrineText,
            riverNepali: tiered.nepaliRiverSummary,
            deityNepali: tiered.nepaliShrineSummary,
            riverTierLabel: tiered.riverTierLabelNepali,
            shrineTierLabel: tiered.shrineTierLabelNepali,
            tierSummaryBadge: tiered.tierSummaryBadge,
            shrineDistanceKm: tiered.shrineDistanceKm,
            riverDistanceKm: tiered.riverDistanceKm,
            tierResult: tiered,
          };
        }
      }
    }
  }

  // 6. Proximity / Coordinate-based Reverse Lookup
  if (lat && lon && lat >= 25.5 && lat <= 31.0 && lon >= 79.5 && lon <= 89.0) {
    let closestEntry: SacredGeoDefinition = NEPAL_SACRED_GEOGRAPHY['काठमाडौँ'];
    let minD = 99999;

    for (const data of Object.values(NEPAL_SACRED_GEOGRAPHY)) {
      const d = calculateGeoDistanceKm(lat, lon, data.lat, data.lon);
      if (d < minD) {
        minD = d;
        closestEntry = data;
      }
    }

    if (minD < 120) {
      return formatResult(closestEntry);
    }
  }

  // 7. Graceful Nepal Default (Never show generic fallback)
  if (inputName && inputName.length > 1) {
    const cleanDisplayName = inputName.split('(')[0].trim();
    return {
      countrySanskrit: 'नेपाल देशे',
      subdivisionSanskrit: `${cleanDisplayName} मण्डले`,
      localitySanskrit: `${cleanDisplayName} क्षेत्रे`,
      sacredRiverSanskrit: 'पवित्र बागमती-गण्डकी-कोशी-कर्णाली-सर्वतीर्थ पुण्यसलिला क्षेत्रे',
      prominentDeitySanskrit: 'श्रीपशुपतिनाथ-इष्टदेवता-कुलदेवता चरणसन्निधौ',
      riverNepali: 'बागमती र गण्डकी लगायत पावन नदीहरू',
      deityNepali: 'श्री पशुपतिनाथ तथा स्थानीय देवपीठ'
    };
  }

  return defaultKathmanduInfo;
}

// Map Tithi name to Sanskrit grammatical locative (सप्तमी विभक्ति)
function getTithiSanskritLocative(tithiName: string): string {
  if (!tithiName) return 'शुभ तिथौ';
  const clean = tithiName.split(' ')[0].replace(/[\(\)\d]/g, '').trim();
  const map: Record<string, string> = {
    'प्रतिपदा': 'प्रतिपद्यां तिथौ',
    'द्वितीया': 'द्वितीयायां तिथौ',
    'तृतीया': 'तृतीयायां तिथौ',
    'चतुर्थी': 'चतुर्थ्यां तिथौ',
    'पञ्चमी': 'पञ्चम्यां तिथौ',
    'षष्ठी': 'षष्ठ्यां तिथौ',
    'सप्तमी': 'सप्तम्यां तिथौ',
    'अष्टमी': 'अष्टम्यां तिथौ',
    'नवमी': 'नवम्यां तिथौ',
    'दशमी': 'दशम्यां तिथौ',
    'एकादशी': 'एकादश्यां तिथौ',
    'द्वादशी': 'द्वादश्यां तिथौ',
    'त्रयोदशी': 'त्रयोदश्यां तिथौ',
    'चतुर्दशी': 'चतुर्दश्यां तिथौ',
    'पूर्णिमा': 'पूर्णिमायां पुण्यतिथौ',
    'पौर्णमासी': 'पौर्णमास्यां पुण्यतिथौ',
    'अमावास्या': 'अमावास्यायां पुण्यतिथौ',
    'औंसी': 'अमावास्यायां पुण्यतिथौ',
  };
  return map[clean] || `${clean} तिथौ`;
}

// Map Day name to Sanskrit locative
function getVaraSanskritLocative(dayNepali: string): string {
  if (!dayNepali) return 'शुभ वासरे';
  const map: Record<string, string> = {
    'आइतवार': 'आदित्यवासरे (भानुवासरे)',
    'सोमवार': 'सोमवासरे (इन्दुवासरे)',
    'मंगलबार': 'भौमवासरे (मङ्गलवासरे)',
    'मङ्गलबार': 'भौमवासरे (मङ्गलवासरे)',
    'बुधवार': 'सौम्यवासरे (बुधवासरे)',
    'बिहीबार': 'बृहस्पतिवासरे (गुरुवासरे)',
    'शुक्रवार': 'भृगुवासरे (शुक्रवासरे)',
    'शनिवार': 'मन्दवासरे (शनिवासरे)',
  };
  return map[dayNepali] || `${dayNepali} वासरे`;
}

// Map Month to Sanskrit
function getMasaSanskrit(bsMonthName: string): string {
  const map: Record<string, string> = {
    'बैशाख': 'वैशाख मासे',
    'वैशाख': 'वैशाख मासे',
    'जेठ': 'ज्येष्ठ मासे',
    'ज्येष्ठ': 'ज्येष्ठ मासे',
    'असार': 'आषाढ मासे',
    'आषाढ': 'आषाढ मासे',
    'साउन': 'श्रावण मासे',
    'श्रावण': 'श्रावण मासे',
    'भदौ': 'भाद्रपद मासे',
    'भाद्र': 'भाद्रपद मासे',
    'असोज': 'आश्विन मासे',
    'आश्विन': 'आश्विन मासे',
    'कात्तिक': 'कार्तिक मासे',
    'कार्तिक': 'कार्तिक मासे',
    'मंसिर': 'मार्गशीर्ष मासे',
    'मार्गशीर्ष': 'मार्गशीर्ष मासे',
    'पुस': 'पौष मासे',
    'पौष': 'पौष मासे',
    'माघ': 'माघ मासे',
    'फागुन': 'फाल्गुन मासे',
    'फाल्गुन': 'फाल्गुन मासे',
    'चैत': 'चैत्र मासे',
    'चैत्र': 'चैत्र मासे',
  };
  return map[bsMonthName] || `${bsMonthName} मासे`;
}

export interface DailySankalpaOptions {
  customPujaType?: SankalpaPujaType;
  customGotra?: string;
  customName?: string;
  customLocation?: string | LocationData;
}

export interface DailySankalpaData {
  sanskritText: string;
  nepaliMeaning: string;
  geoInfo: SacredLocationInfo;
  panchangaSummary: string;
  grahaStatusSummary: string;
}

/**
 * Generates Daily Vedic Sankalpa for dashboard card with custom Puja Type, Gotra, Name & Location
 */
export function generateDailyVedicSankalpa(
  panchanga: PanchangaData,
  profile?: BirthDetails | null,
  planets?: PlanetPosition[],
  overrideLocation?: LocationData | string,
  options?: DailySankalpaOptions
): DailySankalpaData {
  const geo = getSacredLocationInfo(options?.customLocation || overrideLocation || profile?.location);

  const dayName = panchanga.dayNameNepali || panchanga.vaar?.name || 'शुभ वार';
  const masaName = panchanga.masaInfo?.masaName || 'वैशाख';
  const paksha = panchanga.tithi?.paksha || 'शुक्ल';
  const yearNum = panchanga.vikramSamvat || 2081;

  const tithiLoc = getTithiSanskritLocative(panchanga.tithi?.name || '');
  const varaLoc = getVaraSanskritLocative(dayName);
  const masaLoc = getMasaSanskrit(masaName);
  const pakshaText = paksha === 'शुक्ल' ? 'शुक्लपक्षे' : 'कृष्णपक्षे';
  const nakshatraLoc = panchanga.nakshatra?.name ? `${panchanga.nakshatra.name} नक्षत्रे` : 'शुभ नक्षत्रे';
  const yogaText = panchanga.yoga?.name ? `${panchanga.yoga.name} योगे` : 'शुभ योगे';
  const karanaText = panchanga.karana?.name ? `${panchanga.karana.name} करणे` : 'शुभ करणे';
  const samvatsarName = panchanga.samvatsara || 'कालयुक्त';
  const rituInfo = getVedicRituInfo(masaName || panchanga.dateBS || 1);
  const rituText = rituInfo.nameNepali;
  const rituSanskritLocative = rituInfo.sanskritLocative;
  const ayanaText = getAyanaForBSMonth(masaName || 1);
  const ayanaSanskrit = ayanaText === 'उत्तरायण' ? 'उत्तरायणे' : 'दक्षिणायने';

  // Graha Rashi Positions
  let sunRashi = panchanga.sunRashi || 'मेष';
  let moonRashi = panchanga.moonRashi || 'वृश्चिक';
  let guruRashi = 'वृष';
  let shaniRashi = 'कुम्भ';
  let rahuRashi = 'मीन';
  let ketuRashi = 'कन्या';

  if (planets && planets.length > 0) {
    const sunP = planets.find(p => p.name === 'सूर्य' || p.englishName?.toLowerCase() === 'sun');
    const moonP = planets.find(p => p.name === 'चन्द्र' || p.englishName?.toLowerCase() === 'moon');
    const guruP = planets.find(p => p.name === 'गुरु' || p.englishName?.toLowerCase() === 'jupiter');
    const shaniP = planets.find(p => p.name === 'शनि' || p.englishName?.toLowerCase() === 'saturn');
    const rahuP = planets.find(p => p.name === 'राहु' || p.englishName?.toLowerCase() === 'rahu');
    const ketuP = planets.find(p => p.name === 'केतु' || p.englishName?.toLowerCase() === 'ketu');

    if (sunP) sunRashi = sunP.rashiName;
    if (moonP) moonRashi = moonP.rashiName;
    if (guruP) guruRashi = guruP.rashiName;
    if (shaniP) shaniRashi = shaniP.rashiName;
    if (rahuP) rahuRashi = rahuP.rashiName;
    if (ketuP) ketuRashi = ketuP.rashiName;
  }

  const shakaYear = yearNum > 135 ? yearNum - 135 : 1946;

  let planetsTransitSanskrit = `सूर्ये ${sunRashi} राशौ, चन्द्रे ${moonRashi} राशौ`;
  if (planets && planets.length > 0) {
    planetsTransitSanskrit += `, देवगुरौ बृहस्पतौ ${guruRashi} राशौ, शनैश्चरे ${shaniRashi} राशौ, राहौ ${rahuRashi} राशौ, केतौ ${ketuRashi} राशौ, एवं शेषेषु ग्रहेषु यथायथा राशिस्थानस्थितेषु सत्सु`;
  } else {
    planetsTransitSanskrit += `, एवं शेषेषु ग्रहेषु यथायथा शुभराशिस्थानस्थितेषु सत्सु`;
  }

  const rawGotra = options?.customGotra || profile?.gotra || profile?.fatherDetails?.gotra || 'अमुक';
  const cleanGotra = rawGotra.replace(/\s*\(.*?\)\s*/g, '').replace(/गोत्र.*$/g, '').trim() || 'अमुक';
  const name = options?.customName || profile?.name || 'अमुक नामाहम्';
  const pujaType = options?.customPujaType || 'daily';
  const pujaDetails = PUJA_TYPE_DETAILS[pujaType] || PUJA_TYPE_DETAILS.daily;

  const purposeSanskrit = pujaType === 'daily'
    ? 'नित्य वैदिक भगवत्पूजनं, सन्ध्यावन्दनं, देवतार्चनं, मङ्गलकर्म चाहं करिष्ये'
    : `${pujaDetails.sanskritPurpose} चाहं सानन्दं करिष्ये`;

  const sanskritText = `ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य ब्रह्मणो द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे कलिप्रथमचरणे, भूर्लोके जम्बूद्वीपे भरतखण्डे भारतवर्षे आर्यावर्तैकदेशे पुण्यतमे नेपालदेशे, ${geo.subdivisionSanskrit}, ${geo.localitySanskrit}, पवित्र-सुरसरित्-सदृश ${geo.sacredRiverSanskrit}, ${geo.prominentDeitySanskrit} पावन-चरणसन्निधौ, श्रीविक्रमादित्य नृपतेः शकाब्दे संवत् ${toDevanagariNumerals(yearNum)} प्रवर्त्तमाने श्रीविक्रमार्कशके ${samvatsarName} नाम संवत्सरे, श्रीशालिवाहन शके ${toDevanagariNumerals(shakaYear)}, श्रीसूर्ये ${ayanaSanskrit}, ${rituSanskritLocative}, महामाङ्गल्यप्रदे शुभे ${masaLoc}, ${pakshaText}, ${tithiLoc}, ${varaLoc}, ${nakshatraLoc}, ${yogaText}, ${karanaText}, आनन्दादि योगमध्ये शुभयोगे, ग्रहगोचर स्थितिज्ञानेन ${planetsTransitSanskrit}, एवं गुणविशेषणविशिष्टायां शुभपुण्यतिथौ, ${cleanGotra} गोत्रोत्पन्नः ${name} नामाहं, सपत्नीकः सपुत्र-पौत्र-सकुटुम्ब-सपरिवार-सहितोऽहम्, मम आत्मनः श्रुतिस्मृतिपुराणोक्त-समस्तपुण्यफलप्राप्त्यर्थं, कायिक-वाचिक-मानसिक-सांसर्गिक-सकलदुरितोपशान्त्यर्थं, आधिव्याधि-जरामृत्यु-भयनिवारणपूर्वकं दीर्घायुः-आरोग्य-ऐश्वर्य-सन्तति-यशः-कीर्ति-अभिवृद्ध्यर्थं, श्रीसूर्यादिनवग्रहदेवतानां प्रसादेन अनुकूलतासिद्ध्यर्थं, धर्मार्थकाममोक्ष-चतुर्विधपुरुषार्थसिद्धये, इष्टदेवता-कुलदेवता-स्थानदेवता-वास्तुदेवता-प्रीत्यर्थं च अद्य प्रातःकाले (सायङ्काले वा) यथाज्ञानं यथामिलितोपचारैः ${purposeSanskrit}। तत्पूर्वाङ्गत्वेन निर्विघ्नतासिद्ध्यर्थं श्रीगणेशस्मरणपूर्वकं कलशार्चनादि पूजनकर्म सम्पादयामि। ॥ ॐ तत्सत्, श्रीब्रह्मार्पणमस्तु ॥`;

  const nepaliMeaning = `ॐ श्रीविष्णु भगवान्‌को आज्ञाले यस अनन्त ब्रह्माण्डीय सृष्टि-चक्र अन्तर्गत ब्रह्माजीको ५१औँ वर्षको द्वितीय परार्ध, श्वेतवाराह कल्प, वैवस्वत मन्वन्तर तथा २८औँ कलियुगको प्रथम चरणमा, जम्बूद्वीप भरतखण्ड अन्तर्गत पावन नेपाल देश, ${geo.subdivisionSanskrit}, ${geo.localitySanskrit} मा पवित्र ${geo.riverNepali} को पावन तट एवं ${geo.deityNepali} को पवित्र सानिध्यमा; आज श्रीविक्रम संवत् ${toDevanagariNumerals(yearNum)} (शालिवाहन शक ${toDevanagariNumerals(shakaYear)}) ${samvatsarName} संवत्सर, ${ayanaText}, ${rituText} ऋतु, ${masaName} ${paksha} पक्षको ${panchanga.tithi?.name || ''} तिथि, ${dayName} वार, ${panchanga.nakshatra?.name || ''} नक्षत्र, ${panchanga.yoga?.name || ''} योग, ${panchanga.karana?.name || ''} करणको शुभ घडीमा तथा नवग्रह गोचरमा सूर्यदेव ${sunRashi} राशिमा, चन्द्रमा ${moonRashi} राशिमा एवं बृहस्पति, शनि, राहु-केतु लगायत सबै ग्रहहरू आ-आफ्नो राशिमा गोचर भइरहँदा: म (${name}, ${cleanGotra} गोत्रोत्पन्न, सपरिवार) आफ्नो तथा सम्पूर्ण परिवारको कायिक, वाचिक र मानसिक पापकष्ट निवारण, दीर्घायु, सुस्वास्थ्य, धनधान्य, यश-कीर्ति, नवग्रह कृपा एवं धर्म, अर्थ, काम, मोक्ष चारै पुरुषार्थ सिद्धिका लागि ${pujaDetails.nepaliPurpose} सहित भगवान्‌को नित्य वैदिक पूजा, आराधना तथा सङ्कल्प गर्दछु।`;

  const panchangaSummary = `${pujaDetails.labelNepali} • ${toDevanagariNumerals(yearNum)} ${masaName} • ${paksha} पक्ष • ${panchanga.tithi?.name || ''} • ${panchanga.nakshatra?.name || ''} • ${dayName}`;
  const grahaStatusSummary = `सूर्य: ${sunRashi} | चन्द्र: ${moonRashi} | संवत्सर: ${samvatsarName}`;

  return {
    sanskritText,
    nepaliMeaning,
    geoInfo: geo,
    panchangaSummary,
    grahaStatusSummary
  };
}

export type SankalpaPujaType = 
  | 'daily' // नित्य पूजा
  | 'rudri' // रुद्राभिषेक
  | 'havan' // हवन / होम
  | 'satyanarayan' // सत्यनारायण व्रत
  | 'ekadashi' // एकादशी व्रत
  | 'birthday' // जन्मोत्सव / जन्मदिन
  | 'navagraha' // नवग्रह शान्ति
  | 'pitru' // पितृ तर्पण / श्राद्ध
  | 'vastu' // वास्तु शान्ति
  | 'general'; // सर्वकार्य सिद्धि

export interface MahaSankalpaOptions {
  panchanga: PanchangaData;
  profile?: BirthDetails | null;
  planets?: PlanetPosition[];
  pujaType?: SankalpaPujaType;
  customGotra?: string;
  customName?: string;
  customLocation?: string | LocationData;
  familyMembersIncluded?: boolean;
}

export interface MahaSankalpaData {
  title: string;
  sanskritFullText: string;
  nepaliFullTranslation: string;
  ritualStepsNepali: string[];
  pujaTypeLabelNepali: string;
  geoInfo: SacredLocationInfo;
  planetsFormattedList: string[];
}

export const PUJA_TYPE_DETAILS: Record<SankalpaPujaType, {
  labelNepali: string;
  sanskritPurpose: string;
  nepaliPurpose: string;
}> = {
  daily: {
    labelNepali: 'नित्य दैनिक पूजा सङ्कल्प',
    sanskritPurpose: 'मम आत्मनः कायिक-वाचिक-मानसिक-पापक्षयार्थं, श्रुतिस्मृतिपुराणोक्त फलप्राप्त्यर्थं, नित्य पूजाकर्म',
    nepaliPurpose: 'दैनिक पूजा, कुलदेवता स्मरण र सम्पूर्ण परिवारको आरोग्य एवं सुख शान्तिका लागि'
  },
  rudri: {
    labelNepali: 'श्री रुद्राभिषेक / शिव आराधना सङ्कल्प',
    sanskritPurpose: 'श्रीमहामृत्युञ्जय-सदाशिवप्रीत्यर्थं, अकालमृत्युहरणार्थं, महारोग-शोक-भयनिवारणार्थं, श्रीरुद्राभिषेककर्म',
    nepaliPurpose: 'अकाल मृत्यु हरण, महारोग निवारण र भगवान् शिवको अनुग्रह प्राप्तिका लागि रुद्राभिषेक'
  },
  havan: {
    labelNepali: 'वैदिक हवन तथा यज्ञ सङ्कल्प',
    sanskritPurpose: 'अग्निनारायणप्रीत्यर्थं, वास्तु-नवग्रहदोषोपशान्त्यर्थं, विश्वकल्याणार्थं, विधिपूर्वक होम-हवनकर्म',
    nepaliPurpose: 'अग्निदेवताको आराधना, वास्तुदोष निवारण र वातावरण शुद्धिका लागि वैदिक हवन'
  },
  satyanarayan: {
    labelNepali: 'श्रीसत्यनारायण व्रत एवं कथा सङ्कल्प',
    sanskritPurpose: 'श्रीनारायणप्रीत्यर्थं, धनधान्य-सन्तति-सौभाग्यवृद्ध्यर्थं, श्रीसत्यनारायणपूजा तथा व्रतकथा श्रवणकर्म',
    nepaliPurpose: 'धनधान्य, सन्तति, सुख समृद्धि तथा मनोकामना पूर्ण गर्न सत्यनारायण कथा'
  },
  ekadashi: {
    labelNepali: 'हरि वासर एकादशी व्रत सङ्कल्प',
    sanskritPurpose: 'श्रीमहाविष्णु-लक्ष्मीप्रीत्यर्थं, मोक्षप्राप्त्यर्थं, एकादशीव्रतोपवासकर्म',
    nepaliPurpose: 'परमपद मोक्ष प्राप्ति र भगवान् नारायणको प्रिय एकादशी व्रत अनुष्ठान'
  },
  birthday: {
    labelNepali: 'जन्मोत्सव (Birthday) आयुर्वृद्धि सङ्कल्प',
    sanskritPurpose: 'अष्टचिरञ्जीविप्रीत्यर्थं, दीर्घायुर्बल-आरोग्य-विद्या-कीर्ति-यशसंवर्धनार्थं, जन्मोत्सव पूजनकर्म',
    nepaliPurpose: 'अश्वत्थामा, बलि, व्यास, हनुमान्, विभीषण, कृपाचार्य, परशुराम, मार्कण्डेय अष्टचिरञ्जीवी स्मरणपूर्वक दीर्घायु प्राप्तिका लागि'
  },
  navagraha: {
    labelNepali: 'नवग्रह शान्ति तथा ग्रहदोष निवारण',
    sanskritPurpose: 'सूर्य-सोम-मङ्गल-बुध-बृहस्पति-शुक्र-शनि-राहु-केतु-नवग्रहाणां अरिष्टनिवारणार्थं, अनुकूलतासिद्धयर्थं, नवग्रहशान्तिकर्म',
    nepaliPurpose: 'जन्मकुण्डली तथा गोचरका प्रतिकूल ग्रहदोष निवारण एवं शुभ फल प्राप्तिका लागि नवग्रह पूजा'
  },
  pitru: {
    labelNepali: 'पितृ तर्पण / श्राद्ध सङ्कल्प',
    sanskritPurpose: 'मातृ-पितृ-पितामह-आदि-समस्तपितॄणां अक्षयतृप्त्यर्थं, वैकुण्ठवासार्थं, तर्पण-श्राद्धकर्म',
    nepaliPurpose: 'मातृ-पितृ कुलका पितृहरूको मोक्ष एवं तृप्तिका लागि वैदिक तर्पण'
  },
  vastu: {
    labelNepali: 'गृह वास्तु शान्ति सङ्कल्प',
    sanskritPurpose: 'वास्तुपुरुष-दिक्पालप्रीत्यर्थं, गृहदोष-शल्यादिनिवारणार्थं, गृहशान्तिकर्म',
    nepaliPurpose: 'आवासीय तथा व्यापारिक भवनको वास्तुदोष निवारण र स्थायी शान्ति'
  },
  general: {
    labelNepali: 'सर्वकार्य सिद्धि सङ्कल्प',
    sanskritPurpose: 'सर्वविघ्नविनाशार्थं, धर्मार्थकाममोक्ष-चतुर्विधपुरुषार्थसिद्धयर्थं, शुभकर्म',
    nepaliPurpose: 'सम्पूर्ण विघ्नबाधा नाश गरी सम्पूर्ण कार्यहरू निर्विघ्न सम्पन्न गर्न'
  }
};

export const COMMON_GOTRAS = [
  'अमुक (आफ्नो गोत्र)',
  'कश्यप',
  'भारद्वाज',
  'अङ्गिरा (अंगिरस)',
  'अत्रि',
  'गौतम',
  'वशिष्ठ',
  'विश्वामित्र',
  'जमदग्नि',
  'कौशिक',
  'पराशर',
  'उपमन्यु',
  'धनञ्जय',
  'माण्डव्य',
  'गर्ग',
  'शाण्डिल्य',
  'मुद्गल',
  'वत्स',
  'कुत्स',
  'कपिल',
  'स्वगोत्र (आफ्नो गोत्र)'
];

/**
 * Generates the Complete Vedic Maha Sankalpa (बृहत् महासङ्कल्प)
 */
export function generateMahaSankalpa(options: MahaSankalpaOptions): MahaSankalpaData {
  const {
    panchanga,
    profile,
    planets,
    pujaType = 'daily',
    customGotra,
    customName,
    customLocation,
    familyMembersIncluded = true
  } = options;

  const geo = getSacredLocationInfo(customLocation || profile?.location);
  const purpose = PUJA_TYPE_DETAILS[pujaType] || PUJA_TYPE_DETAILS.daily;

  const dayName = panchanga.dayNameNepali || panchanga.vaar?.name || 'शुभ वार';
  const masaName = panchanga.masaInfo?.masaName || 'वैशाख';
  const paksha = panchanga.tithi?.paksha || 'शुक्ल';
  const yearNum = panchanga.vikramSamvat || 2081;

  const tithiLoc = getTithiSanskritLocative(panchanga.tithi?.name || '');
  const varaLoc = getVaraSanskritLocative(dayName);
  const masaLoc = getMasaSanskrit(masaName);
  const pakshaText = paksha === 'शुक्ल' ? 'शुक्लपक्षे' : 'कृष्णपक्षे';
  const nakshatraLoc = panchanga.nakshatra?.name ? `${panchanga.nakshatra.name} नक्षत्रे` : 'शुभ नक्षत्रे';
  const yogaText = panchanga.yoga?.name ? `${panchanga.yoga.name} योगे` : 'विष्कम्भादि योगे';
  const karanaText = panchanga.karana?.name ? `${panchanga.karana.name} करणे` : 'बवादि करणे';
  const samvatsarName = panchanga.samvatsara || 'कालयुक्त';
  const rituInfo = getVedicRituInfo(masaName || panchanga.dateBS || 1);
  const rituText = rituInfo.nameNepali;
  const rituSanskritLocative = rituInfo.sanskritLocative;
  const ayanaText = getAyanaForBSMonth(masaName || 1);
  const ayanaSanskrit = ayanaText === 'उत्तरायण' ? 'उत्तरायणे' : 'दक्षिणायने';

  // Graha status
  let sunR = panchanga.sunRashi || 'मेष';
  let moonR = panchanga.moonRashi || 'वृश्चिक';
  let guruR = 'वृष';
  const planetsFormattedList: string[] = [];

  if (planets && planets.length > 0) {
    planets.forEach(p => {
      planetsFormattedList.push(`${p.name}: ${p.rashiName} (${p.formattedDegree})`);
      if (p.name === 'सूर्य' || p.englishName?.toLowerCase() === 'sun') sunR = p.rashiName;
      if (p.name === 'चन्द्र' || p.englishName?.toLowerCase() === 'moon') moonR = p.rashiName;
      if (p.name === 'गुरु' || p.englishName?.toLowerCase() === 'jupiter') guruR = p.rashiName;
    });
  }

  const rawGotra = customGotra || profile?.gotra || profile?.fatherDetails?.gotra || 'अमुक';
  const cleanGotra = rawGotra.replace(/\s*\(.*?\)\s*/g, '').replace(/गोत्र.*$/g, '').trim() || 'अमुक';
  const name = customName || profile?.name || 'अमुक नामाहम्';
  const familyClause = familyMembersIncluded ? 'सपत्नीकस्य, सपरिवारस्य, सपुत्र-पौत्रादि-सहितस्य' : 'मम आत्मनः';

  const sanskritFullText = `॥ अथ बृहत् वैदिक महासङ्कल्पः ॥

ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य श्रीब्रह्मणो द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे युगे कलियुगे कलिप्रथमचरणे, भूर्लोके जम्बूद्वीपे भरतखण्डे भारतवर्षे आर्यावर्तैकदेशे पुण्यपवित्र ${geo.countrySanskrit}, ${geo.subdivisionSanskrit}, ${geo.localitySanskrit}, ${geo.sacredRiverSanskrit}, ${geo.prominentDeitySanskrit},

श्रीविक्रमादित्य नृपतेः शकाब्दे ${toDevanagariNumerals(yearNum)} प्रवर्त्तमाने श्रीविक्रमार्कशके ${samvatsarName} नाम संवत्सरे, श्रीसूर्ये ${ayanaSanskrit}, ${rituSanskritLocative}, महामाङ्गल्यप्रदे शुभे ${masaLoc}, ${pakshaText}, ${tithiLoc}, ${varaLoc}, ${nakshatraLoc}, ${yogaText}, ${karanaText}, आनन्दादि योगमध्ये शुभयोगे,

ग्रहगोचर स्थितिज्ञानेन:
सूर्ये ${sunR} राशौ स्थिते, चन्द्रे ${moonR} राशौ स्थिते, देवगुरौ बृहस्पतौ ${guruR} राशौ स्थिते, एवं शेषेषु ग्रहेषु यथायथा राशिस्थानस्थितेषु सत्सु, एवं ग्रहगुणविशेषणविशिष्टायां शुभपुण्यतिथौ—

${cleanGotra} गोत्रोत्पन्नस्य, ${name} शर्मणः/वर्मणः/गुप्तस्य, ${familyClause} मम आत्मनः श्रुतिस्मृतिपुराणोक्त पुण्यफलप्राप्त्यर्थं, ममोपात्त दुरितक्षयद्वारा श्रीपरमेश्वरप्रीत्यर्थं, कायिक-वाचिक-मानसिक-सांसर्गिक-सकलपापक्षयार्थं, आयुर्बलारोग्यैश्वर्याभिवद्ध्यर्थं, श्रीसूर्यादिनवग्रहदेवताप्रसादसिद्धयर्थं, मनोवाञ्छितफलप्राप्त्यर्थं, धर्मार्थकाममोक्ष-चतुर्विधपुरुषार्थसिद्धयर्थं—

अद्य अस्मिन् मङ्गलप्रदे दिने ${purpose.sanskritPurpose} अहम् आचार्योपाध्याय-ब्राह्मणद्वारा / स्वयमेव सानन्दं सङ्कल्पं करिष्ये।

॥ ॐ तत्सद् ब्रह्माऽर्पणमस्तु ॥`;

  const nepaliFullTranslation = `॥ बृहत् महासङ्कल्पको सरल नेपाली व्याख्या ॥

ॐ परमब्रह्म परमात्मा श्रीविष्णु भगवान्‌को आज्ञाले यस अनन्त सृष्टि चक्रमा:
१. काल गणना: ब्रह्माजीको दोस्रो परार्ध, श्वेतवाराह कल्प, वैवस्वत मन्वन्तर, २८औं कलियुगको प्रथम चरणमा।
२. भूगोल विवरण: जम्बूद्वीप, भरतखण्ड, नेपाल देश, ${geo.subdivisionSanskrit} अन्तर्गत ${geo.localitySanskrit}, पावन ${geo.riverNepali} को पवित्र तट तथा साक्षात् ${geo.deityNepali} को सानिध्यमा।
३. पञ्चाङ्ग गणना: विक्रम संवत् ${toDevanagariNumerals(yearNum)}, ${samvatsarName} संवत्सर, ${ayanaText}, ${rituText} ऋतु, ${masaLoc}, ${paksha} पक्ष, ${panchanga.tithi?.name || ''} तिथि, ${dayName} वार, ${panchanga.nakshatra?.name || ''} नक्षत्रको महापुण्य समयमा।
४. ग्रह स्थिति: सूर्यदेव ${sunR} राशिमा, चन्द्रमा ${moonR} राशिमा, र देवगुरु बृहस्पति ${guruR} राशिमा रहँदा।
५. सङ्कल्प कर्ता: ${cleanGotra} गोत्रोत्पन्न, ${name} (तथा सम्पूर्ण परिवार)।
६. सङ्कल्पको उद्देश्य: ${purpose.nepaliPurpose}, समस्त पाप नाश, आरोग्य, ऐश्वर्य तथा धर्म, अर्थ, काम र मोक्ष प्राप्तिका लागि म पूर्ण श्रद्धा र भक्तिपूर्वक यो सङ्कल्प गर्दछु।`;

  const ritualStepsNepali = [
    '१. हातमा कुशको औंठी (पवित्र) लगाउनुहोस्।',
    '२. दायाँ हातको हत्केलामा शुद्ध जल, तिल, कुश, चामल (अक्षता), फूल, दुबो र दक्षिणा (सिक्का) लिनुहोस्।',
    '३. बायाँ हातले दायाँ हातको तलबाट आधार दिनुहोस् र भगवान्‌को स्मरण गर्दै माथिको महासङ्कल्प पाठ गर्नुहोस् वा सुन्नुहोस्।',
    '४. सङ्कल्पको अन्त्यमा "करिष्ये" भन्दा हातमा लिएको सम्पूर्ण सामग्री तामाको थाली वा भुइँमा अर्घ्य पात्रमा श्रद्धापूर्वक समर्पण गर्नुहोस्।'
  ];

  return {
    title: `बृहत् वैदिक महासङ्कल्प (${purpose.labelNepali})`,
    sanskritFullText,
    nepaliFullTranslation,
    ritualStepsNepali,
    pujaTypeLabelNepali: purpose.labelNepali,
    geoInfo: geo,
    planetsFormattedList
  };
}

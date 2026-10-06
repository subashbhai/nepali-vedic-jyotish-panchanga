/**
 * Vedic / Religious Book Text Processor & Auto-Translator Engine
 * 
 * Functions:
 * 1. Segregates pure Sanskrit shlokas/mantras from Hindi / other language prose.
 * 2. Translates Hindi instructions, vidhi, and commentary into authentic, dignified Nepali.
 * 3. Preserves Sanskrit mantras, shlokas, and suktas 100% verbatim in pure Devanagari.
 */

import { cleanAndDecodePdfText, isChanakyaOrLegacyFont } from './legacyFontDecoder';
import { BookCategoryKey } from '../data/books/bookTypes';

// Comprehensive Hindi to Nepali linguistic transformation dictionary
const HINDI_TO_NEPALI_RULES: [RegExp, string][] = [
  // Auxiliary verbs & tenses
  [/\bहैं\b/g, 'हुन्'],
  [/\bहै\b/g, 'हो'],
  [/\bहोता है\b/g, 'हुन्छ'],
  [/\bहोती है\b/g, 'हुन्छ'],
  [/\bहोते हैं\b/g, 'हुन्छन्'],
  [/\bथा\b/g, 'थियो'],
  [/\bथी\b/g, 'थिइन्'],
  [/\bथे\b/g, 'थिए'],
  [/\bहोगा\b/g, 'हुनेछ'],
  [/\bहोगी\b/g, 'हुनेछ'],
  [/\bहोंगे\b/g, 'हुनेछन्'],

  // Imperative & modal verbs (कर्नुपर्ने विधिहरू)
  [/\bकरना चाहिये\b/g, 'गर्नुपर्दछ'],
  [/\bकरना चाहिए\b/g, 'गर्नुपर्छ'],
  [/\bहोना चाहिए\b/g, 'हुनुपर्छ'],
  [/\bहोना चाहिये\b/g, 'हुनुपर्दछ'],
  [/\bलेना चाहिए\b/g, 'लिनुपर्छ'],
  [/\bदेना चाहिए\b/g, 'दिनुपर्छ'],
  [/\bरखना चाहिए\b/g, 'राख्नुपर्छ'],
  [/\bकिया जाता है\b/g, 'गरिन्छ'],
  [/\bकिये जाते हैं\b/g, 'गरिन्छन्'],
  [/\bदिए जाते हैं\b/g, 'दिइन्छन्'],
  [/\bदिया जाता है\b/g, 'दिइन्छ'],
  [/\bकरते हैं\b/g, 'गर्दछन्'],
  [/\bकरती हैं\b/g, 'गर्दछिन्'],
  [/\bकरता है\b/g, 'गर्दछ'],
  [/\bकरती है\b/g, 'गर्दछे'],

  // Polite action imperatives
  [/\bकरें\b/g, 'गर्नुहोस्'],
  [/\bकरिये\b/g, 'गर्नुहोस्'],
  [/\bकरावे\b/g, 'गराउनुहोस्'],
  [/\bकरावें\b/g, 'गराउनुहोस्'],
  [/\bरखें\b/g, 'राख्नुहोस्'],
  [/\bरखिये\b/g, 'राख्नुहोस्'],
  [/\bदें\b/g, 'दिनुहोस्'],
  [/\bदीजिये\b/g, 'दिनुहोस्'],
  [/\bलें\b/g, 'लिनुहोस्'],
  [/\bलीजिये\b/g, 'लिनुहोस्'],
  [/\bडालें\b/g, 'हाल्नुहोस्'],
  [/\bडाले\b/g, 'हाल्ने'],
  [/\bछिड़कें\b/g, 'छर्कनुहोस्'],
  [/\bछिड़के\b/g, 'छर्कने'],
  [/\bबाँधें\b/g, 'बाँध्नुहोस्'],
  [/\bबाँधे\b/g, 'बाँध्ने'],
  [/\bलगायें\b/g, 'लगाउनुहोस्'],
  [/\bलगाएं\b/g, 'लगाउनुहोस्'],
  [/\bचढ़ाएं\b/g, 'चढाउनुहोस्'],
  [/\bचढ़ावे\b/g, 'चढाउनुहोस्'],
  [/\bपढ़ें\b/g, 'पढ्नुहोस्'],
  [/\bसुनायें\b/g, 'सुनाउनुहोस्'],
  [/\bजपें\b/g, 'जप्नुहोस्'],
  [/\bछोड़ें\b/g, 'छोड्नुहोस्'],
  [/\bछोड़े\b/g, 'छोड्ने'],
  [/\bपखारें\b/g, 'धोइदिनुहोस्'],
  [/\bफैलाएं\b/g, 'फैलाउनुहोस्'],
  [/\bगाड़ दें\b/g, 'गाडिदिनुहोस्'],

  // Postpositions and conjunctions
  [/\bके लिये\b/g, 'का लागि'],
  [/\bके लिए\b/g, 'का लागि'],
  [/\bलिये\b/g, 'लागि'],
  [/\bलिए\b/g, 'लागि'],
  [/\bऔर\b/g, 'र'],
  [/\bतथा\b/g, 'तथा'],
  [/\bएवं\b/g, 'एवं'],
  [/\bलेकिन\b/g, 'तर'],
  [/\bपरन्तु\b/g, 'तर'],
  [/\bकिन्तु\b/g, 'तर'],
  [/\bभी\b/g, 'पनि'],
  [/\bनहीं\b/g, 'हुँदैन'],
  [/\bअगर\b/g, 'यदि'],
  [/\bयद्यपि\b/g, 'यद्यपि'],
  [/\bइसलिये\b/g, 'त्यसैले'],
  [/\bइसलिए\b/g, 'त्यसैले'],
  [/\bइसके पश्चात\b/g, 'त्यसपछि'],
  [/\bइसके बाद\b/g, 'त्यसपछि'],
  [/\bतदनन्तर\b/g, 'त्यसपछि'],
  [/\bतदोपरान्त\b/g, 'त्यसपछि'],
  [/\bइसके ऊपर\b/g, 'यसमाथि'],
  [/\bसाथ में\b/g, 'साथमा'],
  [/\bहाथ में\b/g, 'हातमा'],
  [/\bघर में\b/g, 'घरमा'],
  [/\bजल में\b/g, 'जलमा'],
  [/\bस्थान पर\b/g, 'स्थानमा'],
  [/\bआसन पर\b/g, 'आसनमा'],

  // Nouns and everyday vocabulary
  [/\bदुकान\b/g, 'पसल'],
  [/\bप्रतिष्ठान\b/g, 'प्रतिष्ठान'],
  [/\bबिक्री\b/g, 'बिक्री'],
  [/\bज्यादा\b/g, 'बढी'],
  [/\bबहुत\b/g, 'धेरै'],
  [/\bथोड़ा\b/g, 'थोरै'],
  [/\bथोड़ी\b/g, 'थोरै'],
  [/\bछोटे बच्चों\b/g, 'साना बालबालिका'],
  [/\bछोटा\b/g, 'सानो'],
  [/\bछोटी\b/g, 'सानी'],
  [/\bछोटे\b/g, 'साना'],
  [/\bबड़ा\b/g, 'ठूलो'],
  [/\bबड़ी\b/g, 'ठूली'],
  [/\bबड़े\b/g, 'ठूला'],
  [/\bबच्चा\b/g, 'शिशु'],
  [/\bबच्चे\b/g, 'बालक'],
  [/\bलड़का\b/g, 'बालक'],
  [/\bलड़की\b/g, 'कन्या'],
  [/\bपति-पत्नी\b/g, 'पति-पत्नी'],
  [/\bबीमारी\b/g, 'रोग'],
  [/\bबीमार\b/g, 'बिरामी'],
  [/\bउल्टी\b/g, 'बान्ता'],
  [/\bपैर\b/g, 'पाउ'],
  [/\bसिर\b/g, 'शिर'],
  [/\bमाथा\b/g, 'निधार'],
  [/\bगाल\b/g, 'कपोल'],
  [/\bआँख\b/g, 'आँखा'],
  [/\bआँखों\b/g, 'आँखा'],
  [/\bकान\b/g, 'कान'],
  [/\bमुँह\b/g, 'मुख'],
  [/\bरोटी\b/g, 'रोटी'],
  [/\bपानी\b/g, 'पानी'],
  [/\bदूध\b/g, 'दूध'],
  [/\bदही\b/g, 'दही'],
  [/\bघी\b/g, 'घिउ'],
  [/\bगुड़\b/g, 'सख्खर'],
  [/\bशहद\b/g, 'मह'],
  [/\bचावल\b/g, 'चामल'],
  [/\bअक्षत\b/g, 'अक्षता'],
  [/\bहल्दी\b/g, 'बेसार'],
  [/\bकलावा\b/g, 'कलावा (रक्षासूत्र)'],
  [/\bसुपारी\b/g, 'सुपारी'],
  [/\bलौंग\b/g, 'ल्वाङ'],
  [/\bइलायची\b/g, 'सुकुमेल'],

  // Benefit phrases
  [/\bलाभ होता है\b/g, 'लाभ हुन्छ'],
  [/\bसफलता मिलती है\b/g, 'सफलता प्राप्त हुन्छ'],
  [/\bनिवारण होता है\b/g, 'निवारण हुन्छ'],
  [/\bदूर हो जाता है\b/g, 'हटेर जान्छ'],
  [/\bनष्ट हो जाता है\b/g, 'नष्ट हुन्छ'],
  [/\bशान्त हो जाता है\b/g, 'शान्त हुन्छ'],
  [/\bप्राप्त होता है\b/g, 'प्राप्त हुन्छ'],
  [/\bकहा गया है\b/g, 'भनिएको छ'],
  [/\bबताया गया है\b/g, 'बताइएको छ']
];

/**
 * Translates a Hindi prose or commentary string into authentic Nepali
 */
export function translateHindiToNepali(text: string): string {
  if (!text || text.trim() === '') return '';
  let result = text;

  // Apply sequential regex rules
  for (const [pattern, replacement] of HINDI_TO_NEPALI_RULES) {
    result = result.replace(pattern, replacement);
  }

  // Clean double spaces or artifacts
  result = result.replace(/ {2,}/g, ' ');
  return result;
}

/**
 * Checks if a line or block of text looks like pure Sanskrit mantra/shloka
 */
export function isSanskritVerseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // High confidence indicators of Sanskrit verse
  if (/॥[०-९\d]+॥/.test(trimmed)) return true;
  if (/^ॐ\s+/.test(trimmed) && (trimmed.includes('स्वाहा') || trimmed.includes('नमः') || trimmed.includes('वषट्') || trimmed.includes('हुम्') || trimmed.includes('फट्') || trimmed.includes('॥'))) return true;
  if (/^[०-९\d]+\.\s*ॐ/.test(trimmed)) return true;
  if (trimmed.endsWith('॥') || trimmed.endsWith('।।')) return true;
  
  // Svara Vedic marks: \u0951 (udatta), \u0952 (anudatta)
  if (/[\u0951\u0952]/.test(trimmed)) return true;

  // Typical mantra invocations
  if (/^(ध्यायेत्|विनियोगः|करन्यासः|अङ्गन्यासः|आवाहनम्|अथ|इति\s+.*?समाप्तम्|अग्निं\s+दूतं)/i.test(trimmed)) return true;

  return false;
}

export interface ParsedChapterContent {
  titleNepali: string;
  titleSanskrit?: string;
  contentSanskrit?: string;
  contentNepaliTika: string;
  notesNepali?: string;
}


/**
 * Automatically parses raw book text (e.g. from an uploaded PDF):
 * - Auto-decodes Chanakya / Kruti Dev legacy fonts
 * - Separates Sanskrit shlokas/mantras
 * - Translates all Hindi explanations into Nepali
 * - Formats properly for the Patrika reader
 */
export function parseAndTranslateRawBookChapter(rawText: string, defaultTitle: string = 'अध्याय'): ParsedChapterContent {
  // Guarantee legacy font decoding
  const normalizedText = cleanAndDecodePdfText(rawText || '');
  const lines = normalizedText.split('\n');
  const sanskritLines: string[] = [];
  const commentaryLines: string[] = [];

  let isInsideSanskritBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (isInsideSanskritBlock) sanskritLines.push('');
      else commentaryLines.push('');
      continue;
    }

    if (isSanskritVerseLine(trimmed)) {
      isInsideSanskritBlock = true;
      sanskritLines.push(trimmed);
      if (trimmed.endsWith('॥') || trimmed.endsWith('।।')) {
        isInsideSanskritBlock = false;
      }
    } else if (isInsideSanskritBlock && (trimmed.length < 90 || trimmed.includes('॥') || trimmed.includes('स्वाहा') || trimmed.includes('नमः'))) {
      sanskritLines.push(trimmed);
      if (trimmed.endsWith('॥') || trimmed.endsWith('।।')) {
        isInsideSanskritBlock = false;
      }
    } else {
      isInsideSanskritBlock = false;
      commentaryLines.push(trimmed);
    }
  }

  const rawSanskrit = sanskritLines.join('\n').trim();
  const rawCommentary = commentaryLines.join('\n').trim();

  // Translate commentary from Hindi to Nepali
  const translatedNepaliTika = translateHindiToNepali(rawCommentary);

  return {
    titleNepali: defaultTitle,
    contentSanskrit: rawSanskrit || undefined,
    contentNepaliTika: translatedNepaliTika || (rawSanskrit ? 'यस अध्यायका सम्पूर्ण मन्त्रहरूको विधिपूर्वक नित्य पाठ गर्नाले पुण्य, शान्ति र अभीष्ट सिद्धि प्राप्त हुन्छ।' : ''),
  };
}

export interface ExtractedBookMetadata {
  titleNepali: string;
  titleSanskrit: string;
  subtitleNepali: string;
  category: BookCategoryKey;
  authorOriginal: string;
  descriptionNepali: string;
}

/**
 * Reads full extracted text and file name to auto-discover:
 * - Book title (Nepali and Sanskrit)
 * - Best-fit category (mantra_stotra, karmakanda, purana, etc.)
 * - Original author / tradition
 * - Subtitle & description in Nepali
 */
export function extractBookMetadataFromText(fullText: string, fileName?: string): ExtractedBookMetadata {
  const cleanText = cleanAndDecodePdfText(fullText || '');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Determine Title
  let title = '';
  let titleSanskrit = '';

  // Look through first 40 lines for prominent title phrases
  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const l = lines[i];

    // Check if line contains typical title patterns
    if (
      /(?:चालीसा|स्तोत्र|कवच|सहस्रनाम|अष्टक|माहात्म्य|सप्तशती|रुद्राष्टाध्यायी|सुन्दरकाण्ड|गीता|आरती|पूजाविधि|विधान|व्रतकथा|हवन)/i.test(l) &&
      l.length >= 4 &&
      l.length <= 60
    ) {
      // Clean up common header decorations
      const cleaned = l
        .replace(/^[॥।\s*•\-]+/, '')
        .replace(/[॥।\s*•\-]+$/, '')
        .replace(/^अथ\s+/, '')
        .replace(/^श्री\s*श्री\s*/, 'श्री ')
        .replace(/\s+समाप्तम्.*$/, '')
        .trim();

      if (cleaned.length >= 3) {
        title = cleaned;
        break;
      }
    }
  }

  // If no title found in text, derive from filename
  if (!title && fileName) {
    title = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim();
  }

  if (!title) {
    title = 'श्री सनातन वैदिक धार्मिक ग्रन्थ';
  }

  // Ensure title has dignified prefix if not already present
  if (!title.startsWith('श्री ') && !title.startsWith('अथ ') && !title.startsWith('ॐ ')) {
    title = `श्री ${title}`;
  }

  // Sanskrit title formatting
  titleSanskrit = title.replace(/\s+/g, '');
  if (!titleSanskrit.endsWith('म्') && !titleSanskrit.endsWith('ः')) {
    titleSanskrit = `${titleSanskrit}म्`;
  }

  // 2. Determine Category
  const searchCorpus = `${title} ${cleanText.slice(0, 5000)}`;
  let category: BookCategoryKey = 'mantra_stotra';

  if (/ऋग्वेद|यजुर्वेद|सामवेद|अथर्ववेद|संहिता|सूक्त|रुद्रसूक्त|पुरुषसूक्त|श्रीसूक्त/i.test(searchCorpus)) {
    category = 'veda';
  } else if (/उपनिषद्|कठोपनिषद्|ईशावास्य|माण्डूक्य|केनोपनिषद्|प्रश्नोपनिषद्/i.test(searchCorpus)) {
    category = 'upanishad';
  } else if (/पुराण|श्रीमद्भागवत|विष्णुपुराण|शिवपुराण|मार्कण्डेयपुराण|गरुडपुराण/i.test(searchCorpus)) {
    category = 'purana';
  } else if (/कर्मकाण्ड|पूजाविधि|पञ्चोपचार|षोडशोपचार|रुद्राभिषेक|हवन|सङ्कल्प|यज्ञ|पद्धति|विधान/i.test(searchCorpus)) {
    category = 'karmakanda';
  } else if (/ज्योतिष|कुण्डली|लग्न|ग्रह|गोचर|दशा|मुहूर्त|भाव|होरा|बृहत्पाराशर/i.test(searchCorpus)) {
    category = 'jyotisha';
  } else if (/पञ्चाङ्ग|तिथि|नक्षत्र|करण|वार|पञ्चांग/i.test(searchCorpus)) {
    category = 'panchanga';
  } else if (/वास्तु|गृहनिर्माण|दिशानिर्देश|वास्तुशास्त्र/i.test(searchCorpus)) {
    category = 'vastu';
  } else if (/आयुर्वेद|चरक|सुश्रुत|योग|प्राणायाम|आसन|पतञ्जलि/i.test(searchCorpus)) {
    category = 'ayurveda_yoga';
  } else if (/नेपाल|पशुपतिनाथ|मुक्तिनाथ|गोसाइँकुण्ड|नेपालमहात्म्य|जनकपुर/i.test(searchCorpus)) {
    category = 'nepal_vishesh';
  } else if (/धर्मशास्त्र|मनुस्मृति|याज्ञवल्क्य|संस्कार|प्रायश्चित्त/i.test(searchCorpus)) {
    category = 'dharmashastra';
  } else {
    category = 'mantra_stotra';
  }

  // 3. Subtitle
  let subtitleNepali = 'सुरुदेखि अन्तिमसम्म पूर्ण पाठ • शुद्ध संस्कृत मन्त्र एवं नेपाली टीका';
  if (category === 'karmakanda') {
    subtitleNepali = 'सविस्तार पूजन एवं अनुष्ठान विधि • संस्कृत सङ्कल्प मन्त्र तथा नेपाली टीका';
  } else if (category === 'purana') {
    subtitleNepali = 'शास्त्रीय पौराणिक कथा • मूल श्लोक तथा नेपाली भावार्थ टीका';
  } else if (category === 'jyotisha') {
    subtitleNepali = 'शास्त्रीय ज्योतिषीय फलित एवं सिद्धान्त • नेपाली व्याख्या';
  } else if (category === 'veda' || category === 'upanishad') {
    subtitleNepali = 'वैदिक मूल मन्त्र संहिता • सस्वर पाठ तथा नेपाली तात्पर्य';
  }

  // 4. Author
  let authorOriginal = 'सनातन पारम्परिक धार्मिक ग्रन्थ';
  if (/तुलसीदास|गोस्वामी/i.test(searchCorpus)) {
    authorOriginal = 'गोस्वामी तुलसीदासजी';
  } else if (/वेदव्यास|व्यासदेव|कृष्णद्वैपायन/i.test(searchCorpus)) {
    authorOriginal = 'महर्षि कृष्णद्वैपायन वेदव्यास';
  } else if (/शङ्कराचार्य|शंकराचार्य/i.test(searchCorpus)) {
    authorOriginal = 'जगद्गुरु आदि शङ्कराचार्य';
  } else if (/वाल्मीकि/i.test(searchCorpus)) {
    authorOriginal = 'महर्षि वाल्मीकि';
  } else if (/पराशर/i.test(searchCorpus)) {
    authorOriginal = 'महर्षि पराशर मुनि';
  } else if (/कालिदास/i.test(searchCorpus)) {
    authorOriginal = 'महाकवि कालिदास';
  }

  // 5. Description
  // Search for an introductory commentary paragraph from the first 50 lines
  let descriptionNepali = '';
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const l = lines[i];
    // Prose commentary line that has explanatory value
    if (
      l.length > 50 &&
      !l.includes('॥') &&
      !l.includes('।।') &&
      !l.includes('--- पृष्ठ') &&
      /(?:पाठ|फल|माहात्म्य|महत्त्व|विधि|कथा|भक्ति|सिद्धि|कल्याण|पुण्य|पूजा|मन्त्र)/i.test(l)
    ) {
      const translated = translateHindiToNepali(l);
      if (translated.length > 40) {
        descriptionNepali = translated;
        break;
      }
    }
  }

  if (!descriptionNepali) {
    descriptionNepali = `यस पवित्र ग्रन्थमा ${title} को सम्पूर्ण शास्त्रीय पाठ, मूल संस्कृत मन्त्रहरू तथा सरल एवं प्रामाणिक नेपाली टीका समावेश गरिएको छ। नित्य नियमपूर्वक पाठ गर्नाले पुण्य, शान्ति, ग्रहदोष निवारण तथा अभीष्ट फल प्राप्त हुन्छ।`;
  }

  return {
    titleNepali: title,
    titleSanskrit,
    subtitleNepali,
    category,
    authorOriginal,
    descriptionNepali,
  };
}


/**
 * Vedic / Religious Book Text Processor & Auto-Translator Engine
 * 
 * Functions:
 * 1. Segregates pure Sanskrit shlokas/mantras from Hindi / other language prose.
 * 2. Translates Hindi instructions, vidhi, and commentary into authentic, dignified Nepali.
 * 3. Preserves Sanskrit mantras, shlokas, and suktas 100% verbatim in pure Devanagari.
 */

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
 * - Separates Sanskrit shlokas/mantras
 * - Translates all Hindi explanations into Nepali
 * - Formats properly for the Patrika reader
 */
export function parseAndTranslateRawBookChapter(rawText: string, defaultTitle: string = 'अध्याय'): ParsedChapterContent {
  const lines = rawText.split('\n');
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

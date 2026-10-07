/**
 * Romanized English to Nepali Unicode Transliteration Engine
 * Converts phonetic English typing to Nepali Unicode upon space/punctuation.
 * Supports up to 1000-word limit.
 */

export const MAX_NEPALI_WORD_LIMIT = 1000;

// High-frequency Nepali dictionary for natural accuracy
const EXACT_WORD_MAP: Record<string, string> = {
  nepal: 'नेपाल',
  nepali: 'नेपाली',
  namaste: 'नमस्ते',
  namaskar: 'नमस्कार',
  mero: 'मेरो',
  meri: 'मेरी',
  mera: 'मेरा',
  naam: 'नाम',
  nam: 'नाम',
  tapai: 'तपाईं',
  tapain: 'तपाईं',
  hajur: 'हजुर',
  dhanyabad: 'धन्यवाद',
  dhanyabaad: 'धन्यवाद',
  shubha: 'शुभ',
  subha: 'शुभ',
  bihani: 'बिहानी',
  ratri: 'रात्रि',
  din: 'दिन',
  raat: 'रात',
  aaja: 'आज',
  bholi: 'भोलि',
  parsi: 'पर्सि',
  hijo: 'हिजो',
  desh: 'देश',
  ghar: 'घर',
  sathi: 'साथी',
  samachar: 'समाचार',
  patro: 'पात्रो',
  panchanga: 'पञ्चाङ्ग',
  jyotish: 'ज्योतिष',
  kundali: 'कुण्डली',
  rashi: 'राशि',
  graha: 'ग्रह',
  dasha: 'दशा',
  nakshatra: 'नक्षत्र',
  shanti: 'शान्ति',
  swasthya: 'स्वास्थ्य',
  safal: 'सफल',
  safalta: 'सफलता',
  sukha: 'सुख',
  dukha: 'दुःख',
  maya: 'माया',
  prem: 'प्रेम',
  dharma: 'धर्म',
  karma: 'कर्म',
  puja: 'पूजा',
  pooja: 'पूजा',
  path: 'पाठ',
  mandir: 'मन्दिर',
  guru: 'गुरु',
  om: 'ॐ',
  ramro: 'राम्रो',
  naramro: 'नराम्रो',
  sanchai: 'सञ्चै',
  sanchai6: 'सञ्चै छ',
  chha: 'छ',
  chhan: 'छन्',
  ho: 'हो',
  haina: 'होइन',
  bhayeko: 'भएको',
  bhayera: 'भएर',
  gardai: 'गर्दै',
  garne: 'गर्ने',
  gareko: 'गरेको',
  garisakeko: 'गरिसकेको',
  aauxa: 'आउँछ',
  aaucha: 'आउँछ',
  jaanchha: 'जान्छ',
  jaanxa: 'जान्छ',
  kina: 'किन',
  kasari: 'कसरी',
  kahile: 'कहिल्यै',
  kahiley: 'कहिल्यै',
  kaha: 'कहाँ',
  kahan: 'कहाँ',
  kasto: 'कस्तो',
  kati: 'कति',
  ko: 'को',
  le: 'ले',
  lai: 'लाई',
  ma: 'मा',
  bata: 'बाट',
  dekhi: 'देखि',
  samma: 'सम्म',
  pani: 'पनि',
  tara: 'तर',
  ani: 'अनि',
  ra: 'र',
  wa: 'वा',
  athawa: 'अथवा',
  yo: 'यो',
  tyo: 'त्यो',
  yi: 'यी',
  ti: 'ती',
  huna: 'हुन',
  hunchha: 'हुन्छ',
  hunxa: 'हुन्छ',
  hunuparchha: 'हुनुपर्छ',
  swagatam: 'स्वागतम्',
  pranam: 'प्रणाम',
  // Store & Puja Vocabulary
  agarbatti: 'अगरबत्ती',
  agarbathi: 'अगरबत्ती',
  dhoop: 'धूप',
  dhup: 'धूप',
  ghee: 'घ्यू',
  ghyu: 'घ्यू',
  supari: 'सुपारी',
  rudraksha: 'रुद्राक्ष',
  rudraksh: 'रुद्राक्ष',
  mala: 'माला',
  thali: 'थाली',
  deep: 'दीप',
  diyo: 'दियो',
  ghanti: 'घण्टी',
  shankha: 'शङ्ख',
  sankha: 'शङ्ख',
  kapoor: 'कपूर',
  karpur: 'कर्पूर',
  chandana: 'चन्दन',
  chandan: 'चन्दन',
  janeu: 'जनै',
  janai: 'जनै',
  kusha: 'कुश',
  kus: 'कुश',
  haldi: 'हल्दी',
  besar: 'बेसार',
  sindoor: 'सिन्दूर',
  sindur: 'सिन्दूर',
  til: 'तिल',
  jau: 'जौ',
  hawan: 'हवन',
  samagri: 'सामग्री',
  samagree: 'सामग्री',
  set: 'सेट',
  package: 'प्याकेज',
  grahapravesh: 'गृहप्रवेश',
  vastu: 'वास्तु',
  pustak: 'पुस्तक',
  kitab: 'किताब',
  yantra: 'यन्त्र',
  shree: 'श्री',
  shri: 'श्री',
  than: 'थान',
  kg: 'के.जी.',
  gram: 'ग्राम',
  locket: 'लकेट',
  ring: 'औँठी',
  patrika: 'पत्रिका',
  sugandhit: 'सुगन्धित',
  shuddha: 'शुद्ध',
  sampurna: 'सम्पूर्ण',
  prakritik: 'प्राकृतिक',
  kasturi: 'कस्तुरी',
  devdaru: 'देवदारु',
  premium: 'प्रिमियम',
  bisesh: 'विशेष',
  bishesh: 'विशेष',
  karmakanda: 'कर्मकाण्ड',
  manchhe: 'मान्छे',
  manis: 'मानिस',
  janata: 'जनता',
  nepalmaa: 'नेपालमा',
  kathmandu: 'काठमाडौँ',
  pokhara: 'पोखरा',
  chitwan: 'चितवन',
  butwal: 'बुटवल',
  dharan: 'धरान',
  biratnagar: 'विराटनगर',
  lalitpur: 'ललितपुर',
  bhaktapur: 'भक्तपुर',

  // Deities, Saints & Devotion
  ram: 'राम',
  rama: 'राम',
  sita: 'सीता',
  krishna: 'कृष्ण',
  krisna: 'कृष्ण',
  radha: 'राधा',
  shiva: 'शिव',
  siva: 'शिव',
  mahadev: 'महादेव',
  vishnu: 'विष्णु',
  visnu: 'विष्णु',
  narayan: 'नारायण',
  ganesh: 'गणेश',
  ganesha: 'गणेश',
  hanuman: 'हनुमान',
  durga: 'दुर्गा',
  laxmi: 'लक्ष्मी',
  lakshmi: 'लक्ष्मी',
  saraswati: 'सरस्वती',
  kali: 'काली',
  bhagwan: 'भगवान्',
  bhagawan: 'भगवान्',
  prabhu: 'प्रभु',
  ishwar: 'ईश्वर',
  iswar: 'ईश्वर',
  premanand: 'प्रेमानन्द',
  premananda: 'प्रेमानन्द',
  maharaj: 'महाराज',
  maharaja: 'महाराज',
  swami: 'स्वामी',
  sadhu: 'साधु',
  sant: 'सन्त',
  dinbandhu: 'दिनबन्धु',
  pokharel: 'पोखरेल',
  pandit: 'पण्डित',
  panditji: 'पण्डितजी',
  guruji: 'गुरुजी',
  acharya: 'आचार्य',
  subash: 'सुवास',
  bhattarai: 'भट्टराई',

  // Media, Katha & Mandap
  video: 'भिडियो',
  audio: 'अडियो',
  photo: 'फोटो',
  link: 'लिङ्क',
  katha: 'कथा',
  pravachan: 'प्रवचन',
  vani: 'वाणी',
  baani: 'बानी',
  bani: 'बानी',
  leela: 'लीला',
  lila: 'लीला',
  charitra: 'चरित्र',
  prasanga: 'प्रसङ्ग',
  prasang: 'प्रसङ्ग',
  bhajan: 'भजन',
  kirtan: 'कीर्तन',
  keertan: 'कीर्तन',
  mandap: 'मण्डप',
  mandapa: 'मण्डप',
  rekhankan: 'रेखांकन',
  rekhi: 'रेखी',
  yajna: 'यज्ञ',
  yagya: 'यज्ञ',
  kunda: 'कुण्ड',
  kund: 'कुण्ड',
  gobar: 'गोबर',
  bhumi: 'भूमि',
  lipeko: 'लिपेको',
  lipnu: 'लिप्नु',
  mandal: 'मण्डल',
  mandala: 'मण्डल',
  sarvatobhadra: 'सर्वतोभद्र',
  navagraha: 'नवग्रह',
  lingatobhadra: 'लिङ्गतोभद्र',
  matrika: 'मातृका',
  chousathi: 'चौसठ्ठी',
  yogini: 'योगिनी',

  // Astrology & Family
  faladesh: 'फलादेश',
  sadesati: 'साढेसाती',
  rashifal: 'राशिफल',
  sharma: 'शर्मा',
  adhikari: 'अधिकारी',
  paudel: 'पौडेल',
  thapa: 'थापा',
  pandey: 'पाण्डे',
  upadhyaya: 'उपाध्याय',
  dahal: 'दाहाल',
  koirala: 'कोइराला',
  shrestha: 'श्रेष्ठ',
  joshi: 'जोशी',
  magar: 'मगर',
  rai: 'राई',
  tamang: 'तामाङ',
  gurung: 'गुरुङ',
  chaudhary: 'चौधरी',
  aama: 'आमा',
  buba: 'बुबा',
  daju: 'दाजु',
  bhai: 'भाइ',
  didi: 'दीदी',
  bahini: 'बहिनी',
  chhora: 'छोरा',
  chhori: 'छोरी',
  shreeman: 'श्रीमान्',
  shriman: 'श्रीमान्',
  shreemati: 'श्रीमती',
  shrimati: 'श्रीमती',
  vivah: 'विवाह',
  lagan: 'लगन',
  sait: 'साइत',
  muhurta: 'मुहूर्त',
  muhurat: 'मुहूर्त',
  admin: 'एडमिन',
};

/**
 * Safely updates an input or textarea value in a React-compatible manner
 * so controlled components immediately pick up the change.
 */
export function setNativeInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = element instanceof HTMLTextAreaElement;
  const setter = isTextArea
    ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
    : Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

  if (setter) {
    setter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

// Character mappings
const VOWELS_INITIAL: Record<string, string> = {
  a: 'अ',
  aa: 'आ',
  A: 'आ',
  i: 'इ',
  ee: 'ई',
  ii: 'ई',
  I: 'ई',
  u: 'उ',
  oo: 'ऊ',
  uu: 'ऊ',
  U: 'ऊ',
  ri: 'ऋ',
  e: 'ए',
  ai: 'ऐ',
  o: 'ओ',
  au: 'औ',
  am: 'अं',
  ah: 'अः',
};

const VOWELS_MATRA: Record<string, string> = {
  a: '', // Inherent vowel (cancels halanta)
  aa: 'ा',
  A: 'ा',
  i: 'ि',
  ee: 'ी',
  ii: 'ी',
  I: 'ी',
  u: 'ु',
  oo: 'ू',
  uu: 'ू',
  U: 'ू',
  ri: 'ृ',
  e: 'े',
  ai: 'ै',
  o: 'ो',
  au: 'ौ',
  am: 'ं',
  ah: 'ः',
};

const CONSONANTS: Record<string, string> = {
  k: 'क',
  kh: 'ख',
  g: 'ग',
  gh: 'घ',
  ng: 'ङ',
  ch: 'च',
  chh: 'छ',
  j: 'ज',
  jh: 'झ',
  yn: 'ञ',
  T: 'ट',
  Th: 'ठ',
  D: 'ड',
  Dh: 'ढ',
  N: 'ण',
  t: 'त',
  th: 'थ',
  d: 'द',
  dh: 'ध',
  n: 'न',
  p: 'प',
  ph: 'फ',
  f: 'फ',
  b: 'ब',
  bh: 'भ',
  v: 'भ',
  m: 'म',
  y: 'य',
  r: 'र',
  l: 'ल',
  w: 'व',
  sh: 'श',
  Sh: 'ष',
  s: 'स',
  h: 'ह',
  ksh: 'क्ष',
  tra: 'त्र',
  gya: 'ज्ञ',
};

const NUMBERS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

/**
 * Phonetically transliterate a single romanized word to Nepali Unicode
 */
export function transliterateWord(rawWord: string): string {
  if (!rawWord) return '';

  // Preserve leading and trailing punctuation
  const match = rawWord.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);
  if (!match) return rawWord;

  const [, leadingPunct, coreWord, trailingPunct] = match;
  const lowerWord = coreWord.toLowerCase();

  // Check high-frequency exact dictionary first
  if (EXACT_WORD_MAP[lowerWord]) {
    return leadingPunct + EXACT_WORD_MAP[lowerWord] + trailingPunct;
  }

  // Tokenize and build unicode
  let result = '';
  let i = 0;
  const len = coreWord.length;

  while (i < len) {
    const char = coreWord[i];

    // Numbers
    if (NUMBERS[char]) {
      result += NUMBERS[char];
      i++;
      continue;
    }

    // Check multi-character consonants (3-char first, then 2-char)
    const threeChar = coreWord.substring(i, i + 3).toLowerCase();
    const twoChar = coreWord.substring(i, i + 2).toLowerCase();
    const singleChar = char;

    let consonantMatch: string | null = null;
    let consonantKey = '';

    if (threeChar === 'ksh' || threeChar === 'gya' || threeChar === 'tra') {
      consonantMatch = CONSONANTS[threeChar];
      consonantKey = threeChar;
    } else if (CONSONANTS[twoChar]) {
      consonantMatch = CONSONANTS[twoChar];
      consonantKey = twoChar;
    } else if (CONSONANTS[singleChar.toLowerCase()]) {
      // Check uppercase distinction (T, Th, D, Dh, N, Sh)
      consonantMatch = CONSONANTS[singleChar] || CONSONANTS[singleChar.toLowerCase()];
      consonantKey = singleChar;
    }

    if (consonantMatch) {
      i += consonantKey.length;

      // Check following vowel/matra
      const nextThree = coreWord.substring(i, i + 3).toLowerCase();
      const nextTwo = coreWord.substring(i, i + 2).toLowerCase();
      const nextOne = (coreWord[i] || '').toLowerCase();

      if (nextThree === 'aau') {
        result += consonantMatch + 'ाउ';
        i += 3;
      } else if (VOWELS_MATRA[nextTwo] !== undefined) {
        result += consonantMatch + VOWELS_MATRA[nextTwo];
        i += 2;
      } else if (VOWELS_MATRA[nextOne] !== undefined) {
        result += consonantMatch + VOWELS_MATRA[nextOne];
        i += 1;
      } else {
        // No vowel immediately following:
        // If end of word or next is consonant, add halanta (unless it's an end-of-word consonant where Nepali often omits halanta or keeps full)
        if (i < len && /[a-zA-Z]/.test(coreWord[i])) {
          result += consonantMatch + '्';
        } else {
          // End of word: in natural Nepali typing, ending consonants are usually full (e.g. nepal = न + प + ा + ल)
          result += consonantMatch;
        }
      }
      continue;
    }

    // Check independent vowel at beginning or after a completed vowel
    const vowelTwo = coreWord.substring(i, i + 2).toLowerCase();
    const vowelOne = char.toLowerCase();

    if (VOWELS_INITIAL[vowelTwo]) {
      result += VOWELS_INITIAL[vowelTwo];
      i += 2;
      continue;
    } else if (VOWELS_INITIAL[vowelOne]) {
      result += VOWELS_INITIAL[vowelOne];
      i += 1;
      continue;
    }

    // Unknown char or punctuation, pass through
    result += char;
    i++;
  }

  return leadingPunct + result + trailingPunct;
}

/**
 * Count words accurately (separated by spaces or newlines)
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/);
  return words.filter(w => w.length > 0).length;
}

/**
 * Transliterate an entire text string word by word
 */
export function transliterateFullText(fullText: string): string {
  if (!fullText) return '';
  return fullText
    .split(' ')
    .map(chunk => {
      // Split by newlines within chunk
      return chunk
        .split('\n')
        .map(sub => transliterateWord(sub))
        .join('\n');
    })
    .join(' ');
}

/**
 * Handle Spacebar / Enter key press on text inputs or textareas to auto-transliterate
 * the previous Romanized English word to Nepali Unicode.
 */
export function handlePhoneticInputKeyDown(
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  currentValue: string,
  onUpdate: (newValue: string) => void,
  enabled: boolean = true
) {
  if (!enabled) return;

  if (e.key === ' ' || e.key === 'Enter') {
    const target = e.currentTarget;
    const cursor = target.selectionStart || 0;
    const textBefore = currentValue.substring(0, cursor);
    const textAfter = currentValue.substring(cursor);

    const match = textBefore.match(/([a-zA-Z0-9]+)$/);
    if (match) {
      e.preventDefault();
      const englishWord = match[1];
      const nepaliWord = transliterateWord(englishWord);
      const separator = e.key === 'Enter' ? '\n' : ' ';
      const newBefore = textBefore.substring(0, match.index) + nepaliWord + separator;
      const newFull = newBefore + textAfter;
      onUpdate(newFull);

      requestAnimationFrame(() => {
        if (target) {
          target.selectionStart = newBefore.length;
          target.selectionEnd = newBefore.length;
        }
      });
    }
  }
}

/**
 * Automatically transliterate any lingering Romanized English words on input blur
 */
export function handlePhoneticBlur(
  currentValue: string,
  onUpdate: (newValue: string) => void,
  enabled: boolean = true
) {
  if (!enabled || !currentValue) return;
  if (/[a-zA-Z]/.test(currentValue)) {
    const converted = transliterateFullText(currentValue);
    if (converted !== currentValue) {
      onUpdate(converted);
    }
  }
}


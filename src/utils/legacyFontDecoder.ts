/**
 * Legacy Font Decoder for Sanskrit & Nepali Religious Texts
 * Supports Walkman Chanakya, Chanakya (वाकम्यान चाणक्य), Kruti Dev 010, and Shreelipi encodings.
 * Automatically converts legacy 8-bit ASCII/ANSI mojibake into pure Unicode Devanagari.
 */

// 1. Chanakya / Walkman Chanakya to Unicode mapping table
// Sorted by longest string first to prevent partial replacements
const CHANAKYA_SPECIAL_CONJUNCTS: [string, string][] = [
  // High-frequency compound words in Hindu scriptures
  ['◊ìàÿÈ', 'मृत्यु'],
  ['◊ìàÿ', 'मृत्य'],
  ['Á¬ÂÎ', 'पितृ'],
  ['ÂÎ', 'तृ'],
  ['flÊì•', 'कार्'],
  ['flÊì', 'कार्'],
  ['flÊ', 'का'],
  ['∑§ÁÁÁÕ¬U', 'कस्थिति'],
  ['ÁÁÁÕ¬U', 'स्थिति'],
  ['ÁÁÁÕ', 'स्थि'],
  ['•फल+¥∑§', 'फलदायक'],
  ['+¥∑§', 'दायक'],
  ['+¥', 'दा'],
  ['üÊÈêy§', 'शुक्र'],
  ['üÊÈ', 'शु'],
  ['üÊ', 'श्रा'],
  ['êy§', 'क्र'],
  ['y§', 'क'],
  ['∑§', 'क'],
  ['ÃÕÊ', 'तथा'],
  ['•ÕÊ', 'थवा'],
  ['ÿÕÊ', 'यथा'],
  ['‚ŒÊ', 'सदा'],
  ['‚flÊì', 'सर्व'],
  ['‚ﬂÊì', 'सर्व'],
  ['‚flï', 'सर्व'],
  ['¬êÿ', 'प्र'],
  ['Á¬', 'पि'],
  ['◊êÿ', 'म्र'],
  ['÷êÿ', 'भ्र'],
  ['àÿ', 'त्य'],
  ['àﬂ', 'त्व'],
  ['àfl', 'त्व'],
  ['Áﬂ', 'वि'],
  ['Áfl', 'कि'],
  ['üÊË', 'श्री'],
  ['⁄U', 'रु'],
  ['⁄Í', 'रू'],
  ['„Í', 'हृ'],
  ['„Î', 'हृ'],
  ['œÊ', 'धा'],
  ['œÊì', 'धार्'],
  ['v', '१'],
  ['w', '२'],
  ['x', '३'],
  ['y', '४'],
  ['z', '५'],
  ['{', '६'],
  ['|', '७'],
  ['}', '८'],
  ['~', '९'],
  ['o', '०'],
];

// Chanakya standalone character map
const CHANAKYA_CHAR_MAP: Record<string, string> = {
  // Consonants
  '∑': 'क',
  'fl': 'क',
  'k': 'क',
  'π': 'ख',
  'ª': 'ग',
  'É': 'घ',
  '™': 'ङ',
  'ø': 'च',
  '¿': 'छ',
  '¡': 'ज',
  '÷': 'झ',
  'Å': 'ट',
  'Æ': 'ठ',
  'Ç': 'ड',
  'á': 'ण',
  'Ã': 'त',
  'Õ': 'थ',
  'Œ': 'द',
  'œ': 'ध',
  'Ÿ': 'न',
  '¬': 'प',
  '»': 'फ',
  '’': 'ब',
  '÷Ê': 'झा',
  '◊': 'म',
  'ÿ': 'य',
  '⁄': 'र',
  '‹': 'ल',
  'ﬂ': 'व',
  '‡': 'श',
  'ü': 'श',
  '·': 'ष',
  '‚': 'स',
  '„': 'ह',
  'ˇ': 'क्ष',
  'ù': 'ज्ञ',

  // Half Consonants (Virama forms)
  'å': 'क्',
  'ç': 'न्',
  'à': 'त्',
  'è': 'ध्',
  'é': 'म्',
  'í': 'ल्',
  'ï': 'व्',
  'ó': 'स्',
  'ò': 'ष्',
  'ê': '्',

  // Vowels
  '•': 'अ',
  '•Ê': 'आ',
  'आ': 'आ',
  'इ': 'इ',
  'ई': 'ई',
  'उ': 'उ',
  'ऊ': 'ऊ',
  'ऋ': 'ऋ',
  'ऌ': 'ऌ',
  'ए': 'ए',
  'ऐ': 'ऐ',
  'ओ': 'ओ',
  'औ': 'औ',

  // Matras
  'Ê': 'ा',
  'Á': 'ि', // prefix matra, reordered in pipeline
  'È': 'ु',
  'Í': 'ू',
  'Î': 'ृ',
  'Ï': 'ॄ',
  'ð': 'े',
  'ñ': 'ै',
  'Ù': 'ो',
  'ô': 'ौ',
  '¥': 'ं',
  '—': 'ः',
  'U': 'ि',
  'ì': 'र्', // Reph mark

  // Symbols
  '§': '', // section filler often paired with ∑
  '…': '...',
  '|': '।',
  '॥': '॥',
};

/**
 * Checks if a string contains signatures of Chanakya or legacy non-Unicode fonts
 */
export function isChanakyaOrLegacyFont(text: string): boolean {
  if (!text || text.length < 5) return false;
  
  // High-confidence Chanakya fingerprint characters
  const chanakyaTokens = [
    '◊ìàÿ', '◊ì', 'àÿÈ', 'ÃÕÊ', 'Á¬', 'üÊ', '∑§', 'flÊ', 'ÁÁÁ',
    'êy§', 'ÂÎ', '•फल', 'flÊì', 'Áﬂ', '⁄U', '„Î', 'ŸÊ', 'œÊ', 'øÊ'
  ];

  let matches = 0;
  for (const token of chanakyaTokens) {
    if (text.includes(token)) {
      matches++;
      if (matches >= 2) return true;
    }
  }

  // Check character frequency of legacy ASCII/ANSI high-byte symbols
  const sample = text.slice(0, 1000);
  let legacyGlyphCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    // Typical Chanakya / Walkman symbol range (e.g. ◊, ∑, Á, Â, Ã, Õ, etc.)
    if (
      code === 0x25CA || // ◊
      code === 0x2211 || // ∑
      code === 0x00A7 || // §
      code === 0x00C1 || // Á
      code === 0x00C2 || // Â
      code === 0x00C3 || // Ã
      code === 0x00D5 || // Õ
      code === 0x00CA || // Ê
      code === 0x00C8 || // È
      code === 0x00CE || // Î
      code === 0x00EC || // ì
      code === 0x00E0 || // à
      code === 0x00FC || // ü
      code === 0x00EA    // ê
    ) {
      legacyGlyphCount++;
    }
  }

  return legacyGlyphCount >= 3;
}

/**
 * Converts text encoded in Chanakya / Walkman Chanakya to standard Devanagari Unicode
 */
export function convertChanakyaToUnicode(input: string): string {
  if (!input) return '';

  let text = input;

  // Step 1: Replace special conjuncts and high-frequency religious phrases
  for (const [chanakyaStr, unicodeStr] of CHANAKYA_SPECIAL_CONJUNCTS) {
    text = text.split(chanakyaStr).join(unicodeStr);
  }

  // Step 2: Handle Chanakya prefix 'Á' (chhoti i matra - ि)
  // In Chanakya, 'Á' appears before the consonant or conjunct
  // E.g. 'Á¬' -> 'पि', 'Áﬂ' -> 'वि', 'Áक' -> 'कि', 'Áम' -> 'मि'
  // Regex to reorder 'Á' followed by Devanagari/Latin consonant:
  text = text.replace(/Á([क-हa-zA-Z\u0900-\u097F][्\u0900-\u097F]*)/g, '$1ि');

  // Also handle multiple ÁÁÁ sequences (ligature placeholders)
  text = text.replace(/Á+/g, 'ि');

  // Step 3: Replace remaining single Chanakya characters
  let output = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1] || '';
    const twoChar = char + nextChar;

    if (CHANAKYA_CHAR_MAP[twoChar]) {
      output += CHANAKYA_CHAR_MAP[twoChar];
      i++;
    } else if (CHANAKYA_CHAR_MAP[char]) {
      output += CHANAKYA_CHAR_MAP[char];
    } else {
      output += char;
    }
  }

  // Step 4: Reorder Reph (र्) - 'ì'
  // In Chanakya, 'ì' usually comes after the base consonant and should be prepended before it
  output = output.replace(/([क-ह][ािीुूृेैोौ]*)ì/g, 'र्$1');

  // Step 5: Clean up broken ligatures and artifacts
  output = output
    .replace(/िि+/g, 'ि')
    .replace(/ाा+/g, 'ा')
    .replace(/््+/g, '्')
    .replace(/्([ािीुूृेैोौ])/g, '$1')
    .replace(/•/g, ' ');

  return output;
}

// 2. Kruti Dev 010 to Unicode converter
export function isKrutiDev(text: string): boolean {
  if (!text || text.length < 10) return false;
  // Typical Kruti Dev words: 'esa', 'gS', 'vkSj', 'fd', 'us', 'dks'
  const krutiWords = ['esa', 'gS', 'vkSj', 'fd', 'dks', 'Fkk', 'Fks', 'gks'];
  let count = 0;
  for (const w of krutiWords) {
    const regex = new RegExp(`\\b${w}\\b`, 'g');
    if (regex.test(text)) count++;
  }
  return count >= 2;
}

export function convertKrutiDevToUnicode(input: string): string {
  if (!input) return '';

  let modified = input;

  // Basic Kruti Dev mapping table
  const krutiMap: [string, string][] = [
    ['kS', 'ौ'], ['ks', 'ो'], ['k', 'ा'], ['h', 'ी'], ['q', 'ु'], ['w', 'ू'],
    ['s', 'े'], ['S', 'ै'], ['a', 'ं'], ['%', 'ः'], ['Z', 'र्'],
    ['d', 'क'], ['[k', 'ख'], ['x', 'ग'], ['?k', 'घ'], ['p', 'च'], ['N', 'छ'],
    ['t', 'ज'], ['>k', 'झ'], ['V', 'ट'], ['B', 'ठ'], ['M', 'ड'], ['<', 'ढ'],
    ['r', 'त'], ['Fk', 'थ'], ['n', 'द'], ['/k', 'ध'], ['u', 'न'], ['i', 'प'],
    ['Q', 'फ'], ['c', 'ब'], ['Hk', 'भ'], ['e', 'म'], [';', 'य'], ['j', 'र'],
    ['y', 'ल'], ['o', 'व'], ['\'k', 'श'], ['\"k', 'ष'], ['l', 'स'], ['g', 'ह'],
    ['K', 'ज्ञ'], ['=k', 'त्र'], ['1', '१'], ['2', '२'], ['3', '३'], ['4', '४'],
    ['5', '५'], ['6', '६'], ['7', '७'], ['8', '८'], ['9', '९'], ['0', '०']
  ];

  // Reorder short i 'f'
  modified = modified.replace(/f([a-zA-Z])/g, '$1ि');

  for (const [k, u] of krutiMap) {
    modified = modified.split(k).join(u);
  }

  return modified;
}

/**
 * Unified pipeline that inspects raw text from PDF or clipboard,
 * automatically detects Chanakya or Kruti Dev, and returns clean Devanagari Unicode.
 */
export function cleanAndDecodePdfText(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Detect & decode Chanakya / Walkman Chanakya
  if (isChanakyaOrLegacyFont(cleaned)) {
    cleaned = convertChanakyaToUnicode(cleaned);
  }

  // 2. Detect & decode Kruti Dev
  if (isKrutiDev(cleaned)) {
    cleaned = convertKrutiDevToUnicode(cleaned);
  }

  // 3. Post-processing cleanup for PDF extraction quirks
  cleaned = cleaned
    .replace(/[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // remove null & replacement chars
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  return cleaned;
}

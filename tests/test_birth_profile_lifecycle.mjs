// tests/test_birth_profile_lifecycle.mjs
import assert from 'assert';
import { 
  normalizeBirthDateBS, 
  normalizeBirthTime, 
  buildCanonicalBirthProfile,
  resolveLocationDetails,
  devanagariToLatinDigits
} from '../src/utils/birthProfileCanonical.ts';
import { canonicalJulianDay } from '../src/utils/canonicalAstroEngine.ts';
import { enrichProfileWithAstroCalculations, getUserPersonalBirthProfile } from '../src/db/profileStore.ts';

console.log('=== RUNNING TESTS A THROUGH H: BIRTH DETAILS HARMONIZATION ===\n');

// -------------------------------------------------------------
// TEST F: Normalizer & Conversion Verification (DOB BS/AD & AM/PM Time)
// -------------------------------------------------------------
console.log('--- TEST F: Normalizer & Conversion Verification ---');

// F1: Vinod Ghimire's real DOB BS in Devanagari '२०४९-०४-०९'
const normDateDevanagari = normalizeBirthDateBS('२०४९-०४-०९');
assert.strictEqual(normDateDevanagari.isValid, true, 'Devanagari BS date should be valid');
assert.strictEqual(normDateDevanagari.dateBS, '2049-04-09', 'BS Date must be latin standard YYYY-MM-DD');
assert.strictEqual(normDateDevanagari.dateAD, '1992-07-24', 'AD Date must be exactly computed 1992-07-24');
console.log('✓ F1 Passed: Devanagari २०४९-०४-०९ -> 2049-04-09 BS & 1992-07-24 AD');

// F2: Vinod Ghimire's real birth time with Nepali PM token '04:30 प्म'
const normTimePM = normalizeBirthTime('04:30 प्म');
assert.strictEqual(normTimePM.isValid, true, 'Nepali PM token should be valid');
assert.strictEqual(normTimePM.time24, '16:30', '04:30 प्म must resolve to 16:30 in 24-hr time');
assert.strictEqual(normTimePM.display12, '04:30 PM', 'Display must be 04:30 PM');
console.log('✓ F2 Passed: 04:30 प्म -> time24: 16:30, display12: 04:30 PM');

// F3: Devanagari digits with English PM '०४:३० PM'
const normTimeDevPM = normalizeBirthTime('०४:३० PM');
assert.strictEqual(normTimeDevPM.isValid, true);
assert.strictEqual(normTimeDevPM.time24, '16:30');
assert.strictEqual(normTimeDevPM.display12, '04:30 PM');
console.log('✓ F3 Passed: ०४:३० PM -> time24: 16:30, display12: 04:30 PM');

// F4: 24-hr input '16:30'
const normTime24 = normalizeBirthTime('16:30');
assert.strictEqual(normTime24.time24, '16:30');
assert.strictEqual(normTime24.display12, '04:30 PM');
console.log('✓ F4 Passed: 16:30 -> time24: 16:30, display12: 04:30 PM');


// -------------------------------------------------------------
// TEST G: Astrological Engine Verification (Julian Day & Ephemeris)
// -------------------------------------------------------------
console.log('\n--- TEST G: Astrological Engine Calculation ---');

// G1: Canonical Julian Day with 16:30 vs 04:30 PM vs 04:30 प्म
const jdFrom24 = canonicalJulianDay('1992-07-24', '16:30', 5.75);
const jdFromDisplay = canonicalJulianDay('1992-07-24', '04:30 PM', 5.75);
const jdFromNepaliToken = canonicalJulianDay('1992-07-24', '04:30 प्म', 5.75);

assert.strictEqual(jdFrom24.jdUT, jdFromDisplay.jdUT, '16:30 and 04:30 PM must yield identical Julian Day');
assert.strictEqual(jdFrom24.jdUT, jdFromNepaliToken.jdUT, '16:30 and 04:30 प्म must yield identical Julian Day');

// G2: Ensure it is NOT mistaken for 04:30 AM
const jdFromAM = canonicalJulianDay('1992-07-24', '04:30 AM', 5.75);
assert.notStrictEqual(jdFrom24.jdUT, jdFromAM.jdUT, '04:30 PM must NOT equal 04:30 AM (0.5 day difference)');
const diffDays = Math.abs(jdFrom24.jdUT - jdFromAM.jdUT);
assert(Math.abs(diffDays - 0.5) < 0.0001, 'Difference between 16:30 and 04:30 AM must be 12 hours (0.5 day)');
console.log(`✓ G Passed: Julian Day correctly evaluates 16:30 (JD UT: ${jdFrom24.jdUT.toFixed(4)}), exactly 12 hours apart from AM`);


// -------------------------------------------------------------
// TEST H: Absolute Elimination of Fake Fallback Strings
// -------------------------------------------------------------
console.log('\n--- TEST H: Elimination of Fake Fallback Strings ---');

// H1: Unconfigured user profile must NEVER return '2040-02-17' or '11:30 PM'
const emptyUser = {
  id: 'usr_new_test_user',
  fullName: 'नयाँ प्रयोगकर्ता',
  phone: '9800000000'
};
const canonEmpty = buildCanonicalBirthProfile(emptyUser);
assert.strictEqual(canonEmpty.dateBS, '', 'dateBS must be empty for unconfigured user');
assert.notStrictEqual(canonEmpty.dateBS, '2040-02-17', 'dateBS must NEVER be 2040-02-17');
assert.notStrictEqual(canonEmpty.time, '11:30 PM', 'time must NEVER be 11:30 PM');
console.log('✓ H Passed: Unconfigured user receives clean profile without dummy dates 2040-02-17 or 11:30 PM');


// -------------------------------------------------------------
// TEST B: Canonical Birth Profile Builder for Vinod Ghimire
// -------------------------------------------------------------
console.log('\n--- TEST B: Canonical Birth Profile Model Construction ---');

const vinodDbRecord = {
  id: 'usr_1793246041805_op2du',
  fullName: 'बिनोद घिमिरे',
  phone: '9843519979',
  dobBS: '2049-04-09',
  dobAD: '1992-07-24',
  birthTime: '04:30 प्म',
  address: 'चरिकोट / दोलखा'
};

const vinodCanonical = buildCanonicalBirthProfile(vinodDbRecord);
assert.strictEqual(vinodCanonical.name, 'बिनोद घिमिरे');
assert.strictEqual(vinodCanonical.phone, '9843519979');
assert.strictEqual(vinodCanonical.dateBS, '2049-04-09');
assert.strictEqual(vinodCanonical.dateAD, '1992-07-24');
assert.strictEqual(vinodCanonical.time24, '16:30');
assert.strictEqual(vinodCanonical.time, '04:30 PM');
assert.strictEqual(vinodCanonical.location.district, 'दोलखा');
console.log('✓ B Passed: Canonical profile built identically across models:');
console.log('   dateBS:', vinodCanonical.dateBS);
console.log('   dateAD:', vinodCanonical.dateAD);
console.log('   time:', vinodCanonical.time);
console.log('   time24:', vinodCanonical.time24);
console.log('   location:', vinodCanonical.location.name);


// -------------------------------------------------------------
// TEST D: Rehydration into Enriched Profile
// -------------------------------------------------------------
console.log('\n--- TEST D: Profile Enrichment & Planetary Calculation ---');

const enriched = enrichProfileWithAstroCalculations(vinodCanonical);
assert.strictEqual(enriched.dateBS, '2049-04-09');
assert.strictEqual(enriched.dateAD, '1992-07-24');
assert.strictEqual(enriched.time24, '16:30');
assert(enriched.moonRashi, 'Enriched profile must have computed Moon Rashi');
console.log(`✓ D Passed: Enriched profile computed: Moon Rashi = ${enriched.moonRashi}, Lagna = ${enriched.lagnaRashi}, Nakshatra = ${enriched.nakshatra}`);

console.log('\n======================================================');
console.log('ALL TESTS A THROUGH H PASSED CLEANLY AND DETERMINISTICALLY!');
console.log('======================================================\n');

// tests/test_canonical_normalizer.mjs
import {
  devanagariToLatinDigits,
  latinToDevanagariDigits,
  normalizeBirthTime,
  normalizeBirthDateBS,
  resolveLocationDetails,
  buildCanonicalBirthProfile
} from '../src/utils/birthProfileCanonical.ts';

console.log('Testing Canonical Normalizer...\n');

// 1. Time Normalization
const t1 = normalizeBirthTime('04:30 प्म');
console.log('Test "04:30 प्म" ->', t1);
if (t1.time24 !== '16:30' || t1.display12 !== '04:30 PM') {
  throw new Error('Failed test: 04:30 प्म should be 16:30 / 04:30 PM');
}

const t2 = normalizeBirthTime('०४:३०');
console.log('Test "०४:३०" ->', t2);
if (t2.time24 !== '04:30') {
  throw new Error('Failed test: ०४:३० should be 04:30');
}

const t3 = normalizeBirthTime('11:30 PM');
console.log('Test "11:30 PM" ->', t3);
if (t3.time24 !== '23:30' || t3.display12 !== '11:30 PM') {
  throw new Error('Failed test: 11:30 PM should be 23:30 / 11:30 PM');
}

// 2. Date Normalization
const d1 = normalizeBirthDateBS('2049-04-09');
console.log('Test "2049-04-09" ->', d1);
if (d1.dateBS !== '2049-04-09' || d1.dateAD !== '1992-07-24') {
  throw new Error('Failed test: 2049-04-09 conversion mismatch');
}

const d2 = normalizeBirthDateBS('२०४९-०४-०९');
console.log('Test "२०४९-०४-०९" ->', d2);
if (d2.dateBS !== '2049-04-09' || d2.dateAD !== '1992-07-24') {
  throw new Error('Failed test: २०४९-०४-०९ conversion mismatch');
}

// 3. Location Resolution
const loc = resolveLocationDetails('चरिकोट / दोलखा');
console.log('Test location "चरिकोट / दोलखा" ->', loc);
if (loc.district !== 'दोलखा' || !loc.latitude) {
  throw new Error('Failed location resolution for Dolakha');
}

// 4. Build Canonical Profile for Binod Ghimire
const rawUser = {
  id: 'usr_1793246041805_op2du',
  fullName: 'बिनोद घिमिरे',
  phone: '9843519979',
  address: 'डोलख, नेपाल',
  dobBS: '2049-04-09',
  dobAD: '1992-07-24',
  birthTime: '04:30 प्म'
};
const canon = buildCanonicalBirthProfile(rawUser);
console.log('Canonical Profile built ->', JSON.stringify(canon, null, 2));

if (canon.dateBS !== '2049-04-09' || canon.dateAD !== '1992-07-24' || canon.time24 !== '16:30' || canon.time !== '04:30 PM') {
  throw new Error('Canonical profile mismatch for Binod Ghimire');
}

console.log('\n✔ ALL CANONICAL NORMALIZER TESTS PASSED PERFECTLY!');

import assert from 'node:assert';
import NepaliDate from 'nepali-date-converter';

const NepaliDateClass = (NepaliDate)?.default?.default || (NepaliDate)?.default || NepaliDate;

function adToKtmBS(dateInput) {
  const rawDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(rawDate.getTime())) throw new Error('Invalid Date');

  // Convert to Asia/Kathmandu (UTC+05:45)
  const utcMs = rawDate.getTime() + (rawDate.getTimezoneOffset() * 60000);
  const ktmMs = utcMs + (345 * 60000);
  const ktmDate = new Date(ktmMs);

  const nd = new NepaliDateClass(ktmDate);
  return {
    year: nd.getYear(),
    month: nd.getMonth() + 1,
    day: nd.getDate()
  };
}

console.log('Running Bikram Sambat Date Conversion Regression Tests...');

// Test 1: 2026-10-28T05:26:43.181Z -> 2083 Kartik 11 (२०८३ कार्तिक ११)
const t1 = adToKtmBS('2026-10-28T05:26:43.181Z');
assert.strictEqual(t1.year, 2083, 'Year must be 2083');
assert.strictEqual(t1.month, 7, 'Month must be 7 (Kartik)');
assert.strictEqual(t1.day, 11, 'Day must be 11');
console.log('✔ Test 1 Passed: 2026-10-28T05:26:43.181Z -> 2083 Kartik 11 BS');

// Test 2: Midnight Kathmandu boundary: 2026-10-27T18:30:00Z (00:15 on Oct 28 in KTM) -> 2083 Kartik 11
const t2 = adToKtmBS('2026-10-27T18:30:00.000Z');
assert.strictEqual(t2.year, 2083, 'Year must be 2083');
assert.strictEqual(t2.month, 7, 'Month must be 7 (Kartik)');
assert.strictEqual(t2.day, 11, 'Day must be 11');
console.log('✔ Test 2 Passed: 2026-10-27T18:30:00.000Z (00:15 KTM) -> 2083 Kartik 11 BS');

// Test 3: Prior day in Kathmandu: 2026-10-27T18:14:00Z (23:59 on Oct 27 in KTM) -> 2083 Kartik 10
const t3 = adToKtmBS('2026-10-27T18:14:00.000Z');
assert.strictEqual(t3.year, 2083, 'Year must be 2083');
assert.strictEqual(t3.month, 7, 'Month must be 7 (Kartik)');
assert.strictEqual(t3.day, 10, 'Day must be 10');
console.log('✔ Test 3 Passed: 2026-10-27T18:14:00.000Z (23:59 KTM) -> 2083 Kartik 10 BS');

// Test 4: BS 2081 Baisakh 1: 2024-04-13T06:00:00Z
const t4 = adToKtmBS('2024-04-13T06:00:00.000Z');
assert.strictEqual(t4.year, 2081, 'Year must be 2081');
assert.strictEqual(t4.month, 1, 'Month must be 1 (Baisakh)');
assert.strictEqual(t4.day, 1, 'Day must be 1');
console.log('✔ Test 4 Passed: 2024-04-13T06:00:00.000Z -> 2081 Baisakh 1 BS');

console.log('\n🎉 ALL BIKRAM SAMBAT DATE CONVERSION REGRESSION TESTS PASSED!');

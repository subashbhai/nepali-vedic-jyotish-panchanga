import {
  calculateMembershipDateSchedule,
  addCalendarYears,
  addCalendarMonths,
  getNepaliBSDate
} from '../src/server/membershipDateEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`PASSED: ${msg}`);
}

console.log('--- Testing Membership Date Engine ---');

// 1. One calendar year calculation
const oct27_2026 = new Date('2026-10-27T10:00:00.000Z');
const oneYearResult = calculateMembershipDateSchedule(oct27_2026, '1_year');
assert(oneYearResult.expiresAtISO !== null, 'One year expiry is not null');
assert(oneYearResult.expiresAtDate?.getFullYear() === 2027, 'Expiry year is 2027');
assert(oneYearResult.expiresAtDate?.getMonth() === 9, 'Expiry month is October (month index 9)');
assert(oneYearResult.expiresAtDate?.getDate() === 27, 'Expiry day is 27');
assert(!oneYearResult.isLifetime, 'One year is not lifetime');
assert(oneYearResult.activatedAtBS.includes('२०८३'), `Activation BS year is 2083: got ${oneYearResult.activatedAtBS}`);
assert(oneYearResult.expiresAtBS.includes('२०८४'), `Expiry BS year is 2084: got ${oneYearResult.expiresAtBS}`);

// 2. Leap year handling: Feb 29, 2028 + 1 year -> Feb 28, 2029
const leapDay2028 = new Date('2028-02-29T12:00:00.000Z');
const leapYearResult = calculateMembershipDateSchedule(leapDay2028, '1_year');
assert(leapYearResult.expiresAtDate?.getFullYear() === 2029, 'Leap expiry year is 2029');
assert(leapYearResult.expiresAtDate?.getMonth() === 1, 'Leap expiry month is February (month index 1)');
assert(leapYearResult.expiresAtDate?.getDate() === 28, 'Feb 29 on leap year adjusted to Feb 28 on non-leap year');

// 3. 24-Hour Free Trial
const trialStart = new Date('2026-10-27T12:00:00.000Z');
const trialResult = calculateMembershipDateSchedule(trialStart, 'trial');
assert(trialResult.expiresAtTimestamp! - trialStart.getTime() === 24 * 60 * 60 * 1000, 'Trial duration is exactly 24 hours (86,400,000 ms)');
assert(trialResult.expiresAtISO === '2026-10-28T12:00:00.000Z', 'Trial expires at 2026-10-28T12:00:00.000Z');

// 4. Lifetime Subscription
const lifetimeResult = calculateMembershipDateSchedule(oct27_2026, 'lifetime');
assert(lifetimeResult.isLifetime === true, 'Lifetime isLifetime is true');
assert(lifetimeResult.expiresAtISO === null, 'Lifetime expiresAtISO is null');
assert(lifetimeResult.expiresAtTimestamp === null, 'Lifetime expiresAtTimestamp is null');
assert(lifetimeResult.expiresAtBS.includes('आजीवन'), 'Lifetime expiresAtBS is आजीवन');

// 5. Dynamic BS conversion
const bsDate = getNepaliBSDate(oct27_2026);
assert(bsDate.includes('२०८३'), `BS Date contains २०८३: ${bsDate}`);

console.log('--- ALL MEMBERSHIP DATE ENGINE TESTS PASSED ---');

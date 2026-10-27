import { calculateMembershipDateSchedule, getNepaliBSDate, addCalendarYears, addCalendarMonths } from '../src/server/membershipDateEngine';
import { authEngine } from '../src/server/authEngine';
import { membershipEngine, MEMBERSHIP_PLANS } from '../src/server/membershipEngine';

async function runTestSuite() {
  console.log('=== BALANANDA VAIDIK SEWA: MEMBERSHIP & DATE ENGINE VERIFICATION ===\n');
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] ${testName} ${detail ? '— ' + detail : ''}`);
    } else {
      console.error(`[FAIL] ${testName} ${detail ? '— ' + detail : ''}`);
      throw new Error(`Test Failed: ${testName}`);
    }
  }

  // 1. Bikram Sambat Date Dynamic Conversion
  const testDate2026 = new Date('2026-10-27T10:00:00.000Z');
  const bsDate2026 = getNepaliBSDate(testDate2026);
  assert(bsDate2026.startsWith('२०८३'), 'Dynamic BS Date for 2026 AD starts with २०८३', bsDate2026);
  assert(!bsDate2026.includes('२०८१'), 'Dynamic BS Date does NOT contain hardcoded २०८१', bsDate2026);

  // 2. Calendar Year Calculation (Oct 27, 2026 -> Oct 27, 2027)
  const oneYearFrom2026 = addCalendarYears(testDate2026, 1);
  assert(
    oneYearFrom2026.toISOString().startsWith('2027-10-27'),
    'addCalendarYears handles exact calendar year',
    oneYearFrom2026.toISOString()
  );

  // 3. Leap Year Calculation (Feb 29, 2028 -> Feb 28, 2029)
  const leapDay2028 = new Date('2028-02-29T12:00:00.000Z');
  const afterLeapYear = addCalendarYears(leapDay2028, 1);
  assert(
    afterLeapYear.getUTCMonth() === 1 && afterLeapYear.getUTCDate() === 28,
    'addCalendarYears handles leap day Feb 29 -> Feb 28 on non-leap year',
    afterLeapYear.toISOString()
  );

  // 4. 24-Hour Free Trial Date Schedule
  const trialSchedule = calculateMembershipDateSchedule(testDate2026, 'trial');
  assert(trialSchedule.duration === 'trial', 'Trial duration type is trial');
  assert(
    trialSchedule.expiresAtTimestamp! - testDate2026.getTime() === 86400000,
    'Trial expires in exactly 86,400,000 ms (24 hours)',
    `${trialSchedule.expiresAtISO}`
  );
  assert(trialSchedule.expiresAtBS.includes('२४ घण्टा'), 'Trial BS expiry denotes 24 hours', trialSchedule.expiresAtBS);

  // 5. 1-Year Subscription Date Schedule
  const yearlySchedule = calculateMembershipDateSchedule(testDate2026, '1_year');
  assert(yearlySchedule.duration === '1_year', 'Yearly duration type is 1_year');
  assert(!yearlySchedule.isLifetime, 'Yearly is not lifetime');
  assert(yearlySchedule.expiresAtISO!.startsWith('2027-10-27'), 'Yearly expires on 2027-10-27', yearlySchedule.expiresAtISO!);
  assert(yearlySchedule.expiresAtBS.startsWith('२०८४'), 'Yearly BS expiry is in २०८४', yearlySchedule.expiresAtBS);

  // 6. Lifetime Subscription Date Schedule
  const lifetimeSchedule = calculateMembershipDateSchedule(testDate2026, 'lifetime');
  assert(lifetimeSchedule.duration === 'lifetime', 'Lifetime duration type is lifetime');
  assert(lifetimeSchedule.isLifetime === true, 'Lifetime flag is true');
  assert(lifetimeSchedule.expiresAtDate === null, 'Lifetime expiresAtDate is null');
  assert(lifetimeSchedule.expiresAtISO === null, 'Lifetime expiresAtISO is null');
  assert(lifetimeSchedule.expiresAtTimestamp === null, 'Lifetime expiresAtTimestamp is null');
  assert(lifetimeSchedule.expiresAtBS.includes('आजीवन'), 'Lifetime BS expiry text is आजीवन', lifetimeSchedule.expiresAtBS);
  assert(lifetimeSchedule.remainingDays === 99999, 'Lifetime remaining days is 99999');

  // 7. Register New Ordinary Visitor
  const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000).toString();
  const testUsername = `testvisitor_${Date.now()}`;
  const regResult = authEngine.registerUser({
    fullName: 'परीक्षण आगन्तुक',
    address: 'काठमाडौं, नेपाल',
    mobileNumber: testPhone,
    username: testUsername,
    password: 'Password#123'
  });

  assert(regResult.success, 'New user registration succeeds');
  const newUser = regResult.user;
  assert(Boolean(newUser.createdAtISO), 'Account createdAtISO is set automatically', newUser.createdAtISO);
  assert(newUser.createdAtBS.startsWith('२०८३'), 'Account createdAtBS is dynamic (२०८३)', newUser.createdAtBS);
  assert(newUser.userCategory === 'visitor', 'User category defaults to visitor');
  assert(
    newUser.subscriptionPlan === 'साधारण खाता (योजना छैन)',
    'User subscriptionPlan defaults to साधारण खाता (योजना छैन)',
    newUser.subscriptionPlan
  );
  assert(newUser.subscriptionStartAt === null, 'subscriptionStartAt is null for visitor');
  assert(newUser.subscriptionExpiresAt === null, 'subscriptionExpiresAt is null for visitor');

  // 8. Invariant Account Creation Date on Login
  const loginResult = authEngine.loginUser(testUsername, 'Password#123');
  assert(loginResult.success, 'User login succeeds');
  assert(loginResult.user.createdAtISO === newUser.createdAtISO, 'createdAtISO does NOT change on login');
  assert(loginResult.user.createdAtBS === newUser.createdAtBS, 'createdAtBS does NOT change on login');

  // 9. Service Access Check for Ordinary Visitor (No Paid Plan)
  const visitorAccess = membershipEngine.checkServiceAccess(testPhone, 'jyotish');
  assert(!visitorAccess.hasAccess, 'Visitor has no access to Jyotish without purchase');
  assert(!visitorAccess.isLifetime, 'Visitor is not lifetime');
  assert(visitorAccess.remainingDays === 0, 'Visitor remaining days is 0');

  // 10. Panchanga Service is Always Free & Public
  const panchangaAccess = membershipEngine.checkServiceAccess(testPhone, 'panchanga');
  assert(panchangaAccess.hasAccess, 'Panchanga is accessible to everyone for free');

  // 11. Submit Purchase Request (Purchase Pending)
  const purchaseReqResult = membershipEngine.submitPurchaseRequest({
    userId: newUser.id,
    phone: testPhone,
    fullName: newUser.fullName,
    planId: 'yearly_mobile',
    paymentMethod: 'esewa',
    transactionId: 'TXN-TEST-1234'
  });
  assert(purchaseReqResult.success, 'Purchase request submission succeeds');
  const pendingMem = purchaseReqResult.membership!;
  assert(pendingMem.membershipStatus === 'PENDING_PAYMENT', 'Status is PENDING_PAYMENT');
  assert(pendingMem.activatedAtISO === undefined, 'activatedAtISO is undefined while pending');
  assert(pendingMem.expiresAtTimestamp === undefined, 'expiresAtTimestamp is undefined while pending');

  // 12. Super Admin Approves Membership (1 Year)
  const approveResult = membershipEngine.approveMembership(pendingMem.id, 'SuperAdmin');
  assert(approveResult.success, 'SuperAdmin approveMembership succeeds');
  const activeMem = approveResult.membership!;
  assert(activeMem.membershipStatus === 'ACTIVE', 'Membership status is ACTIVE');
  assert(Boolean(activeMem.activatedAtISO), 'activatedAtISO is recorded', activeMem.activatedAtISO);
  assert(activeMem.activatedAtBS!.startsWith('२०८३'), 'activatedAtBS is २०८३', activeMem.activatedAtBS);
  assert(activeMem.expiresAtISO!.startsWith('2027'), 'expiresAtISO is 1 calendar year later', activeMem.expiresAtISO);
  assert(activeMem.expiresAtBS!.startsWith('२०८४'), 'expiresAtBS is २०८४', activeMem.expiresAtBS);

  // 13. Verify Service Access After Approval
  const memberAccess = membershipEngine.checkServiceAccess(testPhone, 'jyotish');
  assert(memberAccess.hasAccess, 'Member has active access to Jyotish after approval');
  assert(memberAccess.remainingDays > 300, 'Member has > 300 remaining days', `${memberAccess.remainingDays} days`);

  // 14. Manual Activation of Lifetime Membership
  const lifetimeUserPhone = '9841008888';
  const manualLifetime = membershipEngine.activateManualMembership({
    userId: `usr_lifetime_${Date.now()}`,
    phone: lifetimeUserPhone,
    fullName: 'आजीवन सदस्य',
    planId: 'lifetime_both',
    adminId: 'SuperAdmin',
    cashVerified: true
  });
  assert(manualLifetime.success, 'Manual lifetime activation succeeds');
  const lifeMem = manualLifetime.membership!;
  assert(lifeMem.membershipStatus === 'ACTIVE', 'Lifetime status is ACTIVE');
  assert(lifeMem.duration === 'lifetime', 'Duration is lifetime');
  assert(lifeMem.expiresAtTimestamp === null, 'Lifetime expiresAtTimestamp is null');
  assert(lifeMem.expiresAtISO === null, 'Lifetime expiresAtISO is null');
  assert(lifeMem.expiresAtBS.includes('आजीवन'), 'Lifetime expiresAtBS is आजीवन');

  // 15. Check Lifetime Access
  const lifeAccess = membershipEngine.checkServiceAccess(lifetimeUserPhone, 'jyotish');
  assert(lifeAccess.hasAccess, 'Lifetime member has access');
  assert(lifeAccess.isLifetime, 'Lifetime member flag is true');
  assert(lifeAccess.remainingDays === 99999, 'Lifetime remaining days is 99999');

  // 16. Dynamic Expiry Enforcement
  const expiredUserPhone = '9841007777';
  const expiredMem = membershipEngine.activateManualMembership({
    userId: `usr_exp_${Date.now()}`,
    phone: expiredUserPhone,
    fullName: 'म्याद सकिएको प्रयोगकर्ता',
    planId: 'yearly_mobile',
    adminId: 'SuperAdmin',
    cashVerified: true,
    customExpiresAtTimestamp: Date.now() - 1000 // 1 second in the past
  });
  assert(expiredMem.success, 'Expired membership created for testing');
  const expAccess = membershipEngine.checkServiceAccess(expiredUserPhone, 'jyotish');
  assert(!expAccess.hasAccess, 'Expired member access is revoked');
  assert(expAccess.isExpired, 'Expired member isExpired flag is true');
  assert(expAccess.membershipStatus === 'EXPIRED', 'Status transitioned to EXPIRED');

  console.log(`\n======================================================`);
  console.log(`ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log(`======================================================\n`);
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

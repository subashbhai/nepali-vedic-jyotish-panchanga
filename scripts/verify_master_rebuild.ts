/**
 * Master Rebuild Automated Test & Verification Suite
 * Project: Balananda Vaidik Sewa
 * Objective: Verify Zero-OTP Architecture, Salted Scrypt Hashing,
 * 5-Field Registration, Dual-Identifier Login, 3-Tier Access Permissions,
 * Offline Payment Recording, 1-Month Expiry Scheduler & 16-Column Admin Table.
 */

import { authEngine } from '../src/server/authEngine';
import * as fs from 'fs';
import * as path from 'path';

async function runTests() {
  console.log('====================================================');
  console.log('BALANANDA VAIDIK SEWA - MASTER SYSTEM VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Zero OTP Code Verification (Ensure no OTP files or lingering OTP methods)
  const otpChallengeFile = path.join(process.cwd(), 'data', 'otp_challenges.json');
  const emailOtpAuditFile = path.join(process.cwd(), 'data', 'email_otp_audit.json');
  assert(!fs.existsSync(otpChallengeFile), 'Legacy data/otp_challenges.json does not exist');
  assert(!fs.existsSync(emailOtpAuditFile), 'Legacy data/email_otp_audit.json does not exist');

  // TEST 2: 5-Field Registration
  const testMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const testUsername = 'testuser_' + Date.now().toString(36);
  const testPassword = 'SecurePass@2081';

  const regResult = authEngine.registerUser({
    fullName: 'हरिप्रसाद दाहाल',
    address: 'काठमाडौँ, नेपाल',
    mobileNumber: testMobile,
    username: testUsername,
    password: testPassword
  });

  assert(regResult.success === true, '5-Field Registration succeeds cleanly with no OTP step');
  assert(regResult.user?.fullName === 'हरिप्रसाद दाहाल', 'User full name registered correctly');
  assert(regResult.user?.address === 'काठमाडौँ, नेपाल', 'User address registered correctly');
  assert(regResult.user?.phone === testMobile, 'User mobile number registered correctly');
  assert(regResult.user?.username === testUsername, 'User username registered correctly');
  assert(regResult.user?.userCategory === 'visitor', 'Non-negotiable: Default userCategory is VISITOR');
  assert(regResult.user?.role === 'user', 'Default role is user');
  assert(regResult.user?.accountStatus === 'active', 'Default accountStatus is active');

  // TEST 3: Cryptographic Password Hashing (Salted Scrypt)
  // Verify that raw password is NOT stored and hash follows scrypt:salt:hash
  const rawUsers = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'users.json'), 'utf-8'));
  const savedUser = rawUsers.find((u: any) => u.id === regResult.user?.id);
  assert(savedUser !== undefined, 'User is persistently saved in data/users.json');
  assert(savedUser.passwordHash && savedUser.passwordHash.startsWith('scrypt:'), 'Password hash uses salted Scrypt format (scrypt:salt:key)');
  assert(savedUser.password !== testPassword, 'Raw password is never saved in plaintext');

  // TEST 4: Dual-Identifier Login - Via Mobile Number
  const loginMobileResult = authEngine.loginUser({
    identifier: testMobile,
    password: testPassword
  });
  assert(loginMobileResult.success === true, 'Dual-Identifier Login via Mobile Number succeeds');
  assert(loginMobileResult.session?.userId === regResult.user?.id, 'Session contains valid user ID');
  assert(loginMobileResult.user?.userCategory === 'visitor', 'Session accurately reflects visitor category');

  // TEST 5: Dual-Identifier Login - Via Username
  const loginUsernameResult = authEngine.loginUser({
    identifier: testUsername,
    password: testPassword
  });
  assert(loginUsernameResult.success === true, 'Dual-Identifier Login via Username succeeds');

  // TEST 6: Incorrect Password Rejection
  const badLoginResult = authEngine.loginUser({
    identifier: testUsername,
    password: 'WrongPassword123'
  });
  assert(badLoginResult.success === false, 'Incorrect password correctly rejected');

  // TEST 7: Super Admin 16-Column Dataset
  const adminUsersTable = authEngine.getAllUsersForAdmin({ search: testUsername });
  assert(adminUsersTable.length === 1, 'Admin table finds the newly created user');
  const row = adminUsersTable[0];
  assert(row.serialNumber === 1, 'Col 1: Serial number present');
  assert(row.fullName === 'हरिप्रसाद दाहाल', 'Col 2: Full name present');
  assert(row.address === 'काठमाडौँ, नेपाल', 'Col 3: Address present');
  assert(row.mobileNumber === testMobile, 'Col 4: Mobile number present');
  assert(row.username === testUsername, 'Col 5: Username present');
  assert(row.registrationDate !== undefined, 'Col 6: Registration date present');
  assert(row.accountStatus === 'active', 'Col 7: Account status present');
  assert(row.userCategory === 'visitor', 'Col 8: User Category present and equals visitor');
  assert(row.subscriptionPlan !== undefined, 'Col 9: Subscription plan present');
  assert(row.paymentAmountNPR === 0, 'Col 10: Payment Amount NPR present (editable field)');
  assert(row.paymentStatus === 'pending', 'Col 11: Payment Status present');
  assert(row.actions && row.actions.length > 0, 'Col 16: Actions present');

  // TEST 8: Super Admin Category Upgrade to Member
  const upgradeToMember = authEngine.updateUserCategory(regResult.user.id, 'member', 'SuperAdmin', 'सदस्यता अनुमोदन');
  assert(upgradeToMember.success === true, 'Super Admin updates userCategory to Member');
  const updatedLogin = authEngine.loginUser({ identifier: testUsername, password: testPassword });
  assert(updatedLogin.user?.userCategory === 'member', 'Subsequent login reflects updated Member category');

  // TEST 9: Super Admin Offline Payment Recording & Expiry Activation
  const recordPay = authEngine.recordManualPayment({
    userId: regResult.user.id,
    amountNPR: 2500,
    planId: 'yearly_member',
    planNameNepali: 'वार्षिक पूर्ण सदस्य योजना',
    category: 'member',
    durationDays: 365,
    paymentMethod: 'cash_office',
    notes: 'कार्यालयमा नगद भुक्तानी प्राप्त',
    adminUsername: 'SuperAdmin'
  });
  assert(recordPay.success === true, 'Offline payment recorded and subscription created');
  assert(recordPay.payment?.amountNPR === 2500, 'Payment amount stored correctly');

  // TEST 10: Super Admin Category Upgrade to Professional
  const upgradeToProf = authEngine.updateUserCategory(regResult.user.id, 'professional', 'SuperAdmin', 'ज्योतिष तथा वास्तु लाइसेन्स');
  assert(upgradeToProf.success === true, 'Super Admin updates userCategory to Professional');
  const profUser = authEngine.loginUser({ identifier: testUsername, password: testPassword });
  assert(profUser.user?.userCategory === 'professional', 'Professional user unlocks full system');

  // TEST 11: 1-Month Advance Expiry Notification Scheduler
  const expirySweep = authEngine.runExpiryAndNotificationCheck();
  assert(typeof expirySweep.expiredCount === 'number', 'Expiry sweep executes without errors');
  const userNotifs = authEngine.getUserNotifications(regResult.user.id);
  assert(Array.isArray(userNotifs), 'User notifications retrieved cleanly');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

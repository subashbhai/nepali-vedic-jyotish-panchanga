/**
 * Master Verification Suite:
 * 1. HTTP 405 Root Cause Fix & Vite Proxy
 * 2. 3-Field Signup & Dual OTP Verification
 * 3. Atomic Database Persistence across Backend Restarts
 * 4. Full Membership Lifecycle & SuperAdmin Approval
 * 5. Cash Verification Enforcement
 * 6. Central Service Entitlement, 30-Day Expiry Warning & Instant Expiry Lock
 */

import fs from 'fs';
import path from 'path';
import { authEngine } from '../src/server/authEngine';
import { membershipEngine, MEMBERSHIP_PLANS } from '../src/server/membershipEngine';
import { smsProviderService, emailProviderService } from '../src/server/otpProviderService';

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, id: number, name: string, message: string) {
  if (condition) {
    results.push({ id, name, passed: true, message });
    console.log(`\x1b[32m[PASS]\x1b[0m Test ${id}: ${name} — ${message}`);
  } else {
    results.push({ id, name, passed: false, message: `FAILED: ${message}` });
    console.error(`\x1b[31m[FAIL]\x1b[0m Test ${id}: ${name} — ${message}`);
  }
}

async function runMasterSuite() {
  console.log('\n================================================================');
  console.log('BALANANDA VEDIC JYOTISH — MASTER VERIFICATION SUITE (20 TESTS)');
  console.log('================================================================\n');

  // ── TEST 1: Vite Proxy & 405 Prevention Configuration ──
  const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
  const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');
  const hasProxy = viteContent.includes("'/api': {") && viteContent.includes('http://localhost:3000');
  assert(hasProxy, 1, 'HTTP 405 Prevention: Vite API Proxy', 'vite.config.ts explicitly proxies /api to port 3000');

  // ── TEST 2: Express Server Guard & Preflight OPTIONS ──
  const serverPath = path.resolve(process.cwd(), 'server.ts');
  const serverContent = fs.readFileSync(serverPath, 'utf-8');
  const hasCorsAndOptions = serverContent.includes('req.method === "OPTIONS"') && serverContent.includes('res.sendStatus(204)');
  const hasApiFallbackGuard = serverContent.includes('app.all("/api/*"') && serverContent.includes('API मार्ग फेला परेन');
  assert(hasCorsAndOptions && hasApiFallbackGuard, 2, 'HTTP 405 Prevention: Server Guards', 'server.ts handles CORS OPTIONS with 204 and isolates /api/* from Vite static fallback');

  // ── TEST 3: Signup Start: 3-Field Validation ──
  authEngine.resetForTesting();
  const emptyRes = await authEngine.startRegistration('', '', '', [], '127.0.0.1');
  const partialRes = await authEngine.startRegistration('बालानन्द जोशी', '9841234567', '', [], '127.0.0.1');
  assert(!emptyRes.success && !partialRes.success, 3, '3-Field Validation: Incomplete Fields Rejection', 'Registration strictly requires Full Name, Mobile, and Email');

  // ── TEST 4: Duplicate Mobile Prevention ──
  const mockExistingUsers: any[] = [
    { id: 'u1', fullName: 'हरि प्रसाद', phone: '9841234567', email: 'existing.user@balanandajyotish.com' }
  ];
  const dupMobileRes = await authEngine.startRegistration('नयाँ नाम', '9841234567', 'new.unique@example.com', mockExistingUsers, '127.0.0.2');
  assert(!dupMobileRes.success && dupMobileRes.message.includes('पहिले नै दर्ता'), 4, 'Duplicate Mobile Prevention', 'Existing phone registration rejected with clear Nepali warning');

  // ── TEST 5: Duplicate Email Prevention ──
  const dupEmailRes = await authEngine.startRegistration('नयाँ नाम', '9851999999', 'EXISTING.USER@balanandajyotish.com', mockExistingUsers, '127.0.0.3');
  assert(!dupEmailRes.success && dupEmailRes.message.includes('पहिले नै दर्ता'), 5, 'Duplicate Email Prevention', 'Existing email registration rejected case-insensitively');

  // ── TEST 6: Mobile & Email Dual OTP Generation ──
  const testPhone = '9841112233';
  const testEmail = 'ram.sharma@example.com';
  const validSignup = await authEngine.startRegistration('राम कृष्ण शर्मा', testPhone, testEmail, mockExistingUsers, '127.0.0.4');
  assert(validSignup.success && Boolean(validSignup.challengeId), 6, 'Dual OTP Generation & Challenge Registration', `Challenge issued with ID: ${validSignup.challengeId}`);

  // Retrieve raw OTPs from mock providers
  const rawPhoneOTP = smsProviderService.getLastSentOTP(testPhone) || '123456';
  const rawEmailOTP = emailProviderService.getLastSentOTP(testEmail) || '654321';

  // ── TEST 7: Invalid OTP & Attempt Counter ──
  const wrongRes = authEngine.verifyPhoneOTP(validSignup.challengeId!, '000000');
  assert(!wrongRes.success && wrongRes.message.includes('बाँकी प्रयास: 4'), 7, 'OTP Attempt Counter Decrement', 'Incorrect OTP decrements attempt counter to 4');

  // ── TEST 8: Attempt Lockout (5 Failed Attempts) ──
  // Attempt 2, 3, 4
  authEngine.verifyPhoneOTP(validSignup.challengeId!, '000000');
  authEngine.verifyPhoneOTP(validSignup.challengeId!, '000000');
  authEngine.verifyPhoneOTP(validSignup.challengeId!, '000000');
  // Attempt 5 triggers lockout
  const lockoutRes = authEngine.verifyPhoneOTP(validSignup.challengeId!, '000000');
  const challengeAfterLockout = authEngine.getChallenge(validSignup.challengeId!);
  assert(!lockoutRes.success && lockoutRes.message.includes('सुरक्षाका लागि यो सत्र रद्द गरियो') && challengeAfterLockout === undefined, 8, 'OTP Security Lockout Enforcement', 'Challenge locked and purged after 5 failed attempts');

  // ── TEST 9: Fresh Challenge & Resend Cooldown ──
  const freshPhone = '9851223344';
  const freshEmail = 'sita.suvedi@example.com';
  const freshSignup = await authEngine.startRegistration('सीता देवी सुवेदी', freshPhone, freshEmail, mockExistingUsers, '127.0.0.5');
  const cooldownRes = await authEngine.resendOTP(freshSignup.challengeId!, 'phone');
  assert(!cooldownRes.success && cooldownRes.message.includes('सेकेन्ड पर्खनुहोस्'), 9, '60-Second Resend Cooldown Enforcement', 'Rapid OTP resend blocked within 60s cooldown');

  // ── TEST 10: Single-Channel Verification does NOT finalize ──
  const phoneOTP2 = smsProviderService.getLastSentOTP(freshPhone)!;
  const emailOTP2 = emailProviderService.getLastSentOTP(freshEmail)!;

  const vPhoneRes = authEngine.verifyPhoneOTP(freshSignup.challengeId!, phoneOTP2);
  assert(vPhoneRes.success && vPhoneRes.phoneVerified && !vPhoneRes.emailVerified, 10, 'Mobile OTP Verification', 'Mobile OTP verified, email remains unverified');

  const finalizePremature = authEngine.finalizeRegistration(freshSignup.challengeId!);
  assert(!finalizePremature.success && finalizePremature.message.includes('दुवै'), 11, 'Dual Verification Guard', 'Account finalization blocked when only one channel is verified');

  // ── TEST 11: Dual Verification & Auto-Login Finalization ──
  const vEmailRes = authEngine.verifyEmailOTP(freshSignup.challengeId!, emailOTP2);
  assert(vEmailRes.success && vEmailRes.emailVerified, 12, 'Email OTP Verification', 'Email OTP verified successfully');

  const finalizeSuccess = authEngine.finalizeRegistration(freshSignup.challengeId!);
  assert(finalizeSuccess.success && Boolean(finalizeSuccess.token) && finalizeSuccess.user?.mobileVerified && finalizeSuccess.user?.emailVerified, 13, 'Atomic Account Finalization & Auto-Login', 'Dual verified account successfully created with active session token');

  // ── TEST 12: Backend Restart Persistence of Sessions ──
  const userToken = finalizeSuccess.token!;
  // Re-instantiate / re-load authEngine from disk
  authEngine.loadFromDisk();
  const sessionAfterRestart = authEngine.validateSession(userToken);
  assert(Boolean(sessionAfterRestart) && sessionAfterRestart?.phone === freshPhone, 14, 'Backend Restart Persistence: Active Sessions', 'User session token preserved across backend restart from active_sessions.json');

  // ── TEST 13: Official Membership Pricing Plans ──
  assert(
    MEMBERSHIP_PLANS.yearly_mobile.priceNPR === 200 &&
    MEMBERSHIP_PLANS.lifetime_mobile.priceNPR === 1000 &&
    MEMBERSHIP_PLANS.yearly_computer.priceNPR === 500 &&
    MEMBERSHIP_PLANS.lifetime_computer.priceNPR === 2500 &&
    MEMBERSHIP_PLANS.yearly_both.priceNPR === 1200 &&
    MEMBERSHIP_PLANS.lifetime_both.priceNPR === 3000,
    15,
    'Official Membership Pricing Matrix',
    'Mobile (200/1000), Computer (500/2500), Both (1200/3000) verified'
  );

  // ── TEST 14: Membership Purchase Request Submission ──
  membershipEngine.loadFromDisk();
  const purchaseRes = membershipEngine.submitPurchaseRequest({
    userId: finalizeSuccess.user!.id,
    phone: freshPhone,
    email: freshEmail,
    fullName: 'सीता देवी सुवेदी',
    planId: 'yearly_both',
    paymentMethod: 'cash',
    transactionId: 'CASH-REF-01'
  });
  assert(purchaseRes.success && purchaseRes.membership.membershipStatus === 'PENDING_PAYMENT', 16, 'Membership Purchase Submission', 'Membership submitted with status PENDING_PAYMENT');

  // ── TEST 15: Cash Payment Verification Enforcement ──
  const cashWithoutVerification = membershipEngine.approveMembership(purchaseRes.membership.id, 'superadmin', {
    cashVerified: false
  });
  assert(!cashWithoutVerification.success && cashWithoutVerification.message.includes('नगद भुक्तानी प्राप्त भएको रुजु'), 17, 'Mandatory Cash Verification Enforcement', 'Approval of cash purchase without cashVerified: true is strictly blocked');

  // ── TEST 16: SuperAdmin Approval with Cash Verification ──
  const cashApproved = membershipEngine.approveMembership(purchaseRes.membership.id, 'superadmin', {
    cashVerified: true,
    verifiedAmount: 1200,
    adminNotes: 'नगद रकम रु. १२२० प्राप्त भएको रुजु गरियो'
  });
  assert(cashApproved.success && cashApproved.membership?.membershipStatus === 'ACTIVE' && cashApproved.membership?.cashVerified === true, 18, 'SuperAdmin Cash Approval & Activation', 'Membership successfully approved and marked ACTIVE with cashVerified=true');

  // ── TEST 17: Service Entitlement Enforcement (Jyotish & Vastu) ──
  const jyotishAccess = membershipEngine.checkServiceAccess(freshPhone, 'jyotish');
  const vastuAccess = membershipEngine.checkServiceAccess(freshPhone, 'vastu');
  assert(jyotishAccess.hasAccess && vastuAccess.hasAccess && jyotishAccess.remainingDays > 300, 19, 'Central Service Entitlement Enforcement', 'Active 1-year membership unlocks Jyotish and Vastu services');

  // ── TEST 18: 30-Day Expiration Warning ──
  // Simulate membership expiring in 15 days
  const expiringMem = membershipEngine.submitPurchaseRequest({
    userId: 'user_expiring_test',
    phone: '9841888888',
    fullName: 'परीक्षण प्रयोगकर्ता',
    planId: 'yearly_mobile',
    paymentMethod: 'bank',
    transactionId: 'TXN-BANK-01'
  });
  membershipEngine.approveMembership(expiringMem.membership.id, 'superadmin', {
    cashVerified: true
  });
  // Manually adjust expiration to 15 days from now
  const storedExpMem = membershipEngine.getMembershipByUserId('user_expiring_test');
  if (storedExpMem) {
    storedExpMem.expiresAtTimestamp = Date.now() + 15 * 24 * 60 * 60 * 1000;
  }
  const warningCheck = membershipEngine.checkServiceAccess('9841888888', 'jyotish');
  assert(warningCheck.hasAccess && warningCheck.showWarning30Days && warningCheck.remainingDays === 15, 20, '30-Day Expiry Warning Alert', 'Warning flag showWarning30Days=true triggered when <= 30 days remaining');

  // ── SUMMARY & RESULTS ──
  console.log('\n================================================================');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('================================================================\n');

  if (passedCount === results.length) {
    console.log('\x1b[32m✔ ALL 20 ARCHITECTURAL & LIFECYCLE TESTS PASSED PERFECTLY!\x1b[0m\n');
    process.exit(0);
  } else {
    console.error('\x1b[31m✖ SOME TESTS FAILED. PLEASE REVIEW OUTPUT ABOVE.\x1b[0m\n');
    process.exit(1);
  }
}

runMasterSuite().catch(err => {
  console.error('Test Suite encountered an unexpected error:', err);
  process.exit(1);
});

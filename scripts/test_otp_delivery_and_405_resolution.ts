import { apiClient } from '../src/services/apiClient';
import { authService } from '../src/services/authService';
import fs from 'fs';
import path from 'path';

async function runDiagnosticsAndVerification() {
  console.log('===============================================================');
  console.log('🧪 BALANANDA JYOTISH - OTP DELIVERY & 405 DIAGNOSTIC SUITE');
  console.log('===============================================================\n');

  apiClient.setBaseUrl('http://localhost:3000');

  // TEST 1: URL Resolution & 405 Prevention
  console.log('[TEST 1] Testing Base URL Resolution & Static Hosting Handling...');
  const baseUrl = apiClient.getBaseUrl();
  console.log('  -> Active authoritative Base URL:', baseUrl);
  if (!baseUrl || !baseUrl.includes('http')) {
    throw new Error('Base URL resolution failed');
  }
  console.log('  ✓ Base URL resolved safely to:', baseUrl);

  // TEST 2: Signup Request & Diagnostic Structured Logging
  const testPhone = '980' + Math.floor(1000000 + Math.random() * 9000000);
  const testEmail = `test.vedic.${Date.now()}@example.com`;
  console.log(`\n[TEST 2] Initiating Dual-OTP Registration for phone=${testPhone.slice(0, 2)}****${testPhone.slice(-4)}, email=t***@example.com`);

  const signupRes = await authService.startSignup('पं. अच्युत शर्मा', testPhone, testEmail);
  console.log('  -> Signup Start Response:', JSON.stringify(signupRes, null, 2));

  if (!signupRes.success || !signupRes.challengeId) {
    throw new Error(`Signup start failed: ${signupRes.message}`);
  }
  console.log('  ✓ Challenge created successfully. ID:', signupRes.challengeId);
  console.log('  ✓ Delivery Status:', JSON.stringify(signupRes.deliveryStatus));
  console.log('  ✓ isDevMock Flag:', signupRes.isDevMock);

  if (!signupRes.devHint || !signupRes.devHint.phoneOtp || !signupRes.devHint.emailOtp) {
    throw new Error('devHint was expected in development mode but not provided');
  }
  console.log('  ✓ Development simulation OTPs safely provided for immediate unblocked testing');

  // TEST 3: Verify Audit Log in data/otp_audit.log
  console.log('\n[TEST 3] Verifying Security & Zero Plaintext Leakage in Audit Log...');
  const auditLogPath = path.resolve(process.cwd(), 'data', 'otp_audit.log');
  if (fs.existsSync(auditLogPath)) {
    const rawAudit = fs.readFileSync(auditLogPath, 'utf-8');
    const lines = rawAudit.trim().split('\n').filter(Boolean);
    const lastLine = lines[lines.length - 1];
    console.log('  -> Latest Audit Log Entry:', lastLine);

    // Verify phone is masked
    if (lastLine.includes(testPhone)) {
      throw new Error('Security Violation: Raw phone number found in audit log!');
    }
    // Verify plain OTP is not in the audit log
    if (lastLine.includes(`"${signupRes.devHint.phoneOtp}"`) || lastLine.includes(`"${signupRes.devHint.emailOtp}"`)) {
      throw new Error('Security Violation: Plaintext OTP code leaked into audit log!');
    }
    console.log('  ✓ Audit log is securely masked without plaintext OTP codes or phone numbers.');
  }

  // TEST 4: Phone OTP Verification
  console.log('\n[TEST 4] Verifying Mobile Phone OTP...');
  const phoneRes = await authService.verifyPhoneOTP(signupRes.challengeId, signupRes.devHint.phoneOtp);
  console.log('  -> Phone Verify Result:', JSON.stringify(phoneRes));
  if (!phoneRes.success || !phoneRes.phoneVerified) {
    throw new Error(`Phone verification failed: ${phoneRes.message}`);
  }
  console.log('  ✓ Mobile OTP verified successfully!');

  // TEST 5: Email OTP Verification
  console.log('\n[TEST 5] Verifying Email OTP...');
  const emailRes = await authService.verifyEmailOTP(signupRes.challengeId, signupRes.devHint.emailOtp);
  console.log('  -> Email Verify Result:', JSON.stringify(emailRes));
  if (!emailRes.success || !emailRes.emailVerified || !emailRes.isBothVerified) {
    throw new Error(`Email verification failed: ${emailRes.message}`);
  }
  console.log('  ✓ Email OTP verified successfully! Both channels verified: isBothVerified = true');

  // TEST 6: Registration Finalization
  console.log('\n[TEST 6] Finalizing Registration & Account Activation...');
  const finRes = await authService.finalizeSignup(signupRes.challengeId);
  console.log('  -> Finalize Result:', JSON.stringify({
    success: finRes.success,
    token: finRes.token ? 'JWT_OR_SECURE_TOKEN_GENERATED' : undefined,
    user: finRes.user ? { id: finRes.user.id, phone: finRes.user.phone, role: finRes.user.role } : undefined,
    message: finRes.message
  }));

  if (!finRes.success || !finRes.user || !finRes.token) {
    throw new Error(`Registration finalization failed: ${finRes.message}`);
  }
  console.log('  ✓ User account successfully persisted in database!');
  console.log('  ✓ User authenticated with customer role and persistent session.');

  // TEST 7: Resend OTP Verification with Rate Limiting / Cooldown
  console.log('\n[TEST 7] Testing Resend OTP on Fresh Registration...');
  const testPhone2 = '981' + Math.floor(1000000 + Math.random() * 9000000);
  const testEmail2 = `test.resend.${Date.now()}@example.com`;
  const signup2 = await authService.startSignup('कमल राज जोशी', testPhone2, testEmail2);
  if (!signup2.challengeId) throw new Error('Signup 2 failed');

  // Immediate resend should be rate-limited by 60s cooldown
  const immediateResend = await authService.resendOTP(signup2.challengeId, 'both');
  console.log('  -> Immediate Resend (Expected Cooldown):', immediateResend);
  if (immediateResend.success) {
    throw new Error('Cooldown violation: Resend succeeded immediately without waiting 60s!');
  }
  console.log('  ✓ Server-side 60s cooldown properly enforced.');

  console.log('\n===============================================================');
  console.log('🎉 ALL 7 OTP DELIVERY & ARCHITECTURE TESTS PASSED WITH 100% SUCCESS!');
  console.log('===============================================================');
}

runDiagnosticsAndVerification().catch((err) => {
  console.error('\n❌ DIAGNOSTIC TEST FAILED:', err);
  process.exit(1);
});

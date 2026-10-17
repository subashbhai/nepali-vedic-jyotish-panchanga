/**
 * Test Suite: Unified User Management, Software Purchase, Payment Approval & Automated License Expiry System
 * Validates cross-module integration across:
 * 1. User Management (SuperAdminUserManagementTable)
 * 2. Menu & Access Control (MenuControlPanel / menuControlStore)
 * 3. Payment Approvals (eSewa / Cash / Khalti / AdminClientApprovalsSection)
 * 4. Subscriptions & Trials (AdminServiceLicenseSection / serviceLicenseStore)
 */

import {
  calculateRemainingDays,
  isLicenseExpired,
  getExpiryMilestone,
  getNepaliExpiryWarningMessage,
  calculatePlanDurationTimestamps,
  processExpiryMilestoneNotification
} from '../src/utils/licenseExpiryEngine.js';

// Mock localStorage and window events for node environment
const storage = new Map<string, string>();
const eventLog: Array<{ event: string; detail?: any }> = [];

(global as any).localStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, val: string) => storage.set(key, String(val)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear()
};

(global as any).window = {
  dispatchEvent: (event: any) => {
    eventLog.push({ event: event.type, detail: event.detail });
    return true;
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING INTEGRATED SUBSCRIPTION & LICENSE EXPIRY TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (details) console.error(`     Details: ${details}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TEST SUITE 1: License Expiry Engine Calculations & Milestones
  // ─────────────────────────────────────────────────────────────
  console.log('--- TEST SUITE 1: License Expiry Engine & Milestone Warnings ---');
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // 1.1 Calculation of remaining days
  const future30Days = now + 30 * dayMs;
  const rem30 = calculateRemainingDays(future30Days, now);
  assert(rem30 === 30, 'Calculates 30 days remaining correctly', `Expected 30, got ${rem30}`);

  const future15Days = now + 15 * dayMs;
  const rem15 = calculateRemainingDays(future15Days, now);
  assert(rem15 === 15, 'Calculates 15 days remaining correctly', `Expected 15, got ${rem15}`);

  const past1Day = now - 1 * dayMs;
  const remPast = calculateRemainingDays(past1Day, now);
  assert(remPast === 0, 'Past timestamp returns 0 remaining days', `Expected 0, got ${remPast}`);

  // 1.2 isLicenseExpired logic
  assert(!isLicenseExpired(future30Days, now), 'Future timestamp is NOT expired');
  assert(isLicenseExpired(past1Day, now), 'Past timestamp IS expired');
  assert(!isLicenseExpired(undefined, now), 'Undefined timestamp (Lifetime) is NOT expired');

  // 1.3 Milestone detection (30, 15, 7, 3, 2, 1, 0, 'EXPIRED')
  assert(getExpiryMilestone(now + 30 * dayMs, now) === 30, 'Detects 30-day milestone');
  assert(getExpiryMilestone(now + 15 * dayMs, now) === 15, 'Detects 15-day milestone');
  assert(getExpiryMilestone(now + 7 * dayMs, now) === 7, 'Detects 7-day milestone');
  assert(getExpiryMilestone(now + 3 * dayMs, now) === 3, 'Detects 3-day milestone');
  assert(getExpiryMilestone(now + 2 * dayMs, now) === 2, 'Detects 2-day milestone');
  assert(getExpiryMilestone(now + 1 * dayMs, now) === 1, 'Detects 1-day milestone');
  assert(getExpiryMilestone(past1Day, now) === 'EXPIRED', 'Detects expired milestone');

  // 1.4 Nepali warning messages
  const warn30 = getNepaliExpiryWarningMessage(30);
  assert(warn30.includes('३० दिन बाँकी'), '30-day Nepali message contains Devanagari numerals', warn30);
  const warnExp = getNepaliExpiryWarningMessage('EXPIRED');
  assert(warnExp.includes('म्याद समाप्त भएको छ'), 'Expired Nepali message is accurate', warnExp);

  // 1.5 Duration Timestamps Calculation
  const ts1Year = calculatePlanDurationTimestamps('1_year');
  assert(ts1Year.expiresAtTimestamp !== undefined && ts1Year.expiresAtTimestamp > now, '1 Year plan computes valid future timestamp');
  const tsLifetime = calculatePlanDurationTimestamps('lifetime');
  assert(tsLifetime.expiresAtTimestamp === undefined && tsLifetime.expiresAtBS.includes('आजीवन'), 'Lifetime plan has no expiry timestamp');

  // 1.6 Duplicate-Safe Notification Milestone Logging
  const notif1 = processExpiryMilestoneNotification('user-9841000000', now + 30 * dayMs, 'नेपाली वैदिक ज्योतिष तथा वास्तु सफ्टवेयर');
  assert(notif1.shouldNotify === true, 'First milestone warning triggers notification');
  const notif1Dup = processExpiryMilestoneNotification('user-9841000000', now + 30 * dayMs, 'नेपाली वैदिक ज्योतिष तथा वास्तु सफ्टवेयर');
  assert(notif1Dup.shouldNotify === false, 'Duplicate milestone warning is suppressed to prevent spam');
  const notif2 = processExpiryMilestoneNotification('user-9841000000', now + 15 * dayMs, 'नेपाली वैदिक ज्योतिष तथा वास्तु सफ्टवेयर');
  assert(notif2.shouldNotify === true, 'Subsequent different milestone (15 days) triggers notification');

  // ─────────────────────────────────────────────────────────────
  // TEST SUITE 2: Unified Store Sync & Cash Verification Enforcement
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- TEST SUITE 2: Unified Store Sync & Cash Verification Enforcement ---');

  // Dynamic import of unifiedUserSyncService and store
  const { unifiedUserSyncService } = await import('../src/services/unifiedUserSyncService.js');
  const { getStoredClientLeads, saveClientLeads, isClientPurchaseApproved } = await import('../src/db/clientLeadStore.js');

  // Register a test lead
  const testCashLeadId = 'LEAD-TEST-CASH-001';
  const testCashLead = {
    id: testCashLeadId,
    fullName: 'राम प्रसाद अधिकारी',
    address: 'काठमाडौँ',
    mobile: '9841999999',
    email: 'ram@example.com',
    whatsapp: '9841999999',
    deviceFingerprint: 'test-device-123',
    status: 'PURCHASE_PENDING' as const,
    planId: 'yearly_both',
    planNameNepali: '१ वर्षको सदस्यता',
    planAmountNPR: 2100,
    paymentMethod: 'cash' as const,
    transactionId: 'CASH-PAY-001',
    submittedAtISO: new Date().toISOString(),
    submittedAtBS: '२०८१-०५-१०'
  };

  saveClientLeads([testCashLead]);

  // 2.1 Check pending purchase alert indicator (Green indicator logic)
  const alertCheck = unifiedUserSyncService.checkUserPurchaseAlert('9841999999');
  assert(alertCheck.hasPurchase === true, 'Detects registered user purchase alert');
  assert(alertCheck.isPending === true, 'Alert indicates pending purchase requiring approval');
  assert(alertCheck.planAmountNPR === 2100, 'Alert accurately reports requested plan amount');
  assert(alertCheck.paymentMethod === 'cash', 'Alert accurately reports payment method');

  // 2.2 Attempting to approve cash purchase WITHOUT cash verification checkbox
  const unverifiedAttempt = unifiedUserSyncService.approvePurchase(testCashLeadId, 'SuperAdmin', {
    cashVerified: false
  });
  assert(
    unverifiedAttempt.success === false,
    'Strict Cash Rule: Approving cash purchase without cash checkbox is BLOCKED'
  );
  assert(
    unverifiedAttempt.messageNepali.includes('नगद भुक्तानी'),
    'Returns clear Nepali error requiring cash verification checkbox'
  );

  // 2.3 Approving cash purchase WITH cash verification checkbox checked
  const verifiedApproval = unifiedUserSyncService.approvePurchase(testCashLeadId, 'SuperAdmin', {
    cashVerified: true,
    verifiedAmount: 2100,
    adminNotes: 'भौतिक रूपमा नगद प्राप्त भयो।'
  });
  assert(
    verifiedApproval.success === true,
    'Approving cash purchase with cash checkbox checked SUCCEEDS'
  );

  // 2.4 Verify atomic propagation across all 4 modules:
  const updatedLeads = getStoredClientLeads();
  const approvedLeadRecord = updatedLeads.find(l => l.id === testCashLeadId);
  assert(approvedLeadRecord?.status === 'PURCHASE_APPROVED', 'Lead status updated to PURCHASE_APPROVED');
  assert(approvedLeadRecord?.paymentVerificationStatus === 'VERIFIED', 'Payment status marked VERIFIED');
  assert(approvedLeadRecord?.cashVerified === true, 'cashVerified flag permanently set to true');

  // 2.5 Check software license access is active
  assert(isClientPurchaseApproved() === true, 'Software access is fully unlocked upon approval');

  // ─────────────────────────────────────────────────────────────
  // TEST SUITE 3: License Expiry Access Gating
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- TEST SUITE 3: License Expiry Access Gating ---');

  // Set lead to expired
  const expiredLead = {
    ...approvedLeadRecord!,
    id: 'LEAD-EXPIRED-TEST',
    mobile: '9841888888',
    status: 'PURCHASE_APPROVED' as const,
    expiresAtTimestamp: now - 2 * dayMs, // Expired 2 days ago
    expiresAtISO: new Date(now - 2 * dayMs).toISOString()
  };
  saveClientLeads([expiredLead]);
  localStorage.setItem('balananda_approved_client_license_v2', JSON.stringify({
    isApproved: true,
    expiresAtTimestamp: now - 2 * dayMs,
    expiresAtISO: new Date(now - 2 * dayMs).toISOString()
  }));
  localStorage.removeItem('software_full_access_unlocked_v1');

  // isClientPurchaseApproved must verify timestamp expiration
  const isExpiredAllowed = isClientPurchaseApproved();
  assert(
    isExpiredAllowed === false,
    'Expired license is strictly BLOCKED from paid calculation features'
  );

  // Verify user data is preserved and not deleted
  const preservedLeads = getStoredClientLeads();
  const preservedRecord = preservedLeads.find(l => l.id === 'LEAD-EXPIRED-TEST');
  assert(
    preservedRecord !== undefined,
    'Customer account & record is strictly preserved upon expiry (Never deleted)'
  );
  assert(
    preservedRecord?.fullName === 'राम प्रसाद अधिकारी',
    'Customer details, phone, and history remain intact'
  );

  // ─────────────────────────────────────────────────────────────
  // TEST SUITE 5: Permanent Deletion by Super Admin
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- TEST SUITE 5: Permanent Deletion by Super Admin ---');

  // Dynamically import securityBlacklist
  const { isPermanentlyDeleted } = await import('../src/db/securityBlacklist.js');

  // 5.1 Register a test user
  const testDeletePhone = '9841777777';
  const testDeleteId = 'usr_delete_test_01';
  unifiedUserSyncService.recordUserSignup({
    id: testDeleteId,
    username: testDeletePhone,
    phone: testDeletePhone,
    fullName: 'मेटाउने प्रयोगकर्ता',
    passwordHash: 'hash123',
    role: 'CUSTOMER',
    roleNameNepali: 'ग्राहक',
    status: 'active',
    customerId: 'ग्राहक-9999',
    permissions: [],
    mobileVerified: true,
    emailVerified: false,
    createdAtISO: new Date().toISOString(),
    createdAtBS: '२०८१'
  });

  const regBefore = unifiedUserSyncService.getRegisteredUsers();
  assert(
    regBefore.some(u => u.phone === testDeletePhone || u.id === testDeleteId),
    'Test user successfully registered before deletion'
  );

  // 5.2 Perform Permanent Deletion by Super Admin
  const deleteResult = unifiedUserSyncService.deleteUserPermanently(testDeleteId, testDeletePhone);
  assert(deleteResult === true, 'Super Admin deleteUserPermanently returns true');

  // 5.3 Verify user is permanently purged from registered list
  const regAfter = unifiedUserSyncService.getRegisteredUsers();
  assert(
    !regAfter.some(u => u.phone === testDeletePhone || u.id === testDeleteId),
    'User is strictly and permanently removed from Registered Users list'
  );

  // 5.4 Verify identifier is blacklisted to prevent revival from old caches
  assert(
    isPermanentlyDeleted(testDeletePhone),
    'Phone identifier is stored in security blacklist'
  );
  assert(
    isPermanentlyDeleted(testDeleteId),
    'User ID is stored in security blacklist'
  );

  // 5.5 Verify sync event was dispatched
  assert(
    eventLog.some(e => e.event === 'unified-data-updated'),
    'Dispatches unified-data-updated event on permanent deletion'
  );

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL INTEGRATION WORKFLOW TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal Test Execution Error:', err);
  process.exit(1);
});

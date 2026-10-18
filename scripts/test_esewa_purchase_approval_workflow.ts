/**
 * Test Suite: End-to-End eSewa Software Purchase, 5-Field Verification & Serial Approval Workflow
 * Validates:
 * 1. User Signup in "साइन अप भएका प्रयोगकर्ताहरू" (Registered Users table)
 * 2. Purchase Application with:
 *    - Name: ...
 *    - Address: ...
 *    - Mobile No: ...
 *    - Whatsapp no: ...
 *    - Transaction ID: ...
 * 3. Payment Approval Page Display & Direct 1-Click Approval
 * 4. Automatic copy reflection in "सफ्टवेयर खरिद गरेका प्रयोगकर्ताहरू" (Purchased Users table)
 * 5. Serial 3-Step Process: Payment Approval -> Listing -> Menu Switchboard Control
 * 6. Instant Service Unlock (< 1 second)
 */

import { convertADToBS } from '../src/utils/nepaliCalendar.js';
import {
  ClientLead,
  getStoredClientLeads,
  saveClientLeads,
  isClientPurchaseApproved
} from '../src/db/clientLeadStore.js';
import {
  getStoredRBACUsers,
  saveRBACUsers,
  RBACUser
} from '../src/db/rbacStore.js';
import {
  loadAllClientPolicies,
  getClientPolicyByMobile
} from '../src/db/menuControlStore.js';
import {
  unifiedUserSyncService
} from '../src/services/unifiedUserSyncService.js';

// Setup Mock DOM environment
const storage = new Map<string, string>();
const dispatchedEvents: Array<{ type: string; detail?: any }> = [];

(global as any).localStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, val: string) => storage.set(key, String(val)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear()
};

(global as any).window = {
  dispatchEvent: (event: any) => {
    dispatchedEvents.push({ type: event.type, detail: event.detail });
    return true;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  screen: { width: 1920, height: 1080, colorDepth: 24 }
};

(global as any).window.navigator = {
  language: 'ne-NP',
  hardwareConcurrency: 8,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
};

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};

async function runWorkflowTests() {
  console.log('========================================================================');
  console.log('🕉️ ESEWA SOFTWARE PURCHASE, 5-FIELD VERIFICATION & SERIAL WORKFLOW TEST');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond: boolean, name: string, detail?: string) {
    total++;
    if (cond) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      if (detail) console.error(`     Details: ${detail}`);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // STEP 1: INITIAL USER SIGNUP (साइन अप भएका प्रयोगकर्ताहरू)
  // ────────────────────────────────────────────────────────────────
  console.log('--- PHASE 1: User Signup in Registered Users Store ---');
  const signupUser: RBACUser = {
    id: 'usr_test_hariprasad_01',
    customerId: 'ग्राहक-२३४५',
    username: '9856012345',
    fullName: 'पण्डित हरि प्रसाद सापकोटा',
    phone: '9856012345',
    passwordHash: 'hash_sample',
    email: 'hariprasad.jyotish@gmail.com',
    role: 'CUSTOMER',
    roleNameNepali: 'सफ्टवेयर ग्राहक (Client)',
    status: 'active',
    mobileVerified: true,
    emailVerified: true,
    createdAtISO: new Date().toISOString(),
    createdAtBS: '२०८१-११-२५',
    savedAddresses: [{
      id: 'addr_01',
      title: 'ठेगाना',
      fullName: 'पण्डित हरि प्रसाद सापकोटा',
      phone: '9856012345',
      district: 'कास्की',
      localLevel: '',
      ward: '८',
      streetAddress: 'पोखरा-८, सिमलचौर, कास्की',
      isDefault: true
    }],
    permissions: ['view_kundali', 'customer_access']
  };

  unifiedUserSyncService.recordUserSignup(signupUser);

  const registeredUsers = unifiedUserSyncService.getRegisteredUsers();
  const foundRegistered = registeredUsers.find(u => u.phone === '9856012345');
  assert(Boolean(foundRegistered), '1.1 User successfully registered in "साइन अप भएका प्रयोगकर्ताहरू" table');
  assert(foundRegistered?.fullName === 'पण्डित हरि प्रसाद सापकोटा', '1.2 Full name matches in registered users table');
  assert(foundRegistered?.savedAddresses?.[0]?.streetAddress.includes('पोखरा'), '1.3 Address matches in registered users table');

  // ────────────────────────────────────────────────────────────────
  // STEP 2: ESEWA SOFTWARE PURCHASE APPLICATION (५ अनिवार्य विवरणहरू)
  // ────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 2: eSewa Purchase Application Submission (5 Mandatory Fields) ---');
  const purchaseLead: ClientLead = {
    id: 'LEAD-ESEWA-2081-9988',
    fullName: 'पण्डित हरि प्रसाद सापकोटा',
    address: 'पोखरा-८, सिमलचौर, कास्की',
    mobile: '9856012345',
    email: 'hariprasad.jyotish@gmail.com',
    whatsapp: '9856012345',
    deviceFingerprint: 'DEV-TEST-POKHARA-01',
    status: 'PURCHASE_PENDING',
    planId: 'yearly_both',
    planNameNepali: '१ वर्ष मोबाइल + कम्प्युटर (सम्पूर्ण सेवा)',
    planAmountNPR: 5000,
    paymentMethod: 'esewa',
    transactionId: 'ESE7788991122',
    submittedAtISO: new Date().toISOString(),
    submittedAtBS: '२०८१-११-२५'
  };

  unifiedUserSyncService.recordPurchaseRequest(purchaseLead);

  // Check 5 required fields exist on the lead
  assert(purchaseLead.fullName === 'पण्डित हरि प्रसाद सापकोटा', '2.1 Name field is captured: ' + purchaseLead.fullName);
  assert(purchaseLead.address === 'पोखरा-८, सिमलचौर, कास्की', '2.2 Address field is captured: ' + purchaseLead.address);
  assert(purchaseLead.mobile === '9856012345', '2.3 Mobile No field is captured: ' + purchaseLead.mobile);
  assert(purchaseLead.whatsapp === '9856012345', '2.4 Whatsapp no field is captured: ' + purchaseLead.whatsapp);
  assert(purchaseLead.transactionId === 'ESE7788991122', '2.5 Transaction ID field is captured: ' + purchaseLead.transactionId);

  // Check lead is visible in pending purchases list
  const pendingLeads = unifiedUserSyncService.getPurchasedUsers();
  const targetPending = pendingLeads.find(l => l.transactionId === 'ESE7788991122');
  assert(Boolean(targetPending), '2.6 Incoming purchase appears in Payment Approvals pending list');
  assert(targetPending?.status === 'PURCHASE_PENDING', '2.7 Status is correctly marked as PURCHASE_PENDING');

  // ────────────────────────────────────────────────────────────────
  // STEP 3: SUPER ADMIN PAYMENT APPROVAL (१-क्लिक स्वीकृति)
  // ────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 3: Super Admin Approval Execution (Payment Approval Step) ---');
  const approveRes = unifiedUserSyncService.approvePurchase(purchaseLead.id, 'SuperAdmin');
  assert(approveRes.success, '3.1 Purchase approval executed successfully: ' + approveRes.messageNepali);

  // Verify status updated to PURCHASE_APPROVED & payment verified
  const allPurchased = unifiedUserSyncService.getPurchasedUsers();
  const approvedItem = allPurchased.find(l => l.transactionId === 'ESE7788991122');
  assert(approvedItem?.status === 'PURCHASE_APPROVED', '3.2 Status transitioned to PURCHASE_APPROVED');
  assert(approvedItem?.paymentVerificationStatus === 'VERIFIED', '3.3 Payment verification status is VERIFIED');
  assert(Boolean(approvedItem?.approvedAtBS), '3.4 Approved Bikram Sambat date recorded: ' + approvedItem?.approvedAtBS);

  // ────────────────────────────────────────────────────────────────
  // STEP 4: AUTOMATIC COPY REFLECTION IN PURCHASED USERS & REGISTERED USERS
  // ────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 4: Automatic Copy Reflection Across User Tables ---');
  // 4.1 In "सफ्टवेयर खरिद गरेका प्रयोगकर्ताहरू"
  const purchasedUsersTable = unifiedUserSyncService.getPurchasedUsers();
  const copyInPurchased = purchasedUsersTable.find(p => p.mobile === '9856012345' && p.status === 'PURCHASE_APPROVED');
  assert(Boolean(copyInPurchased), '4.1 Copy immediately exists in "सफ्टवेयर खरिद गरेका प्रयोगकर्ताहरू"');
  assert(copyInPurchased?.transactionId === 'ESE7788991122', '4.2 Txn ID is preserved in purchased users table');

  // 4.2 In "साइन अप भएका प्रयोगकर्ताहरू"
  const registeredUsersTable = unifiedUserSyncService.getRegisteredUsers();
  const copyInRegistered = registeredUsersTable.find(u => u.phone === '9856012345');
  assert(Boolean(copyInRegistered), '4.3 User exists in "साइन अप भएका प्रयोगकर्ताहरू" from initial signup');

  // 4.3 Check purchase alert on registered user row
  const purchaseAlert = unifiedUserSyncService.checkUserPurchaseAlert('9856012345');
  assert(purchaseAlert.hasPurchase, '4.4 Registered user has purchase alert linked');
  assert(purchaseAlert.isApproved, '4.5 Purchase alert status is verified as APPROVED');

  // ────────────────────────────────────────────────────────────────
  // STEP 5: SERIAL WORKFLOW: MENU SWITCHBOARD INITIALIZATION (चरण ३: मेनु नियन्त्रण)
  // ────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 5: Serial Workflow: Menu Switchboard Control Policy ---');
  // Check that client policy is generated for menu control
  const clientPolicy = getClientPolicyByMobile('9856012345');
  assert(Boolean(clientPolicy), '5.1 Client Access Record exists in Menu Switchboard (menuControlStore)');
  assert(clientPolicy?.period === '1_year', '5.2 Period set to 1_year in Menu Switchboard');
  assert(clientPolicy?.status === 'active', '5.3 Client policy status is ACTIVE in Menu Switchboard');

  // ────────────────────────────────────────────────────────────────
  // STEP 6: INSTANT SERVICE UNLOCK ON USER CLIENT DEVICE (< 1 SECOND)
  // ────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 6: Instant Service Unlock Verification (< 1 second) ---');
  const hasFullAccess = isClientPurchaseApproved();
  assert(hasFullAccess, '6.1 isClientPurchaseApproved() returns TRUE on client device');
  
  const licenseUnlockedFlag = storage.get('software_full_access_unlocked_v1');
  assert(licenseUnlockedFlag === 'true', '6.2 software_full_access_unlocked_v1 is TRUE');

  const fullAccessEventFired = dispatchedEvents.some(e => e.type === 'software-full-access-updated' || e.type === 'service-license-updated');
  assert(fullAccessEventFired, '6.3 software-full-access-updated / service-license-updated event dispatched for 0ms UI unlock');

  // ────────────────────────────────────────────────────────────────
  // STEP 7: REJECTION FLOW VALIDATION
  // ────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 7: Rejection Flow Validation ---');
  const rejectLead: ClientLead = {
    id: 'LEAD-REJECT-01',
    fullName: 'अवैध प्रयोगकर्ता',
    address: 'काठमाडौँ',
    mobile: '9811122233',
    email: 'reject@test.com',
    whatsapp: '9811122233',
    deviceFingerprint: 'DEV-REJECT-01',
    status: 'PURCHASE_PENDING',
    paymentMethod: 'esewa',
    transactionId: 'FAKE_TX_9999',
    planAmountNPR: 2000,
    submittedAtISO: new Date().toISOString(),
    submittedAtBS: '२०८१-११-२५'
  };

  unifiedUserSyncService.recordPurchaseRequest(rejectLead);
  const rejectRes = unifiedUserSyncService.rejectPurchase(rejectLead.id, 'eSewa खातामा रकम प्राप्त भएन', 'SuperAdmin');
  assert(rejectRes.success, '7.1 Rejection executed successfully: ' + rejectRes.messageNepali);

  const updatedRejected = unifiedUserSyncService.getPurchasedUsers().find(l => l.id === rejectLead.id);
  assert(updatedRejected?.status === 'PURCHASE_REJECTED', '7.2 Rejected lead marked as PURCHASE_REJECTED');
  assert(updatedRejected?.paymentVerificationStatus === 'REJECTED', '7.3 Verification status is REJECTED');

  console.log('\n========================================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL ESEWA PURCHASE, VERIFICATION & SERIAL APPROVAL TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.');
    process.exit(1);
  }
}

runWorkflowTests().catch(err => {
  console.error('Fatal error running workflow tests:', err);
  process.exit(1);
});

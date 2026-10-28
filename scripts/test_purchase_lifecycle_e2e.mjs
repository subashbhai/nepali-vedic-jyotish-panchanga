/**
 * End-to-End Purchase & Membership Lifecycle Verification Script
 * Balananda Vaidik Sewa
 *
 * Verifies:
 * 1. Visitor Analytics Beacon & PostgreSQL Persistence
 * 2. Pre-Purchase State & Entitlements
 * 3. Purchase Application Submission & DB Persistence
 * 4. Pending State Access Gate Verification
 * 5. Super Admin Approval Security & Access Control
 * 6. Super Admin Authorized Approval
 * 7. Duplicate Approval Protection
 * 8. 4-Table PostgreSQL Persistence (leads, memberships, licenses, payments)
 * 9. Post-Approval Entitlement & Feature Access Verification
 * 10. Regression: User Login (Mobile & Username) & Profile Verification
 */

const API_BASE = 'https://balananda-api.onrender.com';
const FE_BASE = 'https://balananda-vaidik-sewa.web.app';

const TEST_USER = {
  username: 'audit_test_user',
  phone: '9801234567',
  password: 'BalanandaLiveTest#2081',
  fullName: 'अडिट परीक्षण प्रयोगकर्ता'
};

const SUPER_ADMIN = {
  password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('================================================================');
  console.log('BALANANDA VAIDIK SEWA - PURCHASE & MEMBERSHIP LIFECYCLE E2E TEST');
  console.log('================================================================');
  console.log('Target API:', API_BASE);
  console.log('Target Frontend:', FE_BASE);
  console.log('Timestamp:', new Date().toISOString());

  const results = [];
  function record(phase, name, passed, details) {
    results.push({ phase, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${mark}] ${phase}: ${name}`);
    if (details) console.log(`   Details:`, JSON.stringify(details));
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: Visitor Analytics Beacon Test
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 1: Visitor Analytics Beacon & PostgreSQL Test ---');
  try {
    // 1. Send anonymous visit beacon
    const visitRes = await fetch(`${API_BASE}/api/analytics/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        path: '/user_dashboard',
        referrer: 'https://balananda-vaidik-sewa.web.app/',
        deviceType: 'desktop',
        district: 'काठमाडौँ'
      })
    });
    const visitData = await visitRes.json();
    record('PHASE 1', 'Visitor Analytics Beacon Submission', visitData.success === true, visitData);

    // Give DB pool a moment to complete asynchronous commit
    await sleep(1500);

    // Check table counts
    const healthRes = await fetch(`${API_BASE}/api/health?_t=${Date.now()}`);
    const healthData = await healthRes.json();
    const vaCount = healthData?.database?.tableCounts?.visitorAnalytics || 0;
    record('PHASE 1', 'Visitor Analytics PostgreSQL Persistence', vaCount > 0, {
      visitorAnalyticsCount: vaCount
    });
  } catch (err) {
    record('PHASE 1', 'Visitor Analytics Beacon Test', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: User Authentication & Pre-Purchase Entitlement Check
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 2: User Authentication & Initial Entitlements ---');
  let userToken = '';
  let userId = '';
  try {
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: TEST_USER.phone,
        password: TEST_USER.password
      })
    });
    const loginData = await loginRes.json();
    if (loginData.success && (loginData.token || loginData.session?.token)) {
      userToken = loginData.token || loginData.session?.token;
      userId = loginData.user?.id || loginData.session?.userId;
      record('PHASE 2', 'User Login with Mobile (9801234567)', true, {
        userId,
        username: loginData.user?.username || loginData.session?.username,
        userCategory: loginData.user?.userCategory || loginData.session?.userCategory
      });
    } else {
      record('PHASE 2', 'User Login with Mobile (9801234567)', false, loginData);
    }

    // Verify initial entitlements before purchase
    const entRes = await fetch(`${API_BASE}/api/entitlements`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const entData = await entRes.json();
    const ent = entData.entitlement;
    const isLockedInitially = ent &&
      ent.hasActiveMembership === false &&
      ent.isJyotishAllowed === false &&
      ent.isVastuAllowed === false &&
      ent.remainingDays === 0;

    record('PHASE 2', 'Pre-Purchase Access Gate Verification (Locked)', isLockedInitially, {
      lifecycleState: ent?.lifecycleState,
      hasActiveMembership: ent?.hasActiveMembership,
      isJyotishAllowed: ent?.isJyotishAllowed,
      isVastuAllowed: ent?.isVastuAllowed,
      remainingDays: ent?.remainingDays
    });
  } catch (err) {
    record('PHASE 2', 'User Auth & Initial Entitlements', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 3: Purchase Application Submission
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 3: Purchase Application Submission ---');
  const purchasePayload = {
    userId: userId,
    fullName: TEST_USER.fullName,
    address: 'काठमाडौँ',
    mobile: TEST_USER.phone,
    email: 'audit_test_user@balananda.org.np',
    whatsapp: TEST_USER.phone,
    planId: 'yearly_both',
    planNameNepali: '१ वर्ष मोबाइल + कम्प्युटर',
    planAmountNPR: 1200,
    paymentMethod: 'esewa',
    transactionId: 'TEST_TX_PURCHASE_AUDIT_2081',
    status: 'PURCHASE_PENDING',
    dobBS: '2046-05-15',
    dobAD: '1989-08-30',
    birthTime: '06:30',
    birthLocation: 'काठमाडौँ',
    gender: 'पुरुष',
    gotra: 'कश्यप',
    jaatBarna: 'ब्राह्मण (पर्वते)'
  };

  let submittedLeadId = '';
  try {
    const submitRes = await fetch(`${API_BASE}/api/client-leads/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(purchasePayload)
    });
    const submitData = await submitRes.json();
    submittedLeadId = submitData.lead?.id;
    const isSubmitted = submitData.success === true && !!submittedLeadId;
    record('PHASE 3', 'Purchase Application Submission (yearly_both, Rs. 1200)', isSubmitted, {
      leadId: submittedLeadId,
      status: submitData.lead?.status,
      userId: submitData.lead?.userId
    });

    await sleep(1500);

    // Verify lead stored in PostgreSQL
    const healthRes = await fetch(`${API_BASE}/api/health?_t=${Date.now()}`);
    const healthData = await healthRes.json();
    const leadsCount = healthData?.database?.tableCounts?.leads || 0;
    record('PHASE 3', 'PostgreSQL client_purchase_leads Persistence', leadsCount === 1, {
      leadsCount
    });
  } catch (err) {
    record('PHASE 3', 'Purchase Application Submission', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 4: Pending Status & Feature Lock Verification
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 4: Pending Status Access Lock Verification ---');
  try {
    const entRes = await fetch(`${API_BASE}/api/entitlements`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const entData = await entRes.json();
    const ent = entData.entitlement;
    const isPendingLockEnforced = ent &&
      ent.lifecycleState === 'PURCHASE_PENDING' &&
      ent.isPendingPayment === true &&
      ent.hasActiveMembership === false &&
      ent.isJyotishAllowed === false &&
      ent.isVastuAllowed === false &&
      ent.remainingDays === 0;

    record('PHASE 4', 'Pending Status Access Lock Enforcement', isPendingLockEnforced, {
      lifecycleState: ent?.lifecycleState,
      isPendingPayment: ent?.isPendingPayment,
      hasActiveMembership: ent?.hasActiveMembership,
      isJyotishAllowed: ent?.isJyotishAllowed,
      isVastuAllowed: ent?.isVastuAllowed,
      remainingDays: ent?.remainingDays,
      planNameNepali: ent?.planNameNepali
    });
  } catch (err) {
    record('PHASE 4', 'Pending Status Verification', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 5: Approval Security & Authentication Enforcement
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 5: Approval Security & Authentication Enforcement ---');
  try {
    // Attempt 1: Unauthorized approval without token
    const unauthRes = await fetch(`${API_BASE}/api/client-leads/${submittedLeadId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifiedAmount: 1200 })
    });
    record('PHASE 5', 'Unauthenticated Approval Rejection (401)', unauthRes.status === 401, {
      httpStatus: unauthRes.status
    });

    // Attempt 2: Unauthorized approval with regular user token
    const userAuthRes = await fetch(`${API_BASE}/api/client-leads/${submittedLeadId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ verifiedAmount: 1200 })
    });
    record('PHASE 5', 'Ordinary User Approval Rejection (401/403)', userAuthRes.status === 401 || userAuthRes.status === 403, {
      httpStatus: userAuthRes.status
    });

    // Attempt 3: Unauthorized approve-by-tx
    const txUnauthRes = await fetch(`${API_BASE}/api/client-leads/approve-by-tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: 'TEST_TX_PURCHASE_AUDIT_2081', verifiedAmount: 1200 })
    });
    record('PHASE 5', 'Unauthenticated approve-by-tx Rejection (401)', txUnauthRes.status === 401, {
      httpStatus: txUnauthRes.status
    });
  } catch (err) {
    record('PHASE 5', 'Approval Security Tests', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 6: Super Admin Authentication & Authorized Approval
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 6: Super Admin Authentication & Authorized Approval ---');
  let adminToken = '';
  try {
    const adminLoginRes = await fetch(`${API_BASE}/api/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: SUPER_ADMIN.password
      })
    });
    const adminLoginData = await adminLoginRes.json();
    if (adminLoginData.success && adminLoginData.token) {
      adminToken = adminLoginData.token;
      record('PHASE 6', 'Super Admin Login', true, {
        role: adminLoginData.session?.role || 'SUPER_ADMIN'
      });
    } else {
      record('PHASE 6', 'Super Admin Login', false, adminLoginData);
    }

    // Verify Super Admin can view the pending lead
    const leadsRes = await fetch(`${API_BASE}/api/client-leads`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const leadsData = await leadsRes.json();
    const foundPendingLead = leadsData.leads?.find(l => l.id === submittedLeadId);
    record('PHASE 6', 'Super Admin Lead Visibility', !!foundPendingLead, {
      leadId: foundPendingLead?.id,
      fullName: foundPendingLead?.fullName,
      plan: foundPendingLead?.planNameNepali,
      status: foundPendingLead?.status
    });

    // Execute Authorized Approval
    const approveRes = await fetch(`${API_BASE}/api/client-leads/${submittedLeadId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        approvedBy: 'SuperAdmin',
        approvedAtBS: '२०८१-११-१५',
        serviceKey: 'both',
        verifiedAmount: 1200,
        adminNotes: '२०८१ अडिट खरिद आवेदन आधिकारिक रूपमा स्वीकृत'
      })
    });
    const approveData = await approveRes.json();
    const isApproved = approveRes.ok && approveData.success === true && approveData.lead?.status === 'PURCHASE_APPROVED';
    record('PHASE 6', 'Super Admin Authorized Lead Approval', isApproved, {
      status: approveData.lead?.status,
      paymentVerificationStatus: approveData.lead?.paymentVerificationStatus,
      approvedBy: approveData.lead?.approvedBy,
      expiresAtBS: approveData.lead?.expiresAtBS
    });
  } catch (err) {
    record('PHASE 6', 'Super Admin Approval Workflow', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 7: Duplicate Approval Protection
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 7: Duplicate Approval Protection ---');
  try {
    const dupRes = await fetch(`${API_BASE}/api/client-leads/${submittedLeadId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ verifiedAmount: 1200 })
    });
    const dupData = await dupRes.json();
    record('PHASE 7', 'Duplicate Approval Rejection (400)', dupRes.status === 400 && dupData.success === false, {
      httpStatus: dupRes.status,
      error: dupData.error
    });
  } catch (err) {
    record('PHASE 7', 'Duplicate Approval Protection', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 8: 4-Table PostgreSQL Persistence Verification
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 8: 4-Table PostgreSQL Persistence Verification ---');
  try {
    await sleep(2000); // Allow all async pool operations to settle

    const tableCountsRes = await fetch(`${API_BASE}/api/superadmin/maintenance/table-counts?_t=${Date.now()}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const tcData = await tableCountsRes.json();
    const counts = tcData.tableCounts || tcData.counts || {};

    console.log('   Live PostgreSQL Table Counts:', counts);

    record('PHASE 8', 'client_purchase_leads Table Count >= 1', counts.leads >= 1, { leads: counts.leads });
    record('PHASE 8', 'memberships Table Count >= 1', counts.memberships >= 1, { memberships: counts.memberships });
    record('PHASE 8', 'service_licenses Table Count >= 2', counts.licenses >= 2, { licenses: counts.licenses });
    record('PHASE 8', 'payments Table Count >= 1', counts.payments >= 1, { payments: counts.payments });
    record('PHASE 8', 'audit_logs Table Count >= 3', counts.auditLogs >= 3, { auditLogs: counts.auditLogs });
    record('PHASE 8', 'users Table Count == 1 (No Duplicate Accounts)', counts.users === 1, { users: counts.users });
  } catch (err) {
    record('PHASE 8', 'PostgreSQL Persistence Check', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 9: Post-Approval Entitlement & Feature Access Verification
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 9: Post-Approval Entitlement & Feature Access Verification ---');
  try {
    const entRes = await fetch(`${API_BASE}/api/entitlements`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const entData = await entRes.json();
    const ent = entData.entitlement;

    const hasProfessionalEntitlement = ent &&
      ent.lifecycleState === 'PROFESSIONAL_MEMBER' &&
      ent.hasActiveMembership === true &&
      ent.isJyotishAllowed === true &&
      ent.isVastuAllowed === true &&
      ent.isProfessionalToolsAllowed === true &&
      ent.remainingDays > 300 &&
      !!ent.expiresAtBS;

    record('PHASE 9', 'Professional Membership Entitlement Activation', hasProfessionalEntitlement, {
      lifecycleState: ent?.lifecycleState,
      hasActiveMembership: ent?.hasActiveMembership,
      isJyotishAllowed: ent?.isJyotishAllowed,
      isVastuAllowed: ent?.isVastuAllowed,
      isProfessionalToolsAllowed: ent?.isProfessionalToolsAllowed,
      remainingDays: ent?.remainingDays,
      expiresAtBS: ent?.expiresAtBS,
      planNameNepali: ent?.planNameNepali
    });

    // Verify service access endpoints
    const jyoRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=jyotish`);
    const jyoData = await jyoRes.json();
    record('PHASE 9', 'Jyotish Service Access Verification', jyoData.allowed === true && jyoData.status === 'unlocked', jyoData);

    const vasRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=vastu`);
    const vasData = await vasRes.json();
    record('PHASE 9', 'Vastu Service Access Verification', vasData.allowed === true && vasData.status === 'unlocked', vasData);
  } catch (err) {
    record('PHASE 9', 'Post-Approval Access Verification', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 10: Regression Verification (Login with Mobile & Username)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 10: Regression Verification ---');
  try {
    // Test 1: Login with Username
    const userLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: TEST_USER.username,
        password: TEST_USER.password
      })
    });
    const userLoginData = await userLoginRes.json();
    record('PHASE 10', 'Login via Username (audit_test_user)', userLoginData.success === true, {
      userId: userLoginData.session?.userId,
      username: userLoginData.session?.username
    });

    // Test 2: Login with Mobile
    const phoneLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: TEST_USER.phone,
        password: TEST_USER.password
      })
    });
    const phoneLoginData = await phoneLoginRes.json();
    record('PHASE 10', 'Login via Mobile Number (9801234567)', phoneLoginData.success === true, {
      userId: phoneLoginData.session?.userId,
      phone: phoneLoginData.session?.phone
    });

    // Test 3: Super Admin User List reflects updated subscription
    const adminUsersRes = await fetch(`${API_BASE}/api/superadmin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminUsersData = await adminUsersRes.json();
    const updatedUser = adminUsersData.users?.find(u => u.username === TEST_USER.username || u.phone === TEST_USER.phone);
    const hasActiveSubscription = !!updatedUser && (
      (!!updatedUser.purchasedPlan && updatedUser.purchasedPlan !== 'साधारण खाता (योजना छैन)') ||
      !!updatedUser.subscriptionPlan ||
      updatedUser.membershipStatus === 'ACTIVE'
    );
    record('PHASE 10', 'Super Admin User Profile Subscription Reflection', hasActiveSubscription, {
      userId: updatedUser?.id,
      username: updatedUser?.username,
      purchasedPlan: updatedUser?.purchasedPlan,
      subscriptionPlan: updatedUser?.subscriptionPlan,
      membershipStatus: updatedUser?.membershipStatus,
      paymentStatus: updatedUser?.paymentStatus,
      paymentAmountNPR: updatedUser?.paymentAmountNPR
    });
  } catch (err) {
    record('PHASE 10', 'Regression Tests', false, { error: err.message });
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('FINAL E2E VERIFICATION SUMMARY');
  console.log('================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`Total Checks: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);

  if (failedCount > 0) {
    console.log('\nFAILED CHECKS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`- [FAIL] ${r.phase}: ${r.name}`);
      console.log(`  Details:`, JSON.stringify(r.details));
    });
  } else {
    console.log('\n🎉 ALL END-TO-END PURCHASE & MEMBERSHIP VERIFICATION CHECKS PASSED PERFECTLY!');
  }

  return { passedCount, failedCount, total: results.length, results };
}

runVerification().catch(console.error);

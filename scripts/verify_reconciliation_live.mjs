import assert from 'node:assert';

const API_BASE = 'https://balananda-api.onrender.com';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: process.env.SUPERADMIN_PASSWORD
};
const TEST_USER = {
  phone: '9801234567',
  password: 'BalanandaLiveTest#2081'
};

async function runLiveReconciliationAndVerification() {
  console.log('================================================================');
  console.log('LIVE PRODUCTION RECONCILIATION AND UNIFIED SOURCE VERIFICATION');
  console.log('Target:', API_BASE);
  console.log('================================================================\n');

  // 1. Authenticate Super Admin
  console.log('1. Authenticating Super Admin...');
  const adminLoginRes = await fetch(`${API_BASE}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN_CREDENTIALS)
  });
  const adminLoginData = await adminLoginRes.json();
  assert.strictEqual(adminLoginRes.ok, true, 'SuperAdmin login HTTP must be 200');
  assert.strictEqual(adminLoginData.success, true, 'SuperAdmin login success must be true');
  const adminToken = adminLoginData.sessionToken || adminLoginData.token;
  console.log('✔ Super Admin Authenticated. Token acquired.');

  // 2. Authenticate Test User
  console.log('\n2. Authenticating Test User (9801234567)...');
  const userLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: TEST_USER.phone,
      password: TEST_USER.password
    })
  });
  const userLoginData = await userLoginRes.json();
  assert.strictEqual(userLoginRes.ok, true, 'User login HTTP must be 200');
  const userToken = userLoginData.sessionToken || userLoginData.token;
  const userId = userLoginData.session?.userId || 'usr_1793155790675_a1zz3';
  console.log('✔ User Authenticated. User ID:', userId);

  // 3. Execute Audited Reconciliation Endpoint
  console.log('\n3. Executing POST /api/superadmin/maintenance/reconcile-test-data...');
  const reconcileRes = await fetch(`${API_BASE}/api/superadmin/maintenance/reconcile-test-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      reason: 'Authoritative reconciliation of synthetic E2E test-payment and test-membership fixtures'
    })
  });
  const reconcileData = await reconcileRes.json();
  console.log('Reconciliation Response:', JSON.stringify(reconcileData, null, 2));
  assert.strictEqual(reconcileRes.ok, true, 'Reconcile HTTP status must be 200');
  assert.strictEqual(reconcileData.success, true, 'Reconcile success must be true');
  assert.ok(reconcileData.backupFile, 'Backup file snapshot must be created');
  console.log('✔ Reconciliation Succeeded. Snapshot:', reconcileData.backupFile);
  console.log('Reconciled Stats:', reconcileData.reconciled);

  // 4. Verify Authoritative Memberships Endpoint
  console.log('\n4. Verifying GET /api/superadmin/memberships (Authoritative PostgreSQL)...');
  const memRes = await fetch(`${API_BASE}/api/superadmin/memberships?filter=all`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const memData = await memRes.json();
  assert.strictEqual(memRes.ok, true, 'GET /api/superadmin/memberships must succeed');
  assert.strictEqual(memData.success, true, 'Memberships response must be successful');
  console.log(`Total Memberships in DB: ${memData.count}`);
  const testMems = memData.memberships.filter(m => m.userId === userId || m.phone === TEST_USER.phone);
  console.log(`Test User Memberships Found: ${testMems.length}`);
  testMems.forEach(m => {
    console.log(`  - ID: ${m.id} | Status: ${m.membershipStatus} | Payment: ${m.paymentStatus}`);
    assert.strictEqual(m.membershipStatus, 'TEST_REVOKED', 'Membership status must be TEST_REVOKED');
    assert.strictEqual(m.paymentStatus, 'test_voided', 'Payment status must be test_voided');
  });
  console.log('✔ Authoritative Memberships verified: all test memberships revoked.');

  // 5. Verify Authoritative Payments Endpoint
  console.log('\n5. Verifying GET /api/superadmin/payments (Authoritative PostgreSQL)...');
  const payRes = await fetch(`${API_BASE}/api/superadmin/payments?filter=all`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const payData = await payRes.json();
  assert.strictEqual(payRes.ok, true, 'GET /api/superadmin/payments must succeed');
  assert.strictEqual(payData.success, true, 'Payments response must be successful');
  console.log(`Total Payments in DB: ${payData.count}`);
  const testPayments = payData.payments.filter(p => p.transactionReference === 'TEST_TX_PURCHASE_AUDIT_2081' || p.userId === userId);
  console.log(`Test Payments Found: ${testPayments.length}`);
  testPayments.forEach(p => {
    console.log(`  - ID: ${p.id} | Ref: ${p.transactionReference} | Status: ${p.paymentStatus} | Notes: ${p.notes}`);
    assert.strictEqual(p.paymentStatus, 'test_voided', 'Payment status must be test_voided');
  });
  console.log('✔ Authoritative Payments verified: all test payments marked test_voided.');

  // 6. Verify Authoritative Audit Logs Endpoint
  console.log('\n6. Verifying GET /api/admin/audit-logs (Authoritative PostgreSQL)...');
  const auditRes = await fetch(`${API_BASE}/api/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const auditData = await auditRes.json();
  assert.strictEqual(auditRes.ok, true, 'GET /api/admin/audit-logs must succeed');
  assert.strictEqual(auditData.success, true, 'Audit logs response must be successful');
  console.log(`Total Audit Logs in DB: ${auditData.count}`);
  const reconcileLog = auditData.logs.find(l => l.action === 'SYNTHETIC_TEST_PURCHASE_RECONCILED');
  assert.ok(reconcileLog, 'Reconciliation audit log must be recorded');
  console.log(`  - Latest Reconcile Audit Log ID: ${reconcileLog.id} | Performed By: ${reconcileLog.performedBy} | Details: ${reconcileLog.details}`);
  console.log('✔ Authoritative Audit Logs verified: reconciliation audit entry present.');

  // 7. Verify Licenses Locked for Test User
  console.log('\n7. Verifying Service Licenses Relocked...');
  const jyotishLicRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=jyotish`);
  const jyotishLicData = await jyotishLicRes.json();
  assert.strictEqual(jyotishLicData.allowed, false, 'Jyotish license allowed must be false');
  assert.strictEqual(jyotishLicData.status, 'locked', 'Jyotish license status must be locked');
  console.log('  - Jyotish License: allowed = false, status = locked');

  const vastuLicRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=vastu`);
  const vastuLicData = await vastuLicRes.json();
  assert.strictEqual(vastuLicData.allowed, false, 'Vastu license allowed must be false');
  assert.strictEqual(vastuLicData.status, 'locked', 'Vastu license status must be locked');
  console.log('  - Vastu License: allowed = false, status = locked');
  console.log('✔ Service Licenses verified: locked.');

  // 8. Verify User Entitlements Reset
  console.log('\n8. Verifying User Entitlements Reset (/api/entitlements)...');
  const entRes = await fetch(`${API_BASE}/api/entitlements`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const entData = await entRes.json();
  assert.strictEqual(entRes.ok, true, 'Entitlements HTTP must be 200');
  const ent = entData.entitlement;
  console.log('Entitlement Summary:', {
    planTier: ent?.planTier,
    isJyotishAllowed: ent?.isJyotishAllowed,
    isVastuAllowed: ent?.isVastuAllowed,
    hasActiveMembership: ent?.hasActiveMembership
  });
  assert.strictEqual(ent.isJyotishAllowed, false, 'isJyotishAllowed must be false');
  assert.strictEqual(ent.isVastuAllowed, false, 'isVastuAllowed must be false');
  assert.strictEqual(ent.hasActiveMembership, false, 'hasActiveMembership must be false');
  console.log('✔ User Entitlements verified: zero active paid access.');

  // 9. Verify Live Health & Table Counts
  console.log('\n9. Verifying Live Health and Authoritative PostgreSQL State (/api/health)...');
  const healthRes = await fetch(`${API_BASE}/api/health`);
  const healthData = await healthRes.json();
  console.log('Health Output:', JSON.stringify(healthData, null, 2));
  assert.strictEqual(healthData.status, 'ok', 'Health status must be ok');
  assert.strictEqual(healthData.database.type, 'postgres', 'Authoritative database must be postgres');
  console.log('✔ Production Health verified.');

  console.log('\n================================================================');
  console.log('🎉 ALL PRODUCTION RECONCILIATION & CONSISTENCY CHECKS PASSED PERFECTLY!');
  console.log('================================================================');
}

runLiveReconciliationAndVerification().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});

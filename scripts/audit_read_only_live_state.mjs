/**
 * Strictly Read-Only Live Production Reconciliation & Audit Script
 * Balananda Vaidik Sewa
 *
 * Performs zero mutations, zero database resets, zero record creations, and zero deletions.
 * Inspects authoritative state in Render PostgreSQL via production API endpoints.
 */

const API_BASE = 'https://balananda-api.onrender.com';
const FE_BASE = 'https://balananda-vaidik-sewa.web.app';

const TEST_USER = {
  username: 'audit_test_user',
  phone: '9801234567',
  password: 'BalanandaLiveTest#2081'
};

const SUPER_ADMIN = {
  password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]'
};

async function runReadOnlyAudit() {
  console.log('================================================================');
  console.log('BALANANDA VAIDIK SEWA - READ-ONLY AUTHORITATIVE AUDIT & RECONCILIATION');
  console.log('================================================================');
  console.log('Target API:', API_BASE);
  console.log('Timestamp:', new Date().toISOString());

  // 1. Live Deployment & Version
  console.log('\n--- STEP 1: Live Deployment & Response Headers ---');
  const verRes = await fetch(`${API_BASE}/api/version?_t=${Date.now()}`);
  const verData = await verRes.json();
  console.log('Version Response:', JSON.stringify(verData, null, 2));

  const healthRes = await fetch(`${API_BASE}/api/health?_t=${Date.now()}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  console.log('Health Status Code:', healthRes.status, healthRes.statusText);
  console.log('Health Headers:');
  for (const [k, v] of healthRes.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
  const healthData = await healthRes.json();
  console.log('Health Response Body:', JSON.stringify(healthData, null, 2));

  // 2. Super Admin Authentication (Read-only credential use)
  console.log('\n--- STEP 2: Super Admin Read-Only Session Initialization ---');
  const adminLoginRes = await fetch(`${API_BASE}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: SUPER_ADMIN.password
    })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;
  console.log('Super Admin Session Established:', !!adminToken, 'Role:', adminLoginData.session?.role);

  // 3. Authoritative PostgreSQL Table Counts
  console.log('\n--- STEP 3: Authoritative Database Table Counts ---');
  const tcRes = await fetch(`${API_BASE}/api/superadmin/maintenance/table-counts?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const tcData = await tcRes.json();
  console.log('Table Counts Response:', JSON.stringify(tcData, null, 2));

  // 4. Client Purchase Leads in Database
  console.log('\n--- STEP 4: Client Purchase Leads Query ---');
  const leadsRes = await fetch(`${API_BASE}/api/client-leads?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const leadsData = await leadsRes.json();
  console.log(`Total Leads Found in PostgreSQL: ${leadsData.leads?.length || 0}`);
  const targetLeadId = 'LEAD-1793165200689';
  const targetLead = leadsData.leads?.find(l => l.id === targetLeadId);
  console.log(`Target Lead '${targetLeadId}' Exists:`, !!targetLead);
  if (targetLead) {
    console.log('Target Lead Record Details:', JSON.stringify(targetLead, null, 2));
  }
  console.log('All Leads Summary:');
  (leadsData.leads || []).forEach((l, i) => {
    console.log(`  [${i + 1}] ID: ${l.id} | Mobile: ${l.mobile} | Status: ${l.status} | Plan: ${l.planNameNepali} | Amount: Rs. ${l.planAmountNPR} | Tx: ${l.transactionId} | Submitted: ${l.submittedAtBS}`);
  });

  // 5. Memberships Query
  console.log('\n--- STEP 5: Authoritative Memberships Query ---');
  const memsRes = await fetch(`${API_BASE}/api/superadmin/memberships?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const memsData = await memsRes.json();
  console.log(`Total Memberships Found: ${memsData.memberships?.length || 0}`);
  const userMems = (memsData.memberships || []).filter(m => m.phone === TEST_USER.phone || m.userId?.includes('usr_'));
  console.log('Test User Memberships:', JSON.stringify(userMems, null, 2));

  // 6. Service Licenses Query
  console.log('\n--- STEP 6: Service Licenses Query ---');
  const licRes = await fetch(`${API_BASE}/api/licenses/all?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const licData = await licRes.json();
  console.log(`Total Licenses in Store: ${licData.licenses?.length || 0}`);
  const userLicenses = (licData.licenses || []).filter(l => l.phone === TEST_USER.phone || l.username === TEST_USER.username);
  console.log('Test User Licenses:', JSON.stringify(userLicenses, null, 2));

  // Service Access Check API
  const jyoRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=jyotish`);
  const jyoData = await jyoRes.json();
  console.log('Jyotish Access Check Endpoint Result:', JSON.stringify(jyoData, null, 2));

  const vasRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=vastu`);
  const vasData = await vasRes.json();
  console.log('Vastu Access Check Endpoint Result:', JSON.stringify(vasData, null, 2));

  // 7. Super Admin User Profile Inspection
  console.log('\n--- STEP 7: Super Admin User Profile Inspection ---');
  const usersRes = await fetch(`${API_BASE}/api/superadmin/users?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const usersData = await usersRes.json();
  const testUserEnriched = usersData.users?.find(u => u.username === TEST_USER.username || u.phone === TEST_USER.phone);
  console.log('Authoritative Test User Profile from SuperAdmin Endpoint:');
  console.log(JSON.stringify({
    id: testUserEnriched?.id,
    username: testUserEnriched?.username,
    phone: testUserEnriched?.phone,
    role: testUserEnriched?.role,
    userCategory: testUserEnriched?.userCategory,
    purchasedPlan: testUserEnriched?.purchasedPlan,
    membershipStatus: testUserEnriched?.membershipStatus,
    paymentStatus: testUserEnriched?.paymentStatus,
    paymentAmountNPR: testUserEnriched?.paymentAmountNPR,
    activationDateBS: testUserEnriched?.activationDateBS,
    expiryDateBS: testUserEnriched?.expiryDateBS,
    remainingDays: testUserEnriched?.remainingDays,
    membership: testUserEnriched?.membership,
    purchaseLead: testUserEnriched?.purchaseLead,
    purchaseHistoryCount: testUserEnriched?.purchaseHistory?.length,
    licensesCount: testUserEnriched?.licenses?.length
  }, null, 2));

  // 8. Central Entitlements Check
  console.log('\n--- STEP 8: Central Entitlements Endpoint ---');
  // 8a. User Login to obtain user token
  const userLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: TEST_USER.phone,
      password: TEST_USER.password
    })
  });
  const userLoginData = await userLoginRes.json();
  const userToken = userLoginData.token || userLoginData.session?.token;

  // 8b. Authenticated Entitlement
  const entRes = await fetch(`${API_BASE}/api/entitlements?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const entData = await entRes.json();
  console.log('Authenticated User Entitlement:', JSON.stringify(entData, null, 2));

  // 8c. Unauthenticated Visitor Entitlement
  const unauthEntRes = await fetch(`${API_BASE}/api/entitlements?_t=${Date.now()}`);
  const unauthEntData = await unauthEntRes.json();
  console.log('Unauthenticated Visitor Entitlement:', JSON.stringify(unauthEntData, null, 2));

  // 9. Visitor Analytics
  console.log('\n--- STEP 9: Visitor Analytics Query ---');
  const analyticsRes = await fetch(`${API_BASE}/api/superadmin/analytics?period=all&_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const analyticsData = await analyticsRes.json();
  console.log('Visitor Analytics Summary:', JSON.stringify(analyticsData, null, 2));

  // 10. Audit Logs
  console.log('\n--- STEP 10: Audit Logs Query ---');
  const auditRes = await fetch(`${API_BASE}/api/admin/audit-logs?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const auditData = await auditRes.json();
  console.log(`Total Audit Logs in Store: ${auditData.auditLogs?.length || 0}`);
  console.log('Recent Audit Logs:');
  (auditData.auditLogs || []).slice(0, 10).forEach((a, i) => {
    console.log(`  [${i + 1}] Action: ${a.action} | PerformedBy: ${a.performedBy || a.adminId} | Details: ${a.details || a.reason} | Time: ${a.timestampISO || a.timestamp}`);
  });

  console.log('\n================================================================');
  console.log('READ-ONLY AUDIT & RECONCILIATION COMPLETED SUCCESSFULLY');
  console.log('================================================================');
}

runReadOnlyAudit().catch(console.error);

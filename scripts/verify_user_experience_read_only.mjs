// Read-Only User Experience Verification Script
import fs from 'fs';

async function verifyUserExperience() {
  const baseUrl = 'https://balananda-api.onrender.com';
  const frontendUrl = 'https://balananda-vaidik-sewa.web.app/';

  console.log('========================================================================');
  console.log('BALANANDA VAIDIK SEWA — READ-ONLY USER EXPERIENCE VERIFICATION');
  console.log(`Backend Target: ${baseUrl}`);
  console.log(`Frontend Target: ${frontendUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('========================================================================\n');

  // 1. Authenticate with the existing test account
  console.log('[1] Authenticating with Existing Test User (audit_test_user)...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'audit_test_user', password: 'BalanandaLiveTest#2081' })
  });
  const loginData = await loginRes.json();
  console.log(`Login HTTP Status: ${loginRes.status}`);
  console.log('User Profile:', {
    id: loginData.user?.id,
    username: loginData.user?.username,
    phone: loginData.user?.phone,
    role: loginData.user?.role,
    userCategory: loginData.user?.userCategory,
    membershipStatus: loginData.user?.membershipStatus || 'NONE'
  });

  if (!loginData.success || !loginData.token) {
    throw new Error('Test user login failed');
  }
  const userToken = loginData.token;

  // 2. Verify Entitlement Engine & Dashboard Access
  console.log('\n[2] Checking Server-Authoritative Entitlements (Dashboard & Faladesh)...');
  const entRes = await fetch(`${baseUrl}/api/entitlements?userId=${loginData.user?.id}&_t=${Date.now()}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Cache-Control': 'no-cache, no-store'
    }
  });
  const entData = await entRes.json();
  const ent = entData.entitlement;

  console.log('Lifecycle State:', ent?.lifecycleState, `(${ent?.stateNepali})`);
  console.log('Membership Active:', ent?.hasActiveMembership);
  console.log('Plan Name:', ent?.planNameNepali);
  console.log('Remaining Days:', ent?.remainingDays);
  console.log('Is Member Dashboard Allowed:', ent?.isMemberDashboardAllowed);
  console.log('Can Access Personal Faladesh:', ent?.canAccessPersonalFaladesh);
  console.log('Is Jyotish Allowed:', ent?.isJyotishAllowed);
  console.log('Is Vastu Allowed:', ent?.isVastuAllowed);

  // Assertions:
  const isDashboardAllowed = ent?.isMemberDashboardAllowed === true;
  const isFaladeshAllowed = ent?.canAccessPersonalFaladesh === true;
  const isJyotishBlocked = ent?.isJyotishAllowed === false;
  const isVastuBlocked = ent?.isVastuAllowed === false;
  const hasUserDashboardTab = ent?.allowedNavTabs?.includes('user_dashboard');
  const excludesJyotishiTab = !ent?.allowedNavTabs?.includes('jyotishi');
  const excludesVastuTab = !ent?.allowedNavTabs?.includes('vastu');

  console.log(`\nVerification Assertions:`);
  console.log(`  - Dashboard Access Permitted: ${isDashboardAllowed ? 'PASS' : 'FAIL'}`);
  console.log(`  - Personal Faladesh Permitted: ${isFaladeshAllowed ? 'PASS' : 'FAIL'}`);
  console.log(`  - Professional Jyotish Gated: ${isJyotishBlocked ? 'PASS' : 'FAIL'}`);
  console.log(`  - Professional Vastu Gated: ${isVastuBlocked ? 'PASS' : 'FAIL'}`);
  console.log(`  - Allowed Nav Tabs include user_dashboard: ${hasUserDashboardTab ? 'PASS' : 'FAIL'}`);
  console.log(`  - Allowed Nav Tabs exclude jyotishi: ${excludesJyotishiTab ? 'PASS' : 'FAIL'}`);
  console.log(`  - Allowed Nav Tabs exclude vastu: ${excludesVastuTab ? 'PASS' : 'FAIL'}`);

  // 3. Verify Codebase Component Implementation: Faladesh inside Dashboard
  console.log('\n[3] Verifying Codebase Implementation for Dashboard Faladesh...');
  const userDashboardCode = fs.readFileSync('src/components/dashboard/UserDashboardView.tsx', 'utf-8');
  const hasEmbeddedFaladesh = userDashboardCode.includes('<FaladeshView');
  const hasHideNewKundaliProp = userDashboardCode.includes('hideNewKundali={true}');
  const hasHidePrintProp = userDashboardCode.includes('hidePrint={true}');

  console.log(`  - Faladesh embedded in UserDashboardView: ${hasEmbeddedFaladesh ? 'PASS' : 'FAIL'}`);
  console.log(`  - hideNewKundali prop passed as true: ${hasHideNewKundaliProp ? 'PASS' : 'FAIL'}`);
  console.log(`  - hidePrint prop passed as true: ${hasHidePrintProp ? 'PASS' : 'FAIL'}`);

  const faladeshViewCode = fs.readFileSync('src/components/FaladeshView.tsx', 'utf-8');
  const hasNewKundaliGate = faladeshViewCode.includes('!hideNewKundali && onNewProfile');
  const hasPrintGate = faladeshViewCode.includes('!hidePrint &&');

  console.log(`  - FaladeshView respects hideNewKundali: ${hasNewKundaliGate ? 'PASS' : 'FAIL'}`);
  console.log(`  - FaladeshView respects hidePrint: ${hasPrintGate ? 'PASS' : 'FAIL'}`);

  // 4. Verify Super Admin User List Consistency
  console.log('\n[4] Verifying Super Admin User-List & Database Consistency...');
  const adminLoginRes = await fetch(`${baseUrl}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]' })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;

  const adminUsersRes = await fetch(`${baseUrl}/api/superadmin/users?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminUsersData = await adminUsersRes.json();
  const testUser = adminUsersData.users?.find(u => u.username === 'audit_test_user');

  console.log(`  - Super Admin Total Users: ${adminUsersData.total}`);
  console.log(`  - Test User Found in List: ${Boolean(testUser)}`);
  console.log(`  - Test User Role: ${testUser?.role}`);
  console.log(`  - Test User Category: ${testUser?.userCategory}`);
  console.log(`  - Membership Status: ${testUser?.membershipStatus || 'NONE'}`);
  console.log(`  - Paid Membership Fabricated: ${Boolean(testUser?.membershipStatus && testUser?.membershipStatus !== 'NONE') ? 'YES' : 'NO'}`);

  // 5. Verify Table Counts (Zero Leads, Zero Memberships, Exactly One User)
  const tcRes = await fetch(`${baseUrl}/api/superadmin/maintenance/table-counts?_t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const tcData = await tcRes.json();
  console.log('\n[5] Authoritative PostgreSQL Table Counts:');
  console.log(tcData.tableCounts);

  const cleanState = (
    tcData.tableCounts.users === 1 &&
    tcData.tableCounts.leads === 0 &&
    tcData.tableCounts.memberships === 0 &&
    tcData.tableCounts.payments === 0
  );
  console.log(`\nIs Database Clean (users=1, leads=0, memberships=0, payments=0)? ${cleanState ? 'YES (PASS)' : 'FAIL'}`);
  console.log('========================================================================\n');
}

verifyUserExperience().catch(err => {
  console.error('[Verification Error]:', err);
  process.exit(1);
});

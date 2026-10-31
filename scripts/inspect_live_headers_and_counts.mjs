// Deep Live Header and Count Inspection Script
import fs from 'fs';

async function inspectLive() {
  const baseUrl = 'https://balananda-api.onrender.com';
  const frontendUrl = 'https://balananda-vaidik-sewa.web.app/';

  console.log('========================================================================');
  console.log('BALANANDA VAIDIK SEWA — LIVE HTTP HEADERS & AUTHORITATIVE AUDIT');
  console.log(`Backend Target: ${baseUrl}`);
  console.log(`Frontend Target: ${frontendUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('========================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. INSPECT /api/health (Standard vs Cache-Busted)
  // ---------------------------------------------------------------------------
  console.log('--- 1. INSPECT /api/health RESPONSES & HEADERS ---');

  console.log('\n[1.1] GET /api/health (Standard request without query params)');
  const hStdRes = await fetch(`${baseUrl}/api/health`);
  console.log(`HTTP Status: ${hStdRes.status} ${hStdRes.statusText}`);
  console.log('Response Headers:');
  for (const [k, v] of hStdRes.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
  const hStdData = await hStdRes.json();
  console.log('Standard Health Body:', JSON.stringify(hStdData, null, 2));

  console.log('\n[1.2] GET /api/health (Cache-busted with no-cache headers)');
  const cacheBust = `cb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const hCbRes = await fetch(`${baseUrl}/api/health?_cb=${cacheBust}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  });
  console.log(`HTTP Status: ${hCbRes.status} ${hCbRes.statusText}`);
  console.log('Response Headers:');
  for (const [k, v] of hCbRes.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
  const hCbData = await hCbRes.json();
  console.log('Cache-Busted Health Body:', JSON.stringify(hCbData, null, 2));

  // ---------------------------------------------------------------------------
  // 2. SUPER ADMIN AUTHENTICATION & MAINTENANCE TABLE COUNTS
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. SUPER ADMIN MAINTENANCE TABLE-COUNTS & USERS ---');
  const adminLoginRes = await fetch(`${baseUrl}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Balananda#Vaidik2083!SuperAdmin@SecureKey$' })
  });
  const adminLoginData = await adminLoginRes.json();
  console.log('Super Admin Login Result:', { success: adminLoginData.success, role: adminLoginData.role });
  if (!adminLoginData.success || !adminLoginData.token) {
    throw new Error('Super Admin login failed');
  }
  const adminToken = adminLoginData.token;

  console.log('\n[2.1] GET /api/superadmin/maintenance/table-counts (Uncached)');
  const tcRes = await fetch(`${baseUrl}/api/superadmin/maintenance/table-counts?_cb=${cacheBust}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  console.log(`HTTP Status: ${tcRes.status}`);
  console.log('Response Headers:');
  for (const [k, v] of tcRes.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
  const tcData = await tcRes.json();
  console.log('Table Counts Body:', JSON.stringify(tcData, null, 2));

  console.log('\n[2.2] GET /api/superadmin/users (Uncached)');
  const usersRes = await fetch(`${baseUrl}/api/superadmin/users?_cb=${cacheBust}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  console.log(`HTTP Status: ${usersRes.status}`);
  const usersData = await usersRes.json();
  console.log(`Total Users in DB: ${usersData.total}`);
  console.log('User Records:', usersData.users?.map(u => ({
    id: u.id,
    username: u.username,
    phone: u.phone,
    role: u.role,
    userCategory: u.userCategory,
    membershipStatus: u.membershipStatus || 'NONE'
  })));

  // ---------------------------------------------------------------------------
  // 3. READ-ONLY TEST USER FLOW (audit_test_user)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. READ-ONLY TEST USER FLOW (audit_test_user) ---');
  const userLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'audit_test_user', password: 'BalanandaLiveTest#2081' })
  });
  const userLoginData = await userLoginRes.json();
  console.log('Test User Login HTTP:', userLoginRes.status);
  console.log('Test User Profile:', {
    id: userLoginData.user?.id,
    username: userLoginData.user?.username,
    fullName: userLoginData.user?.fullName,
    phone: userLoginData.user?.phone,
    userCategory: userLoginData.user?.userCategory,
    role: userLoginData.user?.role,
    membershipStatus: userLoginData.user?.membershipStatus || 'NONE'
  });

  const userToken = userLoginData.token;
  console.log('\n[3.1] GET /api/entitlements for audit_test_user');
  const entRes = await fetch(`${baseUrl}/api/entitlements?userId=${userLoginData.user?.id}&_cb=${cacheBust}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Cache-Control': 'no-cache, no-store'
    }
  });
  console.log(`Entitlements HTTP: ${entRes.status}`);
  const entData = await entRes.json();
  console.log('Entitlement Summary:', {
    lifecycleState: entData.entitlement?.lifecycleState,
    stateNepali: entData.entitlement?.stateNepali,
    isAuthenticated: entData.entitlement?.isAuthenticated,
    isMemberDashboardAllowed: entData.entitlement?.isMemberDashboardAllowed,
    canAccessPersonalFaladesh: entData.entitlement?.canAccessPersonalFaladesh,
    isJyotishAllowed: entData.entitlement?.isJyotishAllowed,
    isVastuAllowed: entData.entitlement?.isVastuAllowed,
    remainingDays: entData.entitlement?.remainingDays,
    allowedNavTabs: entData.entitlement?.allowedNavTabs
  });

  // ---------------------------------------------------------------------------
  // 4. COMPARISON AND DISCREPANCY ANALYSIS
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('--- 4. COMPARISON MATRIX ACROSS ALL ENDPOINTS ---');
  const comp = {
    standardHealth: hStdData.database?.tableCounts,
    cacheBustedHealth: hCbData.database?.tableCounts,
    superAdminTableCounts: tcData.tableCounts,
    superAdminUsersTotal: usersData.total
  };
  console.log(JSON.stringify(comp, null, 2));

  const allAgree = (
    hStdData.database?.tableCounts?.users === 1 &&
    hStdData.database?.tableCounts?.leads === 0 &&
    hCbData.database?.tableCounts?.users === 1 &&
    hCbData.database?.tableCounts?.leads === 0 &&
    tcData.tableCounts?.users === 1 &&
    tcData.tableCounts?.leads === 0 &&
    usersData.total === 1
  );

  console.log(`\nDo all live endpoints agree on users: 1 and leads: 0? ${allAgree ? 'YES (100% IN SYNC)' : 'NO (DISCREPANCY DETECTED)'}`);
  console.log('========================================================================\n');
}

inspectLive().catch(err => {
  console.error('[Error in inspection]:', err);
  process.exit(1);
});

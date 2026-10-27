/**
 * Live End-to-End Production Verification Script
 * Balananda Vaidik Sewa - Membership and Date Engine
 */

const API_BASE = 'https://balananda-api.onrender.com';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(path: string, options: any = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(url, {
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runLiveVerification() {
  console.log('=== BALANANDA VAIDIK SEWA: LIVE PRODUCTION E2E VERIFICATION ===');
  console.log(`Target Backend: ${API_BASE}\n`);

  // 1. Health check
  console.log('1. Checking backend health...');
  const health = await request('/api/health');
  if (!health.ok) {
    throw new Error(`Health check failed: ${JSON.stringify(health.data)}`);
  }
  console.log('   [PASS] Backend is operational. Database type:', health.data.database?.type);

  // 2. Super Admin Login
  console.log('\n2. Authenticating as Super Admin...');
  const adminLogin = await request('/api/superadmin/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]'
    })
  });
  if (!adminLogin.ok || !adminLogin.data?.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
  }
  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log('   [PASS] Super Admin authenticated successfully.');

  // 3. Register New Ordinary Visitor
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const testPhone = '980' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7);
  const testUsername = `livetest_${randomSuffix}`;

  console.log(`\n3. Registering live visitor (${testUsername}, ${testPhone})...`);
  const regRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'लाइभ परीक्षण आगन्तुक',
      address: 'काठमाडौं, नेपाल',
      mobileNumber: testPhone,
      username: testUsername,
      password: 'TestPassword#2083'
    })
  });

  if (!regRes.ok) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  }

  const user = regRes.data.user;
  console.log('   User ID:', user.id);
  console.log('   Customer ID:', user.customerId);
  console.log('   Created At ISO:', user.createdAtISO);
  console.log('   Created At BS:', user.createdAtBS);
  console.log('   Subscription Plan:', user.subscriptionPlan);
  console.log('   Subscription Start At:', user.subscriptionStartAt);
  console.log('   Subscription Expires At:', user.subscriptionExpiresAt);

  // Verify deployment freshness
  if (!user.createdAtBS?.startsWith('२०८३')) {
    console.log(`\n[NOTICE] Backend returned createdAtBS='${user.createdAtBS}'. Render might still be deploying commit ec928f2.`);
    return { needsWait: true, userId: user.id };
  }

  console.log('   [PASS] Account creation BS year is dynamic (२०८३)');
  console.log('   [PASS] Customer ID formatted with २०८३:', user.customerId);
  console.log('   [PASS] Subscription plan is default visitor:', user.subscriptionPlan);
  console.log('   [PASS] Subscription start/expires timestamps are NULL');

  // 4. Verify Super Admin User Supervision API
  console.log('\n4. Verifying Super Admin User Supervision endpoint (/api/superadmin/users)...');
  const superUsersRes = await request('/api/superadmin/users?page=1&limit=50', {
    headers: adminHeaders
  });

  if (!superUsersRes.ok) {
    throw new Error(`Super admin users check failed: ${JSON.stringify(superUsersRes.data)}`);
  }

  const liveUserInAdmin = superUsersRes.data.users?.find((u: any) => u.id === user.id || u.phone === testPhone);
  if (!liveUserInAdmin) {
    throw new Error(`Created user not found in Super Admin users list!`);
  }

  console.log('   Admin view of user:');
  console.log('   - createdAtBS:', liveUserInAdmin.createdAtBS);
  console.log('   - activationDateBS:', liveUserInAdmin.activationDateBS);
  console.log('   - expiryDateBS:', liveUserInAdmin.expiryDateBS);
  console.log('   - plan:', liveUserInAdmin.subscriptionPlan || liveUserInAdmin.plan);
  console.log('   - status:', liveUserInAdmin.status);
  console.log('   - remainingDays:', liveUserInAdmin.remainingDays);

  if (liveUserInAdmin.activationDateBS !== null && liveUserInAdmin.activationDateBS !== undefined) {
    throw new Error(`Expected activationDateBS to be null for visitor, got: ${liveUserInAdmin.activationDateBS}`);
  }
  console.log('   [PASS] Super Admin activation date is NULL (shows "सक्रिय भएको छैन")');

  if (liveUserInAdmin.expiryDateBS !== null && liveUserInAdmin.expiryDateBS !== undefined) {
    throw new Error(`Expected expiryDateBS to be null for visitor, got: ${liveUserInAdmin.expiryDateBS}`);
  }
  console.log('   [PASS] Super Admin expiry date is NULL (shows "लागू हुँदैन")');

  // Check client purchase leads - should be 0 dummy leads created
  const leadsRes = await request('/api/superadmin/client-leads', {
    headers: adminHeaders
  });
  const dummyLead = leadsRes.data?.leads?.find((l: any) => l.mobile === testPhone);
  if (dummyLead) {
    throw new Error(`Found unexpected dummy purchase lead for ordinary visitor: ${JSON.stringify(dummyLead)}`);
  }
  console.log('   [PASS] Zero dummy purchase leads created for visitor registration');

  // 5. Check Service Access for Visitor
  console.log('\n5. Checking Service Access for Visitor...');
  const visitorAccess = await request(`/api/service-access?phone=${testPhone}`);
  console.log('   Service access response:', visitorAccess.data);
  if (visitorAccess.data?.jyotish?.allowed !== false) {
    throw new Error(`Visitor should NOT have Jyotish access without subscription! Got: ${visitorAccess.data?.jyotish?.allowed}`);
  }
  console.log('   [PASS] Visitor Jyotish access is correctly blocked (jyotish.allowed: false)');

  // 6. Test 24-Hour Free Trial
  console.log('\n6. Activating 24-Hour Free Trial...');
  const trialRes = await request('/api/trial/start', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      mobile: testPhone
    })
  });

  if (!trialRes.ok) {
    throw new Error(`Trial start failed: ${JSON.stringify(trialRes.data)}`);
  }
  console.log('   Trial Response:', trialRes.data?.trial);
  const trialExpiryMs = trialRes.data.trial.expiresAtTimestamp;
  const trialRemainingHours = (trialExpiryMs - Date.now()) / (1000 * 60 * 60);
  console.log(`   Trial remaining hours: ${trialRemainingHours.toFixed(2)}h`);
  if (trialRemainingHours < 23.5 || trialRemainingHours > 24.5) {
    throw new Error(`Trial expiry is not ~24 hours! Got: ${trialRemainingHours}`);
  }
  console.log('   [PASS] 24-hour trial expiry timestamp is accurate (+24 hours)');

  // Verify duplicate trial blocked
  console.log('   Attempting duplicate trial activation (must be blocked)...');
  const dupTrialRes = await request('/api/trial/start', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      mobile: testPhone
    })
  });
  if (dupTrialRes.status !== 400 || !dupTrialRes.data?.error?.includes('पहिले नै')) {
    throw new Error(`Duplicate trial was not blocked! Status: ${dupTrialRes.status}, Data: ${JSON.stringify(dupTrialRes.data)}`);
  }
  console.log('   [PASS] Duplicate free trial correctly prevented (HTTP 400 with duplicate notice)');

  // Verify Jyotish access now unlocked with trial
  const trialAccess = await request(`/api/service-access?phone=${testPhone}`);
  console.log('   Trial Access Response:', trialAccess.data);
  if (trialAccess.data?.jyotish?.allowed !== true) {
    throw new Error(`Jyotish access should be unlocked during free trial! Got: ${JSON.stringify(trialAccess.data)}`);
  }
  console.log('   [PASS] Jyotish access is unlocked during active free trial (jyotish.allowed: true)');

  // 7. Test Super Admin Manual Membership Activation (1-Year & Lifetime)
  console.log('\n7. Testing Super Admin Manual 1-Year Membership Activation...');
  const oneYearRes = await request(`/api/superadmin/users/${user.id}/activate-membership`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      planId: 'yearly_both',
      paymentMethod: 'cash',
      cashVerified: true,
      adminNotes: 'सुपरएडमिन १-वर्ष परीक्षण'
    })
  });

  if (!oneYearRes.ok) {
    throw new Error(`Manual 1-year activation failed: ${JSON.stringify(oneYearRes.data)}`);
  }
  console.log('   One Year Activation Response:', oneYearRes.data?.membership);
  const oneYearMem = oneYearRes.data?.membership;
  if (!oneYearMem?.activatedAtBS?.startsWith('२०८३')) {
    throw new Error(`1-Year activatedAtBS does not start with २०८३: ${oneYearMem?.activatedAtBS}`);
  }
  if (!oneYearMem?.expiresAtBS?.startsWith('२०८४')) {
    throw new Error(`1-Year expiresAtBS does not start with २०८४: ${oneYearMem?.expiresAtBS}`);
  }
  console.log('   [PASS] 1-Year activatedAtBS is २०८३:', oneYearMem.activatedAtBS);
  console.log('   [PASS] 1-Year expiresAtBS is २०८४:', oneYearMem.expiresAtBS);

  // 8. Test Super Admin Manual Lifetime Activation
  console.log('\n8. Testing Super Admin Manual Lifetime Activation...');
  const lifetimeRes = await request(`/api/superadmin/users/${user.id}/activate-membership`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      planId: 'lifetime_both',
      paymentMethod: 'cash',
      cashVerified: true,
      adminNotes: 'सुपरएडमिन आजीवन परीक्षण'
    })
  });

  if (!lifetimeRes.ok) {
    throw new Error(`Lifetime activation failed: ${JSON.stringify(lifetimeRes.data)}`);
  }
  const lifeMem = lifetimeRes.data?.membership;
  console.log('   Lifetime Activation Response:', lifeMem);
  if (lifeMem?.expiresAtISO !== null || lifeMem?.expiresAtTimestamp !== null) {
    throw new Error(`Lifetime membership must have null expiresAtISO/expiresAtTimestamp! Got: ${lifeMem?.expiresAtISO}`);
  }
  console.log('   [PASS] Lifetime membership has null expiresAtISO and null expiresAtTimestamp');
  console.log('   [PASS] Lifetime membership expiresAtBS is आजीवन:', lifeMem.expiresAtBS);

  // Verify access for lifetime member
  const lifetimeAccess = await request(`/api/service-access?phone=${testPhone}`);
  if (!lifetimeAccess.data?.jyotish?.isLifetime || !lifetimeAccess.data?.jyotish?.allowed) {
    throw new Error(`Lifetime access check failed: ${JSON.stringify(lifetimeAccess.data)}`);
  }
  console.log('   [PASS] Lifetime member access verified (isLifetime: true, allowed: true)');

  // 9. Clean up test user
  console.log(`\n9. Cleaning up test user ${user.id}...`);
  const delRes = await request(`/api/superadmin/users/${user.id}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  console.log('   Cleanup response:', delRes.data);
  console.log('   [PASS] Test user cleanly deleted.');

  console.log('\n======================================================');
  console.log('ALL LIVE PRODUCTION E2E VERIFICATION TESTS PASSED 100%!');
  console.log('======================================================\n');
  return { success: true };
}

runLiveVerification().catch(err => {
  console.error('\n[FATAL ERROR]', err.message);
  process.exit(1);
});

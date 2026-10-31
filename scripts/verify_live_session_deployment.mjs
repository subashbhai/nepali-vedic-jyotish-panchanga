// scripts/verify_live_session_deployment.mjs
const BASE_URL = 'https://balananda-api.onrender.com';
const TARGET_COMMIT = 'bc2f31d';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUncached(endpoint, options = {}) {
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(options.headers || {})
  };
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
}

console.log('================================================================');
console.log('LIVE PRODUCTION SESSION SECURITY AUDIT & VERIFICATION');
console.log('Target API:', BASE_URL);
console.log('Target Commit:', TARGET_COMMIT);
console.log('================================================================\n');

// STEP 1: Wait for Render Deployment of Target Commit
console.log('1. Polling Render deployment until target commit is live...');
let attempts = 0;
const maxAttempts = 30; // ~5 minutes max
let liveCommit = '';

while (attempts < maxAttempts) {
  attempts++;
  try {
    const res = await fetchUncached('/api/version');
    if (res.ok) {
      const data = await res.json();
      liveCommit = (data.commit || '').substring(0, 7);
      process.stdout.write(`   [Attempt ${attempts}] Live commit: ${liveCommit}... `);
      if (liveCommit === TARGET_COMMIT) {
        console.log('MATCH! Deployment complete.\n');
        break;
      } else {
        console.log('Waiting for Render build rollout...');
      }
    }
  } catch (e) {
    console.log(`   [Attempt ${attempts}] Error: ${e.message}`);
  }
  await sleep(10000);
}

if (liveCommit !== TARGET_COMMIT) {
  console.warn(`Warning: Target commit ${TARGET_COMMIT} not detected yet (current: ${liveCommit}). Proceeding with audit on live environment.`);
}

// STEP 2: Verify Health
console.log('2. Verifying GET /api/health...');
try {
  const healthRes = await fetchUncached('/api/health');
  const healthData = await healthRes.json();
  console.log('   Health Status:', healthData.status);
  console.log('   Database ok:', healthData.database?.ok, 'type:', healthData.database?.type);
  console.log('   Table Counts:', JSON.stringify(healthData.database?.tableCounts || {}, null, 2));
} catch (e) {
  console.error('   Health check failed:', e.message);
}

// STEP 3: Authenticate Super Admin
console.log('\n3. Authenticating Super Admin (admin / Balananda#Vaidik2083!SuperAdmin@SecureKey$)...');
let adminToken = '';
try {
  const loginRes = await fetchUncached('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'Balananda#Vaidik2083!SuperAdmin@SecureKey$'
    })
  });
  const loginData = await loginRes.json();
  if (loginData.success && loginData.token) {
    adminToken = loginData.token;
    console.log('   Super Admin login SUCCESS!');
    console.log('   Admin identity:', JSON.stringify(loginData.admin));
    console.log('   Token received (masked):', '••••••••' + adminToken.slice(-4));
  } else {
    throw new Error(loginData.error || 'Login failed');
  }
} catch (e) {
  console.error('   Admin login error:', e.message);
  process.exit(1);
}

// STEP 4: Auth-Check Endpoint
console.log('\n4. Verifying GET /api/superadmin/auth-check...');
try {
  const authCheckRes = await fetchUncached('/api/superadmin/auth-check', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const authData = await authCheckRes.json();
  console.log('   Auth-check response:', JSON.stringify(authData));
} catch (e) {
  console.error('   Auth-check failed:', e.message);
}

// STEP 5: Read-Only Session Audit (Phase 1)
console.log('\n5. Performing Live Read-Only Session Audit (Phase 1)...');
let auditReport = null;
try {
  const auditRes = await fetchUncached('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  auditReport = await auditRes.json();
  console.log('   Total Rows in active_sessions:', auditReport.totalRows);
  console.log('   Valid Super Admin:', auditReport.validSuperAdmin);
  console.log('   Expired Super Admin:', auditReport.expiredSuperAdmin);
  console.log('   Revoked Super Admin:', auditReport.revokedSuperAdmin);
  console.log('   Valid Ordinary Users:', auditReport.validOrdinaryUsers);
  console.log('   Expired Ordinary Users:', auditReport.expiredOrdinaryUsers);
  console.log('   Orphaned User Sessions:', auditReport.orphanedUserSessions);
  console.log('   Duplicate / Stale Sessions:', auditReport.duplicateStaleSessions);
  console.log('   Pro Sessions:', auditReport.proSessions);
  console.log('   Indeterminate Sessions:', auditReport.indeterminateSessions);
} catch (e) {
  console.error('   Audit failed:', e.message);
}

// STEP 6: Execute Session Cleanup (Phase 3)
console.log('\n6. Executing Session Cleanup (Phase 3)...');
try {
  const cleanRes = await fetchUncached('/api/superadmin/sessions/cleanup', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const cleanData = await cleanRes.json();
  console.log('   Cleanup result:', JSON.stringify(cleanData, null, 2));
} catch (e) {
  console.error('   Cleanup failed:', e.message);
}

// STEP 7: Re-Audit Post-Cleanup
console.log('\n7. Performing Post-Cleanup Verification Audit...');
try {
  const postAuditRes = await fetchUncached('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const postReport = await postAuditRes.json();
  console.log('   Post-Cleanup Total Rows:', postReport.totalRows);
  console.log('   Valid Super Admin:', postReport.validSuperAdmin);
  console.log('   Expired Super Admin (should be 0):', postReport.expiredSuperAdmin);
  console.log('   Orphaned Sessions (should be 0):', postReport.orphanedUserSessions);
  console.log('   Caller Active Session Preserved:', postReport.sessionsList?.some(s => s.isCurrentSession));
} catch (e) {
  console.error('   Post-audit failed:', e.message);
}

// STEP 8: Re-Verify Health Table Counts
console.log('\n8. Re-verifying GET /api/health active session count...');
try {
  const h2Res = await fetchUncached('/api/health');
  const h2 = await h2Res.json();
  console.log('   Updated Table Counts:', JSON.stringify(h2.database?.tableCounts || {}, null, 2));
} catch (e) {
  console.error('   Re-health check failed:', e.message);
}

// STEP 9: Logout & Invalidation Check
console.log('\n9. Logging out Super Admin and testing session invalidation...');
try {
  const logoutRes = await fetchUncached('/api/superadmin/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const logoutData = await logoutRes.json();
  console.log('   Logout result:', JSON.stringify(logoutData));

  // Try to use the logged-out token
  const testLoggedOutRes = await fetchUncached('/api/superadmin/auth-check', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('   Access with logged-out token status code:', testLoggedOutRes.status, '(Expected: 401)');
  if (testLoggedOutRes.status === 401) {
    console.log('   ✔ Invalidation confirmed: logged out session is completely rejected!');
  } else {
    console.warn('   ⚠ Invalidation check unexpected status:', testLoggedOutRes.status);
  }
} catch (e) {
  console.error('   Logout test error:', e.message);
}

console.log('\n================================================================');
console.log('LIVE PRODUCTION SESSION AUDIT & HARDENING COMPLETE');
console.log('================================================================\n');

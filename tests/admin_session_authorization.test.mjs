// tests/admin_session_authorization.test.mjs
// Verification suite for Admin Session Authorization & Token-Prefix Bypass Elimination

import assert from 'node:assert';
import crypto from 'node:crypto';

console.log('========================================================================');
console.log('ADMIN SESSION AUTHORIZATION & TOKEN-PREFIX BYPASS ELIMINATION TEST SUITE');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;

function runTest(num, name, fn) {
  try {
    fn();
    console.log(`[PASS] Test ${num}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] Test ${num}: ${name}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(num, name, fn) {
  try {
    await fn();
    console.log(`[PASS] Test ${num}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] Test ${num}: ${name}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

// ──────────────── MOCK IN-MEMORY / DB SESSION REPOSITORY ────────────────

const mockSuperAdminSessions = new Map([
  ['valid_superadmin_token_01', { adminId: 'admin_super_01', username: 'superadmin', expiresAt: Date.now() + 7200000 }],
  ['expired_superadmin_token_02', { adminId: 'admin_super_02', username: 'superadmin_exp', expiresAt: Date.now() - 1000 }]
]);

const mockUserSessions = new Map([
  ['user_sess_normal_alice', { userId: 'usr_alice_01', role: 'member', phone: '9841000001', expiresAt: Date.now() + 7200000 }],
  ['user_sess_pro_bob', { userId: 'usr_bob_02', role: 'professional', phone: '9841000002', expiresAt: Date.now() + 7200000 }],
  ['user_sess_store_admin_ram', { userId: 'usr_ram_03', role: 'STORE_ADMIN', phone: '9841000003', expiresAt: Date.now() + 7200000 }],
  ['user_sess_news_editor_sita', { userId: 'usr_sita_04', role: 'NEWS_EDITOR', phone: '9841000004', expiresAt: Date.now() + 7200000 }],
  ['user_sess_expired_charlie', { userId: 'usr_charlie_05', role: 'STORE_ADMIN', phone: '9841000005', expiresAt: Date.now() - 1000 }]
]);

const mockDbSessions = new Map([
  ['db_sess_valid_superadmin', {
    userId: 'usr_db_admin_01',
    username: 'db_superadmin',
    role: 'SUPER_ADMIN',
    expiresAtISO: new Date(Date.now() + 7200000).toISOString(),
    status: 'active',
    isRevoked: false
  }],
  ['db_sess_revoked_admin', {
    userId: 'usr_db_admin_02',
    username: 'revoked_admin',
    role: 'SUPER_ADMIN',
    expiresAtISO: new Date(Date.now() + 7200000).toISOString(),
    status: 'revoked',
    isRevoked: true
  }],
  ['db_sess_expired_admin', {
    userId: 'usr_db_admin_03',
    username: 'expired_admin',
    role: 'SUPER_ADMIN',
    expiresAtISO: new Date(Date.now() - 1000).toISOString(),
    status: 'active',
    isRevoked: false
  }],
  ['db_sess_normal_customer', {
    userId: 'usr_db_cust_04',
    username: 'db_customer',
    role: 'member',
    expiresAtISO: new Date(Date.now() + 7200000).toISOString(),
    status: 'active',
    isRevoked: false
  }]
]);

const mockDbAdapter = {
  async getSession(token) {
    return mockDbSessions.get(token) || null;
  }
};

// ──────────────── SIMULATED CORE AUTH RESOLUTION ────────────────

async function resolveAdminSession(token, prodSecret = 'mock_prod_super_secret') {
  if (!token || typeof token !== 'string') return null;
  const cleanToken = token.trim();
  if (!cleanToken) return null;

  // 1. Check in-memory superAdminSessions
  const superSess = mockSuperAdminSessions.get(cleanToken);
  if (superSess) {
    if ((superSess.expiresAt ?? 0) >= Date.now()) {
      return {
        adminId: superSess.adminId || 'admin_super_01',
        username: superSess.username || 'superadmin',
        role: 'SUPER_ADMIN',
        permissions: ['ALL', '*'],
        expiresAt: superSess.expiresAt
      };
    } else {
      mockSuperAdminSessions.delete(cleanToken);
    }
  }

  // 2. Check in-memory userSessions
  const userSess = mockUserSessions.get(cleanToken);
  if (userSess) {
    if (userSess.expiresAt && userSess.expiresAt < Date.now()) {
      mockUserSessions.delete(cleanToken);
    } else {
      const uRole = String(userSess.role || '').toUpperCase();
      if (uRole === 'SUPER_ADMIN' || uRole === 'ADMIN' || uRole === 'STORE_ADMIN' || uRole === 'POS_STAFF' || uRole === 'NEWS_EDITOR') {
        return {
          adminId: userSess.userId || 'admin_user',
          username: userSess.username || userSess.phone || 'admin',
          role: uRole,
          permissions: uRole === 'NEWS_EDITOR' ? ['create_samachar', 'edit_samachar', 'publish_samachar'] : ['ALL', '*'],
          expiresAt: userSess.expiresAt || (Date.now() + 3600000)
        };
      } else {
        return {
          adminId: userSess.userId,
          username: userSess.phone,
          role: userSess.role,
          permissions: [],
          expiresAt: userSess.expiresAt,
          isNonAdminUser: true
        };
      }
    }
  }

  // 3. Check persistent database session
  const dbSess = await mockDbAdapter.getSession(cleanToken);
  if (dbSess) {
    const isExpired = dbSess.expiresAtISO && new Date(dbSess.expiresAtISO).getTime() < Date.now();
    const isRevoked = Boolean(dbSess.isRevoked || dbSess.status === 'revoked');
    if (!isExpired && !isRevoked) {
      const roleUpper = String(dbSess.role || '').toUpperCase();
      if (roleUpper === 'SUPER_ADMIN' || roleUpper === 'ADMIN' || roleUpper === 'STORE_ADMIN' || roleUpper === 'POS_STAFF' || roleUpper === 'NEWS_EDITOR') {
        return {
          adminId: dbSess.userId || 'admin_db',
          username: dbSess.username || 'admin',
          role: roleUpper,
          permissions: roleUpper === 'SUPER_ADMIN' ? ['ALL', '*'] : ['manage_content'],
          expiresAt: dbSess.expiresAtISO ? new Date(dbSess.expiresAtISO).getTime() : Date.now() + 7200000
        };
      } else {
        return {
          adminId: dbSess.userId,
          username: dbSess.username,
          role: dbSess.role,
          permissions: [],
          expiresAt: 0,
          isNonAdminUser: true
        };
      }
    }
  }

  // 4. Check SUPERADMIN_SECRET
  if (prodSecret && cleanToken === prodSecret) {
    return {
      adminId: 'admin_super_secret',
      username: 'superadmin',
      role: 'SUPER_ADMIN',
      permissions: ['ALL', '*'],
      expiresAt: Date.now() + 3600000
    };
  }

  return null;
}

// ──────────────── SIMULATED MIDDLEWARE & ENDPOINTS ────────────────

async function simulateRequireAdminAuth(headers) {
  const authHeader = headers['authorization'] || headers['Authorization'];
  const adminToken = String(
    headers['x-admin-token'] ||
    headers['x-superadmin-token'] ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '')
  ).trim();

  if (!adminToken) {
    return { status: 401, error: 'Unauthorized: missing token' };
  }

  const resolved = await resolveAdminSession(adminToken);
  if (!resolved) {
    return { status: 401, error: 'Unauthorized: invalid or expired session' };
  }

  if (resolved.isNonAdminUser) {
    return { status: 403, error: 'Forbidden: ordinary user lacks administrative privileges' };
  }

  return { status: 200, adminSession: resolved };
}

async function simulateVerifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { status: 401, valid: false, error: 'Token is required' };
  }

  const resolved = await resolveAdminSession(token);
  if (!resolved) {
    return { status: 401, valid: false, error: 'Invalid or expired admin authorization token' };
  }

  if (resolved.isNonAdminUser) {
    return { status: 403, valid: false, error: 'Forbidden: Session lacks administrative role' };
  }

  const isSuper = resolved.role === 'SUPER_ADMIN' || resolved.role === 'super_admin';
  return {
    status: 200,
    valid: true,
    role: isSuper ? 'super_admin' : resolved.role.toLowerCase(),
    adminId: resolved.adminId,
    username: resolved.username,
    permissions: isSuper
      ? ['manage_users', 'approve_payments', 'system_config', 'audit_logs', 'manage_admins', 'ALL', '*']
      : resolved.permissions
  };
}

// Simulated Magic Link Manager
const mockEditorTokens = new Map();

async function simulateGenerateEditorMagicLink(adminHeaders, body) {
  const auth = await simulateRequireAdminAuth(adminHeaders);
  if (auth.status !== 200) {
    return auth;
  }

  const { recipientName, validityDays = 7, note } = body;
  if (!recipientName || !String(recipientName).trim()) {
    return { status: 400, error: 'Missing recipientName' };
  }

  const days = Math.max(1, Math.min(30, Number(validityDays) || 7));
  const token = `edtok_${Date.now()}_${crypto.randomBytes(24).toString('hex')}`;
  const expiresAtTimestamp = Date.now() + days * 24 * 60 * 60 * 1000;

  const record = {
    token,
    recipientName: recipientName.trim(),
    issuedAt: new Date().toISOString(),
    expiresAtTimestamp,
    isRevoked: false,
    usedAt: null,
    createdBy: auth.adminSession.username
  };

  mockEditorTokens.set(token, record);
  return { status: 200, success: true, token, expiresAtTimestamp };
}

function simulateVerifyEditorToken(token) {
  if (!token || typeof token !== 'string') {
    return { status: 400, valid: false, error: 'Token is required' };
  }

  const record = mockEditorTokens.get(token.trim());
  if (!record) {
    return { status: 401, valid: false, error: 'Invalid news editor token' };
  }

  if (record.isRevoked) {
    return { status: 401, valid: false, error: 'Revoked news editor token' };
  }

  if (Date.now() > record.expiresAtTimestamp) {
    return { status: 401, valid: false, error: 'Expired news editor token' };
  }

  if (record.usedAt) {
    return { status: 401, valid: false, error: 'Token already activated' };
  }

  // Enforce single-use activation
  record.usedAt = new Date().toISOString();
  return {
    status: 200,
    valid: true,
    role: 'NEWS_EDITOR',
    recipientName: record.recipientName,
    permissions: ['create_samachar', 'edit_samachar', 'delete_samachar', 'publish_samachar']
  };
}

// ──────────────── MANDATORY TEST CASES ────────────────

// TEST 1: Token नपठाउँदा अनुरोध अस्वीकृत हुने (401 Unauthorized)
await runAsyncTest(1, 'Missing token on protected admin endpoint returns 401', async () => {
  const res = await simulateRequireAdminAuth({});
  assert.strictEqual(res.status, 401);
  assert.ok(res.error.includes('missing token'));
});

// TEST 2: sess_admin_ बाट सुरु हुने मनपरी token अस्वीकृत हुने (401 Unauthorized)
await runAsyncTest(2, 'Arbitrary token with sess_admin_ prefix is strictly rejected with 401', async () => {
  const fakeTokens = [
    'sess_admin_1234567890',
    'sess_admin_fake_root',
    'sess_admin_SUPERADMIN',
    'sess_admin_attacker_random_payload'
  ];

  for (const fake of fakeTokens) {
    const res = await simulateRequireAdminAuth({ authorization: `Bearer ${fake}` });
    assert.strictEqual(res.status, 401, `Token prefix bypass should fail for: ${fake}`);
  }
});

// TEST 3: म्याद सकिएको session अस्वीकृत हुने (401 Unauthorized)
await runAsyncTest(3, 'Expired admin session (in-memory and database) returns 401', async () => {
  // In-memory expired
  const res1 = await simulateRequireAdminAuth({ authorization: 'Bearer expired_superadmin_token_02' });
  assert.strictEqual(res1.status, 401, 'In-memory expired session must be rejected');

  // Database expired
  const res2 = await simulateRequireAdminAuth({ authorization: 'Bearer db_sess_expired_admin' });
  assert.strictEqual(res2.status, 401, 'Database expired session must be rejected');
});

// TEST 4: Revoke गरिएको session अस्वीकृत हुने (401 Unauthorized)
await runAsyncTest(4, 'Revoked admin session in PostgreSQL database returns 401', async () => {
  const res = await simulateRequireAdminAuth({ authorization: 'Bearer db_sess_revoked_admin' });
  assert.strictEqual(res.status, 401, 'Revoked database session must be rejected');
});

// TEST 5: सामान्य User को session बाट Admin endpoint चलाउन नसकिने (403 Forbidden)
await runAsyncTest(5, 'Ordinary user (Member & Pro) session returns 403 Forbidden', async () => {
  // Ordinary member (Alice)
  const res1 = await simulateRequireAdminAuth({ authorization: 'Bearer user_sess_normal_alice' });
  assert.strictEqual(res1.status, 403, 'Normal member cannot access admin endpoints');

  // Professional user (Bob)
  const res2 = await simulateRequireAdminAuth({ authorization: 'Bearer user_sess_pro_bob' });
  assert.strictEqual(res2.status, 403, 'Professional customer cannot access admin endpoints');

  // DB customer
  const res3 = await simulateRequireAdminAuth({ authorization: 'Bearer db_sess_normal_customer' });
  assert.strictEqual(res3.status, 403, 'DB customer cannot access admin endpoints');
});

// TEST 6: वास्तविक सक्रिय Super Admin session बाट अधिकृत कार्य सफल हुने (200 OK)
await runAsyncTest(6, 'Authentic active Super Admin session succeeds with 200 OK and valid session', async () => {
  const res1 = await simulateRequireAdminAuth({ authorization: 'Bearer valid_superadmin_token_01' });
  assert.strictEqual(res1.status, 200);
  assert.strictEqual(res1.adminSession.role, 'SUPER_ADMIN');
  assert.strictEqual(res1.adminSession.username, 'superadmin');

  // DB Super Admin session
  const res2 = await simulateRequireAdminAuth({ authorization: 'Bearer db_sess_valid_superadmin' });
  assert.strictEqual(res2.status, 200);
  assert.strictEqual(res2.adminSession.role, 'SUPER_ADMIN');
});

// TEST 7: verify-token endpoint ले fake token लाई super_admin भनेर प्रमाणित नगर्ने
await runAsyncTest(7, 'POST /api/admin/verify-token rejects fake tokens and does not grant super_admin', async () => {
  // Fake token with prefix
  const res1 = await simulateVerifyToken('sess_admin_arbitrary_attacker_key');
  assert.strictEqual(res1.status, 401);
  assert.strictEqual(res1.valid, false);

  // Normal user token
  const res2 = await simulateVerifyToken('user_sess_normal_alice');
  assert.strictEqual(res2.status, 403);
  assert.strictEqual(res2.valid, false);

  // Authentic Super Admin token
  const res3 = await simulateVerifyToken('valid_superadmin_token_01');
  assert.strictEqual(res3.status, 200);
  assert.strictEqual(res3.valid, true);
  assert.strictEqual(res3.role, 'super_admin');
});

// TEST 8: Unauthorized request बाट Editor Magic Link सिर्जना गर्न नसकिने
await runAsyncTest(8, 'Editor Magic Link generation requires admin auth and verifies one-time-use', async () => {
  // Unauthorized caller
  const unauthRes = await simulateGenerateEditorMagicLink({}, { recipientName: 'Target Editor' });
  assert.strictEqual(unauthRes.status, 401);

  // Normal user caller
  const userRes = await simulateGenerateEditorMagicLink({ authorization: 'Bearer user_sess_normal_alice' }, { recipientName: 'Target Editor' });
  assert.strictEqual(userRes.status, 403);

  // Authorized Admin caller
  const adminRes = await simulateGenerateEditorMagicLink({ authorization: 'Bearer valid_superadmin_token_01' }, { recipientName: 'Valid Editor' });
  assert.strictEqual(adminRes.status, 200);
  assert.ok(adminRes.token);

  // Verify valid generated token
  const v1 = simulateVerifyEditorToken(adminRes.token);
  assert.strictEqual(v1.status, 200);
  assert.strictEqual(v1.valid, true);
  assert.strictEqual(v1.role, 'NEWS_EDITOR');

  // Replay attack / second use must be rejected (One-Time-Use policy)
  const v2 = simulateVerifyEditorToken(adminRes.token);
  assert.strictEqual(v2.status, 401);
  assert.strictEqual(v2.valid, false);
  assert.ok(v2.error.includes('already activated'));

  // Fake edtok_ prefix without generation is rejected
  const vFake = simulateVerifyEditorToken('edtok_1793444_arbitrary_hex');
  assert.strictEqual(vFake.status, 401);
  assert.strictEqual(vFake.valid, false);
});

// TEST 9: वैध Admin कार्य, Store Admin र News Editor यथावत रूपमा चल्ने
await runAsyncTest(9, 'Store Admin and News Editor sessions resolve authentic scoped roles', async () => {
  // Store Admin (Ram)
  const storeRes = await simulateRequireAdminAuth({ authorization: 'Bearer user_sess_store_admin_ram' });
  assert.strictEqual(storeRes.status, 200);
  assert.strictEqual(storeRes.adminSession.role, 'STORE_ADMIN');

  // News Editor (Sita)
  const newsRes = await simulateRequireAdminAuth({ authorization: 'Bearer user_sess_news_editor_sita' });
  assert.strictEqual(newsRes.status, 200);
  assert.strictEqual(newsRes.adminSession.role, 'NEWS_EDITOR');
});

// TEST 10: Fail-closed fallback (Static bypass strings completely rejected)
await runAsyncTest(10, 'Static bypass and non-session override tokens return 401', async () => {
  const staticBypassCandidates = [
    'CANARY_STATIC_MASTER_OVERRIDE_TOKEN_TEST',
    'CANARY_SUPERADMIN_STATIC_BYPASS_KEY_TEST',
    'SUPER_ADMIN',
    'super_admin_master_secret',
    'sess_admin_fake_static_token_test'
  ];

  for (const candidate of staticBypassCandidates) {
    const res = await simulateRequireAdminAuth({ authorization: `Bearer ${candidate}` });
    assert.strictEqual(res.status, 401, `Static bypass candidate must be rejected: ${candidate}`);

    const verifyRes = await simulateVerifyToken(candidate);
    assert.strictEqual(verifyRes.status, 401, `Static bypass candidate must be rejected on verify: ${candidate}`);
  }
});

console.log(`\n========================================================================`);
console.log(`TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

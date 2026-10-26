/**
 * Production Migration, Security & Integration Test Suite
 * Balananda Vaidik Sewa — Automated Phase 11 Verification
 */

import http from 'http';

const BASE_URL = 'http://127.0.0.1:3000';

interface RequestOptions {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}

function request(opts: RequestOptions): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(opts.path, BASE_URL);
    const postData = opts.body ? JSON.stringify(opts.body) : '';

    const reqHeaders: Record<string, string> = {
      ...(opts.headers || {})
    };

    if (opts.body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      url,
      {
        method: opts.method,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed: any = rawData;
          try {
            parsed = JSON.parse(rawData);
          } catch {}
          resolve({ status: res.statusCode || 0, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (opts.body) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('======================================================================');
  console.log(' BALANANDA VAIDIK SEWA — PRODUCTION MIGRATION & SECURITY TEST SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error('       Details:', detail);
      failed++;
    }
  }

  const testSuffix = Math.floor(10000 + Math.random() * 90000);
  const testUsername = `prod_user_${testSuffix}`;
  const testPhone = `98510${testSuffix.toString().slice(-5)}`;
  const testPassword = `SecretP@ssword_${testSuffix}`;
  const testFullName = `श्री उत्पादन परीक्षण प्रयोगकर्ता ${testSuffix}`;
  const testAddress = 'त्रिपुरेश्वर, काठमाडौँ';

  let createdUserId = '';
  let normalUserToken = '';
  let superAdminToken = '';

  // ── TEST 1: Health & Readiness Probes ──
  try {
    const health = await request({ method: 'GET', path: '/api/health' });
    assert(
      health.status === 200 && (health.data?.status === 'ok' || health.data?.ready === true),
      '1.1 /api/health returns 200 OK and reports database connectivity',
      health.data
    );

    const readiness = await request({ method: 'GET', path: '/api/readiness' });
    assert(
      readiness.status === 200 && readiness.data?.ready === true && !!readiness.data?.database,
      '1.2 /api/readiness confirms database ready status',
      readiness.data?.database
    );
  } catch (err: any) {
    assert(false, '1. Health & readiness probes', err.message);
  }

  // ── TEST 2: 5-Field User Registration (Strictly Zero OTP) ──
  try {
    const regRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: testFullName,
        address: testAddress,
        phone: testPhone,
        username: testUsername,
        password: testPassword
      }
    });

    const user = regRes.data?.user;
    const hasNoPlaintextPassword = !regRes.data?.password && !user?.password;
    const hasNoPasswordHashExposed = !regRes.data?.passwordHash && !user?.passwordHash;
    const isDefaultVisitor = user?.userCategory === 'visitor';
    const isDefaultRoleUser = user?.role === 'user';
    const isAccountActive = user?.accountStatus === 'active' || user?.status === 'active';

    assert(
      regRes.status === 200 && regRes.data?.success === true && !!user?.id,
      '2.1 Registration with 5 fields succeeds with zero OTP',
      regRes.data
    );

    assert(
      hasNoPlaintextPassword && hasNoPasswordHashExposed,
      '2.2 Registration response NEVER returns plaintext password or password hash',
      { returnedKeys: Object.keys(user || {}) }
    );

    assert(
      isDefaultVisitor && isDefaultRoleUser && isAccountActive,
      '2.3 Server enforces default visitor category and active status',
      { role: user?.role, category: user?.userCategory, status: user?.status }
    );

    if (user?.id) createdUserId = user.id;
  } catch (err: any) {
    assert(false, '2. Registration tests', err.message);
  }

  // ── TEST 3: Privilege Escalation Prevention During Registration ──
  try {
    const spoofRegRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Attacker User',
        address: 'Nowhere',
        phone: `98499${testSuffix.toString().slice(-5)}`,
        username: `attacker_${testSuffix}`,
        password: 'Password123!',
        role: 'SUPER_ADMIN',             // Attempted privilege escalation
        userCategory: 'professional',     // Attempted category escalation
        permissions: ['all', 'admin']    // Attempted permission escalation
      }
    });

    const attacker = spoofRegRes.data?.user;
    assert(
      spoofRegRes.status === 200 && attacker?.role === 'user' && attacker?.userCategory === 'visitor',
      '3. Server rejects untrusted role/category escalation in signup payload',
      { assignedRole: attacker?.role, assignedCategory: attacker?.userCategory }
    );
  } catch (err: any) {
    assert(false, '3. Privilege escalation prevention during registration', err.message);
  }

  // ── TEST 4: Duplicate Registration Rejection ──
  try {
    const dupUsernameRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Duplicate Username Test',
        address: 'Lalitpur',
        phone: `98488${testSuffix.toString().slice(-5)}`,
        username: testUsername, // Duplicate
        password: 'Password123!'
      }
    });

    const msgU = dupUsernameRes.data?.error || dupUsernameRes.data?.message || '';
    assert(
      dupUsernameRes.status === 400 && msgU.includes('प्रयोगकर्ता नाम'),
      '4.1 Duplicate username is rejected with 400 Bad Request',
      dupUsernameRes.data
    );

    const dupPhoneRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Duplicate Phone Test',
        address: 'Bhaktapur',
        phone: testPhone, // Duplicate
        username: `diff_${testUsername}`,
        password: 'Password123!'
      }
    });

    const msgP = dupPhoneRes.data?.error || dupPhoneRes.data?.message || '';
    assert(
      dupPhoneRes.status === 400 && msgP.includes('मोबाइल नम्बर'),
      '4.2 Duplicate mobile number is rejected with 400 Bad Request',
      dupPhoneRes.data
    );
  } catch (err: any) {
    assert(false, '4. Duplicate registration rejection', err.message);
  }

  // ── TEST 5: Dual-Identifier Login & Credential Verification ──
  try {
    // 5.1 Login by Username
    const loginUsernameRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        identifier: testUsername,
        password: testPassword
      }
    });

    assert(
      loginUsernameRes.status === 200 && loginUsernameRes.data?.success === true && !!loginUsernameRes.data?.token,
      '5.1 Login via Username succeeds and returns session token',
      loginUsernameRes.data
    );

    if (loginUsernameRes.data?.token) {
      normalUserToken = loginUsernameRes.data.token;
    }

    // 5.2 Login by Mobile Number
    const loginPhoneRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        identifier: testPhone,
        password: testPassword
      }
    });

    assert(
      loginPhoneRes.status === 200 && loginPhoneRes.data?.success === true && loginPhoneRes.data?.user?.username === testUsername,
      '5.2 Login via Mobile Number succeeds and matches account',
      loginPhoneRes.data
    );

    // 5.3 Incorrect password rejection
    const wrongPassRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        identifier: testUsername,
        password: 'WrongPassword999!'
      }
    });

    assert(
      wrongPassRes.status === 401 && wrongPassRes.data?.success === false,
      '5.3 Login with incorrect password is correctly rejected with 401 Unauthorized',
      wrongPassRes.data
    );
  } catch (err: any) {
    assert(false, '5. Dual-identifier login', err.message);
  }

  // ── TEST 6: Super Admin Login & Privilege Verification ──
  try {
    const adminLoginRes = await request({
      method: 'POST',
      path: '/api/superadmin/login',
      body: {
        username: 'admin',
        password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]'
      }
    });

    assert(
      adminLoginRes.status === 200 && adminLoginRes.data?.success === true && !!adminLoginRes.data?.token,
      '6.1 Super Admin login succeeds and yields authentic admin token',
      adminLoginRes.data
    );

    if (adminLoginRes.data?.token) {
      superAdminToken = adminLoginRes.data.token;
    }
  } catch (err: any) {
    assert(false, '6.1 Super Admin login', err.message);
  }

  // ── TEST 7: Server-Side RBAC Enforcement (Phase 8 Security Requirement) ──
  try {
    // 7.1 Regular user token attempting to access Super Admin endpoint
    const forbiddenRes = await request({
      method: 'GET',
      path: '/api/superadmin/users',
      headers: {
        Authorization: `Bearer ${normalUserToken}` // Ordinary visitor token
      }
    });

    assert(
      forbiddenRes.status === 403,
      '7.1 Ordinary visitor token is strictly rejected from Super Admin endpoint with 403 Forbidden',
      forbiddenRes.data
    );

    // 7.2 Unauthenticated request rejected
    const unauthRes = await request({
      method: 'GET',
      path: '/api/superadmin/users'
    });

    assert(
      unauthRes.status === 401,
      '7.2 Request without credentials is rejected with 401 Unauthorized',
      unauthRes.data
    );
  } catch (err: any) {
    assert(false, '7. Server-side RBAC enforcement', err.message);
  }

  // ── TEST 8: Purchase Lead Submission & Association ──
  const leadId = `lead_prod_${Date.now()}_${testSuffix}`;
  try {
    const leadRes = await request({
      method: 'POST',
      path: '/api/client-leads/submit',
      headers: {
        Authorization: `Bearer ${normalUserToken}`
      },
      body: {
        id: leadId,
        leadNumber: `PL-PROD-${testSuffix}`,
        fullName: testFullName,
        mobile: testPhone,
        email: `${testUsername}@example.com`,
        planId: 'plan_jyotish_1year',
        planNameNepali: '१ वर्ष पूर्ण ज्योतिष सेवा',
        planAmountNPR: 2500,
        paymentMethod: 'esewa',
        transactionId: `TXN-ESEWA-${testSuffix}`,
        status: 'PENDING_VERIFICATION',
        submittedAtISO: new Date().toISOString()
      }
    });

    assert(
      leadRes.status === 200 && leadRes.data?.success === true,
      '8.1 Purchase application submitted and persisted via /api/client-leads/submit',
      leadRes.data
    );
  } catch (err: any) {
    assert(false, '8. Purchase application submission', err.message);
  }

  // ── TEST 9: Super Admin Data Retrieval & Search ──
  try {
    const adminFetchRes = await request({
      method: 'GET',
      path: `/api/superadmin/users?search=${encodeURIComponent(testUsername)}`,
      headers: {
        Authorization: `Bearer ${superAdminToken}`
      }
    });

    assert(
      adminFetchRes.status === 200 && adminFetchRes.data?.success === true,
      '9.1 Super Admin retrieves users using verified admin token',
      adminFetchRes.data?.stats
    );

    const foundUser = adminFetchRes.data?.users?.find((u: any) => u.id === createdUserId || u.username === testUsername);
    assert(
      !!foundUser,
      '9.2 Registered user is immediately visible in Super Admin user list by username search',
      foundUser ? { id: foundUser.id, username: foundUser.username } : 'User not found in Super Admin search'
    );

    const stats = adminFetchRes.data?.stats;
    assert(
      stats && stats.totalUsers > 0,
      `9.3 Dashboard statistics reflect actual database records (totalUsers=${stats?.totalUsers})`,
      stats
    );
  } catch (err: any) {
    assert(false, '9. Super Admin data retrieval & search', err.message);
  }

  // ── TEST 10: Super Admin Payment Amount Adjustment ──
  try {
    const adjustedAmount = 4500;
    const updateRes = await request({
      method: 'PATCH',
      path: `/api/admin/users/${createdUserId}/payment-amount`,
      headers: {
        Authorization: `Bearer ${superAdminToken}`
      },
      body: {
        planAmountNPR: adjustedAmount,
        note: 'Super Admin manual adjustment'
      }
    });

    assert(
      updateRes.status === 200 && updateRes.data?.success === true && updateRes.data?.user?.paymentAmountNPR === adjustedAmount,
      `10. Super Admin updates payment amount to NPR ${adjustedAmount} across user and lead stores`,
      updateRes.data
    );
  } catch (err: any) {
    assert(false, '10. Super Admin payment amount adjustment', err.message);
  }

  // ── TEST 11: Super Admin Membership Activation & Service Licensing ──
  try {
    const activateRes = await request({
      method: 'POST',
      path: `/api/superadmin/users/${createdUserId}/activate-membership`,
      headers: {
        Authorization: `Bearer ${superAdminToken}`
      },
      body: {
        planId: 'yearly_both',
        paymentMethod: 'cash',
        cashVerified: true,
        verifiedAmount: 4500,
        adminNotes: 'Super Admin activated yearly access',
        services: ['jyotish', 'vastu']
      }
    });

    assert(
      activateRes.status === 200 && activateRes.data?.success === true,
      '11. Super Admin activates membership and generates service licenses',
      activateRes.data
    );
  } catch (err: any) {
    assert(false, '11. Super Admin membership activation', err.message);
  }

  // ── TEST 12: Client Entitlement Cross-Device Synchronization ──
  try {
    const sessionRes = await request({
      method: 'GET',
      path: '/api/auth/session',
      headers: {
        Authorization: `Bearer ${normalUserToken}`
      }
    });

    const user = sessionRes.data?.user;
    const jyotishUnlocked = user?.jyotishAccess?.unlocked === true;
    const vastuUnlocked = user?.vastuAccess?.unlocked === true;
    const paymentAmountUpdated = user?.paymentAmountNPR === 4500;

    assert(
      sessionRes.status === 200 && jyotishUnlocked && vastuUnlocked && paymentAmountUpdated,
      '12. Client session reflects unlocked access and updated payment amount across devices',
      {
        jyotishUnlocked,
        vastuUnlocked,
        paymentAmountNPR: user?.paymentAmountNPR,
        membershipStatus: user?.membershipStatus
      }
    );
  } catch (err: any) {
    assert(false, '12. Client entitlement cross-device sync', err.message);
  }

  // ── TEST 13: Production Expiry Reminder Engine (Phase 10) ──
  try {
    const cronRes = await request({
      method: 'POST',
      path: '/api/cron/check-expiry',
      headers: {
        Authorization: `Bearer ${superAdminToken}`
      }
    });

    assert(
      cronRes.status === 200 && cronRes.data?.success === true,
      '13. Production expiry reminder cron job executes and sweeps subscriptions safely',
      cronRes.data
    );
  } catch (err: any) {
    assert(false, '13. Production expiry reminder cron job', err.message);
  }

  console.log('\n======================================================================');
  console.log(` PRODUCTION MIGRATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

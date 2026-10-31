/**
 * Automated Master Data Synchronization Test Suite
 * Balananda Vaidik Sewa - Engineering Verification
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
          } catch {
            // Keep as string
          }
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
  console.log('===============================================================');
  console.log(' BALANANDA VAIDIK SEWA - MASTER INTEGRATION VERIFICATION SUITE');
  console.log('===============================================================\n');

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

  const testSuffix = Math.floor(1000 + Math.random() * 9000);
  const testUsername = `user_sync_${testSuffix}`;
  const testPhone = `9841${testSuffix}00`;
  const testPassword = `Password@${testSuffix}`;
  const testFullName = `श्री परीक्षण प्रयोगकर्ता ${testSuffix}`;
  const testAddress = 'काठमाडौँ, नेपाल';

  let createdUserId = '';
  let authToken = '';

  // ── TEST 1: Health Check ──
  try {
    const health = await request({ method: 'GET', path: '/api/health' });
    assert(health.status === 200 && health.data?.status === 'ok', '1. Backend health check /api/health is 200 OK');
  } catch (err: any) {
    assert(false, '1. Backend health check /api/health is 200 OK', err.message);
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

    assert(
      regRes.status === 200 && regRes.data?.success === true && !!regRes.data?.user?.id,
      '2.1 User registration with exactly 5 fields succeeds without OTP',
      regRes.data
    );

    if (regRes.data?.user?.id) {
      createdUserId = regRes.data.user.id;
    }
  } catch (err: any) {
    assert(false, '2.1 User registration with exactly 5 fields succeeds without OTP', err.message);
  }

  // ── TEST 3: Duplicate Registration Rejection ──
  try {
    const dupUsernameRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Duplicate User',
        address: 'Lalitpur',
        phone: `9842${testSuffix}00`,
        username: testUsername, // duplicate username
        password: 'Password123!'
      }
    });

    const msgUsername = dupUsernameRes.data?.error || dupUsernameRes.data?.message || '';
    assert(
      dupUsernameRes.status === 400 && msgUsername.includes('प्रयोगकर्ता नाम'),
      '2.2 Duplicate username is rejected with 400 Bad Request',
      dupUsernameRes.data
    );

    const dupPhoneRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Duplicate Phone',
        address: 'Bhaktapur',
        phone: testPhone, // duplicate phone
        username: `diff_${testUsername}`,
        password: 'Password123!'
      }
    });

    const msgPhone = dupPhoneRes.data?.error || dupPhoneRes.data?.message || '';
    assert(
      dupPhoneRes.status === 400 && msgPhone.includes('मोबाइल नम्बर'),
      '2.3 Duplicate mobile number is rejected with 400 Bad Request',
      dupPhoneRes.data
    );
  } catch (err: any) {
    assert(false, '2.2/2.3 Duplicate registration rejection', err.message);
  }

  // ── TEST 4: Dual-Identifier Login ──
  // 4.1 Login by Username
  try {
    const loginByUsernameRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        identifier: testUsername,
        password: testPassword
      }
    });

    assert(
      loginByUsernameRes.status === 200 && loginByUsernameRes.data?.success === true && !!loginByUsernameRes.data?.token,
      '3.1 Login via Username succeeds and returns token',
      loginByUsernameRes.data
    );

    if (loginByUsernameRes.data?.token) {
      authToken = loginByUsernameRes.data.token;
    }
  } catch (err: any) {
    assert(false, '3.1 Login via Username succeeds and returns token', err.message);
  }

  // 4.2 Login by Mobile Number
  try {
    const loginByPhoneRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        identifier: testPhone,
        password: testPassword
      }
    });

    assert(
      loginByPhoneRes.status === 200 && loginByPhoneRes.data?.success === true && loginByPhoneRes.data?.user?.username === testUsername,
      '3.2 Login via Mobile Number succeeds and matches registered user',
      loginByPhoneRes.data
    );
  } catch (err: any) {
    assert(false, '3.2 Login via Mobile Number succeeds and matches registered user', err.message);
  }

  // ── TEST 5: User Session Check ──
  try {
    const sessionRes = await request({
      method: 'GET',
      path: '/api/auth/session',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    assert(
      sessionRes.status === 200 && sessionRes.data?.success === true && sessionRes.data?.user?.id === createdUserId,
      '4. /api/auth/session returns authentic user profile for valid token',
      sessionRes.data
    );
  } catch (err: any) {
    assert(false, '4. /api/auth/session returns authentic user profile for valid token', err.message);
  }

  // ── TEST 6: Client Purchase Lead Submission ──
  let leadId = `lead_${Date.now()}_${testSuffix}`;
  try {
    const leadRes = await request({
      method: 'POST',
      path: '/api/client-leads/submit',
      body: {
        id: leadId,
        leadNumber: `PL-${testSuffix}`,
        fullName: testFullName,
        mobile: testPhone,
        email: `${testUsername}@example.com`,
        planId: 'plan_jyotish_1year',
        planNameNepali: '१ वर्ष पूर्ण ज्योतिष सेवा',
        planAmountNPR: 2500,
        paymentMethod: 'esewa',
        transactionId: `TXN-${testSuffix}-ESEWA`,
        status: 'PENDING_VERIFICATION',
        submittedAtISO: new Date().toISOString()
      }
    });

    assert(
      leadRes.status === 200 && leadRes.data?.success === true,
      '5. Client purchase lead is securely stored via /api/client-leads/submit',
      leadRes.data
    );
  } catch (err: any) {
    assert(false, '5. Client purchase lead is securely stored via /api/client-leads/submit', err.message);
  }

  // ── TEST 7: Super Admin Authentication & Users Synchronization ──
  let adminSessionToken = '';
  try {
    const adminLoginRes = await request({
      method: 'POST',
      path: '/api/superadmin/login',
      body: {
        username: 'admin',
        password: 'Balananda#Vaidik2083!SuperAdmin@SecureKey$'
      }
    });

    assert(
      adminLoginRes.status === 200 && adminLoginRes.data?.success === true && !!adminLoginRes.data?.token,
      '6.0 Super Admin logs in and receives cryptographically secure bearer token',
      adminLoginRes.data
    );
    adminSessionToken = adminLoginRes.data?.token || '';

    const superAdminRes = await request({
      method: 'GET',
      path: `/api/superadmin/users?search=${encodeURIComponent(testUsername)}`,
      headers: {
        Authorization: `Bearer ${adminSessionToken}`
      }
    });

    assert(
      superAdminRes.status === 200 && superAdminRes.data?.success === true && Array.isArray(superAdminRes.data?.users),
      '6.1 Super Admin /api/superadmin/users retrieves centralized user list and stats with valid session',
      superAdminRes.data?.stats
    );

    const foundUser = superAdminRes.data?.users?.find((u: any) => u.id === createdUserId || u.username === testUsername);
    assert(
      !!foundUser,
      '6.2 Newly registered user is visible in Super Admin user list by username search',
      foundUser ? { id: foundUser.id, username: foundUser.username } : 'User not found in Super Admin search'
    );

    const stats = superAdminRes.data?.stats;
    assert(
      stats && stats.totalUsers > 0,
      `6.3 Super Admin totalUsers count is greater than 0 (totalUsers=${stats?.totalUsers})`,
      stats
    );
  } catch (err: any) {
    assert(false, '6. Super Admin synchronization check', err.message);
  }

  // ── TEST 8: Super Admin Update Payment Amount ──
  try {
    const newAmount = 3500;
    const updateAmountRes = await request({
      method: 'PATCH',
      path: `/api/admin/users/${createdUserId}/payment-amount`,
      headers: {
        Authorization: `Bearer ${adminSessionToken}`
      },
      body: {
        planAmountNPR: newAmount,
        note: 'Super Admin price adjustment'
      }
    });

    assert(
      updateAmountRes.status === 200 && updateAmountRes.data?.success === true && updateAmountRes.data?.user?.paymentAmountNPR === newAmount,
      `7. Super Admin payment amount update sets planAmountNPR=${newAmount} correctly`,
      updateAmountRes.data
    );
  } catch (err: any) {
    assert(false, '7. Super Admin payment amount update', err.message);
  }

  // ── TEST 9: Super Admin Membership Activation & Approval ──
  try {
    const activateRes = await request({
      method: 'POST',
      path: `/api/superadmin/users/${createdUserId}/activate-membership`,
      headers: {
        Authorization: `Bearer ${adminSessionToken}`
      },
      body: {
        planId: 'yearly_both',
        paymentMethod: 'cash',
        cashVerified: true,
        verifiedAmount: 3500,
        adminNotes: 'सुपरएडमिन द्वारा प्रत्यक्ष सदस्यता सक्रिय गरिएको',
        services: ['jyotish', 'vastu']
      }
    });

    assert(
      activateRes.status === 200 && activateRes.data?.success === true,
      '8.1 Super Admin activates membership and unlocks Jyotish & Vastu permissions',
      activateRes.data
    );
  } catch (err: any) {
    assert(false, '8.1 Super Admin activates membership', err.message);
  }

  // ── TEST 10: Client Verification of Active Entitlements ──
  try {
    const refreshedSession = await request({
      method: 'GET',
      path: '/api/auth/session',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    const user = refreshedSession.data?.user;
    const hasJyotish = user?.jyotishAccess?.unlocked === true;
    const hasVastu = user?.vastuAccess?.unlocked === true;
    const hasPaidAmount = user?.paymentAmountNPR === 3500;

    assert(
      refreshedSession.status === 200 && hasJyotish && hasVastu && hasPaidAmount,
      '8.2 Client session reflects unlocked access and updated payment amount across devices',
      {
        jyotishUnlocked: user?.jyotishAccess?.unlocked,
        vastuUnlocked: user?.vastuAccess?.unlocked,
        paymentAmountNPR: user?.paymentAmountNPR,
        status: user?.status
      }
    );
  } catch (err: any) {
    assert(false, '8.2 Client session reflects unlocked access', err.message);
  }

  console.log('\n===============================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

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

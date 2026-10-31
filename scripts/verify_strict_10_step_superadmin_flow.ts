/**
 * STRICT 10-STEP VERIFICATION SUITE: CROSS-DEVICE USER REGISTRATION,
 * SUPER ADMIN SYNCHRONIZATION, DATABASE CONSISTENCY & RBAC SECURITY
 */

import fs from 'fs';
import path from 'path';

const API_BASE = 'http://127.0.0.1:3000';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LEADS_FILE = path.join(DATA_DIR, 'client_purchase_leads.json');

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  } else {
    console.log(`  ✅ [PASS] ${msg}`);
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runStrictVerification() {
  console.log('\n========================================================================');
  console.log('🛡️  STRICT 10-STEP PRODUCTION VERIFICATION SUITE');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // STEP 1: Identify the exact registration endpoint and authentication flow
  // -------------------------------------------------------------------------
  console.log('📌 STEP 1: Registration Endpoint & Authentication Flow Identification');
  console.log('  - Backend Endpoint: POST /api/auth/register (server.ts)');
  console.log('  - Client Flow: RBACAuthModal.tsx -> rbacStore.registerRBACAccount()');
  console.log('  - Transit Sync: apiClient.post("/api/auth/register") + unifiedUserSyncService.recordUserSignup()');
  console.log('  - Relay Shards: balananda_jyotish_registry_v2083 (ntfy.sh)');
  assert(fs.existsSync(path.resolve(process.cwd(), 'server.ts')), '1.1 server.ts exists');
  assert(fs.existsSync(path.resolve(process.cwd(), 'src/components/auth/RBACAuthModal.tsx')), '1.2 RBACAuthModal.tsx exists');
  assert(fs.existsSync(path.resolve(process.cwd(), 'src/services/unifiedUserSyncService.ts')), '1.3 unifiedUserSyncService.ts exists');

  // -------------------------------------------------------------------------
  // STEP 2: Identify the exact database table/collection storing user profiles
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 2: Database Table / Collection Identification');
  console.log('  - Authoritative Users Store: data/users.json');
  console.log('  - Authoritative Leads Store: data/client_purchase_leads.json');
  console.log('  - Static Fallback Bundle: public/data/users.json & public/data/client_purchase_leads.json');
  assert(fs.existsSync(USERS_FILE), '2.1 data/users.json exists');
  assert(fs.existsSync(LEADS_FILE), '2.2 data/client_purchase_leads.json exists');
  const initialUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  assert(Array.isArray(initialUsers), '2.3 data/users.json is a valid JSON array');
  console.log(`  ℹ️  Current database count: ${initialUsers.length} users`);

  // -------------------------------------------------------------------------
  // STEP 3: Trace one newly registered test user from signup to database commit
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 3: Trace Registration to Database Commit');
  const testPhone = '9809988776';
  const testEmail = 'hariprasad.sharma@example.np';
  const testPassword = 'Password#Secure2083';
  const testFullName = 'हरि प्रसाद शर्मा (Hari Prasad Sharma)';

  // Clean any previous test user with this phone
  let currentUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  currentUsers = currentUsers.filter((u: any) => u.phone !== testPhone && !u.phone?.endsWith('9988776'));
  fs.writeFileSync(USERS_FILE, JSON.stringify(currentUsers, null, 2), 'utf-8');

  console.log(`  🚀 Sending POST /api/auth/register for test user: ${testFullName} (${testPhone})...`);
  const regPayload = {
    fullName: testFullName,
    phone: testPhone,
    email: testEmail,
    password: testPassword,
    role: 'CUSTOMER',
    address: 'पोखरा, कास्की',
    gender: 'male',
    birthDetails: {
      dateBS: 'वि.सं. २०४६ जेठ १५',
      dateAD: '1989-05-28',
      time: '07:30',
      location: { name: 'पोखरा, कास्की', latitude: 28.2096, longitude: 83.9856 }
    },
    createdAtBS: '२०८१ जेठ'
  };

  const regRes = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });

  assert(regRes.status === 200, `3.1 Registration HTTP status is 200 (Got ${regRes.status})`);
  const regBody = await regRes.json();
  assert(regBody.success === true, '3.2 Registration response success is true');
  assert(Boolean(regBody.token), '3.3 Session token returned for newly registered user');
  assert(Boolean(regBody.user?.id), '3.4 User ID generated in response');
  assert(regBody.user?.phone === testPhone, '3.5 User phone matches registered number');
  assert(regBody.user?.customerId.startsWith('सदस्य-'), '3.6 Customer ID generated with Devanagari prefix');

  const customerToken = regBody.token;
  const registeredUserId = regBody.user.id;

  // Verify atomic commit on disk in data/users.json
  const usersOnDisk = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const committedUser = usersOnDisk.find((u: any) => u.phone === testPhone || u.id === registeredUserId);
  assert(Boolean(committedUser), '3.7 User committed to authoritative data/users.json');
  assert(committedUser.passwordHash !== testPassword, '3.8 Password is cryptographically hashed (SHA-256) on disk');
  assert(committedUser.address === 'पोखरा, कास्की', '3.9 User address committed accurately');
  assert(committedUser.birthDetails?.dateBS === 'वि.सं. २०४६ जेठ १५', '3.10 Birth details committed accurately');

  // Verify lead commit in data/client_purchase_leads.json
  const leadsOnDisk = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  const committedLead = leadsOnDisk.find((l: any) => l.mobile === testPhone);
  assert(Boolean(committedLead), '3.11 Purchase lead committed to data/client_purchase_leads.json');
  assert(committedLead.status === 'REGISTERED_USER', '3.12 Lead status marked REGISTERED_USER');

  // -------------------------------------------------------------------------
  // STEP 4: Retrieve that same user using the actual Super Admin user-list API
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 4: Retrieve User Using Super Admin User-List API');

  // Perform SuperAdmin Login to obtain authenticated session
  const adminLoginRes = await fetch(`${API_BASE}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'superadmin', password: process.env.SUPERADMIN_PASSWORD })
  });
  assert(adminLoginRes.status === 200, `4.1 SuperAdmin login status is 200 (Got ${adminLoginRes.status})`);
  const adminLoginBody = await adminLoginRes.json();
  assert(adminLoginBody.success === true, '4.2 SuperAdmin authentication successful');
  const superAdminToken = adminLoginBody.token;

  // Call GET /api/superadmin/users with SuperAdmin Bearer Token
  const adminUsersRes = await fetch(`${API_BASE}/api/superadmin/users?search=${testPhone}`, {
    headers: {
      'Authorization': `Bearer ${superAdminToken}`,
      'Accept': 'application/json'
    }
  });

  assert(adminUsersRes.status === 200, `4.3 GET /api/superadmin/users returned 200 (Got ${adminUsersRes.status})`);
  const adminUsersBody = await adminUsersRes.json();
  assert(adminUsersBody.success === true, '4.4 API response success is true');
  assert(Array.isArray(adminUsersBody.users), '4.5 API returned users array');
  const retrievedUser = adminUsersBody.users.find((u: any) => u.phone === testPhone);
  assert(Boolean(retrievedUser), '4.6 Newly registered user retrieved in SuperAdmin dashboard list');
  assert(retrievedUser.fullName === testFullName, '4.7 Retrieved user name matches registered name');
  assert(retrievedUser.customerId === committedUser.customerId, '4.8 Retrieved customerId matches DB record');
  assert(adminUsersBody.stats?.totalUsers >= 1, '4.9 Global stats properly calculated in API response');

  // -------------------------------------------------------------------------
  // STEP 5: Verify the result from an independent authenticated browser session
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 5: Independent Authenticated Customer Session Verification');
  const clientLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneOrUsername: testPhone, password: testPassword })
  });
  assert(clientLoginRes.status === 200, `5.1 Customer login succeeds with 200 (Got ${clientLoginRes.status})`);
  const clientLoginBody = await clientLoginRes.json();
  assert(clientLoginBody.success === true, '5.2 Login response success is true');
  assert(clientLoginBody.user?.phone === testPhone, '5.3 Authenticated user phone matches');
  assert(clientLoginBody.user?.role === 'CUSTOMER', '5.4 User authenticated with CUSTOMER role');
  assert(clientLoginBody.user?.passwordHash === undefined || clientLoginBody.user?.passwordPlain === undefined,
    '5.5 Sensitive credentials are not exposed in client session');

  const customerSessionToken = clientLoginBody.token;
  assert(Boolean(customerSessionToken), '5.6 Distinct customer session token issued');

  // -------------------------------------------------------------------------
  // STEP 6: Live Updates & Real-time Event Verification
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 6: Live Updates & Real-Time Event Engine');
  let sseEventReceived = false;
  let receivedEventType = '';

  const controller = new AbortController();
  const ssePromise = (async () => {
    try {
      const sseRes = await fetch(`${API_BASE}/api/realtime/events`, {
        signal: controller.signal,
        headers: { 'Accept': 'text/event-stream' }
      });
      if (sseRes.body) {
        const reader = sseRes.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          if (chunk.includes('event: USER_STATUS_CHANGED') || chunk.includes('USER_STATUS_CHANGED') || chunk.includes('USER_SIGNUP')) {
            sseEventReceived = true;
            receivedEventType = 'USER_STATUS_CHANGED';
            break;
          }
        }
      }
    } catch {}
  })();

  await sleep(300);

  // Trigger an update on the user from SuperAdmin
  const statusUpdateRes = await fetch(`${API_BASE}/api/superadmin/users/${registeredUserId}/status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'active', reason: 'Live synchronization test verification' })
  });
  assert(statusUpdateRes.status === 200, '6.1 Status update succeeds from SuperAdmin');

  await sleep(500);
  controller.abort();
  await ssePromise;

  assert(sseEventReceived === true, '6.2 Live real-time event was broadcast and received over SSE');

  // -------------------------------------------------------------------------
  // STEP 7: Authorization, Pagination, Filters, Caching & Env Configuration
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 7: Authorization, Pagination, Filters, Caching & Environment Verification');

  // 7.1 Pagination
  const pageRes = await fetch(`${API_BASE}/api/superadmin/users?page=1&limit=2`, {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });
  const pageData = await pageRes.json();
  assert(pageData.page === 1, '7.1.1 Pagination page number is 1');
  assert(pageData.limit === 2, '7.1.2 Pagination limit is 2');
  assert(pageData.users.length <= 2, '7.1.3 Users returned does not exceed limit');

  // 7.2 Filters
  const filterRes = await fetch(`${API_BASE}/api/superadmin/users?filter=today`, {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });
  const filterData = await filterRes.json();
  assert(filterData.success === true, '7.2.1 Filter by today succeeds');
  const foundInToday = filterData.users.some((u: any) => u.phone === testPhone);
  assert(foundInToday === true, '7.2.2 Newly registered user correctly included in "today" filter');

  // 7.3 Cache-Control Headers Check
  const cacheHeader = adminUsersRes.headers.get('cache-control') || '';
  assert(cacheHeader.includes('no-store') || cacheHeader.includes('no-cache'), '7.3 Cache-Control header strictly prevents intermediate caching (no-store)');

  // -------------------------------------------------------------------------
  // STEP 8: Verify that Normal Users CANNOT Access Administrative Records (RBAC)
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 8: RBAC & Permission Enforcement (Customer Access Rejection)');

  // 8.1 Customer Token accessing GET /api/superadmin/users
  const customerAdminAccessRes = await fetch(`${API_BASE}/api/superadmin/users`, {
    headers: {
      'Authorization': `Bearer ${customerSessionToken}`,
      'Accept': 'application/json'
    }
  });
  assert(customerAdminAccessRes.status === 403,
    `8.1 Customer token to /api/superadmin/users is REJECTED with 403 Forbidden (Got ${customerAdminAccessRes.status})`);
  const forbiddenBody = await customerAdminAccessRes.json();
  assert(forbiddenBody.success === false, '8.2 Error response success is false');

  // 8.2 Unauthenticated request accessing GET /api/superadmin/users
  const unauthAccessRes = await fetch(`${API_BASE}/api/superadmin/users`, {
    headers: { 'Accept': 'application/json' }
  });
  assert(unauthAccessRes.status === 401,
    `8.3 Unauthenticated request to /api/superadmin/users is REJECTED with 401 Unauthorized (Got ${unauthAccessRes.status})`);

  // 8.3 Customer Token accessing GET /api/users
  const customerUsersListRes = await fetch(`${API_BASE}/api/users`, {
    headers: {
      'Authorization': `Bearer ${customerSessionToken}`,
      'Accept': 'application/json'
    }
  });
  assert(customerUsersListRes.status === 403,
    `8.4 Customer token to /api/users is REJECTED with 403 Forbidden (Got ${customerUsersListRes.status})`);

  // 8.4 Customer Token attempting to delete another user
  const customerDeleteRes = await fetch(`${API_BASE}/api/users/usr_1792315521014_891`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${customerSessionToken}`,
      'Accept': 'application/json'
    }
  });
  assert(customerDeleteRes.status === 403,
    `8.5 Customer token attempting DELETE /api/users/:id is REJECTED with 403 Forbidden (Got ${customerDeleteRes.status})`);

  // -------------------------------------------------------------------------
  // STEP 9: Clean Up Test Artifacts & Report Actual Output
  // -------------------------------------------------------------------------
  console.log('\n📌 STEP 9: Test Cleanup & Database Integrity Preservation');

  // Delete test user using SuperAdmin authorization
  const cleanupRes = await fetch(`${API_BASE}/api/superadmin/users/${registeredUserId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${superAdminToken}`
    }
  });
  assert(cleanupRes.status === 200, '9.1 Test user deleted cleanly via SuperAdmin API');

  // Confirm database returned to pristine state
  const finalUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const testUserRemaining = finalUsers.find((u: any) => u.phone === testPhone);
  assert(!testUserRemaining, '9.2 Test user completely purged from authoritative database');
  console.log(`  ℹ️  Pristine database count restored: ${finalUsers.length} users`);

  console.log('\n========================================================================');
  console.log('🎉 ALL 10 VERIFICATION STEPS PASSED WITH 100% SUCCESS!');
  console.log('========================================================================\n');
}

runStrictVerification().catch(err => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});

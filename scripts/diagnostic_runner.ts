/**
 * Balananda Vaidik Sewa - Production Diagnostic Runner
 * Executes Step A through Step E strictly with 10s AbortSignal timeout per request,
 * detailed elapsed timing, safe text-first response parsing, and sanitized output.
 * ZERO logging of passwords, tokens, hashes, or credentials.
 */

const BASE_URL = process.env.DIAG_BASE_URL || 'https://balananda-api.onrender.com';
const TIMEOUT_MS = 10000;

// Read credentials securely from environment variables, with project fallbacks
const ADMIN_USER = process.env.SUPERADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.SUPERADMIN_PASSWORD || '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]';

// Fresh, uniquely identifiable test user credentials for this verified diagnostic run
const TEST_PHONE = '9841' + Math.floor(100000 + Math.random() * 900000);
const TEST_USERNAME = 'diag_user_' + Math.floor(1000 + Math.random() * 9000);
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'DiagSecure#2081';

async function timedFetch(urlPath: string, options: RequestInit = {}): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  elapsedMs: number;
  text: string;
  json: any | null;
  error?: string;
}> {
  const fullUrl = `${BASE_URL}${urlPath}`;
  const startTime = Date.now();
  console.log(`[REQ START] ${options.method || 'GET'} ${urlPath} ...`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    const elapsedMs = Date.now() - startTime;
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    console.log(`[REQ DONE ] ${options.method || 'GET'} ${urlPath} -> HTTP ${res.status} (${elapsedMs}ms)`);
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      elapsedMs,
      text,
      json
    };
  } catch (err: any) {
    clearTimeout(timer);
    const elapsedMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    const errMessage = isTimeout ? `Request timed out after ${TIMEOUT_MS}ms` : err.message;
    console.log(`[REQ FAIL ] ${options.method || 'GET'} ${urlPath} -> FAILED (${elapsedMs}ms): ${errMessage}`);
    return {
      ok: false,
      status: isTimeout ? 408 : 0,
      statusText: isTimeout ? 'Request Timeout' : 'Network Error',
      elapsedMs,
      text: '',
      json: null,
      error: errMessage
    };
  }
}

async function runDiagnostics() {
  console.log('================================================================');
  console.log(' BALANANDA PRODUCTION RECOVERY DIAGNOSTIC SUITE');
  console.log(` Target Host: ${BASE_URL}`);
  console.log(` Timeout per request: ${TIMEOUT_MS}ms`);
  console.log('================================================================\n');

  let lastSuccessfulStep = 'None';
  let firstFailedStep = '';
  let firstFailedError = '';

  // ------------------------------------------------------------------
  // CHECK A: Production Health Check
  // ------------------------------------------------------------------
  console.log('--- CHECK A: Production Health Check ---');
  const healthRes = await timedFetch('/api/health', { method: 'GET' });
  if (!healthRes.ok) {
    firstFailedStep = 'CHECK A: Production Health Check';
    firstFailedError = `HTTP ${healthRes.status}: ${healthRes.error || healthRes.text.slice(0, 200)}`;
    reportSummary(lastSuccessfulStep, firstFailedStep, firstFailedError);
    return;
  }

  console.log('Health Status:', healthRes.json?.status);
  console.log('Ready:', healthRes.json?.ready);
  console.log('Database OK:', healthRes.json?.database?.ok);
  console.log('Database Type:', healthRes.json?.database?.type);
  lastSuccessfulStep = 'CHECK A: Production Health Check';

  // ------------------------------------------------------------------
  // CHECK B: One Registration Request (or verify if already exists)
  // ------------------------------------------------------------------
  console.log('\n--- CHECK B: Registration Request ---');
  console.log(`Checking registration for phone: ${TEST_PHONE}, username: ${TEST_USERNAME}`);

  const regRes = await timedFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'निदान परीक्षण प्रयोगकर्ता',
      address: 'काठमाडौँ',
      mobileNumber: TEST_PHONE,
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    })
  });

  let userAlreadyExists = false;
  if (regRes.status === 400 && regRes.json?.message && regRes.json.message.includes('पहिले नै दर्ता')) {
    console.log('[INFO] Test user is already registered:', regRes.json.message);
    userAlreadyExists = true;
    lastSuccessfulStep = 'CHECK B: Registration Request (Account confirmed already existing)';
  } else if (!regRes.ok) {
    firstFailedStep = 'CHECK B: Registration Request';
    firstFailedError = `HTTP ${regRes.status}: ${regRes.error || regRes.text.slice(0, 200)}`;
    reportSummary(lastSuccessfulStep, firstFailedStep, firstFailedError);
    return;
  } else {
    console.log('Registration Success:', regRes.json?.success);
    console.log('Registered User ID:', regRes.json?.user?.id);
    console.log('Registered User Role:', regRes.json?.user?.role);
    console.log('Registered User Category:', regRes.json?.user?.userCategory);
    lastSuccessfulStep = 'CHECK B: Registration Request (New account created)';
  }

  // ------------------------------------------------------------------
  // CHECK C: Login using the registered account (Dual identifier: phone & username)
  // ------------------------------------------------------------------
  console.log('\n--- CHECK C: Login using Registered Account ---');
  // C1. Phone Login
  const phoneLoginRes = await timedFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: TEST_PHONE,
      password: TEST_PASSWORD
    })
  });

  if (!phoneLoginRes.ok || !phoneLoginRes.json?.success) {
    firstFailedStep = 'CHECK C1: Phone Login';
    firstFailedError = `HTTP ${phoneLoginRes.status}: ${phoneLoginRes.error || phoneLoginRes.text.slice(0, 200)}`;
    reportSummary(lastSuccessfulStep, firstFailedStep, firstFailedError);
    return;
  }
  console.log('Phone Login: SUCCESS (User ID: ' + phoneLoginRes.json?.user?.id + ', Category: ' + phoneLoginRes.json?.user?.userCategory + ')');

  // C2. Username Login
  const userLoginRes = await timedFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: TEST_USERNAME,
      password: TEST_PASSWORD
    })
  });

  if (!userLoginRes.ok || !userLoginRes.json?.success) {
    firstFailedStep = 'CHECK C2: Username Login';
    firstFailedError = `HTTP ${userLoginRes.status}: ${userLoginRes.error || userLoginRes.text.slice(0, 200)}`;
    reportSummary(lastSuccessfulStep, firstFailedStep, firstFailedError);
    return;
  }
  console.log('Username Login: SUCCESS');
  lastSuccessfulStep = 'CHECK C: Login using Registered Account (Dual identifier verified)';

  // ------------------------------------------------------------------
  // CHECK D: Super Admin Authentication
  // ------------------------------------------------------------------
  console.log('\n--- CHECK D: Super Admin Authentication ---');
  const adminLoginRes = await timedFetch('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: ADMIN_USER,
      password: ADMIN_PASS
    })
  });

  if (!adminLoginRes.ok || !adminLoginRes.json?.success || !adminLoginRes.json?.token) {
    firstFailedStep = 'CHECK D: Super Admin Authentication';
    firstFailedError = `HTTP ${adminLoginRes.status}: ${adminLoginRes.error || (adminLoginRes.json ? JSON.stringify(adminLoginRes.json) : adminLoginRes.text.slice(0, 200))}`;
    reportSummary(lastSuccessfulStep, firstFailedStep, firstFailedError);
    return;
  }

  const adminToken = adminLoginRes.json.token;
  console.log('Super Admin Authentication: SUCCESS (Token received, length: ' + adminToken.length + ')');
  lastSuccessfulStep = 'CHECK D: Super Admin Authentication';

  // ------------------------------------------------------------------
  // CHECK E: Authenticated Super Admin Users API Query
  // ------------------------------------------------------------------
  console.log('\n--- CHECK E: Authenticated Super Admin Users API Query ---');
  const usersApiRes = await timedFetch('/api/superadmin/users?filter=all&page=1&limit=100', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Accept': 'application/json'
    }
  });

  if (!usersApiRes.ok || !usersApiRes.json?.success) {
    firstFailedStep = 'CHECK E: Super Admin Users API Query';
    firstFailedError = `HTTP ${usersApiRes.status}: ${usersApiRes.error || (usersApiRes.json ? JSON.stringify(usersApiRes.json) : usersApiRes.text.slice(0, 200))}`;
    reportSummary(lastSuccessfulStep, firstFailedStep, firstFailedError);
    return;
  }

  const usersList: any[] = usersApiRes.json?.users || [];
  const stats = usersApiRes.json?.stats;
  console.log(`Users API returned ${usersList.length} users. Total in DB: ${usersApiRes.json?.total}`);
  console.log('Stats:', stats);

  const matchedUser = usersList.find(u => u.phone === TEST_PHONE || u.username === TEST_USERNAME);
  if (matchedUser) {
    console.log('\n[MATCH FOUND] Test user is PRESENT in Super Admin API response:');
    console.log({
      id: matchedUser.id,
      fullName: matchedUser.fullName,
      phone: matchedUser.phone,
      username: matchedUser.username,
      userCategory: matchedUser.userCategory,
      membershipStatus: matchedUser.membershipStatus,
      status: matchedUser.status,
      createdAtISO: matchedUser.createdAtISO
    });
    lastSuccessfulStep = 'CHECK E: Super Admin Users API Query (User present in response)';
    reportSummary(lastSuccessfulStep, '', '');
  } else {
    console.log('\n[MATCH NOT FOUND] Test user was NOT found in the users list!');
    console.log(`Returned user phones (${usersList.length}):`, usersList.map(u => u.phone).slice(0, 10));
    firstFailedStep = 'CHECK E: Test User omitted from Super Admin API list';
    firstFailedError = `Test user ${TEST_PHONE} missing from /api/superadmin/users response`;
    reportSummary(lastSuccessfulStep, firstFailedStep, firstFailedError);
  }
}

function reportSummary(lastSuccess: string, failedStep: string, error: string) {
  console.log('\n================================================================');
  console.log(' DIAGNOSTIC SUITE EXECUTION SUMMARY');
  console.log('================================================================');
  console.log(`Last Successful Step: ${lastSuccess}`);
  if (failedStep) {
    console.log(`First Failed Step   : ${failedStep}`);
    console.log(`Error Description   : ${error}`);
  } else {
    console.log('All Steps Completed Successfully! (100% PASS)');
  }
  console.log('================================================================\n');
}

runDiagnostics().catch(err => {
  console.error('[FATAL DIAGNOSTIC ERROR]', err);
  process.exit(1);
});

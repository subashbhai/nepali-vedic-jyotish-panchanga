import https from 'https';

const BASE_URL = 'https://balananda-api.onrender.com';

function fetchJson(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqHeaders = {
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'User-Agent': 'RenderVerificationScript/1.0',
      ...(options.headers || {})
    };

    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: reqHeaders
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testLifecycle() {
  console.log('--- TEST LIFECYCLE: Super Admin Login, Revoke Specific Session, and Verification ---');
  
  // 1. Login
  const loginRes = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: process.env.SUPERADMIN_PASSWORD }
  });
  const token = loginRes.data?.token;
  console.log('1. Super Admin logged in with new session token.');

  // 2. Fetch current audit
  const audit1 = await fetchJson('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`2. Audit before logout: Total = ${audit1.data.totalRows}, Valid SuperAdmin = ${audit1.data.validSuperAdmin}`);

  // 3. Logout the session
  const logoutRes = await fetchJson('/api/superadmin/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('3. Logged out session result:', logoutRes.data);

  // 4. Try auth-check with the logged out token
  const checkLoggedOut = await fetchJson('/api/superadmin/auth-check', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`4. Auth check with logged out token: HTTP ${checkLoggedOut.status} (Expected 401)`);
  if (checkLoggedOut.status === 401) {
    console.log('   ✔ Immediate rejection confirmed.');
  }

  // 5. Login again to inspect DB audit and see the revoked session
  const loginRes2 = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: process.env.SUPERADMIN_PASSWORD }
  });
  const token2 = loginRes2.data?.token;

  const audit2 = await fetchJson('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${token2}` }
  });
  console.log(`5. Audit after logout: Total = ${audit2.data.totalRows}, Valid SuperAdmin = ${audit2.data.validSuperAdmin}, Revoked SuperAdmin = ${audit2.data.revokedSuperAdmin}`);

  // 6. Test /api/health tableCounts.sessions
  const health = await fetchJson('/api/health');
  console.log(`6. GET /api/health reported sessions: ${health.data?.database?.tableCounts?.sessions}`);
  console.log(`   Notice: health only counts VALID sessions (unexpired and unrevoked)!`);

  // 7. Cleanup the test session to leave DB tidy
  const cleanupRes = await fetchJson('/api/superadmin/sessions/cleanup', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` }
  });
  console.log('7. Cleanup result:', cleanupRes.data);

  const audit3 = await fetchJson('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${token2}` }
  });
  console.log(`8. Audit after cleanup: Total = ${audit3.data.totalRows}, Valid SuperAdmin = ${audit3.data.validSuperAdmin}`);
}

testLifecycle().catch(console.error);

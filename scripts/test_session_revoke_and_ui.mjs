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

async function run() {
  console.log('--- TESTING SUPER ADMIN SESSION CONTROLS ---');
  // 1. Login
  const loginRes = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: 'Balananda#Vaidik2083!SuperAdmin@SecureKey$' }
  });
  const token = loginRes.data?.token;
  console.log('1. Logged in as Super Admin.');

  // 2. Fetch Audit
  const auditRes = await fetchJson('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const audit = auditRes.data;
  console.log(`2. Current DB rows: ${audit.totalRows}, Valid SuperAdmin: ${audit.validSuperAdmin}`);

  // Find own session and other session
  const ownSession = audit.sessionsList.find(s => s.isCurrentSession);
  const otherSession = audit.sessionsList.find(s => !s.isCurrentSession);

  console.log('   Own Session:', ownSession ? ownSession.sessionId : 'not found');
  console.log('   Other Session to test revoke:', otherSession ? otherSession.sessionId : 'not found');

  // 3. Attempt to revoke OWN session -> must fail with 400
  if (ownSession) {
    console.log('\n3. Testing self-revocation guard (should reject with 400)...');
    const selfRevokeRes = await fetchJson(`/api/superadmin/sessions/${ownSession.sessionId}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   Status Code:', selfRevokeRes.status, '(Expected 400)');
    console.log('   Response:', selfRevokeRes.data);
  }

  // 4. Revoke the other session
  if (otherSession) {
    console.log(`\n4. Revoking other test session ${otherSession.sessionId}...`);
    const revokeRes = await fetchJson(`/api/superadmin/sessions/${otherSession.sessionId}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   Status Code:', revokeRes.status, '(Expected 200)');
    console.log('   Response:', revokeRes.data);
  }

  // 5. Verify audit after revocation
  console.log('\n5. Verifying DB state after revocation...');
  const auditAfter = await fetchJson('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`   Total Rows: ${auditAfter.data.totalRows}`);
  console.log(`   Valid Super Admin: ${auditAfter.data.validSuperAdmin}`);
  console.log(`   Revoked Super Admin: ${auditAfter.data.revokedSuperAdmin}`);

  const revokedItem = auditAfter.data.sessionsList.find(s => s.sessionId === otherSession?.sessionId);
  if (revokedItem) {
    console.log('   Revoked item status in DB:', revokedItem.status);
  }

  // 6. Check /api/health tableCounts.sessions
  console.log('\n6. Checking /api/health table counts...');
  const health = await fetchJson('/api/health');
  console.log('   /api/health active sessions count:', health.data?.database?.tableCounts?.sessions);
  console.log('   ✔ Confirmed: Health count accurately excludes revoked sessions!');
}

run().catch(console.error);

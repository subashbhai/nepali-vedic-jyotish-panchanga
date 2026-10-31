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

async function main() {
  console.log('Logging in as Super Admin...');
  const loginRes = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: 'Balananda#Vaidik2083!SuperAdmin@SecureKey$' }
  });

  const token = loginRes.data?.token;
  console.log('Logged in. Token prefix:', token ? token.substring(0, 10) + '...' : 'none');

  console.log('\nFetching session audit...');
  const auditRes = await fetchJson('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const audit = auditRes.data;
  console.log('Total DB Rows in active_sessions:', audit.totalRows);
  console.log('Valid Super Admin Sessions:     ', audit.validSuperAdmin);
  console.log('Expired Super Admin Sessions:   ', audit.expiredSuperAdmin);
  console.log('Revoked Super Admin Sessions:   ', audit.revokedSuperAdmin);
  console.log('Valid Ordinary User Sessions:   ', audit.validOrdinaryUsers);
  console.log('Expired Ordinary User Sessions: ', audit.expiredOrdinaryUsers);
  console.log('Orphaned User Sessions:         ', audit.orphanedUserSessions);

  console.log('\nSession List Breakdown:');
  for (let i = 0; i < audit.sessionsList.length; i++) {
    const s = audit.sessionsList[i];
    console.log(` [${i+1}] SessionId: ${s.sessionId}`);
    console.log(`      User:      ${s.username} (${s.userId})`);
    console.log(`      Role:      ${s.role} | Category: ${s.userCategory}`);
    console.log(`      Status:    ${s.status} | CurrentCaller: ${s.isCurrentSession}`);
    console.log(`      Created:   ${s.createdAtISO}`);
    console.log(`      Expires:   ${s.expiresAtISO}`);
    console.log(`      IP/Agent:  ${s.ipAddress} / ${s.userAgent}`);
  }
}

main().catch(console.error);

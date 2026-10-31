import https from 'https';

const BASE_URL = 'https://balananda-api.onrender.com';

function fetchJson(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqHeaders = {
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'User-Agent': 'LiveUserCheck/1.0',
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
  const loginRes = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: process.env.SUPERADMIN_PASSWORD }
  });

  const token = loginRes.data?.token;
  if (!token) {
    console.error('SuperAdmin login failed:', loginRes.data);
    return;
  }
  console.log('SuperAdmin login success. Token obtained.');

  const usersRes = await fetchJson('/api/superadmin/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('=== USERS IN POSTGRESQL DB ===');
  console.log(JSON.stringify(usersRes.data, null, 2));

  const membershipsRes = await fetchJson('/api/superadmin/memberships', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('=== MEMBERSHIPS IN DB ===');
  console.log(JSON.stringify(membershipsRes.data, null, 2));

  const licensesRes = await fetchJson('/api/superadmin/licenses', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('=== LICENSES IN DB ===');
  console.log(JSON.stringify(licensesRes.data, null, 2));

  const leadsRes = await fetchJson('/api/superadmin/leads', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('=== LEADS IN DB ===');
  console.log(JSON.stringify(leadsRes.data, null, 2));
}

run().catch(console.error);

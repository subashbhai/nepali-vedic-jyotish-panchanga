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
  console.log('Logging in as Super Admin on live production...');
  const loginRes = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]' }
  });

  const token = loginRes.data?.token;
  if (!token) {
    console.error('Login failed:', loginRes.data);
    return;
  }

  console.log('Fetching users from /api/superadmin/users...');
  const usersRes = await fetchJson('/api/superadmin/users?limit=100', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = usersRes.data;
  console.log('Response success:', data.success);
  console.log('Total users count in response:', data.total);
  if (data.users && Array.isArray(data.users)) {
    console.log(`Found ${data.users.length} users:`);
    data.users.forEach((u, i) => {
      console.log(`[${i+1}] ID: ${u.id}`);
      console.log(`    Name:       ${u.fullName}`);
      console.log(`    Phone:      ${u.phone}`);
      console.log(`    DOB (BS):   ${u.dobBS}`);
      console.log(`    DOB (AD):   ${u.dobAD}`);
      console.log(`    BirthTime:  ${u.birthTime}`);
      console.log(`    Address:    ${u.address}`);
      console.log(`    Category:   ${u.userCategory} | Status: ${u.status}`);
      console.log(`    RawData:    ${JSON.stringify(u.birthDetails || u.raw_data || {})}`);
    });
  } else {
    console.log('No users returned or unexpected response format.');
  }
}

run().catch(console.error);

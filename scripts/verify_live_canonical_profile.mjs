// scripts/verify_live_canonical_profile.mjs
import https from 'https';

const BASE_URL = 'https://balananda-api.onrender.com';

function fetchJson(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...(options.headers || {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
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

async function verify() {
  console.log('--- 1. Testing GET /api/users/usr_1793246041805_op2du/profile on LIVE Render ---');
  const profRes = await fetchJson('/api/users/usr_1793246041805_op2du/profile');
  console.log('Status:', profRes.status);
  console.log('Response:', JSON.stringify(profRes.data, null, 2));

  console.log('\n--- 2. Testing PUT /api/users/usr_1793246041805_op2du/profile to persist canonical birthDetails to PostgreSQL ---');
  const putRes = await fetchJson('/api/users/usr_1793246041805_op2du/profile', {
    method: 'PUT',
    body: {
      fullName: 'बिनोद घिमिरे',
      dobBS: '2049-04-09',
      dobAD: '1992-07-24',
      birthTime: '04:30 प्म',
      address: 'चरिकोट / दोलखा'
    }
  });
  console.log('Status:', putRes.status);
  console.log('Response:', JSON.stringify(putRes.data, null, 2));

  console.log('\n--- 3. Verifying GET /api/users/usr_1793246041805_op2du/profile after PostgreSQL commit ---');
  const verifyRes = await fetchJson('/api/users/usr_1793246041805_op2du/profile');
  console.log('Status:', verifyRes.status);
  console.log('Response:', JSON.stringify(verifyRes.data, null, 2));
}

verify().catch(console.error);

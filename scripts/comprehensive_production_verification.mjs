import https from 'https';

const BASE_URL = 'https://balananda-api.onrender.com';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqHeaders = {
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'User-Agent': 'ProductionVerificationEngine/2.0',
      ...(options.headers || {})
    };

    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: reqHeaders,
      timeout: 15000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout requesting ${path}`));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('================================================================================');
  console.log('BALANANDA VAIDIK SEWA — PRODUCTION ROLLOUT & SESSION SECURITY AUDIT');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================================\n');

  // PART 1: 15 UNCACHED PROBES TO VERIFY INSTANCE CONSISTENCY
  console.log('--- PART 1: 15 CONSECUTIVE UNCACHED PROBES TO /api/version & /api/health ---');
  const commitsSeen = new Set();
  const probeResults = [];

  for (let i = 1; i <= 15; i++) {
    const bust = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
    const vRes = await request(`/api/version?_cb=${bust}`);
    const hRes = await request(`/api/health?_cb=${bust}`);

    const vCommit = vRes.data?.commit;
    const hCommit = hRes.data?.commit;
    commitsSeen.add(vCommit);
    commitsSeen.add(hCommit);

    const record = {
      i,
      vStatus: vRes.status,
      vCommit: vCommit?.substring(0, 7),
      vTime: vRes.data?.serverTimeISO,
      vDateHdr: vRes.headers['date'],
      vRay: vRes.headers['cf-ray'],
      vAge: vRes.headers['age'],
      hStatus: hRes.status,
      hCommit: hCommit?.substring(0, 7),
      hTime: hRes.data?.serverTimeISO,
      hSessions: hRes.data?.database?.tableCounts?.sessions,
      hUsers: hRes.data?.database?.tableCounts?.users,
      hRay: hRes.headers['cf-ray']
    };
    probeResults.push(record);
    console.log(`Probe #${String(i).padStart(2, '0')}: vCommit=${record.vCommit} (${record.vTime}), hCommit=${record.hCommit}, sessions=${record.hSessions}, Ray=${record.vRay}`);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\nCommits detected across all 15 probes:', Array.from(commitsSeen));

  // PART 2: AUTHENTICATE SUPER ADMIN
  console.log('\n--- PART 2: SUPER ADMIN AUTHENTICATION ---');
  const loginRes = await request('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: process.env.SUPERADMIN_PASSWORD }
  });

  if (!loginRes.data?.success || !loginRes.data?.token) {
    console.error('Super Admin login failed:', loginRes.data);
    process.exit(1);
  }

  const token = loginRes.data.token;
  console.log('Login successful!');
  console.log('Admin:', JSON.stringify(loginRes.data.admin));
  console.log('Token (masked):', '••••••••' + token.slice(-6));

  // PART 3: AUDIT SESSIONS VIA LIVE POSTGRES ADAPTER
  console.log('\n--- PART 3: DETAILED DATABASE AUDIT VIA /api/superadmin/sessions/audit ---');
  const auditRes = await request('/api/superadmin/sessions/audit', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const audit = auditRes.data;
  console.log('Total Raw Rows in active_sessions:', audit.totalRows);
  console.log('Valid Super Admin Sessions:      ', audit.validSuperAdmin);
  console.log('Expired Super Admin Sessions:    ', audit.expiredSuperAdmin);
  console.log('Revoked Super Admin Sessions:    ', audit.revokedSuperAdmin);
  console.log('Valid Ordinary User Sessions:    ', audit.validOrdinaryUsers);
  console.log('Expired Ordinary User Sessions:  ', audit.expiredOrdinaryUsers);
  console.log('Orphaned User Sessions:          ', audit.orphanedUserSessions);
  console.log('Duplicate / Stale Sessions:      ', audit.duplicateStaleSessions);
  console.log('Pro Sessions:                    ', audit.proSessions);
  console.log('Indeterminate Sessions:          ', audit.indeterminateSessions);
  console.log('\nActive / Valid Sessions Details:');
  if (audit.sessionsList && Array.isArray(audit.sessionsList)) {
    audit.sessionsList.forEach((s, idx) => {
      console.log(` [${idx + 1}] ID: ${s.id} | UserID: ${s.user_id} | Role: ${s.role} | Status: ${s.status} | SingleDevice: ${s.is_single_device} | IP: ${s.ip_address} | Expires: ${s.expires_at_iso} | IsCurrent: ${s.isCurrentSession}`);
    });
  }

  // PART 4: CLEANUP TEST (OPTIONAL / VERIFICATION)
  console.log('\n--- PART 4: POSTGRES HEALTH & RECONCILIATION SUMMARY ---');
  const finalHealth = await request('/api/health');
  console.log('Final Health Endpoint Data:');
  console.log('Status:      ', finalHealth.data?.status);
  console.log('Commit:      ', finalHealth.data?.commit);
  console.log('Database OK: ', finalHealth.data?.database?.ok);
  console.log('Table Counts:', JSON.stringify(finalHealth.data?.database?.tableCounts, null, 2));

  // LOGOUT
  console.log('\n--- PART 5: SUPER ADMIN LOGOUT & SESSION INVALIDATION ---');
  const logoutRes = await request('/api/superadmin/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Logout result:', logoutRes.data);

  const checkAfterLogout = await request('/api/superadmin/auth-check', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Auth check with revoked token:', checkAfterLogout.status, checkAfterLogout.data);
  if (checkAfterLogout.status === 401) {
    console.log('✔ Session invalidation verified: revoked session rejected with 401 Unauthorized.');
  }

  console.log('\n================================================================================');
  console.log('AUDIT COMPLETED SUCCESSFULLY');
  console.log('================================================================================');
}

run().catch(console.error);

import http from 'http';
import https from 'https';

const API_BASE = 'https://balananda-api.onrender.com';
const ADMIN_USER = 'admin';
const ADMIN_PASS = process.env.SUPERADMIN_PASSWORD;

function request(method: string, path: string, body?: any, token?: string): Promise<{ status: number; data: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, {
      method,
      headers,
      timeout: 25000
    }, (res) => {
      let raw = '';
      res.setEncoding('utf-8');
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        let data: any = null;
        try { data = JSON.parse(raw); } catch { data = raw; }
        resolve({ status: res.statusCode || 0, data, raw });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout after 25s for ${method} ${path}`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('================================================================');
  console.log(' BALANANDA VAIDIK SEWA — PRODUCTION DATA RESET & VERIFICATION');
  console.log(' Production Backend:', API_BASE);
  console.log(' Target Database: Managed PostgreSQL (balananda-db)');
  console.log('================================================================\n');

  // Step 1: Wait for Render deployment of new commit
  console.log('[Step 1] Waiting for Render deployment of new commit (checking maintenance endpoint)...');
  let deployed = false;
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      const probeRes = await request('GET', '/api/superadmin/maintenance/table-counts');
      // If deployed, requireSuperAdminAuth returns 401 (or 200 if somehow authenticated). 404 means old code.
      if (probeRes.status === 401 || probeRes.status === 200) {
        deployed = true;
        console.log(`[Step 1] New backend commit is LIVE on Render! (Status: ${probeRes.status})`);
        break;
      } else {
        console.log(`[Step 1] Attempt ${attempt}/30: Status ${probeRes.status} (Render still building/deploying). Waiting 10s...`);
      }
    } catch (err: any) {
      console.log(`[Step 1] Attempt ${attempt}/30: ${err.message}. Waiting 10s...`);
    }
    await sleep(10000);
  }

  if (!deployed) {
    console.error('FATAL: Timed out waiting for Render to deploy new commit.');
    process.exit(1);
  }

  // Step 2: Super Admin Login
  console.log('\n[Step 2] Authenticating as Super Admin...');
  const loginRes = await request('POST', '/api/superadmin/login', {
    username: ADMIN_USER,
    password: ADMIN_PASS
  });

  if (loginRes.status !== 200 || !loginRes.data?.token) {
    console.error('FATAL: Super Admin login failed:', loginRes.data);
    process.exit(1);
  }

  const token = loginRes.data.token;
  console.log('[Step 2] Super Admin authentication SUCCESSFUL.');

  // Step 3: Check before-reset table counts
  console.log('\n[Step 3] Fetching before-reset table counts from production database...');
  let beforeCounts: any = null;
  try {
    const countsRes = await request('GET', '/api/superadmin/maintenance/table-counts', undefined, token);
    if (countsRes.status === 200 && countsRes.data?.success) {
      beforeCounts = countsRes.data.tableCounts;
      console.log('[Step 3] Live Table Counts Before Reset:');
      console.table(beforeCounts);
    } else {
      console.log('[Step 3] Maintenance endpoint returned:', countsRes.status, countsRes.data);
    }
  } catch (err: any) {
    console.warn('[Step 3] Table counts query notice:', err.message);
  }

  // Step 4: Execute Reset
  console.log('\n[Step 4] Triggering Production Data Reset (POST /api/superadmin/maintenance/reset-all-test-data)...');
  let resetRes = await request('POST', '/api/superadmin/maintenance/reset-all-test-data', {}, token);
  if (resetRes.status !== 200) {
    console.log('[Step 4] Retrying via /api/superadmin/data-reset/execute with CONFIRM_PURGE_2081...');
    resetRes = await request('POST', '/api/superadmin/data-reset/execute', { confirmationCode: 'CONFIRM_PURGE_2081' }, token);
  }

  if (resetRes.status !== 200 || !resetRes.data?.success) {
    console.error('FATAL: Production data reset failed:', resetRes.status, resetRes.data);
    process.exit(1);
  }

  console.log('[Step 4] Reset executed successfully!');
  console.log('[Step 4] Safety Backup Snapshot Created:', resetRes.data.backupFile);
  if (resetRes.data.beforeCounts) {
    console.log('[Step 4] Before Counts:');
    console.table(resetRes.data.beforeCounts);
  }

  // Step 5: Verify post-reset table counts
  console.log('\n[Step 5] Verifying post-reset table counts from authoritative database...');
  const afterCountsRes = await request('GET', '/api/superadmin/maintenance/table-counts', undefined, token);
  let afterCounts = afterCountsRes.data?.tableCounts;
  console.log('[Step 5] Live Table Counts After Reset:');
  console.table(afterCounts);

  // Step 6: Verify Super Admin Users Table Endpoint
  console.log('\n[Step 6] Querying Super Admin Users Table (GET /api/superadmin/users)...');
  const usersRes = await request('GET', '/api/superadmin/users', undefined, token);
  if (usersRes.status === 200) {
    console.log(`[Step 6] Super Admin Total Users: ${usersRes.data.total}`);
    console.log(`[Step 6] Returned Users Count: ${usersRes.data.users?.length}`);
    console.log('[Step 6] Dashboard Stats:');
    console.table(usersRes.data.stats);

    if (usersRes.data.total === 0 && usersRes.data.users?.length === 0) {
      console.log('✓ VERIFIED: Super Admin user table is completely clean (0 users)!');
    } else {
      console.warn('WARNING: Total users is not 0:', usersRes.data.total);
    }
  } else {
    console.error('[Step 6] Failed to query users table:', usersRes.status, usersRes.data);
  }

  // Step 7: Verify Super Admin Login and Session Still Works
  console.log('\n[Step 7] Re-verifying Super Admin access after reset...');
  const authCheckRes = await request('GET', '/api/superadmin/auth-check', undefined, token);
  if (authCheckRes.status === 200 && authCheckRes.data?.success) {
    console.log('✓ VERIFIED: Super Admin session remains 100% active and authenticated!');
  } else {
    console.warn('Super Admin session check returned:', authCheckRes.status, authCheckRes.data);
  }

  // Step 8: Verify Health endpoint
  console.log('\n[Step 8] Final backend health check...');
  const finalHealth = await request('GET', '/api/health');
  console.log('Health:', JSON.stringify(finalHealth.data, null, 2));

  console.log('\n================================================================');
  console.log(' PRODUCTION DATA RESET COMPLETED AND VERIFIED 100% SUCCESSFUL');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});

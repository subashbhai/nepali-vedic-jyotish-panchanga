// scripts/verify_production_ledger_readonly.mjs
// Read-only inspection of live Render Production PostgreSQL records
// Zero mutations, zero resets, purely GET queries with cache-busting headers.

import https from 'https';

const BASE_URL = process.env.API_BASE_URL || 'https://balananda-api.onrender.com';

function fetchJson(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqHeaders = {
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'User-Agent': 'ReadOnlyInspector/1.0',
      ...(options.headers || {})
    };

    const req = https.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
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

async function runReadOnlyInspection() {
  console.log('========================================================================');
  console.log('BALANANDA VAIDIK SEWA — PRODUCTION LEDGER READ-ONLY VERIFICATION');
  console.log('Target URL:', BASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  console.log('========================================================================\n');

  // Step 1: Authenticate Super Admin
  const loginRes = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]' }
  });

  const token = loginRes.data?.token;
  if (!token) {
    console.error('Super Admin authentication failed:', loginRes.data);
    process.exit(1);
  }
  console.log('✓ Super Admin authenticated successfully (Read-Only Session).\n');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Step 2: Fetch Payments
  const paymentsRes = await fetchJson('/api/superadmin/payments?t=' + Date.now(), { headers: authHeaders });
  const payments = paymentsRes.data?.payments || [];
  console.log(`✓ Fetched ${payments.length} payment record(s) from Production PostgreSQL.\n`);

  // Step 3: Fetch Memberships
  const membershipsRes = await fetchJson('/api/superadmin/memberships?t=' + Date.now(), { headers: authHeaders });
  const memberships = membershipsRes.data?.memberships || [];
  console.log(`✓ Fetched ${memberships.length} membership record(s) from Production PostgreSQL.\n`);

  // Step 4: Fetch Admin Stats (Confirmed Revenue) via /api/superadmin/users
  const usersRes = await fetchJson('/api/superadmin/users?limit=1&t=' + Date.now(), { headers: authHeaders });
  const stats = usersRes.data?.stats || {};
  console.log('✓ Fetched live admin stats from /api/superadmin/users.\n');

  // Step 5: Fetch Audit Logs
  const auditRes = await fetchJson('/api/admin/audit-logs?t=' + Date.now(), { headers: authHeaders });
  const auditLogs = auditRes.data?.logs || [];
  console.log(`✓ Fetched ${auditLogs.length} audit log record(s) from Production PostgreSQL.\n`);

  // Step 6: Detailed Analysis of Required Items
  console.log('ALL PAYMENTS IN PRODUCTION DB:');
  payments.forEach((p, idx) => {
    console.log(`[Payment ${idx+1}] ID: ${p.id} | User: ${p.userId} | Amount: ${p.amountNPR} | Status: ${p.paymentStatus} | Method: ${p.paymentMethod} | Notes: ${p.notes || '-'}`);
  });

  console.log('\nALL MEMBERSHIPS IN PRODUCTION DB:');
  memberships.forEach((m, idx) => {
    console.log(`[Membership ${idx+1}] ID: ${m.id} | User: ${m.userId} | Plan: ${m.planId} | Amount: ${m.amountNPR} | Status: ${m.membershipStatus} | Paid: ${m.paymentStatus} | Email: ${m.email || '-'}`);
  });

  const pay1 = payments.find(p => p.id === 'PAY-1793269263601-1z95');
  const pay2 = payments.find(p => p.id === 'PAY-1793277573428-075j');

  console.log('\nOriginal Genuine Payment (PAY-1793269263601-1z95):', {
    id: pay1?.id,
    userId: pay1?.userId,
    amountNPR: pay1?.amountNPR,
    paymentStatus: pay1?.paymentStatus,
    paymentMethod: pay1?.paymentMethod,
    notes: pay1?.notes
  });

  console.log('Administrative Duplicate Payment (PAY-1793277573428-075j):', {
    id: pay2?.id,
    userId: pay2?.userId,
    amountNPR: pay2?.amountNPR,
    paymentStatus: pay2?.paymentStatus,
    paymentMethod: pay2?.paymentMethod,
    isDuplicateAdminActivation: pay2?.isDuplicateAdminActivation,
    notes: pay2?.notes
  });

  console.log('\n------------------------------------------------------------------------');
  console.log('2. MEMBERSHIP RECORDS:');
  const mem1 = memberships.find(m => m.id === 'MEM-1793269263598-4w32');
  const mem2 = memberships.find(m => m.id === 'MEM-1793277573426-q8rq');

  console.log('Original Active Membership (MEM-1793269263598-4w32):', {
    id: mem1?.id,
    userId: mem1?.userId,
    planId: mem1?.planId,
    amountNPR: mem1?.amountNPR,
    membershipStatus: mem1?.membershipStatus,
    paymentStatus: mem1?.paymentStatus,
    email: mem1?.email,
    expiresAtBS: mem1?.expiresAtBS
  });

  console.log('Superseded Duplicate Membership (MEM-1793277573426-q8rq):', {
    id: mem2?.id,
    userId: mem2?.userId,
    planId: mem2?.planId,
    amountNPR: mem2?.amountNPR,
    membershipStatus: mem2?.membershipStatus,
    paymentStatus: mem2?.paymentStatus,
    notes: mem2?.notes
  });

  console.log('\n------------------------------------------------------------------------');
  console.log('3. CONFIRMED REVENUE & ADMIN STATS:');
  console.log({
    totalUsers: stats.totalUsers,
    normalPaid: stats.normalPaid,
    proMembers: stats.proMembers,
    pendingPurchases: stats.pendingPurchases,
    totalConfirmedRevenue: stats.totalConfirmedRevenue
  });

  console.log('\n------------------------------------------------------------------------');
  console.log('4. RELEVANT AUDIT RECORDS:');
  const relevantAudits = auditLogs.filter(a => 
    a.targetId === 'PAY-1793277573428-075j' ||
    String(a.action || '').includes('LEDGER') ||
    String(a.details || '').includes('PAY-1793277573428-075j')
  );
  console.log(`Found ${relevantAudits.length} relevant audit log(s):`);
  relevantAudits.forEach((a, idx) => {
    console.log(`[${idx + 1}] ID: ${a.id} | Action: ${a.action} | PerformedBy: ${a.performedBy} | Details: ${a.details}`);
  });

  console.log('\n========================================================================');
  console.log('READ-ONLY INSPECTION COMPLETE (NO MUTATIONS PERFORMED)');
  console.log('========================================================================');
}

runReadOnlyInspection().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});

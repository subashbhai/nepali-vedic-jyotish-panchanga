/**
 * Phase 1: Read-Only Production Database Audit
 * Strictly READ-ONLY. Makes only GET requests.
 */

const API_BASE = 'https://balananda-api.onrender.com';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: process.env.SUPERADMIN_PASSWORD
};

async function readOnlyAudit() {
  console.log('================================================================');
  console.log('PHASE 1: READ-ONLY PRODUCTION AUDIT');
  console.log('Target:', API_BASE);
  console.log('================================================================\n');

  // 1. Authenticate Super Admin (strictly read token for admin GET routes)
  const loginRes = await fetch(`${API_BASE}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN_CREDENTIALS)
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Admin authentication failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  const headers = { 'Authorization': `Bearer ${token}` };

  // 2. Health & Table Counts
  const healthRes = await fetch(`${API_BASE}/api/health`);
  const healthData = await healthRes.json();
  console.log('1. LIVE HEALTH & TABLE COUNTS:');
  console.log(JSON.stringify(healthData.database, null, 2));

  // 3. Client Purchase Leads (GET /api/client-leads)
  const leadsRes = await fetch(`${API_BASE}/api/client-leads`, { headers });
  const leadsData = await leadsRes.json();
  const leads = leadsData.leads || [];
  console.log(`\n2. CLIENT PURCHASE LEADS (Total: ${leads.length}):`);
  const leadsByStatus = {};
  leads.forEach(l => {
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1;
  });
  console.log('Counts by status:', leadsByStatus);
  console.log('Details:');
  leads.forEach(l => {
    console.log(`  - Lead ID: ${l.id} | Mobile: ${l.mobile} | Plan: ${l.planId} | Status: ${l.status} | PaymentVerification: ${l.paymentVerificationStatus} | TxID: ${l.transactionId} | SubmittedAt: ${l.submittedAtISO}`);
  });

  // 4. Memberships (GET /api/superadmin/memberships?filter=all)
  const memRes = await fetch(`${API_BASE}/api/superadmin/memberships?filter=all`, { headers });
  const memData = await memRes.json();
  const mems = memData.memberships || [];
  console.log(`\n3. MEMBERSHIPS (Total: ${mems.length}):`);
  const memsByStatus = {};
  mems.forEach(m => {
    memsByStatus[m.membershipStatus] = (memsByStatus[m.membershipStatus] || 0) + 1;
  });
  console.log('Counts by status:', memsByStatus);
  console.log('Details:');
  mems.forEach(m => {
    console.log(`  - Mem ID: ${m.id} | Phone: ${m.phone} | Plan: ${m.planId} | Status: ${m.membershipStatus} | Payment: ${m.paymentStatus} | ExpiresAt: ${m.expiresAtISO}`);
  });

  // 5. Payments (GET /api/superadmin/payments?filter=all)
  const payRes = await fetch(`${API_BASE}/api/superadmin/payments?filter=all`, { headers });
  const payData = await payRes.json();
  const payments = payData.payments || [];
  console.log(`\n4. PAYMENTS (Total: ${payments.length}):`);
  const paymentsByStatus = {};
  payments.forEach(p => {
    paymentsByStatus[p.paymentStatus] = (paymentsByStatus[p.paymentStatus] || 0) + 1;
  });
  console.log('Counts by status:', paymentsByStatus);
  console.log('Details:');
  payments.forEach(p => {
    console.log(`  - Pay ID: ${p.id} | User: ${p.userId} | Amount: ${p.amountNPR} ${p.currency} | Status: ${p.paymentStatus} | Ref: ${p.transactionReference} | Notes: ${p.notes}`);
  });

  // 6. Service Licenses (GET /api/licenses/check for jyotish & vastu)
  console.log(`\n5. SERVICE LICENSES:`);
  const licJyotishRes = await fetch(`${API_BASE}/api/licenses/check?userId=9801234567&serviceKey=jyotish`);
  const licJyotish = await licJyotishRes.json();
  console.log('  - 9801234567_jyotish:', JSON.stringify(licJyotish));

  const licVastuRes = await fetch(`${API_BASE}/api/licenses/check?userId=9801234567&serviceKey=vastu`);
  const licVastu = await licVastuRes.json();
  console.log('  - 9801234567_vastu:', JSON.stringify(licVastu));

  // 7. Users (GET /api/superadmin/users)
  const usersRes = await fetch(`${API_BASE}/api/superadmin/users`, { headers });
  const usersData = await usersRes.json();
  const users = usersData.users || [];
  console.log(`\n6. REGISTERED USERS (Total: ${users.length}):`);
  users.forEach(u => {
    console.log(`  - User ID: ${u.id} | Username: ${u.username} | Phone: ${u.phone} | Role: ${u.role} | SubPlan: ${u.subscriptionPlan} | PaymentStatus: ${u.paymentStatus} | Amount: ${u.paymentAmountNPR}`);
  });

  // 8. Audit Logs (GET /api/admin/audit-logs)
  const auditRes = await fetch(`${API_BASE}/api/admin/audit-logs`, { headers });
  const auditData = await auditRes.json();
  const logs = auditData.logs || [];
  console.log(`\n7. AUDIT LOGS (Total: ${logs.length}):`);
  logs.forEach(l => {
    console.log(`  - Log ID: ${l.id} | Action: ${l.action} | PerformedBy: ${l.performedBy} | Target: ${l.targetId} | Time: ${l.timestampISO}`);
    console.log(`    Details: ${l.details}`);
  });

  console.log('\n================================================================');
  console.log('PHASE 1 AUDIT COMPLETE (STRICTLY READ-ONLY)');
  console.log('================================================================');
}

readOnlyAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

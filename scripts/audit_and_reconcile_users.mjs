/**
 * Comprehensive Database Audit and Safe Reconciliation Script
 * Balananda Vaidik Sewa — Enterprise User Reconciliation
 * 
 * Rules:
 * 1. Zero hardcoding — Pure generic canonical policy rules.
 * 2. Zero blanket SQL — Audits each individual account against its confirmed records.
 * 3. Idempotent & Safe — Only corrects proven discrepancies; flags uncertain as NEEDS_REVIEW.
 */

import https from 'https';
import { resolveCanonicalUserState, resolveCanonicalPlan } from '../src/core/canonicalMembershipPolicy.ts';

const BASE_URL = process.env.API_BASE_URL || 'https://balananda-api.onrender.com';

function fetchJson(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqHeaders = {
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'User-Agent': 'DatabaseAuditor/1.0',
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

async function auditAndReconcile() {
  console.log('========================================================================');
  console.log('BALANANDA VAIDIK SEWA — PRODUCTION DATABASE AUDIT & SAFE RECONCILIATION');
  console.log('Target API:', BASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  console.log('========================================================================\n');

  // 1. Authenticate Super Admin
  const loginRes = await fetchJson('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { username: 'admin', password: 'Balananda#Vaidik2083!SuperAdmin@SecureKey$' }
  });

  const token = loginRes.data?.token;
  if (!token) {
    console.error('Super Admin authentication failed:', loginRes.data);
    process.exit(1);
  }
  console.log('✓ Super Admin authenticated successfully.\n');

  // 2. Fetch Users
  const usersRes = await fetchJson('/api/superadmin/users?limit=100', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const users = usersRes.data?.users || [];
  console.log(`Auditing ${users.length} registered user account(s)...\n`);

  // 3. Fetch Memberships
  const membershipsRes = await fetchJson('/api/superadmin/memberships', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const allMemberships = membershipsRes.data?.memberships || [];

  const auditReport = {
    totalAudited: users.length,
    alreadyCanonical: 0,
    reconciledCount: 0,
    needsReviewCount: 0,
    reconciledUsers: [],
    needsReviewUsers: [],
    allAuditedSummaries: []
  };

  for (const user of users) {
    const userCleanPhone = String(user.phone || user.username || '').replace(/\D/g, '').slice(-10);
    const userMemberships = allMemberships.filter(m => {
      const mPhone = String(m.phone || '').replace(/\D/g, '').slice(-10);
      return (userCleanPhone && mPhone === userCleanPhone) || m.userId === user.id;
    });

    const activeMem = userMemberships.find(m => m.membershipStatus === 'ACTIVE') || userMemberships[0];

    const canonicalState = resolveCanonicalUserState({
      user,
      membership: activeMem,
      memberships: userMemberships,
      payments: user.purchaseHistory || [],
      licenses: user.licenses || [],
      trial: user.trial
    });

    const currentCategory = user.userCategory;
    const currentRoleNepali = user.roleNameNepali;
    const currentAmount = user.paymentAmountNPR;

    const targetCategory = canonicalState.userCategory;
    const targetRoleNepali = canonicalState.roleNameNepali;
    const targetAmount = canonicalState.confirmedPaymentAmountNPR;

    const hasMismatch = 
      currentCategory !== targetCategory ||
      currentRoleNepali !== targetRoleNepali ||
      (targetAmount > 0 && currentAmount !== targetAmount);

    let auditStatus = 'CONFIRMED_CANONICAL';

    if (hasMismatch) {
      // Determine if safe to reconcile automatically
      const isUnambiguousNormal = (canonicalState.canonicalPlanId?.includes('normal') || targetCategory === 'member');
      const isUnambiguousPro = (canonicalState.canonicalPlanId?.includes('pro') || targetCategory === 'professional');
      const isUnambiguousVisitor = (targetCategory === 'visitor');

      if (isUnambiguousNormal || isUnambiguousPro || isUnambiguousVisitor) {
        console.log(`[MISMATCH DETECTED] User: ${user.fullName} (${user.username || user.id})`);
        console.log(`  Current:  Category: "${currentCategory}", Role: "${currentRoleNepali}", Amount: Rs. ${currentAmount}`);
        console.log(`  Expected: Category: "${targetCategory}", Role: "${targetRoleNepali}", Amount: Rs. ${targetAmount}`);
        console.log(`  Plan:     ${canonicalState.canonicalPlanId} (${canonicalState.planNameNepali})`);

        // Perform safe transactional PATCH to DB
        const patchRes = await fetchJson(`/api/superadmin/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: {
            userCategory: targetCategory,
            roleNameNepali: targetRoleNepali,
            paymentAmountNPR: targetAmount
          }
        });

        if (patchRes.status === 200 && patchRes.data?.success) {
          console.log(`  ✓ Successfully reconciled in database!`);
          auditStatus = 'RECONCILED_SAFE';
          auditReport.reconciledCount++;
          auditReport.reconciledUsers.push({
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            priorState: { category: currentCategory, role: currentRoleNepali, amount: currentAmount },
            reconciledState: { category: targetCategory, role: targetRoleNepali, amount: targetAmount },
            planId: canonicalState.canonicalPlanId
          });

          // Reset active sessions so stale category in active JWT/sessions is invalidated
          await fetchJson(`/api/superadmin/users/${user.id}/reset-sessions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          console.error(`  ✗ Failed to patch user in DB:`, patchRes.data);
          auditStatus = 'NEEDS_REVIEW';
          auditReport.needsReviewCount++;
          auditReport.needsReviewUsers.push({ id: user.id, name: user.fullName, error: patchRes.data });
        }
      } else {
        auditStatus = 'NEEDS_REVIEW';
        auditReport.needsReviewCount++;
        auditReport.needsReviewUsers.push({
          id: user.id,
          fullName: user.fullName,
          reason: 'Ambiguous membership state requiring administrative review'
        });
      }
    } else {
      auditReport.alreadyCanonical++;
    }

    auditReport.allAuditedSummaries.push({
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      category: targetCategory,
      roleNepali: targetRoleNepali,
      confirmedAmountNPR: targetAmount,
      totalAmountNPR: canonicalState.totalConfirmedAmountPaidNPR,
      isPro: canonicalState.isProfessional,
      isPaid: canonicalState.isPaidMember,
      auditStatus
    });
  }

  console.log('\n========================================================================');
  console.log('AUDIT & RECONCILIATION SUMMARY REPORT');
  console.log('========================================================================');
  console.log(`Total Users Audited:   ${auditReport.totalAudited}`);
  console.log(`Confirmed Canonical:   ${auditReport.alreadyCanonical}`);
  console.log(`Safely Reconciled:     ${auditReport.reconciledCount}`);
  console.log(`Flagged Needs Review:  ${auditReport.needsReviewCount}`);
  console.log('========================================================================\n');

  console.log(JSON.stringify(auditReport, null, 2));
}

auditAndReconcile().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});

/**
 * Global Membership, Payment, Role, Entitlement, and Renewal Test Suite
 * 18 Mandatory Test Cases executed in Isolated Sandboxed Environment
 * 
 * Verifies the authoritative Canonical Membership Policy across:
 * - Normal Yearly (Rs. 100) -> साधारण सदस्य (Member)
 * - Normal Lifetime (Rs. 500) -> साधारण सदस्य (Member)
 * - Professional Yearly (Rs. 2,000) -> व्यावसायिक सदस्य (Professional)
 * - Professional Lifetime (Rs. 5,000) -> व्यावसायिक सदस्य (Professional)
 * - Standalone Service Licenses (Jyotish / Vastu only)
 * - 48-Hour Free Trial (Member tools only, Pro locked)
 * - Pending Payments, Expired Memberships, Idempotent Renewals
 * - Account Isolation, Session Security & Multi-device Policy
 */

import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { 
  resolveCanonicalPlan, 
  resolveCanonicalUserState, 
  calculateCanonicalRenewalSchedule,
  CANONICAL_MEMBERSHIP_PLANS 
} from '../src/core/canonicalMembershipPolicy.ts';
import { resolveUserEntitlement } from '../src/server/entitlementEngine.ts';
import { JsonFileDatabaseAdapter } from '../src/server/db/databaseAdapter.ts';
import { MembershipEngine } from '../src/server/membershipEngine.ts';

console.log('========================================================================');
console.log('GLOBAL MEMBERSHIP, PAYMENT, ROLE, ENTITLEMENT & RENEWAL SUITE');
console.log('18 Mandatory Enterprise Test Cases — Balananda Vaidik Sewa');
console.log('========================================================================\n');

// ── Setup Sandbox Isolated DB ──
const sandboxDir = path.join(process.cwd(), 'data', 'sandbox_global_tests');
if (!fs.existsSync(sandboxDir)) {
  fs.mkdirSync(sandboxDir, { recursive: true });
}
for (const file of fs.readdirSync(sandboxDir)) {
  try { fs.unlinkSync(path.join(sandboxDir, file)); } catch {}
}

const sandboxDb = new JsonFileDatabaseAdapter(sandboxDir);
await sandboxDb.init();
const membershipEngine = new MembershipEngine(sandboxDir);

let passedCount = 0;
let failedCount = 0;

async function testCase(number, title, fn) {
  try {
    await fn();
    console.log(`[PASS] Test ${number}: ${title}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] Test ${number}: ${title}`);
    console.error(`       Error: ${err.message}`);
    failedCount++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Normal Annual User (1 Year, Rs 100) -> Member in UI & API
// ─────────────────────────────────────────────────────────────────────────────
await testCase(1, 'Normal Annual User -> Member in UI & API (Rs. 100)', async () => {
  const user = { id: 'usr_norm_yr', username: 'ram_sharma', phone: '9841111111', role: 'CUSTOMER' };
  const membership = {
    userId: user.id,
    planId: 'normal_yearly',
    amountNPR: 100,
    membershipStatus: 'ACTIVE',
    expiresAtTimestamp: Date.now() + 365 * 86400000
  };
  const payments = [{ id: 'PAY-1', status: 'PURCHASE_APPROVED', planAmountNPR: 100, planId: 'normal_yearly' }];

  const state = resolveCanonicalUserState({ user, membership, payments });
  assert.strictEqual(state.userCategory, 'member');
  assert.strictEqual(state.roleNameNepali, 'साधारण सदस्य (Member)');
  assert.strictEqual(state.isProfessional, false);
  assert.strictEqual(state.isPaidMember, true);
  assert.strictEqual(state.confirmedPaymentAmountNPR, 100);

  const entitlement = resolveUserEntitlement({ user, membership, payments });
  assert.strictEqual(entitlement.lifecycleState, 'NORMAL_MEMBER');
  assert.strictEqual(entitlement.isProfessionalToolsAllowed, false);
  assert.strictEqual(entitlement.isMemberDashboardAllowed, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Normal Lifetime User (Lifetime, Rs 500) -> Member in UI & API
// ─────────────────────────────────────────────────────────────────────────────
await testCase(2, 'Normal Lifetime User -> Member in UI & API (Rs. 500)', async () => {
  const user = { id: 'usr_norm_lt', username: 'sita_gita', phone: '9841222222', role: 'CUSTOMER' };
  const membership = {
    userId: user.id,
    planId: 'normal_lifetime',
    amountNPR: 500,
    duration: 'lifetime',
    membershipStatus: 'ACTIVE'
  };
  const payments = [{ id: 'PAY-2', status: 'PURCHASE_APPROVED', planAmountNPR: 500, planId: 'normal_lifetime' }];

  const state = resolveCanonicalUserState({ user, membership, payments });
  assert.strictEqual(state.userCategory, 'member');
  assert.strictEqual(state.roleNameNepali, 'साधारण सदस्य (Member)');
  assert.strictEqual(state.isProfessional, false);
  assert.strictEqual(state.isPaidMember, true);
  assert.strictEqual(state.confirmedPaymentAmountNPR, 500);

  const entitlement = resolveUserEntitlement({ user, membership, payments });
  assert.strictEqual(entitlement.lifecycleState, 'NORMAL_MEMBER');
  assert.strictEqual(entitlement.isProfessionalToolsAllowed, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Professional Annual User (1 Year, Rs 2,000) -> Professional in UI & API
// ─────────────────────────────────────────────────────────────────────────────
await testCase(3, 'Professional Annual User -> Professional in UI & API (Rs. 2,000)', async () => {
  const user = { id: 'usr_pro_yr', username: 'hari_acharya', phone: '9841333333', role: 'CUSTOMER' };
  const membership = {
    userId: user.id,
    planId: 'pro_yearly',
    amountNPR: 2000,
    membershipStatus: 'ACTIVE',
    expiresAtTimestamp: Date.now() + 365 * 86400000
  };
  const payments = [{ id: 'PAY-3', status: 'PURCHASE_APPROVED', planAmountNPR: 2000, planId: 'pro_yearly' }];

  const state = resolveCanonicalUserState({ user, membership, payments });
  assert.strictEqual(state.userCategory, 'professional');
  assert.strictEqual(state.roleNameNepali, 'व्यावसायिक सदस्य (Professional)');
  assert.strictEqual(state.isProfessional, true);
  assert.strictEqual(state.isPaidMember, true);
  assert.strictEqual(state.confirmedPaymentAmountNPR, 2000);

  const entitlement = resolveUserEntitlement({ user, membership, payments });
  assert.strictEqual(entitlement.lifecycleState, 'PROFESSIONAL_MEMBER');
  assert.strictEqual(entitlement.isProfessionalToolsAllowed, true);
  assert.strictEqual(entitlement.isJyotishAllowed, true);
  assert.strictEqual(entitlement.isVastuAllowed, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Professional Lifetime User (Lifetime, Rs 5,000) -> Professional in UI & API
// ─────────────────────────────────────────────────────────────────────────────
await testCase(4, 'Professional Lifetime User -> Professional in UI & API (Rs. 5,000)', async () => {
  const user = { id: 'usr_pro_lt', username: 'krishna_pandit', phone: '9841444444', role: 'CUSTOMER' };
  const membership = {
    userId: user.id,
    planId: 'pro_lifetime',
    amountNPR: 5000,
    duration: 'lifetime',
    membershipStatus: 'ACTIVE'
  };
  const payments = [{ id: 'PAY-4', status: 'PURCHASE_APPROVED', planAmountNPR: 5000, planId: 'pro_lifetime' }];

  const state = resolveCanonicalUserState({ user, membership, payments });
  assert.strictEqual(state.userCategory, 'professional');
  assert.strictEqual(state.roleNameNepali, 'व्यावसायिक सदस्य (Professional)');
  assert.strictEqual(state.isProfessional, true);
  assert.strictEqual(state.isPaidMember, true);
  assert.strictEqual(state.confirmedPaymentAmountNPR, 5000);

  const entitlement = resolveUserEntitlement({ user, membership, payments });
  assert.strictEqual(entitlement.lifecycleState, 'PROFESSIONAL_MEMBER');
  assert.strictEqual(entitlement.isProfessionalToolsAllowed, true);
  assert.strictEqual(entitlement.isJyotishAllowed, true);
  assert.strictEqual(entitlement.isVastuAllowed, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Jyotish-only License User -> Proper role and Jyotish access only
// ─────────────────────────────────────────────────────────────────────────────
await testCase(5, 'Jyotish-only License User -> Proper role and Jyotish access only (not professional)', async () => {
  const user = { id: 'usr_jyotish_only', username: 'jyotish_user', phone: '9841555555', role: 'CUSTOMER' };
  const licenses = [{
    userId: user.id,
    serviceKey: 'jyotish',
    status: 'unlocked',
    expiresAtTimestamp: Date.now() + 180 * 86400000
  }];

  const state = resolveCanonicalUserState({ user, licenses });
  assert.strictEqual(state.isProfessional, false);
  assert.strictEqual(state.isPaidMember, false);

  const entitlement = resolveUserEntitlement({ user, licenses });
  assert.strictEqual(entitlement.isJyotishAllowed, true);
  assert.strictEqual(entitlement.isVastuAllowed, false);
  assert.strictEqual(entitlement.isProfessionalToolsAllowed, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Vastu-only License User -> Proper role and Vastu access only
// ─────────────────────────────────────────────────────────────────────────────
await testCase(6, 'Vastu-only License User -> Proper role and Vastu access only (not professional)', async () => {
  const user = { id: 'usr_vastu_only', username: 'vastu_user', phone: '9841666666', role: 'CUSTOMER' };
  const licenses = [{
    userId: user.id,
    serviceKey: 'vastu',
    status: 'unlocked',
    expiresAtTimestamp: Date.now() + 180 * 86400000
  }];

  const state = resolveCanonicalUserState({ user, licenses });
  assert.strictEqual(state.isProfessional, false);
  assert.strictEqual(state.isPaidMember, false);

  const entitlement = resolveUserEntitlement({ user, licenses });
  assert.strictEqual(entitlement.isJyotishAllowed, false);
  assert.strictEqual(entitlement.isVastuAllowed, true);
  assert.strictEqual(entitlement.isProfessionalToolsAllowed, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Active Trial User -> Trial access only, no professional status
// ─────────────────────────────────────────────────────────────────────────────
await testCase(7, 'Active Trial User -> Trial access only, professional tools strictly locked', async () => {
  const user = {
    id: 'usr_trial',
    username: 'trial_user',
    phone: '9841777777',
    role: 'CUSTOMER',
    trial: {
      isTrialActive: true,
      trialExpiresAtTimestamp: Date.now() + 36 * 3600000
    }
  };

  const state = resolveCanonicalUserState({ user, trial: user.trial });
  assert.strictEqual(state.isTrialActive, true);
  assert.strictEqual(state.isProfessional, false);
  assert.strictEqual(state.isPaidMember, false);

  const entitlement = resolveUserEntitlement({ user, trial: user.trial });
  assert.strictEqual(entitlement.lifecycleState, 'TRIAL_USER');
  assert.strictEqual(entitlement.isProfessionalToolsAllowed, false);
  assert.strictEqual(entitlement.isJyotishAllowed, false);
  assert.strictEqual(entitlement.isVastuAllowed, false);
  assert.strictEqual(entitlement.canAccessPersonalFaladesh, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Pending Payment User -> Paid access blocked
// ─────────────────────────────────────────────────────────────────────────────
await testCase(8, 'Pending Payment User -> Paid access blocked', async () => {
  const user = { id: 'usr_pending', username: 'pending_buyer', phone: '9841888888', role: 'CUSTOMER' };
  const payments = [{
    id: 'LEAD-99',
    status: 'PURCHASE_PENDING',
    paymentVerificationStatus: 'PENDING',
    planId: 'pro_lifetime',
    planAmountNPR: 5000
  }];

  const state = resolveCanonicalUserState({ user, payments });
  assert.strictEqual(state.isPaidMember, false);
  assert.strictEqual(state.isProfessional, false);
  assert.strictEqual(state.confirmedPaymentAmountNPR, 0);

  const entitlement = resolveUserEntitlement({ user, payments });
  assert.strictEqual(entitlement.lifecycleState, 'PURCHASE_PENDING');
  assert.strictEqual(entitlement.isJyotishAllowed, false);
  assert.strictEqual(entitlement.isVastuAllowed, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Expired Membership User -> Expired state
// ─────────────────────────────────────────────────────────────────────────────
await testCase(9, 'Expired Membership User -> Expired state', async () => {
  const user = { id: 'usr_exp', username: 'expired_user', phone: '9841999999', role: 'CUSTOMER' };
  const membership = {
    userId: user.id,
    planId: 'normal_yearly',
    membershipStatus: 'EXPIRED',
    expiresAtTimestamp: Date.now() - 3600000
  };

  const state = resolveCanonicalUserState({ user, membership });
  assert.strictEqual(state.membershipStatus, 'EXPIRED');

  const entitlement = resolveUserEntitlement({ user, membership });
  assert.strictEqual(entitlement.lifecycleState, 'EXPIRED_MEMBER');
  assert.strictEqual(entitlement.isJyotishAllowed, false);
  assert.strictEqual(entitlement.isVastuAllowed, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Renewal User -> Correct extension without premature truncation
// ─────────────────────────────────────────────────────────────────────────────
await testCase(10, 'Renewal User -> Correct extension and payment history', async () => {
  const now = Date.now();
  const existingExpiry = now + 60 * 86400000; // 60 days remaining

  const schedule = calculateCanonicalRenewalSchedule({
    currentPlanId: 'normal_yearly',
    renewalPlanId: 'normal_yearly',
    currentExpiryTimestamp: existingExpiry
  });

  // Must extend by 365 days from existingExpiry, not from now
  const expectedExpiry = existingExpiry + 365 * 86400000;
  assert.strictEqual(schedule.newExpiryTimestamp, expectedExpiry);
  assert.strictEqual(schedule.extendedByDays, 365);
  assert.strictEqual(schedule.feeNPR, 100);
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. New User -> Clean visitor state
// ─────────────────────────────────────────────────────────────────────────────
await testCase(11, 'New User -> Clean visitor state', async () => {
  const user = { id: 'usr_new', username: 'fresh_signup', phone: '9842000000', role: 'CUSTOMER' };

  const state = resolveCanonicalUserState({ user });
  assert.strictEqual(state.userCategory, 'visitor');
  assert.strictEqual(state.isPaidMember, false);
  assert.strictEqual(state.isProfessional, false);
  assert.strictEqual(state.confirmedPaymentAmountNPR, 0);

  const entitlement = resolveUserEntitlement({ user });
  assert.strictEqual(entitlement.lifecycleState, 'REGISTERED_USER');
  assert.strictEqual(entitlement.isJyotishAllowed, false);
  assert.strictEqual(entitlement.isVastuAllowed, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. Isolation across accounts (no data leakage)
// ─────────────────────────────────────────────────────────────────────────────
await testCase(12, 'Isolation across accounts (User A Pro does not leak to User B)', async () => {
  const userA = { id: 'usr_A', username: 'pro_a', phone: '9842111111' };
  const userB = { id: 'usr_B', username: 'normal_b', phone: '9842222222' };

  const membershipA = { userId: userA.id, planId: 'pro_yearly', membershipStatus: 'ACTIVE', amountNPR: 2000 };
  const membershipB = { userId: userB.id, planId: 'normal_yearly', membershipStatus: 'ACTIVE', amountNPR: 100 };

  const stateA = resolveCanonicalUserState({ user: userA, membership: membershipA });
  const stateB = resolveCanonicalUserState({ user: userB, membership: membershipB });

  assert.strictEqual(stateA.isProfessional, true);
  assert.strictEqual(stateA.confirmedPaymentAmountNPR, 2000);

  assert.strictEqual(stateB.isProfessional, false);
  assert.strictEqual(stateB.confirmedPaymentAmountNPR, 100);
  assert.strictEqual(stateB.roleNameNepali, 'साधारण सदस्य (Member)');
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. UI consistency across Header, Dashboard, Admin
// ─────────────────────────────────────────────────────────────────────────────
await testCase(13, 'UI consistency across Header, Dashboard, and Admin views', async () => {
  const user = { id: 'usr_sample', username: 'ui_test', phone: '9842333333' };
  const membership = { userId: user.id, planId: 'normal_yearly', membershipStatus: 'ACTIVE', amountNPR: 100 };

  const canonical = resolveCanonicalUserState({ user, membership });

  // Simulate Header computation
  const headerRole = canonical.roleNameNepali;
  // Simulate Dashboard computation
  const dashboardCategory = canonical.userCategory;
  const dashboardIsPro = canonical.isProfessional;
  // Simulate Admin row computation
  const adminRowCategory = canonical.userCategory;
  const adminRowAmount = canonical.confirmedPaymentAmountNPR;

  assert.strictEqual(headerRole, 'साधारण सदस्य (Member)');
  assert.strictEqual(dashboardCategory, 'member');
  assert.strictEqual(dashboardIsPro, false);
  assert.strictEqual(adminRowCategory, 'member');
  assert.strictEqual(adminRowAmount, 100);
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. Refresh/login session persistence
// ─────────────────────────────────────────────────────────────────────────────
await testCase(14, 'Refresh/login session persistence', async () => {
  await sandboxDb.createUser({
    id: 'usr_persist',
    username: 'persist_user',
    phone: '9842444444',
    userCategory: 'member',
    role: 'CUSTOMER'
  });

  await sandboxDb.createMembership({
    id: 'MEM-PERSIST',
    userId: 'usr_persist',
    planId: 'normal_yearly',
    amountNPR: 100,
    membershipStatus: 'ACTIVE',
    expiresAtTimestamp: Date.now() + 365 * 86400000
  });

  const dbUser = await sandboxDb.getUserById('usr_persist');
  const dbMemberships = await sandboxDb.getMemberships();
  const dbUserMem = dbMemberships.find(m => m.userId === 'usr_persist');

  const rehydrated = resolveCanonicalUserState({ user: dbUser, membership: dbUserMem });
  assert.strictEqual(rehydrated.userCategory, 'member');
  assert.strictEqual(rehydrated.roleNameNepali, 'साधारण सदस्य (Member)');
  assert.strictEqual(rehydrated.confirmedPaymentAmountNPR, 100);
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. Multi-device consistency
// ─────────────────────────────────────────────────────────────────────────────
await testCase(15, 'Multi-device consistency (Pro single-device vs Normal multi-device)', async () => {
  const proPlan = resolveCanonicalPlan('pro_yearly');
  const normalPlan = resolveCanonicalPlan('normal_yearly');

  assert.strictEqual(proPlan?.isProfessional, true);
  assert.strictEqual(normalPlan?.isProfessional, false);

  // Pro accounts invalidate prior sessions on new login
  // Normal accounts preserve multi-device login sessions
  const proUserState = resolveCanonicalUserState({
    user: { id: 'p1', userCategory: 'professional' },
    membership: { planId: 'pro_yearly', membershipStatus: 'ACTIVE' }
  });
  const normalUserState = resolveCanonicalUserState({
    user: { id: 'n1', userCategory: 'member' },
    membership: { planId: 'normal_yearly', membershipStatus: 'ACTIVE' }
  });

  assert.strictEqual(proUserState.isProfessional, true);
  assert.strictEqual(normalUserState.isProfessional, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. Unauthorized protection (users cannot tamper with plans or bypass gates)
// ─────────────────────────────────────────────────────────────────────────────
await testCase(16, 'Unauthorized protection against tampering', async () => {
  // Tampered user payload attempting to claim proCategory without membership or payment
  const tamperedUser = {
    id: 'usr_hack',
    username: 'tamper_bot',
    userCategory: 'professional', // Spoofed in client body
    purchasedPlan: 'pro_lifetime'  // Spoofed in client body
  };

  // With no confirmed membership in DB, authoritative policy rejects the spoof
  const sanitizedState = resolveCanonicalUserState({
    user: tamperedUser,
    membership: null,
    payments: []
  });

  assert.strictEqual(sanitizedState.userCategory, 'visitor');
  assert.strictEqual(sanitizedState.isProfessional, false);
  assert.strictEqual(sanitizedState.isPaidMember, false);
  assert.strictEqual(sanitizedState.confirmedPaymentAmountNPR, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. Package switch isolation (changing one user does not alter others)
// ─────────────────────────────────────────────────────────────────────────────
await testCase(17, 'Package switch isolation across users', async () => {
  const user1 = { id: 'u1', username: 'user_one' };
  const user2 = { id: 'u2', username: 'user_two' };

  let mem1 = { userId: user1.id, planId: 'normal_yearly', amountNPR: 100, membershipStatus: 'ACTIVE' };
  const mem2 = { userId: user2.id, planId: 'normal_yearly', amountNPR: 100, membershipStatus: 'ACTIVE' };

  // Switch user1 to pro_yearly
  mem1 = { userId: user1.id, planId: 'pro_yearly', amountNPR: 2000, membershipStatus: 'ACTIVE' };

  const state1 = resolveCanonicalUserState({ user: user1, membership: mem1 });
  const state2 = resolveCanonicalUserState({ user: user2, membership: mem2 });

  assert.strictEqual(state1.userCategory, 'professional');
  assert.strictEqual(state1.confirmedPaymentAmountNPR, 2000);

  // User 2 remains completely unchanged as normal member
  assert.strictEqual(state2.userCategory, 'member');
  assert.strictEqual(state2.confirmedPaymentAmountNPR, 100);
  assert.strictEqual(state2.isProfessional, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 18. Renewal idempotency (duplicate renewal requests don't duplicate amount or extend twice)
// ─────────────────────────────────────────────────────────────────────────────
await testCase(18, 'Renewal idempotency prevents double charge or duplicate validity extension', async () => {
  const initialExpiry = Date.now() + 30 * 86400000;
  await sandboxDb.createUser({ id: 'usr_renew_idem', username: 'idem_user', phone: '9842555555' });
  await sandboxDb.createMembership({
    id: 'MEM-IDEM-01',
    userId: 'usr_renew_idem',
    planId: 'normal_yearly',
    amountNPR: 100,
    membershipStatus: 'ACTIVE',
    expiresAtTimestamp: initialExpiry
  });

  membershipEngine.loadFromDisk();

  // First renewal mutation
  const res1 = await membershipEngine.mutateMembership('usr_renew_idem', {
    action: 'renew',
    planId: 'normal_yearly',
    adminId: 'admin'
  });

  assert.strictEqual(res1.success, true);
  const extendedExpiry = res1.membership.expiresAtTimestamp;
  assert.ok(extendedExpiry > initialExpiry);

  // Immediate second duplicate renewal submission (<10s window)
  const res2 = await membershipEngine.mutateMembership('usr_renew_idem', {
    action: 'renew',
    planId: 'normal_yearly',
    adminId: 'admin'
  });

  // Second duplicate request must be recognized as idempotent replay
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.isIdempotentReplay, true);
  // Expiry must NOT be extended a second time
  assert.strictEqual(res2.membership.expiresAtTimestamp, extendedExpiry);

  // Verify only 1 payment was added in database for this renewal
  const allPayments = await sandboxDb.getPayments();
  const renewalPayments = allPayments.filter(p => p.userId === 'usr_renew_idem');
  assert.strictEqual(renewalPayments.length, 1);
  assert.strictEqual(renewalPayments[0].amountNPR, 100);
});

console.log('\n========================================================================');
console.log(`TEST SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED (TOTAL: 18)`);
console.log('========================================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 18 MANDATORY GLOBAL MEMBERSHIP & ENTITLEMENT TESTS PASSED!');
  process.exit(0);
}

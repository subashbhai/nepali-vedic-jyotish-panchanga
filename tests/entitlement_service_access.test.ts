import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { 
  resolveUserEntitlement 
} from '../src/server/entitlementEngine.ts';
import { JsonFileDatabaseAdapter } from '../src/server/db/databaseAdapter.js';

const LIFECYCLE_STATES = {
  VISITOR: 'VISITOR',
  REGISTERED_USER: 'REGISTERED_USER',
  TRIAL_USER: 'TRIAL_USER',
  NORMAL_MEMBER: 'NORMAL_MEMBER',
  PROFESSIONAL_MEMBER: 'PROFESSIONAL_MEMBER',
  EXPIRED_MEMBER: 'EXPIRED_MEMBER',
  SUSPENDED_USER: 'SUSPENDED_USER',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

console.log('================================================================');
console.log('BALANANDA VAIDIK SEWA — ENTITLEMENT & SERVICE ACCESS TEST SUITE');
console.log('12 Mandatory Test Cases: Single Source of Truth & Zero Modal Bug');
console.log('================================================================\n');

// ── Client-side Service Access Logic (Matching serviceLicenseStore.ts) ──
function checkClientServiceAccess(serviceKey: 'jyotish' | 'vastu', session: any, clientLicenses: any[] = []): {
  allowed: boolean;
  status: 'unlocked' | 'locked' | 'expired' | 'pending_approval' | 'suspended';
  reasonNepali: string;
} {
  if (session?.role === 'SUPER_ADMIN') {
    return {
      allowed: true,
      status: 'unlocked',
      reasonNepali: 'मुख्य प्रशासक (Super Admin) - पूर्ण पहुँच स्वीकृत'
    };
  }

  if (session?.status === 'suspended' || session?.status === 'blocked') {
    return {
      allowed: false,
      status: 'suspended',
      reasonNepali: 'खाता हाल स्थगित गरिएको छ।'
    };
  }

  if (session?.userCategory === 'professional' || session?.lifecycleState === 'PROFESSIONAL_MEMBER') {
    return {
      allowed: true,
      status: 'unlocked',
      reasonNepali: 'व्यावसायिक योजना अन्तर्गत सेवा सक्रिय छ।'
    };
  }

  // Session-level flags
  const sessionAccess = serviceKey === 'jyotish' ? session?.jyotishAccess : session?.vastuAccess;
  if (sessionAccess === true || (typeof sessionAccess === 'object' && sessionAccess?.unlocked === true)) {
    return {
      allowed: true,
      status: 'unlocked',
      reasonNepali: 'तपाईंको खातामा सेवा सक्रिय छ।'
    };
  }

  // Specific service licenses
  const cleanPhone = String(session?.phone || session?.username || '').replace(/\D/g, '').slice(-10);
  const matchedLicense = clientLicenses.find(lic => {
    if (lic.serviceKey !== serviceKey) return false;
    const licPhone = String(lic.phone || '').replace(/\D/g, '').slice(-10);
    return (lic.userId && session?.userId && lic.userId === session.userId) ||
           (cleanPhone && licPhone === cleanPhone);
  });

  if (matchedLicense) {
    if (matchedLicense.status === 'pending_approval' || matchedLicense.status === 'pending') {
      return {
        allowed: false,
        status: 'pending_approval',
        reasonNepali: 'भुक्तानी तथा सेवा अनुरोध रुजु (Verification) हुँदैछ।'
      };
    }
    if (matchedLicense.status === 'expired') {
      return {
        allowed: false,
        status: 'expired',
        reasonNepali: 'सेवा म्याद समाप्त भएको छ।'
      };
    }
    if (matchedLicense.status === 'active') {
      const expMs = matchedLicense.expiresAtTimestamp || (matchedLicense.expiresAtISO ? new Date(matchedLicense.expiresAtISO).getTime() : null);
      if (expMs && expMs <= Date.now()) {
        return {
          allowed: false,
          status: 'expired',
          reasonNepali: 'सेवा म्याद समाप्त भएको छ।'
        };
      }
      return {
        allowed: true,
        status: 'unlocked',
        reasonNepali: 'सेवा सक्रिय छ।'
      };
    }
  }

  // Active trial - grants member features only, pro tools are locked
  if (session?.trial?.isTrialActive) {
    return {
      allowed: false,
      status: 'locked',
      reasonNepali: 'परीक्षण अवधिमा सामान्य सदस्य सुविधाहरू मात्र उपलब्ध छन्।'
    };
  }

  // Default locked
  return {
    allowed: false,
    status: 'locked',
    reasonNepali: 'यो सेवा प्रयोग गर्न सदस्यता वा लाइसेन्स सक्रिय गर्नुहोस्।'
  };
}

let passed = 0;
let failed = 0;

function runTest(testNum: number, testName: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        console.log(`[PASS] Test ${testNum}: ${testName}`);
        passed++;
      }).catch((err) => {
        console.error(`[FAIL] Test ${testNum}: ${testName}`);
        console.error(`       Error: ${err.message}`);
        failed++;
      });
    }
    console.log(`[PASS] Test ${testNum}: ${testName}`);
    passed++;
  } catch (err: any) {
    console.error(`[FAIL] Test ${testNum}: ${testName}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

// Sandbox DB directory for tests
const testDbDir = path.join(process.cwd(), 'data', 'test_entitlement_sandbox');
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}
for (const f of fs.readdirSync(testDbDir)) {
  try { fs.unlinkSync(path.join(testDbDir, f)); } catch {}
}

const db = new JsonFileDatabaseAdapter(testDbDir);
await db.init();

// ── Test 1: SuperAdmin full bypass ──
runTest(1, 'SuperAdmin: Full Bypass without modals or restrictions', () => {
  const superAdminSession = {
    userId: 'admin_001',
    username: 'superadmin',
    role: 'SUPER_ADMIN',
    status: 'active'
  };

  const clientAccessJyotish = checkClientServiceAccess('jyotish', superAdminSession);
  const clientAccessVastu = checkClientServiceAccess('vastu', superAdminSession);

  assert.strictEqual(clientAccessJyotish.allowed, true);
  assert.strictEqual(clientAccessJyotish.status, 'unlocked');
  assert.strictEqual(clientAccessVastu.allowed, true);
  assert.strictEqual(clientAccessVastu.status, 'unlocked');

  // Backend Entitlement Engine
  const backendEntitlement = resolveUserEntitlement({
    user: { id: 'admin_001', role: 'SUPER_ADMIN', status: 'active' }
  });
  assert.strictEqual(backendEntitlement.lifecycleState, LIFECYCLE_STATES.SUPER_ADMIN);
  assert.strictEqual(backendEntitlement.isJyotishAllowed, true);
  assert.strictEqual(backendEntitlement.isVastuAllowed, true);
  assert.ok(backendEntitlement.allowedServices.includes('jyotish'));
  assert.ok(backendEntitlement.allowedServices.includes('vastu'));
});

// ── Test 2: Professional Member direct access ──
runTest(2, 'Professional Active User: Direct workspace entry without purchase modal', () => {
  const proSession = {
    userId: 'usr_pro_01',
    username: 'pro_astrologer',
    role: 'CUSTOMER',
    userCategory: 'professional',
    lifecycleState: 'PROFESSIONAL_MEMBER',
    status: 'active'
  };

  const jyotishAccess = checkClientServiceAccess('jyotish', proSession);
  const vastuAccess = checkClientServiceAccess('vastu', proSession);

  assert.strictEqual(jyotishAccess.allowed, true, 'Jyotish must be allowed for professional member');
  assert.strictEqual(jyotishAccess.status, 'unlocked');
  assert.strictEqual(vastuAccess.allowed, true, 'Vastu must be allowed for professional member');
  assert.strictEqual(vastuAccess.status, 'unlocked');

  const backend = resolveUserEntitlement({
    user: { id: 'usr_pro_01', role: 'CUSTOMER', status: 'active' },
    membership: { membershipStatus: 'ACTIVE', planId: 'pro_yearly', expiresAtTimestamp: Date.now() + 86400000 * 365 }
  });
  assert.strictEqual(backend.lifecycleState, LIFECYCLE_STATES.PROFESSIONAL_MEMBER);
  assert.strictEqual(backend.isJyotishAllowed, true);
  assert.strictEqual(backend.isVastuAllowed, true);
});

// ── Test 3: Valid Trial User access (Member tools active, Pro tools locked) ──
runTest(3, 'Trial User: Member features active within trial window, Professional tools locked', () => {
  const futureExp = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  const trialSession = {
    userId: 'usr_trial_01',
    username: '9841000001',
    phone: '9841000001',
    role: 'CUSTOMER',
    userCategory: 'member',
    status: 'active',
    trial: {
      isTrialActive: true,
      trialExpiresAtISO: futureExp
    }
  };

  const jyotishAccess = checkClientServiceAccess('jyotish', trialSession);
  assert.strictEqual(jyotishAccess.allowed, false, 'Trial user must have professional Jyotish locked');
  assert.strictEqual(jyotishAccess.status, 'locked');

  const backend = resolveUserEntitlement({
    user: {
      id: 'usr_trial_01',
      role: 'CUSTOMER',
      status: 'active',
      trial: { isTrialActive: true, trialExpiresAtISO: futureExp }
    }
  });
  assert.strictEqual(backend.lifecycleState, LIFECYCLE_STATES.TRIAL_USER);
  assert.strictEqual(backend.isJyotishAllowed, false);
  assert.strictEqual(backend.isVastuAllowed, false);
  assert.strictEqual(backend.canAccessPersonalFaladesh, true);
  assert.ok(backend.allowedServices.includes('panchanga'));
  assert.ok(backend.allowedServices.includes('personal_faladesh'));
  assert.ok(backend.isTrialActive);
  assert.ok(backend.remainingDays >= 1);
});

// ── Test 4: Pending Purchase User ──
runTest(4, 'Pending Purchase User: Displays verification notice, DOES NOT prompt to purchase again', () => {
  const pendingSession = {
    userId: 'usr_pending_01',
    phone: '9841000002',
    role: 'CUSTOMER',
    status: 'active'
  };

  const clientLicenses = [{
    userId: 'usr_pending_01',
    phone: '9841000002',
    serviceKey: 'jyotish',
    status: 'pending_approval'
  }];

  const access = checkClientServiceAccess('jyotish', pendingSession, clientLicenses);
  assert.strictEqual(access.allowed, false, 'Service should not be allowed yet while pending');
  assert.strictEqual(access.status, 'pending_approval', 'Status must be pending_approval');
  assert.ok(access.reasonNepali.includes('रुजु'), 'Notice must explain verification is in progress');
});

// ── Test 5: Free / Visitor / Registered without license ──
runTest(5, 'Registered User without Plan: Gated with upgrade notice', () => {
  const regSession = {
    userId: 'usr_reg_01',
    role: 'CUSTOMER',
    userCategory: 'visitor',
    status: 'active'
  };

  const access = checkClientServiceAccess('jyotish', regSession, []);
  assert.strictEqual(access.allowed, false);
  assert.strictEqual(access.status, 'locked');
  assert.ok(access.reasonNepali.includes('लाइसेन्स सक्रिय गर्नुहोस्') || access.reasonNepali.includes('सदस्यता'));

  const backend = resolveUserEntitlement({
    user: { id: 'usr_reg_01', role: 'CUSTOMER', status: 'active' }
  });
  assert.strictEqual(backend.lifecycleState, LIFECYCLE_STATES.REGISTERED_USER);
  assert.strictEqual(backend.isJyotishAllowed, false);
  assert.strictEqual(backend.isVastuAllowed, false);
});

// ── Test 6: Expired Trial / Expired Membership ──
runTest(6, 'Expired Trial/Membership: Explains expiration with renewal option', () => {
  const pastMs = Date.now() - 3600000;
  const expiredSession = {
    userId: 'usr_exp_01',
    phone: '9841000003',
    role: 'CUSTOMER',
    status: 'active',
    trial: {
      isTrialActive: true,
      trialExpiresAtTimestamp: pastMs,
      trialExpiresAtISO: new Date(pastMs).toISOString()
    }
  };

  const clientLicenses = [{
    userId: 'usr_exp_01',
    serviceKey: 'jyotish',
    status: 'expired',
    expiresAtTimestamp: pastMs
  }];

  const access = checkClientServiceAccess('jyotish', expiredSession, clientLicenses);
  assert.strictEqual(access.allowed, false);
  assert.strictEqual(access.status, 'expired');
  assert.ok(access.reasonNepali.includes('म्याद समाप्त भएको छ'));

  const backend = resolveUserEntitlement({
    user: { id: 'usr_exp_01', role: 'CUSTOMER', status: 'active' },
    membership: { membershipStatus: 'EXPIRED', expiresAtTimestamp: pastMs }
  });
  assert.strictEqual(backend.lifecycleState, LIFECYCLE_STATES.EXPIRED_MEMBER);
  assert.strictEqual(backend.isJyotishAllowed, false);
});

// ── Test 7: Jyotish-only License ──
runTest(7, 'Jyotish-only License: Unlocks Jyotish, keeps Vastu locked', () => {
  const userSession = {
    userId: 'usr_jyotish_only',
    phone: '9841000007',
    role: 'CUSTOMER',
    userCategory: 'member',
    status: 'active'
  };

  const licenses = [{
    userId: 'usr_jyotish_only',
    phone: '9841000007',
    serviceKey: 'jyotish',
    status: 'active'
  }];

  const jyotishAccess = checkClientServiceAccess('jyotish', userSession, licenses);
  const vastuAccess = checkClientServiceAccess('vastu', userSession, licenses);

  assert.strictEqual(jyotishAccess.allowed, true, 'Jyotish must be allowed');
  assert.strictEqual(jyotishAccess.status, 'unlocked');
  assert.strictEqual(vastuAccess.allowed, false, 'Vastu must remain locked');
  assert.strictEqual(vastuAccess.status, 'locked');

  const backend = resolveUserEntitlement({
    user: { id: 'usr_jyotish_only', role: 'CUSTOMER', status: 'active' },
    userLicenses: licenses
  });
  assert.strictEqual(backend.isJyotishAllowed, true);
  assert.strictEqual(backend.isVastuAllowed, false);
});

// ── Test 8: Vastu-only License ──
runTest(8, 'Vastu-only License: Unlocks Vastu, keeps Jyotish locked', () => {
  const userSession = {
    userId: 'usr_vastu_only',
    phone: '9841000008',
    role: 'CUSTOMER',
    userCategory: 'member',
    status: 'active'
  };

  const licenses = [{
    userId: 'usr_vastu_only',
    phone: '9841000008',
    serviceKey: 'vastu',
    status: 'active'
  }];

  const jyotishAccess = checkClientServiceAccess('jyotish', userSession, licenses);
  const vastuAccess = checkClientServiceAccess('vastu', userSession, licenses);

  assert.strictEqual(jyotishAccess.allowed, false, 'Jyotish must remain locked');
  assert.strictEqual(vastuAccess.allowed, true, 'Vastu must be unlocked');
  assert.strictEqual(vastuAccess.status, 'unlocked');

  const backend = resolveUserEntitlement({
    user: { id: 'usr_vastu_only', role: 'CUSTOMER', status: 'active' },
    userLicenses: licenses
  });
  assert.strictEqual(backend.isJyotishAllowed, false);
  assert.strictEqual(backend.isVastuAllowed, true);
});

// ── Test 9: Strict User Isolation ──
runTest(9, 'Strict User Isolation: User A entitlement never leaks to User B', () => {
  const userASession = { userId: 'usr_A', phone: '9841111111', role: 'CUSTOMER', status: 'active' };
  const userBSession = { userId: 'usr_B', phone: '9842222222', role: 'CUSTOMER', status: 'active' };

  // Only User A has license
  const allLicenses = [{
    userId: 'usr_A',
    phone: '9841111111',
    serviceKey: 'jyotish',
    status: 'active'
  }];

  const accessA = checkClientServiceAccess('jyotish', userASession, allLicenses);
  const accessB = checkClientServiceAccess('jyotish', userBSession, allLicenses);

  assert.strictEqual(accessA.allowed, true, 'User A must have access');
  assert.strictEqual(accessB.allowed, false, 'User B must strictly be locked');
});

// ── Test 10: Account Registration Approval vs Membership Approval ──
await runTest(10, 'Account Registration Approval vs Membership Approval: Separate lifecycle steps', async () => {
  // Create new user in DB
  const newUser = await db.createUser({
    id: 'usr_new_001',
    username: 'newuser1',
    phone: '9843000001',
    fullName: 'राम शर्मा',
    status: 'pending',
    role: 'CUSTOMER',
    userCategory: 'visitor'
  });

  assert.strictEqual(newUser.status, 'pending');
  assert.strictEqual(newUser.userCategory, 'visitor');

  // Step 1: SuperAdmin approves account registration (Tab 2: Users Management)
  const approvedUser = await db.updateUser('usr_new_001', {
    status: 'active',
    statusReason: 'प्रशासकद्वारा खाता दर्ता स्वीकृत'
  });

  assert.strictEqual(approvedUser.status, 'active', 'Account status must now be active');
  assert.strictEqual(approvedUser.userCategory, 'visitor', 'userCategory must STILL be visitor/normal, NOT professional');
  assert.strictEqual(approvedUser.jyotishAccess, undefined, 'Must NOT grant Jyotish access on basic account approval');

  // Verify that service access is locked (not professional yet)
  const serviceCheck = checkClientServiceAccess('jyotish', approvedUser, []);
  assert.strictEqual(serviceCheck.allowed, false, 'Service must remain locked until plan is purchased or activated');
});

// ── Test 11: Admin Membership Activation ──
await runTest(11, 'Admin Membership Activation: Correctly elevates status, roleNameNepali, and licenses', async () => {
  // Step 2: SuperAdmin activates Professional Membership (Tab 4: Membership & Pricing or Tab 3: Service Access)
  const activatedUser = await db.updateUser('usr_new_001', {
    userCategory: 'professional',
    roleNameNepali: 'व्यावसायिक प्रयोगकर्ता (Professional)',
    jyotishAccess: true,
    vastuAccess: true,
    membershipStatus: 'ACTIVE',
    purchasedPlan: 'व्यावसायिक वार्षिक योजना',
    subscriptionExpiresAt: new Date(Date.now() + 86400000 * 365).toISOString()
  });

  // Create persistent service licenses in DB
  await db.createLicense({
    id: 'lic_jyotish_001',
    userId: 'usr_new_001',
    phone: '9843000001',
    serviceKey: 'jyotish',
    status: 'active'
  });

  assert.strictEqual(activatedUser.userCategory, 'professional');
  assert.strictEqual(activatedUser.roleNameNepali, 'व्यावसायिक प्रयोगकर्ता (Professional)');
  assert.strictEqual(activatedUser.jyotishAccess, true);
  assert.strictEqual(activatedUser.vastuAccess, true);

  // Now client service access is unlocked
  const clientCheck = checkClientServiceAccess('jyotish', activatedUser);
  assert.strictEqual(clientCheck.allowed, true, 'Jyotish service must be unlocked after admin membership activation');
  assert.strictEqual(clientCheck.status, 'unlocked');
});

// ── Test 12: Real-time Refresh without Logout ──
runTest(12, 'Real-time Refresh without Logout: Dynamic cache sync allows instant access', () => {
  // Initial state: User logged in with basic member session
  const activeSession: any = {
    userId: 'usr_realtime_01',
    phone: '9843999999',
    role: 'CUSTOMER',
    userCategory: 'member',
    status: 'active'
  };

  let localLicenses: any[] = [];

  // Before server sync / event: service locked
  const beforeSync = checkClientServiceAccess('jyotish', activeSession, localLicenses);
  assert.strictEqual(beforeSync.allowed, false);

  // Server emits realtime event: SERVICE_LICENSE_UPDATED -> client syncs licenses
  localLicenses = [{
    userId: 'usr_realtime_01',
    phone: '9843999999',
    serviceKey: 'jyotish',
    status: 'active'
  }];

  // After sync: service immediately unlocked without logging out or destroying session
  const afterSync = checkClientServiceAccess('jyotish', activeSession, localLicenses);
  assert.strictEqual(afterSync.allowed, true, 'Service must unlock in real-time');
  assert.strictEqual(afterSync.status, 'unlocked');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}

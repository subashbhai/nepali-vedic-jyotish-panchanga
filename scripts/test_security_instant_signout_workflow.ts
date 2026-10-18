/**
 * Security Verification Test Suite:
 * Instant Millisecond Force Signout & Visitor Mode Reversion
 * Triggered on Super Admin: Data Delete, Lock (Suspension), De-activation (Inactive)
 */

// Setup Mock Browser Environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: any) => { 
      store[key] = (value !== undefined && value !== null) ? value.toString() : ''; 
    },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

class MockBroadcastChannel {
  name: string;
  onmessage: ((ev: any) => void) | null = null;
  constructor(name: string) { this.name = name; }
  postMessage(data: any) {}
  close() {}
}

const windowListeners: Record<string, Function[]> = {};

const windowMock: any = {
  localStorage: localStorageMock,
  navigator: { platform: 'Win32', appName: 'Netscape', userAgent: 'Node' },
  addEventListener: (event: string, cb: Function) => {
    if (!windowListeners[event]) windowListeners[event] = [];
    windowListeners[event].push(cb);
  },
  removeEventListener: (event: string, cb: Function) => {
    if (windowListeners[event]) {
      windowListeners[event] = windowListeners[event].filter(fn => fn !== cb);
    }
  },
  dispatchEvent: (event: any) => {
    const list = windowListeners[event.type] || [];
    list.forEach(cb => cb(event));
    return true;
  },
  location: { search: '', pathname: '/', hash: '' },
  BroadcastChannel: MockBroadcastChannel,
  EventSource: class {
    url: string;
    onmessage: any = null;
    onerror: any = null;
    constructor(url: string) { this.url = url; }
    close() {}
  }
};

(global as any).window = windowMock;
(global as any).localStorage = localStorageMock;
(global as any).sessionStorage = localStorageMock;
(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};
(global as any).BroadcastChannel = MockBroadcastChannel;

import { 
  registerRBACAccount, 
  getStoredRBACUsers, 
  getActiveRBACSession, 
  setRBACSession, 
  clearRBACSession,
  authenticateRBACUser 
} from '../src/db/rbacStore';
import { unifiedUserSyncService } from '../src/services/unifiedUserSyncService';
import { isPermanentlyDeleted } from '../src/db/securityBlacklist';
import { authenticateUnifiedUser } from '../src/db/unifiedSecurityBridge';

async function runSecurityTests() {
  console.log('========================================================================');
  console.log('🛡️ SECURITY VERIFICATION: MILLISECOND FORCE SIGNOUT & VISITOR DOWNGRADE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  // --- PHASE 1: User Registration & Initial Active Session ---
  console.log('--- PHASE 1: User Registration & Active Sign-In ---');
  const testPhone = '9841999888';
  const testPassword = 'Password#123';
  const regResult = registerRBACAccount({
    fullName: 'राम शरण अधिकारी',
    phone: testPhone,
    password: testPassword,
    address: 'काठमाडौँ-१०, बानेश्वर',
    role: 'CUSTOMER'
  });

  assert(regResult.success === true, '1.1 User successfully registered');
  const user = regResult.user!;
  assert(user.phone === testPhone, '1.2 Registered phone matches');

  // Authenticate user
  const authRes = authenticateRBACUser(testPhone, testPassword);
  assert(authRes.success === true, '1.3 Authentication successful');
  assert(!!authRes.session, '1.4 Session generated on login');

  // Set active session in client storage
  setRBACSession(authRes.session!);
  localStorage.setItem('software_full_access_unlocked_v1', 'true');
  const initialSession = getActiveRBACSession();
  assert(!!initialSession && initialSession.userId === user.id, '1.5 Active session verified in client storage');

  // --- PHASE 2: Super Admin Locks (Suspends) User ---
  console.log('\n--- PHASE 2: Super Admin Locks (Suspension) User ---');
  let forceSignoutEventTriggered: boolean = false;
  let forceSignoutDetail: any = null;

  windowMock.addEventListener('user-force-logout', (ev: any) => {
    forceSignoutEventTriggered = true;
    forceSignoutDetail = ev.detail;
  });

  const t0 = Date.now();
  const lockResult = unifiedUserSyncService.updateUserAccountStatus(testPhone, 'suspended', 'भुक्तानी कैफियत तथा नियम उल्लंघनका कारण खाता निलम्बन');
  const elapsedLockMs = Date.now() - t0;

  assert(lockResult === true, '2.1 updateUserAccountStatus lock returns true');
  assert(elapsedLockMs < 50, `2.2 Lock executed in milliseconds (${elapsedLockMs}ms)`);
  assert((forceSignoutEventTriggered as any) === true, '2.3 Instant user-force-logout event dispatched');
  assert(forceSignoutDetail?.action === 'suspended', '2.4 Event detail action is suspended');

  // Verify client session is wiped
  const sessionAfterLock = getActiveRBACSession();
  assert(sessionAfterLock === null, '2.5 Active session immediately wiped (Reverted to null / Visitor Mode)');
  assert(localStorage.getItem('software_full_access_unlocked_v1') === null, '2.6 Full access software unlock flag cleared');

  // Verify re-login is strictly blocked
  const reLoginAfterLock = authenticateUnifiedUser(testPhone, testPassword);
  assert(reLoginAfterLock.success === false, '2.7 Re-login blocked for suspended user');
  assert(reLoginAfterLock.message.includes('निलम्बन') || reLoginAfterLock.message.includes('Lock'), '2.8 Clear Nepali security error message returned');

  // --- PHASE 3: Reactivation ---
  console.log('\n--- PHASE 3: Super Admin Reactivates User ---');
  forceSignoutEventTriggered = false;
  const reactivateResult = unifiedUserSyncService.updateUserAccountStatus(testPhone, 'active');
  assert(reactivateResult === true, '3.1 Account reactivated by Super Admin');

  const reLoginAfterActivate = authenticateUnifiedUser(testPhone, testPassword);
  assert(reLoginAfterActivate.success === true, '3.2 User can log in once reactivated');
  setRBACSession(reLoginAfterActivate.session!);
  assert(!!getActiveRBACSession(), '3.3 Active session restored for reactivated user');

  // --- PHASE 4: Super Admin Deactivates User (Inactive) ---
  console.log('\n--- PHASE 4: Super Admin Deactivates User (Inactive) ---');
  forceSignoutEventTriggered = false;
  const t1 = Date.now();
  const deactiveResult = unifiedUserSyncService.updateUserAccountStatus(testPhone, 'inactive', 'ग्राहकको व्यक्तिगत अनुरोधमा खाता निष्क्रिय');
  const elapsedDeactiveMs = Date.now() - t1;

  assert(deactiveResult === true, '4.1 updateUserAccountStatus inactive returns true');
  assert(elapsedDeactiveMs < 50, `4.2 Deactivation executed in milliseconds (${elapsedDeactiveMs}ms)`);
  assert((forceSignoutEventTriggered as any) === true, '4.3 user-force-logout dispatched on deactivation');
  assert(forceSignoutDetail?.action === 'inactive', '4.4 Event action is inactive');

  const sessionAfterDeactive = getActiveRBACSession();
  assert(sessionAfterDeactive === null, '4.5 Active session wiped immediately on deactivation (Visitor Mode)');

  const reLoginAfterDeactive = authenticateUnifiedUser(testPhone, testPassword);
  assert(reLoginAfterDeactive.success === false, '4.6 Re-login blocked for inactive user');
  assert(reLoginAfterDeactive.message.includes('निष्क्रिय'), '4.7 Message explains account is inactive');

  // --- PHASE 5: Super Admin Permanent Deletion ---
  console.log('\n--- PHASE 5: Super Admin Permanent Deletion ---');
  // First reactivate and sign in to test live purge on delete
  unifiedUserSyncService.updateUserAccountStatus(testPhone, 'active');
  const authForDel = authenticateUnifiedUser(testPhone, testPassword);
  setRBACSession(authForDel.session!);
  assert(!!getActiveRBACSession(), '5.1 Session active before permanent deletion');

  forceSignoutEventTriggered = false;
  const t2 = Date.now();
  const deleteResult = unifiedUserSyncService.deleteUserPermanently(user.id, testPhone);
  const elapsedDelMs = Date.now() - t2;

  assert(deleteResult === true, '5.2 deleteUserPermanently returns true');
  assert(elapsedDelMs < 50, `5.3 Deletion executed in milliseconds (${elapsedDelMs}ms)`);
  assert((forceSignoutEventTriggered as any) === true, '5.4 user-force-logout dispatched on deletion');
  assert(forceSignoutDetail?.action === 'deleted', '5.5 Action marked as deleted');

  const sessionAfterDelete = getActiveRBACSession();
  assert(sessionAfterDelete === null, '5.6 Active session wiped on deletion (Visitor Mode)');
  assert(isPermanentlyDeleted(testPhone) === true, '5.7 Phone added to permanent security blacklist');
  assert(isPermanentlyDeleted(user.id) === true, '5.8 User ID added to permanent security blacklist');

  const reLoginAfterDelete = authenticateUnifiedUser(testPhone, testPassword);
  assert(reLoginAfterDelete.success === false, '5.9 Re-login permanently rejected for deleted user');
  assert(reLoginAfterDelete.message.includes('स्थायी रूपमा हटाइएको'), '5.10 Blacklist error message returned');

  // --- PHASE 6: Liveness Session Validator Heartbeat ---
  console.log('\n--- PHASE 6: Liveness Session Validator Heartbeat ---');
  // Fake an active session with blacklisted user to test heartbeat detection
  localStorage.setItem('balananda_rbac_session_v2', JSON.stringify({
    userId: user.id,
    phone: testPhone,
    username: testPhone,
    role: 'CUSTOMER'
  }));

  const livenessCheck = unifiedUserSyncService.validateActiveSessionLiveness();
  assert(livenessCheck === false, '6.1 Liveness validator caught invalid session');
  assert(getActiveRBACSession() === null, '6.2 Liveness validator purged blacklisted session');

  console.log('\n========================================================================');
  console.log(`🏁 TEST RESULTS: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL SECURITY FORCE-SIGNOUT & VISITOR DOWNGRADE TESTS PASSED WITH 100% SUCCESS!');
  } else {
    process.exit(1);
  }
}

runSecurityTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

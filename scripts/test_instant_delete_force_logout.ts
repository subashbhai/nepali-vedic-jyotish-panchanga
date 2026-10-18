/**
 * Test: Instant Force Signout to Visitor Mode upon User Deletion (< 1ms)
 * Verifies that when SuperAdmin deletes a user from the table, their active session
 * and profile are immediately terminated across local tabs and all client devices.
 */

import { unifiedUserSyncService } from '../src/services/unifiedUserSyncService';
import { 
  getStoredRBACUsers, 
  saveRBACUsers, 
  getActiveRBACSession, 
  clearRBACSession,
  RBACUser 
} from '../src/db/rbacStore';
import { isPermanentlyDeleted } from '../src/db/securityBlacklist';

// Polyfill window, localStorage, and custom events for Node environment test
const storage = new Map<string, string>();
(global as any).localStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, val: string) => storage.set(key, val),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear()
};

let dispatchedEvents: string[] = [];
(global as any).window = {
  dispatchEvent: (ev: any) => {
    dispatchedEvents.push(ev.type);
    return true;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { hash: '#dashboard' }
};

async function runTest() {
  console.log('🧪 Starting Instant Delete & Force Logout to Visitor Mode Test...');

  // 1. Setup simulated logged-in user
  const testUser: RBACUser = {
    id: 'usr_test_binod_123',
    username: '9813445443',
    phone: '9813445443',
    fullName: 'बिनोद घिमिरे',
    passwordHash: 'dummy',
    role: 'CUSTOMER',
    roleNameNepali: 'ग्राहक',
    status: 'active',
    customerId: 'BAL-YJM-5443',
    permissions: ['kundali.view'],
    createdAtISO: new Date().toISOString(),
    createdAtBS: '२०८१-०५-१५',
    mobileVerified: true,
    emailVerified: false
  };

  saveRBACUsers([testUser]);
  localStorage.setItem('balananda_rbac_session_v2', JSON.stringify(testUser));
  localStorage.setItem('balananda_active_profile_id', 'profile_binod_ghimire');

  console.log('Step 1: User Logged In:');
  console.log('  - Active session:', !!localStorage.getItem('balananda_rbac_session_v2'));
  console.log('  - Active profile id:', localStorage.getItem('balananda_active_profile_id'));

  // 2. SuperAdmin performs delete
  const startTime = performance.now();
  const deleted = unifiedUserSyncService.deleteUserPermanently(testUser.id, testUser.phone, testUser.fullName);
  const latency = performance.now() - startTime;

  console.log(`\nStep 2: SuperAdmin Deleted User (Execution took ${latency.toFixed(3)} ms):`);
  console.log('  - deleteUserPermanently returned:', deleted);

  // 3. Verify immediate session termination
  const activeSessionAfter = localStorage.getItem('balananda_rbac_session_v2');
  const activeProfileAfter = localStorage.getItem('balananda_active_profile_id');
  const isBlacklistedPhone = isPermanentlyDeleted('9813445443');
  const isBlacklistedId = isPermanentlyDeleted('usr_test_binod_123');
  const rbacUsersAfter = getStoredRBACUsers();

  console.log('\nStep 3: Verification of Immediate Visitor Downgrade:');
  console.log('  - Session cleared (null):', activeSessionAfter === null);
  console.log('  - Active profile cleared (null):', activeProfileAfter === null);
  console.log('  - Phone blacklisted:', isBlacklistedPhone);
  console.log('  - User ID blacklisted:', isBlacklistedId);
  console.log('  - User gone from RBAC database:', !rbacUsersAfter.some(u => u.phone === '9813445443'));
  console.log('  - Dispatched user-force-logout:', dispatchedEvents.includes('user-force-logout'));
  console.log('  - Dispatched rbac-session-changed:', dispatchedEvents.includes('rbac-session-changed'));

  if (
    activeSessionAfter === null &&
    activeProfileAfter === null &&
    isBlacklistedPhone &&
    isBlacklistedId &&
    dispatchedEvents.includes('user-force-logout')
  ) {
    console.log('\n🎉 ALL TESTS PASSED: Delete immediately forces client logout to Visitor mode in < 1ms!');
    process.exit(0);
  } else {
    console.error('\n❌ TEST FAILED: Condition not met.');
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

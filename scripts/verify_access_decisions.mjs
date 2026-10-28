/**
 * Phase 2: Verify Effective Entitlements & Access Decisions
 * Strictly tests access control for the unpaid test account and verifies protected APIs.
 */

import assert from 'node:assert';

const API_BASE = 'https://balananda-api.onrender.com';
const TEST_USER = {
  username: 'audit_test_user',
  phone: '9801234567',
  password: 'BalanandaLiveTest#2081'
};

async function verifyAccess() {
  console.log('================================================================');
  console.log('PHASE 2: VERIFY ACTUAL ACCESS DECISIONS');
  console.log('Target:', API_BASE);
  console.log('================================================================\n');

  // 1. Authenticate with username
  console.log('1. Testing Login via Username...');
  const userLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: TEST_USER.username,
      password: TEST_USER.password
    })
  });
  const userLogin = await userLoginRes.json();
  assert.strictEqual(userLogin.success, true, 'User login via username must succeed');
  const userToken = userLogin.token;
  console.log('✔ Login via username succeeded. User ID:', userLogin.session?.userId);

  // 2. Authenticate with mobile
  console.log('\n2. Testing Login via Mobile Number...');
  const phoneLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: TEST_USER.phone,
      password: TEST_USER.password
    })
  });
  const phoneLogin = await phoneLoginRes.json();
  assert.strictEqual(phoneLogin.success, true, 'User login via phone must succeed');
  console.log('✔ Login via phone succeeded.');

  // 3. Check /api/entitlements
  console.log('\n3. Verifying /api/entitlements...');
  const entRes = await fetch(`${API_BASE}/api/entitlements`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const entData = await entRes.json();
  const ent = entData.entitlement;
  console.log('Entitlement Response:', JSON.stringify(ent, null, 2));

  assert.strictEqual(ent.hasActiveMembership, false, 'hasActiveMembership must be FALSE');
  assert.strictEqual(ent.isJyotishAllowed, false, 'isJyotishAllowed must be FALSE');
  assert.strictEqual(ent.isVastuAllowed, false, 'isVastuAllowed must be FALSE');
  assert.strictEqual(ent.isProfessionalToolsAllowed, false, 'isProfessionalToolsAllowed must be FALSE');
  assert.strictEqual(ent.lifecycleState, 'REGISTERED_USER', 'lifecycleState must be REGISTERED_USER');
  console.log('✔ Entitlements strictly enforce unpaid REGISTERED_USER state.');

  // 4. Check Protected License Check Endpoint
  console.log('\n4. Verifying /api/licenses/check...');
  const licJyotishRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=jyotish`);
  const licJyotish = await licJyotishRes.json();
  assert.strictEqual(licJyotish.allowed, false, 'Jyotish license allowed must be false');
  assert.strictEqual(licJyotish.status, 'locked', 'Jyotish license status must be locked');

  const licVastuRes = await fetch(`${API_BASE}/api/licenses/check?userId=${TEST_USER.phone}&serviceKey=vastu`);
  const licVastu = await licVastuRes.json();
  assert.strictEqual(licVastu.allowed, false, 'Vastu license allowed must be false');
  assert.strictEqual(licVastu.status, 'locked', 'Vastu license status must be locked');
  console.log('✔ License check endpoints independently enforce locked status.');

  // 5. Test Ordinary Registration Functionality (Non-destructive validation)
  console.log('\n5. Verifying Registration Route Validation...');
  // Testing phone validation rejection for duplicate/invalid phone
  const dupRegRes = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'audit_test_user',
      phone: '9801234567',
      password: 'SomePassword123!',
      fullName: 'Duplicate User Test',
      address: 'Kathmandu'
    })
  });
  const dupRegData = await dupRegRes.json();
  assert.strictEqual(dupRegRes.ok, false, 'Duplicate registration must be rejected with 400');
  console.log('✔ Registration duplicate protection functional (Rejected duplicate with:', dupRegData.error, ')');

  console.log('\n================================================================');
  console.log('PHASE 2 ACCESS DECISION VERIFICATION PASSED PERFECTLY!');
  console.log('================================================================');
}

verifyAccess().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

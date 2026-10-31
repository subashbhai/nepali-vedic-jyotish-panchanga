import fetch from 'node-fetch';
import { getDatabaseAdapter } from '../src/server/db/databaseAdapter';

const API_BASE = 'http://localhost:3000';

async function runSuperAdminVerification() {
  console.log('======================================================================');
  console.log(' VERIFYING SUPER ADMIN USER TABLE & DATABASE ADAPTER DATA FLOW');
  console.log('======================================================================\n');

  const db = getDatabaseAdapter();
  await db.init();

  const timestamp = Date.now().toString().slice(-6);
  const testUsername = `admin_test_${timestamp}`;
  const testPhone = `9800${timestamp}`;
  const testPassword = 'Password#123';
  const testFullName = `सुपरएडमिन परीक्षण प्रयोगकर्ता ${timestamp}`;
  const testAddress = 'काठमाडौँ, नेपाल';

  // 1. Register new user
  console.log('1. Registering new test user via POST /api/auth/register...');
  const regRes = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: testFullName,
      address: testAddress,
      mobileNumber: testPhone,
      username: testUsername,
      password: testPassword
    })
  });
  const regData: any = await regRes.json();
  if (!regRes.ok || !regData.success) {
    throw new Error(`Registration failed: ${regData.message || JSON.stringify(regData)}`);
  }
  const registeredUserId = regData.user.id;
  const userToken = regData.token;
  console.log(`   [PASS] User registered successfully (ID: ${registeredUserId}, Token: ${userToken.slice(0, 8)}...)\n`);

  // 2. Verify database adapter persistence
  console.log('2. Verifying user persistence in Database Adapter...');
  const dbUser = await db.getUserById(registeredUserId);
  if (!dbUser) {
    throw new Error(`User ${registeredUserId} was NOT found in database adapter!`);
  }
  if (dbUser.username.toLowerCase() !== testUsername.toLowerCase()) {
    throw new Error(`Database username mismatch: expected ${testUsername}, got ${dbUser.username}`);
  }
  console.log(`   [PASS] User found in database adapter (Username: ${dbUser.username}, Category: ${dbUser.userCategory})\n`);

  // 3. Super Admin Login
  console.log('3. Logging in as Super Admin via POST /api/superadmin/login...');
  const adminLoginRes = await fetch(`${API_BASE}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'Balananda#Vaidik2083!SuperAdmin@SecureKey$'
    })
  });
  const adminLoginData: any = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminLoginData.success || !adminLoginData.token) {
    throw new Error(`Superadmin login failed: ${adminLoginData.error}`);
  }
  const adminToken = adminLoginData.token;
  console.log(`   [PASS] Superadmin authenticated (Admin Token: ${adminToken.slice(0, 8)}...)\n`);

  // 4. Unauthorized / Forbidden RBAC Checks
  console.log('4. Verifying RBAC Security on GET /api/superadmin/users...');
  const unauthRes = await fetch(`${API_BASE}/api/superadmin/users`);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401 Unauthorized for missing token, got ${unauthRes.status}`);
  }
  console.log('   [PASS] Unauthenticated request correctly rejected with 401');

  const visitorRes = await fetch(`${API_BASE}/api/superadmin/users`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (visitorRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for ordinary user token, got ${visitorRes.status}`);
  }
  console.log('   [PASS] Ordinary user token correctly rejected with 403 Forbidden\n');

  // 5. Query Super Admin Users with valid admin token
  console.log('5. Querying Super Admin Users via GET /api/superadmin/users with Admin Token...');
  const adminUsersRes = await fetch(`${API_BASE}/api/superadmin/users?search=${testUsername}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (!adminUsersRes.ok) {
    throw new Error(`GET /api/superadmin/users failed with status ${adminUsersRes.status}`);
  }
  const adminUsersData: any = await adminUsersRes.json();
  if (!adminUsersData.success || !Array.isArray(adminUsersData.users)) {
    throw new Error(`Invalid response format from /api/superadmin/users: ${JSON.stringify(adminUsersData)}`);
  }
  const foundUser = adminUsersData.users.find((u: any) => u.username === testUsername || u.id === registeredUserId);
  if (!foundUser) {
    throw new Error(`Registered user ${testUsername} NOT FOUND in Super Admin user list! Total returned: ${adminUsersData.users.length}`);
  }
  console.log(`   [PASS] Newly registered user FOUND in Super Admin user list!`);
  console.log(`          Name: ${foundUser.fullName} | Mobile: ${foundUser.phone} | Category: ${foundUser.userCategory} | Plan: ${foundUser.purchasedPlan}\n`);

  // 6. Super Admin updates Category to Member
  console.log('6. Updating user category to "member" via POST /api/admin/users/:id/category...');
  const catRes = await fetch(`${API_BASE}/api/admin/users/${registeredUserId}/category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      category: 'member',
      reason: 'सफल प्रमाणीकरण'
    })
  });
  const catData: any = await catRes.json();
  if (!catRes.ok || !catData.success) {
    throw new Error(`Category update failed: ${catData.error || catData.message}`);
  }
  console.log(`   [PASS] User category updated to "member"\n`);

  // 7. Verify category change in Database Adapter
  console.log('7. Verifying updated category in Database Adapter...');
  const updatedDbUser = await db.getUserById(registeredUserId);
  if (updatedDbUser.userCategory !== 'member') {
    throw new Error(`Database adapter does not reflect updated category! Got: ${updatedDbUser.userCategory}`);
  }
  console.log(`   [PASS] Database adapter confirms userCategory = "${updatedDbUser.userCategory}"\n`);

  // 8. Super Admin updates Payment Amount
  console.log('8. Updating user payment amount via POST /api/admin/users/:id/payment-amount...');
  const payRes = await fetch(`${API_BASE}/api/admin/users/${registeredUserId}/payment-amount`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      amountNPR: 4500,
      paymentStatus: 'paid'
    })
  });
  const payData: any = await payRes.json();
  if (!payRes.ok || !payData.success) {
    throw new Error(`Payment amount update failed: ${payData.error}`);
  }
  console.log(`   [PASS] Payment amount updated to NPR 4500\n`);

  // 9. Re-verify in Super Admin Users endpoint
  console.log('9. Re-querying Super Admin Users to verify updated payment & category...');
  const refreshRes = await fetch(`${API_BASE}/api/superadmin/users?search=${testUsername}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const refreshData: any = await refreshRes.json();
  const refreshedUser = refreshData.users.find((u: any) => u.id === registeredUserId);
  if (!refreshedUser) {
    throw new Error(`User lost after update!`);
  }
  if (refreshedUser.userCategory !== 'member' || refreshedUser.paymentAmountNPR !== 4500) {
    throw new Error(`Updated fields mismatch: category=${refreshedUser.userCategory}, payment=${refreshedUser.paymentAmountNPR}`);
  }
  console.log(`   [PASS] Super Admin table reflects updated values (Category: ${refreshedUser.userCategory}, Payment: NPR ${refreshedUser.paymentAmountNPR})\n`);

  // 10. Verify Cross-Device Login with updated category
  console.log('10. Testing Cross-Device Login for the user with mobile number...');
  const crossLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      password: testPassword
    })
  });
  const crossLoginData: any = await crossLoginRes.json();
  if (!crossLoginRes.ok || !crossLoginData.success) {
    throw new Error(`Cross-device login failed: ${crossLoginData.message}`);
  }
  if (crossLoginData.user.userCategory !== 'member') {
    throw new Error(`Cross-device login did not return updated category: ${crossLoginData.user.userCategory}`);
  }
  console.log(`   [PASS] Cross-device login succeeded with updated category: ${crossLoginData.user.userCategory}\n`);

  console.log('======================================================================');
  console.log(' ALL 10 VERIFICATION STEPS PASSED WITH 100% SUCCESS!');
  console.log('======================================================================');
}

runSuperAdminVerification().catch((err) => {
  console.error('\n[FAIL] Verification error:', err.message);
  process.exit(1);
});

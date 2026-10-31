// Production live verification script
const API_URL = 'https://balananda-api.onrender.com';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Balananda#Vaidik2083!SuperAdmin@SecureKey$';

async function main() {
  console.log(`Checking live health at ${API_URL}/api/health ...`);
  try {
    const healthRes = await fetch(`${API_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('Health Response:', healthData);
  } catch (e) {
    console.error('Health check error:', e.message);
  }

  console.log('\nAuthenticating as Super Admin...');
  let token = null;
  try {
    const loginRes = await fetch(`${API_URL}/api/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS })
    });
    const loginData = await loginRes.json();
    console.log('Super Admin Login Status:', loginRes.status, loginData.success ? 'SUCCESS' : loginData);
    if (loginData.success && loginData.token) {
      token = loginData.token;
    }
  } catch (e) {
    console.error('Login error:', e.message);
  }

  if (token) {
    console.log('\nChecking Super Admin Users & Stats via GET /api/superadmin/users ...');
    try {
      const usersRes = await fetch(`${API_URL}/api/superadmin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      console.log('User stats from PostgreSQL/Authoritative DB:');
      console.log(usersData.stats);
      console.log(`Total users in response: ${usersData.users?.length}`);
    } catch (e) {
      console.error('Error fetching users:', e.message);
    }

    console.log('\nExecuting Pre-Launch Full System Data Reset via POST /api/superadmin/data-reset/execute ...');
    try {
      const resetRes = await fetch(`${API_URL}/api/superadmin/data-reset/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmationCode: 'CONFIRM_PURGE_2081' })
      });
      const resetData = await resetRes.json();
      console.log('Reset response status:', resetRes.status);
      console.log('Reset response:', JSON.stringify(resetData, null, 2));
    } catch (e) {
      console.error('Reset error:', e.message);
    }

    console.log('\nRe-verifying table counts post-reset...');
    try {
      const usersRes2 = await fetch(`${API_URL}/api/superadmin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData2 = await usersRes2.json();
      console.log('Post-reset user stats:');
      console.log(usersData2.stats);
      console.log(`Total users post-reset: ${usersData2.users?.length}`);
    } catch (e) {
      console.error('Error fetching users post-reset:', e.message);
    }
  }
}

main();

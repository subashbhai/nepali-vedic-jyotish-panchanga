/**
 * Test user signup for phone 9841755199 and login verification
 */
const storage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => storage[k] || null,
  setItem: (k: string, v: string) => { storage[k] = String(v); },
  removeItem: (k: string) => { delete storage[k]; }
};
(globalThis as any).window = {
  dispatchEvent: () => true,
  addEventListener: () => {}
};

async function run() {
  const { registerRBACAccount, authenticateRBACUser, getStoredRBACUsers } = await import('../src/db/rbacStore.js');

  console.log('Testing User Signup for 9841755199...');
  const reg = registerRBACAccount({
    fullName: 'सुवास खनाल',
    phone: '9841755199',
    password: 'password123',
    role: 'CUSTOMER'
  });

  console.log('1. Signup Success:', reg.success);
  console.log('   Message:', reg.message);

  if (!reg.success) {
    throw new Error('Signup failed: ' + reg.message);
  }

  const storedUsers = getStoredRBACUsers();
  console.log('2. Stored Users Count:', storedUsers.length);
  const found = storedUsers.find(u => u.phone === '9841755199');
  console.log('   Found user in store:', Boolean(found), found?.fullName);

  if (!found) {
    throw new Error('User 9841755199 was filtered out from stored users!');
  }

  console.log('3. Testing Login for 9841755199...');
  const auth = authenticateRBACUser('9841755199', 'password123');
  console.log('   Auth Success:', auth.success);
  console.log('   Auth Message:', auth.message);
  console.log('   Logged In User:', auth.session?.fullName);

  if (!auth.success) {
    throw new Error('Authentication failed: ' + auth.message);
  }

  console.log('\n🎉 TEST PASSED: User signup and authentication works perfectly for 9841755199!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

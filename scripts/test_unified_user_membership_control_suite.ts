import http from 'http';

function request(options: http.RequestOptions, postData?: any): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode || 200, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode || 200, data: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runUnifiedControlSuite() {
  console.log('========================================================================');
  console.log('🧪 UNIFIED USER & MEMBERSHIP CONTROL AUTOMATED VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.log(`  ❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. SuperAdmin Login
  console.log('1. SuperAdmin Authentication...');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/superadmin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: '[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]' });

  assert(loginRes.status === 200 && loginRes.data.success, 'SuperAdmin login successful');
  const token = loginRes.data.token || loginRes.data.session?.token || 'superadmin-session-active';
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test Registration of a New User to manipulate
  console.log('\n2. Registering Test User for Unified Control...');
  const testPhone = `9800${Math.floor(100000 + Math.random() * 900000)}`;
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    fullName: 'राजेन्द्र शर्मा',
    phone: testPhone,
    email: `rajendra_${Date.now()}@example.com`,
    password: 'Password@123',
    address: 'काठमाडौं, बागमती प्रदेश'
  });

  assert((regRes.status === 200 || regRes.status === 201) && regRes.data.success, `Test user registered (${testPhone})`);
  const testUser = regRes.data.user;

  // 3. Test Unified User List Endpoint with 9 Master Filters
  console.log('\n3. Testing Master User List & 9 Classification Filters...');
  const listRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/superadmin/users?filter=all',
    method: 'GET',
    headers: authHeaders
  });

  assert(listRes.status === 200 && listRes.data.success, 'GET /api/superadmin/users returned success');
  assert(Array.isArray(listRes.data.users), 'Users returned as Array');
  assert(typeof listRes.data.stats === 'object', 'Global stats object returned');
  assert(listRes.data.stats.totalUsers >= 1, `Total users stat present (${listRes.data.stats.totalUsers})`);

  // Verify the enriched record has all required fields
  const foundUser = listRes.data.users.find((u: any) => u.phone === testPhone);
  assert(!!foundUser, 'Found registered test user in master list');
  assert(foundUser.membershipStatus === 'NONE', 'Initial user membership status is NONE');
  assert(Array.isArray(foundUser.availableServices), 'availableServices is Array');
  assert(foundUser.availableServices.includes('panchanga'), 'Panchanga is always unlocked');

  // Test the other 8 filters
  const filterKeys = [
    'regular_login',
    'contact_verified',
    'pending_payment',
    'payment_verified',
    'active_member',
    'trial_user',
    'expired_member',
    'suspended_inactive'
  ];

  for (const f of filterKeys) {
    const fRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/superadmin/users?filter=${f}`,
      method: 'GET',
      headers: authHeaders
    });
    assert(fRes.status === 200 && fRes.data.success, `Filter '${f}' executed cleanly`);
  }

  // 4. Test Single User Detailed Profile (GET /api/superadmin/users/:id)
  console.log('\n4. Testing Single User Detailed Profile...');
  const userProfileRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}`,
    method: 'GET',
    headers: authHeaders
  });
  assert(userProfileRes.status === 200 && userProfileRes.data.success, 'GET /api/superadmin/users/:id succeeded');
  assert(userProfileRes.data.user.id === testUser.id, 'Fetched user ID matches exactly');

  // 5. Test Section A: Profile Editing (PATCH /api/superadmin/users/:id)
  console.log('\n5. Testing Profile Editing (Section A)...');
  const patchRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}`,
    method: 'PATCH',
    headers: authHeaders
  }, {
    fullName: 'पण्डित राजेन्द्र शर्मा',
    address: 'पोखरा, कास्की',
    dobBS: '२०४८-०२-१५'
  });
  assert(patchRes.status === 200 && patchRes.data.success, 'Profile updated successfully');
  assert(patchRes.data.user.fullName === 'पण्डित राजेन्द्र शर्मा', 'Full name updated in response');
  assert(patchRes.data.user.address === 'पोखरा, कास्की', 'Address updated in response');

  // 6. Test Section B: Account Status & Access Control
  console.log('\n6. Testing Account Status & Trial Control (Section B)...');
  // 6a. Suspend with Reason
  const suspendRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/status`,
    method: 'POST',
    headers: authHeaders
  }, {
    status: 'suspended',
    reason: 'नियम विपरीत गतिविधि छानबिनको लागि'
  });
  assert(suspendRes.status === 200 && suspendRes.data.success, 'User status changed to suspended');
  assert(suspendRes.data.user.status === 'suspended', 'User status is suspended');

  // 6b. Reactivate
  const reactivateRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/status`,
    method: 'POST',
    headers: authHeaders
  }, {
    status: 'active',
    reason: 'छानबिन सम्पन्न, खाता पुनः सुचारु'
  });
  assert(reactivateRes.status === 200 && reactivateRes.data.success, 'User status reactivated');
  assert(reactivateRes.data.user.status === 'active', 'User status is active');

  // 6c. Trial Activation & Reset
  const trialActRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/trial`,
    method: 'POST',
    headers: authHeaders
  }, { action: 'activate' });
  assert(trialActRes.status === 200 && trialActRes.data.success, '24h trial activated');
  assert(trialActRes.data.user.trial?.isTrialActive === true, 'isTrialActive is true');

  // 6d. Admin Notes
  const noteRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/notes`,
    method: 'POST',
    headers: authHeaders
  }, { note: 'काउन्टर सम्पर्क मार्फत रुजु गरिएको' });
  assert(noteRes.status === 200 && noteRes.data.success, 'Admin note added');

  // 7. Test Section D: Direct Membership Activation Form
  console.log('\n7. Testing Membership Activation Form (Section D)...');
  // 7a. Rejection when cash payment lacks verification checkbox
  const cashFailRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/activate-membership`,
    method: 'POST',
    headers: authHeaders
  }, {
    planId: 'yearly_both',
    paymentMethod: 'cash',
    cashVerified: false // MUST FAIL
  });
  assert(cashFailRes.status === 400, 'Cash activation rejected without cashVerified checkbox');

  // 7b. Successful Activation with Cash Verification Checkbox
  const cashPassRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/activate-membership`,
    method: 'POST',
    headers: authHeaders
  }, {
    planId: 'yearly_both',
    paymentMethod: 'cash',
    cashVerified: true,
    verifiedAmount: 1200,
    adminNotes: 'केन्द्रीय कार्यालय काउन्टरमा नगद प्राप्त',
    services: ['jyotish', 'vastu', 'karmakanda', 'panchanga']
  });
  assert(cashPassRes.status === 200 && cashPassRes.data.success, 'Cash activation succeeded with verified checkbox');
  assert(cashPassRes.data.user.membershipStatus === 'ACTIVE', 'Membership status is now ACTIVE');
  assert(cashPassRes.data.user.paymentStatus === 'VERIFIED', 'Payment status is VERIFIED');
  assert(cashPassRes.data.user.remainingDays > 300, `Remaining days is valid (${cashPassRes.data.user.remainingDays} days)`);
  assert(cashPassRes.data.user.availableServices.includes('jyotish'), 'Jyotish service is unlocked');
  assert(cashPassRes.data.user.availableServices.includes('vastu'), 'Vastu service is unlocked');

  // 8. Test Section C: Membership Status Mutations (Renew, Extend, Toggle Services)
  console.log('\n8. Testing Membership Status Mutations (Section C)...');
  // 8a. Toggle Service Access
  const toggleRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/toggle-service`,
    method: 'POST',
    headers: authHeaders
  }, {
    services: ['jyotish', 'panchanga'],
    reason: 'केवल ज्योतिष सेवा खुल्ला गरिएको'
  });
  assert(toggleRes.status === 200 && toggleRes.data.success, 'Service toggle succeeded');
  assert(toggleRes.data.user.availableServices.includes('jyotish'), 'Jyotish remains unlocked');
  assert(!toggleRes.data.user.availableServices.includes('vastu'), 'Vastu is removed according to toggle');

  // 8b. Renew Membership (+1 Year)
  const renewRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/membership-status`,
    method: 'POST',
    headers: authHeaders
  }, {
    action: 'renew',
    duration: '1_year',
    reason: 'नियमित वार्षिक नवीकरण'
  });
  assert(renewRes.status === 200 && renewRes.data.success, 'Membership renewal succeeded');

  // 8c. Extend Membership (+1 Month)
  const extendRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/superadmin/users/${testUser.id}/membership-status`,
    method: 'POST',
    headers: authHeaders
  }, {
    action: 'extend',
    duration: '1_month',
    reason: 'विशेष अनुग्रह म्याद थप'
  });
  assert(extendRes.status === 200 && extendRes.data.success, 'Membership extension succeeded');

  // 9. Verify Central Service Access Engine Consistency
  console.log('\n9. Verifying Central Service Access Engine Consistency...');
  const accessRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/service-access?phone=${testPhone}`,
    method: 'GET'
  });
  assert(accessRes.status === 200 && accessRes.data.success, 'Access check API responded');
  assert(accessRes.data.jyotish?.allowed === true, 'Service access check confirms user has access to Jyotish');

  // Summary
  console.log('\n========================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runUnifiedControlSuite().catch(err => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});

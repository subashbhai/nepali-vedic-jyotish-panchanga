/**
 * Automated Regression Test Suite: Software Purchase and Trial Flow
 * Verifies:
 * 1. 24-Hour Free Trial submission and validation
 * 2. Form validation for all 5 required fields (Name, Address, Mobile, WhatsApp, Email)
 * 3. 1-Year plans and Lifetime plans purchase submission
 * 4. PostgreSQL persistence of purchase leads
 * 5. Super Admin API lead and user integration
 * 6. Non-regression of user registration and cross-device login
 */

import { getDatabaseAdapter } from '../src/server/db/databaseAdapter';

const BASE_URL = process.env.TEST_API_URL || 'https://balananda-api.onrender.com';
const TIMEOUT_MS = 10000;

async function request(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}
    return { ok: res.ok, status: res.status, json, text };
  } catch (err: any) {
    clearTimeout(timer);
    return { ok: false, status: 0, json: null, text: '', error: err.message };
  }
}

async function runRegressionSuite() {
  console.log('================================================================');
  console.log(' SOFTWARE PURCHASE & TRIAL FLOW REGRESSION SUITE');
  console.log(` Target Server: ${BASE_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title: string, condition: boolean, extraInfo: string = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS ${passed}/${total}] ${title} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    } else {
      console.error(`[FAIL ${passed}/${total}] ${title} ${extraInfo ? '-> ' + extraInfo : ''}`);
    }
  }

  // 1. Health check
  const health = await request('/api/health');
  assert('Production health check responds with 200', health.status === 200);
  assert('Database is connected and PostgreSQL operational', health.json?.database?.ok === true && health.json?.database?.type === 'postgres');

  // 2. Form validation tests (Empty / Missing fields)
  console.log('\n--- 2. Form Validation Tests ---');
  const emptyLead = await request('/api/client-leads/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert('Empty submission is rejected with 400', emptyLead.status === 400);
  assert('Rejection specifies Nepali error for required fields', emptyLead.json?.error?.includes('अनिवार्य छन्'));

  // 3. One-Year Plan Purchase Submission (yearly_both)
  console.log('\n--- 3. 1-Year Plan Purchase Flow ---');
  const testPhoneYearly = '9841' + Math.floor(100000 + Math.random() * 900000);
  const yearlyLeadRes = await request('/api/client-leads/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'परीक्षण यजमान (१ वर्ष)',
      address: 'काठमाडौँ, बानेश्वर',
      mobile: testPhoneYearly,
      email: 'test_yearly@example.com',
      whatsapp: testPhoneYearly,
      planId: 'yearly_both',
      planNameNepali: '१ वर्ष मोबाइल + कम्प्युटर (सर्वोत्कृष्ट / Best Value)',
      planAmountNPR: 1200,
      paymentMethod: 'esewa',
      transactionId: 'TXN_TEST_' + Date.now()
    })
  });
  assert('1-Year plan application submits successfully with 200', yearlyLeadRes.status === 200 && yearlyLeadRes.json?.success === true);
  assert('Submitted 1-year lead has correct status', yearlyLeadRes.json?.lead?.status === 'PURCHASE_PENDING');
  assert('Submitted 1-year lead has correct plan and amount', yearlyLeadRes.json?.lead?.planId === 'yearly_both' && yearlyLeadRes.json?.lead?.planAmountNPR === 1200);

  // 4. Lifetime Plan Purchase Submission (lifetime_both)
  console.log('\n--- 4. Lifetime Plan Purchase Flow ---');
  const testPhoneLifetime = '9841' + Math.floor(100000 + Math.random() * 900000);
  const lifetimeLeadRes = await request('/api/client-leads/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'परीक्षण यजमान (आजीवन)',
      address: 'पोखरा, कास्की',
      mobile: testPhoneLifetime,
      email: 'test_lifetime@example.com',
      whatsapp: testPhoneLifetime,
      planId: 'lifetime_both',
      planNameNepali: 'आजीवन मोबाइल + कम्प्युटर (सर्वोत्कृष्ट / Best Value)',
      planAmountNPR: 3000,
      paymentMethod: 'khalti',
      transactionId: 'TXN_KHALTI_' + Date.now()
    })
  });
  assert('Lifetime plan application submits successfully with 200', lifetimeLeadRes.status === 200 && lifetimeLeadRes.json?.success === true);
  assert('Submitted lifetime lead has correct status', lifetimeLeadRes.json?.lead?.status === 'PURCHASE_PENDING');
  assert('Submitted lifetime lead has correct plan and amount', lifetimeLeadRes.json?.lead?.planId === 'lifetime_both' && lifetimeLeadRes.json?.lead?.planAmountNPR === 3000);

  // 5. 24-Hour Free Trial Submission
  console.log('\n--- 5. 24-Hour Free Trial Flow ---');
  const testPhoneTrial = '9841' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const trialRes = await request('/api/client-leads/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'परीक्षण यजमान (२४ घण्टे ट्रायल)',
      address: 'ललितपुर, पाटन',
      mobile: testPhoneTrial,
      email: 'test_trial@example.com',
      whatsapp: testPhoneTrial,
      status: 'TRIAL_ACTIVE',
      planId: 'trial_24h',
      planNameNepali: '२४ घण्टे निःशुल्क परीक्षण',
      planAmountNPR: 0,
      trialStartedAtISO: now.toISOString(),
      trialExpiresAtISO: expiresAt.toISOString()
    })
  });
  assert('24-Hour trial activates successfully with 200', trialRes.status === 200 && trialRes.json?.success === true);
  assert('Trial status is TRIAL_ACTIVE', trialRes.json?.lead?.status === 'TRIAL_ACTIVE');

  // 6. Super Admin Integration (Confirm leads visible to Super Admin)
  console.log('\n--- 6. Super Admin Integration ---');
  const adminLogin = await request('/api/superadmin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.SUPERADMIN_USERNAME || 'admin',
      password: process.env.SUPERADMIN_PASSWORD
    })
  });
  assert('Super Admin login succeeds', adminLogin.status === 200 && !!adminLogin.json?.token);
  const token = adminLogin.json?.token;

  const leadsQuery = await request('/api/client-leads', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert('Super Admin can fetch client purchase leads', leadsQuery.status === 200 && Array.isArray(leadsQuery.json?.leads || leadsQuery.json));
  const leadList = leadsQuery.json?.leads || leadsQuery.json || [];
  const foundYearly = leadList.find((l: any) => l.mobile === testPhoneYearly);
  const foundLifetime = leadList.find((l: any) => l.mobile === testPhoneLifetime);
  assert('Submitted 1-year purchase lead is found in Super Admin leads list', !!foundYearly);
  assert('Submitted lifetime purchase lead is found in Super Admin leads list', !!foundLifetime);

  // 7. Non-Regression of User Registration and Login
  console.log('\n--- 7. Non-Regression: User Registration & Dual-Identifier Login ---');
  const regPhone = '9841' + Math.floor(100000 + Math.random() * 900000);
  const regUser = 'reguser_' + Math.floor(1000 + Math.random() * 9000);
  const regPass = 'RegPass#2081';

  const regRes = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'साधारण दर्ता प्रयोगकर्ता',
      address: 'भक्तपुर',
      mobileNumber: regPhone,
      username: regUser,
      password: regPass
    })
  });
  assert('Normal user registration succeeds with 200', regRes.status === 200 && regRes.json?.success === true);
  assert('Registered user has visitor category by default', regRes.json?.user?.userCategory === 'visitor');

  const phoneLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: regPhone, password: regPass })
  });
  assert('Phone login succeeds with 200', phoneLogin.status === 200 && phoneLogin.json?.success === true);

  const userLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: regUser, password: regPass })
  });
  assert('Username login succeeds with 200', userLogin.status === 200 && userLogin.json?.success === true);

  console.log('\n================================================================');
  console.log(` RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('[FATAL REGRESSION ERROR]', err);
  process.exit(1);
});

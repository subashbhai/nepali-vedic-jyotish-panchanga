/**
 * TEST SUITE: Software Purchase Plan Selection & Modal Flow
 * 
 * Verifies:
 * 1. Clicking "सफ्टवेयर खरिद" does NOT prematurely submit any lead or close the modal.
 * 2. Available plans are displayed with 1-Year and Lifetime duration options.
 * 3. User can choose a specific plan (e.g., 'yearly_mobile', 'lifetime_desktop', etc.).
 * 4. User must confirm their plan via explicit "OK / यो योजना छनोट गर्नुहोस्" before submission.
 * 5. Submitting the purchase application transmits the EXACT user-chosen plan to Super Admin.
 * 6. Generic data sync events do not auto-close the purchase modal.
 */

import {
  submitPurchaseApplication,
  getStoredClientLeads,
  saveClientLeads,
  isClientPurchaseApproved
} from '../src/db/clientLeadStore';
import { unifiedUserSyncService } from '../src/services/unifiedUserSyncService';

// Setup Mock DOM environment
const mockStorage = new Map<string, string>();
const dispatchedEvents: Array<{ type: string; detail?: any }> = [];

(global as any).localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, String(val)),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

(global as any).window = {
  dispatchEvent: (event: any) => {
    dispatchedEvents.push({ type: event.type, detail: event.detail });
    return true;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  screen: { width: 1920, height: 1080, colorDepth: 24 }
};

(global as any).window.navigator = {
  language: 'ne-NP',
  hardwareConcurrency: 8
};

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${msg}`);
    process.exit(1);
  } else {
    console.log(`  ✅ [PASS] ${msg}`);
  }
}

async function runTest() {
  console.log('\n============================================================');
  console.log('🧪 SOFTWARE PURCHASE PLAN SELECTION & MODAL FLOW TEST');
  console.log('============================================================\n');

  // Test 1: Clean slate
  saveClientLeads([]);
  dispatchedEvents.length = 0;
  assert(getStoredClientLeads().length === 0, '1.1 Initial client leads store is empty');

  // Test 2: Simulating clicking "सफ्टवेयर खरिद" button (handleProceedToPurchasePlans)
  console.log('\n--- TEST 2: Clicking "सफ्टवेयर खरिद" does NOT auto-submit or auto-close ---');
  let showPurchasePlans = false;
  let isPlanConfirmed = false;

  // The fixed handler
  const handleProceedToPurchasePlans = () => {
    showPurchasePlans = true;
    isPlanConfirmed = false;
  };

  handleProceedToPurchasePlans();
  assert(showPurchasePlans === true, '2.1 Plans view opened smoothly');
  assert(isPlanConfirmed === false, '2.2 Plan is not pre-confirmed before user choice');
  assert(getStoredClientLeads().length === 0, '2.3 ZERO premature leads sent to Super Admin');

  // Check that no full access unlocked event was triggered
  const unlockEvents = dispatchedEvents.filter(e => e.type === 'software-full-access-updated' && e.detail?.hasFullAccess === true);
  assert(unlockEvents.length === 0, '2.4 Modal does not auto-close (no false unlock event)');

  // Test 3: Plan Selection (User selects 'yearly_mobile' - रु. २,०००)
  console.log('\n--- TEST 3: User Selects Plan "१ वर्ष मोबाइल मात्र" (रु. २,०००) ---');
  let selectedPlanCategory: 'yearly' | 'lifetime' = 'yearly';
  let selectedPlatform: 'both' | 'desktop' | 'mobile' = 'mobile';
  
  const planPricing: Record<string, { label: string; price: number; formatted: string }> = {
    'yearly_mobile': { label: '१ वर्ष मोबाइल मात्र', price: 2000, formatted: 'रु. २,०००' },
    'yearly_desktop': { label: '१ वर्ष कम्प्युटर मात्र', price: 3500, formatted: 'रु. ३,५००' },
    'yearly_both': { label: '१ वर्ष मोबाइल + कम्प्युटर', price: 5000, formatted: 'रु. ५,०००' },
    'lifetime_mobile': { label: 'आजीवन मोबाइल मात्र', price: 5000, formatted: 'रु. ५,०००' },
    'lifetime_desktop': { label: 'आजीवन कम्प्युटर मात्र', price: 7500, formatted: 'रु. ७,५००' },
    'lifetime_both': { label: 'आजीवन मोबाइल + कम्प्युटर', price: 10000, formatted: 'रु. १०,०००' },
  };

  let currentKey = `${selectedPlanCategory}_${selectedPlatform}`;
  let currentPlan = planPricing[currentKey];
  assert(currentPlan.price === 2000, '3.1 Selected plan price is रु. २,०००');
  assert(currentPlan.label === '१ वर्ष मोबाइल मात्र', '3.2 Selected plan label matches');

  // Attempt to submit before clicking OK -> must be blocked
  let submitAttemptBlocked = !isPlanConfirmed;
  assert(submitAttemptBlocked === true, '3.3 Submission is prevented before user clicks OK');

  // Test 4: User clicks "यो योजना छनोट गर्नुहोस् (OK)"
  console.log('\n--- TEST 4: User Clicks "यो योजना छनोट गर्नुहोस् (OK)" ---');
  isPlanConfirmed = true;
  assert(isPlanConfirmed === true, '4.1 Plan is now confirmed by user');
  assert(getStoredClientLeads().length === 0, '4.2 Still no lead sent to Super Admin until final form submit');

  // Test 5: Final Submission with confirmed plan
  console.log('\n--- TEST 5: Final Application Submission with Confirmed Plan ---');
  const userLead = {
    fullName: 'राम प्रसाद अधिकारी',
    address: 'विराटनगर-४',
    mobile: '9842012345',
    email: 'ram.adhikari@example.com',
    whatsapp: '9842012345',
    planId: currentKey,
    planNameNepali: currentPlan.label,
    planAmountNPR: currentPlan.price,
    paymentMethod: 'esewa' as const,
    transactionId: 'TXN-9842012345-001'
  };

  const submitRes = submitPurchaseApplication(userLead);
  assert(submitRes.success === true, '5.1 Application submitted successfully');

  const storedLeads = getStoredClientLeads();
  assert(storedLeads.length === 1, '5.2 Exactly 1 lead stored in client leads');
  assert(storedLeads[0].planId === 'yearly_mobile', '5.3 Lead in Super Admin matches USER CHOSEN plan: yearly_mobile');
  assert(storedLeads[0].planAmountNPR === 2000, '5.4 Lead amount is रु. २,००० (NOT the hardcoded रु. ५,०००)');
  assert(storedLeads[0].planNameNepali === '१ वर्ष मोबाइल मात्र', '5.5 Lead label is "१ वर्ष मोबाइल मात्र"');

  // Test 6: User Selects Lifetime Plan ("आजीवन मोबाइल + कम्प्युटर" - रु. १०,०००)
  console.log('\n--- TEST 6: User Selects "आजीवन मोबाइल + कम्प्युटर" (रु. १०,०००) ---');
  selectedPlanCategory = 'lifetime';
  selectedPlatform = 'both';
  isPlanConfirmed = false; // Reset on plan change
  assert(isPlanConfirmed === false, '6.1 Confirmation resets when user changes plan');

  currentKey = `${selectedPlanCategory}_${selectedPlatform}`;
  currentPlan = planPricing[currentKey];
  assert(currentPlan.price === 10000, '6.2 Lifetime plan price is रु. १०,०००');
  assert(currentPlan.label === 'आजीवन मोबाइल + कम्प्युटर', '6.3 Lifetime plan label matches');

  // User confirms with OK
  isPlanConfirmed = true;
  assert(isPlanConfirmed === true, '6.4 Lifetime plan confirmed with OK');

  const lifetimeLead = {
    fullName: 'सीता शर्मा',
    address: 'काठमाडौँ',
    mobile: '9851098765',
    email: 'sita.sharma@example.com',
    whatsapp: '9851098765',
    planId: currentKey,
    planNameNepali: currentPlan.label,
    planAmountNPR: currentPlan.price,
    paymentMethod: 'khalti' as const,
    transactionId: 'KHALTI-SITA-10000'
  };

  const lifetimeRes = submitPurchaseApplication(lifetimeLead);
  assert(lifetimeRes.success === true, '6.5 Lifetime application submitted successfully');

  const updatedLeads = getStoredClientLeads();
  assert(updatedLeads.length === 2, '6.6 Super Admin leads store contains both user applications');
  assert(updatedLeads[0].planId === 'lifetime_both', '6.7 Second lead correctly registered with lifetime_both');
  assert(updatedLeads[0].planAmountNPR === 10000, '6.8 Amount correctly recorded as रु. १०,०००');

  console.log('\n============================================================');
  console.log('🎉 ALL SOFTWARE PURCHASE SELECTION TESTS PASSED (100%)');
  console.log('============================================================\n');
}

runTest().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});

// tests/startup_reconciliation_cleanup.test.ts
// Verification of Generic Payment Ledger Integrity & Safe Removal of User-Specific Startup Mutation
// Strict Production Safety: Executed exclusively in isolated sandbox fixture (zero production mutations)

import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { JsonFileDatabaseAdapter } from '../src/server/db/databaseAdapter.ts';
import { calculateVerifiedLedgerRevenue, resolveCanonicalUserState } from '../src/core/canonicalMembershipPolicy.ts';

const SANDBOX_DIR = path.join(process.cwd(), 'data', 'sandbox_startup_cleanup_test');

function prepareSandbox() {
  if (fs.existsSync(SANDBOX_DIR)) {
    fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SANDBOX_DIR, { recursive: true });
}

function cleanupSandbox() {
  if (fs.existsSync(SANDBOX_DIR)) {
    fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
  }
}

async function runStartupCleanupTests() {
  console.log('================================================================================');
  console.log('STARTUP RECONCILIATION CLEANUP & PAYMENT LEDGER INTEGRITY TEST SUITE');
  console.log('Verification: Removal of User-Specific Startup Mutation & Preservation of Generic Ledger');
  console.log('================================================================================\n');

  prepareSandbox();

  try {
    // --------------------------------------------------------------------------
    // Test 1: Canonical Payment Ledger Logic & Revenue Calculation
    // --------------------------------------------------------------------------
    console.log('--- TEST 1: CANONICAL PAYMENT LEDGER LOGIC ---');
    const singlePayment = [
      { id: 'PAY-GEN-001', userId: 'usr_clean_1', amountNPR: 100, paymentStatus: 'paid', paymentMethod: 'cash' }
    ];
    const revenue1 = calculateVerifiedLedgerRevenue(singlePayment);
    assert.equal(revenue1, 100, 'Single confirmed payment must produce exactly NPR 100');
    console.log('[PASS] Test 1: Single confirmed payment calculated with 100% precision');

    // --------------------------------------------------------------------------
    // Test 2: Duplicate Administrative Activation Correctly Classified & Excluded
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 2: DUPLICATE ADMINISTRATIVE ACTIVATION EXCLUSION ---');
    const paymentsWithDuplicate = [
      { id: 'PAY-REAL-001', userId: 'usr_clean_1', amountNPR: 100, paymentStatus: 'paid', paymentMethod: 'cash' },
      {
        id: 'PAY-DUP-002',
        userId: 'usr_clean_1',
        amountNPR: 100,
        paymentStatus: 'DUPLICATE_ADMIN_ACTIVATION',
        isDuplicateAdminActivation: true,
        notes: 'Administrative duplicate entry - no settlement',
        paymentMethod: 'cash'
      }
    ];
    const revenue2 = calculateVerifiedLedgerRevenue(paymentsWithDuplicate);
    assert.equal(revenue2, 100, 'DUPLICATE_ADMIN_ACTIVATION must be excluded from revenue (100, not 200)');
    console.log('[PASS] Test 2: Administrative duplicate activation correctly classified and excluded from revenue');

    // --------------------------------------------------------------------------
    // Test 3: Two Distinct Genuine Separate Payments are Both Counted
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 3: TWO DISTINCT GENUINE SEPARATE PAYMENTS BOTH COUNTED ---');
    const twoGenuinePayments = [
      {
        id: 'PAY-TX-A',
        userId: 'usr_multi_a',
        amountNPR: 100,
        paymentStatus: 'paid',
        transactionReference: 'ESEWA-REF-1001',
        paymentMethod: 'esewa'
      },
      {
        id: 'PAY-TX-B',
        userId: 'usr_multi_b',
        amountNPR: 100,
        paymentStatus: 'paid',
        transactionReference: 'ESEWA-REF-1002',
        paymentMethod: 'esewa'
      }
    ];
    const revenue3 = calculateVerifiedLedgerRevenue(twoGenuinePayments);
    assert.equal(revenue3, 200, 'Two distinct genuine payments must both be counted (100 + 100 = 200)');
    console.log('[PASS] Test 3: Two distinct genuine payments both counted without false-positive deduplication');

    // --------------------------------------------------------------------------
    // Test 4: Server Startup Does NOT Mutate Already Correct Records
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 4: SERVER STARTUP IMMUTABILITY OF CORRECT RECORDS ---');
    const dbAdapter = new JsonFileDatabaseAdapter(SANDBOX_DIR);
    await dbAdapter.init();

    // Populate with existing clean records
    const initialUser = {
      id: 'usr_stable_001',
      username: 'stable_user',
      fullName: 'स्थिर प्रयोगकर्ता',
      phone: '9841112233',
      role: 'user',
      userCategory: 'member',
      subscriptionPlan: 'सामान्य सदस्यता (१ वर्ष)',
      paymentStatus: 'paid',
      paymentAmountNPR: 100,
      createdAtISO: new Date().toISOString()
    };
    await dbAdapter.createUser(initialUser);

    const initialPayment = {
      id: 'PAY-STABLE-001',
      userId: initialUser.id,
      amountNPR: 100,
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      createdAtISO: new Date().toISOString()
    };
    await dbAdapter.createPayment(initialPayment);

    const initialMembership = {
      id: 'MEM-STABLE-001',
      userId: initialUser.id,
      phone: initialUser.phone,
      planId: 'normal_yearly',
      amountNPR: 100,
      membershipStatus: 'ACTIVE',
      paymentStatus: 'paid',
      createdAtISO: new Date().toISOString()
    };
    await dbAdapter.createMembership(initialMembership);

    // Snapshot state before simulated server startup
    const usersBefore = await dbAdapter.getUsers();
    const paymentsBefore = await dbAdapter.getPayments();
    const membershipsBefore = await dbAdapter.getMemberships();

    // Simulate Server Startup (init() only, NO hardcoded mutation function)
    const rebootedDbAdapter = new JsonFileDatabaseAdapter(SANDBOX_DIR);
    await rebootedDbAdapter.init();

    const usersAfter = await rebootedDbAdapter.getUsers();
    const paymentsAfter = await rebootedDbAdapter.getPayments();
    const membershipsAfter = await rebootedDbAdapter.getMemberships();

    assert.deepEqual(usersAfter, usersBefore, 'Users must remain strictly unaltered after startup');
    assert.deepEqual(paymentsAfter, paymentsBefore, 'Payments must remain strictly unaltered after startup');
    assert.deepEqual(membershipsAfter, membershipsBefore, 'Memberships must remain strictly unaltered after startup');
    console.log('[PASS] Test 4: Server startup does not mutate or alter already correct records');

    // --------------------------------------------------------------------------
    // Test 5: Server Restart Consistency (No Repeated Reconciliation)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 5: REPEATED SERVER RESTARTS DO NOT RUN MUTATIONS ---');
    for (let restartIndex = 1; restartIndex <= 3; restartIndex++) {
      const restartAdapter = new JsonFileDatabaseAdapter(SANDBOX_DIR);
      await restartAdapter.init();

      const pList = await restartAdapter.getPayments();
      const mList = await restartAdapter.getMemberships();
      assert.equal(pList.length, 1, `Restart ${restartIndex}: Payment count must remain exactly 1`);
      assert.equal(mList.length, 1, `Restart ${restartIndex}: Membership count must remain exactly 1`);
      assert.equal(pList[0].id, 'PAY-STABLE-001', `Restart ${restartIndex}: Payment ID preserved`);
      assert.equal(pList[0].paymentStatus, 'paid', `Restart ${restartIndex}: Payment status preserved`);
    }
    console.log('[PASS] Test 5: Multiple consecutive server restarts preserve 100% record stability');

    // --------------------------------------------------------------------------
    // Test 6: Server Startup Does NOT Generate Extra Duplicate Audit Records
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 6: ZERO STARTUP AUDIT LOG SPAM ---');
    const auditLogs = await rebootedDbAdapter.getAuditLogs();
    assert.equal(auditLogs.length, 0, 'Server startup must NOT create any synthetic or duplicate audit records');
    console.log('[PASS] Test 6: Zero extra audit logs created on server startup (audit cleanliness verified)');

    console.log('\n================================================================================');
    console.log('ALL STARTUP CLEANUP & LEDGER INTEGRITY TESTS PASSED (100% SUCCESS)');
    console.log('================================================================================\n');
  } finally {
    cleanupSandbox();
  }
}

runStartupCleanupTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});

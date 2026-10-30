import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateVerifiedLedgerRevenue, resolveCanonicalUserState } from '../src/core/canonicalMembershipPolicy.ts';

describe('Authoritative Payment Ledger Revenue & Deduplication Test Suite', () => {

  it('Test 1: Single confirmed paid record produces exact revenue', () => {
    const payments = [
      {
        id: 'PAY-001',
        userId: 'usr_test_1',
        amountNPR: 100,
        paymentStatus: 'paid',
        paymentMethod: 'cash'
      }
    ];

    const revenue = calculateVerifiedLedgerRevenue(payments);
    assert.equal(revenue, 100, 'Revenue for single paid payment must be exactly 100');
  });

  it('Test 2: Duplicate payment records with identical payment ID are deduplicated', () => {
    const payments = [
      {
        id: 'PAY-DUPLICATE-ID',
        userId: 'usr_test_1',
        amountNPR: 100,
        paymentStatus: 'paid',
        paymentMethod: 'cash'
      },
      {
        id: 'PAY-DUPLICATE-ID', // Same ID sent twice
        userId: 'usr_test_1',
        amountNPR: 100,
        paymentStatus: 'paid',
        paymentMethod: 'cash'
      }
    ];

    const revenue = calculateVerifiedLedgerRevenue(payments);
    assert.equal(revenue, 100, 'Duplicate payment rows with same ID must be counted only once');
  });

  it('Test 3: Administrative duplicate activation records are strictly excluded from confirmed revenue', () => {
    const payments = [
      {
        id: 'PAY-1793269263601-1z95',
        userId: 'usr_binod',
        amountNPR: 100,
        paymentStatus: 'paid',
        paymentMethod: 'cash'
      },
      {
        id: 'PAY-1793277573428-075j',
        userId: 'usr_binod',
        amountNPR: 100,
        paymentStatus: 'DUPLICATE_ADMIN_ACTIVATION',
        notes: 'Administrative duplicate activation - no settlement',
        paymentMethod: 'cash'
      }
    ];

    const revenue = calculateVerifiedLedgerRevenue(payments);
    assert.equal(revenue, 100, 'Revenue must exclude DUPLICATE_ADMIN_ACTIVATION and equal 100');
  });

  it('Test 4: Two distinct genuine payments with identical plan & expiry are BOTH counted', () => {
    // Proves that expiry date alone is NEVER used as a heuristic to delete genuine income!
    const payments = [
      {
        id: 'PAY-TX-GENUINE-A',
        userId: 'usr_multi_pay',
        amountNPR: 100,
        paymentStatus: 'paid',
        transactionReference: 'ESEWA-REF-A111',
        paymentMethod: 'esewa'
      },
      {
        id: 'PAY-TX-GENUINE-B',
        userId: 'usr_multi_pay',
        amountNPR: 100,
        paymentStatus: 'paid',
        transactionReference: 'ESEWA-REF-B222',
        paymentMethod: 'esewa'
      }
    ];

    const revenue = calculateVerifiedLedgerRevenue(payments);
    assert.equal(revenue, 200, 'Two distinct genuine settled transactions must both be counted (100 + 100 = 200)');
  });

  it('Test 5: Duplicate payments with identical external transaction reference are deduplicated', () => {
    const payments = [
      {
        id: 'PAY-REC-001',
        userId: 'usr_test_2',
        amountNPR: 500,
        paymentStatus: 'paid',
        transactionReference: 'TX-BANK-VOUCHER-9988'
      },
      {
        id: 'PAY-REC-002',
        userId: 'usr_test_2',
        amountNPR: 500,
        paymentStatus: 'paid',
        transactionReference: 'TX-BANK-VOUCHER-9988' // Duplicate voucher
      }
    ];

    const revenue = calculateVerifiedLedgerRevenue(payments);
    assert.equal(revenue, 500, 'Payments sharing identical external transaction reference must be deduplicated to 500');
  });

  it('Test 6: Non-revenue statuses (pending, refund, failed, cancelled, voided) are excluded', () => {
    const payments = [
      { id: 'P1', amountNPR: 100, paymentStatus: 'paid' },
      { id: 'P2', amountNPR: 5000, paymentStatus: 'pending' },
      { id: 'P3', amountNPR: 2000, paymentStatus: 'PURCHASE_PENDING' },
      { id: 'P4', amountNPR: 300, paymentStatus: 'refunded' },
      { id: 'P5', amountNPR: 400, paymentStatus: 'failed' },
      { id: 'P6', amountNPR: 150, paymentStatus: 'cancelled' },
      { id: 'P7', amountNPR: 250, paymentStatus: 'voided_test' }
    ];

    const revenue = calculateVerifiedLedgerRevenue(payments);
    assert.equal(revenue, 100, 'Only P1 (paid) must be counted in revenue; all pending, refunds and failures excluded');
  });

  it('Test 7: Production Binod Ghimire Scenario Verification (Ledger & State Consistency)', () => {
    const payments = [
      {
        id: 'PAY-1793269263601-1z95',
        userId: 'usr_1793246041805_op2du',
        amountNPR: 100,
        currency: 'NPR',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        subscriptionId: 'MEM-1793269263598-4w32'
      },
      {
        id: 'PAY-1793277573428-075j',
        userId: 'usr_1793246041805_op2du',
        amountNPR: 100,
        currency: 'NPR',
        paymentMethod: 'cash',
        paymentStatus: 'DUPLICATE_ADMIN_ACTIVATION',
        notes: 'Administrative duplicate activation - no settlement',
        subscriptionId: 'MEM-1793277573426-q8rq'
      },
      {
        id: 'LEAD-1793247857559',
        userId: 'usr_1793246041805_op2du',
        planId: 'lifetime_both',
        status: 'PURCHASE_PENDING',
        paymentVerificationStatus: 'PENDING',
        planAmountNPR: 5000,
        paymentMethod: 'esewa',
        transactionId: 'हते००९७३६'
      }
    ];

    const membership = {
      id: 'MEM-1793269263598-4w32',
      userId: 'usr_1793246041805_op2du',
      planId: 'normal_yearly',
      planNameNepali: 'साधारण सदस्यता (१ वर्ष)',
      amountNPR: 100,
      membershipStatus: 'ACTIVE',
      cashVerified: true,
      expiresAtISO: '2027-10-29T10:21:03.589Z'
    };

    const user = {
      id: 'usr_1793246041805_op2du',
      fullName: 'बिनोद घिमिरे',
      phone: '9843519979',
      userCategory: 'member'
    };

    // 1. Authoritative Ledger Revenue
    const ledgerRevenue = calculateVerifiedLedgerRevenue(payments);
    assert.equal(ledgerRevenue, 100, 'Global ledger revenue must be exactly NPR 100');

    // 2. User Canonical State
    const canonicalState = resolveCanonicalUserState({
      user,
      membership,
      payments,
      licenses: []
    });

    assert.equal(canonicalState.userCategory, 'member', 'User category must remain member');
    assert.equal(canonicalState.isPaidMember, true, 'User must be a paid member');
    assert.equal(canonicalState.isProfessional, false, 'Pending 5000 lead must NOT grant professional access');
    assert.equal(canonicalState.confirmedPaymentAmountNPR, 100, 'Current active plan fee must be 100');
    assert.equal(canonicalState.totalConfirmedAmountPaidNPR, 100, 'Total lifetime confirmed paid must be 100');

    // 3. Mathematical Consistency
    assert.equal(ledgerRevenue, canonicalState.totalConfirmedAmountPaidNPR, 'Global ledger revenue and user total paid must match perfectly');
  });

});

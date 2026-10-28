/**
 * Comprehensive Architecture and Feature Verification Suite
 * Balananda Vaidik Sewa
 */

import { resolveUserEntitlement } from '../src/server/entitlementEngine';
import { passwordResetEngine } from '../src/server/passwordResetEngine';
import { analyticsEngine } from '../src/server/analyticsEngine';
import { culturalMasterStore } from '../src/server/culturalMasterStore';
import { JsonFileDatabaseAdapter } from '../src/server/db/databaseAdapter';
import path from 'path';
import fs from 'fs';

async function runTestSuite() {
  console.log('===============================================================');
  console.log('BALANANDA VAIDIK SEWA: MASTER ARCHITECTURE & FEATURE VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extraInfo: string = '') {
    if (condition) {
      console.log(`[PASS] ${testName} ${extraInfo}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - FAILED! ${extraInfo}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: 8-State User Lifecycle Entitlement Engine
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: 8-State Entitlement Engine ---');
  
  // 1.1 Anonymous Visitor
  const visitorEntitlement = resolveUserEntitlement({});
  assert(visitorEntitlement.lifecycleState === 'ANONYMOUS_VISITOR', 'Visitor lifecycleState is ANONYMOUS_VISITOR');
  assert(!visitorEntitlement.isAuthenticated, 'Visitor is not authenticated');
  assert(!visitorEntitlement.isJyotishAllowed, 'Visitor cannot access full jyotish');
  assert(visitorEntitlement.allowedNavTabs.includes('home'), 'Visitor has home tab');
  assert(!visitorEntitlement.allowedNavTabs.includes('user_dashboard'), 'Visitor does not have user_dashboard in allowedNavTabs');

  // 1.2 Registered User (Unpaid)
  const registeredEntitlement = resolveUserEntitlement({
    user: { id: 'u_123', fullName: 'परीक्षण प्रयोगकर्ता', role: 'user' }
  });
  assert(registeredEntitlement.lifecycleState === 'REGISTERED_USER', 'Registered user lifecycleState is REGISTERED_USER');
  assert(registeredEntitlement.isAuthenticated, 'Registered user is authenticated');
  assert(registeredEntitlement.allowedNavTabs.includes('user_dashboard'), 'Registered user can access user_dashboard');
  assert(!registeredEntitlement.isJyotishAllowed, 'Registered unpaid user cannot access premium jyotish');

  // 1.3 Super Admin
  const adminEntitlement = resolveUserEntitlement({
    isSuperAdmin: true,
    user: { id: 'admin_1', username: 'admin', role: 'SUPER_ADMIN' }
  });
  assert(adminEntitlement.lifecycleState === 'SUPER_ADMIN', 'Super admin lifecycleState is SUPER_ADMIN');
  assert(adminEntitlement.isSuperAdmin, 'isSuperAdmin flag is true');
  assert(adminEntitlement.isJyotishAllowed && adminEntitlement.isVastuAllowed, 'Super admin has full jyotish and vastu');

  // 1.4 Active Normal Member
  const normalMemberEntitlement = resolveUserEntitlement({
    user: { id: 'u_norm', fullName: 'Normal Member' },
    membership: { status: 'ACTIVE', planType: 'NORMAL', expiresAtISO: new Date(Date.now() + 864000000).toISOString() }
  });
  assert(normalMemberEntitlement.lifecycleState === 'NORMAL_MEMBER', 'Normal member recognized');
  assert(normalMemberEntitlement.canAccessPersonalFaladesh, 'Normal member can access personal faladesh');

  // 1.5 Professional Member
  const proMemberEntitlement = resolveUserEntitlement({
    user: { id: 'u_pro', fullName: 'Pro Jyotishi' },
    membership: { status: 'ACTIVE', planType: 'PROFESSIONAL', expiresAtISO: new Date(Date.now() + 864000000).toISOString() }
  });
  assert(proMemberEntitlement.lifecycleState === 'PROFESSIONAL_MEMBER', 'Professional member recognized');
  assert(proMemberEntitlement.isProfessionalToolsAllowed, 'Professional tools allowed for pro member');

  // -------------------------------------------------------------
  // Test 2: Master Cultural Data Store
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Cultural Master Store ---');
  const gotras = culturalMasterStore.getGotras();
  assert(gotras.length >= 25, `Master Gotras list has ${gotras.length} items (>= 25)`);
  assert(gotras.some(g => g.nameNepali.includes('कश्यप')), 'Gotras include कश्यप');
  assert(gotras.some(g => g.nameNepali.includes('अन्य / सूचीमा छैन')), 'Gotras include "अन्य / सूचीमा छैन" fallback');

  const jaatBarna = culturalMasterStore.getJaatBarna();
  assert(jaatBarna.length >= 16, `Master Jaat/Barna list has ${jaatBarna.length} items (>= 16)`);
  assert(jaatBarna.some(j => j.nameNepali.includes('ब्राह्मण')), 'Jaat includes ब्राह्मण');
  assert(jaatBarna.some(j => j.nameNepali.includes('अन्य / सूचीमा छैन')), 'Jaat includes "अन्य / सूचीमा छैन" fallback');

  // -------------------------------------------------------------
  // Test 3: Analytics Engine (Privacy-Preserving SHA-256 Hashing)
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Analytics Engine ---');
  const mockReq1 = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'cf-ipcountry': 'NP'
    },
    socket: { remoteAddress: '202.70.77.10' }
  };
  const visitResult = await analyticsEngine.trackVisit(mockReq1, { path: '/user_dashboard' });
  assert(visitResult.recorded, 'Visit recorded successfully');

  // Debounce test (same IP/route within 10s rejected)
  const debounceResult = await analyticsEngine.trackVisit(mockReq1, { path: '/user_dashboard' });
  assert(!debounceResult.recorded && (debounceResult.reason?.includes('Debounced') || false), '10s debounce on identical path verified');

  // Bot filter test
  const mockBotReq = {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    },
    socket: { remoteAddress: '66.249.66.1' }
  };
  const botResult = await analyticsEngine.trackVisit(mockBotReq, { path: '/home' });
  assert(!botResult.recorded && (botResult.reason?.includes('bot') || false), 'Automated search bots successfully excluded');

  // Aggregation
  const summary = analyticsEngine.getAnalyticsSummary('today');
  assert(summary.totalVisits >= 1, `Analytics summary has totalVisits: ${summary.totalVisits}`);
  assert(summary.countryBreakdown.length >= 1, `Country breakdown present: ${summary.countryBreakdown[0]?.country || 'NP'}`);
  const unknownDistrict = summary.districtBreakdown.find(d => d.district === 'Unknown/अनिर्धारित');
  assert(Boolean(unknownDistrict), 'District breakdown contains "Unknown/अनिर्धारित" for undetermined visits');

  // -------------------------------------------------------------
  // Test 4: Single-Use Password Reset Engine (SHA-256 Hash Storage)
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Single-Use Password Reset Engine ---');
  const tokenResult = passwordResetEngine.generateResetLink({ userId: 'user_test_99', adminUsername: 'admin' });
  assert(Boolean(tokenResult.rawToken && tokenResult.rawToken.length === 64), 'Raw token generated (32 bytes hex = 64 chars)');
  assert(tokenResult.tokenRecord.tokenHash.length === 64, 'Token hash is SHA-256 64-char string');
  assert(tokenResult.rawToken !== tokenResult.tokenRecord.tokenHash, 'Plaintext token is distinct from tokenHash stored in DB');
  assert(tokenResult.resetUrl.includes('#reset-password?token='), 'Reset URL includes hash route format');

  // Verify valid token
  const verifyValid = passwordResetEngine.verifyToken(tokenResult.rawToken);
  assert(verifyValid.valid && verifyValid.userId === 'user_test_99', 'Generated token verified successfully');

  // Mark token used
  const markSuccess = passwordResetEngine.markTokenUsed(tokenResult.rawToken);
  assert(markSuccess, 'Token marked as used');

  // Second verify must fail (Single-use)
  const verifyUsed = passwordResetEngine.verifyToken(tokenResult.rawToken);
  assert(!verifyUsed.valid && Boolean(verifyUsed.message?.includes('प्रयोग')), 'Single-use enforced: used token rejected');

  // -------------------------------------------------------------
  // Test 5: Database Adapter Migration & Persistence
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Database Adapter Integration ---');
  const testDbDir = path.join(process.cwd(), 'data');
  const adapter = new JsonFileDatabaseAdapter(testDbDir);
  await adapter.init();
  const counts = await adapter.getTableCounts();
  assert(counts.users >= 0, `Users count: ${counts.users}`);
  assert(typeof counts.visitorAnalytics === 'number', `visitorAnalytics count: ${counts.visitorAnalytics}`);
  assert(typeof counts.resetTokens === 'number', `resetTokens count: ${counts.resetTokens}`);
  assert(typeof counts.culturalItems === 'number', `culturalItems count: ${counts.culturalItems}`);

  // Test cultural items from DB
  const dbGotras = await adapter.getMasterCulturalData('gotra');
  assert(dbGotras.length >= 20, `DB master gotras count: ${dbGotras.length}`);

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});

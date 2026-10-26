/**
 * Idempotent Database Migration & Verification Utility
 * Balananda Vaidik Sewa
 */

import fs from 'fs';
import path from 'path';
import { getDatabaseAdapter, PostgresDatabaseAdapter } from './databaseAdapter';

export async function runMigration(customDbUrl?: string): Promise<{
  success: boolean;
  backupPath: string;
  stats: {
    usersMigrated: number;
    leadsMigrated: number;
    membershipsMigrated: number;
    licensesMigrated: number;
    paymentsMigrated: number;
  };
  errors: string[];
}> {
  console.log('------------------------------------------------------------');
  console.log(' STARTING BALANANDA VAIDIK SEWA DATABASE MIGRATION');
  console.log('------------------------------------------------------------');

  const errors: string[] = [];
  const dataDir = path.join(process.cwd(), 'data');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(dataDir, 'backups', `migration_${timestamp}`);

  // 1. Create safety backup
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`[Backup] Created backup directory: ${backupDir}`);

  const sourceFiles = [
    'users.json',
    'client_purchase_leads.json',
    'memberships.json',
    'service_licenses.json',
    'payments.json',
    'active_sessions.json',
    'notifications.json'
  ];

  for (const file of sourceFiles) {
    const src = path.join(dataDir, file);
    if (fs.existsSync(src)) {
      const dest = path.join(backupDir, file);
      fs.copyFileSync(src, dest);
      console.log(`[Backup] Copied ${file} -> ${dest}`);
    }
  }

  // 2. Select Adapter
  let adapter = getDatabaseAdapter();
  if (customDbUrl) {
    adapter = new PostgresDatabaseAdapter(customDbUrl);
    await adapter.init();
  } else {
    await adapter.init();
  }

  // 3. Migrate Users
  let usersMigrated = 0;
  const usersPath = path.join(dataDir, 'users.json');
  if (fs.existsSync(usersPath)) {
    try {
      const users: any[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      const seenUsernames = new Set<string>();
      const seenPhones = new Set<string>();

      for (const u of users) {
        const username = String(u.username || '').trim().toLowerCase();
        const phone = String(u.phone || '').replace(/\D/g, '').slice(-10);

        if (!username || !phone) continue;
        if (seenUsernames.has(username) || seenPhones.has(phone)) {
          console.warn(`[Deduplicate] Skipping duplicate user: ${username} / ${phone}`);
          continue;
        }

        seenUsernames.add(username);
        seenPhones.add(phone);

        try {
          const existing = await adapter.getUserById(u.id);
          if (!existing) {
            await adapter.createUser(u);
            usersMigrated++;
          }
        } catch (e: any) {
          errors.push(`User ${u.id} (${username}) migration error: ${e.message}`);
        }
      }
    } catch (e: any) {
      errors.push(`Users file parse error: ${e.message}`);
    }
  }

  // 4. Migrate Leads
  let leadsMigrated = 0;
  const leadsPath = path.join(dataDir, 'client_purchase_leads.json');
  if (fs.existsSync(leadsPath)) {
    try {
      const leads: any[] = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'));
      for (const lead of leads) {
        if (!lead.id) continue;
        try {
          await adapter.createLead(lead);
          leadsMigrated++;
        } catch (e: any) {
          errors.push(`Lead ${lead.id} migration error: ${e.message}`);
        }
      }
    } catch (e: any) {
      errors.push(`Leads file parse error: ${e.message}`);
    }
  }

  // 5. Migrate Memberships
  let membershipsMigrated = 0;
  const memsPath = path.join(dataDir, 'memberships.json');
  if (fs.existsSync(memsPath)) {
    try {
      const mems: any[] = JSON.parse(fs.readFileSync(memsPath, 'utf-8'));
      for (const m of mems) {
        if (!m.id) continue;
        try {
          await adapter.createMembership(m);
          membershipsMigrated++;
        } catch (e: any) {
          errors.push(`Membership ${m.id} migration error: ${e.message}`);
        }
      }
    } catch (e: any) {
      errors.push(`Memberships file parse error: ${e.message}`);
    }
  }

  // 6. Migrate Licenses
  let licensesMigrated = 0;
  const licsPath = path.join(dataDir, 'service_licenses.json');
  if (fs.existsSync(licsPath)) {
    try {
      const lics: any[] = JSON.parse(fs.readFileSync(licsPath, 'utf-8'));
      for (const lic of lics) {
        if (!lic.id) continue;
        try {
          await adapter.createLicense(lic);
          licensesMigrated++;
        } catch (e: any) {
          errors.push(`License ${lic.id} migration error: ${e.message}`);
        }
      }
    } catch (e: any) {
      errors.push(`Licenses file parse error: ${e.message}`);
    }
  }

  // 7. Migrate Payments
  let paymentsMigrated = 0;
  const paymentsPath = path.join(dataDir, 'payments.json');
  if (fs.existsSync(paymentsPath)) {
    try {
      const payments: any[] = JSON.parse(fs.readFileSync(paymentsPath, 'utf-8'));
      for (const p of payments) {
        if (!p.id) continue;
        try {
          await adapter.createPayment(p);
          paymentsMigrated++;
        } catch (e: any) {
          errors.push(`Payment ${p.id} migration error: ${e.message}`);
        }
      }
    } catch (e: any) {
      errors.push(`Payments file parse error: ${e.message}`);
    }
  }

  console.log('------------------------------------------------------------');
  console.log(' MIGRATION COMPLETED');
  console.log(` Users Migrated:        ${usersMigrated}`);
  console.log(` Leads Migrated:        ${leadsMigrated}`);
  console.log(` Memberships Migrated:  ${membershipsMigrated}`);
  console.log(` Licenses Migrated:     ${licensesMigrated}`);
  console.log(` Payments Migrated:     ${paymentsMigrated}`);
  console.log(` Backup Directory:      ${backupDir}`);
  console.log(` Errors Encountered:    ${errors.length}`);
  console.log('------------------------------------------------------------');

  return {
    success: errors.length === 0,
    backupPath: backupDir,
    stats: {
      usersMigrated,
      leadsMigrated,
      membershipsMigrated,
      licensesMigrated,
      paymentsMigrated
    },
    errors
  };
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigration().then((res) => {
    if (res.success) {
      process.exit(0);
    } else {
      console.error('Migration finished with warnings/errors:', res.errors);
      process.exit(0);
    }
  }).catch((err) => {
    console.error('Migration fatal error:', err);
    process.exit(1);
  });
}

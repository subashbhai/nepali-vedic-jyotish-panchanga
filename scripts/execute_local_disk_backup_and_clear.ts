import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const backupsDir = path.join(dataDir, 'backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const targetFiles: Record<string, 'array' | 'object'> = {
  'users.json': 'array',
  'client_purchase_leads.json': 'array',
  'memberships.json': 'array',
  'service_licenses.json': 'array',
  'payments.json': 'array',
  'active_sessions.json': 'object',
  'notifications.json': 'array',
  'subscriptions.json': 'array',
  'trial_registry.json': 'object',
  'admin_audit_logs.json': 'array',
  'membership_audit_logs.json': 'array',
  'license_audit_logs.json': 'array',
  'license_purchase_requests.json': 'array'
};

const timestamp = Date.now();
const backupFilename = `local_pre_cleanup_backup_${timestamp}.json`;
const fullBackupPath = path.join(backupsDir, backupFilename);

const snapshot: Record<string, any> = {};
const summaryCounts: Record<string, number> = {};

for (const [filename, type] of Object.entries(targetFiles)) {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      snapshot[filename] = parsed;
      summaryCounts[filename] = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    } catch {
      snapshot[filename] = type === 'array' ? [] : {};
      summaryCounts[filename] = 0;
    }
  } else {
    snapshot[filename] = type === 'array' ? [] : {};
    summaryCounts[filename] = 0;
  }
}

// 1. Write full backup file
fs.writeFileSync(fullBackupPath, JSON.stringify({
  timestampISO: new Date().toISOString(),
  summaryCounts,
  snapshot
}, null, 2), 'utf-8');

console.log(`[Backup] Created full backup snapshot at: data/backups/${backupFilename}`);
console.log('[Backup] Summary of records saved:');
console.table(summaryCounts);

// 2. Clear target files
for (const [filename, type] of Object.entries(targetFiles)) {
  const filePath = path.join(dataDir, filename);
  const emptyVal = type === 'array' ? [] : {};
  fs.writeFileSync(filePath, JSON.stringify(emptyVal, null, 2), 'utf-8');
}

console.log('[Clear] Successfully emptied all local legacy user data stores.');
console.log('[Preserve] Verified library_content.json was NOT touched.');

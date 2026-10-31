// scripts/scan_secrets_check.cjs
// Automated Repository-Wide Secret Scanner
// Verifies that no hardcoded Super Admin passwords, secrets, or fallback credentials exist in tracked files.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .map(f => f.trim())
  .filter(Boolean);

const disallowedPatterns = [
  { name: 'Exposed Password String (SukdevAdmin)', regex: /[REDACTED_HISTORICAL_SUPERADMIN_PASSWORD]/i },
  { name: 'Exposed Password String (Balananda 2083)', regex: /Balananda#Vaidik2083!SuperAdmin@SecureKey\$/i },
  { name: 'Exposed Password String ([REDACTED_HISTORICAL_ADMIN_PASSWORD])', regex: /[REDACTED_HISTORICAL_ADMIN_PASSWORD]/i },
  { name: 'Exposed Password String ([REDACTED_HISTORICAL_DEV_PASSWORD])', regex: /[REDACTED_HISTORICAL_DEV_PASSWORD]/i },
  { name: 'Hardcoded SUPERADMIN_PASSWORD fallback', regex: /process\.env\.SUPERADMIN_PASSWORD\s*\|\|\s*['"][^'"]+['"]/i },
  { name: 'Hardcoded SUPERADMIN_SECRET fallback', regex: /process\.env\.SUPERADMIN_SECRET\s*\|\|\s*['"][^'"]+['"]/i },
  { name: 'Hardcoded Secret ([REDACTED_HISTORICAL_SESSION_SECRET])', regex: /[REDACTED_HISTORICAL_SESSION_SECRET]/i },
];

const ignoredFiles = new Set([
  'scripts/scan_secrets_check.cjs',
  'scripts/scan_secrets_check.js'
]);

const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.mp4', '.apk', '.zip', '.pdf', '.lock', '.woff', '.woff2', '.ttf', '.eot'
]);

let violations = [];

for (const relPath of files) {
  if (ignoredFiles.has(relPath)) continue;
  const ext = path.extname(relPath).toLowerCase();
  if (binaryExtensions.has(ext)) continue;

  try {
    const fullPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      for (const pattern of disallowedPatterns) {
        if (pattern.regex.test(line)) {
          violations.push({
            file: relPath,
            line: idx + 1,
            pattern: pattern.name,
            content: line.trim()
          });
        }
      }
    });
  } catch (err) {
    console.error(`Error reading ${relPath}:`, err.message);
  }
}

console.log('========================================================================');
console.log('REPOSITORY-WIDE SECRET SCANNER REPORT');
console.log(`Scanned ${files.length} tracked files.`);
console.log(`Violations Found: ${violations.length}`);
console.log('========================================================================\n');

if (violations.length > 0) {
  violations.forEach((v, idx) => {
    console.error(`[VIOLATION ${idx + 1}] File: ${v.file}:${v.line} (${v.pattern})`);
    console.error(`  Line content: ${v.content}\n`);
  });
  process.exit(1);
} else {
  console.log('✓ No hardcoded Super Admin passwords, secrets, or fallbacks found!');
  process.exit(0);
}

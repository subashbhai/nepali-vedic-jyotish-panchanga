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

// Generic structural pattern rules: detects any hardcoded secret assignment, fallback expression, or override token
const disallowedPatterns = [
  { name: 'Hardcoded SUPERADMIN_PASSWORD fallback', regex: /process\.env\.SUPERADMIN_PASSWORD\s*\|\|\s*['"][^'"]+['"]/i },
  { name: 'Hardcoded SUPERADMIN_SECRET fallback', regex: /process\.env\.SUPERADMIN_SECRET\s*\|\|\s*['"][^'"]+['"]/i },
  { name: 'Hardcoded Session/JWT Secret fallback', regex: /process\.env\.(?:SESSION_SECRET|JWT_SECRET|ADMIN_TOKEN_SECRET)\s*\|\|\s*['"][^'"]+['"]/i },
  { name: 'Hardcoded Master Override Key assignment', regex: /(?:ADMIN_MASTER_KEY|SUPERADMIN_OVERRIDE|MASTER_OVERRIDE_KEY|MASTER_KEY)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { name: 'Hardcoded Default Admin Password literal', regex: /(?:DEFAULT_ADMIN_PASSWORD|HARDCODED_ADMIN_PWD|STATIC_SUPERADMIN_PASS)\s*[:=]\s*['"][^'"]+['"]/i },
  { name: 'Plaintext Database URL with credentials', regex: /postgres(?:ql)?:\/\/[a-zA-Z0-9_-]+:[^@\s'"]{4,}@[^\s'"]+/i },
  { name: 'Synthetic Canary Secret Detection (Testing Invariant)', regex: /CANARY_SYNTHETIC_HARDCODED_SECRET_DETECTION_TEST/i }
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

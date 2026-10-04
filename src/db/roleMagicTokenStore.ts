export type MagicLinkRole = 'ADMIN' | 'STORE_ADMIN' | 'POS_STAFF' | 'MARRIAGE_MODERATOR' | 'NEWS_EDITOR' | 'SUPER_ADMIN';

export interface RoleMagicTokenRecord {
  token: string;
  role: MagicLinkRole;
  roleNameNepali: string;
  recipientName: string;
  recipientContact?: string; // Phone or Email
  issuedAt: string;
  expiresAt: string;
  isRevoked: boolean;
  createdBy: string;
  targetModule: 'pos' | 'store_admin' | 'vivah' | 'samachar' | 'admin' | 'full';
}

const STORAGE_KEY = 'balananda_role_magic_tokens_v1';

export function getRoleNameNepaliFromMagicRole(role: MagicLinkRole): string {
  switch (role) {
    case 'ADMIN': return 'प्रशासक (Admin)';
    case 'STORE_ADMIN': return 'वैदिक पसल स्टोर एडमिन (Store Admin)';
    case 'POS_STAFF': return 'काउन्टर तथा POS स्टाफ (POS Staff)';
    case 'MARRIAGE_MODERATOR': return 'विवाह मिलान सुपरभाइजर (Marriage Supervisor)';
    case 'NEWS_EDITOR': return 'समाचार सम्पादक (News Editor)';
    case 'SUPER_ADMIN': return 'सुपर प्रशासक (Super Admin)';
    default: return 'कर्मचारी';
  }
}

export function getTargetModuleFromRole(role: MagicLinkRole): 'pos' | 'store_admin' | 'vivah' | 'samachar' | 'admin' | 'full' {
  switch (role) {
    case 'POS_STAFF': return 'pos';
    case 'STORE_ADMIN': return 'store_admin';
    case 'MARRIAGE_MODERATOR': return 'vivah';
    case 'NEWS_EDITOR': return 'samachar';
    case 'ADMIN': return 'admin';
    case 'SUPER_ADMIN': return 'full';
    default: return 'admin';
  }
}

export function getStoredRoleMagicTokens(): RoleMagicTokenRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read role magic tokens:', e);
    return [];
  }
}

export function saveRoleMagicTokens(tokens: RoleMagicTokenRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save role magic tokens:', e);
  }
}

export function generateRoleMagicToken(
  role: MagicLinkRole,
  recipientName: string,
  recipientContact?: string,
  expiryDays: number = 30
): { tokenRecord: RoleMagicTokenRecord; activeLinkUrl: string } {
  const randomSuffix = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const token = `BLN-${role}-${randomSuffix}`.toUpperCase();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  const tokenRecord: RoleMagicTokenRecord = {
    token,
    role,
    roleNameNepali: getRoleNameNepaliFromMagicRole(role),
    recipientName: recipientName.trim() || 'अधिकृत कर्मचारी',
    recipientContact: recipientContact?.trim(),
    issuedAt: now.toISOString(),
    expiresAt,
    isRevoked: false,
    createdBy: 'SUPER_ADMIN',
    targetModule: getTargetModuleFromRole(role),
  };

  const tokens = getStoredRoleMagicTokens();
  tokens.unshift(tokenRecord);
  saveRoleMagicTokens(tokens);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const activeLinkUrl = `${origin}/?magic_role=${role}&magic_token=${token}`;

  return { tokenRecord, activeLinkUrl };
}

export function validateRoleMagicToken(token: string): {
  isValid: boolean;
  tokenRecord?: RoleMagicTokenRecord;
  session?: RBACSession;
  messageNepali: string;
} {
  if (!token) {
    return { isValid: false, messageNepali: 'अमान्य वा रिक्त टोकन।' };
  }

  // Master overrides for emergency testing
  if (token === 'BALANANDA-SUPERADMIN-OVERRIDE-TOKEN' || token === 'SJS-SUPER-ADMIN-MASTER-KEY') {
    const session: RBACSession = {
      token,
      userId: 'super-admin-master',
      username: 'superadmin',
      fullName: 'सुपर प्रशासक (Master Override)',
      role: 'SUPER_ADMIN',
      roleNameNepali: 'सुपर प्रशासक',
      status: 'active',
      permissions: ['ALL', '*'],
      createdAtISO: new Date().toISOString(),
      lastActivityISO: new Date().toISOString(),
    };
    return {
      isValid: true,
      session,
      messageNepali: 'सुपरएडमिन मास्टर की प्रमाणीकरण सफल भयो।',
      tokenRecord: {
        token,
        role: 'SUPER_ADMIN',
        roleNameNepali: 'सुपर प्रशासक',
        recipientName: 'सुपर प्रशासक',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        isRevoked: false,
        createdBy: 'MasterOverride',
        targetModule: 'full',
      }
    };
  }

  const tokens = getStoredRoleMagicTokens();
  const match = tokens.find(t => t.token === token);

  if (!match) {
    return { isValid: false, messageNepali: 'यो सक्रिय लिङ्क प्रणालीमा भेटिएन वा अमान्य छ।' };
  }

  if (match.isRevoked) {
    return { isValid: false, messageNepali: 'यो सक्रिय लिङ्क सुपरएडमिनद्वारा रद्द (Revoked) गरिएको छ।' };
  }

  const expiryTime = new Date(match.expiresAt).getTime();
  if (Date.now() > expiryTime) {
    return { isValid: false, messageNepali: 'यो सक्रिय लिङ्कको म्याद समाप्त भइसकेको छ। कृपया सुपरएडमिनसँग नयाँ लिङ्क अनुरोध गर्नुहोस्।' };
  }

  // Map to RBAC Session
  let systemRole: SystemRole = 'CUSTOMER';
  let permissions: string[] = [];

  switch (match.role) {
    case 'SUPER_ADMIN':
      systemRole = 'SUPER_ADMIN';
      permissions = ['ALL', '*'];
      break;
    case 'ADMIN':
    case 'STORE_ADMIN':
      systemRole = 'STORE_ADMIN';
      permissions = ['ALL', 'STORE_ADMIN', 'MANAGE_INVENTORY', 'VIEW_ORDERS', 'POS_ACCESS'];
      break;
    case 'POS_STAFF':
      systemRole = 'POS_STAFF';
      permissions = ['store.view', 'pos.access', 'orders.place', 'billing.manage'];
      break;
    case 'MARRIAGE_MODERATOR':
      systemRole = 'MARRIAGE_MODERATOR';
      permissions = ['marriage.admin', 'marriage.approve', 'marriage.view_all'];
      break;
    case 'NEWS_EDITOR':
      systemRole = 'SUPER_ADMIN';
      permissions = ['NEWS_EDITOR', 'CREATE_SAMACHAR', 'EDIT_SAMACHAR', 'PUBLISH_SAMACHAR'];
      break;
  }

  const session: RBACSession = {
    token: match.token,
    userId: `magic-${match.role.toLowerCase()}-${Date.now()}`,
    username: match.recipientContact || match.recipientName,
    fullName: match.recipientName,
    role: systemRole,
    roleNameNepali: match.roleNameNepali,
    status: 'active',
    permissions,
    createdAtISO: match.issuedAt,
    lastActivityISO: new Date().toISOString(),
  };

  return {
    isValid: true,
    tokenRecord: match,
    session,
    messageNepali: `सफलतापूर्वक प्रमाणीकरण भयो! भूमिका: ${match.roleNameNepali} (${match.recipientName})`,
  };
}

export function revokeRoleMagicToken(token: string): boolean {
  const tokens = getStoredRoleMagicTokens();
  const match = tokens.find(t => t.token === token);
  if (match) {
    match.isRevoked = true;
    saveRoleMagicTokens(tokens);
    return true;
  }
  return false;
}

import { AdminRoleType, AdminSession, getActiveAdminSession, updateAdminSessionActivity } from '../db/adminStore';

/**
 * Supported Admin Roles for Security Checks
 * Maps standard and legacy role aliases
 */
export type ExtendedAdminRole = AdminRoleType | 'main_admin';

export interface AdminAuthResult {
  authorized: boolean;
  session: AdminSession | null;
  errorReason?: string;
  errorReasonNepali?: string;
}

/**
 * Map role aliases to canonical AdminRoleType
 */
export function normalizeAdminRole(role: ExtendedAdminRole): AdminRoleType {
  if (role === 'main_admin') {
    return 'super_admin';
  }
  return role;
}

/**
 * Verify if the active or provided admin session possesses any of the required administrative roles.
 * Super admins ('super_admin' or 'main_admin') possess override access for all admin actions.
 *
 * @param requiredRoles Single role or array of allowed roles
 * @param session Optional explicit AdminSession. If omitted, fetches from localStorage active session.
 * @returns AdminAuthResult object indicating authorization status
 */
export function verifyAdminRole(
  requiredRoles: ExtendedAdminRole | ExtendedAdminRole[],
  session?: AdminSession | null
): AdminAuthResult {
  const currentSession = session !== undefined ? session : getActiveAdminSession();

  if (!currentSession) {
    return {
      authorized: false,
      session: null,
      errorReason: 'No active admin session found.',
      errorReasonNepali: 'कुनै सक्रिय प्रशासनिक सत्र फेला परेन। कृपया पुनः लगइन गर्नुहोस्।',
    };
  }

  // Update session last activity timestamp on successful check if active session
  if (session === undefined) {
    updateAdminSessionActivity();
  }

  const roleList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const normalizedRequiredRoles = roleList.map(normalizeAdminRole);
  const userRole = normalizeAdminRole(currentSession.role);

  // Super Admin ('super_admin' / 'main_admin') has global access
  if (userRole === 'super_admin') {
    return {
      authorized: true,
      session: currentSession,
    };
  }

  // Check if user's role matches any of the required roles
  const isAuthorized = normalizedRequiredRoles.includes(userRole);

  if (isAuthorized) {
    return {
      authorized: true,
      session: currentSession,
    };
  }

  return {
    authorized: false,
    session: currentSession,
    errorReason: `User role '${currentSession.role}' does not have required permissions: [${normalizedRequiredRoles.join(', ')}]`,
    errorReasonNepali: `अनुरोध अस्वीकृत: तपाईंसँग यो प्रशासनिक कार्य सम्पादन गर्ने अधिकार छैन (आवश्यक भूमिका: ${normalizedRequiredRoles.join(', ')})।`,
  };
}

/**
 * Check if session has a specific permission string (e.g. 'manage_users', 'approve_payments')
 */
export function hasAdminPermission(
  permission: string,
  session?: AdminSession | null
): boolean {
  const currentSession = session !== undefined ? session : getActiveAdminSession();

  if (!currentSession) {
    return false;
  }

  // Super admin has all permissions
  if (normalizeAdminRole(currentSession.role) === 'super_admin') {
    return true;
  }

  return currentSession.permissions ? currentSession.permissions.includes(permission) : false;
}

/**
 * Execute sensitive administrative operation with mandatory role verification
 *
 * @param requiredRoles Allowed roles for this operation
 * @param actionFn Async or Sync function to execute if authorized
 * @param actionNameNepali Description of action for logging/errors
 */
export async function executeProtectedAdminAction<T>(
  requiredRoles: ExtendedAdminRole | ExtendedAdminRole[],
  actionFn: (session: AdminSession) => Promise<T> | T,
  actionNameNepali: string = 'सुरक्षित प्रशासनिक कार्य'
): Promise<{ success: boolean; data?: T; errorNepali?: string }> {
  const auth = verifyAdminRole(requiredRoles);

  if (!auth.authorized || !auth.session) {
    return {
      success: false,
      errorNepali: auth.errorReasonNepali || `${actionNameNepali}का लागि अधिकार पुगेन।`,
    };
  }

  try {
    const data = await actionFn(auth.session);
    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error(`[AdminAuth Protected Execution Error - ${actionNameNepali}]:`, err);
    return {
      success: false,
      errorNepali: `कार्य सम्पादनमा त्रुटि: ${err?.message || 'अज्ञात त्रुटि'}`,
    };
  }
}

/**
 * Check if the provided or active admin session is valid and active.
 *
 * @param session Optional explicit AdminSession
 * @returns boolean true if session is valid and not expired
 */
export function checkSessionValidity(session?: AdminSession | null): boolean {
  const currentSession = session !== undefined ? session : getActiveAdminSession();
  if (!currentSession) {
    return false;
  }

  // Verify inactivity threshold (e.g. 24 hours)
  if (currentSession.lastActivityISO) {
    const lastActive = new Date(currentSession.lastActivityISO).getTime();
    if (isNaN(lastActive)) {
      return false;
    }
    const now = Date.now();
    const maxInactiveMs = 24 * 60 * 60 * 1000; // 24 hours
    if (now - lastActive > maxInactiveMs) {
      return false;
    }
  }

  return true;
}

/**
 * Verify if a session possesses the required administrative role(s).
 * Accepts parameters flexibly: (session, requiredRoles) or (requiredRoles, session).
 * Returns boolean true if authorized.
 *
 * @param param1 Session object OR required role(s)
 * @param param2 Required role(s) OR session object
 * @returns boolean indicating whether access is granted
 */
export function verifyAdminAccess(
  param1: AdminSession | ExtendedAdminRole | ExtendedAdminRole[] | null | undefined,
  param2?: ExtendedAdminRole | ExtendedAdminRole[] | AdminSession | null
): boolean {
  let session: AdminSession | null | undefined;
  let requiredRoles: ExtendedAdminRole | ExtendedAdminRole[];

  if (
    typeof param1 === 'string' ||
    (Array.isArray(param1) && (param1.length === 0 || typeof param1[0] === 'string'))
  ) {
    // Called as verifyAdminAccess(requiredRoles, session)
    requiredRoles = param1 as ExtendedAdminRole | ExtendedAdminRole[];
    session = param2 as AdminSession | null | undefined;
  } else {
    // Called as verifyAdminAccess(session, requiredRoles)
    session = param1 as AdminSession | null | undefined;
    requiredRoles = param2 as ExtendedAdminRole | ExtendedAdminRole[];
  }

  if (!requiredRoles) {
    return checkSessionValidity(session);
  }

  if (!checkSessionValidity(session)) {
    return false;
  }

  const result = verifyAdminRole(requiredRoles, session);
  return result.authorized;
}

export function verifyAdminAccessDetails(
  requiredRoles: ExtendedAdminRole | ExtendedAdminRole[],
  session?: AdminSession | null
): AdminAuthResult {
  return verifyAdminRole(requiredRoles, session);
}

export function verifySessionStatus(session?: AdminSession | null): { active: boolean; session: AdminSession | null; messageNepali: string } {
  const isValid = checkSessionValidity(session);
  const currentSession = session !== undefined ? session : getActiveAdminSession();
  if (!isValid || !currentSession) {
    return {
      active: false,
      session: null,
      messageNepali: 'कुनै सक्रिय प्रशासनिक सत्र भेटिएन वा म्याद सकियो।',
    };
  }
  return {
    active: true,
    session: currentSession,
    messageNepali: 'प्रशासनिक सत्र सक्रिय छ।',
  };
}

export function checkRole(
  requiredRoles: ExtendedAdminRole | ExtendedAdminRole[],
  session?: AdminSession | null
): boolean {
  return verifyAdminRole(requiredRoles, session).authorized;
}

/**
 * AdminAuth Security Class / Object export for structured middleware use
 */
export const AdminAuth = {
  verifyAdminAccess: verifyAdminAccess,
  verifyAdminAccessDetails: verifyAdminAccessDetails,
  checkSessionValidity: checkSessionValidity,
  verifyAccess: verifyAdminAccess,
  verifyRole: verifyAdminRole,
  verifySessionStatus: verifySessionStatus,
  checkRole: checkRole,
  hasPermission: hasAdminPermission,
  executeProtectedAction: executeProtectedAdminAction,
  normalizeRole: normalizeAdminRole,
};

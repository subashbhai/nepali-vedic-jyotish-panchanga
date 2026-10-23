import { apiClient } from './apiClient';
import { RBACSession, setRBACSession, clearRBACSession } from '../db/rbacStore';

export interface SignupStartResponse {
  success: boolean;
  challengeId?: string;
  message: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  isBothVerified: boolean;
  message: string;
}

export interface SignupFinalizeResponse {
  success: boolean;
  user?: any;
  token?: string;
  message: string;
}

export interface DetailedProfileInput {
  fullName?: string;
  address?: string;
  province?: string;
  district?: string;
  localLevel?: string;
  ward?: string;
  streetAddress?: string;
  dobBS?: string;
  dobAD?: string;
  birthTime?: string;
  birthPlace?: string;
  occupation?: string;
  gender?: string;
  birthDetails?: any;
}

class AuthService {
  /**
   * Phase 4: Start signup with exactly 3 fields (Full Name, Mobile Number, Email Address)
   */
  async startSignup(fullName: string, phone: string, email: string): Promise<SignupStartResponse> {
    const res = await apiClient.post<SignupStartResponse>('/api/auth/signup/start', {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase()
    });

    if (res.data) return res.data;
    return {
      success: false,
      message: res.error || 'साइन अप सुरु गर्दा समस्या आयो।'
    };
  }

  /**
   * Phase 5: Verify Mobile OTP
   */
  async verifyPhoneOTP(challengeId: string, otp: string): Promise<OTPVerifyResponse> {
    const res = await apiClient.post<OTPVerifyResponse>('/api/auth/signup/verify-phone', {
      challengeId,
      otp: otp.trim()
    });

    if (res.data) return res.data;
    return {
      success: false,
      phoneVerified: false,
      emailVerified: false,
      isBothVerified: false,
      message: res.error || 'मोबाइल OTP प्रमाणीकरण असफल भयो।'
    };
  }

  /**
   * Phase 5: Verify Email OTP
   */
  async verifyEmailOTP(challengeId: string, otp: string): Promise<OTPVerifyResponse> {
    const res = await apiClient.post<OTPVerifyResponse>('/api/auth/signup/verify-email', {
      challengeId,
      otp: otp.trim()
    });

    if (res.data) return res.data;
    return {
      success: false,
      phoneVerified: false,
      emailVerified: false,
      isBothVerified: false,
      message: res.error || 'इमेल OTP प्रमाणीकरण असफल भयो।'
    };
  }

  /**
   * Phase 5: Resend OTP (with 60s cooldown enforcement on server)
   */
  async resendOTP(challengeId: string, target: 'phone' | 'email' | 'both' = 'both'): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>('/api/auth/signup/resend-otp', {
      challengeId,
      target
    });

    if (res.data) return res.data;
    return {
      success: false,
      message: res.error || 'OTP पुनः पठाउन सकिएन।'
    };
  }

  /**
   * Phase 7: Finalize registration and automatically log in after both OTPs verified
   */
  async finalizeSignup(challengeId: string): Promise<SignupFinalizeResponse> {
    const res = await apiClient.post<SignupFinalizeResponse>('/api/auth/signup/finalize', {
      challengeId
    });

    if (res.data && res.data.success && res.data.user && res.data.token) {
      const user = res.data.user;
      const session: RBACSession = {
        token: res.data.token,
        userId: user.id,
        username: user.phone || user.username,
        fullName: user.fullName,
        role: user.role || 'CUSTOMER',
        roleNameNepali: user.roleNameNepali || 'यजमान / ग्राहक',
        status: user.status || 'active',
        permissions: user.permissions || ['store.view', 'kundali.view', 'profile.edit', 'yajaman.view'],
        customerId: user.customerId,
        phone: user.phone,
        createdAtISO: user.createdAtISO || new Date().toISOString(),
        lastActivityISO: new Date().toISOString()
      };

      setRBACSession(session);
      return res.data;
    }

    return {
      success: false,
      message: res.data?.message || res.error || 'साइन अप सम्पन्न गर्न सकिएन।'
    };
  }

  /**
   * Login with phone/username and password
   */
  async login(phoneOrUsername: string, password: string): Promise<{ success: boolean; session?: RBACSession; message: string }> {
    const res = await apiClient.post<{ success: boolean; user?: any; token?: string; message?: string; error?: string }>('/api/auth/login', {
      phoneOrUsername: phoneOrUsername.trim(),
      password
    });

    if (res.data && res.data.success && res.data.user && res.data.token) {
      const user = res.data.user;
      const session: RBACSession = {
        token: res.data.token,
        userId: user.id,
        username: user.phone || user.username,
        fullName: user.fullName,
        role: user.role || 'CUSTOMER',
        roleNameNepali: user.roleNameNepali || 'यजमान / ग्राहक',
        status: user.status || 'active',
        permissions: user.permissions || ['store.view', 'kundali.view', 'profile.edit', 'yajaman.view'],
        customerId: user.customerId,
        phone: user.phone,
        birthProfileId: user.birthProfileId,
        birthDetails: user.birthDetails,
        createdAtISO: user.createdAtISO || new Date().toISOString(),
        lastActivityISO: new Date().toISOString()
      };

      setRBACSession(session);
      return { success: true, session, message: 'लगइन सफल भयो!' };
    }

    return {
      success: false,
      message: res.data?.error || res.error || 'लगइन असफल भयो।'
    };
  }

  /**
   * Phase 8: Save detailed stage-2 profile info
   */
  async completeDetailedProfile(profile: DetailedProfileInput): Promise<{ success: boolean; user?: any; message: string }> {
    const res = await apiClient.put<{ success: boolean; user?: any; message?: string; error?: string }>('/api/profile/me', profile);

    if (res.data && res.data.success && res.data.user) {
      // Update local session
      const existingRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
      if (existingRaw) {
        try {
          const s = JSON.parse(existingRaw);
          s.fullName = res.data.user.fullName;
          s.birthDetails = res.data.user.birthDetails;
          setRBACSession(s);
        } catch {}
      }

      return {
        success: true,
        user: res.data.user,
        message: res.data.message || 'विस्तृत विवरण सफलतापूर्वक पूरा भयो!'
      };
    }

    return {
      success: false,
      message: res.data?.error || res.error || 'प्रोफाइल अद्यावधिक गर्न सकिएन।'
    };
  }

  /**
   * Logout user and revoke session on server
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout', {});
    } catch {}
    clearRBACSession();
  }
}

export const authService = new AuthService();

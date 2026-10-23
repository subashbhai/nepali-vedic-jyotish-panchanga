import crypto from 'crypto';

export interface SMSDeliveryResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

/**
 * Normalizes phone numbers with special support for Nepal conventions.
 * Supports:
 * - 98XXXXXXXX / 97XXXXXXXX (10 digits)
 * - +977-98XXXXXXXX / 00977-98XXXXXXXX
 * - Standard international phone numbers
 */
export function normalizePhoneNumber(rawPhone: string): { valid: boolean; normalized: string; display: string; countryCode: string } {
  if (!rawPhone) return { valid: false, normalized: '', display: '', countryCode: '' };

  const cleaned = rawPhone.trim().replace(/[\s\-\(\)]/g, '');
  
  // Nepal phone pattern check
  const nepalMatch = cleaned.match(/^(?:\+?977|00977)?(9[78]\d{8})$/);
  if (nepalMatch) {
    const local10 = nepalMatch[1];
    return {
      valid: true,
      normalized: `+977${local10}`,
      display: local10,
      countryCode: '+977'
    };
  }

  // Generic international phone pattern (E.164: + followed by 8 to 15 digits)
  const intlMatch = cleaned.match(/^\+?([1-9]\d{7,14})$/);
  if (intlMatch) {
    return {
      valid: true,
      normalized: `+${intlMatch[1]}`,
      display: `+${intlMatch[1]}`,
      countryCode: `+${intlMatch[1].slice(0, 3)}`
    };
  }

  return { valid: false, normalized: cleaned, display: cleaned, countryCode: '' };
}

/**
 * Validates and normalizes email addresses.
 */
export function normalizeEmail(rawEmail: string): { valid: boolean; normalized: string } {
  if (!rawEmail) return { valid: false, normalized: '' };
  const trimmed = rawEmail.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return {
    valid: emailRegex.test(trimmed),
    normalized: trimmed
  };
}

/**
 * Generates a cryptographically strong 6-digit numeric OTP.
 */
export function generateSecureOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Creates a unique salt and hashes the OTP using SHA-256.
 */
export function hashOTP(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

/**
 * SMS Provider Adapter supporting Sparrow SMS, Twilio, Generic Webhook, and Test/Dev mock.
 */
export class SMSProviderService {
  private providerType: string;
  private isProduction: boolean;
  private lastSentOTPs = new Map<string, string>();

  constructor() {
    this.providerType = (process.env.SMS_PROVIDER || 'mock').toLowerCase();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  getLastSentOTP(phone: string): string | undefined {
    return this.lastSentOTPs.get(phone.replace(/\D/g, '').slice(-10)) || this.lastSentOTPs.get(phone);
  }

  async sendSMS(toPhone: string, otpCode: string, templateContext?: { appName?: string }): Promise<SMSDeliveryResult> {
    this.lastSentOTPs.set(toPhone.replace(/\D/g, '').slice(-10), otpCode);
    this.lastSentOTPs.set(toPhone, otpCode);
    const appName = templateContext?.appName || 'बालानन्द वैदिक ज्योतिष';
    const messageText = `[${appName}] तपाईंको सुरक्षा प्रमाणीकरण कोड (OTP): ${otpCode} हो। यो कोड ५ मिनेटका लागि मात्र मान्य छ। कसैसँग सेयर नगर्नुहोस्।`;

    // 1. Sparrow SMS (Nepal's official SMS gateway)
    if (this.providerType === 'sparrow') {
      const token = process.env.SPARROW_SMS_TOKEN;
      const from = process.env.SPARROW_SMS_FROM || 'TheAlert';

      if (!token) {
        if (this.isProduction) {
          console.error('[SMSProvider] Sparrow SMS Token missing in production environment!');
          return { success: false, provider: 'sparrow', error: 'SMS सेवा कन्फिगर गरिएको छैन (SPARROW_SMS_TOKEN missing).' };
        }
      } else {
        try {
          const res = await fetch('http://api.sparrowsms.com/v2/sms/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              token,
              from,
              to: toPhone.replace(/\D/g, '').slice(-10),
              text: messageText
            })
          });

          const data: any = await res.json().catch(() => ({}));
          if (res.ok && (data.response_code === 200 || data.count >= 1)) {
            console.log(`[SMSProvider] Sparrow SMS dispatched to ${toPhone.slice(-4)}`);
            return { success: true, provider: 'sparrow', messageId: data.response_code };
          }
          return { success: false, provider: 'sparrow', error: data.response || 'Sparrow SMS dispatch failed' };
        } catch (err: any) {
          return { success: false, provider: 'sparrow', error: err.message };
        }
      }
    }

    // 2. Twilio SMS
    if (this.providerType === 'twilio') {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;

      if (!sid || !auth || !from) {
        if (this.isProduction) {
          return { success: false, provider: 'twilio', error: 'Twilio credentials missing in production environment.' };
        }
      } else {
        try {
          const authHeader = Buffer.from(`${sid}:${auth}`).toString('base64');
          const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authHeader}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              To: toPhone,
              From: from,
              Body: messageText
            })
          });
          const data: any = await res.json();
          if (res.ok) {
            return { success: true, provider: 'twilio', messageId: data.sid };
          }
          return { success: false, provider: 'twilio', error: data.message || 'Twilio SMS failed' };
        } catch (err: any) {
          return { success: false, provider: 'twilio', error: err.message };
        }
      }
    }

    // 3. Generic SMS Webhook
    if (this.providerType === 'webhook') {
      const url = process.env.SMS_WEBHOOK_URL;
      const token = process.env.SMS_WEBHOOK_BEARER;

      if (!url) {
        if (this.isProduction) {
          return { success: false, provider: 'webhook', error: 'SMS webhook URL missing in production environment.' };
        }
      } else {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ to: toPhone, text: messageText, template: 'registration_otp' })
          });
          if (res.ok) return { success: true, provider: 'webhook' };
          return { success: false, provider: 'webhook', error: 'Webhook response status ' + res.status };
        } catch (err: any) {
          return { success: false, provider: 'webhook', error: err.message };
        }
      }
    }

    // 4. Development / Testing Mock Provider
    if (!this.isProduction || this.providerType === 'mock') {
      // In development / test environment, securely record delivery event without returning plaintext in API
      console.log(`[SMSProvider:DEV-MOCK] OTP sent to phone ending with ${toPhone.slice(-4)} at ${new Date().toISOString()}`);
      return {
        success: true,
        provider: 'dev-mock',
        messageId: `MOCK-SMS-${Date.now()}`
      };
    }

    return {
      success: false,
      provider: this.providerType,
      error: 'उत्पादन प्रणालीमा मान्य SMS गेटवे कन्फिगर गरिएको छैन। कृपया SPARROW_SMS_TOKEN वा TWILIO_ACCOUNT_SID व्यवस्था गर्नुहोस्।'
    };
  }
}

/**
 * Email Provider Adapter supporting Resend, SendGrid, SMTP Relay, and Test/Dev mock.
 */
export class EmailProviderService {
  private providerType: string;
  private isProduction: boolean;
  private lastSentOTPs = new Map<string, string>();

  constructor() {
    this.providerType = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  getLastSentOTP(email: string): string | undefined {
    return this.lastSentOTPs.get(email.toLowerCase().trim());
  }

  async sendEmail(toEmail: string, otpCode: string, templateContext?: { appName?: string; fullName?: string }): Promise<EmailDeliveryResult> {
    this.lastSentOTPs.set(toEmail.toLowerCase().trim(), otpCode);
    const appName = templateContext?.appName || 'बालानन्द वैदिक ज्योतिष सेवा';
    const fullName = templateContext?.fullName || 'आदरणीय सदस्य';

    const subject = `[${appName}] तपाईंको इमेल प्रमाणीकरण कोड (OTP): ${otpCode}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #7a1c1c; margin: 0;">${appName}</h2>
          <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा</p>
        </div>
        <p style="font-size: 14px; color: #374151;">नमस्कार <strong>${fullName}</strong> ज्यू,</p>
        <p style="font-size: 14px; color: #374151; line-height: 1.6;">
          बालानन्द ज्योतिष प्रणालीमा नयाँ खाता दर्ताका लागि तपाईंको इमेल प्रमाणीकरण कोड (OTP) तल प्रस्तुत गरिएको छ:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #7a1c1c; background-color: #fef3c7; padding: 12px 28px; border-radius: 8px; border: 1px dashed #d97706;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
          • यो सुरक्षा कोड ५ मिनेटका लागि मात्र मान्य हुनेछ।<br/>
          • यदि तपाईंले यो अनुरोध गर्नुभएको होइन भने, कृपया यो इमेललाई बेवास्ता गर्नुहोस्।
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="font-size: 11px; color: #9ca3af; text-align: center;">
          © ${new Date().getFullYear()} ${appName}। सर्वाधिकार सुरक्षित।
        </p>
      </div>
    `;

    // 1. Resend API
    if (this.providerType === 'resend') {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM || 'Balananda Jyotish <auth@balanandajyotish.com>';

      if (!apiKey) {
        if (this.isProduction) {
          return { success: false, provider: 'resend', error: 'Resend API Key missing in production environment.' };
        }
      } else {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from,
              to: [toEmail],
              subject,
              html: htmlBody
            })
          });
          const data: any = await res.json();
          if (res.ok) {
            return { success: true, provider: 'resend', messageId: data.id };
          }
          return { success: false, provider: 'resend', error: data.message || 'Resend email dispatch failed' };
        } catch (err: any) {
          return { success: false, provider: 'resend', error: err.message };
        }
      }
    }

    // 2. SendGrid API
    if (this.providerType === 'sendgrid') {
      const apiKey = process.env.SENDGRID_API_KEY;
      const from = process.env.EMAIL_FROM || 'auth@balanandajyotish.com';

      if (!apiKey) {
        if (this.isProduction) {
          return { success: false, provider: 'sendgrid', error: 'SendGrid API key missing in production.' };
        }
      } else {
        try {
          const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: toEmail }] }],
              from: { email: from, name: appName },
              subject,
              content: [{ type: 'text/html', value: htmlBody }]
            })
          });
          if (res.ok || res.status === 202) {
            return { success: true, provider: 'sendgrid' };
          }
          const text = await res.text();
          return { success: false, provider: 'sendgrid', error: text || 'Sendgrid error' };
        } catch (err: any) {
          return { success: false, provider: 'sendgrid', error: err.message };
        }
      }
    }

    // 3. Development / Testing Mock Provider
    if (!this.isProduction || this.providerType === 'mock') {
      console.log(`[EmailProvider:DEV-MOCK] OTP email sent to ${toEmail.replace(/(.{2})(.*)(?=@)/, '$1***')} at ${new Date().toISOString()}`);
      return {
        success: true,
        provider: 'dev-mock',
        messageId: `MOCK-EMAIL-${Date.now()}`
      };
    }

    return {
      success: false,
      provider: this.providerType,
      error: 'उत्पादन प्रणालीमा मान्य इमेल सेवा कन्फिगर गरिएको छैन। कृपया RESEND_API_KEY वा SENDGRID_API_KEY व्यवस्था गर्नुहोस्।'
    };
  }
}

export const smsProviderService = new SMSProviderService();
export const emailProviderService = new EmailProviderService();

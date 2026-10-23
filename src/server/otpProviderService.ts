import crypto from 'crypto';

export interface SMSDeliveryResult {
  success: boolean;
  provider: string;
  isMock: boolean;
  channelStatus: 'gateway_delivered' | 'gateway_accepted' | 'gateway_rejected' | 'gateway_unconfigured' | 'mock_simulated';
  messageId?: string;
  error?: string;
  notice?: string;
  missingConfig?: string[];
}

export interface EmailDeliveryResult {
  success: boolean;
  provider: string;
  isMock: boolean;
  channelStatus: 'gateway_delivered' | 'gateway_accepted' | 'gateway_rejected' | 'gateway_unconfigured' | 'mock_simulated';
  messageId?: string;
  error?: string;
  notice?: string;
  missingConfig?: string[];
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
  private lastSentOTPs = new Map<string, string>();

  public getActiveProvider(): string {
    const explicit = (process.env.SMS_PROVIDER || '').trim().toLowerCase();
    if (explicit) return explicit;
    if (process.env.SPARROW_SMS_TOKEN) return 'sparrow';
    if (process.env.TWILIO_ACCOUNT_SID) return 'twilio';
    if (process.env.SMS_WEBHOOK_URL) return 'webhook';
    return 'mock';
  }

  public get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  getLastSentOTP(phone: string): string | undefined {
    return this.lastSentOTPs.get(phone.replace(/\D/g, '').slice(-10)) || this.lastSentOTPs.get(phone);
  }

  async sendSMS(toPhone: string, otpCode: string, templateContext?: { appName?: string }): Promise<SMSDeliveryResult> {
    const providerType = this.getActiveProvider();
    const clean10 = toPhone.replace(/\D/g, '').slice(-10);
    this.lastSentOTPs.set(clean10, otpCode);
    this.lastSentOTPs.set(toPhone, otpCode);

    const appName = templateContext?.appName || 'बालानन्द वैदिक ज्योतिष';
    const messageText = `[${appName}] तपाईंको सुरक्षा प्रमाणीकरण कोड (OTP): ${otpCode} हो। यो कोड ५ मिनेटका लागि मात्र मान्य छ। कसैसँग सेयर नगर्नुहोस्।`;

    // 1. Sparrow SMS (Nepal's Official Gateway)
    if (providerType === 'sparrow') {
      const token = process.env.SPARROW_SMS_TOKEN;
      const from = process.env.SPARROW_SMS_FROM || 'TheAlert';

      if (!token || token === 'your_sparrow_sms_token') {
        return {
          success: false,
          provider: 'sparrow',
          isMock: false,
          channelStatus: 'gateway_unconfigured',
          error: 'Sparrow SMS टोकन (.env मा SPARROW_SMS_TOKEN) खाली वा पूर्वनिर्धारित छ।',
          missingConfig: ['SPARROW_SMS_TOKEN']
        };
      }

      try {
        const res = await fetch('http://api.sparrowsms.com/v2/sms/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token,
            from,
            to: clean10,
            text: messageText
          })
        });

        const data: any = await res.json().catch(() => ({}));
        if (res.ok && (data.response_code === 200 || data.count >= 1)) {
          return {
            success: true,
            provider: 'sparrow',
            isMock: false,
            channelStatus: 'gateway_accepted',
            messageId: String(data.response_code || '200'),
            notice: 'Sparrow SMS गेटवेमा सन्देश सफलतापूर्वक पठाइयो।'
          };
        }

        // Map Sparrow SMS specific error codes
        let errorDetail = data.response || 'Sparrow SMS dispatch failed';
        if (data.response_code === 1001) errorDetail = 'Sparrow SMS टोकन अमान्य छ (1001 Invalid Token)';
        if (data.response_code === 1002) errorDetail = 'सन्देश खाली छ (1002 Empty Text)';
        if (data.response_code === 1003) errorDetail = 'SMS मौज्दात (Credit) समाप्त भएको छ (1003 Insufficient Credit)';
        if (data.response_code === 1004) errorDetail = 'अमान्य प्रेषक आईडी (1004 Invalid Sender ID)';
        if (data.response_code === 1005) errorDetail = 'अमान्य प्रापक मोबाइल नम्बर (1005 Invalid Recipient)';

        return {
          success: false,
          provider: 'sparrow',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: errorDetail
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'sparrow',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: `Sparrow SMS नेटवर्क त्रुटि: ${err.message}`
        };
      }
    }

    // 2. Twilio SMS
    if (providerType === 'twilio') {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;

      if (!sid || !auth || !from || sid === 'your_twilio_sid') {
        const missing: string[] = [];
        if (!sid || sid === 'your_twilio_sid') missing.push('TWILIO_ACCOUNT_SID');
        if (!auth || auth === 'your_twilio_token') missing.push('TWILIO_AUTH_TOKEN');
        if (!from) missing.push('TWILIO_PHONE_NUMBER');
        return {
          success: false,
          provider: 'twilio',
          isMock: false,
          channelStatus: 'gateway_unconfigured',
          error: `Twilio विवरण (.env) अधुरो छ: ${missing.join(', ')}`,
          missingConfig: missing
        };
      }

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
          return {
            success: true,
            provider: 'twilio',
            isMock: false,
            channelStatus: 'gateway_accepted',
            messageId: data.sid,
            notice: 'Twilio SMS गेटवेमा स्वीकार भयो।'
          };
        }
        return {
          success: false,
          provider: 'twilio',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: data.message || `Twilio SMS त्रुटि (${res.status})`
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'twilio',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: `Twilio नेटवर्क त्रुटि: ${err.message}`
        };
      }
    }

    // 3. Generic SMS Webhook
    if (providerType === 'webhook') {
      const url = process.env.SMS_WEBHOOK_URL;
      const token = process.env.SMS_WEBHOOK_BEARER;

      if (!url) {
        return {
          success: false,
          provider: 'webhook',
          isMock: false,
          channelStatus: 'gateway_unconfigured',
          error: 'SMS Webhook URL (.env मा SMS_WEBHOOK_URL) खाली छ।',
          missingConfig: ['SMS_WEBHOOK_URL']
        };
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ to: toPhone, text: messageText, template: 'registration_otp' })
        });
        if (res.ok) {
          return {
            success: true,
            provider: 'webhook',
            isMock: false,
            channelStatus: 'gateway_accepted',
            notice: 'SMS Webhook मा पठाइयो।'
          };
        }
        return {
          success: false,
          provider: 'webhook',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: `Webhook प्रतिक्रिया स्थिति: ${res.status}`
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'webhook',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: `Webhook त्रुटि: ${err.message}`
        };
      }
    }

    // 4. Development / Testing Mock Provider (fallback when no gateway configured)
    return {
      success: true,
      provider: 'dev-mock',
      isMock: true,
      channelStatus: 'mock_simulated',
      messageId: `MOCK-SMS-${Date.now()}`,
      notice: 'परीक्षण सिम्युलेसन मोड: वास्तविक SMS गेटवे (.env मा SPARROW_SMS_TOKEN) कन्फिगर नभएकोले परीक्षण कोड कन्सोल र इन्टरफेसमा उपलब्ध गराइएको छ।'
    };
  }
}

/**
 * Email Provider Adapter supporting Resend, SendGrid, and Test/Dev mock.
 */
export class EmailProviderService {
  private lastSentOTPs = new Map<string, string>();

  public getActiveProvider(): string {
    const explicit = (process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
    if (explicit) return explicit;
    if (process.env.RESEND_API_KEY) return 'resend';
    if (process.env.SENDGRID_API_KEY) return 'sendgrid';
    return 'mock';
  }

  public get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  getLastSentOTP(email: string): string | undefined {
    return this.lastSentOTPs.get(email.toLowerCase().trim());
  }

  async sendEmail(toEmail: string, otpCode: string, templateContext?: { appName?: string; fullName?: string }): Promise<EmailDeliveryResult> {
    const providerType = this.getActiveProvider();
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
    if (providerType === 'resend') {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM || 'Balananda Jyotish <onboarding@resend.dev>';

      if (!apiKey || apiKey === 'your_resend_api_key') {
        return {
          success: false,
          provider: 'resend',
          isMock: false,
          channelStatus: 'gateway_unconfigured',
          error: 'Resend API Key (.env मा RESEND_API_KEY) खाली वा पूर्वनिर्धारित छ।',
          missingConfig: ['RESEND_API_KEY']
        };
      }

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
          return {
            success: true,
            provider: 'resend',
            isMock: false,
            channelStatus: 'gateway_accepted',
            messageId: data.id,
            notice: 'Resend इमेल गेटवेमा सन्देश सफलतापूर्वक स्वीकार भयो।'
          };
        }
        return {
          success: false,
          provider: 'resend',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: data.message || `Resend इमेल अस्वीकृत (${res.status})`
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'resend',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: `Resend नेटवर्क त्रुटि: ${err.message}`
        };
      }
    }

    // 2. SendGrid API
    if (providerType === 'sendgrid') {
      const apiKey = process.env.SENDGRID_API_KEY;
      const from = process.env.EMAIL_FROM || 'auth@balanandajyotish.com';

      if (!apiKey || apiKey === 'your_sendgrid_api_key') {
        return {
          success: false,
          provider: 'sendgrid',
          isMock: false,
          channelStatus: 'gateway_unconfigured',
          error: 'SendGrid API key (.env मा SENDGRID_API_KEY) खाली वा पूर्वनिर्धारित छ।',
          missingConfig: ['SENDGRID_API_KEY']
        };
      }

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
          return {
            success: true,
            provider: 'sendgrid',
            isMock: false,
            channelStatus: 'gateway_accepted',
            notice: 'SendGrid इमेल गेटवेमा स्वीकार भयो।'
          };
        }
        const text = await res.text();
        return {
          success: false,
          provider: 'sendgrid',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: text || `Sendgrid त्रुटि (${res.status})`
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'sendgrid',
          isMock: false,
          channelStatus: 'gateway_rejected',
          error: `Sendgrid नेटवर्क त्रुटि: ${err.message}`
        };
      }
    }

    // 3. Development / Testing Mock Provider (fallback when no gateway configured)
    return {
      success: true,
      provider: 'dev-mock',
      isMock: true,
      channelStatus: 'mock_simulated',
      messageId: `MOCK-EMAIL-${Date.now()}`,
      notice: 'परीक्षण सिम्युलेसन मोड: वास्तविक Email गेटवे (.env मा RESEND_API_KEY) कन्फिगर नभएकोले परीक्षण कोड कन्सोल र इन्टरफेसमा उपलब्ध गराइएको छ।'
    };
  }
}

export const smsProviderService = new SMSProviderService();
export const emailProviderService = new EmailProviderService();

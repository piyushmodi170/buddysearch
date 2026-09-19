export type MailVars = Record<string, string>;

export type DefaultEmailTemplate = {
  slug: string;
  name: string;
  description: string;
  kind: 'SYSTEM' | 'MARKETING';
  subject: string;
  body: string;
  active: boolean;
};

export const renderVars = (source: string, vars: MailVars) => {
  const merged: MailVars = { ...vars };
  if (merged.code && !merged.otp) merged.otp = merged.code;
  if (merged.otp && !merged.code) merged.code = merged.otp;
  return String(source || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => (
    merged[key] == null ? '' : String(merged[key])
  ));
};

export const SAMPLE_PREVIEW_VARS: MailVars = {
  name: 'Jane',
  email: 'jane@example.com',
  code: '482910',
  otp: '482910',
  minutes: '10',
  appName: 'BuddySearch',
  appUrl: 'https://buddysearch.online',
  plan: 'Premium',
  amount: '449',
};

export const wrapEmailHtml = (inner: string, appName: string) => `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:#E53E3E;color:#fff;padding:22px 24px;text-align:center;">
              <div style="font-size:20px;font-weight:800;letter-spacing:0.02em;">${appName}</div>
              <div style="font-size:12px;opacity:0.9;margin-top:4px;">Find a buddy for every plan</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-size:15px;line-height:1.65;color:#374151;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-size:12px;color:#9ca3af;text-align:center;">
              © ${new Date().getFullYear()} ${appName}. You’re receiving this because you have an account with us.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const DEFAULT_EMAIL_TEMPLATES: DefaultEmailTemplate[] = [
  {
    slug: 'welcome',
    name: 'Welcome Email',
    description: 'Sent automatically when a new user registers.',
    kind: 'SYSTEM',
    active: true,
    subject: 'Welcome to {{appName}}, {{name}}',
    body: `<p>Hi {{name}},</p>
<p>Your BuddySearch account is ready. Complete your profile so people in your city can find you.</p>
<p><a href="{{appUrl}}/onboarding" style="display:inline-block;background:#E53E3E;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;">Complete your profile</a></p>`,
  },
  {
    slug: 'email-otp',
    name: 'Email Verification OTP',
    description: 'Sent during signup with a 6-digit code to verify the user’s email.',
    kind: 'SYSTEM',
    active: true,
    subject: 'Your {{appName}} verification code: {{code}}',
    body: `<h2 style="margin:0 0 12px;font-size:22px;color:#111827;">Verify your email, {{name}} 👋</h2>
<p>Welcome to {{appName}}! Use the code below to verify your email address and finish setting up your account.</p>
<div style="text-align:center;background:#f3f4f6;border-radius:12px;padding:20px 16px;margin:20px 0;">
  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Your verification code</p>
  <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#2563eb;font-family:ui-monospace,Menlo,monospace;">{{code}}</p>
</div>
<p>This code expires in <strong>{{minutes}} minutes</strong>. If you didn’t request this, you can safely ignore the email.</p>`,
  },
  {
    slug: 'password-reset',
    name: 'Password Reset OTP',
    description: 'Sent when a user requests a password reset.',
    kind: 'SYSTEM',
    active: true,
    subject: 'Reset your {{appName}} password',
    body: `<h2 style="margin:0 0 12px;font-size:22px;color:#111827;">Reset your password, {{name}}</h2>
<p>Use the code below to choose a new password. It expires in <strong>{{minutes}} minutes</strong>.</p>
<div style="text-align:center;background:#f3f4f6;border-radius:12px;padding:20px 16px;margin:20px 0;">
  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Your reset code</p>
  <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#2563eb;font-family:ui-monospace,Menlo,monospace;">{{code}}</p>
</div>
<p>If you did not request this, you can ignore this email.</p>`,
  },
  {
    slug: 'payment-confirmation',
    name: 'Invoice / Payment Confirmation',
    description: 'Sent when a user completes a membership payment.',
    kind: 'SYSTEM',
    active: true,
    subject: 'Payment confirmed — {{plan}} membership',
    body: `<p>Hi {{name}},</p>
<p>Thanks for upgrading. Your <strong>{{plan}}</strong> membership is active.</p>
<p>Amount paid: <strong>₹{{amount}}</strong></p>
<p><a href="{{appUrl}}/membership" style="color:#E53E3E;font-weight:700;">View membership</a></p>`,
  },
  {
    slug: 'purchase-thanks',
    name: 'Purchase Thank You',
    description: 'Optional thank-you email after a purchase. Disabled by default — payment confirmation already covers the receipt.',
    kind: 'SYSTEM',
    active: false,
    subject: 'Thank you for joining {{appName}}',
    body: `<p>Hi {{name}},</p>
<p>Thanks for supporting BuddySearch. Your {{plan}} plan is ready to use.</p>`,
  },
  {
    slug: 'incomplete-profile',
    name: 'Incomplete Profile Reminder',
    description: 'Reminder sent to users who signed up but have not finished onboarding.',
    kind: 'SYSTEM',
    active: true,
    subject: 'Finish your {{appName}} profile',
    body: `<p>Hi {{name}},</p>
<p>Your account is created, but your profile is still incomplete. Add a photo, city, and services so people can find you.</p>
<p><a href="{{appUrl}}/onboarding" style="display:inline-block;background:#E53E3E;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;">Complete profile</a></p>`,
  },
  {
    slug: 'marketing-announcement',
    name: 'Marketing — Product Announcement',
    description: 'Something new just landed',
    kind: 'MARKETING',
    active: true,
    subject: 'What’s new on {{appName}}',
    body: `<p>Hi {{name}},</p>
<p>We just shipped something new on BuddySearch. Open the app and take a look.</p>
<p><a href="{{appUrl}}" style="color:#E53E3E;font-weight:700;">Open {{appName}}</a></p>`,
  },
  {
    slug: 'marketing-promo',
    name: 'Marketing — Promo / Discount',
    description: 'Exclusive offer for you, {{name}}',
    kind: 'MARKETING',
    active: true,
    subject: 'Exclusive offer just for you, {{name}}',
    body: `<p>Hi {{name}},</p>
<p>We have an exclusive offer for you — top up today and get more from BuddySearch memberships.</p>
<p><a href="{{appUrl}}/membership" style="display:inline-block;background:#E53E3E;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;">See plans</a></p>`,
  },
  {
    slug: 'marketing-reengagement',
    name: 'Marketing — Re-engagement',
    description: 'We miss you, {{name}}',
    kind: 'MARKETING',
    active: true,
    subject: 'We miss you on {{appName}}',
    body: `<p>Hi {{name}},</p>
<p>It has been a while. People in your city are posting new plans — come back and say hello.</p>
<p><a href="{{appUrl}}/hire" style="color:#E53E3E;font-weight:700;">See what’s happening</a></p>`,
  },
];

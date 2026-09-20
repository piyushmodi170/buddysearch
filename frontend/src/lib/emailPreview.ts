export const SAMPLE_PREVIEW_VARS: Record<string, string> = {
  name: 'Jane',
  email: 'jane@example.com',
  code: '482910',
  otp: '482910',
  minutes: '10',
  appName: 'BuddySearch',
  appUrl: 'https://buddysearch.online',
  plan: 'Premium',
  amount: '449',
  logoUrl: 'https://buddysearch.online/logo.png',
};

export const renderPreviewVars = (source: string, vars: Record<string, string> = SAMPLE_PREVIEW_VARS) => {
  const merged = { ...SAMPLE_PREVIEW_VARS, ...vars };
  if (merged.code && !merged.otp) merged.otp = merged.code;
  if (merged.otp && !merged.code) merged.code = merged.otp;
  return String(source || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => merged[key] ?? '');
};

export const wrapPreviewHtml = (inner: string, appName = 'BuddySearch', appUrl = 'https://buddysearch.online') => {
  const looksHtml = /<[a-z][\s\S]*>/i.test(inner);
  const htmlInner = looksHtml ? inner : inner.split('\n').map((line) => `<p>${line || '&nbsp;'}</p>`).join('');
  if (/<html/i.test(inner)) return inner;
  const logo = `${String(appUrl).replace(/\/$/, '')}/logo.png`;
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9efef;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9efef;padding:16px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0e0e0;">
          <tr>
            <td style="background:#ffffff;padding:22px 24px 16px;text-align:center;border-bottom:1px solid #f9efef;">
              <img src="${logo}" alt="${appName}" width="200" height="37" style="height:40px;width:auto;display:inline-block;border:0;" />
              <div style="font-size:12px;color:#F96566;margin-top:10px;font-weight:700;">Find a buddy for every plan</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-size:15px;line-height:1.65;color:#374151;">
              ${htmlInner}
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
};

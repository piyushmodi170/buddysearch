import { prisma } from './db.js';
import { config } from './index.js';

export type SettingKey = 'razorpay' | 'smtp' | 'google' | 'app';

export type RazorpaySettings = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

export type SmtpSettings = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  secure: boolean;
};

export type GoogleSettings = {
  clientId: string;
  clientSecret: string;
};

export type AppSettings = {
  url: string;
};

type SettingsMap = {
  razorpay: RazorpaySettings;
  smtp: SmtpSettings;
  google: GoogleSettings;
  app: AppSettings;
};

const cache = new Map<SettingKey, unknown>();

const envDefaults: SettingsMap = {
  razorpay: {
    keyId: config.razorpay.keyId,
    keySecret: config.razorpay.keySecret,
    webhookSecret: config.razorpay.webhookSecret,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || '',
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
  },
  google: {
    clientId: config.google.clientId,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  app: {
    url: process.env.FRONTEND_URL || config.frontendUrl || 'https://buddysearch.in',
  },
};

const SECRET_FIELDS: Record<SettingKey, string[]> = {
  razorpay: ['keySecret', 'webhookSecret'],
  smtp: ['password'],
  google: ['clientSecret'],
  app: [],
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export const maskSecret = (value?: string | null): string => {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(12, Math.max(4, value.length - 4)))}${value.slice(-4)}`;
};

export const maskSettings = <K extends SettingKey>(key: K, value: SettingsMap[K]) => {
  const secrets = SECRET_FIELDS[key];
  const out: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  for (const field of secrets) {
    const current = out[field];
    out[field] = typeof current === 'string' && current ? maskSecret(current) : '';
    out[`${field}Configured`] = Boolean(typeof current === 'string' && current.length > 0);
  }
  return out;
};

export const getSetting = async <K extends SettingKey>(key: K): Promise<SettingsMap[K]> => {
  if (cache.has(key)) {
    return cache.get(key) as SettingsMap[K];
  }
  const row = await prisma.appSetting.findUnique({ where: { key } });
  const stored = row && isObject(row.value) ? row.value : {};
  const merged = { ...envDefaults[key], ...stored } as SettingsMap[K];
  cache.set(key, merged);
  return merged;
};

const looksMasked = (value: string) => value.includes('•') || /^\*+$/.test(value);

export const setSetting = async <K extends SettingKey>(
  key: K,
  patch: Partial<SettingsMap[K]>
): Promise<SettingsMap[K]> => {
  const current = await getSetting(key);
  const next: Record<string, unknown> = { ...(current as Record<string, unknown>) };
  const secrets = new Set(SECRET_FIELDS[key]);

  for (const [field, raw] of Object.entries(patch as Record<string, unknown>)) {
    if (raw === undefined) continue;
    if (secrets.has(field)) {
      const str = String(raw ?? '');
      if (!str || looksMasked(str)) continue; // keep existing secret
      next[field] = str;
    } else if (field === 'port') {
      next[field] = Number(raw) || 0;
    } else if (field === 'secure') {
      next[field] = Boolean(raw);
    } else if (typeof raw === 'string') {
      next[field] = raw.trim();
    } else {
      next[field] = raw;
    }
  }

  await prisma.appSetting.upsert({
    where: { key },
    update: { value: next as object },
    create: { key, value: next as object },
  });
  cache.set(key, next);
  return next as SettingsMap[K];
};

export const settingStatus = async () => {
  const [razorpay, smtp, google, app] = await Promise.all([
    getSetting('razorpay'),
    getSetting('smtp'),
    getSetting('google'),
    getSetting('app'),
  ]);
  return {
    razorpay: {
      configured: Boolean(razorpay.keyId && razorpay.keySecret),
      webhookConfigured: Boolean(razorpay.webhookSecret),
    },
    smtp: {
      configured: Boolean(smtp.host && smtp.from),
    },
    google: {
      configured: Boolean(google.clientId),
    },
    app: {
      url: app.url,
    },
  };
};

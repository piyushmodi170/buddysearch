export type RazorpayMode = 'test' | 'live';

export type RazorpaySettings = {
  mode: RazorpayMode;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  testKeyId: string;
  testKeySecret: string;
  liveKeyId: string;
  liveKeySecret: string;
};

const asMode = (value: unknown): RazorpayMode => (value === 'live' ? 'live' : 'test');

export const resolveRazorpaySettings = (raw: Partial<RazorpaySettings> & Record<string, unknown> = {}): RazorpaySettings => {
  const legacyId = String(raw.keyId || '');
  const legacySecret = String(raw.keySecret || '');
  const testKeyId = String(raw.testKeyId || (legacyId.startsWith('rzp_test_') ? legacyId : ''));
  const testKeySecret = String(raw.testKeySecret || (legacyId.startsWith('rzp_test_') ? legacySecret : ''));
  const liveKeyId = String(raw.liveKeyId || (legacyId.startsWith('rzp_live_') ? legacyId : ''));
  const liveKeySecret = String(raw.liveKeySecret || (legacyId.startsWith('rzp_live_') ? legacySecret : ''));

  let mode = asMode(raw.mode);
  if (!raw.mode) {
    if (liveKeyId && !testKeyId) mode = 'live';
    else if (legacyId.startsWith('rzp_live_')) mode = 'live';
    else mode = 'test';
  }

  const keyId = mode === 'live' ? liveKeyId : testKeyId;
  const keySecret = mode === 'live' ? liveKeySecret : testKeySecret;

  return {
    mode,
    testKeyId,
    testKeySecret,
    liveKeyId,
    liveKeySecret,
    keyId,
    keySecret,
    webhookSecret: String(raw.webhookSecret || ''),
  };
};

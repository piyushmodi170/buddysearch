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

const hasPair = (id: string, secret: string) => Boolean(id && secret);

/** Prefer live keys; fall back to test keys so checkout can still open. */
export const resolveRazorpaySettings = (raw: Partial<RazorpaySettings> & Record<string, unknown> = {}): RazorpaySettings => {
  const legacyId = String(raw.keyId || '');
  const legacySecret = String(raw.keySecret || '');
  const testKeyId = String(raw.testKeyId || (legacyId.startsWith('rzp_test_') ? legacyId : ''));
  const testKeySecret = String(raw.testKeySecret || (legacyId.startsWith('rzp_test_') ? legacySecret : ''));
  const liveKeyId = String(
    raw.liveKeyId || (legacyId.startsWith('rzp_live_') ? legacyId : !legacyId.startsWith('rzp_test_') ? legacyId : '')
  );
  const liveKeySecret = String(
    raw.liveKeySecret || (legacyId.startsWith('rzp_test_') ? '' : legacySecret)
  );

  const useLive = hasPair(liveKeyId, liveKeySecret);
  const useTest = hasPair(testKeyId, testKeySecret);

  return {
    mode: useLive ? 'live' : useTest ? 'test' : 'live',
    testKeyId,
    testKeySecret,
    liveKeyId,
    liveKeySecret,
    keyId: useLive ? liveKeyId : useTest ? testKeyId : liveKeyId,
    keySecret: useLive ? liveKeySecret : useTest ? testKeySecret : liveKeySecret,
    webhookSecret: String(raw.webhookSecret || ''),
  };
};

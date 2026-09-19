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

/** Checkout and verify always use live (rzp_live_) keys. Test-mode keys are ignored. */
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

  return {
    mode: 'live',
    testKeyId,
    testKeySecret,
    liveKeyId,
    liveKeySecret,
    keyId: liveKeyId,
    keySecret: liveKeySecret,
    webhookSecret: String(raw.webhookSecret || ''),
  };
};

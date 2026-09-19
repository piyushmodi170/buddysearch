export const isDatabaseError = (err: unknown) => {
  const anyErr = err as { code?: string; message?: string } | undefined;
  const code = String(anyErr?.code || '');
  if (/^P100[123]$/.test(code) || code === 'P1017' || code === 'P2037') return true;
  const text = String(anyErr?.message || err || '');
  return /replica.?set.?no.?primary|server selection timeout|MongoNetworkError|MongoServerSelection|tls handshake|no available servers|database ping|can'?t reach database|could not connect to|ECONNREFUSED|ENOTFOUND|query engine/i.test(
    text
  );
};

export const publicDatabaseError =
  'Cannot reach MongoDB Atlas. The Coolify dashboard IP is often not the IP Atlas sees. Open /health, copy outboundIp, add that IP in Atlas → Network Access (or add 0.0.0.0/0), wait one minute, then try again.';

export const publicAuthError = (err: unknown, fallback: string) => {
  if (isDatabaseError(err)) return publicDatabaseError;
  const text = String((err as { message?: string })?.message || '');
  if (
    /Invalid `prisma|Inconsistent column data|was provided invalid|Record to update not found|P2025/i.test(
      text
    )
  ) {
    return 'Could not finish signing you in. Please try Sign In again.';
  }
  if (/E11000|duplicate key/i.test(text)) {
    return 'Could not finish signing you in. Please try Sign In again.';
  }
  return text || fallback;
};

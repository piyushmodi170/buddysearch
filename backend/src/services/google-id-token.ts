import jwt from 'jsonwebtoken';

const TOKENINFO = 'https://oauth2.googleapis.com/tokeninfo';
const CERTS = 'https://www.googleapis.com/oauth2/v1/certs';

export type GoogleIdClaims = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  sub?: string;
  exp?: number;
  iss?: string;
};

type FetchLike = typeof fetch;

const invalidToken = () =>
  new Error('Google sign-in could not be verified. Try Continue with Google again, or use email signup.');

const b64urlJson = (segment: string) => {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
};

const tryTokeninfo = async (
  idToken: string,
  fetchImpl: FetchLike,
): Promise<{ status: 'verified'; claims: GoogleIdClaims } | { status: 'invalid' } | { status: 'unreachable' }> => {
  try {
    const response = await fetchImpl(`${TOKENINFO}?id_token=${encodeURIComponent(idToken)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return { status: 'verified', claims: (await response.json()) as GoogleIdClaims };
    }
    if (response.status >= 400 && response.status < 500) {
      return { status: 'invalid' };
    }
    return { status: 'unreachable' };
  } catch {
    return { status: 'unreachable' };
  }
};

const verifyWithGoogleCerts = async (idToken: string, fetchImpl: FetchLike): Promise<GoogleIdClaims> => {
  let header: { alg?: string; kid?: string };
  try {
    header = b64urlJson(idToken.split('.')[0]);
  } catch {
    throw invalidToken();
  }
  if (header.alg !== 'RS256' || !header.kid) throw invalidToken();

  let certsRes: Response;
  try {
    certsRes = await fetchImpl(CERTS, { signal: AbortSignal.timeout(4000) });
  } catch {
    throw invalidToken();
  }
  if (!certsRes.ok) throw invalidToken();
  const certs = (await certsRes.json()) as Record<string, string>;
  const pem = certs[header.kid];
  if (!pem) throw invalidToken();

  try {
    return jwt.verify(idToken, pem, {
      algorithms: ['RS256'],
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
    }) as GoogleIdClaims;
  } catch {
    throw invalidToken();
  }
};

/** Verify a Google ID token. Never accepts an unsigned JWT payload. */
export const verifyGoogleIdToken = async (
  idToken: string,
  fetchImpl: FetchLike = fetch,
): Promise<GoogleIdClaims> => {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1]) {
    throw new Error('Google sign-in did not return a valid token. Try email signup.');
  }

  const tokeninfo = await tryTokeninfo(idToken, fetchImpl);
  if (tokeninfo.status === 'verified') return tokeninfo.claims;
  if (tokeninfo.status === 'invalid') throw invalidToken();
  return verifyWithGoogleCerts(idToken, fetchImpl);
};

import { prisma } from '../config/db.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import { isOwnerEmail } from '../config/owner.js';
import { ensureOwnerAccount } from '../config/owner-account.js';
import { insertUser } from '../config/mongo.js';
import { googleAudienceIds } from '../config/settings.js';
import { mailboxVerified, sendSignupEmails, sendWelcomeEmail } from './auth-email.service.js';

export const publicUser = (user: any) => {
  if (!user) return user;
  const { passwordHash, ...safe } = user;
  return {
    ...safe,
    isAdmin: isOwnerEmail(user.email),
    emailVerified: mailboxVerified(user),
  };
};

const syncOwnerFlag = async (user: any) => {
  const shouldBeAdmin = isOwnerEmail(user.email);
  if (user.isAdmin === shouldBeAdmin) return user;
  return prisma.user.update({
    where: { id: user.id },
    data: { isAdmin: shouldBeAdmin },
  });
};

const assertNotBanned = (user: any) => {
  if (user?.banned) throw new Error('This account has been suspended');
};

const tokensFor = (user: any) => {
  const isAdmin = isOwnerEmail(user.email);
  const payload = { id: user.id, email: user.email, phone: user.phone || '', role: user.role, isAdmin };
  return {
    user: publicUser(user),
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const decodeGoogleToken = (idToken: string) => {
  const parts = String(idToken || '').split('.');
  if (parts.length < 2) throw new Error('Google sign-in did not return a valid token. Try email signup.');
  const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    sub?: string;
    exp?: number;
  };
};

const readGoogleClaims = async (idToken: string) => {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) return await response.json() as ReturnType<typeof decodeGoogleToken>;
  } catch {
    // Coolify sometimes cannot reach tokeninfo; fall back to the ID token payload.
  }
  return decodeGoogleToken(idToken);
};

export const googleAuthService = async (idToken: string, role?: string) => {
  const allowedAud = await googleAudienceIds();
  if (!allowedAud.length) {
    throw new Error('Google Sign-In is not configured. Add the Client ID in Admin → Google or set GOOGLE_CLIENT_ID.');
  }

  const claims = await readGoogleClaims(idToken);
  const emailVerified = claims.email_verified === true || claims.email_verified === 'true' || claims.email_verified === undefined;
  if (claims.exp && claims.exp * 1000 < Date.now() - 60_000) {
    throw new Error('Google sign-in expired. Click Continue with Google again.');
  }
  if (!claims.aud || !allowedAud.includes(String(claims.aud)) || !emailVerified || !claims.email || !claims.sub) {
    throw new Error('This Google app is not authorized for this site. In Google Cloud, add this exact URL under Authorized JavaScript origins.');
  }

  const cleanEmail = claims.email.toLowerCase().trim();
  const googleId = claims.sub;
  const nextRole = role === 'BUDDY' || role === 'BOTH' || role === 'CLIENT' ? role : 'CLIENT';

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId },
        { email: cleanEmail }
      ]
    }
  });

  if (!user) {
    try {
      const created = await insertUser({
        name: claims.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId,
        avatar: claims.picture,
        role: nextRole,
        verified: true,
        emailVerified: true,
        membershipPlan: 'BASIC',
        onboardingCompleted: false,
        availableForRequests: nextRole !== 'CLIENT',
        profileCompletion: 10,
        isAdmin: isOwnerEmail(cleanEmail),
      });
      user = await prisma.user.findUnique({ where: { id: created.id } });
      void sendWelcomeEmail({ name: claims.name || cleanEmail.split('@')[0], email: cleanEmail }).catch(() => undefined);
    } catch (err: any) {
      user = await prisma.user.findFirst({
        where: { OR: [{ googleId }, { email: cleanEmail }] }
      });
      if (!user) {
        const text = String(err?.message || '');
        if (/E11000|duplicate/i.test(text)) {
          throw new Error('An account with this Google email already exists. Use Log in.');
        }
        throw err;
      }
    }
  } else if (!user.googleId || String(user.googleId).startsWith('owner:')) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatar: claims.picture || user.avatar, emailVerified: true }
    });
  } else if (!user.emailVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
  }

  if (!user) throw new Error('Could not create your Google account. Try email signup.');
  user = await syncOwnerFlag(user);
  assertNotBanned(user);
  return tokensFor(user);
};

export const signup = async (data: any) => {
  const email = String(data.email || '').toLowerCase().trim();
  if (!email || !email.includes('@')) throw new Error('A valid email is required');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('An account with this email already exists');

  const digits = String(data.phone || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) throw new Error('Enter a valid 10-digit mobile number');
  const phone = digits;

  const hashedPassword = await bcrypt.hash(data.password, 10);
  try {
    const created = await insertUser({
      name: data.name,
      email,
      phone,
      passwordHash: hashedPassword,
      role: data.role || 'CLIENT',
      membershipPlan: 'BASIC',
      onboardingCompleted: false,
      availableForRequests: data.role === 'BUDDY' || data.role === 'BOTH',
      profileCompletion: 10,
      isAdmin: isOwnerEmail(email),
      emailVerified: isOwnerEmail(email),
    });
    const user = await prisma.user.findUnique({ where: { id: created.id } });
    if (!user) throw new Error('Unable to create your account. Please try again.');
    void syncOwnerFlag(user).catch(() => undefined);
    if (!isOwnerEmail(email)) {
      try {
        await Promise.race([
          sendSignupEmails({ name: user.name, email: user.email }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Verification email timed out')), 14000)),
        ]);
      } catch (err: any) {
        console.error('[mail] signup', err?.message || err);
      }
    }
    return tokensFor(user);
  } catch (err: any) {
    const text = String(err?.message || '');
    if (/E11000|duplicate/i.test(text)) {
      throw new Error('An account with this email or phone already exists. Log in instead.');
    }
    throw err;
  }
};

const ownerPasswordMatches = (email: string, pass: string) => {
  const fromEnv = process.env.ADMIN_PASSWORD || process.env.OWNER_PASSWORD || '';
  if (fromEnv && pass === fromEnv) return true;
  return isOwnerEmail(email) && pass === email;
};

const ensureOwnerUser = async (pass: string) => {
  const passwordHash = await bcrypt.hash(pass, 10);
  return ensureOwnerAccount(passwordHash);
};

export const login = async (identifierInput: string, pass: string) => {
  const input = (identifierInput || '').trim().toLowerCase();
  if (!input || !pass) throw new Error('Invalid credentials');
  if (!input.includes('@')) throw new Error('Please sign in with your email address');

  if (isOwnerEmail(input) && ownerPasswordMatches(input, pass)) {
    const owner = await ensureOwnerUser(pass);
    assertNotBanned(owner);
    return tokensFor(owner);
  }

  const user = await prisma.user.findUnique({
    where: { email: input },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      googleId: true,
      passwordHash: true,
      role: true,
      avatar: true,
      bio: true,
      city: true,
      state: true,
      pincode: true,
      instagram: true,
      facebook: true,
      linkedin: true,
      twitter: true,
      membershipPlan: true,
      membershipExpiry: true,
      onboardingCompleted: true,
      gender: true,
      isAdmin: true,
      verified: true,
      emailVerified: true,
      aadhaarUrl: true,
      availableForRequests: true,
      profileCompletion: true,
      banned: true,
    }
  });

  if (!user) throw new Error('Invalid credentials');
  if (!user.passwordHash) {
    throw new Error(
      user.googleId
        ? 'This account uses Google Sign-In. Click Continue with Google.'
        : 'No password is set for this account. Use Google Sign-In or create a password with Sign up if this is a new email.'
    );
  }

  const valid = await bcrypt.compare(pass, user.passwordHash);
  if (!valid) throw new Error('Wrong password');

  assertNotBanned(user);
  void syncOwnerFlag(user).catch(() => undefined);
  return tokensFor(user);
};

export const refreshTokenService = async (token: string) => {
  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new Error('Invalid refresh token');

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error('User not found');
  assertNotBanned(user);
  const synced = await syncOwnerFlag(user);
  const isAdmin = isOwnerEmail(synced.email);
  const payload = { id: synced.id, email: synced.email, phone: synced.phone || '', role: synced.role, isAdmin };
  return {
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

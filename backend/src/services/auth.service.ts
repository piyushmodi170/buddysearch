import { prisma } from '../config/db.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import { isOwnerEmail } from '../config/owner.js';
import { ensureOwnerAccount } from '../config/owner-account.js';
import { googleAudienceIds } from '../config/settings.js';

export const publicUser = (user: any) => {
  if (!user) return user;
  const { passwordHash, ...safe } = user;
  return { ...safe, isAdmin: isOwnerEmail(user.email) };
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

export const googleAuthService = async (idToken: string, role?: string) => {
  const allowedAud = await googleAudienceIds();
  if (!allowedAud.length) {
    throw new Error('Google Sign-In is not configured. Add the Client ID in Admin → Google or set GOOGLE_CLIENT_ID.');
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) throw new Error('Google could not verify that sign-in. Try again, or use email and password.');
  const claims = await response.json() as {
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    sub?: string;
  };
  const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
  if (!claims.aud || !allowedAud.includes(claims.aud) || !emailVerified || !claims.email || !claims.sub) {
    throw new Error('This Google app is not authorized for buddysearch.online. Add this site under Authorized JavaScript origins, then try again.');
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
      user = await prisma.user.create({
        data: {
          name: claims.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          googleId,
          avatar: claims.picture,
          role: nextRole,
          verified: true,
          membershipPlan: 'BASIC',
          membershipExpiry: null,
          onboardingCompleted: false,
          availableForRequests: nextRole !== 'CLIENT',
          profileCompletion: 10,
          isAdmin: isOwnerEmail(cleanEmail),
        }
      });
    } catch (err: any) {
      user = await prisma.user.findFirst({
        where: { OR: [{ googleId }, { email: cleanEmail }] }
      });
      if (!user) throw err;
    }
  } else if (!user.googleId || String(user.googleId).startsWith('owner:')) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatar: claims.picture || user.avatar }
    });
  }

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
  const phone = digits.length === 10 ? digits : undefined;
  if (phone) {
    const phoneTaken = await prisma.user.findFirst({ where: { phone } });
    if (phoneTaken) throw new Error('An account with this phone number already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  let user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      phone: phone || undefined,
      passwordHash: hashedPassword,
      role: data.role || 'CLIENT',
      membershipPlan: 'BASIC',
      membershipExpiry: null,
      onboardingCompleted: false,
      availableForRequests: data.role === 'BUDDY' || data.role === 'BOTH',
      profileCompletion: 10,
      isAdmin: isOwnerEmail(email),
    }
  });

  void syncOwnerFlag(user).catch(() => undefined);
  return tokensFor(user);
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

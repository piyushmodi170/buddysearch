import { prisma } from '../config/db.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import { isOwnerEmail } from '../config/owner.js';
import { getSetting } from '../config/settings.js';

const publicUser = (user: any) => {
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

export const googleAuthService = async (idToken: string) => {
  const google = await getSetting('google');
  if (!google.clientId) throw new Error('Google Sign-In is not configured');

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) throw new Error('Invalid Google identity token');
  const claims = await response.json() as {
    aud?: string;
    email?: string;
    email_verified?: string;
    name?: string;
    picture?: string;
    sub?: string;
  };
  if (claims.aud !== google.clientId || claims.email_verified !== 'true' || !claims.email || !claims.sub) {
    throw new Error('Invalid Google identity token');
  }

  const cleanEmail = claims.email.toLowerCase().trim();
  const googleId = claims.sub;

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId },
        { email: cleanEmail }
      ]
    }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: claims.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId,
        avatar: claims.picture,
        role: 'CLIENT',
        verified: true,
        membershipPlan: 'BASIC',
        isAdmin: isOwnerEmail(cleanEmail),
      }
    });
  } else if (!user.googleId) {
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

  const hashedPassword = await bcrypt.hash(data.password, 10);
  let user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash: hashedPassword,
      role: data.role || 'CLIENT',
      isAdmin: isOwnerEmail(email),
    }
  });

  user = await syncOwnerFlag(user);
  return tokensFor(user);
};

export const login = async (identifierInput: string, pass: string) => {
  const input = (identifierInput || '').trim().toLowerCase();
  if (!input || !pass) throw new Error('Invalid credentials');
  if (!input.includes('@')) throw new Error('Please sign in with your email address');

  const user = await prisma.user.findUnique({
    where: { email: input }
  });

  if (!user || !user.passwordHash) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(pass, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const authenticatedUser = await syncOwnerFlag(user);
  assertNotBanned(authenticatedUser);
  return tokensFor(authenticatedUser);
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

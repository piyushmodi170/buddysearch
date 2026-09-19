import { prisma } from '../config/db.js';
import { config } from '../config/index.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import { sendOTP, generateOTP } from '../utils/otp.js';
import { setCache, getCache, delCache } from '../config/redis.js';

const sanitizePhone = (phone?: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

// Never let the password hash leave the service layer.
const publicUser = (user: any) => {
  if (!user) return user;
  const { passwordHash, ...safe } = user;
  return safe;
};

const promoteConfiguredAdmin = async (user: any) => {
  if (!config.adminEmails.includes(user.email.toLowerCase()) || user.isAdmin) return user;
  return prisma.user.update({
    where: { id: user.id },
    data: { isAdmin: true },
  });
};

export const googleAuthService = async (idToken: string) => {
  if (!config.google.clientId) throw new Error('Google Sign-In is not configured');

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
  if (claims.aud !== config.google.clientId || claims.email_verified !== 'true' || !claims.email || !claims.sub) {
    throw new Error('Invalid Google identity token');
  }

  const cleanEmail = claims.email.toLowerCase().trim();
  const googleId = claims.sub;

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(googleId ? [{ googleId }] : []),
        { email: cleanEmail }
      ]
    }
  });

  if (!user) {
    // Create new user with Google details
    user = await prisma.user.create({
      data: {
        name: claims.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId,
        avatar: claims.picture,
        role: 'CLIENT',
        verified: true,
        membershipPlan: 'BASIC'
      }
    });
  } else if (googleId && !user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatar: claims.picture || user.avatar }
    });
  }
  user = await promoteConfiguredAdmin(user);
  if (!user) throw new Error('Unable to create or load Google account');

  const payload = { id: user.id, phone: user.phone || '', role: user.role, isAdmin: user.isAdmin };
  return {
    user: publicUser(user),
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

export const signup = async (data: any) => {
  const phone = sanitizePhone(data.phone);
  const email = (data.email || `${phone || Date.now()}@buddysearch.in`).toLowerCase().trim();

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : [])
      ]
    }
  });
  
  if (user) {
    throw new Error('An account with this email or phone already exists. Please sign in.');
  }

  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
  user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      phone: phone || undefined,
      passwordHash: hashedPassword,
      role: data.role || 'CLIENT',
    }
  });

  const payload = { id: user.id, phone: user.phone || '', role: user.role, isAdmin: user.isAdmin };
  return {
    user: publicUser(user),
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

export const login = async (identifierInput: string, pass: string) => {
  const input = (identifierInput || '').trim();
  const password = (pass || '').trim();
  if (!input || !password) throw new Error('Invalid credentials');

  const isEmail = input.includes('@');
  const phone = sanitizePhone(input);
  const cleanEmail = isEmail ? input.toLowerCase() : `${phone}@buddysearch.in`;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: cleanEmail },
        ...(isEmail ? [{ email: input.toLowerCase() }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    }
  });

  // One generic message covers both "no such account" and "wrong password",
  // so this endpoint cannot be used to enumerate which accounts exist.
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const adminUser = await promoteConfiguredAdmin(user);
  const authenticatedUser = adminUser;
  const payload = { id: authenticatedUser.id, phone: authenticatedUser.phone || '', role: authenticatedUser.role, isAdmin: authenticatedUser.isAdmin };
  return {
    user: publicUser(authenticatedUser),
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

export const sendOTPService = async (phoneInput: string) => {
  const phone = sanitizePhone(phoneInput);
  const code = generateOTP();
  await setCache(`otp:${phone}`, code, 300); // 5 min
  const sent = await sendOTP(phone, code);
  if (!sent) throw new Error('Failed to send OTP');
  return true;
};

export const verifyOTPService = async (phoneInput: string, code: string) => {
  const phone = sanitizePhone(phoneInput);
  const saved = await getCache(`otp:${phone}`);
  if (!saved || saved !== code) throw new Error('Invalid or expired OTP');
  
  await delCache(`otp:${phone}`);

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone },
        { email: `${phone}@buddysearch.in` }
      ]
    }
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        email: `${phone}@buddysearch.in`,
        name: 'User' + Math.floor(Math.random()*10000),
        role: 'CLIENT'
      }
    });
  }

  const payload = { id: user.id, phone: user.phone || '', role: user.role, isAdmin: user.isAdmin };
  return {
    user: publicUser(user),
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

export const refreshTokenService = async (token: string) => {
  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new Error('Invalid refresh token');

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error('User not found');

  const payload = { id: user.id, phone: user.phone || '', role: user.role, isAdmin: user.isAdmin };
  return {
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

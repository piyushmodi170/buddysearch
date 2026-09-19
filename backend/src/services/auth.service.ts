import { prisma } from '../config/db.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { isOwnerEmail, OWNER_EMAIL } from '../config/owner.js';
import { getSetting } from '../config/settings.js';

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

export const googleAuthService = async (idToken: string) => {
  const google = await getSetting('google');
  if (!google.clientId) throw new Error('Google Sign-In is not configured');

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) throw new Error('Invalid Google identity token');
  const claims = await response.json() as {
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    sub?: string;
  };
  const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
  if (claims.aud !== google.clientId || !emailVerified || !claims.email || !claims.sub) {
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
        membershipExpiry: null,
        onboardingCompleted: false,
        availableForRequests: false,
        profileCompletion: 10,
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
      membershipPlan: 'BASIC',
      membershipExpiry: null,
      onboardingCompleted: false,
      availableForRequests: false,
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

const ownerProfileData = (passwordHash: string) => ({
  name: 'Piyush',
  email: OWNER_EMAIL,
  passwordHash,
  role: 'BOTH' as const,
  membershipPlan: 'STAR' as const,
  membershipExpiry: null,
  onboardingCompleted: true,
  availableForRequests: true,
  profileCompletion: 100,
  isAdmin: true,
  verified: true,
  banned: false,
});

const ownerEmailFilter = () => ({
  email: {
    $regex: `^${OWNER_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
    $options: 'i',
  },
});

const firstRawDoc = (raw: unknown) => {
  const batch = (raw as { cursor?: { firstBatch?: Record<string, unknown>[] } })?.cursor?.firstBatch;
  return batch?.[0] || null;
};

const rawDocId = (doc: Record<string, unknown> | null) => {
  if (!doc) return null;
  const id = doc._id as { $oid?: string; toHexString?: () => string } | string | undefined;
  if (!id) return null;
  if (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)) return id;
  if (typeof id === 'object' && id.$oid) return id.$oid;
  if (typeof id === 'object' && typeof id.toHexString === 'function') return id.toHexString();
  return null;
};

const findOwnerRaw = async () => {
  const raw = await prisma.$runCommandRaw({
    find: 'User',
    filter: ownerEmailFilter(),
    limit: 1,
  });
  return firstRawDoc(raw);
};

const loadOwnerById = async (id: string) => {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (err) {
    console.error('[owner] find by id failed', (err as any)?.message || err);
    await prisma.$runCommandRaw({
      update: 'User',
      updates: [
        {
          q: { _id: { $oid: id } },
          u: {
            $set: {
              role: 'BOTH',
              membershipPlan: 'STAR',
              email: OWNER_EMAIL,
              banned: false,
              verified: true,
              onboardingCompleted: true,
            },
          },
          multi: false,
          upsert: false,
        },
      ],
    });
    return prisma.user.findUnique({ where: { id } });
  }
};

const ensureOwnerUser = async (pass: string) => {
  const passwordHash = await bcrypt.hash(pass, 10);
  const existingId = rawDocId(await findOwnerRaw());

  if (existingId) {
    try {
      return await prisma.user.update({
        where: { id: existingId },
        data: {
          passwordHash,
          email: OWNER_EMAIL,
          isAdmin: true,
          role: 'BOTH',
          membershipPlan: 'STAR',
          onboardingCompleted: true,
          verified: true,
          banned: false,
        },
      });
    } catch (err) {
      console.error('[owner] prisma update failed', (err as any)?.message || err);
      await prisma.$runCommandRaw({
        update: 'User',
        updates: [
          {
            q: { _id: { $oid: existingId } },
            u: { $set: ownerProfileData(passwordHash) },
            multi: false,
            upsert: false,
          },
        ],
      });
      const loaded = await loadOwnerById(existingId);
      if (loaded) return loaded;
      throw err;
    }
  }

  try {
    return await prisma.user.create({ data: ownerProfileData(passwordHash) });
  } catch (err) {
    console.error('[owner] prisma create failed', (err as any)?.message || err);
    const retryId = rawDocId(await findOwnerRaw());
    if (retryId) {
      try {
        return await prisma.user.update({
          where: { id: retryId },
          data: { passwordHash, isAdmin: true, email: OWNER_EMAIL },
        });
      } catch (updateErr) {
        console.error('[owner] retry update failed', (updateErr as any)?.message || updateErr);
      }
      const loaded = await loadOwnerById(retryId);
      if (loaded) return loaded;
    }
    const id = new ObjectId().toHexString();
    await prisma.$runCommandRaw({
      insert: 'User',
      documents: [
        {
          _id: { $oid: id },
          ...ownerProfileData(passwordHash),
          isOnline: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    const created = await loadOwnerById(id);
    if (created) return created;
    throw new Error('Could not create the admin account. Try Sign In again.');
  }
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

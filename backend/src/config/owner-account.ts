import { ObjectId } from 'mongodb';
import { OWNER_EMAIL } from './owner.js';
import { usersCollection } from './mongo.js';

const emailFilter = {
  email: {
    $regex: `^${OWNER_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
    $options: 'i',
  },
};

const asId = (id: unknown) => {
  if (id instanceof ObjectId) return id.toHexString();
  if (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)) return id;
  throw new Error('Could not create the admin account. Try Sign In again.');
};

export const ownerSessionUser = (id: string, doc: Record<string, unknown> = {}) => ({
  id,
  name: String(doc.name || 'Piyush'),
  email: OWNER_EMAIL,
  phone: doc.phone ? String(doc.phone) : '',
  googleId: doc.googleId || null,
  role: (doc.role as string) || 'BOTH',
  avatar: doc.avatar || null,
  bio: doc.bio || null,
  city: doc.city || null,
  state: doc.state || null,
  pincode: doc.pincode || null,
  membershipPlan: (doc.membershipPlan as string) || 'STAR',
  membershipExpiry: doc.membershipExpiry || null,
  onboardingCompleted: true,
  gender: doc.gender || null,
  isAdmin: true,
  verified: true,
  emailVerified: true,
  availableForRequests: true,
  profileCompletion: Number(doc.profileCompletion || 100),
  banned: Boolean(doc.banned),
});

export const ensureOwnerAccount = async (passwordHash: string) => {
  const col = await usersCollection();
  const now = new Date();
  const set = {
    name: 'Piyush',
    email: OWNER_EMAIL,
    passwordHash,
    role: 'BOTH',
    membershipPlan: 'STAR',
    onboardingCompleted: true,
    availableForRequests: true,
    profileCompletion: 100,
    isAdmin: true,
    verified: true,
    emailVerified: true,
    banned: false,
    updatedAt: now,
  };

  const existing = await col.findOne(emailFilter);
  if (existing?._id) {
    await col.updateOne({ _id: existing._id }, { $set: set });
    return ownerSessionUser(asId(existing._id), { ...existing, ...set });
  }

  const _id = new ObjectId();
  const baseDoc = { _id, ...set, createdAt: now, isOnline: false };

  try {
    await col.insertOne(baseDoc);
    return ownerSessionUser(_id.toHexString(), set);
  } catch (err: any) {
    if (err?.code !== 11000) throw err;
    const again = await col.findOne(emailFilter);
    if (again?._id) {
      await col.updateOne({ _id: again._id }, { $set: set });
      return ownerSessionUser(asId(again._id), { ...again, ...set });
    }
    const createdId = new ObjectId();
    await col.insertOne({
      ...baseDoc,
      _id: createdId,
      phone: `admin:${OWNER_EMAIL}`,
      googleId: `owner:${OWNER_EMAIL}`,
    });
    return ownerSessionUser(createdId.toHexString(), {
      ...set,
      phone: `admin:${OWNER_EMAIL}`,
      googleId: `owner:${OWNER_EMAIL}`,
    });
  }
};

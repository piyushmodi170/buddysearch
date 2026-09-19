import { MongoClient, ObjectId, type Collection, type Document } from 'mongodb';

const cleanUrl = (url?: string) => url?.trim().replace(/^["']|["']$/g, '') || '';

let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = () => {
  const url = cleanUrl(process.env.DATABASE_URL);
  if (!url) throw new Error('DATABASE_URL is not set');
  if (!clientPromise) {
    clientPromise = new MongoClient(url, { serverSelectionTimeoutMS: 8000 }).connect();
  }
  return clientPromise;
};

const dbNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(
      url.replace(/^mongodb\+srv:\/\//, 'https://').replace(/^mongodb:\/\//, 'https://')
    );
    return decodeURIComponent(parsed.pathname.replace(/^\//, '')) || 'buddysearch';
  } catch {
    return 'buddysearch';
  }
};

export const usersCollection = async (): Promise<Collection<Document>> => {
  const url = cleanUrl(process.env.DATABASE_URL);
  const client = await getMongoClient();
  const db = client.db(dbNameFromUrl(url));
  const names = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);
  const pick = ['User', 'users', 'Users'].find((n) => names.includes(n)) || 'User';
  return db.collection(pick);
};

export const paymentsCollection = async (): Promise<Collection<Document>> => {
  const url = cleanUrl(process.env.DATABASE_URL);
  const client = await getMongoClient();
  const db = client.db(dbNameFromUrl(url));
  const names = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);
  const pick = ['Payment', 'payments', 'Payments'].find((n) => names.includes(n)) || 'Payment';
  return db.collection(pick);
};

const dropNonSparseUnique = async (col: Collection<Document>, fields: string[]) => {
  const indexes = await col.indexes();
  for (const idx of indexes) {
    const keys = Object.keys(idx.key || {});
    const field = keys[0];
    if (keys.length === 1 && fields.includes(field) && idx.unique && !idx.sparse) {
      try { await col.dropIndex(idx.name as string); } catch { /* already sparse or missing */ }
    }
  }
};

/**
 * Prisma @unique on optional Payment.razorpayPaymentId writes null and Mongo
 * treats every null as a duplicate. Unset nulls and use sparse unique indexes.
 */
export const repairPaymentIndexes = async () => {
  const col = await paymentsCollection();
  await col.updateMany(
    { $or: [{ razorpayPaymentId: null }, { razorpayPaymentId: '' }] },
    { $unset: { razorpayPaymentId: '' } }
  );
  await col.updateMany(
    { $or: [{ razorpayOrderId: null }, { razorpayOrderId: '' }] },
    { $unset: { razorpayOrderId: '' } }
  );
  await dropNonSparseUnique(col, ['razorpayPaymentId', 'razorpayOrderId']);
  try {
    await col.createIndex({ razorpayPaymentId: 1 }, { unique: true, sparse: true, name: 'razorpayPaymentId_sparse_unique' });
  } catch { /* exists */ }
  try {
    await col.createIndex({ razorpayOrderId: 1 }, { unique: true, sparse: true, name: 'razorpayOrderId_sparse_unique' });
  } catch { /* exists */ }
};

export const insertPendingPayment = async (data: {
  userId: string;
  planId: string;
  amount: number;
  razorpayOrderId: string;
}) => {
  await repairPaymentIndexes();
  const col = await paymentsCollection();
  const _id = new ObjectId();
  const now = new Date();
  await col.insertOne({
    _id,
    userId: new ObjectId(data.userId),
    planId: new ObjectId(data.planId),
    amount: data.amount,
    razorpayOrderId: data.razorpayOrderId,
    status: 'PENDING',
    createdAt: now,
  });
  return { id: _id.toHexString() };
};

const ROLES = new Set(['CLIENT', 'BUDDY', 'BOTH']);
const PLANS = new Set(['BASIC', 'STANDARD', 'PREMIUM', 'STAR']);

const needsEmailFix = (email: unknown) =>
  email == null || typeof email !== 'string' || !email.includes('@');

const needsNameFix = (name: unknown) => name == null || typeof name !== 'string' || !name.trim();

const hexId = (id: unknown) => {
  if (id instanceof ObjectId) return id.toHexString();
  if (typeof id === 'string') return id;
  return new ObjectId().toHexString();
};

/** Prisma cannot read User docs with null email/name or invalid enums; one bad row breaks admin findMany. */
export const repairBrokenUsers = async () => {
  const col = await usersCollection();
  const broken = await col
    .find({
      $or: [
        { email: null },
        { email: { $exists: false } },
        { email: '' },
        { name: null },
        { name: { $exists: false } },
        { name: '' },
        { role: { $nin: ['CLIENT', 'BUDDY', 'BOTH'] } },
        { membershipPlan: { $nin: ['BASIC', 'STANDARD', 'PREMIUM', 'STAR'] } },
        { createdAt: { $exists: false } },
        { createdAt: null },
      ],
    })
    .toArray();

  for (const doc of broken) {
    const id = hexId(doc._id);
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (needsEmailFix(doc.email)) set.email = `missing-${id}@invalid.local`;
    if (needsNameFix(doc.name)) set.name = 'Unknown';
    if (!ROLES.has(String(doc.role))) set.role = 'CLIENT';
    if (!PLANS.has(String(doc.membershipPlan))) set.membershipPlan = 'BASIC';
    if (!doc.createdAt) set.createdAt = new Date();
    await col.updateOne({ _id: doc._id }, { $set: set });
  }

  await col.updateMany({ $or: [{ phone: null }, { phone: '' }] }, { $unset: { phone: '' } });
  await col.updateMany({ $or: [{ googleId: null }, { googleId: '' }] }, { $unset: { googleId: '' } });

  const indexes = await col.indexes();
  for (const idx of indexes) {
    const keys = Object.keys(idx.key || {});
    const field = keys[0];
    if (keys.length === 1 && (field === 'phone' || field === 'googleId') && idx.unique && !idx.sparse) {
      try { await col.dropIndex(idx.name as string); } catch { /* already sparse or missing */ }
    }
  }
  try { await col.createIndex({ phone: 1 }, { unique: true, sparse: true, name: 'phone_sparse_unique' }); } catch { /* exists */ }
  try { await col.createIndex({ googleId: 1 }, { unique: true, sparse: true, name: 'googleId_sparse_unique' }); } catch { /* exists */ }

  return broken.length;
};

export const insertUser = async (doc: Record<string, unknown>) => {
  const col = await usersCollection();
  const now = new Date();
  const _id = new ObjectId();
  const payload: Document = {
    _id,
    name: String(doc.name || '').trim(),
    email: String(doc.email || '').toLowerCase().trim(),
    role: ROLES.has(String(doc.role)) ? doc.role : 'CLIENT',
    membershipPlan: PLANS.has(String(doc.membershipPlan)) ? doc.membershipPlan : 'BASIC',
    membershipExpiry: doc.membershipExpiry || null,
    onboardingCompleted: Boolean(doc.onboardingCompleted),
    availableForRequests: Boolean(doc.availableForRequests),
    profileCompletion: Number(doc.profileCompletion || 10),
    isAdmin: Boolean(doc.isAdmin),
    verified: Boolean(doc.verified),
    banned: false,
    isOnline: false,
    createdAt: now,
    updatedAt: now,
  };
  if (doc.phone) payload.phone = String(doc.phone);
  if (doc.googleId) payload.googleId = String(doc.googleId);
  if (doc.passwordHash) payload.passwordHash = String(doc.passwordHash);
  if (doc.avatar) payload.avatar = String(doc.avatar);
  payload.emailVerified = Boolean(doc.emailVerified);
  await col.insertOne(payload);
  return { ...payload, id: _id.toHexString() };
};

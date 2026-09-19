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

  return broken.length;
};

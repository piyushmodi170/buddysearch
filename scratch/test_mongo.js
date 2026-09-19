import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/buddysearch';

console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log('✅ SUCCESS: Successfully connected to MongoDB!');
  } catch (err) {
    console.error('❌ FAILURE: Connection failed with error:', err.message);
  } finally {
    await client.close();
  }
}

run();

import mongoose from 'mongoose';
import { MONGO_URI } from '../config/index.js';

let _connected = false;

export async function connectMongo() {
  if (_connected) return mongoose.connection;
  if (!MONGO_URI) {
    // Mongo is optional for local-only demos; RBAC APIs will be unavailable.
    console.warn('[mongo] MONGO_URI not set; skipping MongoDB connection.');
    return null;
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB || 'propertychain' });
  _connected = true;
  console.log('[mongo] connected');
  return mongoose.connection;
}

// lib/mongodb.js
// MongoDB connection banata hai aur reuse karta hai (serverless ke liye zaroori)

const mongoose = require('mongoose');

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  // Pehle ye check import ke waqt tha -> poori function crash ho jati thi.
  // Ab request ke waqt saaf error milta hai.
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI set nahi hai. Vercel -> Project -> Settings -> Environment Variables mein daal kar dobara deploy karo.'
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // fail hone par next request dobara try kare
    throw err;
  }
  return cached.conn;
}

module.exports = connectDB;

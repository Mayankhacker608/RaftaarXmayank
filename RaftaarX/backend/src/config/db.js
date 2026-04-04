import mongoose from "mongoose";

let cachedConnection = globalThis.__raftaarxMongooseConnection || null;
let cachedPromise = globalThis.__raftaarxMongoosePromise || null;

export async function connectDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URL or MONGODB_URI is missing in backend/.env");
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri).then((mongooseInstance) => {
      cachedConnection = mongooseInstance;
      globalThis.__raftaarxMongooseConnection = cachedConnection;
      return cachedConnection;
    });

    globalThis.__raftaarxMongoosePromise = cachedPromise;
  }

  cachedConnection = await cachedPromise;
  return cachedConnection;
}

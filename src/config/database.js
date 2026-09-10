const mongoose = require("mongoose");
const seedDatabase = require("./seed");

// Cached connection for Vercel / serverless execution
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/sonic_backend";

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then(async (m) => {
        console.log("✅ Connected to MongoDB successfully!");
        await seedDatabase();
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.warn("⚠️ MongoDB connection notice:", err.message);
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;

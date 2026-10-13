const mongoose = require("mongoose");

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/ai-interview-portal";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.warn(
      "Note: Set MONGODB_URI in .env (e.g. mongodb+srv://... or mongodb://127.0.0.1:27017/ai-interview-portal)"
    );
    throw error;
  }
}

module.exports = { connectDB };

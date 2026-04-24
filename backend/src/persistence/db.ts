import mongoose from 'mongoose';

const DEFAULT_DB_NAME = 'tambola';

export async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGO_URI || `mongodb://127.0.0.1:27017/${DEFAULT_DB_NAME}`;

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB: ${mongoUri}`);
}

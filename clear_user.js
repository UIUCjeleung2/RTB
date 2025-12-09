import mongoose from 'mongoose';
import User from './rtb/backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './rtb/backend/.env' });

async function clearUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const result = await User.deleteMany({ email: 'aditya34@illinois.edu' });
    console.log(`Deleted ${result.deletedCount} user(s) with email: aditya34@illinois.edu`);
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

clearUser();

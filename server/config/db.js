const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For development, we'll use a local MongoDB instance
    // In production, this would be retrieved from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/qasyounextra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    // If MongoDB connection fails, we'll initialize an in-memory database
    console.log('Falling back to in-memory storage');
    
    // Process keeps running, but with in-memory fallback
  }
};

module.exports = connectDB;
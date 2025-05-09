const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  fullName: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University'
  },
  faculty: {
    type: String,
    enum: ['engineering', 'medicine', 'science', 'arts', 'commerce', 'law', 'education', 'other'],
    default: 'other'
  },
  academicYear: {
    type: String,
    enum: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'graduated'],
    default: 'first'
  },
  studentId: {
    type: String
  },
  specialization: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Check if entered password matches the hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
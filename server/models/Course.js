const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  faculty: {
    type: String,
    enum: ['engineering', 'medicine', 'science', 'arts', 'commerce', 'law', 'education', 'other'],
    required: true
  },
  academicYear: {
    type: String,
    enum: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'graduated'],
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);
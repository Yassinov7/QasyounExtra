const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'document', 'image', 'link', 'other'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number // Duration in minutes for videos
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Material', MaterialSchema);
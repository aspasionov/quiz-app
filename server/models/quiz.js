const { Schema, model } = require('mongoose');
const questionSchema = require('./question');

// Схема квізу
const quizSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  maxPoints: {
    type: Number,
    required: true,
    min: 1
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private',
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Оновлюємо поле updatedAt перед збереженням
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Індекс для пошуку за тегами
quizSchema.index({ tags: 1 });

module.exports = model('Quiz', quizSchema);
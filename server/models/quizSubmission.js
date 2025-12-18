const { Schema, model } = require('mongoose');

// Schema for quiz submission/attempt
const quizSubmissionSchema = new Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    selectedOptionId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Unique index: one submission per user per quiz
quizSubmissionSchema.index({ user: 1, quiz: 1 }, { unique: true });

// Compound index for leaderboard queries (optimized for sorting by score DESC, time ASC)
quizSubmissionSchema.index({ quiz: 1, score: -1, timeSpent: 1 });

module.exports = model('QuizSubmission', quizSubmissionSchema);

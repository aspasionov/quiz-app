const mongoose = require('mongoose');

const aiQuizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    // Store only the date part (YYYY-MM-DD) for easier querying
    get: function(date) {
      if (!date) return date;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    },
    set: function(date) {
      if (!date) return date;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  },
  attempts: {
    type: Number,
    default: 0,
    max: 10 // Maximum 10 attempts per day
  },
  lastAttemptAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Create compound index to ensure one record per user per day
aiQuizAttemptSchema.index({ user: 1, date: 1 }, { unique: true });

// Static method to check if user can make an attempt
aiQuizAttemptSchema.statics.canUserAttempt = async function(userId) {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const attemptRecord = await this.findOne({
    user: userId,
    date: todayDate
  });
  
  if (!attemptRecord) {
    return { canAttempt: true, remainingAttempts: 10 };
  }
  
  const remainingAttempts = Math.max(0, 10 - attemptRecord.attempts);
  return {
    canAttempt: attemptRecord.attempts < 10,
    remainingAttempts: remainingAttempts,
    attemptsUsed: attemptRecord.attempts
  };
};

// Static method to record an attempt
aiQuizAttemptSchema.statics.recordAttempt = async function(userId) {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const attemptRecord = await this.findOneAndUpdate(
    {
      user: userId,
      date: todayDate
    },
    {
      $inc: { attempts: 1 },
      $set: { lastAttemptAt: new Date() }
    },
    {
      upsert: true,
      new: true
    }
  );
  
  return attemptRecord;
};

// Static method to get user's attempt info
aiQuizAttemptSchema.statics.getUserAttemptInfo = async function(userId) {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const attemptRecord = await this.findOne({
    user: userId,
    date: todayDate
  });
  
  if (!attemptRecord) {
    return {
      attemptsUsed: 0,
      remainingAttempts: 10,
      canAttempt: true,
      resetsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) // Next day at 00:00
    };
  }
  
  const remainingAttempts = Math.max(0, 10 - attemptRecord.attempts);
  return {
    attemptsUsed: attemptRecord.attempts,
    remainingAttempts: remainingAttempts,
    canAttempt: attemptRecord.attempts < 10,
    lastAttemptAt: attemptRecord.lastAttemptAt,
    resetsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) // Next day at 00:00
  };
};

module.exports = mongoose.model('AiQuizAttempt', aiQuizAttemptSchema);

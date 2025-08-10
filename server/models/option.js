const { Schema } = require('mongoose');

// Схема варіанту відповіді
const optionSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = optionSchema;

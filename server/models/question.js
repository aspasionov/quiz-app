const { Schema } = require('mongoose');
const optionSchema = require('./option');

// Схема питання
const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  options: {
    type: [optionSchema],
    validate: [
      {
        validator: function (options) {
          return options.length >= 1 && options.length <= 6;
        },
        message: 'Питання повинно містити від 1 до 6 варіантів відповідей.'
      }
    ],
    required: true
  }
});

module.exports = questionSchema;

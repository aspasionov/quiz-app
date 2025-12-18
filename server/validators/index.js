const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail(),
  body('name').isLength({ min: 3 }).trim(),
  body('password').isLength({ min: 3, max: 6 }).trim(),
]

const loginValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 6 }).trim(),
]

const taskValidator = [
  body('title').isLength({min: 1}),
  body('columnId').isMongoId(),
]

const userValidator = [
  body('name').isLength({min: 3}),
  body('email').isEmail(),
]

const quizSubmissionValidator = [
  body('score')
    .isInt({ min: 0 })
    .withMessage('Score must be a non-negative integer'),
  body('maxPoints')
    .isInt({ min: 1 })
    .withMessage('Max points must be a positive integer'),
  body('percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentage must be between 0 and 100'),
  body('correctAnswers')
    .isInt({ min: 0 })
    .withMessage('Correct answers must be a non-negative integer'),
  body('totalQuestions')
    .isInt({ min: 1 })
    .withMessage('Total questions must be a positive integer'),
  body('timeSpent')
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers array is required and must not be empty'),
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Valid question ID required'),
  body('answers.*.selectedOptionId')
    .isMongoId()
    .withMessage('Valid option ID required'),
  body('answers.*.isCorrect')
    .isBoolean()
    .withMessage('isCorrect must be boolean'),
  body('answers.*.points')
    .isInt({ min: 0 })
    .withMessage('Points must be non-negative integer')
]

module.exports = { registerValidator, loginValidator, taskValidator, userValidator, quizSubmissionValidator }

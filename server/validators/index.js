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

module.exports = { registerValidator, loginValidator, taskValidator, userValidator }

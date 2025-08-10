const {Router} = require('express')
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const checkAuth = require('../helper/auth')
const { registerValidator, loginValidator } = require('../validators/index')

const router = Router()

router.get('/me', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if(!user) {
      return res.status(404).json({
        message: 'User is not found'
      })
    }

    const {  password,  ...userData } = user._doc
    res.status(200).json({
      id: userData._id,
      ...userData
    })

  } catch (err) {
    res.status(500).json({
      message: 'No Access'
    })
  }
})

router.post('/login', loginValidator, async (req, res) => {
  try {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.status(400).json({
        errors: err.array().map(({ msg, path }) => ({ [path]: msg}))
      });
    }
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if(!user) {
      return res.status(404).json({
        message: 'User is not found'
      })
    }

    const passIsValid = await bcrypt.compare(password, user._doc.password)

    if(!passIsValid) {
      return res.status(404).json({
        message: 'Password or Email are wrong'
      })
    }

    const token = jwt.sign({
      _id: user._id,
    }, process.env.SECRET, {
      expiresIn: '30d'
    })

    const {  password: userPassword, ...userData } = user._doc
    res.status(201).json({ ...userData, token })

  } catch (err) {
    console.log(err)
    res.status(404).json({
      message: 'User is not register'
    })
  }
})

router.post('/register', registerValidator, async (req, res) => {
  try {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.status(400).json({
        errors: err.array().map(({ msg, path }) => ({ [path]: msg}))
      });
    }

    const { email, name, password } = req.body

    const hashPassword = await bcrypt.hash(password, 10)

    const existUser = await User.findOne({ email })

    if(!!existUser) {
      return res.status(400).json({
        message: 'email already exist'
      })
    }

    const user = new User({
      email, name, password: hashPassword
    })
    await user.save()

    const token = jwt.sign({
      _id: user._id,
    }, process.env.SECRET, {
      expiresIn: '30d'
    })

    const {  password: userPassword, ...userData } = user._doc
    res.status(201).json({ ...userData, token })
  } catch (err) {
    console.log(err)
    res.status(404).json({
      message: 'User is not register'
    })
  }
})

module.exports = router;

const  {Schema, model } = require('mongoose')

const userSchema = new Schema ({
  email: {
    type: String,
    required: true
  },
  avatar: String,
  name: String,
  password: {
    type: String,
    required: false // Password is now completely optional since we only use Google OAuth
  },
  googleId: {
    type: String,
    sparse: true // Allows null values but keeps uniqueness for non-null values
  },
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  }
})

module.exports = model('User', userSchema)

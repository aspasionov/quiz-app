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
    required: true
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

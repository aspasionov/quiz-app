const { Schema, model } = require('mongoose')

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  count: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
})

// Add indexes for performance
tagSchema.index({ name: 1 })
tagSchema.index({ count: -1 })
tagSchema.index({ createdAt: -1 })

module.exports = model('Tag', tagSchema)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['buyer', 'developer', 'admin'],
    default: 'buyer'
  },
  // Developer-specific fields
  isVerified: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  // Buyer-specific fields
  purchasedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  walletBalance: {
    type: Number,
    default: 0
  },
  // Common fields
  avatar: {
    type: String,
    default: ''
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isSubAdmin: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

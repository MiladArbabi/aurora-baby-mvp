const mongoose = require('mongoose');

// User schema for parents
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  relationship: { type: String, enum: ['Mother', 'Father', 'Guardian'], default: 'Mother' },
  profilePictureUrl: { type: String }
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  relationship: { type: String },
  avatar: { type: String }, // Added to store avatar URL or path
});

module.exports = mongoose.model('User', userSchema);
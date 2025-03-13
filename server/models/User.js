const mongoose = require('mongoose');

// Schema for User with name and creation timestamp
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export User model for use in routes
module.exports = mongoose.model('User', userSchema);
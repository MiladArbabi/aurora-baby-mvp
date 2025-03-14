const mongoose = require('mongoose');

// Child schema
const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  profilePictureUrl: { type: String }
});

module.exports = mongoose.model('Child', childSchema);
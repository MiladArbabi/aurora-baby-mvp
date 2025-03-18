const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  avatar: { type: String }, // Added to store avatar URL or path
});

module.exports = mongoose.model('Child', childSchema);
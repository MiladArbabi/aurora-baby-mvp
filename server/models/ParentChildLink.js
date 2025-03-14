const mongoose = require('mongoose');

// Link between users (parents) and children
const parentChildLinkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true }
});

module.exports = mongoose.model('ParentChildLink', parentChildLinkSchema);
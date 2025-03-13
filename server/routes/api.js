const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users: Retrieve all users
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// POST /api/users: Create a new user
router.post('/users', async (req, res) => {
  const user = new User({ name: req.body.name });
  await user.save();
  res.status(201).json(user);
});

// Export router for use in server.js
module.exports = router;
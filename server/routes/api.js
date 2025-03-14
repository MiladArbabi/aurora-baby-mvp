const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get all users
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Create a user (temporary compatibility with old tests)
router.post('/users', async (req, res) => {
  const { name } = req.body;
  try {
    // For now, use dummy values for required fields (to be removed in Chunk 6b)
    const user = new User({
      name,
      email: `${name.toLowerCase()}@example.com`, // Temporary
      passwordHash: await bcrypt.hash('dummy123', 10) // Temporary
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
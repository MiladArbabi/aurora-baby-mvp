const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Child = require('../models/Child');
const ParentChildLink = require('../models/ParentChildLink');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Get all users (unprotected for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a user (temporary for tests)
router.post('/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const user = new User({
      name,
      email: `${name.toLowerCase()}@example.com`,
      passwordHash: await bcrypt.hash('dummy123', 10),
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
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create profiles (parent and child)
router.post('/profiles', authenticateToken, async (req, res) => {
  const { relationship, parentName, childName, dateOfBirth, parentAvatar, childAvatar } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update parent details
    if (parentName) user.name = parentName;
    if (relationship) user.relationship = relationship;
    if (parentAvatar) user.avatar = parentAvatar;
    await user.save();

    // Validate and create child
    if (!childName || !dateOfBirth) {
      return res.status(400).json({ error: 'childName and dateOfBirth are required' });
    }
    const child = new Child({
      name: childName,
      dateOfBirth: new Date(dateOfBirth),
      avatar: childAvatar || null,
    });
    await child.save();

    // Link parent and child
    await new ParentChildLink({ userId: user._id, childId: child._id }).save();

    res.status(201).json({ user, child });
  } catch (error) {
    console.error('Profile setup error:', error);
    res.status(400).json({ error: error.message || 'Profile setup failed' });
  }
});

// Get profiles for authenticated user
router.get('/profiles', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const links = await ParentChildLink.find({ userId: user._id });
    const childIds = links.map(link => link.childId);
    const children = await Child.find({ _id: { $in: childIds } });

    res.json({
      parent: { name: user.name, relationship: user.relationship, avatar: user.avatar },
      children: children.map(child => ({ _id: child._id, name: child.name, avatar: child.avatar })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
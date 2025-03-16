const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Child = require('../models/Child');
const ParentChildLink = require('../models/ParentChildLink');

const router = express.Router();

// Get all users
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
      passwordHash: await bcrypt.hash('dummy123', 10)
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
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });
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
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
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
router.post('/profiles', async (req, res) => {
  const { relationship, childName, dateOfBirth } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    user.relationship = relationship;
    await user.save();
    const child = new Child({ name: childName, dateOfBirth });
    await child.save();
    await new ParentChildLink({ userId: user._id, childId: child._id }).save();
    res.status(201).json({ user, child });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get profiles for authenticated user
router.get('/profiles', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const links = await ParentChildLink.find({ userId: user._id });
    const childIds = links.map(link => link.childId);
    const children = await Child.find({ _id: { $in: childIds } });

    res.json({
      parent: { name: user.name, relationship: user.relationship },
      children: children.map(child => ({ _id: child._id, name: child.name })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
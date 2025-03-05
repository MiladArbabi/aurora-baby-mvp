const express = require('express');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// SQLite Connection
const db = new sqlite3.Database('./aurora_baby.db', (err) => {
  if (err) {
    console.error('SQLite connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS babies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER)`);
  db.run(`CREATE TABLE IF NOT EXISTS journeyData (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT UNIQUE, starFragments INTEGER DEFAULT 0, activities TEXT DEFAULT '[]')`);
  db.run(`CREATE TABLE IF NOT EXISTS careLogs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT, type TEXT, details TEXT, timestamp TEXT)`);
});

// Middleware: Authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Route: Root endpoint
app.get('/', (req, res) => {
  res.send('Aurora Baby MVP Backend is running');
});

// Route: Onboard a new baby
app.post('/onboard', (req, res) => {
  const { babyName, babyAge } = req.body;
  if (!babyName || !babyAge) return res.status(400).json({ error: 'Baby name and age are required' });

  const baby = { name: babyName, age: babyAge };
  db.run('INSERT INTO babies (name, age) VALUES (?, ?)', [babyName, babyAge], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    baby.id = this.lastID;
    const token = jwt.sign({ babyName, babyAge }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ baby, token });
  });
});

// Route: Log a Journey Mode activity
app.post('/journey/activity', authenticateToken, (req, res) => {
  const { activity } = req.body;
  if (!activity) return res.status(400).json({ error: 'Activity is required' });

  const userId = req.user.babyName;
  db.get('SELECT * FROM journeyData WHERE userId = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const activities = row ? JSON.parse(row.activities) : [];
    activities.push(activity);
    const starFragments = (row ? row.starFragments : 0) + 1;

    db.run(
      'INSERT OR REPLACE INTO journeyData (userId, starFragments, activities) VALUES (?, ?, ?)',
      [userId, starFragments, JSON.stringify(activities)],
      (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ activity, starFragments });
      }
    );
  });
});

// Route: Get Journey Mode progress
app.get('/journey/progress', authenticateToken, (req, res) => {
  const userId = req.user.babyName;
  db.get('SELECT * FROM journeyData WHERE userId = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const progress = row ? {
      starFragments: row.starFragments,
      activities: JSON.parse(row.activities),
      unlocks: []
    } : { starFragments: 0, activities: [], unlocks: [] };
    res.status(200).json(progress);
  });
});

// Route: Log a care activity
app.post('/care/log', authenticateToken, (req, res) => {
  const { type, details, timestamp } = req.body;
  if (!type || !timestamp) return res.status(400).json({ error: 'Care type and timestamp are required' });

  const userId = req.user.babyName;
  const careEntry = { userId, type, details, timestamp };
  db.run(
    'INSERT INTO careLogs (userId, type, details, timestamp) VALUES (?, ?, ?, ?)',
    [userId, type, details, timestamp],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      careEntry.id = this.lastID;

      db.get('SELECT * FROM journeyData WHERE userId = ?', [userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const starFragments = (row ? row.starFragments : 0) + 1;
        db.run(
          'INSERT OR REPLACE INTO journeyData (userId, starFragments, activities) VALUES (?, ?, ?)',
          [userId, starFragments, row ? row.activities : '[]'],
          (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ careEntry, starFragments });
          }
        );
      });
    }
  );
});

// Route: Get available AR content
app.get('/ar/content', authenticateToken, (req, res) => {
  const userId = req.user.babyName;
  db.get('SELECT * FROM journeyData WHERE userId = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const starFragments = row ? row.starFragments : 0;
    const availableContent = starFragments >= 1 ? ['greeting'] : [];
    res.status(200).json({ availableContent });
  });
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
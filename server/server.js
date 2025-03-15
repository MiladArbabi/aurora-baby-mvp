const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);
app.get('/', (req, res) => res.send('Aurora Baby Backend'));

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
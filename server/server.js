const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount API routes under /api
app.use('/api', apiRoutes);

// Root endpoint for basic server verification
app.get('/', (req, res) => {
  res.send('Aurora Baby Backend');
});

// Function to start the server
const startServer = async () => {
  await connectDB(); // Ensure DB is connected before starting
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle server errors (e.g., EADDRINUSE)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is in use. Try a different port or free it up.`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  return server; // Return server instance for cleanup if needed
};

// Start server only if this file is run directly (not imported in tests)
if (require.main === module) {
  startServer();
}

// Export app for testing purposes
module.exports = app;
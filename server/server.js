const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Root endpoint for basic server verification
app.get('/', (req, res) => {
  res.send('Aurora Baby Backend');
});

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for testing purposes
module.exports = app;
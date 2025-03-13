const mongoose = require('mongoose');
const connectDB = require('../config/db');
require('dotenv').config();

describe('Database Connection Tests', () => {
  it('should connect to MongoDB', async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
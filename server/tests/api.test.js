const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config(); // Load .env for tests

// Point to the running server instead of the app directly
const server = request('http://localhost:5001');

// Test suite for API endpoints
describe('API Tests', () => {
  // Connect to MongoDB before all tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  // Clear User collection before each test
  beforeEach(async () => {
    await mongoose.connection.collection('users').deleteMany({});
  });

  // Close MongoDB connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test GET /api/users with empty database
  it('GET /api/users should return empty array initially', async () => {
    const response = await server.get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test POST /api/users to create a user
  it('POST /api/users should create a user', async () => {
    const response = await server
      .post('/api/users')
      .send({ name: 'Birk' });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Birk');
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('createdAt');
  });

  // Test GET /api/users after adding a user
  it('GET /api/users should return list with one user after POST', async () => {
    await server.post('/api/users').send({ name: 'Freya' });
    const response = await server.get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Freya');
  });
});
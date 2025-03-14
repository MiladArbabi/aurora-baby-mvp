const request = require('supertest');
const app = require('../server'); // Import Express app
const mongoose = require('mongoose');
const User = require('../models/User');

// Test suite for API endpoints
describe('API Tests', () => {
  // Connect to test database before all tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/aurora_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/users should return empty array initially', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/users should create a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Birk' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Birk');
    expect(res.body._id).toBeDefined();
  });

  it('GET /api/users should return list with one user after POST', async () => {
    await request(app).post('/api/users').send({ name: 'Freya' });
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Freya');
  });
});
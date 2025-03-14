const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Child = require('../models/Child'); 
const ParentChildLink = require('../models/ParentChildLink'); 
const jwt = require('jsonwebtoken');

describe('API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/aurora_test');
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Child.deleteMany({});
    await ParentChildLink.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('POST /api/register should create a user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/profiles should create parent and child profiles', async () => {
    const userRes = await request(app)
      .post('/api/register')
      .send({ name: 'Jane', email: 'jane@example.com', password: 'password123' });
    const token = userRes.body.token;

    const res = await request(app)
      .post('/api/profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({ relationship: 'Mother', childName: 'Emma', dateOfBirth: '2023-01-01' });
    expect(res.status).toBe(201);
    expect(res.body.user.relationship).toBe('Mother');
    expect(res.body.child.name).toBe('Emma');
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
  }, 10000);

  it('GET /api/users should return list with one user after POST', async () => {
    await request(app).post('/api/users').send({ name: 'Freya' });
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Freya');
  }, 10000);
});
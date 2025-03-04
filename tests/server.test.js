const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const app = require('../server');
require('dotenv').config();

// Test: SQLite connection
describe('Database Connection', () => {
  it('should connect to SQLite database', (done) => {
    const db = new sqlite3.Database('./aurora_baby.db', (err) => {
      expect(err).toBeNull();
      db.close();
      done();
    });
  });
});

// Test: Root endpoint
describe('GET /', () => {
  it('should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Aurora Baby MVP Backend is running');
  });
});

// Test: Onboarding endpoint
describe('POST /onboard', () => {
  it('should create a baby profile and return a token', async () => {
    const res = await request(app)
      .post('/onboard')
      .send({ babyName: 'Luna', babyAge: 6 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.baby).toHaveProperty('id');
    expect(res.body.baby.name).toBe('Luna');
    expect(res.body.baby.age).toBe(6);
  });
});

// Test: Journey Mode endpoints
describe('Journey Mode', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/onboard')
      .send({ babyName: 'Finn', babyAge: 8 });
    token = res.body.token;
  });

  describe('POST /journey/activity', () => {
    it('should log an activity and award star fragments', async () => {
      const res = await request(app)
        .post('/journey/activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ activity: 'feeding' });
      expect(res.status).toBe(201);
      expect(res.body.activity).toBe('feeding');
      expect(res.body.starFragments).toBe(1);
    });
  });

  describe('GET /journey/progress', () => {
    it('should return progress with star fragments', async () => {
      const res = await request(app)
        .get('/journey/progress')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.starFragments).toBeGreaterThanOrEqual(1);
      expect(res.body.activities).toContain('feeding');
    });
  });
});
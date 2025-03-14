const request = require('supertest');
const app = require('../server'); // Import Express app

// Test suite for server root
describe('Server Tests', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Aurora Baby Backend');
  });
});
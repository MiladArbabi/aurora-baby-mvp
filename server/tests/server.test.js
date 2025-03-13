const request = require('supertest');
const app = require('../server');

// Test suite for server functionality
describe('Server Tests', () => {
  // Test the root endpoint
  it('GET / should return welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Aurora Baby Backend');
  });
});
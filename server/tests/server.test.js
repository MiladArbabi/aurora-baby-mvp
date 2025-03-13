const request = require('supertest');

// Point to the running server
const server = request('http://localhost:5001');

// Test suite for server functionality
describe('Server Tests', () => {
  // Test the root endpoint
  it('GET / should return welcome message', async () => {
    const response = await server.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Aurora Baby Backend');
  });
});
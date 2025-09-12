import request from 'supertest';
import app from '../src/index';

describe('GET /api/images', () => {
  it('should return a resized image', async () => {
    const response = await request(app).get('/api/images?filename=fjord&width=100&height=100');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/jpeg');
  });

  it('should return 404 for non-existing image', async () => {
    const response = await request(app).get(
      '/api/images?filename=doesnotexist&width=100&height=100'
    );
    expect(response.status).toBe(404);
  });
});

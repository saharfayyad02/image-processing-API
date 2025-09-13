import request from 'supertest';
import app from '../src/index';

describe('GET /api/images', () => {
  it('should return resized image when valid parameters are provided', async () => {
    const response = await request(app).get('/api/images?filename=fjord&width=200&height=150');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('image/jpeg');
  });

  it('should return 400 if parameters are missing', async () => {
    const response = await request(app).get('/api/images?filename=fjord');
    expect(response.status).toBe(400);
    expect(response.body.error || response.text).toBeTruthy();
  });

  it('should return 404 if the image does not exist', async () => {
    const response = await request(app).get('/api/images?filename=notfound&width=200&height=150');
    expect(response.status).toBe(404);
    expect(response.body.error || response.text).toContain('not found');
  });

  it('should return 400 if width/height are invalid', async () => {
    const response = await request(app).get('/api/images?filename=fjord&width=-100&height=0');
    expect(response.status).toBe(400);
    expect(response.body.error || response.text).toContain('must be positive integers');
  });
});

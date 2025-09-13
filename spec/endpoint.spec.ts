import request from 'supertest';
import app from '../src/index'; // adjust to your Express app entry

describe('Image Processing API', () => {
  it('should return 200 for valid resize request', async () => {
    const response = await request(app)
      .get('/resize')
      .query({ filename: 'sample.jpg', width: 200, height: 200 });

    expect(response.status).toBe(200);
  });

  it('should return 400 for missing parameters', async () => {
    const response = await request(app).get('/resize');
    expect(response.status).toBe(400);
  });
});

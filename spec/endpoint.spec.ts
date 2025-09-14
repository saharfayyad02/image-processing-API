import request from 'supertest';
import app from '../src/index';
import path from 'path';
import fs from 'fs';

describe('Image Processing API Endpoints', () => {
  // Clean up ONLY thumbnails after each test
  afterEach(() => {
    const thumbDir = path.join(__dirname, '../images/thumb');
    if (fs.existsSync(thumbDir)) {
      fs.readdirSync(thumbDir).forEach((file) => {
        try {
          fs.unlinkSync(path.join(thumbDir, file));
        } catch {
          // ignore cleanup errors
        }
      });
    }
  });

  //
  // Tests for /api/images
  //
  describe('Image Resize API - GET /api/images', () => {
    it('should successfully resize santamonica', async () => {
      const res = await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: '200', height: '200' })
        .expect(200);

      expect(res.headers['content-type']).toContain('image/jpeg');
    });

    it('should handle palmtunnel with decimal dimensions', async () => {
      const res = await request(app)
        .get('/api/images')
        .query({ filename: 'palmtunnel', width: '200.9', height: '150.1' })
        .expect(200);

      expect(res.headers['content-type']).toContain('image/jpeg');
    });

    it('should handle fjord with large dimensions', async () => {
      const res = await request(app)
        .get('/api/images')
        .query({ filename: 'fjord', width: '1000', height: '1000' })
        .expect(200);

      expect(res.headers['content-type']).toContain('image/jpeg');
    });

    it('should return 404 for missing image', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'notfound', width: '200', height: '200' })
        .expect(404);
    });

    it('should return 400 for missing parameters', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica' })
        .expect(400);
    });

    it('should return 400 for negative or zero dimensions', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: '-100', height: '0' })
        .expect(400);
    });

    it('should return 400 for non-numeric dimensions', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: 'abc', height: '150' })
        .expect(400);
    });

    it('should return 400 for empty dimension strings', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'palmtunnel', width: '', height: '' })
        .expect(400);
    });

    it('should return 404 for whitespace filename', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: '   ', width: '200', height: '200' })
        .expect(404);
    });
  });

  //
  // Tests for /resize
  //
  describe('Image Resize API - GET /resize', () => {
    it('should resize fjord successfully', async () => {
      const res = await request(app)
        .get('/resize')
        .query({ filename: 'fjord.jpg', width: '200', height: '200' })
        .expect(200);

      expect(res.headers['content-type']).toContain('image/jpeg');
    });

    it('should return 400 if no query params are provided', async () => {
      await request(app).get('/resize').expect(400);
    });

    it('should return 404 for missing file', async () => {
      await request(app)
        .get('/resize')
        .query({ filename: 'missing.jpg', width: '200', height: '200' })
        .expect(404);
    });
  });
});

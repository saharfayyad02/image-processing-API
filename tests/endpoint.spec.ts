import request from 'supertest';
import app from '../src/index';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

describe('Image Processing API Endpoints', () => {
  // Setup test images before all tests
  beforeAll(async () => {
    const imagesDir = path.join(__dirname, '../images/full');
    
    // Create images directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Create test images
    const testImages = [
      { name: 'santamonica.jpg', width: 600, height: 400, color: { r: 100, g: 150, b: 200 } },
      { name: 'palmtunnel.jpg', width: 800, height: 600, color: { r: 200, g: 100, b: 50 } },
      { name: 'fjord.jpg', width: 1000, height: 800, color: { r: 50, g: 100, b: 150 } }
    ];

    for (const img of testImages) {
      const filePath = path.join(imagesDir, img.name);
      
      // Only create if doesn't exist
      if (!fs.existsSync(filePath)) {
        await sharp({
          create: {
            width: img.width,
            height: img.height,
            channels: 3,
            background: img.color
          }
        })
        .jpeg()
        .toFile(filePath);
      }
    }
  });

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
  // Tests for /api/images - SUCCESS SCENARIOS
  //
  describe('Image Resize API - GET /api/images - Success Scenarios', () => {
    it('should successfully resize santamonica with valid inputs', async () => {
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

    it('should resize image with small dimensions', async () => {
      const res = await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: '50', height: '50' })
        .expect(200);

      expect(res.headers['content-type']).toContain('image/jpeg');
    });
  });

  //
  // Tests for /api/images - ERROR SCENARIOS
  //
  describe('Image Resize API - GET /api/images - Error Scenarios', () => {
    it('should return 404 for missing image', async () => {
      const res = await request(app)
        .get('/api/images')
        .query({ filename: 'notfoune', width: '200', height: '200' })
        .expect(404);

      expect(res.body.error || res.text).toBeDefined();
    });

    it('should return 400 for missing width parameter', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', height: '200' })
        .expect(400);
    });

    it('should return 400 for missing height parameter', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: '200' })
        .expect(400);
    });

    it('should return 400 for missing filename parameter', async () => {
      await request(app)
        .get('/api/images')
        .query({ width: '200', height: '200' })
        .expect(400);
    });

    it('should return 400 for negative dimensions', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: '-100', height: '200' })
        .expect(400);
    });

    it('should return 400 for zero dimensions', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: '0', height: '200' })
        .expect(400);
    });

    it('should return 400 for non-numeric width', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: 'abc', height: '150' })
        .expect(400);
    });

    it('should return 400 for non-numeric height', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: 'santamonica', width: '200', height: 'xyz' })
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

    it('should return 404 for empty filename', async () => {
      await request(app)
        .get('/api/images')
        .query({ filename: ' ', width: '200', height: '200' })
        .expect(404);
    });
  });

  //
  // Tests for /resize - SUCCESS SCENARIOS
  //
  describe('Image Resize API - GET /resize - Success Scenarios', () => {
    it('should resize fjord successfully with .jpg extension', async () => {
      const res = await request(app)
        .get('/resize')
        .query({ filename: 'fjord.jpg', width: '200', height: '200' })
        .expect(200);

      expect(res.headers['content-type']).toContain('image/jpeg');
    });

    it('should resize santamonica successfully', async () => {
      const res = await request(app)
        .get('/resize')
        .query({ filename: 'santamonica.jpg', width: '300', height: '300' })
        .expect(200);

      expect(res.headers['content-type']).toContain('image/jpeg');
    });
  });

  //
  // Tests for /resize - ERROR SCENARIOS
  //
  describe('Image Resize API - GET /resize - Error Scenarios', () => {
    it('should return 400 if no query params are provided', async () => {
      await request(app).get('/resize').expect(400);
    });

    it('should return 404 for missing file', async () => {
      await request(app)
        .get('/resize')
        .query({ filename: 'missing.jpg', width: '200', height: '200' })
        .expect(404);
    });

    it('should return 400 for invalid width in /resize', async () => {
      await request(app)
        .get('/resize')
        .query({ filename: 'fjord.jpg', width: 'invalid', height: '200' })
        .expect(400);
    });

    it('should return 400 for missing parameters in /resize', async () => {
      await request(app)
        .get('/resize')
        .query({ filename: 'fjord.jpg' })
        .expect(400);
    });
  });
});
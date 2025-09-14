// spec/imageProcessing.spec.ts
import { resizeImage } from '../src/services/imageService';
import { parsePositiveInt } from '../src/utils/validators';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

describe('Image Processing Unit Tests', () => {
  
  describe('resizeImage function', () => {
    const testImageName = 'test-image';
    
    beforeEach(async () => {
      // Create test directories
      const projectRoot = path.resolve(__dirname, '..');
      const fullDir = path.join(projectRoot, 'images', 'full');
      const thumbDir = path.join(projectRoot, 'images', 'thumb');
      
      await fs.mkdir(fullDir, { recursive: true });
      await fs.mkdir(thumbDir, { recursive: true });
      
      // Create a test image
      const testImagePath = path.join(fullDir, `${testImageName}.jpg`);
      await sharp({
        create: {
          width: 500,
          height: 500,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      })
      .jpeg()
      .toFile(testImagePath);
    });

    afterEach(async () => {
      try {
        const projectRoot = path.resolve(__dirname, '..');
        const fullDir = path.join(projectRoot, 'images', 'full');
        const thumbDir = path.join(projectRoot, 'images', 'thumb');

        // Only delete test images
        const testFiles = [
          `${testImageName}.jpg`,
          `${testImageName}-200x150.jpg`,
          `${testImageName}-300x200.jpg`,
          `${testImageName}-100x100.jpg`,
          `${testImageName}-250x180.jpg`
        ];

        for (const file of testFiles) {
          await fs.rm(path.join(fullDir, file), { force: true }).catch(() => {});
          await fs.rm(path.join(thumbDir, file), { force: true }).catch(() => {});
        }

      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should resize image with valid parameters', async () => {
      const result = await resizeImage(testImageName, 200, 150);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Verify file exists
      const fileExists = await fs.access(result).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Verify dimensions
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(200);
      expect(metadata.height).toBe(150);
    });

    it('should return cached image on second call', async () => {
      const first = await resizeImage(testImageName, 300, 200);
      const second = await resizeImage(testImageName, 300, 200);
      
      expect(first).toBe(second);
    });

    it('should throw error for non-existent image', async () => {
      await expectAsync(resizeImage('missing-image', 200, 150))
        .toBeRejectedWithError('Source image not found');
    });

    it('should handle different dimensions', async () => {
      const result = await resizeImage(testImageName, 100, 100);
      
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
    });

    it('should create output file with correct name format', async () => {
      const result = await resizeImage(testImageName, 250, 180);
      
      expect(path.basename(result)).toBe(`${testImageName}-250x180.jpg`);
    });
  });

  describe('parsePositiveInt function', () => {
    it('should parse valid positive integers', () => {
      expect(parsePositiveInt('100')).toBe(100);
      expect(parsePositiveInt('1')).toBe(1);
      expect(parsePositiveInt('999')).toBe(999);
    });

    it('should truncate decimal numbers', () => {
      expect(parsePositiveInt('100.7')).toBe(100);
      expect(parsePositiveInt('1.9')).toBe(1);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => parsePositiveInt('')).toThrow();
      expect(() => parsePositiveInt('abc')).toThrow();
      expect(() => parsePositiveInt('0')).toThrow();
      expect(() => parsePositiveInt('-100')).toThrow();
    });

    it('should handle whitespace in numbers', () => {
      expect(parsePositiveInt('  100  ')).toBe(100);
    });

    it('should throw error for zero and negative', () => {
      expect(() => parsePositiveInt('0')).toThrow();
      expect(() => parsePositiveInt('-1')).toThrow();
      expect(() => parsePositiveInt('-100')).toThrow();
    });

    it('should throw error for non-numeric strings', () => {
      expect(() => parsePositiveInt('width')).toThrow();
      expect(() => parsePositiveInt('100px')).toThrow();
      expect(() => parsePositiveInt('NaN')).toThrow();
    });
  });

  describe('Integration Tests', () => {
    const testImageName = 'integration-test';
    
    beforeEach(async () => {
      const projectRoot = path.resolve(__dirname, '..');
      const fullDir = path.join(projectRoot, 'images', 'full');
      await fs.mkdir(fullDir, { recursive: true });
      
      const testImagePath = path.join(fullDir, `${testImageName}.jpg`);
      await sharp({
        create: {
          width: 400,
          height: 400,
          channels: 3,
          background: { r: 0, g: 255, b: 0 }
        }
      })
      .jpeg()
      .toFile(testImagePath);
    });

    afterEach(async () => {
      try {
        const projectRoot = path.resolve(__dirname, '..');
        const fullDir = path.join(projectRoot, 'images', 'full');
        const thumbDir = path.join(projectRoot, 'images', 'thumb');

        // Only delete integration test images
        const testFiles = [
          `${testImageName}.jpg`,
          `${testImageName}-180x120.jpg`,
          `${testImageName}-150x100.jpg`
        ];

        for (const file of testFiles) {
          await fs.rm(path.join(fullDir, file), { force: true }).catch(() => {});
          await fs.rm(path.join(thumbDir, file), { force: true }).catch(() => {});
        }

      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should parse dimensions and resize image together', async () => {
      const width = parsePositiveInt('180');
      const height = parsePositiveInt('120');
      
      const result = await resizeImage(testImageName, width, height);
      
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(180);
      expect(metadata.height).toBe(120);
    });

    it('should handle decimal string inputs in full pipeline', async () => {
      const width = parsePositiveInt('150.8');
      const height = parsePositiveInt('100.9');
      
      const result = await resizeImage(testImageName, width, height);
      
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(150); // truncated
      expect(metadata.height).toBe(100); // truncated
    });
  });
});

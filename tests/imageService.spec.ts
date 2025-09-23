import { resizeImage } from '../src/services/imageService';
import { parsePositiveInt } from '../src/utils/validators';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

describe('Image Processing Unit Tests', () => {
  
  describe('resizeImage function - Direct Unit Tests', () => {
    const testImageName = 'unit-test-image';
    
    beforeEach(async () => {
      // Create test directories
      const projectRoot = path.resolve(__dirname, '..');
      const fullDir = path.join(projectRoot, 'images', 'full');
      const thumbDir = path.join(projectRoot, 'images', 'thumb');
      
      await fs.mkdir(fullDir, { recursive: true });
      await fs.mkdir(thumbDir, { recursive: true });
      
      // Create a test image for unit testing
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

        // Clean up test images
        const testFiles = [
          `${testImageName}.jpg`,
          `${testImageName}-200x150.jpg`,
          `${testImageName}-300x200.jpg`,
          `${testImageName}-100x100.jpg`,
          `${testImageName}-250x180.jpg`,
          `${testImageName}-50x75.jpg`
        ];

        for (const file of testFiles) {
          await fs.rm(path.join(fullDir, file), { force: true }).catch(() => {});
          await fs.rm(path.join(thumbDir, file), { force: true }).catch(() => {});
        }

      } catch (error) {
        // Ignore cleanup errors
      }
    });

    // VALID INPUT TESTS
    it('should resize image with valid inputs - directly calling function', async () => {
      const result = await resizeImage(testImageName, 200, 150);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain(`${testImageName}-200x150.jpg`);

      // Verify file exists
      const fileExists = await fs.access(result).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Verify dimensions are correct
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(200);
      expect(metadata.height).toBe(150);
    });

    it('should return cached image path on second call with same parameters', async () => {
      const first = await resizeImage(testImageName, 300, 200);
      const second = await resizeImage(testImageName, 300, 200);
      
      expect(first).toBe(second);
      expect(first).toContain(`${testImageName}-300x200.jpg`);
    });

    it('should handle different dimensions correctly', async () => {
      const result = await resizeImage(testImageName, 100, 100);
      
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
      expect(path.basename(result)).toBe(`${testImageName}-100x100.jpg`);
    });

    it('should create output file with correct naming format', async () => {
      const result = await resizeImage(testImageName, 250, 180);
      
      expect(path.basename(result)).toBe(`${testImageName}-250x180.jpg`);
      
      // Verify it actually resized correctly
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(250);
      expect(metadata.height).toBe(180);
    });

    it('should handle small dimensions', async () => {
      const result = await resizeImage(testImageName, 50, 75);
      
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(50);
      expect(metadata.height).toBe(75);
    });

    // ERROR HANDLING TESTS
    it('should throw error for non-existent image', async () => {
      await expectAsync(resizeImage('missing-image-file', 200, 150))
        .toBeRejectedWithError();
    });

    it('should handle error appropriately when source image is corrupted', async () => {
      // Create a corrupted image file
      const corruptedImageName = 'corrupted-test';
      const projectRoot = path.resolve(__dirname, '..');
      const fullDir = path.join(projectRoot, 'images', 'full');
      const corruptedPath = path.join(fullDir, `${corruptedImageName}.jpg`);
      
      // Write invalid JPEG data
      await fs.writeFile(corruptedPath, 'invalid image data');
      
      try {
        await expectAsync(resizeImage(corruptedImageName, 200, 150))
          .toBeRejected();
      } finally {
        // Clean up
        await fs.rm(corruptedPath, { force: true }).catch(() => {});
      }
    });
  });

  describe('parsePositiveInt function - Direct Unit Tests', () => {
    // VALID INPUT TESTS
    it('should parse valid positive integers correctly', () => {
      expect(parsePositiveInt('100')).toBe(100);
      expect(parsePositiveInt('1')).toBe(1);
      expect(parsePositiveInt('999')).toBe(999);
      expect(parsePositiveInt('2000')).toBe(2000);
    });

    it('should truncate decimal numbers to integers', () => {
      expect(parsePositiveInt('100.7')).toBe(100);
      expect(parsePositiveInt('1.9')).toBe(1);
      expect(parsePositiveInt('250.5')).toBe(250);
    });

    it('should handle whitespace around numbers', () => {
      expect(parsePositiveInt('  100  ')).toBe(100);
      expect(parsePositiveInt('\t200\n')).toBe(200);
    });

    // ERROR HANDLING TESTS
    it('should throw error for empty string', () => {
      expect(() => parsePositiveInt('')).toThrow();
    });

    it('should throw error for non-numeric strings', () => {
      expect(() => parsePositiveInt('abc')).toThrow();
      expect(() => parsePositiveInt('width')).toThrow();
      expect(() => parsePositiveInt('100px')).toThrow();
      expect(() => parsePositiveInt('NaN')).toThrow();
    });

    it('should throw error for zero', () => {
      expect(() => parsePositiveInt('0')).toThrow();
      expect(() => parsePositiveInt('0.0')).toThrow();
    });

    it('should throw error for negative numbers', () => {
      expect(() => parsePositiveInt('-1')).toThrow();
      expect(() => parsePositiveInt('-100')).toThrow();
      expect(() => parsePositiveInt('-50.5')).toThrow();
    });

    it('should throw error for invalid numeric formats', () => {
      expect(() => parsePositiveInt('1e5')).toThrow(); // Scientific notation
      expect(() => parsePositiveInt('Infinity')).toThrow();
      expect(() => parsePositiveInt('-Infinity')).toThrow();
    });
  });

  describe('Integration Tests - Function Combinations', () => {
    const testImageName = 'integration-unit-test';
    
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

    it('should parse string dimensions and resize image together', async () => {
      const width = parsePositiveInt('180');
      const height = parsePositiveInt('120');
      
      const result = await resizeImage(testImageName, width, height);
      
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(180);
      expect(metadata.height).toBe(120);
    });

    it('should handle decimal string inputs in complete pipeline', async () => {
      const width = parsePositiveInt('150.8');
      const height = parsePositiveInt('100.9');
      
      const result = await resizeImage(testImageName, width, height);
      
      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBe(150); // Should be truncated
      expect(metadata.height).toBe(100); // Should be truncated
    });

    it('should throw error when parsing invalid dimensions for resize', () => {
      expect(() => {
        parsePositiveInt('invalid');
      }).toThrow();
      
      expect(() => {
        parsePositiveInt('-50');
      }).toThrow();
    });
  });
});
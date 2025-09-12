// tests/image.spec.ts
import { resizeImage } from '../src/services/imageService';
import fs from 'fs';

describe('Image service', () => {
  const filename = 'fjord'; // ensure images/full/fjord.jpg exists for tests
  const width = 200;
  const height = 150;

  it('should resize existing image and return path to thumbnail', async () => {
    const thumbPath = await resizeImage(filename, width, height);
    expect(typeof thumbPath).toBe('string');
    expect(fs.existsSync(thumbPath)).toBeTrue();
    expect(thumbPath).toContain(`${filename}-${width}x${height}.jpg`);
  });

  it('should reject for missing source image', async () => {
    await expectAsync(resizeImage('this-file-does-not-exist', 50, 50)).toBeRejected();
  });
});

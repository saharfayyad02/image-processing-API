import fs from 'fs';
import path from 'path';
import { resizeImage } from '../src/services/imageService';

describe('Image Processing Utility (resizeImage)', () => {
  const filename = 'fjord'; // make sure images/full/fjord.jpg exists
  const width = 200;
  const height = 150;

  it('should resize an existing image and return the thumbnail path', async () => {
    const thumbPath = await resizeImage(filename, width, height);

    expect(typeof thumbPath).toBe('string');
    expect(fs.existsSync(thumbPath)).toBeTrue();
    expect(path.basename(thumbPath)).toBe(`${filename}-${width}x${height}.jpg`);
  });

  it('should throw an error for a non-existing source image', async () => {
    await expectAsync(resizeImage('notfound', 100, 100)).toBeRejectedWithError(
      'Source image not found'
    );
  });
});

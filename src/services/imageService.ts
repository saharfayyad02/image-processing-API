// src/services/imageService.ts
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/**
 * Resize an image stored in images/full/<filename>.jpg to width x height,
 * caching result to images/thumb/<filename>-<width>x<height>.jpg
 *
 * @returns absolute path to the cached thumbnail
 */
export async function resizeImage(
  filename: string,
  width: number,
  height: number
): Promise<string> {
  const projectRoot = path.resolve(__dirname, '../..'); // root of project
  const fullDir = path.join(projectRoot, 'images', 'full');
  const thumbDir = path.join(projectRoot, 'images', 'thumb');

  // Accept both with and without extension, but for this project we use .jpg
  const sourcePath = path.join(fullDir, `${filename}.jpg`);

  // Validate source exists
  try {
    await fsPromises.access(sourcePath, fs.constants.R_OK);
  } catch {
    throw new Error('Source image not found');
  }

  // Ensure thumb folder exists
  await fsPromises.mkdir(thumbDir, { recursive: true });

  const thumbFilename = `${filename}-${width}x${height}.jpg`;
  const thumbPath = path.join(thumbDir, thumbFilename);

  // If cached image already exists, return it
  if (fs.existsSync(thumbPath)) {
    return thumbPath;
  }

  // Resize using sharp
  try {
    await sharp(sourcePath).resize(width, height).jpeg({ quality: 90 }).toFile(thumbPath);
    return thumbPath;
  } catch (err) {
    // cleanup if something partial created
    if (fs.existsSync(thumbPath)) {
      try {
        await fsPromises.unlink(thumbPath);
      } catch {
        // ignore cleanup error
      }
    }
    throw new Error(`Failed to process image: ${(err as Error).message}`);
  }
}

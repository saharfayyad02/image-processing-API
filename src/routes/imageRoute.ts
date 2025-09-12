// src/routes/imageRoute.ts
import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { parsePositiveInt } from '../utils/validators';
import { resizeImage } from '../services/imageService';

const router = Router();

/**
 * GET /api/images?filename=<name>&width=<w>&height=<h>
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filename = String(req.query.filename ?? '');
    if (!filename) {
      return res.status(400).json({ error: 'Missing filename parameter' });
    }

    const width = parsePositiveInt(String(req.query.width ?? ''));
    const height = parsePositiveInt(String(req.query.height ?? ''));

    // Process/return image
    const thumbPath = await resizeImage(filename, width, height);

    // ensure file exists and send it
    await fs.access(thumbPath);
    return res.sendFile(path.resolve(thumbPath));
  } catch (err: unknown) {
    // Specific validation errors return 400, file-not-found 404; otherwise 500
    const e = err as Error & { code?: string };
    if (
      (e.message && e.message.includes('width')) ||
      e.message.includes('height') ||
      e.message.includes('Missing')
    ) {
      return res.status(400).json({ error: e.message });
    }
    if (e.message && e.message.includes('Source image not found')) {
      return res.status(404).json({ error: e.message });
    }
    // eslint-disable-next-line no-console
    console.error('Unexpected error in /api/images:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

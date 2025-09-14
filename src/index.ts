// src/app.ts
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs/promises';
import imageRouter from './routes/imageRoute';
import { resizeImage } from './services/imageService';
import { parsePositiveInt } from './utils/validators';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/images', imageRouter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// static full images (optional)
app.use('/images/full', express.static(path.resolve(__dirname, '../images/full')));

// Fixed /resize route
app.get('/resize', async (req, res) => {
  const { filename, width, height } = req.query;

  if (!filename || !width || !height) {
    return res.status(400).send('Missing query parameters');
  }

  let widthNum: number;
  let heightNum: number;

  try {
    widthNum = parsePositiveInt(width.toString());
    heightNum = parsePositiveInt(height.toString());
  } catch {
    return res.status(400).send('Invalid width or height');
  }

  try {
    // Remove extension if provided, resizeImage expects base name
    const baseName = filename.toString().replace(/\.[^/.]+$/, '');
    const imagePath = await resizeImage(baseName, widthNum, heightNum);

    const imageBuffer = await fs.readFile(imagePath);
    res.set('Content-Type', 'image/jpeg');
    return res.status(200).send(imageBuffer);
  } catch (err: any) {
    if (err.message.includes('Source image not found')) {
      return res.status(404).send('Image not found');
    }
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

export default app;

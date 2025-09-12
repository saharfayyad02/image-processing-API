// src/app.ts
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import imageRouter from './routes/imageRoute';

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

// static full images (optional) — only for development convenience
app.use('/images/full', express.static(path.resolve(__dirname, '../images/full')));

export default app;

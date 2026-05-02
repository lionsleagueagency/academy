import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve('uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Muitas requisições. Tente novamente mais tarde.' }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

app.use(errorHandler);

export default app;

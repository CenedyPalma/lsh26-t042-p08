import express from 'express';
import cors from 'cors';
import classRoutes from './routes/class.routes.js';
import studentRoutes from './routes/student.routes.js';
import resultRoutes from './routes/result.routes.js';
import checkingRoutes from './routes/checking.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/classes', classRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/results', resultRoutes);
  app.use('/api/checking', checkingRoutes);

  // Error Handler
  app.use(errorHandler);

  return app;
}

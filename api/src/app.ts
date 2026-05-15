import express from 'express';
import type { Application, Request, Response } from 'express';
import { globalErrorHandler } from './errors/AppError.js';
import tasksRouter from './routes/tasks.js';

const app: Application = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response): void => {
  res.json({ success: true, message: 'OK' });
});

app.use('/api/v1/tasks', tasksRouter);

app.use(globalErrorHandler);

export default app;

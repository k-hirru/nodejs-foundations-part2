import type { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import db from '../lib/db.js';
import { AppError } from '../errors/AppError.js';
import type { TTaskParams, TCreateTaskBody, TUpdateTaskBody } from '../routes/tasks.js';
import { taskParamsSchema } from '../routes/tasks.js';

function parseTaskId(raw: unknown): string {
  const result = taskParamsSchema.safeParse(raw);
  if (!result.success) {
    throw new AppError('Invalid task ID', 400, 'INVALID_ID');
  }
  return result.data.id;
}

function isP2025(err: unknown): boolean {
  return err instanceof PrismaClientKnownRequestError && err.code === 'P2025';
}

export async function getTask(
  req: Request<TTaskParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseTaskId(req.params);
    const task = await db.task.findUnique({ where: { id } });
    if (task === null) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }
    res.json({ success: true, data: task });
  } catch (err: unknown) {
    next(err);
  }
}

export async function createTask(
  req: Request<Record<string, never>, unknown, TCreateTaskBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { title, description, priority, boardId } = req.body;
    const task = await db.task.create({
      data: { title, description, priority, boardId },
    });
    res.status(201).json({ success: true, data: task });
  } catch (err: unknown) {
    next(err);
  }
}

export async function updateTask(
  req: Request<TTaskParams, unknown, TUpdateTaskBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseTaskId(req.params);
    const { title, priority } = req.body;
    const task = await db.task.update({
      where: { id },
      data: { title, priority },
    });
    res.json({ success: true, data: task });
  } catch (err: unknown) {
    if (isP2025(err)) {
      next(new AppError('Task not found', 404, 'TASK_NOT_FOUND'));
      return;
    }
    next(err);
  }
}

export async function deleteTask(
  req: Request<TTaskParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseTaskId(req.params);
    await db.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err: unknown) {
    if (isP2025(err)) {
      next(new AppError('Task not found', 404, 'TASK_NOT_FOUND'));
      return;
    }
    next(err);
  }
}

import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import {
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

export const taskParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export const createTaskSchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH']),
  boardId:     z.string().uuid('Invalid board ID'),
});

export const updateTaskSchema = z.object({
  title:    z.string().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export type TTaskParams     = z.infer<typeof taskParamsSchema>;
export type TCreateTaskBody = z.infer<typeof createTaskSchema>;
export type TUpdateTaskBody = z.infer<typeof updateTaskSchema>;

const router = Router();

router.get('/:id', getTask);
router.post('/', validateBody(createTaskSchema), createTask);
router.patch('/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;

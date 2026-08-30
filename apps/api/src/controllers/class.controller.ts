import { Request, Response, NextFunction } from 'express';
import { classService } from '../services/class.service.js';
import { classStudentsQuerySchema } from '../validators/index.js';

export class ClassController {
  async getAllClasses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classes = await classService.getAllClasses();
      res.json({
        success: true,
        data: classes,
      });
    } catch (err) {
      next(err);
    }
  }

  async getClassStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = String(req.params.classId);
      const filters = classStudentsQuerySchema.parse(req.query);
      const students = await classService.getClassStudents(classId, filters);
      res.json({
        success: true,
        data: students,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const classController = new ClassController();

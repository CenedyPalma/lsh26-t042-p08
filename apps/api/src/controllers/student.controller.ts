import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service.js';

export class StudentController {
  async getAllStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, search, limit, offset } = req.query;
      const result = await studentService.getAllStudents({
        classId: classId as string | undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result.students,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = String(req.params.studentId);
      const student = await studentService.getStudentById(studentId);

      if (!student) {
        res.status(404).json({
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: `Student with ID '${studentId}' not found.`,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: student,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const studentController = new StudentController();

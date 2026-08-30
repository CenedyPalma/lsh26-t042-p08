import { Request, Response, NextFunction } from 'express';
import { resultService } from '../services/result.service.js';

export class ResultController {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await resultService.getDashboardStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStudentResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = String(req.params.studentId);
      const result = await resultService.getStudentResult(studentId);

      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RESULT_NOT_FOUND',
            message: `Result for student '${studentId}' not found.`,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStudentTrace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = String(req.params.studentId);
      const trace = await resultService.getStudentTrace(studentId);

      if (!trace) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRACE_NOT_FOUND',
            message: `Trace for student '${studentId}' not found.`,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: trace,
      });
    } catch (err) {
      next(err);
    }
  }

  async recalculateAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recalculation = await resultService.recalculateAllResults();
      res.json({
        success: true,
        data: recalculation,
        message: `Successfully recalculated results for ${recalculation.calculatedCount} students.`,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const resultController = new ResultController();

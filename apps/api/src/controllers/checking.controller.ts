import { Request, Response, NextFunction } from 'express';
import { checkingService } from '../services/checking.service.js';
import {
  verifyItemSchema,
  rejectItemSchema,
  checkingQuerySchema,
} from '../validators/index.js';
import { CheckingType, VerificationStatus } from '@school-result/shared';

export class CheckingController {
  async getAllCheckingItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = checkingQuerySchema.parse(req.query);
      const items = await checkingService.getCheckingItems({
        type: query.type as CheckingType | undefined,
        status: query.status as VerificationStatus | undefined,
        classId: query.classId,
      });
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  async getOptionalCheckingItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, classId } = req.query;
      const items = await checkingService.getCheckingItems({
        type: 'OPTIONAL',
        status: status as VerificationStatus | undefined,
        classId: classId as string | undefined,
      });
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPracticalFailCheckingItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, classId } = req.query;
      const items = await checkingService.getCheckingItems({
        type: 'PRACTICAL_FAIL',
        status: status as VerificationStatus | undefined,
        classId: classId as string | undefined,
      });
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAbsentCheckingItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, classId } = req.query;
      const items = await checkingService.getCheckingItems({
        type: 'ABSENT',
        status: status as VerificationStatus | undefined,
        classId: classId as string | undefined,
      });
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyCheckingItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = verifyItemSchema.parse(req.body);
      const item = await checkingService.verifyCheckingItem(id, notes);
      res.json({
        success: true,
        data: item,
        message: 'Checking item verified successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectCheckingItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = rejectItemSchema.parse(req.body);
      const item = await checkingService.rejectCheckingItem(id, notes);
      res.json({
        success: true,
        data: item,
        message: 'Checking item rejected successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const checkingController = new CheckingController();

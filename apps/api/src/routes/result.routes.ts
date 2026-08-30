import { Router } from 'express';
import { resultController } from '../controllers/result.controller.js';

const router: Router = Router();

router.get('/', (req, res, next) => resultController.getDashboardStats(req, res, next));
router.get('/:studentId', (req, res, next) => resultController.getStudentResult(req, res, next));
router.get('/:studentId/trace', (req, res, next) => resultController.getStudentTrace(req, res, next));
router.post('/recalculate', (req, res, next) => resultController.recalculateAll(req, res, next));

export default router;

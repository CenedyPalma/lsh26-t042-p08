import { Router } from 'express';
import { classController } from '../controllers/class.controller.js';

const router = Router();

router.get('/', (req, res, next) => classController.getAllClasses(req, res, next));
router.get('/:classId/students', (req, res, next) => classController.getClassStudents(req, res, next));

export default router;

import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';

const router: Router = Router();

router.get('/', (req, res, next) => studentController.getAllStudents(req, res, next));
router.get('/:studentId', (req, res, next) => studentController.getStudentById(req, res, next));

export default router;

import { Router } from 'express';
import { checkingController } from '../controllers/checking.controller.js';

const router: Router = Router();

router.get('/', (req, res, next) => checkingController.getCheckingItems(req, res, next));
router.get('/optional', (req, res, next) => checkingController.getOptionalReviewItems(req, res, next));
router.get('/practical-fail', (req, res, next) => checkingController.getPracticalFailReviewItems(req, res, next));
router.get('/absent', (req, res, next) => checkingController.getAbsentReviewItems(req, res, next));
router.patch('/:id/verify', (req, res, next) => checkingController.verifyCheckingItem(req, res, next));
router.patch('/:id/reject', (req, res, next) => checkingController.rejectCheckingItem(req, res, next));

export default router;

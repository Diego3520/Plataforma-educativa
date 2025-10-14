import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/google', authController.google);
router.post('/microsoft', authController.microsoft);

export default router;
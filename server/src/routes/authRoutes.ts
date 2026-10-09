import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/firebase-sync', authController.firebaseSync.bind(authController));
router.get('/me', requireAuth, authController.me.bind(authController));
router.put('/profile', requireAuth, authController.updateProfile.bind(authController));

export default router;

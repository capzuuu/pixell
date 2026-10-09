import { Router } from 'express';
import { progressController } from '../controllers/progressController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, progressController.getContinueWatching.bind(progressController));
router.get('/item', requireAuth, progressController.getProgress.bind(progressController));
router.post('/', requireAuth, progressController.saveProgress.bind(progressController));
router.post('/stop-stream', requireAuth, progressController.stopLiveStream.bind(progressController));
router.delete('/:id', requireAuth, progressController.clearProgress.bind(progressController));

export default router;

import { Router } from 'express';
import { historyController } from '../controllers/historyController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, historyController.getHistory.bind(historyController));
router.delete('/:id?', requireAuth, historyController.clearHistory.bind(historyController));

export default router;

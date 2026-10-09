import { Router } from 'express';
import { watchlistController } from '../controllers/watchlistController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, watchlistController.getWatchlist.bind(watchlistController));
router.post('/', requireAuth, watchlistController.addToWatchlist.bind(watchlistController));
router.delete('/:id', requireAuth, watchlistController.removeFromWatchlist.bind(watchlistController));
router.get('/check/:id', optionalAuth, watchlistController.checkStatus.bind(watchlistController));

export default router;

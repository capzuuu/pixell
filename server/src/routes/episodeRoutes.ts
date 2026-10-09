import { Router } from 'express';
import { episodeController } from '../controllers/episodeController';

const router = Router();

// Public routes
router.get('/:id', episodeController.getEpisodeById.bind(episodeController));
router.get('/:id/next', episodeController.getNextEpisode.bind(episodeController));
router.get('/season/:id/episodes', episodeController.getEpisodesBySeasonId.bind(episodeController));

export default router;

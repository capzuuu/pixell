import { Router } from 'express';
import { seriesController } from '../controllers/seriesController';
import { episodeController } from '../controllers/episodeController';

const router = Router();

// Public routes
router.get('/', seriesController.getSeries.bind(seriesController));
router.get('/featured', seriesController.getFeatured.bind(seriesController));
router.get('/popular', seriesController.getPopular.bind(seriesController));
router.get('/:slugOrId', seriesController.getSeriesBySlugOrId.bind(seriesController));
router.get('/:id/similar', seriesController.getSimilar.bind(seriesController));
router.get('/:id/seasons', episodeController.getSeasonsBySeriesId.bind(episodeController));

export default router;

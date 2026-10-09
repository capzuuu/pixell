import { Router } from 'express';
import { movieController } from '../controllers/movieController';

const router = Router();

// Public streaming routes
router.get('/', movieController.getMovies.bind(movieController));
router.get('/featured', movieController.getFeatured.bind(movieController));
router.get('/popular', movieController.getPopular.bind(movieController));
router.get('/:slugOrId', movieController.getMovieBySlugOrId.bind(movieController));
router.get('/:id/similar', movieController.getSimilar.bind(movieController));

export default router;

import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import movieRoutes from './movieRoutes';
import seriesRoutes from './seriesRoutes';
import episodeRoutes from './episodeRoutes';
import genreRoutes from './genreRoutes';
import watchlistRoutes from './watchlistRoutes';
import progressRoutes from './progressRoutes';
import historyRoutes from './historyRoutes';
import searchRoutes from './searchRoutes';
import tmdbRoutes from './tmdbRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/series', seriesRoutes);
router.use('/episodes', episodeRoutes);
router.use('/genres', genreRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/progress', progressRoutes);
router.use('/history', historyRoutes);
router.use('/search', searchRoutes);
router.use('/tmdb', tmdbRoutes);

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Pixell Streaming API' });
});

export default router;

import { Router } from 'express';
import { tmdbController } from '../controllers/tmdbController';

const router = Router();

// Public TMDB Discovery & Streaming Endpoints
router.get('/featured', tmdbController.getFeatured.bind(tmdbController));
router.get('/trending/movies', tmdbController.getTrendingMovies.bind(tmdbController));
router.get('/trending/series', tmdbController.getTrendingSeries.bind(tmdbController));
router.get('/popular/movies', tmdbController.getPopularMovies.bind(tmdbController));
router.get('/popular/series', tmdbController.getPopularSeries.bind(tmdbController));
router.get('/top-rated/movies', tmdbController.getTopRatedMovies.bind(tmdbController));
router.get('/top-rated/series', tmdbController.getTopRatedSeries.bind(tmdbController));
router.get('/genres/movies', tmdbController.getMovieGenres.bind(tmdbController));
router.get('/genres/series', tmdbController.getSeriesGenres.bind(tmdbController));
router.get('/discover/movies', tmdbController.discoverMovies.bind(tmdbController));
router.get('/discover/series', tmdbController.discoverSeries.bind(tmdbController));
router.get('/search', tmdbController.search.bind(tmdbController));
router.get('/movie/:id', tmdbController.getMovieDetails.bind(tmdbController));
router.get('/tv/:id', tmdbController.getSeriesDetails.bind(tmdbController));
router.get('/tv/:id/season/:seasonNumber', tmdbController.getSeasonEpisodes.bind(tmdbController));

export default router;

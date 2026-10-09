import { Request, Response, NextFunction } from 'express';
import { tmdbService } from '../services/tmdbService';

export class TmdbController {
  async getTrendingMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timeWindow } = req.query;
      const movies = await tmdbService.getTrendingMovies(timeWindow === 'day' ? 'day' : 'week');
      res.status(200).json({ success: true, data: movies });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timeWindow } = req.query;
      const series = await tmdbService.getTrendingSeries(timeWindow === 'day' ? 'day' : 'week');
      res.status(200).json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async getPopularMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const data = await tmdbService.getPopularMovies(page);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async getPopularSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const data = await tmdbService.getPopularSeries(page);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async getTopRatedMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const data = await tmdbService.getTopRatedMovies(page);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async getTopRatedSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const data = await tmdbService.getTopRatedSeries(page);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async getMovieGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const genres = await tmdbService.getMovieGenres();
      res.status(200).json({ success: true, data: genres });
    } catch (error) {
      next(error);
    }
  }

  async getSeriesGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const genres = await tmdbService.getSeriesGenres();
      res.status(200).json({ success: true, data: genres });
    } catch (error) {
      next(error);
    }
  }

  async discoverMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { genreId, year, sortBy, page } = req.query;
      const data = await tmdbService.discoverMovies({
        genreId: genreId ? String(genreId) : undefined,
        year: year ? parseInt(String(year), 10) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
      });
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async discoverSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { genreId, year, sortBy, page } = req.query;
      const data = await tmdbService.discoverSeries({
        genreId: genreId ? String(genreId) : undefined,
        year: year ? parseInt(String(year), 10) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
      });
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, type, page } = req.query;
      const query = String(q || '');
      const mediaType = (type === 'movie' || type === 'tv') ? type : 'multi';
      const pageNum = page ? parseInt(String(page), 10) : 1;
      const results = await tmdbService.search(query, mediaType, pageNum);
      res.status(200).json({ success: true, ...results });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const featured = await tmdbService.getFeatured();
      res.status(200).json({ success: true, data: featured });
    } catch (error) {
      next(error);
    }
  }

  async getMovieDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const details = await tmdbService.getMovieDetails(id);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  async getSeriesDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const details = await tmdbService.getSeriesDetails(id);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  async getSeasonEpisodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, seasonNumber } = req.params;
      const episodes = await tmdbService.getSeasonEpisodes(id, seasonNumber);
      res.status(200).json({ success: true, data: episodes });
    } catch (error) {
      next(error);
    }
  }

  async importMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tmdbId } = req.body;
      if (!tmdbId) {
        res.status(400).json({ success: false, message: 'tmdbId is required' });
        return;
      }
      const imported = await tmdbService.importMovie(tmdbId);
      res.status(200).json({ success: true, message: 'Movie imported from TMDB with Videasy streaming URL', data: imported });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to import movie from TMDB' });
    }
  }

  async importSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tmdbId } = req.body;
      if (!tmdbId) {
        res.status(400).json({ success: false, message: 'tmdbId is required' });
        return;
      }
      const imported = await tmdbService.importSeries(tmdbId);
      res.status(200).json({ success: true, message: 'TV series, seasons, and episodes imported from TMDB', data: imported });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to import series from TMDB' });
    }
  }

  async seedTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tmdbService.seedTrendingPopular();
      res.status(200).json({ success: true, message: `Successfully seeded ${result.importedCount} trending titles from TMDB with Videasy streaming!`, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to seed from TMDB' });
    }
  }
}

export const tmdbController = new TmdbController();

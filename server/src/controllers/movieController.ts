import { Request, Response, NextFunction } from 'express';
import { movieService } from '../services/movieService';

export class MovieController {
  async getMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { genre, year, rating, sort, search, limit, offset, isPublished } = req.query;

      const filters: any = {};
      if (genre) filters.genre = String(genre);
      if (year) filters.year = parseInt(String(year), 10);
      if (rating) filters.rating = String(rating);
      if (sort) filters.sort = String(sort);
      if (search) filters.search = String(search);
      if (limit) filters.limit = parseInt(String(limit), 10);
      if (offset) filters.offset = parseInt(String(offset), 10);
      if (isPublished !== undefined) filters.isPublished = isPublished === 'true';

      const result = await movieService.getMovies(filters);
      res.status(200).json({
        success: true,
        data: result.movies,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movies = await movieService.getFeaturedMovies();
      res.status(200).json({ success: true, data: movies });
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movies = await movieService.getPopularMovies();
      res.status(200).json({ success: true, data: movies });
    } catch (error) {
      next(error);
    }
  }

  async getMovieBySlugOrId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slugOrId } = req.params;
      const movie = await movieService.getMovieBySlug(slugOrId);
      if (!movie) {
        res.status(404).json({ success: false, message: 'Movie not found' });
        return;
      }
      res.status(200).json({ success: true, data: movie });
    } catch (error) {
      next(error);
    }
  }

  async getSimilar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const similar = await movieService.getSimilarMovies(id);
      res.status(200).json({ success: true, data: similar });
    } catch (error) {
      next(error);
    }
  }

  async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, posterUrl, backdropUrl, trailerUrl, videoUrl, releaseYear, duration, rating, language, country, isFeatured, isPublished, genreIds } = req.body;

      if (!title || !posterUrl || !backdropUrl || !videoUrl) {
        res.status(400).json({ success: false, message: 'Title, posterUrl, backdropUrl, and videoUrl are required' });
        return;
      }

      const movie = await movieService.createMovie({
        title,
        description,
        posterUrl,
        backdropUrl,
        trailerUrl,
        videoUrl,
        releaseYear: parseInt(releaseYear, 10) || new Date().getFullYear(),
        duration: parseInt(duration, 10) || 90,
        rating,
        language,
        country,
        isFeatured: Boolean(isFeatured),
        isPublished: isPublished !== false,
        genreIds
      });

      res.status(201).json({
        success: true,
        message: 'Movie created successfully',
        data: movie
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const movie = await movieService.updateMovie(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Movie updated successfully',
        data: movie
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to update movie' });
    }
  }

  async deleteMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await movieService.deleteMovie(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Movie not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const movieController = new MovieController();

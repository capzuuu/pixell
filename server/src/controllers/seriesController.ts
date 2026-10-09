import { Request, Response, NextFunction } from 'express';
import { seriesService } from '../services/seriesService';

export class SeriesController {
  async getSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const result = await seriesService.getSeriesList(filters);
      res.status(200).json({
        success: true,
        data: result.series,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const series = await seriesService.getFeaturedSeries();
      res.status(200).json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const series = await seriesService.getPopularSeries();
      res.status(200).json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async getSeriesBySlugOrId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slugOrId } = req.params;
      const series = await seriesService.getSeriesBySlug(slugOrId);
      if (!series) {
        res.status(404).json({ success: false, message: 'Series not found' });
        return;
      }
      res.status(200).json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async getSimilar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const similar = await seriesService.getSimilarSeries(id);
      res.status(200).json({ success: true, data: similar });
    } catch (error) {
      next(error);
    }
  }

  async createSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, posterUrl, backdropUrl, trailerUrl, releaseYear, rating, language, country, isFeatured, isPublished, genreIds } = req.body;

      if (!title || !posterUrl || !backdropUrl) {
        res.status(400).json({ success: false, message: 'Title, posterUrl, and backdropUrl are required' });
        return;
      }

      const series = await seriesService.createSeries({
        title,
        description,
        posterUrl,
        backdropUrl,
        trailerUrl,
        releaseYear: parseInt(releaseYear, 10) || new Date().getFullYear(),
        rating,
        language,
        country,
        isFeatured: Boolean(isFeatured),
        isPublished: isPublished !== false,
        genreIds
      });

      res.status(201).json({
        success: true,
        message: 'Series created successfully',
        data: series
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const series = await seriesService.updateSeries(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Series updated successfully',
        data: series
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to update series' });
    }
  }

  async deleteSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await seriesService.deleteSeries(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Series not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Series deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const seriesController = new SeriesController();

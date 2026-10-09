import { Request, Response, NextFunction } from 'express';
import { genreService } from '../services/genreService';

export class GenreController {
  async getGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const genres = await genreService.getGenres();
      res.status(200).json({ success: true, data: genres });
    } catch (error) {
      next(error);
    }
  }

  async getGenreBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const genre = await genreService.getGenreBySlug(slug);
      if (!genre) {
        res.status(404).json({ success: false, message: 'Genre not found' });
        return;
      }
      res.status(200).json({ success: true, data: genre });
    } catch (error) {
      next(error);
    }
  }

  async createGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'Genre name is required' });
        return;
      }
      const genre = await genreService.createGenre(name, slug);
      res.status(201).json({ success: true, message: 'Genre created successfully', data: genre });
    } catch (error) {
      next(error);
    }
  }

  async updateGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, slug } = req.body;
      const genre = await genreService.updateGenre(id, name, slug);
      res.status(200).json({ success: true, message: 'Genre updated successfully', data: genre });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to update genre' });
    }
  }

  async deleteGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await genreService.deleteGenre(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Genre not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Genre deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const genreController = new GenreController();

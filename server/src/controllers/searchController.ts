import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/searchService';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, genre } = req.query;
      const query = String(q || '');
      const results = await searchService.searchAll(query, genre ? String(genre) : undefined);
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();

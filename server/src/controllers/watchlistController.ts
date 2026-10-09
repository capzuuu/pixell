import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { watchlistService } from '../services/watchlistService';

export class WatchlistController {
  async getWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const list = await watchlistService.getWatchlist(req.user.userId);
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async addToWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { movieId, seriesId, tmdbId, mediaType, title, posterUrl, backdropUrl, rating, releaseYear } = req.body;
      const item = await watchlistService.addToWatchlist(req.user.userId, {
        movieId,
        seriesId,
        tmdbId,
        mediaType,
        title,
        posterUrl,
        backdropUrl,
        rating,
        releaseYear: releaseYear ? parseInt(String(releaseYear), 10) : undefined,
      });
      res.status(201).json({ success: true, message: 'Added to your watchlist', data: item });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to add to watchlist' });
    }
  }

  async removeFromWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      const removed = await watchlistService.removeFromWatchlist(req.user.userId, id);
      res.status(200).json({ success: true, message: 'Removed from watchlist', data: { removed } });
    } catch (error) {
      next(error);
    }
  }

  async checkStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(200).json({ success: true, inWatchlist: false });
        return;
      }
      const { id } = req.params;
      const inWatchlist = await watchlistService.isInWatchlist(req.user.userId, id);
      res.status(200).json({ success: true, inWatchlist });
    } catch (error) {
      next(error);
    }
  }
}

export const watchlistController = new WatchlistController();

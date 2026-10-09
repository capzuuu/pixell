import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { progressService } from '../services/progressService';

export class ProgressController {
  async getContinueWatching(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const list = await progressService.getContinueWatching(req.user.userId);
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async getProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { movieId, episodeId, tmdbId, seasonNumber, episodeNumber } = req.query;
      const progress = await progressService.getProgressForItem(req.user.userId, {
        movieId: movieId ? String(movieId) : undefined,
        episodeId: episodeId ? String(episodeId) : undefined,
        tmdbId: tmdbId ? String(tmdbId) : undefined,
        seasonNumber: seasonNumber ? parseInt(String(seasonNumber), 10) : undefined,
        episodeNumber: episodeNumber ? parseInt(String(episodeNumber), 10) : undefined,
      });
      res.status(200).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async saveProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const {
        movieId,
        episodeId,
        tmdbId,
        mediaType,
        title,
        posterUrl,
        backdropUrl,
        seasonNumber,
        episodeNumber,
        episodeTitle,
        progressSeconds,
        durationSeconds
      } = req.body;

      const progress = await progressService.saveProgress(
        req.user.userId,
        {
          movieId,
          episodeId,
          tmdbId,
          mediaType,
          title,
          posterUrl,
          backdropUrl,
          seasonNumber: seasonNumber ? parseInt(String(seasonNumber), 10) : undefined,
          episodeNumber: episodeNumber ? parseInt(String(episodeNumber), 10) : undefined,
          episodeTitle,
          progressSeconds: parseInt(progressSeconds || '0', 10),
          durationSeconds: parseInt(durationSeconds || '0', 10),
        }
      );

      res.status(200).json({
        success: true,
        message: 'Watch progress recorded',
        data: progress
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to save progress' });
    }
  }

  async clearProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      const cleared = await progressService.clearProgress(req.user.userId, id);
      res.status(200).json({ success: true, message: 'Progress cleared', data: { cleared } });
    } catch (error) {
      next(error);
    }
  }

  async stopLiveStream(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      await progressService.stopLiveStream(req.user.userId);
      res.status(200).json({ success: true, message: 'Live stream stopped' });
    } catch (error) {
      next(error);
    }
  }
}

export const progressController = new ProgressController();

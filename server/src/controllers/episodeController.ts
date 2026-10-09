import { Request, Response, NextFunction } from 'express';
import { episodeService } from '../services/episodeService';

export class EpisodeController {
  async getSeasonsBySeriesId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const seasons = await episodeService.getSeasonsBySeriesId(id);
      res.status(200).json({ success: true, data: seasons });
    } catch (error) {
      next(error);
    }
  }

  async getEpisodesBySeasonId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const episodes = await episodeService.getEpisodesBySeasonId(id);
      res.status(200).json({ success: true, data: episodes });
    } catch (error) {
      next(error);
    }
  }

  async getEpisodeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const episode = await episodeService.getEpisodeById(id);
      if (!episode) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }
      res.status(200).json({ success: true, data: episode });
    } catch (error) {
      next(error);
    }
  }

  async getNextEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nextEpisode = await episodeService.getNextEpisode(id);
      res.status(200).json({ success: true, data: nextEpisode });
    } catch (error) {
      next(error);
    }
  }

  async createSeason(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seriesId, seasonNumber, title } = req.body;
      if (!seriesId || !seasonNumber) {
        res.status(400).json({ success: false, message: 'Series ID and Season Number are required' });
        return;
      }

      const season = await episodeService.createSeason(
        seriesId,
        parseInt(seasonNumber, 10),
        title || `Season ${seasonNumber}`
      );

      res.status(201).json({ success: true, message: 'Season created successfully', data: season });
    } catch (error) {
      next(error);
    }
  }

  async updateSeason(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const season = await episodeService.updateSeason(id, req.body);
      res.status(200).json({ success: true, message: 'Season updated successfully', data: season });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to update season' });
    }
  }

  async deleteSeason(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await episodeService.deleteSeason(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Season not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Season deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId, title, description, episodeNumber, duration, thumbnailUrl, videoUrl, releaseDate } = req.body;

      if (!seasonId || !title || !thumbnailUrl || !videoUrl) {
        res.status(400).json({ success: false, message: 'seasonId, title, thumbnailUrl, and videoUrl are required' });
        return;
      }

      const episode = await episodeService.createEpisode(seasonId, {
        title,
        description,
        episodeNumber: parseInt(episodeNumber, 10) || 1,
        duration: parseInt(duration, 10) || 45,
        thumbnailUrl,
        videoUrl,
        releaseDate
      });

      res.status(201).json({ success: true, message: 'Episode created successfully', data: episode });
    } catch (error) {
      next(error);
    }
  }

  async updateEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const episode = await episodeService.updateEpisode(id, req.body);
      res.status(200).json({ success: true, message: 'Episode updated successfully', data: episode });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to update episode' });
    }
  }

  async deleteEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await episodeService.deleteEpisode(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Episode deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const episodeController = new EpisodeController();

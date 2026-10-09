import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { historyService } from '../services/historyService';

export class HistoryController {
  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const history = await historyService.getHistory(req.user.userId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async clearHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      const cleared = await historyService.clearHistory(req.user.userId, id);
      res.status(200).json({ success: true, message: 'Watch history cleared', data: { cleared } });
    } catch (error) {
      next(error);
    }
  }
}

export const historyController = new HistoryController();

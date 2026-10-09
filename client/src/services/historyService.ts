import { api } from './api';
import { WatchHistory } from '../types';

export const historyService = {
  getHistory: async (): Promise<{ success: boolean; data: WatchHistory[] }> => {
    return api.get('/history');
  },

  clearHistory: async (id?: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(id ? `/history/${id}` : '/history');
  }
};

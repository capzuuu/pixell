import { api } from './api';
import { WatchProgress } from '../types';

export interface SaveProgressPayload {
  movieId?: string;
  episodeId?: string;
  tmdbId?: number | string;
  mediaType?: 'movie' | 'tv';
  title?: string;
  posterUrl?: string;
  backdropUrl?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  progressSeconds: number;
  durationSeconds: number;
  isLive?: boolean;
}

export const progressService = {
  getContinueWatching: async (): Promise<{ success: boolean; data: WatchProgress[] }> => {
    return api.get('/progress');
  },

  getItemProgress: async (target: {
    movieId?: string;
    episodeId?: string;
    tmdbId?: number | string;
    seasonNumber?: number;
    episodeNumber?: number;
  }): Promise<{ success: boolean; data: WatchProgress | null }> => {
    return api.get('/progress/item', target);
  },

  saveProgress: async (payload: SaveProgressPayload): Promise<{ success: boolean; data: WatchProgress }> => {
    return api.post('/progress', payload);
  },

  stopLiveStream: async (): Promise<{ success: boolean; message: string }> => {
    return api.post('/progress/stop-stream');
  },

  clearProgress: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/progress/${id}`);
  }
};

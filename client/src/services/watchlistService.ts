import { api } from './api';
import { Watchlist } from '../types';

export interface AddWatchlistPayload {
  movieId?: string;
  seriesId?: string;
  tmdbId?: number | string;
  mediaType?: 'movie' | 'tv';
  title?: string;
  posterUrl?: string;
  backdropUrl?: string;
  rating?: string;
  releaseYear?: number;
}

export const watchlistService = {
  getWatchlist: async (): Promise<{ success: boolean; data: Watchlist[] }> => {
    return api.get('/watchlist');
  },

  addToWatchlist: async (payload: AddWatchlistPayload): Promise<{ success: boolean; data: Watchlist }> => {
    return api.post('/watchlist', payload);
  },

  removeFromWatchlist: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/watchlist/${id}`);
  },

  checkStatus: async (id: string): Promise<{ success: boolean; inWatchlist: boolean }> => {
    return api.get(`/watchlist/check/${id}`);
  }
};

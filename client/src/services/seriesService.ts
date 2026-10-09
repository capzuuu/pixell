import { api } from './api';
import { Series, Season } from '../types';

export const seriesService = {
  getSeries: async (params?: {
    genre?: string;
    year?: number;
    rating?: string;
    sort?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: Series[]; total: number }> => {
    return api.get('/series', params);
  },

  getFeatured: async (): Promise<{ success: boolean; data: Series[] }> => {
    return api.get('/series/featured');
  },

  getPopular: async (): Promise<{ success: boolean; data: Series[] }> => {
    return api.get('/series/popular');
  },

  getSeriesBySlugOrId: async (slugOrId: string): Promise<{ success: boolean; data: Series }> => {
    return api.get(`/series/${slugOrId}`);
  },

  getSimilar: async (id: string): Promise<{ success: boolean; data: Series[] }> => {
    return api.get(`/series/${id}/similar`);
  },

  getSeasons: async (seriesId: string): Promise<{ success: boolean; data: Season[] }> => {
    return api.get(`/series/${seriesId}/seasons`);
  },

  createSeries: async (data: Partial<Series> & { genreIds?: string[] }): Promise<{ success: boolean; data: Series }> => {
    return api.post('/series', data);
  },

  updateSeries: async (id: string, data: Partial<Series> & { genreIds?: string[] }): Promise<{ success: boolean; data: Series }> => {
    return api.put(`/series/${id}`, data);
  },

  deleteSeries: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/series/${id}`);
  }
};

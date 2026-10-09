import { api } from './api';
import { Episode, Season } from '../types';

export const episodeService = {
  getEpisodeById: async (id: string): Promise<{ success: boolean; data: Episode }> => {
    return api.get(`/episodes/${id}`);
  },

  getNextEpisode: async (id: string): Promise<{ success: boolean; data: Episode | null }> => {
    return api.get(`/episodes/${id}/next`);
  },

  getEpisodesBySeason: async (seasonId: string): Promise<{ success: boolean; data: Episode[] }> => {
    return api.get(`/episodes/season/${seasonId}/episodes`);
  },

  createSeason: async (seriesId: string, seasonNumber: number, title?: string): Promise<{ success: boolean; data: Season }> => {
    return api.post('/episodes/season', { seriesId, seasonNumber, title });
  },

  updateSeason: async (id: string, data: { seasonNumber?: number; title?: string }): Promise<{ success: boolean; data: Season }> => {
    return api.put(`/episodes/season/${id}`, data);
  },

  deleteSeason: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/episodes/season/${id}`);
  },

  createEpisode: async (data: Partial<Episode>): Promise<{ success: boolean; data: Episode }> => {
    return api.post('/episodes', data);
  },

  updateEpisode: async (id: string, data: Partial<Episode>): Promise<{ success: boolean; data: Episode }> => {
    return api.put(`/episodes/${id}`, data);
  },

  deleteEpisode: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/episodes/${id}`);
  }
};

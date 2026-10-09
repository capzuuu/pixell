import { api } from './api';
import { Genre } from '../types';

export const genreService = {
  getGenres: async (): Promise<{ success: boolean; data: Genre[] }> => {
    return api.get('/genres');
  },

  createGenre: async (name: string, slug?: string): Promise<{ success: boolean; data: Genre }> => {
    return api.post('/genres', { name, slug });
  },

  updateGenre: async (id: string, name: string, slug?: string): Promise<{ success: boolean; data: Genre }> => {
    return api.put(`/genres/${id}`, { name, slug });
  },

  deleteGenre: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/genres/${id}`);
  }
};

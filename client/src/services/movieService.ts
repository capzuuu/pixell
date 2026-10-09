import { api } from './api';
import { Movie } from '../types';

export const movieService = {
  getMovies: async (params?: {
    genre?: string;
    year?: number;
    rating?: string;
    sort?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: Movie[]; total: number }> => {
    return api.get('/movies', params);
  },

  getFeatured: async (): Promise<{ success: boolean; data: Movie[] }> => {
    return api.get('/movies/featured');
  },

  getPopular: async (): Promise<{ success: boolean; data: Movie[] }> => {
    return api.get('/movies/popular');
  },

  getMovieBySlugOrId: async (slugOrId: string): Promise<{ success: boolean; data: Movie }> => {
    return api.get(`/movies/${slugOrId}`);
  },

  getSimilar: async (id: string): Promise<{ success: boolean; data: Movie[] }> => {
    return api.get(`/movies/${id}/similar`);
  },

  createMovie: async (data: Partial<Movie> & { genreIds?: string[] }): Promise<{ success: boolean; data: Movie }> => {
    return api.post('/movies', data);
  },

  updateMovie: async (id: string, data: Partial<Movie> & { genreIds?: string[] }): Promise<{ success: boolean; data: Movie }> => {
    return api.put(`/movies/${id}`, data);
  },

  deleteMovie: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/movies/${id}`);
  }
};

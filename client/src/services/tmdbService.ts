import { api } from './api';
import { MediaItem, Movie, Series, Episode, Genre } from '../types';

export const tmdbService = {
  getFeatured: async (): Promise<{ success: boolean; data: MediaItem[] }> => {
    return api.get('/tmdb/featured');
  },

  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'week'): Promise<{ success: boolean; data: MediaItem[] }> => {
    return api.get(`/tmdb/trending/movies?timeWindow=${timeWindow}`);
  },

  getTrendingSeries: async (timeWindow: 'day' | 'week' = 'week'): Promise<{ success: boolean; data: MediaItem[] }> => {
    return api.get(`/tmdb/trending/series?timeWindow=${timeWindow}`);
  },

  getPopularMovies: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    return api.get(`/tmdb/popular/movies?page=${page}`);
  },

  getPopularSeries: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    return api.get(`/tmdb/popular/series?page=${page}`);
  },

  getTopRatedMovies: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    return api.get(`/tmdb/top-rated/movies?page=${page}`);
  },

  getTopRatedSeries: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    return api.get(`/tmdb/top-rated/series?page=${page}`);
  },

  getMovieGenres: async (): Promise<{ success: boolean; data: Genre[] }> => {
    return api.get('/tmdb/genres/movies');
  },

  getSeriesGenres: async (): Promise<{ success: boolean; data: Genre[] }> => {
    return api.get('/tmdb/genres/series');
  },

  discoverMovies: async (params: { genreId?: string | number; year?: number; sortBy?: string; page?: number }): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    return api.get('/tmdb/discover/movies', params);
  },

  discoverSeries: async (params: { genreId?: string | number; year?: number; sortBy?: string; page?: number }): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    return api.get('/tmdb/discover/series', params);
  },

  search: async (query: string, type: 'movie' | 'tv' | 'multi' = 'multi', page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    return api.get('/tmdb/search', { q: query, type, page });
  },

  getMovieDetails: async (tmdbId: number | string): Promise<{ success: boolean; data: Movie }> => {
    return api.get(`/tmdb/movie/${tmdbId}`);
  },

  getSeriesDetails: async (tmdbId: number | string): Promise<{ success: boolean; data: Series }> => {
    return api.get(`/tmdb/tv/${tmdbId}`);
  },

  getSeasonEpisodes: async (tmdbId: number | string, seasonNumber: number | string): Promise<{ success: boolean; data: Episode[] }> => {
    return api.get(`/tmdb/tv/${tmdbId}/season/${seasonNumber}`);
  },

  importMovie: async (tmdbId: number | string): Promise<{ success: boolean; message: string; data: Movie }> => {
    return api.post('/tmdb/import/movie', { tmdbId });
  },

  importSeries: async (tmdbId: number | string): Promise<{ success: boolean; message: string; data: Series }> => {
    return api.post('/tmdb/import/tv', { tmdbId });
  },

  seedTrending: async (): Promise<{ success: boolean; message: string; data: { importedCount: number } }> => {
    return api.post('/tmdb/seed-trending', {});
  },
};


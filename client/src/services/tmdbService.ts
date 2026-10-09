import { api } from './api';
import { MediaItem, Movie, Series, Episode, Genre } from '../types';
import { slugify } from '../utils/slugify';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';
const TMDB_TOKEN =
  import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN ||
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxODA2MGNlMGI2NDY5MTJiMzBkYzIxNzVhMjc5MTM0ZCIsIm5iZiI6MTc3ODgxNDg5NC42MDksInN1YiI6IjZhMDY4ZmFlNWM0YTUyOGNjZjgyNjVjMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aDKTcxalZVvhYa31cJRfzUqGy-oAMcS6SSRHufWDNNw';

// Direct TMDB Fetch Helper for standalone frontend deployments
async function fetchDirectTmdb<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.append(k, String(v));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`TMDB API Error (${res.status})`);
  }

  return res.json() as Promise<T>;
}

function mapTmdbMovie(m: any): MediaItem {
  return {
    id: String(m.id),
    tmdbId: m.id,
    mediaType: 'movie',
    title: m.title || m.original_title || 'Untitled',
    slug: slugify(m.title || `movie-${m.id}`),
    description: m.overview || '',
    posterUrl: m.poster_path ? `${IMAGE_BASE_W500}${m.poster_path}` : '',
    backdropUrl: m.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${m.backdrop_path}` : '',
    releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0], 10) : 2025,
    rating: m.vote_average ? `${m.vote_average.toFixed(1)}/10` : 'PG-13',
    voteAverage: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
    voteCount: m.vote_count || 0,
    videoUrl: `https://player.videasy.ws/embed/movie/${m.id}`,
  };
}

function mapTmdbSeries(s: any): MediaItem {
  return {
    id: String(s.id),
    tmdbId: s.id,
    mediaType: 'tv',
    title: s.name || s.original_name || 'Untitled',
    slug: slugify(s.name || `series-${s.id}`),
    description: s.overview || '',
    posterUrl: s.poster_path ? `${IMAGE_BASE_W500}${s.poster_path}` : '',
    backdropUrl: s.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${s.backdrop_path}` : '',
    releaseYear: s.first_air_date ? parseInt(s.first_air_date.split('-')[0], 10) : 2025,
    rating: s.vote_average ? `${s.vote_average.toFixed(1)}/10` : 'TV-MA',
    voteAverage: s.vote_average ? Number(s.vote_average.toFixed(1)) : 8.0,
    voteCount: s.vote_count || 0,
    videoUrl: `https://player.videasy.ws/embed/tv/${s.id}/1/1`,
  };
}

export const tmdbService = {
  getFeatured: async (): Promise<{ success: boolean; data: MediaItem[] }> => {
    try {
      const res = await api.get('/tmdb/featured');
      if (res.success && res.data?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb('/trending/all/day');
    return {
      success: true,
      data: (data.results || []).slice(0, 8).map((item: any) =>
        item.media_type === 'tv' ? mapTmdbSeries(item) : mapTmdbMovie(item)
      ),
    };
  },

  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'week'): Promise<{ success: boolean; data: MediaItem[] }> => {
    try {
      const res = await api.get(`/tmdb/trending/movies?timeWindow=${timeWindow}`);
      if (res.success && res.data?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb(`/trending/movie/${timeWindow}`);
    return {
      success: true,
      data: (data.results || []).map(mapTmdbMovie),
    };
  },

  getTrendingSeries: async (timeWindow: 'day' | 'week' = 'week'): Promise<{ success: boolean; data: MediaItem[] }> => {
    try {
      const res = await api.get(`/tmdb/trending/series?timeWindow=${timeWindow}`);
      if (res.success && res.data?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb(`/trending/tv/${timeWindow}`);
    return {
      success: true,
      data: (data.results || []).map(mapTmdbSeries),
    };
  },

  getPopularMovies: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    try {
      const res = await api.get(`/tmdb/popular/movies?page=${page}`);
      if (res.success && res.results?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb('/movie/popular', { page });
    return {
      success: true,
      results: (data.results || []).map(mapTmdbMovie),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
    };
  },

  getPopularSeries: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    try {
      const res = await api.get(`/tmdb/popular/series?page=${page}`);
      if (res.success && res.results?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb('/tv/popular', { page });
    return {
      success: true,
      results: (data.results || []).map(mapTmdbSeries),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
    };
  },

  getTopRatedMovies: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    try {
      const res = await api.get(`/tmdb/top-rated/movies?page=${page}`);
      if (res.success && res.results?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb('/movie/top_rated', { page });
    return {
      success: true,
      results: (data.results || []).map(mapTmdbMovie),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
    };
  },

  getTopRatedSeries: async (page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    try {
      const res = await api.get(`/tmdb/top-rated/series?page=${page}`);
      if (res.success && res.results?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb('/tv/top_rated', { page });
    return {
      success: true,
      results: (data.results || []).map(mapTmdbSeries),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
    };
  },

  getMovieGenres: async (): Promise<{ success: boolean; data: Genre[] }> => {
    try {
      const res = await api.get('/tmdb/genres/movies');
      if (res.success && res.data?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb('/genre/movie/list');
    return {
      success: true,
      data: (data.genres || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        slug: slugify(g.name),
      })),
    };
  },

  getSeriesGenres: async (): Promise<{ success: boolean; data: Genre[] }> => {
    try {
      const res = await api.get('/tmdb/genres/series');
      if (res.success && res.data?.length) return res;
    } catch {}
    const data = await fetchDirectTmdb('/genre/tv/list');
    return {
      success: true,
      data: (data.genres || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        slug: slugify(g.name),
      })),
    };
  },

  discoverMovies: async (params: { genreId?: string | number; year?: number; sortBy?: string; page?: number }): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    try {
      const res = await api.get('/tmdb/discover/movies', params);
      if (res.success && res.results?.length) return res;
    } catch {}
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      sort_by: params.sortBy || 'popularity.desc',
    };
    if (params.genreId) queryParams.with_genres = params.genreId;
    if (params.year) queryParams.primary_release_year = params.year;

    const data = await fetchDirectTmdb('/discover/movie', queryParams);
    return {
      success: true,
      results: (data.results || []).map(mapTmdbMovie),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
    };
  },

  discoverSeries: async (params: { genreId?: string | number; year?: number; sortBy?: string; page?: number }): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    try {
      const res = await api.get('/tmdb/discover/series', params);
      if (res.success && res.results?.length) return res;
    } catch {}
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      sort_by: params.sortBy || 'popularity.desc',
    };
    if (params.genreId) queryParams.with_genres = params.genreId;
    if (params.year) queryParams.first_air_date_year = params.year;

    const data = await fetchDirectTmdb('/discover/tv', queryParams);
    return {
      success: true,
      results: (data.results || []).map(mapTmdbSeries),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
    };
  },

  search: async (query: string, type: 'movie' | 'tv' | 'multi' = 'multi', page: number = 1): Promise<{ success: boolean; results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    try {
      const res = await api.get('/tmdb/search', { q: query, type, page });
      if (res.success && res.results?.length) return res;
    } catch {}
    const endpoint = type === 'movie' ? '/search/movie' : type === 'tv' ? '/search/tv' : '/search/multi';
    const data = await fetchDirectTmdb(endpoint, { query, page });
    const results = (data.results || [])
      .filter((r: any) => (r.media_type === 'movie' || r.media_type === 'tv' || !r.media_type) && (r.poster_path || r.backdrop_path))
      .map((item: any) => (item.media_type === 'tv' || Boolean(item.first_air_date) ? mapTmdbSeries(item) : mapTmdbMovie(item)));

    return {
      success: true,
      results,
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
    };
  },

  getMovieDetails: async (tmdbId: number | string): Promise<{ success: boolean; data: Movie }> => {
    try {
      const res = await api.get(`/tmdb/movie/${tmdbId}`);
      if (res.success && res.data) return res;
    } catch {}
    const m = await fetchDirectTmdb(`/movie/${tmdbId}`, { append_to_response: 'credits,videos,similar' });
    const trailer = m.videos?.results?.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    const movie: Movie = {
      id: String(m.id),
      tmdbId: m.id,
      mediaType: 'movie',
      title: m.title || m.original_title || 'Untitled',
      slug: slugify(m.title || `movie-${m.id}`),
      description: m.overview || '',
      posterUrl: m.poster_path ? `${IMAGE_BASE_W500}${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${m.backdrop_path}` : '',
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
      videoUrl: `https://player.videasy.ws/embed/movie/${m.id}`,
      releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0], 10) : 2025,
      rating: m.vote_average ? `${m.vote_average.toFixed(1)}/10` : 'PG-13',
      voteAverage: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
      voteCount: m.vote_count || 0,
      duration: m.runtime || 120,
      genres: (m.genres || []).map((g: any) => ({ id: g.id, name: g.name, slug: slugify(g.name) })),
      cast: (m.credits?.cast || []).slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profileUrl: c.profile_path ? `${IMAGE_BASE_W500}${c.profile_path}` : null,
      })),
      similar: (m.similar?.results || []).slice(0, 8).map(mapTmdbMovie),
    };
    return { success: true, data: movie };
  },

  getSeriesDetails: async (tmdbId: number | string): Promise<{ success: boolean; data: Series }> => {
    try {
      const res = await api.get(`/tmdb/tv/${tmdbId}`);
      if (res.success && res.data) return res;
    } catch {}
    const s = await fetchDirectTmdb(`/tv/${tmdbId}`, { append_to_response: 'credits,videos,similar' });
    const trailer = s.videos?.results?.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    const series: Series = {
      id: String(s.id),
      tmdbId: s.id,
      mediaType: 'tv',
      title: s.name || s.original_name || 'Untitled',
      slug: slugify(s.name || `series-${s.id}`),
      description: s.overview || '',
      posterUrl: s.poster_path ? `${IMAGE_BASE_W500}${s.poster_path}` : '',
      backdropUrl: s.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${s.backdrop_path}` : '',
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
      videoUrl: `https://player.videasy.ws/embed/tv/${s.id}/1/1`,
      releaseYear: s.first_air_date ? parseInt(s.first_air_date.split('-')[0], 10) : 2025,
      rating: s.vote_average ? `${s.vote_average.toFixed(1)}/10` : 'TV-MA',
      voteAverage: s.vote_average ? Number(s.vote_average.toFixed(1)) : 8.0,
      voteCount: s.vote_count || 0,
      numberOfSeasons: s.number_of_seasons || 1,
      numberOfEpisodes: s.number_of_episodes || 1,
      genres: (s.genres || []).map((g: any) => ({ id: g.id, name: g.name, slug: slugify(g.name) })),
      cast: (s.credits?.cast || []).slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profileUrl: c.profile_path ? `${IMAGE_BASE_W500}${c.profile_path}` : null,
      })),
      similar: (s.similar?.results || []).slice(0, 8).map(mapTmdbSeries),
    };
    return { success: true, data: series };
  },

  getSeasonEpisodes: async (tmdbId: number | string, seasonNumber: number | string): Promise<{ success: boolean; data: Episode[] }> => {
    try {
      const res = await api.get(`/tmdb/tv/${tmdbId}/season/${seasonNumber}`);
      if (res.success && res.data?.length) return res;
    } catch {}
    const seasonData = await fetchDirectTmdb(`/tv/${tmdbId}/season/${seasonNumber}`);
    const episodes: Episode[] = (seasonData.episodes || []).map((ep: any) => ({
      id: String(ep.id),
      tmdbId: ep.id,
      seasonId: String(seasonNumber),
      episodeNumber: ep.episode_number,
      title: ep.name || `Episode ${ep.episode_number}`,
      description: ep.overview || '',
      thumbnailUrl: ep.still_path ? `${IMAGE_BASE_W500}${ep.still_path}` : '',
      videoUrl: `https://player.videasy.ws/embed/tv/${tmdbId}/${seasonNumber}/${ep.episode_number}`,
      duration: ep.runtime || 45,
      releaseDate: ep.air_date || '',
    }));
    return { success: true, data: episodes };
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

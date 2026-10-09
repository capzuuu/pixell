export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  videoUrl: string;
  releaseYear: number;
  duration: number; // in minutes
  rating: string;
  language: string;
  country: string;
  isFeatured: boolean;
  isPublished: boolean;
  tmdbId?: number | string;
  imdbId?: string;
  streamType?: 'direct' | 'videasy' | 'vidsrc';
  createdAt: string;
  updatedAt: string;
  genres?: Genre[];
}

export interface Episode {
  id: string;
  seasonId: string;
  title: string;
  description: string;
  episodeNumber: number;
  duration: number; // in minutes
  thumbnailUrl: string;
  videoUrl: string;
  releaseDate?: string;
  tmdbId?: number | string;
  createdAt: string;
  updatedAt: string;
  seriesId?: string;
  seriesTitle?: string;
  seriesSlug?: string;
  seriesTmdbId?: number | string;
  seasonNumber?: number;
  seasonTitle?: string;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  tmdbId?: number | string;
  createdAt: string;
  updatedAt: string;
  episodes?: Episode[];
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  releaseYear: number;
  rating: string;
  language: string;
  country: string;
  isFeatured: boolean;
  isPublished: boolean;
  tmdbId?: number | string;
  imdbId?: string;
  createdAt: string;
  updatedAt: string;
  genres?: Genre[];
  seasons?: Season[];
}

export interface WatchProgress {
  id: string;
  userId: string;
  movieId?: string | null;
  episodeId?: string | null;
  tmdbId?: number | string | null;
  mediaType?: 'movie' | 'tv';
  title?: string;
  posterUrl?: string;
  backdropUrl?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
  movie?: Movie;
  episode?: Episode & { series?: Series; season?: Season };
}

export interface Watchlist {
  id: string;
  userId: string;
  movieId?: string | null;
  seriesId?: string | null;
  tmdbId?: number | string | null;
  mediaType?: 'movie' | 'tv';
  title?: string;
  posterUrl?: string;
  backdropUrl?: string;
  rating?: string;
  releaseYear?: number;
  createdAt: string;
  movie?: Movie;
  series?: Series;
}

export interface WatchHistory {
  id: string;
  userId: string;
  movieId?: string | null;
  episodeId?: string | null;
  tmdbId?: number | string | null;
  mediaType?: 'movie' | 'tv';
  title?: string;
  posterUrl?: string;
  backdropUrl?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  watchedAt: string;
  movie?: Movie;
  episode?: Episode & { series?: Series; season?: Season };
}

export interface StreamTelemetry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  itemTitle: string;
  mediaType: 'movie' | 'tv';
  tmdbId?: number | string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  posterUrl?: string;
  backdropUrl?: string;
  progressSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  isLive?: boolean;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalWatchActivity: number;
  activeWatchersCount: number;
  recentActivity: StreamTelemetry[];
}

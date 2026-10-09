export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface UserWithStats extends User {
  watchCount: number;
  watchlistCount: number;
  lastActive?: string;
}

export interface Genre {
  id: string | number;
  name: string;
  slug?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profileUrl?: string | null;
}

export interface MediaItem {
  id: string;
  tmdbId: number | string;
  mediaType: 'movie' | 'tv';
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  videoUrl?: string;
  releaseYear: number;
  rating?: string;
  voteAverage?: number;
  voteCount?: number;
  duration?: number;
  genres?: Genre[];
  cast?: CastMember[];
  director?: string;
  language?: string;
  country?: string;
  similar?: MediaItem[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: Season[];
}

export interface Movie extends MediaItem {
  mediaType: 'movie';
  duration: number; // minutes
  isFeatured?: boolean;
  isPublished?: boolean;
  streamType?: 'direct' | 'videasy' | 'vidsrc';
}

export interface Episode {
  id: string;
  seasonId?: string;
  title: string;
  description: string;
  episodeNumber: number;
  duration: number; // minutes
  thumbnailUrl: string;
  videoUrl: string;
  releaseDate?: string;
  tmdbId?: number | string;
  seriesTmdbId?: number | string;
  seriesId?: string;
  seriesTitle?: string;
  seriesSlug?: string;
  seasonNumber?: number;
  seasonTitle?: string;
  voteAverage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Season {
  id: string;
  seriesId?: string;
  seasonNumber: number;
  title: string;
  episodeCount?: number;
  posterUrl?: string | null;
  airDate?: string;
  tmdbId?: number | string;
  createdAt?: string;
  updatedAt?: string;
  episodes?: Episode[];
}

export interface Series extends MediaItem {
  mediaType: 'tv';
  isFeatured?: boolean;
  isPublished?: boolean;
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
  episode?: Episode;
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
  episode?: Episode;
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

export interface UserActivityDetails {
  user: User;
  continueWatching: WatchProgress[];
  watchHistory: WatchHistory[];
  watchlist: Watchlist[];
}

export interface SearchResults {
  query: string;
  movies: MediaItem[];
  series: MediaItem[];
  totalResults: number;
}

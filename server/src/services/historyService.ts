import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { WatchHistory } from '../models/types';
import { movieService } from './movieService';
import { episodeService } from './episodeService';

import { tmdbService } from './tmdbService';

export interface RecordHistoryPayload {
  userId: string;
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
}

export class HistoryService {
  async getHistory(userId: string): Promise<WatchHistory[]> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(
        'SELECT * FROM watch_history WHERE user_id = $1 ORDER BY watched_at DESC LIMIT 50',
        [userId]
      );

      const items: WatchHistory[] = [];
      for (const row of res.rows) {
        let movie = undefined;
        let episode = undefined;

        if (row.movie_id) {
          movie = (await movieService.getMovieById(row.movie_id)) || undefined;
        } else if (row.episode_id) {
          episode = (await episodeService.getEpisodeById(row.episode_id)) || undefined;
        }

        let poster = row.poster_url || movie?.posterUrl || episode?.thumbnailUrl;
        let backdrop = row.backdrop_url || movie?.backdropUrl;
        let itemTitle = row.title || movie?.title || episode?.title;

        if ((!poster || !backdrop) && row.tmdb_id) {
          try {
            const isTv = row.media_type === 'tv' || Boolean(row.season_number);
            if (isTv) {
              const tmdbData = await tmdbService.getSeriesDetails(row.tmdb_id).catch(() => null);
              if (tmdbData) {
                if (!poster) poster = tmdbData.posterUrl;
                if (!backdrop) backdrop = tmdbData.backdropUrl;
                if (!itemTitle) itemTitle = tmdbData.title;
              }
            } else {
              const tmdbData = await tmdbService.getMovieDetails(row.tmdb_id).catch(() => null);
              if (tmdbData) {
                if (!poster) poster = tmdbData.posterUrl;
                if (!backdrop) backdrop = tmdbData.backdropUrl;
                if (!itemTitle) itemTitle = tmdbData.title;
              }
            }
          } catch {}
        }

        items.push({
          id: row.id,
          userId: row.user_id,
          movieId: row.movie_id,
          episodeId: row.episode_id,
          tmdbId: row.tmdb_id,
          mediaType: row.media_type,
          title: itemTitle || 'Streaming Title',
          posterUrl: poster,
          backdropUrl: backdrop || poster,
          seasonNumber: row.season_number || episode?.seasonNumber,
          episodeNumber: row.episode_number || episode?.episodeNumber,
          episodeTitle: row.episode_title || episode?.title,
          watchedAt: row.watched_at,
          movie,
          episode
        });
      }
      return items;
    } else {
      const store = (adapter as any).getStore();
      const rows = store.watch_history.filter((h: any) => h.user_id === userId);

      const items: WatchHistory[] = [];
      for (const row of rows) {
        let movie = undefined;
        let episode = undefined;

        if (row.movie_id) {
          movie = (await movieService.getMovieById(row.movie_id)) || undefined;
        } else if (row.episode_id) {
          episode = (await episodeService.getEpisodeById(row.episode_id)) || undefined;
        }

        let poster = row.poster_url || movie?.posterUrl || episode?.thumbnailUrl;
        let backdrop = row.backdrop_url || movie?.backdropUrl;
        let itemTitle = row.title || movie?.title || episode?.title;

        if ((!poster || !backdrop) && row.tmdb_id) {
          try {
            const isTv = row.media_type === 'tv' || Boolean(row.season_number);
            if (isTv) {
              const tmdbData = await tmdbService.getSeriesDetails(row.tmdb_id).catch(() => null);
              if (tmdbData) {
                if (!poster) poster = tmdbData.posterUrl;
                if (!backdrop) backdrop = tmdbData.backdropUrl;
                if (!itemTitle) itemTitle = tmdbData.title;
              }
            } else {
              const tmdbData = await tmdbService.getMovieDetails(row.tmdb_id).catch(() => null);
              if (tmdbData) {
                if (!poster) poster = tmdbData.posterUrl;
                if (!backdrop) backdrop = tmdbData.backdropUrl;
                if (!itemTitle) itemTitle = tmdbData.title;
              }
            }
          } catch {}
        }

        items.push({
          id: row.id,
          userId: row.user_id,
          movieId: row.movie_id,
          episodeId: row.episode_id,
          tmdbId: row.tmdb_id,
          mediaType: row.media_type || (row.episode_id || row.season_number ? 'tv' : 'movie'),
          title: itemTitle || 'Streaming Title',
          posterUrl: poster,
          backdropUrl: backdrop || poster,
          seasonNumber: row.season_number || episode?.seasonNumber,
          episodeNumber: row.episode_number || episode?.episodeNumber,
          episodeTitle: row.episode_title || episode?.title,
          watchedAt: row.watched_at,
          movie,
          episode
        });
      }

      return items.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
    }
  }

  async recordHistory(payload: RecordHistoryPayload): Promise<void> {
    const adapter = await dbManager.getAdapter();
    const id = uuidv4();
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      if (payload.tmdbId) {
        if (payload.seasonNumber && payload.episodeNumber) {
          await adapter.query(
            'DELETE FROM watch_history WHERE user_id = $1 AND tmdb_id = $2 AND season_number = $3 AND episode_number = $4',
            [payload.userId, String(payload.tmdbId), payload.seasonNumber, payload.episodeNumber]
          );
        } else {
          await adapter.query(
            'DELETE FROM watch_history WHERE user_id = $1 AND tmdb_id = $2',
            [payload.userId, String(payload.tmdbId)]
          );
        }
      } else {
        const field = payload.movieId ? 'movie_id' : 'episode_id';
        const val = payload.movieId || payload.episodeId;
        await adapter.query(`DELETE FROM watch_history WHERE user_id = $1 AND ${field} = $2`, [payload.userId, val]);
      }

      await adapter.query(`
        INSERT INTO watch_history (
          id, user_id, movie_id, episode_id, tmdb_id, media_type, title, poster_url, backdrop_url,
          season_number, episode_number, episode_title, watched_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        id,
        payload.userId,
        payload.movieId || null,
        payload.episodeId || null,
        payload.tmdbId ? String(payload.tmdbId) : null,
        payload.mediaType || (payload.episodeId || payload.seasonNumber ? 'tv' : 'movie'),
        payload.title || null,
        payload.posterUrl || null,
        payload.backdropUrl || null,
        payload.seasonNumber || null,
        payload.episodeNumber || null,
        payload.episodeTitle || null,
        now
      ]);
    } else {
      const store = (adapter as any).getStore();
      store.watch_history = store.watch_history.filter((h: any) => {
        if (h.user_id !== payload.userId) return true;
        if (payload.tmdbId && String(h.tmdb_id) === String(payload.tmdbId)) {
          if (payload.seasonNumber && payload.episodeNumber) {
            return !(h.season_number === payload.seasonNumber && h.episode_number === payload.episodeNumber);
          }
          return false;
        }
        if (payload.movieId && h.movie_id === payload.movieId) return false;
        if (payload.episodeId && h.episode_id === payload.episodeId) return false;
        return true;
      });

      store.watch_history.push({
        id,
        user_id: payload.userId,
        movie_id: payload.movieId || null,
        episode_id: payload.episodeId || null,
        tmdb_id: payload.tmdbId ? String(payload.tmdbId) : null,
        media_type: payload.mediaType || (payload.episodeId || payload.seasonNumber ? 'tv' : 'movie'),
        title: payload.title || null,
        poster_url: payload.posterUrl || null,
        backdrop_url: payload.backdropUrl || null,
        season_number: payload.seasonNumber || null,
        episode_number: payload.episodeNumber || null,
        episode_title: payload.episodeTitle || null,
        watched_at: now
      });

      (adapter as any).saveStore();
    }
  }

  async clearHistory(userId: string, historyId?: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      if (historyId) {
        const res = await adapter.query('DELETE FROM watch_history WHERE user_id = $1 AND id = $2', [userId, historyId]);
        return res.rowCount > 0;
      } else {
        const res = await adapter.query('DELETE FROM watch_history WHERE user_id = $1', [userId]);
        return res.rowCount > 0;
      }
    } else {
      const store = (adapter as any).getStore();
      const initial = store.watch_history.length;
      if (historyId) {
        store.watch_history = store.watch_history.filter((h: any) => !(h.user_id === userId && h.id === historyId));
      } else {
        store.watch_history = store.watch_history.filter((h: any) => h.user_id !== userId);
      }
      (adapter as any).saveStore();
      return store.watch_history.length < initial;
    }
  }
}

export const historyService = new HistoryService();

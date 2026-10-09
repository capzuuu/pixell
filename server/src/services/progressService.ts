import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { WatchProgress } from '../models/types';
import { movieService } from './movieService';
import { episodeService } from './episodeService';
import { historyService } from './historyService';
import { getFirebaseRtdb } from '../config/firebase';

import { tmdbService } from './tmdbService';

export interface SaveProgressPayload {
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
  progressSeconds: number;
  durationSeconds: number;
  isLive?: boolean;
}

export class ProgressService {
  async getContinueWatching(userId: string): Promise<WatchProgress[]> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(`
        SELECT * FROM watch_progress
        WHERE user_id = $1 AND progress_seconds > 0 AND completed = FALSE
        ORDER BY updated_at DESC
        LIMIT 20
      `, [userId]);

      const items: WatchProgress[] = [];
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
          progressSeconds: row.progress_seconds,
          durationSeconds: row.duration_seconds,
          completed: Boolean(row.completed),
          updatedAt: row.updated_at,
          movie,
          episode
        });
      }
      return items;
    } else {
      const store = (adapter as any).getStore();
      const rows = store.watch_progress.filter((p: any) =>
        p.user_id === userId && p.progress_seconds > 0 && !p.completed
      );

      const items: WatchProgress[] = [];
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
          progressSeconds: row.progress_seconds,
          durationSeconds: row.duration_seconds,
          completed: Boolean(row.completed),
          updatedAt: row.updated_at,
          movie,
          episode
        });
      }

      return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  async getProgressForItem(
    userId: string,
    target: { movieId?: string; episodeId?: string; tmdbId?: number | string; seasonNumber?: number; episodeNumber?: number }
  ): Promise<WatchProgress | null> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      let query = 'SELECT * FROM watch_progress WHERE user_id = $1';
      const params: any[] = [userId];

      if (target.tmdbId) {
        query += ' AND tmdb_id = $2';
        params.push(String(target.tmdbId));
        if (target.seasonNumber && target.episodeNumber) {
          query += ' AND season_number = $3 AND episode_number = $4';
          params.push(target.seasonNumber, target.episodeNumber);
        }
      } else if (target.movieId) {
        query += ' AND movie_id = $2';
        params.push(target.movieId);
      } else if (target.episodeId) {
        query += ' AND episode_id = $2';
        params.push(target.episodeId);
      } else {
        return null;
      }

      query += ' LIMIT 1';
      const res = await adapter.query(query, params);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];

      return {
        id: row.id,
        userId: row.user_id,
        movieId: row.movie_id,
        episodeId: row.episode_id,
        tmdbId: row.tmdb_id,
        mediaType: row.media_type,
        title: row.title,
        posterUrl: row.poster_url,
        backdropUrl: row.backdrop_url,
        seasonNumber: row.season_number,
        episodeNumber: row.episode_number,
        episodeTitle: row.episode_title,
        progressSeconds: row.progress_seconds,
        durationSeconds: row.duration_seconds,
        completed: Boolean(row.completed),
        updatedAt: row.updated_at,
      };
    } else {
      const store = (adapter as any).getStore();
      const row = store.watch_progress.find((p: any) => {
        if (p.user_id !== userId) return false;
        if (target.tmdbId && String(p.tmdb_id) === String(target.tmdbId)) {
          if (target.seasonNumber && target.episodeNumber) {
            return p.season_number === target.seasonNumber && p.episode_number === target.episodeNumber;
          }
          return true;
        }
        if (target.movieId && p.movie_id === target.movieId) return true;
        if (target.episodeId && p.episode_id === target.episodeId) return true;
        return false;
      });

      if (!row) return null;
      return {
        id: row.id,
        userId: row.user_id,
        movieId: row.movie_id,
        episodeId: row.episode_id,
        tmdbId: row.tmdb_id,
        mediaType: row.media_type,
        title: row.title,
        posterUrl: row.poster_url,
        backdropUrl: row.backdrop_url,
        seasonNumber: row.season_number,
        episodeNumber: row.episode_number,
        episodeTitle: row.episode_title,
        progressSeconds: row.progress_seconds,
        durationSeconds: row.duration_seconds,
        completed: Boolean(row.completed),
        updatedAt: row.updated_at,
      };
    }
  }

  async saveProgress(userId: string, payload: SaveProgressPayload): Promise<WatchProgress> {
    const adapter = await dbManager.getAdapter();
    const id = uuidv4();
    const now = new Date().toISOString();
    const completed = payload.durationSeconds > 0 && (payload.progressSeconds / payload.durationSeconds) >= 0.95;

    // Record into history
    await historyService.recordHistory({
      userId,
      movieId: payload.movieId,
      episodeId: payload.episodeId,
      tmdbId: payload.tmdbId,
      mediaType: payload.mediaType || (payload.episodeId || payload.seasonNumber ? 'tv' : 'movie'),
      title: payload.title,
      posterUrl: payload.posterUrl,
      backdropUrl: payload.backdropUrl,
      seasonNumber: payload.seasonNumber,
      episodeNumber: payload.episodeNumber,
      episodeTitle: payload.episodeTitle,
    });

    if (adapter.isPostgres) {
      let existingRes;
      if (payload.tmdbId) {
        if (payload.seasonNumber && payload.episodeNumber) {
          existingRes = await adapter.query(
            'SELECT * FROM watch_progress WHERE user_id = $1 AND tmdb_id = $2 AND season_number = $3 AND episode_number = $4',
            [userId, String(payload.tmdbId), payload.seasonNumber, payload.episodeNumber]
          );
        } else {
          existingRes = await adapter.query(
            'SELECT * FROM watch_progress WHERE user_id = $1 AND tmdb_id = $2',
            [userId, String(payload.tmdbId)]
          );
        }
      } else {
        const field = payload.movieId ? 'movie_id' : 'episode_id';
        const val = payload.movieId || payload.episodeId;
        existingRes = await adapter.query(
          `SELECT * FROM watch_progress WHERE user_id = $1 AND ${field} = $2`,
          [userId, val]
        );
      }

      if (existingRes && existingRes.rows.length > 0) {
        const updateRes = await adapter.query(`
          UPDATE watch_progress SET
            progress_seconds = $1,
            duration_seconds = $2,
            completed = $3,
            updated_at = $4,
            title = COALESCE($5, title),
            poster_url = COALESCE($6, poster_url),
            backdrop_url = COALESCE($7, backdrop_url),
            season_number = COALESCE($8, season_number),
            episode_number = COALESCE($9, episode_number),
            episode_title = COALESCE($10, episode_title)
          WHERE id = $11
          RETURNING *
        `, [
          payload.progressSeconds,
          payload.durationSeconds,
          completed,
          now,
          payload.title || null,
          payload.posterUrl || null,
          payload.backdropUrl || null,
          payload.seasonNumber || null,
          payload.episodeNumber || null,
          payload.episodeTitle || null,
          existingRes.rows[0].id
        ]);

        const row = updateRes.rows[0];
        const result: WatchProgress = {
          id: row.id,
          userId: row.user_id,
          movieId: row.movie_id,
          episodeId: row.episode_id,
          tmdbId: row.tmdb_id,
          mediaType: row.media_type,
          title: row.title,
          posterUrl: row.poster_url,
          backdropUrl: row.backdrop_url,
          seasonNumber: row.season_number,
          episodeNumber: row.episode_number,
          episodeTitle: row.episode_title,
          progressSeconds: row.progress_seconds,
          durationSeconds: row.duration_seconds,
          completed: Boolean(row.completed),
          updatedAt: row.updated_at
        };
        this.syncLiveStreamRadar(userId, result, payload).catch(() => {});
        return result;
      } else {
        const insertRes = await adapter.query(`
          INSERT INTO watch_progress (
            id, user_id, movie_id, episode_id, tmdb_id, media_type, title, poster_url, backdrop_url,
            season_number, episode_number, episode_title, progress_seconds, duration_seconds, completed, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *
        `, [
          id,
          userId,
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
          payload.progressSeconds,
          payload.durationSeconds,
          completed,
          now
        ]);

        const row = insertRes.rows[0];
        const result: WatchProgress = {
          id: row.id,
          userId: row.user_id,
          movieId: row.movie_id,
          episodeId: row.episode_id,
          tmdbId: row.tmdb_id,
          mediaType: row.media_type,
          title: row.title,
          posterUrl: row.poster_url,
          backdropUrl: row.backdrop_url,
          seasonNumber: row.season_number,
          episodeNumber: row.episode_number,
          episodeTitle: row.episode_title,
          progressSeconds: row.progress_seconds,
          durationSeconds: row.duration_seconds,
          completed: Boolean(row.completed),
          updatedAt: row.updated_at
        };
        this.syncLiveStreamRadar(userId, result, payload).catch(() => {});
        return result;
      }
    } else {
      const store = (adapter as any).getStore();
      let row = store.watch_progress.find((p: any) => {
        if (p.user_id !== userId) return false;
        if (payload.tmdbId && String(p.tmdb_id) === String(payload.tmdbId)) {
          if (payload.seasonNumber && payload.episodeNumber) {
            return p.season_number === payload.seasonNumber && p.episode_number === payload.episodeNumber;
          }
          return true;
        }
        if (payload.movieId && p.movie_id === payload.movieId) return true;
        if (payload.episodeId && p.episode_id === payload.episodeId) return true;
        return false;
      });

      if (row) {
        row.progress_seconds = payload.progressSeconds;
        row.duration_seconds = payload.durationSeconds;
        row.completed = completed ? 1 : 0;
        row.updated_at = now;
        if (payload.title) row.title = payload.title;
        if (payload.posterUrl) row.poster_url = payload.posterUrl;
        if (payload.backdropUrl) row.backdrop_url = payload.backdropUrl;
        if (payload.seasonNumber) row.season_number = payload.seasonNumber;
        if (payload.episodeNumber) row.episode_number = payload.episodeNumber;
        if (payload.episodeTitle) row.episode_title = payload.episodeTitle;
      } else {
        row = {
          id,
          user_id: userId,
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
          progress_seconds: payload.progressSeconds,
          duration_seconds: payload.durationSeconds,
          completed: completed ? 1 : 0,
          updated_at: now
        };
        store.watch_progress.push(row);
      }

      (adapter as any).saveStore();

      const result: WatchProgress = {
        id: row.id,
        userId: row.user_id,
        movieId: row.movie_id,
        episodeId: row.episode_id,
        tmdbId: row.tmdb_id,
        mediaType: row.media_type,
        title: row.title,
        posterUrl: row.poster_url,
        backdropUrl: row.backdrop_url,
        seasonNumber: row.season_number,
        episodeNumber: row.episode_number,
        episodeTitle: row.episode_title,
        progressSeconds: row.progress_seconds,
        durationSeconds: row.duration_seconds,
        completed: Boolean(row.completed),
        updatedAt: row.updated_at
      };

      this.syncLiveStreamRadar(userId, result, payload).catch(() => {});
      return result;
    }
  }

  private async syncLiveStreamRadar(userId: string, item: WatchProgress, payload: SaveProgressPayload): Promise<void> {
    const rtdb = getFirebaseRtdb();
    if (!rtdb) return;

    try {
      // If client signaled playback stopped, or item is completed, remove stream from radar immediately
      if (payload.isLive === false || item.completed) {
        await rtdb.ref(`live_streams/${userId}`).remove().catch(() => {});
        return;
      }

      const adapter = await dbManager.getAdapter();
      let userName = 'Viewer';
      let userEmail = '';
      let userAvatar = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';

      if (adapter.isPostgres) {
        const uRes = await adapter.query('SELECT name, email, avatar FROM users WHERE id = $1', [userId]);
        if (uRes.rows[0]) {
          userName = uRes.rows[0].name || userName;
          userEmail = uRes.rows[0].email || userEmail;
          userAvatar = uRes.rows[0].avatar || userAvatar;
        }
      } else {
        const store = (adapter as any).getStore?.();
        const u = store?.users?.find((user: any) => user.id === userId);
        if (u) {
          userName = u.name || userName;
          userEmail = u.email || userEmail;
          userAvatar = u.avatar || userAvatar;
        }
      }

      const percentage = item.durationSeconds > 0
        ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
        : 0;

      let itemTitle = item.title || payload.title || 'Video Stream';
      if (item.seasonNumber && item.episodeNumber) {
        itemTitle = `${itemTitle} - S${item.seasonNumber}:E${item.episodeNumber} ${item.episodeTitle ? `(${item.episodeTitle})` : ''}`;
      }

      await rtdb.ref(`live_streams/${userId}`).set({
        id: userId,
        userId,
        userName,
        userEmail,
        userAvatar,
        itemTitle,
        mediaType: item.mediaType || 'movie',
        tmdbId: item.tmdbId ? String(item.tmdbId) : null,
        seasonNumber: item.seasonNumber || null,
        episodeNumber: item.episodeNumber || null,
        episodeTitle: item.episodeTitle || null,
        posterUrl: item.posterUrl || null,
        backdropUrl: item.backdropUrl || null,
        progressSeconds: item.progressSeconds,
        durationSeconds: item.durationSeconds,
        progressPercentage: percentage,
        isLive: true,
        updatedAt: item.updatedAt || new Date().toISOString()
      });
    } catch (err: any) {
      // Non-blocking telemetry sync
    }
  }

  async stopLiveStream(userId: string): Promise<void> {
    const rtdb = getFirebaseRtdb();
    if (rtdb) {
      await rtdb.ref(`live_streams/${userId}`).remove().catch(() => {});
    }
  }

  async clearProgress(userId: string, progressId: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(
        'DELETE FROM watch_progress WHERE user_id = $1 AND (id = $2 OR movie_id = $2 OR episode_id = $2 OR tmdb_id = $2)',
        [userId, progressId]
      );
      return res.rowCount > 0;
    } else {
      const store = (adapter as any).getStore();
      const initial = store.watch_progress.length;
      store.watch_progress = store.watch_progress.filter((p: any) =>
        !(p.user_id === userId && (p.id === progressId || p.movie_id === progressId || p.episode_id === progressId || String(p.tmdb_id) === String(progressId)))
      );
      (adapter as any).saveStore();
      return store.watch_progress.length < initial;
    }
  }
}

export const progressService = new ProgressService();

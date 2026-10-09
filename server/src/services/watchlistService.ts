import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { Watchlist } from '../models/types';
import { movieService } from './movieService';
import { seriesService } from './seriesService';

export interface AddWatchlistPayload {
  movieId?: string;
  seriesId?: string;
  tmdbId?: number | string;
  mediaType?: 'movie' | 'tv';
  title?: string;
  posterUrl?: string;
  backdropUrl?: string;
  rating?: string;
  releaseYear?: number;
}

export class WatchlistService {
  async getWatchlist(userId: string): Promise<Watchlist[]> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(
        'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      const items: Watchlist[] = [];
      for (const row of res.rows) {
        let movie = undefined;
        let series = undefined;
        if (row.movie_id) {
          movie = (await movieService.getMovieById(row.movie_id)) || undefined;
        } else if (row.series_id) {
          series = (await seriesService.getSeriesById(row.series_id)) || undefined;
        }
        items.push({
          id: row.id,
          userId: row.user_id,
          movieId: row.movie_id,
          seriesId: row.series_id,
          tmdbId: row.tmdb_id,
          mediaType: row.media_type || (row.series_id ? 'tv' : 'movie'),
          title: row.title || movie?.title || series?.title,
          posterUrl: row.poster_url || movie?.posterUrl || series?.posterUrl,
          backdropUrl: row.backdrop_url || movie?.backdropUrl || series?.backdropUrl,
          rating: row.rating || movie?.rating || series?.rating,
          releaseYear: row.release_year || movie?.releaseYear || series?.releaseYear,
          createdAt: row.created_at,
          movie,
          series
        });
      }
      return items;
    } else {
      const store = (adapter as any).getStore();
      const rows = store.watchlist.filter((w: any) => w.user_id === userId);
      const items: Watchlist[] = [];
      for (const row of rows) {
        let movie = undefined;
        let series = undefined;
        if (row.movie_id) {
          movie = (await movieService.getMovieById(row.movie_id)) || undefined;
        } else if (row.series_id) {
          series = (await seriesService.getSeriesById(row.series_id)) || undefined;
        }
        items.push({
          id: row.id,
          userId: row.user_id,
          movieId: row.movie_id,
          seriesId: row.series_id,
          tmdbId: row.tmdb_id,
          mediaType: row.media_type || (row.series_id ? 'tv' : 'movie'),
          title: row.title || movie?.title || series?.title,
          posterUrl: row.poster_url || movie?.posterUrl || series?.posterUrl,
          backdropUrl: row.backdrop_url || movie?.backdropUrl || series?.backdropUrl,
          rating: row.rating || movie?.rating || series?.rating,
          releaseYear: row.release_year || movie?.releaseYear || series?.releaseYear,
          createdAt: row.created_at,
          movie,
          series
        });
      }
      return items.reverse();
    }
  }

  async addToWatchlist(userId: string, target: AddWatchlistPayload): Promise<Watchlist> {
    const adapter = await dbManager.getAdapter();
    const id = uuidv4();
    const now = new Date().toISOString();

    if (!target.movieId && !target.seriesId && !target.tmdbId) {
      throw new Error('Either tmdbId, movieId or seriesId must be specified');
    }

    if (adapter.isPostgres) {
      let checkSql = 'SELECT * FROM watchlist WHERE user_id = $1 AND ';
      let checkParam: any;
      if (target.tmdbId) {
        checkSql += 'tmdb_id = $2';
        checkParam = String(target.tmdbId);
      } else if (target.movieId) {
        checkSql += 'movie_id = $2';
        checkParam = target.movieId;
      } else {
        checkSql += 'series_id = $2';
        checkParam = target.seriesId;
      }

      const existing = await adapter.query(checkSql, [userId, checkParam]);

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          movieId: row.movie_id,
          seriesId: row.series_id,
          tmdbId: row.tmdb_id,
          mediaType: row.media_type,
          title: row.title,
          posterUrl: row.poster_url,
          backdropUrl: row.backdrop_url,
          rating: row.rating,
          releaseYear: row.release_year,
          createdAt: row.created_at,
        };
      }

      await adapter.query(`
        INSERT INTO watchlist (id, user_id, movie_id, series_id, tmdb_id, media_type, title, poster_url, backdrop_url, rating, release_year, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        id,
        userId,
        target.movieId || null,
        target.seriesId || null,
        target.tmdbId ? String(target.tmdbId) : null,
        target.mediaType || (target.seriesId ? 'tv' : 'movie'),
        target.title || null,
        target.posterUrl || null,
        target.backdropUrl || null,
        target.rating || null,
        target.releaseYear || null,
        now
      ]);

      return {
        id,
        userId,
        movieId: target.movieId || null,
        seriesId: target.seriesId || null,
        tmdbId: target.tmdbId ? String(target.tmdbId) : null,
        mediaType: target.mediaType || (target.seriesId ? 'tv' : 'movie'),
        title: target.title,
        posterUrl: target.posterUrl,
        backdropUrl: target.backdropUrl,
        rating: target.rating,
        releaseYear: target.releaseYear,
        createdAt: now,
      };
    } else {
      const store = (adapter as any).getStore();
      const existing = store.watchlist.find((w: any) =>
        w.user_id === userId &&
        ((target.tmdbId && String(w.tmdb_id) === String(target.tmdbId)) ||
         (target.movieId && w.movie_id === target.movieId) ||
         (target.seriesId && w.series_id === target.seriesId))
      );

      if (existing) {
        return {
          id: existing.id,
          userId: existing.user_id,
          movieId: existing.movie_id,
          seriesId: existing.series_id,
          tmdbId: existing.tmdb_id,
          mediaType: existing.media_type,
          title: existing.title,
          posterUrl: existing.poster_url,
          backdropUrl: existing.backdrop_url,
          rating: existing.rating,
          releaseYear: existing.release_year,
          createdAt: existing.created_at,
        };
      }

      const item = {
        id,
        user_id: userId,
        movie_id: target.movieId || null,
        series_id: target.seriesId || null,
        tmdb_id: target.tmdbId ? String(target.tmdbId) : null,
        media_type: target.mediaType || (target.seriesId ? 'tv' : 'movie'),
        title: target.title || null,
        poster_url: target.posterUrl || null,
        backdrop_url: target.backdropUrl || null,
        rating: target.rating || null,
        release_year: target.releaseYear || null,
        created_at: now
      };
      store.watchlist.push(item);
      (adapter as any).saveStore();

      return {
        id,
        userId,
        movieId: item.movie_id,
        seriesId: item.series_id,
        tmdbId: item.tmdb_id,
        mediaType: item.media_type as any,
        title: item.title || undefined,
        posterUrl: item.poster_url || undefined,
        backdropUrl: item.backdrop_url || undefined,
        rating: item.rating || undefined,
        releaseYear: item.release_year || undefined,
        createdAt: now,
      };
    }
  }

  async removeFromWatchlist(userId: string, targetId: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(
        'DELETE FROM watchlist WHERE user_id = $1 AND (id = $2 OR movie_id = $2 OR series_id = $2 OR tmdb_id = $2)',
        [userId, targetId]
      );
      return res.rowCount > 0;
    } else {
      const store = (adapter as any).getStore();
      const initial = store.watchlist.length;
      store.watchlist = store.watchlist.filter((w: any) =>
        !(w.user_id === userId && (w.id === targetId || w.movie_id === targetId || w.series_id === targetId || String(w.tmdb_id) === String(targetId)))
      );
      (adapter as any).saveStore();
      return store.watchlist.length < initial;
    }
  }

  async isInWatchlist(userId: string, targetId: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(
        'SELECT 1 FROM watchlist WHERE user_id = $1 AND (movie_id = $2 OR series_id = $2 OR id = $2 OR tmdb_id = $2) LIMIT 1',
        [userId, targetId]
      );
      return res.rows.length > 0;
    } else {
      const store = (adapter as any).getStore();
      return store.watchlist.some((w: any) =>
        w.user_id === userId && (w.movie_id === targetId || w.series_id === targetId || w.id === targetId || String(w.tmdb_id) === String(targetId))
      );
    }
  }
}

export const watchlistService = new WatchlistService();

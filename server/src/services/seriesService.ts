import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { Series, Genre, Season } from '../models/types';
import { slugify } from '../utils/slugify';

export interface SeriesFilters {
  genre?: string;
  year?: number;
  rating?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'rating' | 'title';
  search?: string;
  limit?: number;
  offset?: number;
  isPublished?: boolean;
}

export class SeriesService {
  private mapDbSeries(s: any, genres: Genre[] = [], seasons: Season[] = []): Series {
    return {
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description || '',
      posterUrl: s.poster_url || s.posterUrl,
      backdropUrl: s.backdrop_url || s.backdropUrl,
      trailerUrl: s.trailer_url || s.trailerUrl || undefined,
      releaseYear: parseInt(s.release_year || s.releaseYear, 10),
      rating: s.rating || 'TV-MA',
      language: s.language || 'English',
      country: s.country || 'United States',
      isFeatured: Boolean(s.is_featured ?? s.isFeatured),
      isPublished: Boolean(s.is_published ?? s.isPublished),
      createdAt: s.created_at || s.createdAt,
      updatedAt: s.updated_at || s.updatedAt,
      genres,
      seasons
    };
  }

  async getSeriesList(filters: SeriesFilters = {}): Promise<{ series: Series[]; total: number }> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      let query = `
        SELECT s.*, 
          COALESCE(
            json_agg(
              json_build_object('id', g.id, 'name', g.name, 'slug', g.slug)
            ) FILTER (WHERE g.id IS NOT NULL), '[]'
          ) as genres
        FROM series s
        LEFT JOIN series_genres sg ON s.id = sg.series_id
        LEFT JOIN genres g ON sg.genre_id = g.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIdx = 1;

      if (filters.isPublished !== undefined) {
        query += ` AND s.is_published = $${paramIdx++}`;
        params.push(filters.isPublished);
      }

      if (filters.genre) {
        query += ` AND s.id IN (
          SELECT sg2.series_id FROM series_genres sg2 
          JOIN genres g2 ON sg2.genre_id = g2.id 
          WHERE g2.slug = $${paramIdx++} OR g2.id = $${paramIdx - 1}
        )`;
        params.push(filters.genre);
      }

      if (filters.year) {
        query += ` AND s.release_year = $${paramIdx++}`;
        params.push(filters.year);
      }

      if (filters.rating) {
        query += ` AND s.rating = $${paramIdx++}`;
        params.push(filters.rating);
      }

      if (filters.search) {
        query += ` AND (LOWER(s.title) LIKE $${paramIdx++} OR LOWER(s.description) LIKE $${paramIdx - 1})`;
        params.push(`%${filters.search.toLowerCase()}%`);
      }

      query += ` GROUP BY s.id`;

      if (filters.sort === 'newest') query += ` ORDER BY s.release_year DESC, s.created_at DESC`;
      else if (filters.sort === 'oldest') query += ` ORDER BY s.release_year ASC`;
      else if (filters.sort === 'title') query += ` ORDER BY s.title ASC`;
      else query += ` ORDER BY s.is_featured DESC, s.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT $${paramIdx++}`;
        params.push(filters.limit);
      }
      if (filters.offset) {
        query += ` OFFSET $${paramIdx++}`;
        params.push(filters.offset);
      }

      const res = await adapter.query(query, params);
      const series = res.rows.map(r => this.mapDbSeries(r, r.genres));
      return { series, total: series.length };
    } else {
      const store = (adapter as any).getStore();
      let seriesList = [...store.series];

      if (filters.isPublished !== undefined) {
        seriesList = seriesList.filter(s => Boolean(s.is_published) === filters.isPublished);
      }

      if (filters.genre) {
        const matchingGenre = store.genres.find((g: any) => g.slug === filters.genre || g.id === filters.genre);
        if (matchingGenre) {
          const seriesIds = store.series_genres.filter((sg: any) => sg.genre_id === matchingGenre.id).map((sg: any) => sg.series_id);
          seriesList = seriesList.filter(s => seriesIds.includes(s.id));
        }
      }

      if (filters.year) {
        seriesList = seriesList.filter(s => s.release_year === filters.year);
      }

      if (filters.rating) {
        seriesList = seriesList.filter(s => s.rating === filters.rating);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        seriesList = seriesList.filter(s => s.title.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)));
      }

      if (filters.sort === 'newest') seriesList.sort((a, b) => b.release_year - a.release_year);
      else if (filters.sort === 'oldest') seriesList.sort((a, b) => a.release_year - b.release_year);
      else if (filters.sort === 'title') seriesList.sort((a, b) => a.title.localeCompare(b.title));
      else seriesList.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));

      const total = seriesList.length;
      if (filters.offset) seriesList = seriesList.slice(filters.offset);
      if (filters.limit) seriesList = seriesList.slice(0, filters.limit);

      const enriched = seriesList.map(s => {
        const genreLinks = store.series_genres.filter((sg: any) => sg.series_id === s.id);
        const genres = genreLinks.map((sg: any) => store.genres.find((g: any) => g.id === sg.genre_id)).filter(Boolean);
        return this.mapDbSeries(s, genres);
      });

      return { series: enriched, total };
    }
  }

  async getFeaturedSeries(): Promise<Series[]> {
    const { series } = await this.getSeriesList({ isPublished: true, limit: 10 });
    return series.filter(s => s.isFeatured);
  }

  async getPopularSeries(): Promise<Series[]> {
    const { series } = await this.getSeriesList({ isPublished: true, limit: 10 });
    return series;
  }

  async getSeriesBySlug(slug: string): Promise<Series | null> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const seriesRes = await adapter.query(`
        SELECT s.*, 
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', g.id, 'name', g.name, 'slug', g.slug)
            ) FILTER (WHERE g.id IS NOT NULL), '[]'
          ) as genres
        FROM series s
        LEFT JOIN series_genres sg ON s.id = sg.series_id
        LEFT JOIN genres g ON sg.genre_id = g.id
        WHERE s.slug = $1 OR s.id = $1
        GROUP BY s.id
      `, [slug]);

      if (seriesRes.rows.length === 0) return null;
      const s = seriesRes.rows[0];

      // Fetch seasons and episodes
      const seasonsRes = await adapter.query(`
        SELECT sea.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', ep.id,
                'seasonId', ep.season_id,
                'title', ep.title,
                'description', ep.description,
                'episodeNumber', ep.episode_number,
                'duration', ep.duration,
                'thumbnailUrl', ep.thumbnail_url,
                'videoUrl', ep.video_url,
                'releaseDate', ep.release_date,
                'createdAt', ep.created_at,
                'updatedAt', ep.updated_at
              ) ORDER BY ep.episode_number ASC
            ) FILTER (WHERE ep.id IS NOT NULL), '[]'
          ) as episodes
        FROM seasons sea
        LEFT JOIN episodes ep ON sea.id = ep.season_id
        WHERE sea.series_id = $1
        GROUP BY sea.id
        ORDER BY sea.season_number ASC
      `, [s.id]);

      const seasons = seasonsRes.rows.map(sea => ({
        id: sea.id,
        seriesId: sea.series_id,
        seasonNumber: sea.season_number,
        title: sea.title,
        createdAt: sea.created_at,
        updatedAt: sea.updated_at,
        episodes: sea.episodes
      }));

      return this.mapDbSeries(s, s.genres, seasons);
    } else {
      const store = (adapter as any).getStore();
      const s = store.series.find((item: any) => item.slug === slug || item.id === slug);
      if (!s) return null;

      const genreLinks = store.series_genres.filter((sg: any) => sg.series_id === s.id);
      const genres = genreLinks.map((sg: any) => store.genres.find((g: any) => g.id === sg.genre_id)).filter(Boolean);

      const seriesSeasons = store.seasons
        .filter((sea: any) => sea.series_id === s.id)
        .sort((a: any, b: any) => a.season_number - b.season_number);

      const seasons: Season[] = seriesSeasons.map((sea: any) => {
        const episodes = store.episodes
          .filter((ep: any) => ep.season_id === sea.id)
          .sort((a: any, b: any) => a.episode_number - b.episode_number)
          .map((ep: any) => ({
            id: ep.id,
            seasonId: ep.season_id,
            title: ep.title,
            description: ep.description || '',
            episodeNumber: ep.episode_number,
            duration: ep.duration,
            thumbnailUrl: ep.thumbnail_url,
            videoUrl: ep.video_url,
            releaseDate: ep.release_date,
            createdAt: ep.created_at,
            updatedAt: ep.updated_at
          }));

        return {
          id: sea.id,
          seriesId: sea.series_id,
          seasonNumber: sea.season_number,
          title: sea.title,
          createdAt: sea.created_at,
          updatedAt: sea.updated_at,
          episodes
        };
      });

      return this.mapDbSeries(s, genres, seasons);
    }
  }

  async getSeriesById(id: string): Promise<Series | null> {
    return this.getSeriesBySlug(id);
  }

  async createSeries(data: Partial<Series> & { genreIds?: string[] }): Promise<Series> {
    const adapter = await dbManager.getAdapter();
    const id = uuidv4();
    const slug = data.slug ? slugify(data.slug) : slugify(data.title || `series-${Date.now()}`);
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      await adapter.query(`
        INSERT INTO series (id, title, slug, description, poster_url, backdrop_url, trailer_url, release_year, rating, language, country, is_featured, is_published, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        id,
        data.title,
        slug,
        data.description || '',
        data.posterUrl,
        data.backdropUrl,
        data.trailerUrl || null,
        data.releaseYear || new Date().getFullYear(),
        data.rating || 'TV-MA',
        data.language || 'English',
        data.country || 'United States',
        data.isFeatured || false,
        data.isPublished !== undefined ? data.isPublished : true,
        now,
        now
      ]);

      if (data.genreIds && data.genreIds.length > 0) {
        for (const gid of data.genreIds) {
          await adapter.query('INSERT INTO series_genres (series_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, gid]);
        }
      }

      return (await this.getSeriesById(id))!;
    } else {
      const store = (adapter as any).getStore();
      const newSeries = {
        id,
        title: data.title,
        slug,
        description: data.description || '',
        poster_url: data.posterUrl,
        backdrop_url: data.backdropUrl,
        trailer_url: data.trailerUrl || '',
        release_year: data.releaseYear || new Date().getFullYear(),
        rating: data.rating || 'TV-MA',
        language: data.language || 'English',
        country: data.country || 'United States',
        is_featured: data.isFeatured ? 1 : 0,
        is_published: data.isPublished !== false ? 1 : 0,
        created_at: now,
        updated_at: now
      };

      store.series.push(newSeries);
      if (data.genreIds) {
        for (const gid of data.genreIds) {
          store.series_genres.push({ series_id: id, genre_id: gid });
        }
      }
      (adapter as any).saveStore();

      return (await this.getSeriesById(id))!;
    }
  }

  async updateSeries(id: string, data: Partial<Series> & { genreIds?: string[] }): Promise<Series> {
    const adapter = await dbManager.getAdapter();
    const existing = await this.getSeriesById(id);
    if (!existing) throw new Error('Series not found');

    const slug = data.slug ? slugify(data.slug) : (data.title ? slugify(data.title) : existing.slug);
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      await adapter.query(`
        UPDATE series SET
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          poster_url = COALESCE($4, poster_url),
          backdrop_url = COALESCE($5, backdrop_url),
          trailer_url = COALESCE($6, trailer_url),
          release_year = COALESCE($7, release_year),
          rating = COALESCE($8, rating),
          language = COALESCE($9, language),
          country = COALESCE($10, country),
          is_featured = COALESCE($11, is_featured),
          is_published = COALESCE($12, is_published),
          updated_at = $13
        WHERE id = $14
      `, [
        data.title,
        slug,
        data.description,
        data.posterUrl,
        data.backdropUrl,
        data.trailerUrl,
        data.releaseYear,
        data.rating,
        data.language,
        data.country,
        data.isFeatured,
        data.isPublished,
        now,
        id
      ]);

      if (data.genreIds) {
        await adapter.query('DELETE FROM series_genres WHERE series_id = $1', [id]);
        for (const gid of data.genreIds) {
          await adapter.query('INSERT INTO series_genres (series_id, genre_id) VALUES ($1, $2)', [id, gid]);
        }
      }

      return (await this.getSeriesById(id))!;
    } else {
      const store = (adapter as any).getStore();
      const s = store.series.find((item: any) => item.id === id);
      if (!s) throw new Error('Series not found');

      if (data.title !== undefined) s.title = data.title;
      if (slug) s.slug = slug;
      if (data.description !== undefined) s.description = data.description;
      if (data.posterUrl !== undefined) s.poster_url = data.posterUrl;
      if (data.backdropUrl !== undefined) s.backdrop_url = data.backdropUrl;
      if (data.trailerUrl !== undefined) s.trailer_url = data.trailerUrl;
      if (data.releaseYear !== undefined) s.release_year = data.releaseYear;
      if (data.rating !== undefined) s.rating = data.rating;
      if (data.language !== undefined) s.language = data.language;
      if (data.country !== undefined) s.country = data.country;
      if (data.isFeatured !== undefined) s.is_featured = data.isFeatured ? 1 : 0;
      if (data.isPublished !== undefined) s.is_published = data.isPublished ? 1 : 0;
      s.updated_at = now;

      if (data.genreIds) {
        store.series_genres = store.series_genres.filter((sg: any) => sg.series_id !== id);
        for (const gid of data.genreIds) {
          store.series_genres.push({ series_id: id, genre_id: gid });
        }
      }

      (adapter as any).saveStore();
      return (await this.getSeriesById(id))!;
    }
  }

  async deleteSeries(id: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query('DELETE FROM series WHERE id = $1', [id]);
      return res.rowCount > 0;
    } else {
      const store = (adapter as any).getStore();
      const initial = store.series.length;
      store.series = store.series.filter((s: any) => s.id !== id);
      store.series_genres = store.series_genres.filter((sg: any) => sg.series_id !== id);
      store.watchlist = store.watchlist.filter((w: any) => w.series_id !== id);

      const seasonIds = store.seasons.filter((sea: any) => sea.series_id === id).map((sea: any) => sea.id);
      store.seasons = store.seasons.filter((sea: any) => sea.series_id !== id);
      const episodeIds = store.episodes.filter((ep: any) => seasonIds.includes(ep.season_id)).map((ep: any) => ep.id);
      store.episodes = store.episodes.filter((ep: any) => !seasonIds.includes(ep.season_id));
      store.watch_progress = store.watch_progress.filter((p: any) => !episodeIds.includes(p.episode_id));
      store.watch_history = store.watch_history.filter((h: any) => !episodeIds.includes(h.episode_id));

      (adapter as any).saveStore();
      return store.series.length < initial;
    }
  }

  async getSimilarSeries(seriesId: string): Promise<Series[]> {
    const series = await this.getSeriesById(seriesId);
    if (!series || !series.genres || series.genres.length === 0) {
      const { series: all } = await this.getSeriesList({ isPublished: true, limit: 6 });
      return all.filter(s => s.id !== seriesId);
    }

    const firstGenre = series.genres[0].slug;
    const { series: matched } = await this.getSeriesList({ genre: firstGenre, isPublished: true, limit: 8 });
    return matched.filter(s => s.id !== seriesId);
  }
}

export const seriesService = new SeriesService();

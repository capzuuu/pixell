import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/db';
import { Movie, Genre } from '../models/types';
import { slugify } from '../utils/slugify';

export interface MovieFilters {
  genre?: string;
  year?: number;
  rating?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'rating' | 'title';
  search?: string;
  limit?: number;
  offset?: number;
  isPublished?: boolean;
}

export class MovieService {
  private mapDbMovie(m: any, genres: Genre[] = []): Movie {
    return {
      id: m.id,
      title: m.title,
      slug: m.slug,
      description: m.description || '',
      posterUrl: m.poster_url || m.posterUrl,
      backdropUrl: m.backdrop_url || m.backdropUrl,
      trailerUrl: m.trailer_url || m.trailerUrl || undefined,
      videoUrl: m.video_url || m.videoUrl,
      releaseYear: parseInt(m.release_year || m.releaseYear, 10),
      duration: parseInt(m.duration, 10),
      rating: m.rating || 'PG-13',
      language: m.language || 'English',
      country: m.country || 'United States',
      isFeatured: Boolean(m.is_featured ?? m.isFeatured),
      isPublished: Boolean(m.is_published ?? m.isPublished),
      createdAt: m.created_at || m.createdAt,
      updatedAt: m.updated_at || m.updatedAt,
      genres
    };
  }

  async getMovies(filters: MovieFilters = {}): Promise<{ movies: Movie[]; total: number }> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      let query = `
        SELECT m.*, 
          COALESCE(
            json_agg(
              json_build_object('id', g.id, 'name', g.name, 'slug', g.slug)
            ) FILTER (WHERE g.id IS NOT NULL), '[]'
          ) as genres
        FROM movies m
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIdx = 1;

      if (filters.isPublished !== undefined) {
        query += ` AND m.is_published = $${paramIdx++}`;
        params.push(filters.isPublished);
      }

      if (filters.genre) {
        query += ` AND m.id IN (
          SELECT mg2.movie_id FROM movie_genres mg2 
          JOIN genres g2 ON mg2.genre_id = g2.id 
          WHERE g2.slug = $${paramIdx++} OR g2.id = $${paramIdx - 1}
        )`;
        params.push(filters.genre);
      }

      if (filters.year) {
        query += ` AND m.release_year = $${paramIdx++}`;
        params.push(filters.year);
      }

      if (filters.rating) {
        query += ` AND m.rating = $${paramIdx++}`;
        params.push(filters.rating);
      }

      if (filters.search) {
        query += ` AND (LOWER(m.title) LIKE $${paramIdx++} OR LOWER(m.description) LIKE $${paramIdx - 1})`;
        params.push(`%${filters.search.toLowerCase()}%`);
      }

      query += ` GROUP BY m.id`;

      if (filters.sort === 'newest') query += ` ORDER BY m.release_year DESC, m.created_at DESC`;
      else if (filters.sort === 'oldest') query += ` ORDER BY m.release_year ASC`;
      else if (filters.sort === 'rating') query += ` ORDER BY m.rating DESC`;
      else if (filters.sort === 'title') query += ` ORDER BY m.title ASC`;
      else query += ` ORDER BY m.is_featured DESC, m.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT $${paramIdx++}`;
        params.push(filters.limit);
      }
      if (filters.offset) {
        query += ` OFFSET $${paramIdx++}`;
        params.push(filters.offset);
      }

      const res = await adapter.query(query, params);
      const movies = res.rows.map(r => this.mapDbMovie(r, r.genres));
      return { movies, total: movies.length };
    } else {
      const store = (adapter as any).getStore();
      let movies = [...store.movies];

      if (filters.isPublished !== undefined) {
        movies = movies.filter(m => Boolean(m.is_published) === filters.isPublished);
      }

      if (filters.genre) {
        const matchingGenre = store.genres.find((g: any) => g.slug === filters.genre || g.id === filters.genre);
        if (matchingGenre) {
          const movieIds = store.movie_genres.filter((mg: any) => mg.genre_id === matchingGenre.id).map((mg: any) => mg.movie_id);
          movies = movies.filter(m => movieIds.includes(m.id));
        }
      }

      if (filters.year) {
        movies = movies.filter(m => m.release_year === filters.year);
      }

      if (filters.rating) {
        movies = movies.filter(m => m.rating === filters.rating);
      }

      if (filters.search) {
        const s = filters.search.toLowerCase();
        movies = movies.filter(m => m.title.toLowerCase().includes(s) || (m.description && m.description.toLowerCase().includes(s)));
      }

      if (filters.sort === 'newest') movies.sort((a, b) => b.release_year - a.release_year);
      else if (filters.sort === 'oldest') movies.sort((a, b) => a.release_year - b.release_year);
      else if (filters.sort === 'title') movies.sort((a, b) => a.title.localeCompare(b.title));
      else movies.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));

      const total = movies.length;
      if (filters.offset) movies = movies.slice(filters.offset);
      if (filters.limit) movies = movies.slice(0, filters.limit);

      const enriched = movies.map(m => {
        const genreLinks = store.movie_genres.filter((mg: any) => mg.movie_id === m.id);
        const genres = genreLinks.map((mg: any) => store.genres.find((g: any) => g.id === mg.genre_id)).filter(Boolean);
        return this.mapDbMovie(m, genres);
      });

      return { movies: enriched, total };
    }
  }

  async getFeaturedMovies(): Promise<Movie[]> {
    const { movies } = await this.getMovies({ isPublished: true, limit: 10 });
    return movies.filter(m => m.isFeatured);
  }

  async getPopularMovies(): Promise<Movie[]> {
    const { movies } = await this.getMovies({ isPublished: true, limit: 10 });
    return movies;
  }

  async getMovieBySlug(slug: string): Promise<Movie | null> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query(`
        SELECT m.*, 
          COALESCE(
            json_agg(
              json_build_object('id', g.id, 'name', g.name, 'slug', g.slug)
            ) FILTER (WHERE g.id IS NOT NULL), '[]'
          ) as genres
        FROM movies m
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE m.slug = $1 OR m.id = $1
        GROUP BY m.id
      `, [slug]);

      if (res.rows.length === 0) return null;
      return this.mapDbMovie(res.rows[0], res.rows[0].genres);
    } else {
      const store = (adapter as any).getStore();
      const m = store.movies.find((item: any) => item.slug === slug || item.id === slug);
      if (!m) return null;

      const genreLinks = store.movie_genres.filter((mg: any) => mg.movie_id === m.id);
      const genres = genreLinks.map((mg: any) => store.genres.find((g: any) => g.id === mg.genre_id)).filter(Boolean);
      return this.mapDbMovie(m, genres);
    }
  }

  async getMovieById(id: string): Promise<Movie | null> {
    return this.getMovieBySlug(id);
  }

  async createMovie(data: Partial<Movie> & { genreIds?: string[] }): Promise<Movie> {
    const adapter = await dbManager.getAdapter();
    const id = uuidv4();
    const slug = data.slug ? slugify(data.slug) : slugify(data.title || `movie-${Date.now()}`);
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      await adapter.query(`
        INSERT INTO movies (id, title, slug, description, poster_url, backdrop_url, trailer_url, video_url, release_year, duration, rating, language, country, is_featured, is_published, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        id,
        data.title,
        slug,
        data.description || '',
        data.posterUrl,
        data.backdropUrl,
        data.trailerUrl || null,
        data.videoUrl,
        data.releaseYear || new Date().getFullYear(),
        data.duration || 90,
        data.rating || 'PG-13',
        data.language || 'English',
        data.country || 'United States',
        data.isFeatured || false,
        data.isPublished !== undefined ? data.isPublished : true,
        now,
        now
      ]);

      if (data.genreIds && data.genreIds.length > 0) {
        for (const gid of data.genreIds) {
          await adapter.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, gid]);
        }
      }

      return (await this.getMovieById(id))!;
    } else {
      const store = (adapter as any).getStore();
      const newMovie = {
        id,
        title: data.title,
        slug,
        description: data.description || '',
        poster_url: data.posterUrl,
        backdrop_url: data.backdropUrl,
        trailer_url: data.trailerUrl || '',
        video_url: data.videoUrl,
        release_year: data.releaseYear || new Date().getFullYear(),
        duration: data.duration || 90,
        rating: data.rating || 'PG-13',
        language: data.language || 'English',
        country: data.country || 'United States',
        is_featured: data.isFeatured ? 1 : 0,
        is_published: data.isPublished !== false ? 1 : 0,
        created_at: now,
        updated_at: now
      };

      store.movies.push(newMovie);
      if (data.genreIds) {
        for (const gid of data.genreIds) {
          store.movie_genres.push({ movie_id: id, genre_id: gid });
        }
      }
      (adapter as any).saveStore();

      return (await this.getMovieById(id))!;
    }
  }

  async updateMovie(id: string, data: Partial<Movie> & { genreIds?: string[] }): Promise<Movie> {
    const adapter = await dbManager.getAdapter();
    const existing = await this.getMovieById(id);
    if (!existing) throw new Error('Movie not found');

    const slug = data.slug ? slugify(data.slug) : (data.title ? slugify(data.title) : existing.slug);
    const now = new Date().toISOString();

    if (adapter.isPostgres) {
      await adapter.query(`
        UPDATE movies SET
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          poster_url = COALESCE($4, poster_url),
          backdrop_url = COALESCE($5, backdrop_url),
          trailer_url = COALESCE($6, trailer_url),
          video_url = COALESCE($7, video_url),
          release_year = COALESCE($8, release_year),
          duration = COALESCE($9, duration),
          rating = COALESCE($10, rating),
          language = COALESCE($11, language),
          country = COALESCE($12, country),
          is_featured = COALESCE($13, is_featured),
          is_published = COALESCE($14, is_published),
          updated_at = $15
        WHERE id = $16
      `, [
        data.title,
        slug,
        data.description,
        data.posterUrl,
        data.backdropUrl,
        data.trailerUrl,
        data.videoUrl,
        data.releaseYear,
        data.duration,
        data.rating,
        data.language,
        data.country,
        data.isFeatured,
        data.isPublished,
        now,
        id
      ]);

      if (data.genreIds) {
        await adapter.query('DELETE FROM movie_genres WHERE movie_id = $1', [id]);
        for (const gid of data.genreIds) {
          await adapter.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2)', [id, gid]);
        }
      }

      return (await this.getMovieById(id))!;
    } else {
      const store = (adapter as any).getStore();
      const m = store.movies.find((item: any) => item.id === id);
      if (!m) throw new Error('Movie not found');

      if (data.title !== undefined) m.title = data.title;
      if (slug) m.slug = slug;
      if (data.description !== undefined) m.description = data.description;
      if (data.posterUrl !== undefined) m.poster_url = data.posterUrl;
      if (data.backdropUrl !== undefined) m.backdrop_url = data.backdropUrl;
      if (data.trailerUrl !== undefined) m.trailer_url = data.trailerUrl;
      if (data.videoUrl !== undefined) m.video_url = data.videoUrl;
      if (data.releaseYear !== undefined) m.release_year = data.releaseYear;
      if (data.duration !== undefined) m.duration = data.duration;
      if (data.rating !== undefined) m.rating = data.rating;
      if (data.language !== undefined) m.language = data.language;
      if (data.country !== undefined) m.country = data.country;
      if (data.isFeatured !== undefined) m.is_featured = data.isFeatured ? 1 : 0;
      if (data.isPublished !== undefined) m.is_published = data.isPublished ? 1 : 0;
      m.updated_at = now;

      if (data.genreIds) {
        store.movie_genres = store.movie_genres.filter((mg: any) => mg.movie_id !== id);
        for (const gid of data.genreIds) {
          store.movie_genres.push({ movie_id: id, genre_id: gid });
        }
      }

      (adapter as any).saveStore();
      return (await this.getMovieById(id))!;
    }
  }

  async deleteMovie(id: string): Promise<boolean> {
    const adapter = await dbManager.getAdapter();

    if (adapter.isPostgres) {
      const res = await adapter.query('DELETE FROM movies WHERE id = $1', [id]);
      return res.rowCount > 0;
    } else {
      const store = (adapter as any).getStore();
      const initial = store.movies.length;
      store.movies = store.movies.filter((m: any) => m.id !== id);
      store.movie_genres = store.movie_genres.filter((mg: any) => mg.movie_id !== id);
      store.watchlist = store.watchlist.filter((w: any) => w.movie_id !== id);
      store.watch_progress = store.watch_progress.filter((p: any) => p.movie_id !== id);
      store.watch_history = store.watch_history.filter((h: any) => h.movie_id !== id);
      (adapter as any).saveStore();
      return store.movies.length < initial;
    }
  }

  async getSimilarMovies(movieId: string): Promise<Movie[]> {
    const movie = await this.getMovieById(movieId);
    if (!movie || !movie.genres || movie.genres.length === 0) {
      const { movies } = await this.getMovies({ isPublished: true, limit: 6 });
      return movies.filter(m => m.id !== movieId);
    }

    const firstGenreSlug = movie.genres[0].slug;
    const { movies } = await this.getMovies({ genre: firstGenreSlug, isPublished: true, limit: 8 });
    return movies.filter(m => m.id !== movieId);
  }
}

export const movieService = new MovieService();

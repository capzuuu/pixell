import { Pool, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import { Database } from 'firebase-admin/database';
import { ENV } from './env';
import { getFirebaseRtdb, isFirebaseConfigured } from './firebase';

export interface DatabaseAdapter {
  isPostgres: boolean;
  isRtdb?: boolean;
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }>;
  init(): Promise<void>;
  seed(): Promise<void>;
}

class PostgresAdapter implements DatabaseAdapter {
  isPostgres = true;
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 3000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      client.release();
      return true;
    } catch (error) {
      return false;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    const res: QueryResult = await this.pool.query(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount || 0 };
  }

  async init(): Promise<void> {
    const migrationPath = path.resolve(__dirname, '../../../database/migrations/001_init_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      await this.pool.query(sql);
      console.log('✅ [Postgres] Migration 001_init_schema.sql applied successfully.');
    }
  }

  async seed(): Promise<void> {
    const check = await this.query('SELECT COUNT(*) as count FROM movies');
    if (parseInt(check.rows[0]?.count || '0', 10) === 0) {
      const seedSqlPath = path.resolve(__dirname, '../../../database/seed/seed_data.sql');
      if (fs.existsSync(seedSqlPath)) {
        const sql = fs.readFileSync(seedSqlPath, 'utf-8');
        await this.pool.query(sql);
        console.log('🌱 [Postgres] Database seed executed successfully.');
      }
    }
  }
}

// Resilient Embedded Storage Provider for development and zero-dependency execution
class EmbeddedAdapter implements DatabaseAdapter {
  isPostgres = false;
  private filePath: string;
  private data: any = {
    users: [],
    genres: [],
    movies: [],
    movie_genres: [],
    series: [],
    series_genres: [],
    seasons: [],
    episodes: [],
    watch_progress: [],
    watchlist: [],
    watch_history: []
  };

  constructor() {
    const dbDir = path.resolve(__dirname, '../../../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    this.filePath = path.join(dbDir, 'store.json');
    this.load();
  }

  private load(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(content);
      } catch (err) {
        console.warn('⚠️ Could not read embedded store, reinitializing...');
      }
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving embedded store:', err);
    }
  }

  getStore() {
    return this.data;
  }

  saveStore() {
    this.save();
  }

  async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    return { rows: [], rowCount: 0 };
  }

  async init(): Promise<void> {
    if (!this.data.movies || this.data.movies.length === 0) {
      await this.seed();
    }
    console.log('✅ [Embedded Store] Initialized with', this.data.movies.length, 'movies &', this.data.series.length, 'series.');
  }

  async seed(): Promise<void> {
    const seedJsonPath = path.resolve(__dirname, '../../../database/seed/seed_data.json');
    if (fs.existsSync(seedJsonPath)) {
      const raw = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));
      const bcrypt = require('bcryptjs');

      // Users
      this.data.users = raw.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password_hash: bcrypt.hashSync(u.password, 10),
        role: u.role,
        avatar: u.avatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Genres
      this.data.genres = raw.genres;

      // Movies & Movie Genres
      this.data.movies = [];
      this.data.movie_genres = [];
      for (const m of raw.movies) {
        this.data.movies.push({
          id: m.id,
          title: m.title,
          slug: m.slug,
          description: m.description,
          poster_url: m.posterUrl,
          backdrop_url: m.backdropUrl,
          trailer_url: m.trailerUrl || '',
          video_url: m.videoUrl,
          release_year: m.releaseYear,
          duration: m.duration,
          rating: m.rating,
          language: m.language,
          country: m.country,
          is_featured: m.isFeatured ? 1 : 0,
          is_published: m.isPublished ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (m.genreIds) {
          for (const gid of m.genreIds) {
            this.data.movie_genres.push({ movie_id: m.id, genre_id: gid });
          }
        }
      }

      // Series, Seasons, Episodes & Series Genres
      this.data.series = [];
      this.data.series_genres = [];
      this.data.seasons = [];
      this.data.episodes = [];

      for (const s of raw.series) {
        this.data.series.push({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          poster_url: s.posterUrl,
          backdrop_url: s.backdropUrl,
          trailer_url: s.trailerUrl || '',
          release_year: s.releaseYear,
          rating: s.rating,
          language: s.language,
          country: s.country,
          is_featured: s.isFeatured ? 1 : 0,
          is_published: s.isPublished ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (s.genreIds) {
          for (const gid of s.genreIds) {
            this.data.series_genres.push({ series_id: s.id, genre_id: gid });
          }
        }

        if (s.seasons) {
          for (const sea of s.seasons) {
            this.data.seasons.push({
              id: sea.id,
              series_id: s.id,
              season_number: sea.seasonNumber,
              title: sea.title,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            if (sea.episodes) {
              for (const ep of sea.episodes) {
                this.data.episodes.push({
                  id: ep.id,
                  season_id: sea.id,
                  title: ep.title,
                  description: ep.description,
                  episode_number: ep.episodeNumber,
                  duration: ep.duration,
                  thumbnail_url: ep.thumbnailUrl,
                  video_url: ep.videoUrl,
                  release_date: ep.releaseDate || '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            }
          }
        }
      }

      // Initial Watchlist
      this.data.watchlist = (raw.initialWatchlist || []).map((w: any, idx: number) => ({
        id: `wl-${idx + 1}`,
        user_id: w.userId,
        movie_id: w.movieId || null,
        series_id: w.seriesId || null,
        created_at: new Date().toISOString()
      }));

      // Initial Progress
      this.data.watch_progress = (raw.initialProgress || []).map((p: any, idx: number) => ({
        id: `wp-${idx + 1}`,
        user_id: p.userId,
        movie_id: p.movieId || null,
        episode_id: p.episodeId || null,
        progress_seconds: p.progressSeconds,
        duration_seconds: p.durationSeconds,
        completed: p.completed ? 1 : 0,
        updated_at: new Date().toISOString()
      }));

      // Initial History
      this.data.watch_history = (raw.initialHistory || []).map((h: any, idx: number) => ({
        id: `wh-${idx + 1}`,
        user_id: h.userId,
        movie_id: h.movieId || null,
        episode_id: h.episodeId || null,
        watched_at: new Date().toISOString()
      }));

      this.save();
      console.log('🌱 [Embedded Store] Loaded 12 movies, 6 series, 26+ episodes, 10 genres.');
    }
  }
}

// ⚡ Firebase Realtime Database Adapter for 100% Cloud-Backed Catalog & User Accounts
export class RealtimeDatabaseAdapter implements DatabaseAdapter {
  isPostgres = false;
  isRtdb = true;
  private db: Database;
  private data: any = {
    users: [],
    genres: [],
    movies: [],
    movie_genres: [],
    series: [],
    series_genres: [],
    seasons: [],
    episodes: [],
    watch_progress: [],
    watchlist: [],
    watch_history: []
  };
  private isSyncing = false;

  constructor(db: Database) {
    this.db = db;
  }

  getStore() {
    return this.data;
  }

  saveStore() {
    this.syncToRtdb().catch(err => {
      console.warn('⚠️ [RealtimeDatabaseAdapter] Background RTDB sync error:', err.message);
    });
  }

  async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    return { rows: [], rowCount: 0 };
  }

  private normalizeArray(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'object') return Object.values(val).filter(Boolean);
    return [];
  }

  async init(): Promise<void> {
    try {
      console.log('🔍 [RealtimeDatabaseAdapter] Checking Firebase Realtime Database catalog...');
      const moviesSnap = await this.db.ref('movies').once('value');
      const moviesVal = moviesSnap.val();

      if (!moviesVal || (Array.isArray(moviesVal) && moviesVal.length === 0) || Object.keys(moviesVal).length === 0) {
        console.log('🌱 [RealtimeDatabaseAdapter] Empty database in Firebase Realtime Database. Automatically seeding initial catalog & users...');
        await this.seed();
      } else {
        await this.loadAllCollections();
        console.log(`🔥 [RealtimeDatabaseAdapter] Successfully loaded ${this.data.movies.length} movies & ${this.data.series.length} series from Firebase Realtime Database.`);
      }

      this.attachListeners();
    } catch (err: any) {
      console.warn('⚠️ [RealtimeDatabaseAdapter] RTDB query warning:', err.message);
      if (!this.data.movies || this.data.movies.length === 0) {
        await this.seed();
      }
    }
  }

  private async loadAllCollections(): Promise<void> {
    const collections = [
      'users', 'genres', 'movies', 'movie_genres', 'series',
      'series_genres', 'seasons', 'episodes', 'watch_progress',
      'watchlist', 'watch_history'
    ];

    const rootSnap = await this.db.ref().once('value');
    const rootVal = rootSnap.val() || {};

    for (const colName of collections) {
      this.data[colName] = this.normalizeArray(rootVal[colName]);
    }
  }

  private attachListeners(): void {
    const collections = [
      'users', 'genres', 'movies', 'movie_genres', 'series',
      'series_genres', 'seasons', 'episodes', 'watch_progress',
      'watchlist', 'watch_history'
    ];

    for (const colName of collections) {
      this.db.ref(colName).on('value', (snapshot) => {
        if (!this.isSyncing) {
          const val = snapshot.val();
          this.data[colName] = this.normalizeArray(val);
        }
      });
    }
  }

  private async syncToRtdb(): Promise<void> {
    this.isSyncing = true;
    try {
      const collections = [
        'users', 'genres', 'movies', 'movie_genres', 'series',
        'series_genres', 'seasons', 'episodes', 'watch_progress',
        'watchlist', 'watch_history'
      ];

      const updates: Record<string, any> = {};
      for (const colName of collections) {
        updates[colName] = this.data[colName] || [];
      }

      await this.db.ref().update(updates);
    } finally {
      setTimeout(() => {
        this.isSyncing = false;
      }, 300);
    }
  }

  async seed(): Promise<void> {
    const seedJsonPath = path.resolve(__dirname, '../../../database/seed/seed_data.json');
    if (!fs.existsSync(seedJsonPath)) return;

    const raw = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));
    const bcrypt = require('bcryptjs');

    this.data.users = raw.users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password_hash: bcrypt.hashSync(u.password, 10),
      role: u.role,
      avatar: u.avatar,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    this.data.genres = raw.genres;

    this.data.movies = [];
    this.data.movie_genres = [];
    for (const m of raw.movies) {
      this.data.movies.push({
        id: m.id,
        title: m.title,
        slug: m.slug,
        description: m.description,
        poster_url: m.posterUrl,
        backdrop_url: m.backdropUrl,
        trailer_url: m.trailerUrl || '',
        video_url: m.videoUrl,
        release_year: m.releaseYear,
        duration: m.duration,
        rating: m.rating,
        language: m.language,
        country: m.country,
        is_featured: m.isFeatured ? 1 : 0,
        is_published: m.isPublished ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (m.genreIds) {
        for (const gid of m.genreIds) {
          this.data.movie_genres.push({ id: `${m.id}_${gid}`, movie_id: m.id, genre_id: gid });
        }
      }
    }

    this.data.series = [];
    this.data.series_genres = [];
    this.data.seasons = [];
    this.data.episodes = [];

    for (const s of raw.series) {
      this.data.series.push({
        id: s.id,
        title: s.title,
        slug: s.slug,
        description: s.description,
        poster_url: s.posterUrl,
        backdrop_url: s.backdropUrl,
        trailer_url: s.trailerUrl || '',
        release_year: s.releaseYear,
        rating: s.rating,
        language: s.language,
        country: s.country,
        is_featured: s.isFeatured ? 1 : 0,
        is_published: s.isPublished ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (s.genreIds) {
        for (const gid of s.genreIds) {
          this.data.series_genres.push({ id: `${s.id}_${gid}`, series_id: s.id, genre_id: gid });
        }
      }

      if (s.seasons) {
        for (const sea of s.seasons) {
          this.data.seasons.push({
            id: sea.id,
            series_id: s.id,
            season_number: sea.seasonNumber,
            title: sea.title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          if (sea.episodes) {
            for (const ep of sea.episodes) {
              this.data.episodes.push({
                id: ep.id,
                season_id: sea.id,
                title: ep.title,
                description: ep.description,
                episode_number: ep.episodeNumber,
                duration: ep.duration,
                thumbnail_url: ep.thumbnailUrl,
                video_url: ep.videoUrl,
                release_date: ep.releaseDate || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        }
      }
    }

    this.data.watchlist = (raw.initialWatchlist || []).map((w: any, idx: number) => ({
      id: `wl-${idx + 1}`,
      user_id: w.userId,
      movie_id: w.movieId || null,
      series_id: w.seriesId || null,
      created_at: new Date().toISOString()
    }));

    this.data.watch_progress = (raw.initialProgress || []).map((p: any, idx: number) => ({
      id: `wp-${idx + 1}`,
      user_id: p.userId,
      movie_id: p.movieId || null,
      episode_id: p.episodeId || null,
      progress_seconds: p.progressSeconds,
      duration_seconds: p.durationSeconds,
      completed: p.completed ? 1 : 0,
      updated_at: new Date().toISOString()
    }));

    this.data.watch_history = (raw.initialHistory || []).map((h: any, idx: number) => ({
      id: `wh-${idx + 1}`,
      user_id: h.userId,
      movie_id: h.movieId || null,
      episode_id: h.episodeId || null,
      watched_at: new Date().toISOString()
    }));

    await this.syncToRtdb();
    console.log(`🌱 [RealtimeDatabaseAdapter] Successfully seeded Firebase Realtime Database with ${this.data.movies.length} movies, ${this.data.series.length} series & ${this.data.users.length} users.`);
  }
}

class DatabaseManager {
  private adapter!: DatabaseAdapter;
  private isInitialized = false;

  async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.adapter;
  }

  async init(): Promise<void> {
    // 1. Check if Firebase Realtime Database is enabled or configured
    if (ENV.USE_FIREBASE || isFirebaseConfigured()) {
      const rtdb = getFirebaseRtdb();
      if (rtdb) {
        console.log('🔥 [Database] Using Firebase Realtime Database as the sole primary backend database.');
        this.adapter = new RealtimeDatabaseAdapter(rtdb);
        await this.adapter.init();
        this.isInitialized = true;
        return;
      } else if (ENV.USE_FIREBASE) {
        console.warn('⚠️ [Database] USE_FIREBASE=true is set, but Firebase RTDB credentials/URL are not yet configured.');
        console.warn('⚠️ [Database] Falling back to high-speed storage adapter.');
      }
    }

    // 2. Check PostgreSQL
    const pg = new PostgresAdapter(ENV.DATABASE_URL);
    const pgConnected = await pg.testConnection();

    if (pgConnected) {
      console.log('🐘 [Database] Successfully connected to PostgreSQL at', ENV.DATABASE_URL);
      this.adapter = pg;
      try {
        await this.adapter.init();
        await this.adapter.seed();
      } catch (err) {
        console.error('⚠️ Postgres migration error:', err);
      }
    } else {
      console.log('💾 [Database] Initializing embedded storage adapter.');
      this.adapter = new EmbeddedAdapter();
      await this.adapter.init();
    }

    this.isInitialized = true;
  }
}

export const dbManager = new DatabaseManager();

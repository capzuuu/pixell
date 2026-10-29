-- Pixell Streaming Platform MVP - PostgreSQL Database Schema Migration
-- 001_init_schema.sql

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Genres Table
CREATE TABLE IF NOT EXISTS genres (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Movies Table
CREATE TABLE IF NOT EXISTS movies (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT NOT NULL,
    trailer_url TEXT,
    video_url TEXT NOT NULL,
    release_year INT NOT NULL,
    duration INT NOT NULL,
    rating VARCHAR(20) DEFAULT 'PG-13',
    language VARCHAR(50) DEFAULT 'English',
    country VARCHAR(50) DEFAULT 'United States',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Movie Genres Junction Table
CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id VARCHAR(36) REFERENCES movies(id) ON DELETE CASCADE,
    genre_id VARCHAR(36) REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- 5. TV Series Table
CREATE TABLE IF NOT EXISTS series (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT NOT NULL,
    trailer_url TEXT,
    release_year INT NOT NULL,
    rating VARCHAR(20) DEFAULT 'TV-MA',
    language VARCHAR(50) DEFAULT 'English',
    country VARCHAR(50) DEFAULT 'United States',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Series Genres Junction Table
CREATE TABLE IF NOT EXISTS series_genres (
    series_id VARCHAR(36) REFERENCES series(id) ON DELETE CASCADE,
    genre_id VARCHAR(36) REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (series_id, genre_id)
);

-- 7. Seasons Table
CREATE TABLE IF NOT EXISTS seasons (
    id VARCHAR(36) PRIMARY KEY,
    series_id VARCHAR(36) REFERENCES series(id) ON DELETE CASCADE,
    season_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Episodes Table
CREATE TABLE IF NOT EXISTS episodes (
    id VARCHAR(36) PRIMARY KEY,
    season_id VARCHAR(36) REFERENCES seasons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    episode_number INT NOT NULL,
    duration INT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    release_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Watch Progress Table (Resume playback / Continue watching)
CREATE TABLE IF NOT EXISTS watch_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    movie_id VARCHAR(100),
    episode_id VARCHAR(100),
    tmdb_id VARCHAR(100),
    media_type VARCHAR(20),
    title TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    season_number INT,
    episode_number INT,
    episode_title TEXT,
    progress_seconds INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Watchlist Table
CREATE TABLE IF NOT EXISTS watchlist (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    movie_id VARCHAR(100),
    series_id VARCHAR(100),
    tmdb_id VARCHAR(100),
    media_type VARCHAR(20),
    title TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    rating VARCHAR(30),
    release_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Watch History Table
CREATE TABLE IF NOT EXISTS watch_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    movie_id VARCHAR(100),
    episode_id VARCHAR(100),
    tmdb_id VARCHAR(100),
    media_type VARCHAR(20),
    title TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    season_number INT,
    episode_number INT,
    episode_title TEXT,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Upgrade existing tables if created by an older schema version
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS tmdb_id VARCHAR(100);
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS backdrop_url TEXT;
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS season_number INT;
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS episode_number INT;
ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS episode_title TEXT;
ALTER TABLE watch_progress DROP CONSTRAINT IF EXISTS check_target;
ALTER TABLE watch_progress DROP CONSTRAINT IF EXISTS watch_progress_user_id_fkey;
ALTER TABLE watch_progress DROP CONSTRAINT IF EXISTS watch_progress_movie_id_fkey;
ALTER TABLE watch_progress DROP CONSTRAINT IF EXISTS watch_progress_episode_id_fkey;

ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS tmdb_id VARCHAR(100);
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS backdrop_url TEXT;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS rating VARCHAR(30);
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS release_year INT;
ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS check_watchlist_target;
ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS watchlist_movie_id_fkey;
ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS watchlist_series_id_fkey;

ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS tmdb_id VARCHAR(100);
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS backdrop_url TEXT;
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS season_number INT;
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS episode_number INT;
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS episode_title TEXT;
ALTER TABLE watch_history DROP CONSTRAINT IF EXISTS check_history_target;
ALTER TABLE watch_history DROP CONSTRAINT IF EXISTS watch_history_user_id_fkey;
ALTER TABLE watch_history DROP CONSTRAINT IF EXISTS watch_history_movie_id_fkey;
ALTER TABLE watch_history DROP CONSTRAINT IF EXISTS watch_history_episode_id_fkey;

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies(slug);
CREATE INDEX IF NOT EXISTS idx_movies_featured ON movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
CREATE INDEX IF NOT EXISTS idx_series_featured ON series(is_featured);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);

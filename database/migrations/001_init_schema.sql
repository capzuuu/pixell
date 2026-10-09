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
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    movie_id VARCHAR(36) REFERENCES movies(id) ON DELETE CASCADE,
    episode_id VARCHAR(36) REFERENCES episodes(id) ON DELETE CASCADE,
    progress_seconds INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_target CHECK (
        (movie_id IS NOT NULL AND episode_id IS NULL) OR
        (movie_id IS NULL AND episode_id IS NOT NULL)
    )
);

-- 10. Watchlist Table
CREATE TABLE IF NOT EXISTS watchlist (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    movie_id VARCHAR(36) REFERENCES movies(id) ON DELETE CASCADE,
    series_id VARCHAR(36) REFERENCES series(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_watchlist_target CHECK (
        (movie_id IS NOT NULL AND series_id IS NULL) OR
        (movie_id IS NULL AND series_id IS NOT NULL)
    )
);

-- 11. Watch History Table
CREATE TABLE IF NOT EXISTS watch_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    movie_id VARCHAR(36) REFERENCES movies(id) ON DELETE CASCADE,
    episode_id VARCHAR(36) REFERENCES episodes(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_history_target CHECK (
        (movie_id IS NOT NULL AND episode_id IS NULL) OR
        (movie_id IS NULL AND episode_id IS NOT NULL)
    )
);

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies(slug);
CREATE INDEX IF NOT EXISTS idx_movies_featured ON movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
CREATE INDEX IF NOT EXISTS idx_series_featured ON series(is_featured);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);

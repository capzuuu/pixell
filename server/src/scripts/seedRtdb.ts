import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initFirebaseAdmin, getFirebaseRtdb } from '../config/firebase';

async function seedRtdb() {
  console.log('⚡ Initializing Firebase Realtime Database Seeder...');

  initFirebaseAdmin();
  const db = getFirebaseRtdb();

  if (!db) {
    console.error('❌ Could not connect to Firebase Realtime Database!');
    console.error('👉 Please make sure your .env has FIREBASE_DATABASE_URL and serviceAccountKey.json.');
    process.exit(1);
  }

  const seedPath = path.resolve(__dirname, '../../../database/seed/seed_data.json');
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found at: ${seedPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log('📦 Reading seed data from seed_data.json...');

  try {
    // 1. Users
    const users = raw.users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password_hash: bcrypt.hashSync(u.password, 10),
      role: u.role,
      avatar: u.avatar,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // 2. Genres
    const genres = raw.genres;

    // 3. Movies & Movie Genres
    const movies: any[] = [];
    const movie_genres: any[] = [];
    for (const m of raw.movies) {
      movies.push({
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
          movie_genres.push({ id: `${m.id}_${gid}`, movie_id: m.id, genre_id: gid });
        }
      }
    }

    // 4. Series, Seasons, Episodes & Series Genres
    const series: any[] = [];
    const series_genres: any[] = [];
    const seasons: any[] = [];
    const episodes: any[] = [];

    for (const s of raw.series) {
      series.push({
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
          series_genres.push({ id: `${s.id}_${gid}`, series_id: s.id, genre_id: gid });
        }
      }

      if (s.seasons) {
        for (const sea of s.seasons) {
          seasons.push({
            id: sea.id,
            series_id: s.id,
            season_number: sea.seasonNumber,
            title: sea.title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          if (sea.episodes) {
            for (const ep of sea.episodes) {
              episodes.push({
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

    // 5. Watchlist, Progress, History
    const watchlist = (raw.initialWatchlist || []).map((w: any, idx: number) => ({
      id: `wl-${idx + 1}`,
      user_id: w.userId,
      movie_id: w.movieId || null,
      series_id: w.seriesId || null,
      created_at: new Date().toISOString()
    }));

    const watch_progress = (raw.initialProgress || []).map((p: any, idx: number) => ({
      id: `wp-${idx + 1}`,
      user_id: p.userId,
      movie_id: p.movieId || null,
      episode_id: p.episodeId || null,
      progress_seconds: p.progressSeconds,
      duration_seconds: p.durationSeconds,
      completed: p.completed ? 1 : 0,
      updated_at: new Date().toISOString()
    }));

    const watch_history = (raw.initialHistory || []).map((h: any, idx: number) => ({
      id: `wh-${idx + 1}`,
      user_id: h.userId,
      movie_id: h.movieId || null,
      episode_id: h.episodeId || null,
      watched_at: new Date().toISOString()
    }));

    console.log('⏳ Uploading all datasets directly to Firebase Realtime Database...');
    await db.ref().update({
      users,
      genres,
      movies,
      movie_genres,
      series,
      series_genres,
      seasons,
      episodes,
      watchlist,
      watch_progress,
      watch_history
    });

    console.log('✅ [Firebase RTDB] Database seeded successfully!');
    console.log(`📊 Uploaded: ${movies.length} movies, ${series.length} series, ${episodes.length} episodes, ${genres.length} genres, ${users.length} users.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ [Firebase RTDB] Error while seeding Realtime Database:', error);
    process.exit(1);
  }
}

seedRtdb();

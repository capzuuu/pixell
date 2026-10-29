import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server directory and project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pixell',
  JWT_SECRET: process.env.JWT_SECRET || 'pixell_super_secret_jwt_key_2026_streaming_platform',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  STORAGE_URL: process.env.STORAGE_URL || 'http://localhost:5000/media',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  TMDB_API_KEY: process.env.TMDB_API_KEY || '18060ce0b646912b30dc2175a279134d',
  TMDB_READ_ACCESS_TOKEN:
    process.env.TMDB_READ_ACCESS_TOKEN ||
    'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxODA2MGNlMGI2NDY5MTJiMzBkYzIxNzVhMjc5MTM0ZCIsIm5iZiI6MTc3ODgxNDg5NC42MDksInN1YiI6IjZhMDY4ZmFlNWM0YTUyOGNjZjgyNjVjMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aDKTcxalZVvhYa31cJRfzUqGy-oAMcS6SSRHufWDNNw',
  VIDEASY_BASE_URL: process.env.VIDEASY_BASE_URL || 'https://vidlink.pro',
  USE_FIREBASE: process.env.USE_FIREBASE === 'true',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'pixell-06',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
  FIREBASE_DATABASE_URL:
    process.env.FIREBASE_DATABASE_URL ||
    'https://pixell-06-default-rtdb.asia-southeast1.firebasedatabase.app',
};

// Development warning if essential secrets are missing in .env
if (!ENV.TMDB_READ_ACCESS_TOKEN) {
  console.warn('[SECURITY WARNING] TMDB_READ_ACCESS_TOKEN is not defined in your .env file!');
}
if (!ENV.JWT_SECRET) {
  console.warn('[SECURITY WARNING] JWT_SECRET is not defined in your .env file!');
}

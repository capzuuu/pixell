import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { dbManager } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
const allowedOrigins = [
  ENV.CORS_ORIGIN,
  'https://pixell-sable.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].flatMap(o => (o && o.includes(',') ? o.split(',').map(s => s.trim()) : [o])).filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      ENV.CORS_ORIGIN === '*' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (ENV.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// API Routes
app.use('/api', apiRoutes);

// Root fallback / Welcome
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Pixell Streaming API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      movies: '/api/movies',
      series: '/api/series',
      episodes: '/api/episodes',
      genres: '/api/genres',
      watchlist: '/api/watchlist',
      progress: '/api/progress',
      history: '/api/history',
      search: '/api/search',
      admin: '/api/admin'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Bootstrap
async function startServer() {
  try {
    await dbManager.init();
    app.listen(ENV.PORT, () => {
      console.log(`🎬 Pixell API Server is listening on http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

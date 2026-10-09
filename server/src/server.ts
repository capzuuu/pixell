import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { dbManager } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(cors({
  origin: [ENV.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (ENV.NODE_ENV === 'development') {
  app.use((req, res, next) => {
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
app.get('/', (req, res) => {
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

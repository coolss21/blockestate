import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { FRONTEND_ORIGIN } from './config/index.js';
import { connectMongo } from "./db/mongoose.js";
import cookieParser from 'cookie-parser';

export function createApp() {
  const app = express();
  connectMongo().then(() => console.log("connected to mongodb")
  ).catch((err) => console.log("failed to connect\n" + err));
  // CORS: allow React dev server + any extra origin you set
  app.use(cors({
    origin: (origin, cb) => {
      // Allow non-browser clients (curl, mobile PDF viewer, etc.)
      if (!origin) return cb(null, true);

      // Always allow localhost dev
      const allowed = new Set([
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ]);
      if (FRONTEND_ORIGIN) allowed.add(FRONTEND_ORIGIN);

      // Allow same machine LAN IP dev server (e.g. http://10.20.17.77:5173)
      const isLan5173 = /^http:\/\/(\d{1,3}\.){3}\d{1,3}:5173$/.test(origin);
      if (allowed.has(origin) || isLan5173) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));

  app.use('/api', routes);

  // STATIC: Serve certificates
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use('/certificates', express.static(path.join(__dirname, 'storage', 'certificates')));

  app.get('/', (_req, res) => res.json({ ok: true, message: 'PropertyChain backend', api: '/api/health' }));

  // 404
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // error handler
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Server error' });
  });

  return app;
}

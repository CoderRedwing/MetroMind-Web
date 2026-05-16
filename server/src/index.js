import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routeRouter from './routes/route.js';
import explorerRouter from './routes/explorer.js';
import chatRouter from './routes/chat.js';
import tripRouter from './routes/trip.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Allow both local and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL, // set this in Render dashboard
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health check + keep-alive (prevents Render free tier sleep)
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'DMRC Metro API', time: new Date().toISOString() }));
app.get('/', (req, res) => res.json({ message: 'MetroMind API is running 🚇' }));

app.use('/api/route', routeRouter);
app.use('/api/explorer', explorerRouter);
app.use('/api/chat', chatRouter);
app.use('/api/trip', tripRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚇 DMRC Metro API running on http://0.0.0.0:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiRouter } from './routes/ai.js';
import { readingsRouter } from './routes/readings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/ai', aiRouter);
app.use('/api/readings', readingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mystic-tarot-backend',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🔮 Mystic Tarot Backend server running on http://localhost:${PORT}`);
});

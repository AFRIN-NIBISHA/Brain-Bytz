import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedDatabase } from './config/seed.js';
import quizRoutes from './routes/quizRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB and Seed Questions & Admin
seedDatabase();

// API Root & Welcome Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 BRAIN BYTZ Competition Engine API is running live on Render.',
    symposium: 'XENORAZZ 2K26 • DMI Engineering College',
    endpoints: {
      health: '/api/health',
      quizConfig: '/api/quiz/config',
      questions: '/api/quiz/questions',
      adminLogin: '/api/admin/login'
    }
  });
});

// API Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    name: 'BRAIN BYTZ Competition Engine'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 BRAIN BYTZ Server running on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🔐 Admin Login: username="admin", password="admin123"`);
  console.log(`=============================================`);
});

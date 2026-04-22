// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './models/index.js';
import cookieParser from 'cookie-parser'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = !!process.env.VERCEL;

// Middleware
// In production on Vercel, frontend and API share the same origin so CORS is not strictly needed,
// but we still allow FRONTEND_URL (and Vercel preview URLs) for safety.
const allowedOrigins = (process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5173']);

const corsOptions = {
  origin: (origin, callback) => {
    // Same-origin or server-to-server requests have no Origin header — always allow
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any *.vercel.app preview deployment when running on Vercel
    if (isVercel && /\.vercel\.app$/.test(new URL(origin).hostname)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic route
app.get('/api', (req, res) => {
  res.json({
    message: 'Real Estate Platform API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

import adminRouts from './routes/admin.auth.routes.js';
import authRoutes from './routes/user.auth.routes.js';
import adminOpRoutes from './routes/admin.operations.routes.js';
import propertyRoutes from './routes/property.routes.js';
import blogRoutes from './routes/blog.routes.js';
import interactRoutes from './routes/interactions.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import sellRoutes from './routes/sell.routes.js';
import sellSubmissionRoutes from './routes/sellSubmission.routes.js';
import adminStaffRoutes from './routes/adminStaff.routes.js';
import broadcastRoutes from './routes/broadcast.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { globalErrorHandler, notFound } from './middleware/error.middleware.js';

app.use('/api/admin/auth', adminRouts);
app.use('/api/user/auth', authRoutes);
app.use('/api/admin/ops', adminOpRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/interactions', interactRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/admin/dashboard/sell-submissions', sellSubmissionRoutes);
app.use('/api/admin/staff', adminStaffRoutes);
app.use('/api/admin/broadcast', broadcastRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/notifications', notificationRoutes);
// 404 handler
app.use(notFound);
app.use(globalErrorHandler);

// Start server only when running as a long-lived process (local dev / Render / Fly).
// On Vercel, the platform invokes the exported app per-request — never call listen().
const startServer = async () => {
  try {
    await testConnection();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (!isVercel) {
  startServer();
}

export default app;

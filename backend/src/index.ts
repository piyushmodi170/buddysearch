import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { prisma, connectDatabase, databaseUrlInfo, lookupOutboundIp } from './config/db.js';
import { ensureDemoListings } from './config/demo-listings.js';
import { ensureDefaultTemplates } from './services/mail.service.js';
import { revokeUnpaidFreeLaunchGrant } from './services/membership.service.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { initializeSocket } from './socket/index.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import requestRoutes from './routes/request.routes.js';
import chatRoutes from './routes/chat.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import membershipRoutes from './routes/membership.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import seoAgentRoutes from './routes/seo-agent.routes.js';
import blogPublicRoutes from './routes/blog-public.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(compression());
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// Razorpay signs the raw request body, so the webhook route needs the exact
// bytes that were sent. Capture them before the JSON parser reshapes them.
app.use(express.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', async (req, res) => {
  let database: 'up' | 'down' = 'down';
  let databaseError: string | undefined;
  const urlInfo = databaseUrlInfo();
  const outboundIp = await lookupOutboundIp();
  try {
    await Promise.race([
      prisma.$runCommandRaw({ ping: 1 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('health probe timed out')), 8000))
    ]);
    database = 'up';
  } catch (err: any) {
    databaseError = err?.message?.split('\n')[0] || 'unreachable';
  }
  res.status(database === 'up' ? 200 : 503).json({
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    databaseUrl: urlInfo,
    outboundIp,
    hint: database === 'down'
      ? `Add ${outboundIp || '0.0.0.0/0'} in Atlas → Network Access (Coolify UI IPs are often wrong). Wait 60s.`
      : undefined,
    ...(databaseError ? { databaseError } : {}),
    timestamp: new Date()
  });
});

// Liveness only: says the process is up, without touching the database.
app.get('/health/live', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', seoAgentRoutes);
app.use('/api/blog', blogPublicRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal Server Error',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

initializeSocket(io);
app.set('io', io);

// A rejected promise in an async event handler (a socket callback, a stray
// background write) would otherwise terminate the process and take every HTTP
// route down with it. Log it and stay up.
process.on('unhandledRejection', (reason: any) => {
  console.error('[unhandledRejection]', reason?.message || reason);
});

process.on('uncaughtException', (err: Error) => {
  console.error('[uncaughtException]', err?.message || err);
  console.error(err?.stack);
});

const shutdown = (signal: string) => async () => {
  console.log(`\n${signal} received, shutting down...`);
  io.close();
  httpServer.close();
  try { await prisma.$disconnect(); } catch { /* already gone */ }
  process.exit(0);
};
process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

void connectDatabase()
  .then(() => {
    console.log('Database connected');
    void ensureDemoListings().catch((err: any) => {
      console.error('[demo-listings]', err?.message || err);
    });
    void ensureDefaultTemplates()
      .then(() => revokeUnpaidFreeLaunchGrant())
      .catch((err: any) => {
        console.error('[free-access-revoke]', err?.message || err);
      });
  })
  .catch((err: any) => console.error('[database]', err?.message || err))
  .finally(() => {
    httpServer.listen(config.port, '0.0.0.0', () => {
      console.log(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  });

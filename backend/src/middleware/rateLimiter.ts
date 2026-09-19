import rateLimit from 'express-rate-limit';

const skipDevAndSockets = (req: { path?: string; originalUrl?: string }) => {
  if (process.env.NODE_ENV !== 'production') return true;
  const url = `${req.path || ''}${req.originalUrl || ''}`;
  return url.includes('socket.io') || url.startsWith('/health');
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevAndSockets,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevAndSockets,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevAndSockets,
});

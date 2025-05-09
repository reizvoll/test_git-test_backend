import rateLimit from 'express-rate-limit';

// sync request rate limiter
export const syncLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // max 3 requests per IP
  message: {
    message: 'Too many sync requests, please try again after 5 minutes'
  },
  standardHeaders: true, // RateLimit-* 헤더 반환
  legacyHeaders: false, // X-RateLimit-* 헤더 비활성화
});

// auto sync settings rate limiter
export const autoSyncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // max 2 requests per IP
  message: {
    message: 'Too many auto sync settings changes, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 
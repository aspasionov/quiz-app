const rateLimit = require('express-rate-limit');

// Helper function for proper IPv6 handling
const createKeyGenerator = (useUserId = false) => {
  return (req) => {
    if (useUserId && req.userId) {
      return req.userId;
    }
    return req.ip;
  };
};

// General rate limiter for all API requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 authentication requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
});

// Very strict rate limiter for AI quiz generation
const aiQuizLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit each IP to 15 AI quiz generations per hour
  message: {
    success: false,
    message: 'Too many AI quiz generation requests. Please try again in an hour.',
    retryAfter: '1 hour',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for quiz creation/modification
const quizLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 quiz operations per windowMs
  message: {
    success: false,
    message: 'Too many quiz operations from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: {
    success: false,
    message: 'Too many upload attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Extreme rate limiter for login attempts (to prevent brute force attacks)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again in 15 minutes.',
    retryAfter: '15 minutes',
    error: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed requests
  skipSuccessfulRequests: true,
});

// Custom rate limiter that allows different limits based on user type
const createUserBasedLimiter = (windowMs, maxRequests, premiumMaxRequests = null) => {
  return rateLimit({
    windowMs,
    max: (req) => {
      // If user is premium/admin, give higher limits
      if (req.user && (req.user.isPremium || req.user.role === 'admin')) {
        return premiumMaxRequests || maxRequests * 2;
      }
      return maxRequests;
    },
    message: {
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  aiQuizLimiter,
  quizLimiter,
  uploadLimiter,
  loginLimiter,
  createUserBasedLimiter
};

// server/src/config/constants.js

module.exports = {
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  TOKEN_EXPIRES: '7d',

  // Limits
  MAX_HOURS_PER_COURSE: 50,
  QUIZ_PASS_THRESHOLD: Number(process.env.QUIZ_PASS_THRESHOLD || 50),

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Password
  MIN_PASSWORD_LENGTH: 6,
  BCRYPT_SALT_ROUNDS: 10,

  // Rate Limiting
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX: 2000, // max attempts per window
  GENERAL_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_RATE_LIMIT_MAX: 20000,
};

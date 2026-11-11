export const APP_CONFIG = {
  get PORT() {
    return process.env.PORT || 3000;
  },
  get NODE_ENV() {
    return process.env.NODE_ENV || "development";
  },
  get DB_PATH() {
    return process.env.DB_PATH || "./bookmarks.db";
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || "dev-secret-change-me";
  },
  get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || "7d";
  },
  BCRYPT_ROUNDS: 12,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_MAX: 100,
};

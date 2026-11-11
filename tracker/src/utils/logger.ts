import { APP_CONFIG } from "../config/app";

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "info", message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: "error", message, ...meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: "warn", message, ...meta, timestamp: new Date().toISOString() }));
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (APP_CONFIG.NODE_ENV === "development") {
      console.log(JSON.stringify({ level: "debug", message, ...meta, timestamp: new Date().toISOString() }));
    }
  },
};

import pino from 'pino';

// Check if we're in a browser environment
const isBrowser = typeof globalThis !== 'undefined' && 'window' in globalThis;

// Create logger instance
const logger = isBrowser
  ? // Browser logger - simple console wrapper
    {
      error: (...args: any[]) => console.error(...args),
      warn: (...args: any[]) => console.warn(...args),
      info: (...args: any[]) => console.info(...args),
      debug: (...args: any[]) => console.debug(...args),
    }
  : // Node.js logger with pino
    pino({
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    });

// Export logger with consistent interface
export default logger;

// Export individual log methods for convenience
export const { error, warn, info, debug } = logger;

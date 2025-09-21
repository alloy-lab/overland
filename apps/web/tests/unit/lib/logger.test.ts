import { describe, expect, it } from 'vitest';
import logger from '~/lib/logger';

describe('Logger', () => {
  it('should export a logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger).toBe('object');
  });

  it('should have all required log methods', () => {
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should handle log calls without throwing errors', () => {
    // These should not throw errors
    expect(() => {
      logger.error('Test error message');
      logger.warn('Test warning message');
      logger.info('Test info message');
      logger.debug('Debug information');
    }).not.toThrow();
  });

  it('should handle complex log objects', () => {
    const error = new Error('Test error');
    const logData = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userId: 456,
    };

    expect(() => {
      logger.error('Error occurred:', logData);
    }).not.toThrow();
  });
});

import { ApiResponse, ErrorCode } from '../models/types';

/**
 * Logger utility with structured logging
 */
export class Logger {
  constructor(
    private readonly context: string,
    private readonly additionalContext: Record<string, unknown> = {}
  ) {}

  info(message: string, data?: Record<string, unknown>): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('WARN', message, data);
  }

  error(message: string, error?: unknown, data?: Record<string, unknown>): void {
    const errorData =
      error instanceof Error ? { error: error.message, stack: error.stack } : { error };
    this.log('ERROR', message, { ...errorData, ...data });
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL === 'DEBUG') {
      this.log('DEBUG', message, data);
    }
  }

  private log(level: string, message: string, data?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...this.additionalContext,
      ...data,
    };
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Create logger instance with context
 */
export function createLogger(context: string, additionalContext?: Record<string, unknown>): Logger {
  return new Logger(context, additionalContext);
}

/**
 * Success response builder
 */
export function successResponse<T>(
  data: T,
  metadata?: { requestId: string; version?: string }
): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: metadata
      ? {
          requestId: metadata.requestId,
          timestamp: new Date().toISOString(),
          version: metadata.version ?? '1.0',
        }
      : undefined,
  };
}

/**
 * Error response builder
 */
export function errorResponse<E = Error>(
  error: E,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR
): ApiResponse<never, E> {
  return {
    success: false,
    error,
    code,
  };
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    logger?: Logger;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    logger,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(initialDelayMs * Math.pow(backoffMultiplier, attempt), maxDelayMs);
      logger?.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type-safe environment variable getter
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Deep clone utility with type safety
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Async pipe utility for composing async functions
 */
export function asyncPipe<T>(...fns: Array<(arg: T) => Promise<T>>): (initial: T) => Promise<T> {
  return async (initial: T) => {
    let result = initial;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

/**
 * Memoization decorator
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();

  return (...args: TArgs): TReturn => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

import type { Request, Response, NextFunction } from "express";

/**
 * Options for configuring latency simulation.
 */
export interface LatencyOptions {
  /** Minimum delay in milliseconds. Default: 200 */
  min?: number;
  /** Maximum delay in milliseconds. Default: 800 */
  max?: number;
  /** Probability of error (0 to 1). Default: 0 */
  errorRate?: number;
}

/**
 * Default options.
 */
const DEFAULT_OPTIONS: Required<LatencyOptions> = {
  min: 200,
  max: 800,
  errorRate: 0,
};

/**
 * Sleep for a random duration between min and max.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculates a random delay between min and max.
 */
const getRandomDelay = (min: number, max: number) => {
  // Ensure min <= max
  const actualMin = Math.min(min, max);
  const actualMax = Math.max(min, max);
  return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
};

/**
 * Wraps an async function with artificial latency and potential errors.
 *
 * @param fn The async function to wrap.
 * @param options Configuration options for latency and error simulation.
 * @returns A wrapped function that behaves like the original but with added latency/errors.
 */
export function withLatency<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: LatencyOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T> | void> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
    // Detect Express-like args: [req, res, next, ...]
    // Express handlers usually have (req, res, next)
    const isExpress =
      args.length >= 3 &&
      typeof args[2] === "function" &&
      args[1] &&
      typeof args[1].on === "function";
    const next = isExpress ? args[2] : null;

    // Simulate error
    if (Math.random() < config.errorRate) {
      const delay = getRandomDelay(config.min, config.max);
      await sleep(delay);
      const error = new Error("fake latency injected error");

      if (isExpress && next) {
        return next(error);
      }
      throw error;
    }

    // Simulate latency
    const delay = getRandomDelay(config.min, config.max);
    await sleep(delay);

    return fn(...args);
  };
}

/**
 * Express middleware to add artificial latency to requests.
 * Uses `setTimeout` to delay the call to `next()`.
 */
export function latencyMiddleware(options: LatencyOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    const delay = getRandomDelay(config.min, config.max);

    setTimeout(() => {
      // Simulate error by passing it to next()
      if (Math.random() < config.errorRate) {
        return next(new Error("fake latency injected error"));
      }
      next();
    }, delay);
  };
}

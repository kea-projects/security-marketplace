import { Request, Response } from "express";
import { log } from "../utils/logger";

const maxFailedAuthRequests = 3;
const maxFailed404Requests = 3;
const maxGlobalRequests = 5000;
const rateLimitDuration = 5; // in minutes

export const rateLimiterAuthConfig = {
  windowMs: rateLimitDuration * 60 * 1000, // X minutes `window`
  max: maxFailedAuthRequests, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxFailedAuthRequests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

export const rateLimiter404Config = {
  windowMs: rateLimitDuration * 60 * 1000, // X minutes `window`
  max: maxFailed404Requests, // Limit each IP to X requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxFailed404Requests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

/**
 * Used to limit the bandwidth of the given Ip. Window is only one minute, and all requests are included
 */
export const rateLimiterGlobalConfig = {
  windowMs: 1 * 60 * 1000, // X minutes `window`
  max: maxGlobalRequests, // Limit each IP to X requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You have been making too many requests`,
    };
  },
};

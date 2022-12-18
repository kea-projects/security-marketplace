import { Request, Response } from "express";
import { log } from "../utils/logger";
import { getEnvVar } from "./config.service";

const maxFailedAuthRequests = Number(getEnvVar("AUTH_RATE_LIMIT_LOGIN_SIGNUP")) || 3;
const maxFailed404Requests = Number(getEnvVar("AUTH_RATE_LIMIT_404")) || 3;
const rateLimitDuration = Number(getEnvVar("AUTH_RATE_LIMIT_DURATION")) || 5; // in minutes

let enableRateLimit = getEnvVar("GLOBAL_RATE_LIMIT_ENABLED") === "true";
log.info(`Rate limiting enabled: ${enableRateLimit}`);

export const rateLimiterAuthConfig = {
  windowMs: rateLimitDuration * 60 * 1000, // X minutes `window`
  max: maxFailedAuthRequests, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true,
  skip: (_req: Request, _res: Response) => !enableRateLimit, // Whether the rate limiting should apply at all
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
  skip: (_req: Request, _res: Response) => !enableRateLimit, // Whether the rate limiting should apply at all
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxFailed404Requests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

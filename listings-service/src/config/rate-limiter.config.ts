import { Request, Response } from "express";
import { log } from "../utils/logger";
import { getEnvVar } from "./config.service";

const maxCreateRequests = Number(getEnvVar("LISTINGS_RATE_LIMIT_CREATE")) || 50;
const maxUpdateRequests = Number(getEnvVar("LISTINGS_RATE_LIMIT_UPDATE")) || 50;
const maxDeleteRequests = Number(getEnvVar("LISTINGS_RATE_LIMIT_DELETE")) || 50;
const maxFailed404Requests = Number(getEnvVar("LISTINGS_RATE_LIMIT_404")) || 3;
const maxGlobalRequests = Number(getEnvVar("LISTINGS_RATE_LIMIT_GLOBAL")) || 2000;
const rateLimitDuration = Number(getEnvVar("LISTINGS_RATE_LIMIT_DURATION")) || 5; // in minutes

let enableRateLimit = getEnvVar("GLOBAL_RATE_LIMIT_ENABLED") === "true";
log.info(`Rate limiting enabled: ${enableRateLimit}`);

// ===============
// === Configs ===

const genericConfig = {
  windowMs: rateLimitDuration * 60 * 1000, // X minutes `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true,
  skip: (_req: Request, _res: Response) => !enableRateLimit, // Whether the rate limiting should apply at all
};

/** Limits how many requests in X minutes can be made to the given endpoint */
export const rateLimiterCreateConfig = {
  ...genericConfig,
  max: maxCreateRequests, // Limit each IP to 100 requests per `window`
  skipSuccessfulRequests: false,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxCreateRequests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

/** Limits how many requests in X minutes can be made to the given endpoint */
export const rateLimiterUpdateConfig = {
  ...genericConfig,
  max: maxUpdateRequests, // Limit each IP to 100 requests per `window`
  skipSuccessfulRequests: false,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxUpdateRequests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

/** Limits how many requests in X minutes can be made to the given endpoint */
export const rateLimiterDeleteConfig = {
  ...genericConfig,
  max: maxDeleteRequests, // Limit each IP to 100 requests per `window`
  skipSuccessfulRequests: false,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxDeleteRequests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

export const rateLimiter404Config = {
  ...genericConfig,
  max: maxFailed404Requests, // Limit each IP to X requests per `window`
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
  ...genericConfig,
  windowMs: 1 * 60 * 1000, // X minutes `window`
  max: maxGlobalRequests, // Limit each IP to X requests per `window`
  skipSuccessfulRequests: false,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You have been making too many requests`,
    };
  },
};

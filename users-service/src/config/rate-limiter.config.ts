import { Request } from "express";
import { log } from "../utils/logger";
import { getEnvVar } from "./config.service";

const maxUpdateRequests = Number(getEnvVar("USERS_RATE_LIMIT_UPDATE")) || 50;
const maxFailed404Requests = Number(getEnvVar("USERS_RATE_LIMIT_404")) || 3;
const maxGlobalRequests = Number(getEnvVar("USERS_RATE_LIMIT_GLOBAL")) || 2000;
const rateLimitDuration = Number(getEnvVar("USERS_RATE_LIMIT_DURATION")) || 5; // in minutes

const enableRateLimit = getEnvVar("GLOBAL_RATE_LIMIT_ENABLED") === "true";
log.info(`Rate limiting enabled: ${enableRateLimit}`);

// ===============
// === Configs ===

const genericConfig = {
  windowMs: rateLimitDuration * 60 * 1000, // X minutes `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true,
  skip: () => !enableRateLimit, // Whether the rate limiting should apply at all
};

/** Limits how many requests in X minutes can be made to the given endpoint */
export const rateLimiterUpdateConfig = {
  ...genericConfig,
  max: maxUpdateRequests, // Limit each IP to 100 requests per `window`
  skipSuccessfulRequests: false,
  message: async (req: Request) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxUpdateRequests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

export const rateLimiter404Config = {
  ...genericConfig,
  max: maxFailed404Requests, // Limit each IP to X requests per `window`
  message: async (req: Request) => {
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
  message: async (req: Request) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You have been making too many requests`,
    };
  },
};

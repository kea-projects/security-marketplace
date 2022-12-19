import { Request } from "express";
import { log } from "../utils/logger";
import { getEnvVar } from "./config.service";

const maxFailedAuthRequests = Number(getEnvVar("AUTH_RATE_LIMIT_LOGIN_SIGNUP")) || 3;
const maxFailed404Requests = Number(getEnvVar("AUTH_RATE_LIMIT_404")) || 3;
const rateLimitDuration = Number(getEnvVar("AUTH_RATE_LIMIT_DURATION")) || 5; // in minutes

const enableRateLimit = getEnvVar("GLOBAL_RATE_LIMIT_ENABLED") === "true";
log.info(`Rate limiting enabled: ${enableRateLimit}`);

// ===============
// === Configs ===

const genericConfig = {
  windowMs: rateLimitDuration * 60 * 1000, // X minutes `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skip: () => !enableRateLimit, // Whether the rate limiting should apply at all
};

export const rateLimiterAuthConfig = {
  ...genericConfig,
  max: maxFailedAuthRequests, // Limit each IP to X requests per `window`
  skipSuccessfulRequests: true,
  message: async (req: Request) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxFailedAuthRequests} failed attempts every ${rateLimitDuration} minutes`,
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

import { Request, Response } from "express";
import { log } from "../utils/logger";

const maxFailedRequests = 3;
const rateLimitDuration = 5; // in minutes

export const rateLimiterAuthConfig = {
  windowMs: rateLimitDuration * 60 * 1000, // 15 minutes
  max: maxFailedRequests, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true,
  message: async (req: Request, _res: Response) => {
    log.warn(`Rate limited user ${req.ip} tried to access ${req.url}`);
    return {
      error: "TooManyRequests",
      message: `You can only make ${maxFailedRequests} failed attempts every ${rateLimitDuration} minutes`,
    };
  },
};

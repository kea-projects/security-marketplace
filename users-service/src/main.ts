import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { getEnvVar } from "./config/config.service";
import { corsAcceptAll } from "./config/cors.config";
import { rateLimiter404Config, rateLimiterGlobalConfig } from "./config/rate-limiter.config";
import { logger } from "./middleware/logging.middleware";
import { userRouter } from "./routes/user.routes";
import { UnauthorizedError } from "./utils/error-messages";
import { initializeDb } from "./utils/init-database";
import { log } from "./utils/logger";

const globalLimiter = rateLimit(rateLimiterGlobalConfig);
const unknownLimiter = rateLimit(rateLimiter404Config);
const app = express();
app.use(express.json());
app.use(logger);
app.use(globalLimiter);
// ---------------------Routers------------------------
app.use(userRouter);

// ---------------------Default------------------------
// Reject all non defined paths
app.all("*", unknownLimiter, cors(corsAcceptAll), (req: Request, res: Response) => {
  log.info(`Invalid request: ${req.method} ${req.url}.`);
  log.info(`Request body: ${JSON.stringify(req.body)}`);
  log.info("Rejecting request.");

  res.status(401).send(new UnauthorizedError());
});

// -------------------App-Launch-----------------------
const PORT: number = Number(getEnvVar("USERS_PORT") || 5000);

const main = async () => {
  await initializeDb();

  app.listen(PORT, () => {
    log.info(`Backend App is running on port: ${PORT}`);
  });
};

main();

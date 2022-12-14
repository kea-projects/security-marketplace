import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { corsAcceptAll } from "./config/cors.config";
import { rateLimiter404Config } from "./config/rate-limiter.config";
import { initializeDb } from "./database/database.service";
import { logger } from "./middleware/logging.middleware";
import { authRouter } from "./routes/auth.routes";
import { log } from "./utils/logger";

const unknownLimiter = rateLimit(rateLimiter404Config);
const app = express();
app.use(express.json());
app.use(logger);
app.set("trust proxy", 1);

// ---------------------Routers------------------------
app.use("/auth", authRouter);

// ---------------------Default------------------------
// Reject all non defined paths
app.all("*", cors(corsAcceptAll), unknownLimiter, (req: Request, res: Response) => {
  log.info(`Invalid request: ${req.method} ${req.url}.`);
  log.info(`Request body: ${JSON.stringify(req.body)}`);
  log.info("Rejecting request.");

  res.status(401).send({
    error: "UnauthorizedError",
    detail: "Unauthorized",
  });
});

// -------------------App-Launch-----------------------
const PORT: number = Number(process.env.AUTH_PORT) || 8080;
app.listen(PORT, async () => {
  if (!(await initializeDb())) {
    log.error(`SHUTTING DOWN due to issues with the database connection!`);
    return process.exit(1);
  }
  log.info(`Auth Server has started on port: ${PORT}`);
  return;
});

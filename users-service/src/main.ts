import cors from "cors";
import express, { Request, Response } from "express";
import { getEnvOrExit } from "./config/secrets";
import { logger } from "./middleware/logging.middleware";
import { userRouter } from "./routes/user.routes";
import { initializeDb } from "./utils/init-database";
import { log } from "./utils/logger";

const app = express();
app.use(express.json());
app.use(logger);

// -----------------------CORS-------------------------
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ---------------------Routers------------------------
app.use(userRouter);

// ---------------------Default------------------------
// Reject all non defined paths
app.all("*", (req: Request, res: Response) => {
  log.info(`Invalid request: ${req.method} ${req.url}.`);
  log.info(`Request body: ${JSON.stringify(req.body)}`);
  log.info("Rejecting request.");

  res.status(401).send();
});

// -------------------App-Launch-----------------------
const PORT: number = Number(getEnvOrExit("APP_PORT") || 5000);

const main = async () => {
  await initializeDb();
  app.listen(PORT, () => {
    log.info(`Backend App is running on port: ${PORT}`);
  });
};

main();

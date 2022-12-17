import cors from "cors";
import express from "express";
import { initializeDb } from "./database/database.service";
import { logger } from "./middleware/logging.middleware";
import { authRouter } from "./routes/auth.routes";
import { log } from "./utils/logger";

const app = express();
app.use(express.json());
app.use(logger);
// -----------------------CORS-------------------------
const corsOptions = {
  origin: "*", // TODO - discuss the the cors rules
};
app.use(cors(corsOptions));

// ---------------------Routers------------------------
app.use("/auth", authRouter);

// Reject all non defined paths
app.all("*", (_req, res) => {
  res.status(401).send({ message: "Unauthorized" });
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

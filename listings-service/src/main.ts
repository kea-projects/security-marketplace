import cors from "cors";
import express from "express";
import { initializeDb } from "./database/database.service";
import { logger } from "./middleware/logging.middleware";
import { commentsRouter } from "./routes/comments.routes";
import { listingsRouter } from "./routes/listings.routes";
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
app.use("/listings", listingsRouter);
app.use("/comments", commentsRouter);

// Reject all non defined paths
app.all("*", (_req, res) => {
  res.status(401).send({ message: "Unauthorized" });
});

// -------------------App-Launch-----------------------
const PORT: number = Number(process.env.LISTINGS_PORT) || 8081;
app.listen(PORT, async () => {
  if (!(await initializeDb())) {
    log.error(`SHUTTING DOWN due to issues with the database connection!`);
    return process.exit(1);
  }
  log.info(`Listings Server has started on port: ${PORT}`);
  return;
});

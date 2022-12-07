import chalk from "chalk";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { initializeDb } from "./database/database.service";
import { logger } from "./middleware/logging.middleware";
import { listingsRouter } from "./routes/listings.routes";

const app = express();
app.use(express.json());
app.use(logger);
// -----------------------CORS-------------------------
const corsOptions = {
  origin: "*", // TODO - discuss the the cors rules
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ---------------------Routers------------------------
app.use("/listings", listingsRouter);

// Reject all non defined paths
app.all("*", (_req, res) => {
  res.status(401).send({ message: "Unauthorized" });
});

// -------------------App-Launch-----------------------
const PORT: number = Number(process.env.LISTINGS_PORT) || 8081;
app.listen(PORT, async () => {
  if (!(await initializeDb())) {
    console.log(
      new Date().toISOString() + chalk.redBright(` [ERROR] SHUTTING DOWN due to issues with the database connection`!)
    );
    return process.exit(1);
  }
  console.log(new Date().toISOString() + chalk.yellowBright(` [INFO] Listings Server has started on port: ${PORT}`));
  return;
});

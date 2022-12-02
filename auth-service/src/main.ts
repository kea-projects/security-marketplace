import chalk from "chalk";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { initializeDb } from "./database/database.service";
import { logger } from "./middleware/logging.middleware";
import { authRouter } from "./routes/auth.routes";

const app = express();
app.use(express.json());
app.use(logger);
// -----------------------CORS-------------------------
const corsOptions = {
  origin: "*",
  methods: ["POST"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ---------------------Routers------------------------
app.use("/auth", authRouter);

// Reject all non defined paths
app.all("*", (_req, res) => {
  res.status(401).send();
});

// -------------------App-Launch-----------------------
const PORT: number = Number(process.env.APP_PORT) || 5000;
app.listen(PORT, async () => {
  if (!(await initializeDb())) {
    console.log(
      new Date().toISOString() + chalk.redBright(` [ERROR] SHUTTING DOWN due to issues with the database connection`!)
    );
    return process.exit(1);
  }
  console.log(new Date().toISOString() + chalk.yellowBright(` [INFO] Auth Server has started on port: ${PORT}`));
  return;
});

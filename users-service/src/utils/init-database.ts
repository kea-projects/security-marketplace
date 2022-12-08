import { exit } from "process";
import { SequelizeSingleton } from "../config/database.config";
import { log } from "./logger";

const initializeDb = async () => {
  log.info("Initializing database ...");

  try {
    await SequelizeSingleton.getInstance().sync({ alter: true });
  } catch (error) {
    log.error(`Unable to connect to database! error: ${error.original}`)
    exit(2)
  }
  log.info("Database initialization complete.");
};

export { initializeDb };

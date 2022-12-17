import * as dotenv from "dotenv";
import { log } from "../utils/logger";
dotenv.config({ path: "./.env" });
/**
 * Load an environment variable.
 * @param varName variable name.
 * @param exitOnMissing exit the application if the variable is missing. Defaults to false
 * @returns the environment variable if found, or null if not it doesn't exist.
 */
export const getEnvVar = (varName: string, exitOnMissing: boolean = false) => {
  // Check if the necessary environment variables are present
  if (!process.env[varName]) {
    if (exitOnMissing) {
      log.error(`${varName} is missing from environment variables, shutting down!`);
      process.exit(1);
    }
    log.warn(`${varName} is missing from environment variables, some functionality may not work!`);
    return null;
  } else {
    return process.env[varName];
  }
};

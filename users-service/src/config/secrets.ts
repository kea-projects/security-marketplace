import * as dotenv from "dotenv";
import { log } from "../utils/logger";
dotenv.config({ path: "./.env" });

const getEnv = (varName: string): string | null => {
  if (!process.env[varName]) {
    return null;
  } else {
    return process.env[varName]!;
  }
};

const getEnvOrExit = (varName: string): string => {
  if (!process.env[varName]) {
    log.error(`${varName} is missing from environment variables, exiting...`);
    process.exit(1);
  } else {
    return process.env[varName]!;
  }
};

export { getEnv, getEnvOrExit };

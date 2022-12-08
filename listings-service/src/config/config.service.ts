import { log } from "../utils/logger";

export const getEnvVar = (varName: string, exitOnMissing: boolean = true) => {
  // Check if the necessary environment variables are present
  if (!process.env[varName]) {
    if (exitOnMissing) {
      log.error(`${varName} is missing from environment variables, shutting down!`);
      process.exit(0);
    }
    log.warn(`${varName} is missing from environment variables, some functionality may not work!`);
    return null;
  } else {
    return process.env[varName] as string;
  }
};

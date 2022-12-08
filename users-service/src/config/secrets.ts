import * as dotenv from "dotenv"
dotenv.config({path: "./.env"})

const getEnv = (varName: string): string | null => {
  if (!process.env[varName]) {
    return null;
  } else {
    return process.env[varName]!;
  }
};

const getEnvOrExit = (varName: string): string => {
    if (!process.env[varName]) {
        console.log(`[ERROR] ${varName} is missing from environment variables, exiting...`);
        process.exit(0);
    } else {
      return process.env[varName]!;
    }
};
  
export { getEnv, getEnvOrExit }

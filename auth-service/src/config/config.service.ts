import chalk from "chalk";

export const getEnvVar = (varName: string, exitOnMissing: boolean = true) => {
  // Check if the necessary environment variables are present
  if (!process.env[varName]) {
    if (exitOnMissing) {
      console.log(chalk.redBright(`[ERROR] ${varName} is missing from environment variables, shutting down!`));
      process.exit(0);
    }
    return null;
  } else {
    return process.env[varName];
  }
};

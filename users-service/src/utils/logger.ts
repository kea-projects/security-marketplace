import chalk from "chalk";

class log {
  public static trace(text: string) {
    const dateTime = new Date().toISOString();
    console.info(`[ ${dateTime} ]` + chalk.cyan(" [TRACE] ") + `${text}`);
  }

  public static info(text: string) {
    const dateTime = new Date().toISOString();
    console.info(`[ ${dateTime} ]` + chalk.green("  [INFO] ") + `${text}`);
  }

  public static warn(text: string) {
    const dateTime = new Date().toISOString();
    console.info(`[ ${dateTime} ]` + chalk.yellow("  [WARN] ") + `${text}`);
  }

  public static error(text: string, error?: unknown) {
    const dateTime = new Date().toISOString();
    console.error(`[ ${dateTime} ]` + chalk.red(" [ERROR] ") + `${text}`, error);
  }
}

export { log };

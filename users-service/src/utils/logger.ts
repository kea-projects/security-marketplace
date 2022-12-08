import chalk from "chalk";

class log {
  /**
   * static name
   */
  public static info(text: any) {
    const dateTime = new Date().toISOString();
    console.info(`[ ${dateTime} ]` + chalk.green(" [INFO] ") + `${text}`);
  }

  public static warn(text: any) {
    const dateTime = new Date().toISOString();
    console.info(`[ ${dateTime} ]` + chalk.yellow(" [WARN] ") + `${text}`);
  }

  public static error(text: any) {
    const dateTime = new Date().toISOString();
    console.error(`[ ${dateTime} ]` + chalk.red(" [ERR]  ") + `${text}`);
  }
}

export { log };

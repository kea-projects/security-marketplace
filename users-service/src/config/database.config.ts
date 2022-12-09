import { Sequelize } from "sequelize";
import { log } from "../utils/logger";
import { getEnv, getEnvOrExit } from "./secrets";

const log_flag = JSON.parse(getEnv("USERS_POSTGRES_LOG") || "false") ? console.log : false;

class SequelizeSingleton {
  private static instance: Sequelize;

  private constructor() {}
  public static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      log.info("Connecting to database...");
      SequelizeSingleton.instance = new Sequelize(
        getEnvOrExit("MAIN_POSTGRES_DATABASE"),
        getEnvOrExit("MAIN_POSTGRES_USER"),
        getEnvOrExit("MAIN_POSTGRES_PASSWORD"),
        {
          host: getEnvOrExit("MAIN_POSTGRES_HOST"),
          port: Number(getEnvOrExit("MAIN_POSTGRES_PORT")),
          dialect: "postgres",
          logging: log_flag,
        }
      );
      log.info("Sequelize connection created.");
    }

    return SequelizeSingleton.instance;
  }
}

export { SequelizeSingleton };

import { Sequelize } from "sequelize";
import { log } from "../utils/logger";
import { getEnv, getEnvOrExit } from "./secrets";

const log_flag = JSON.parse(getEnv("SEQUELIZE_LOG") || "false") ? console.log : false;

class SequelizeSingleton {
  private static instance: Sequelize;

  private constructor() {}
  public static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      log.info("Connecting to database...");
      SequelizeSingleton.instance = new Sequelize(
        getEnvOrExit("POSTGRES_DABA"),
        getEnvOrExit("POSTGRES_USER"),
        getEnvOrExit("POSTGRES_PASS"),
        {
          host: getEnvOrExit("POSTGRES_HOST"),
          port: Number(getEnvOrExit("POSTGRES_PORT")),
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

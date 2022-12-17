import { Sequelize } from "sequelize";
import { log } from "../utils/logger";
import { getEnvVar } from "./secrets";

const log_flag = JSON.parse(getEnvVar("USERS_POSTGRES_LOG") || "false") ? console.log : false;

class SequelizeSingleton {
  private static instance: Sequelize;

  private constructor() {}
  public static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      log.info("Connecting to database...");
      SequelizeSingleton.instance = new Sequelize(
        getEnvVar("USERS_POSTGRES_DATABASE", true) as string,
        getEnvVar("USERS_POSTGRES_USER", true) as string,
        getEnvVar("USERS_POSTGRES_PASSWORD", true) as string,
        {
          host: getEnvVar("USERS_POSTGRES_HOST", true) as string,
          port: Number(getEnvVar("USERS_POSTGRES_PORT", true) as string),
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

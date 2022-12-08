import { Sequelize } from "sequelize";
import { getEnv, getEnvOrExit } from "./secrets";

const log_flag = JSON.parse(getEnv("SEQUELIZE_LOG") || "false") ? console.log : false;

const sequelize = new Sequelize(
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

console.info("Sequelize connection created.");
export { sequelize };

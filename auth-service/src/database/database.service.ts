import { Sequelize } from "sequelize";
import { getEnvVar } from "../config/config.service";
import { log } from "../utils/logger";
import { AuthUser, AuthUserInit } from "./models/auth-user.model";
import { TokenInit } from "./models/token.model";
import { users } from "./users.contants";

let sequelize: Sequelize;

async function initializeDb(): Promise<boolean> {
  sequelize = new Sequelize({
    username: getEnvVar("AUTH_POSTGRES_USER", true) as string,
    password: getEnvVar(`AUTH_POSTGRES_PASSWORD`, true) as string,
    host: getEnvVar("AUTH_POSTGRES_HOST", true) as string,
    port: Number(getEnvVar("AUTH_POSTGRES_PORT", true) as string),
    database: getEnvVar("AUTH_POSTGRES_DATABASE", true) as string,
    dialect: "postgres",
    logging: false,
  });
  // Check the connection
  try {
    await sequelize.authenticate();
    log.info(`Connected to the PostgreSQL database`);
  } catch (error) {
    log.error(`Database connection error`, error);
    return false;
  }
  // Load the models
  try {
    loadDbModels(sequelize);
    log.info(`The database models have been loaded`);
  } catch (error) {
    log.error(`Failed to load database models!`, error);
    sequelize.close();
    return false;
  }
  // Sync the database schema with the models
  try {
    await sequelize.sync({
      force: getEnvVar("AUTH_POSTGRES_SYNC") === "true",
      alter: getEnvVar("AUTH_POSTGRES_SYNC") === "true",
    });
    log.info(`The schema has been synced`);
  } catch (error) {
    log.error(`Failed to sync the schema!`, error);
    sequelize.close();
    return false;
  }
  // Populate the database
  if (getEnvVar("AUTH_POSTGRES_POPULATE")) {
    try {
      await AuthUser.bulkCreate(users, {
        updateOnDuplicate: ["userId", "email", "password", "role"],
        returning: true,
      });
      log.info(`The auth database has been populated`);
    } catch (error) {
      log.error(`Failed to populate the auth database!`, error);
    }
  }

  return true;
}

/**
 * Simple function to initialize the Sequelize models.\
 * Allows the connection initialization to happen at any point during runtime.
 *
 * @param sequelize - An initialized sequelize instance
 */
function loadDbModels(sequelize: Sequelize): void {
  // Define all Models
  AuthUserInit(sequelize);
  TokenInit(sequelize);
  // Define all Associations
}

export { initializeDb, sequelize };

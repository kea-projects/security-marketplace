import chalk from "chalk";
import { Sequelize } from "sequelize";
import { getEnvVar } from "../config/config.service";
import { Role } from "../interfaces";
import { AuthUser, AuthUserInit } from "./models/auth-user.model";

let sequelize: Sequelize;

async function initializeDb(): Promise<boolean> {
  const connectionString = `postgres://${getEnvVar("AUTH_POSTGRES_USER")}:${getEnvVar(
    "AUTH_POSTGRES_PASSWORD"
  )}@${getEnvVar("AUTH_POSTGRES_HOST")}:${getEnvVar("AUTH_POSTGRES_PORT")}/${getEnvVar("AUTH_POSTGRES_DATABASE")}`;

  sequelize = new Sequelize(connectionString, {
    logging: false,
  });
  // Check the connection
  try {
    await sequelize.authenticate();
    console.log(new Date().toISOString() + chalk.greenBright(` [INFO] Connected to the PostgreSQL database!`));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Database connection error!`, error.stack));
    return false;
  }
  // Load the models
  try {
    loadDbModels(sequelize);
    console.log(new Date().toISOString() + chalk.greenBright(` [INFO] The database models have been loaded`));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to load database models!`, error.stack));
    sequelize.close();
    return false;
  }
  // Sync the database schema with the models
  try {
    await sequelize.sync({
      force: Boolean(getEnvVar("AUTH_POSTGRES_DROP", false)) || false,
      alter: Boolean(getEnvVar("AUTH_POSTGRES_SYNC", false)) || false,
    });
    console.log(new Date().toISOString() + chalk.greenBright(` [INFO] The schema has been synced`));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to sync the schema!`, error.stack));
    sequelize.close();
    return false;
  }
  // Populate the database
  if (getEnvVar("AUTH_POSTGRES_POPULATE")) {
    try {
      await AuthUser.bulkCreate([
        { username: "user@example.com", password: "abcDEF123" },
        { username: "admin@example.com", password: "abcDEF123", role: Role.admin },
      ]);
      console.log(new Date().toISOString() + chalk.greenBright(` [INFO] The auth database has been populated`));
    } catch (error) {
      console.log(
        new Date().toISOString() + chalk.redBright(` [ERROR] Failed to populate the auth database!`, error.stack)
      );
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
  // Define all Associations
}

export { initializeDb };

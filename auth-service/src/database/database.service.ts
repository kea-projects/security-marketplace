import chalk from "chalk";
import { Sequelize } from "sequelize";
import { getEnvVar } from "../config/config.service";
import { Role } from "../interfaces";
import { AuthenticationService } from "../services/authentication.service";
import { AuthUser, AuthUserInit } from "./models/auth-user.model";
import { TokenInit } from "./models/token.model";

let sequelize: Sequelize;

async function initializeDb(): Promise<boolean> {
  // TODO - switch to variable-based config instead of connection string. Connection strings may potentially be stored in plain text when connecting to the database
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
      force: getEnvVar("AUTH_POSTGRES_SYNC", false) === "true",
      alter: getEnvVar("AUTH_POSTGRES_SYNC", false) === "true",
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
      const hashedPassword = await AuthenticationService.encodePassword("abcDEF123");
      await AuthUser.bulkCreate(
        [
          { username: "user@example.com", password: hashedPassword },
          { username: "admin@example.com", password: hashedPassword, role: Role.admin },
        ],
        { updateOnDuplicate: ["username", "password"], returning: true }
      );
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
  TokenInit(sequelize);
  // Define all Associations
}

export { initializeDb, sequelize };

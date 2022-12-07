import chalk from "chalk";
import { Sequelize } from "sequelize";
import { getEnvVar } from "../config/config.service";
import { listings } from "./listings.constant";
import { Listing, ListingInit } from "./models/listing.model";

let sequelize: Sequelize;

async function initializeDb(): Promise<boolean> {
  // TODO - switch to variable-based config instead of connection string. Connection strings may potentially be stored in plain text when connecting to the database
  const connectionString = `postgres://${getEnvVar("MAIN_POSTGRES_USER")}:${getEnvVar(
    "MAIN_POSTGRES_PASSWORD"
  )}@${getEnvVar("MAIN_POSTGRES_HOST")}:${getEnvVar("MAIN_POSTGRES_PORT")}/${getEnvVar("MAIN_POSTGRES_DATABASE")}`;

  sequelize = new Sequelize(connectionString, {
    logging: true,
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
      force: getEnvVar("MAIN_POSTGRES_SYNC", false) === "true",
      alter: getEnvVar("MAIN_POSTGRES_SYNC", false) === "true",
    });
    console.log(new Date().toISOString() + chalk.greenBright(` [INFO] The schema has been synced`));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to sync the schema!`, error.stack));
    sequelize.close();
    return false;
  }
  // Populate the database
  if (getEnvVar("MAIN_POSTGRES_POPULATE")) {
    try {
      await Listing.bulkCreate([...listings], {
        updateOnDuplicate: ["name", "description", "imageUrl", "createdBy"],
        returning: true,
      });
      console.log(new Date().toISOString() + chalk.greenBright(` [INFO] The main database has been populated`));
    } catch (error) {
      console.log(
        new Date().toISOString() + chalk.redBright(` [ERROR] Failed to populate the main database!`, error.stack)
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
  ListingInit(sequelize);
  // Define all Associations
}

export { initializeDb, sequelize };

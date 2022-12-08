import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { Sequelize } from "sequelize";
import { getEnvVar } from "../config/config.service";
import { FilesService } from "../services/files.service";
import { comments } from "./comments.constant";
import { listings } from "./listings.constant";
import { Comment, CommentInit } from "./models/comment.model";
import { Listing, ListingInit } from "./models/listing.model";

let sequelize: Sequelize;

async function initializeDb(): Promise<boolean> {
  // TODO - switch to variable-based config instead of connection string. Connection strings may potentially be stored in plain text when connecting to the database
  const connectionString = `postgres://${getEnvVar("LISTINGS_POSTGRES_USER")}:${getEnvVar(
    "LISTINGS_POSTGRES_PASSWORD"
  )}@${getEnvVar("LISTINGS_POSTGRES_HOST")}:${getEnvVar("LISTINGS_POSTGRES_PORT")}/${getEnvVar(
    "LISTINGS_POSTGRES_DATABASE"
  )}`;

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
      force: getEnvVar("LISTINGS_POSTGRES_SYNC", false) === "true",
      alter: getEnvVar("LISTINGS_POSTGRES_SYNC", false) === "true",
    });
    console.log(new Date().toISOString() + chalk.greenBright(` [INFO] The schema has been synced`));
  } catch (error) {
    console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to sync the schema!`, error.stack));
    sequelize.close();
    return false;
  }
  // Populate the database
  if (getEnvVar("LISTINGS_POSTGRES_POPULATE", false) === "true") {
    try {
      if (getEnvVar("LISTINGS_LINODE_POPULATE", false) === "true") {
        console.log(
          new Date().toISOString() + chalk.greenBright(` [INFO] Populating Linode object storage, may take a minute`)
        );

        // The file that will be uploaded to Linode
        const documentBuffer = fs.readFileSync(path.join(__dirname, "/assets/image.jpg"));
        // Upload a file for each listing
        let count = 0;
        for (const listing of listings) {
          const uploadedFile = await FilesService.uploadFile(
            documentBuffer,
            FilesService.getFilename(listing.listingId, "image.jpg"),
            true
          );
          listing.imageUrl = uploadedFile.url;
          count++;
          if (Math.floor((count / listings.length) * 100) % 10 === 0) {
            console.log(
              new Date().toISOString() + chalk.cyan(`[VERBOSE] ${Math.floor((count / listings.length) * 100)}%`)
            );
          }
        }
      } else {
        for (const listing of listings) {
          listing.imageUrl = FilesService.getResourceUrl(listing.listingId, "image.jpg");
        }
      }
      await Listing.bulkCreate([...listings], {
        updateOnDuplicate: ["listingId", "name", "description", "imageUrl", "createdBy", "isPublic"],
        returning: true,
      });
      await Comment.bulkCreate([...comments], {
        updateOnDuplicate: ["commentId", "name", "email", "comment", "createdBy", "commentedOn", "createdAt"],
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
  CommentInit(sequelize);
  // Define all Associations
}

export { initializeDb, sequelize };

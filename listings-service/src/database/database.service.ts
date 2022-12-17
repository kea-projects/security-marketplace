import * as fs from "fs";
import * as path from "path";
import { Sequelize } from "sequelize";
import { getEnvVar } from "../config/config.service";
import { FilesService } from "../services/files.service";
import { log } from "../utils/logger";
import { comments } from "./comments.constant";
import { listings } from "./listings.constant";
import { Comment, CommentInit } from "./models/comment.model";
import { Listing, ListingInit } from "./models/listing.model";

let sequelize: Sequelize;

async function initializeDb(): Promise<boolean> {
  sequelize = new Sequelize({
    username: getEnvVar("LISTINGS_POSTGRES_USER", true) as string,
    password: getEnvVar(`LISTINGS_POSTGRES_PASSWORD`, true) as string,
    host: getEnvVar("LISTINGS_POSTGRES_HOST", true) as string,
    port: Number(getEnvVar("LISTINGS_POSTGRES_PORT", true) as string),
    database: getEnvVar("LISTINGS_POSTGRES_DATABASE", true) as string,
    dialect: "postgres",
    logging: false,
  });

  // Check the connection
  try {
    await sequelize.authenticate();
    log.info(`Connected to the PostgreSQL database`);
  } catch (error) {
    log.error(`Database connection error!`, error);
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
      force: getEnvVar("LISTINGS_POSTGRES_SYNC") === "true",
      alter: getEnvVar("LISTINGS_POSTGRES_SYNC") === "true",
    });
    log.info(`The schema has been synced`);
  } catch (error) {
    log.error(`Failed to sync the schema!`, error);
    sequelize.close();
    return false;
  }

  // Populate the database
  if (getEnvVar("LISTINGS_POSTGRES_POPULATE") === "true") {
    try {
      if (getEnvVar("LISTINGS_LINODE_POPULATE") === "true") {
        log.info(`Populating Linode object storage, may take a minute`);

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
            log.trace(`${Math.floor((count / listings.length) * 100)}%`);
          }
        }
      } else {
        // Adjust the listing imageUrl but don't upload the file
        for (const listing of listings) {
          listing.imageUrl = FilesService.getResourceUrl(listing.listingId, "image.jpg");
        }
      }

      // Create the database data
      await Listing.bulkCreate([...listings], {
        updateOnDuplicate: ["listingId", "name", "description", "imageUrl", "createdBy", "isPublic"],
        returning: true,
      });
      await Comment.bulkCreate([...comments], {
        updateOnDuplicate: ["commentId", "name", "email", "comment", "createdBy", "commentedOn", "createdAt"],
        returning: true,
      });
      log.info(`The main database has been populated`);
    } catch (error) {
      log.error(`Failed to populate the main database!`, error);
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

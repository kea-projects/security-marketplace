import * as fs from "fs";
import * as path from "path";
import { exit } from "process";
import { users } from "../assets/users.contant";
import { SequelizeSingleton } from "../config/database.config";
import { getEnvVar } from "../config/secrets";
import { User } from "../models/userModel";
import { FilesService } from "./file-uploader";
import { log } from "./logger";

const initializeDb = async () => {
  log.info("Initializing database ...");

  // Check if the connection works
  try {
    await SequelizeSingleton.getInstance().authenticate();
  } catch (error) {
    log.error(`Unable to connect to database! error: ${error.original}`);
    exit(2);
  }

  // Sync the database model
  try {
    await SequelizeSingleton.getInstance().sync({
      force: getEnvVar("USERS_POSTGRES_SYNC") === "true",
      alter: getEnvVar("USERS_POSTGRES_SYNC") === "true",
    });
    log.info(`Synced the Users service database`);
  } catch (error) {
    log.error(`Failed to sync the database! error: ${error.original}`);
  }

  await populateDb();

  log.info("Database initialization complete.");
};

async function populateDb() {
  // Populate the database
  if (getEnvVar("USERS_POSTGRES_POPULATE")) {
    try {
      if (getEnvVar("USERS_LINODE_POPULATE")) {
        log.info(`Populating Linode object storage, may take a minute`);

        // The file that will be uploaded to Linode
        const documentBuffer = fs.readFileSync(path.join(__dirname, "../assets/image.jpg"));
        // Upload a file for each listing
        let count = 0;
        for (const user of users) {
          const uploadedFile = await FilesService.uploadFile(
            documentBuffer,
            FilesService.getFilename(user.userId, "image.jpg"),
            true
          );
          user.pictureUrl = uploadedFile.url;
          count++;
          if (Math.floor((count / users.length) * 100) % 10 === 0) {
            log.info(`${Math.floor((count / users.length) * 100)}%`);
          }
        }
      } else {
        // Adjust the user pictureUrl but don't upload the file
        for (const user of users) {
          user.pictureUrl = FilesService.getResourceUrl(user.userId, "image.jpg");
        }
      }

      // Create the database data
      await User.bulkCreate([...users], {
        updateOnDuplicate: ["userId", "name", "description", "pictureUrl"],
        returning: true,
      });
      log.info(`The users database has been populated`);
    } catch (error) {
      log.error(`Failed to populate the users database!`, error);
    }
  }
}

export { initializeDb };

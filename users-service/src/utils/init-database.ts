import * as fs from "fs";
import * as path from "path";
import { exit } from "process";
import { users } from "../assets/users.contant";
import { SequelizeSingleton } from "../config/database.config";
import { getEnv } from "../config/secrets";
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
      force: getEnv("USERS_POSTGRES_SYNC") === "true" ? true : false,
      alter: getEnv("USERS_POSTGRES_SYNC") === "true" ? true : false,
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
  if (getEnv("USERS_POSTGRES_POPULATE")) {
    try {
      if (getEnv("USERS_LINODE_POPULATE")) {
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
        for (const user of users) {
          user.pictureUrl = FilesService.getResourceUrl(user.userId, "image.jpg");
        }
      }
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

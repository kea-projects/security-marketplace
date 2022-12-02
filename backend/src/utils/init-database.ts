import { sequelize } from "../config/database.config";
import { associateListingWithUser } from "../models/listingModel";
import { associateUserWithListing } from "../models/userModel";

const initializeDb = async () => {
  console.log("Initializing database ...");
  associateUserWithListing();
  associateListingWithUser();
  await sequelize.sync({ alter: true });
  console.log("DB initialization complete.");
  
};

export { initializeDb };

import { sequelize } from "../config/database.config";
import { associateMarketEntryWithUser } from "../models/listingModel";
import { associateUserWithMarketEntry } from "../models/userModel";

const initializeDb = () => {
  associateUserWithMarketEntry();
  associateMarketEntryWithUser();
  sequelize.sync({ alter: true });
};

export { initializeDb };

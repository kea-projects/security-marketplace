import { MarketEntry } from "../models/marketEntryModel";
import { User } from "../models/userModel";

const initializeDb = () => {
  User.sync({ alter: true });
  MarketEntry.sync({ alter: true });
};

export { initializeDb };

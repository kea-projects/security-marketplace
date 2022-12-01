import { sequelize } from "../config/database.config";

const initializeDb = () => {
  sequelize.sync({ alter: true });
};

export { initializeDb };

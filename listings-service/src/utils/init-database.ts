import { sequelize } from "../config/database.config";


const initializeDb = async () => {
  console.log("Initializing database ...");
  await sequelize.sync({ alter: true });
  console.log("DB initialization complete.");
  
};

export { initializeDb };

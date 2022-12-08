import { SequelizeSingleton } from "../config/database.config";

const initializeDb = async () => {
  console.info("Initializing database ...");

  await SequelizeSingleton.getInstance().sync({ alter: true });
  console.info("Database initialization complete.");
};

export { initializeDb };

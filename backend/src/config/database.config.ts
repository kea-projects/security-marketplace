import { Sequelize } from "sequelize";

const sequelize = new Sequelize("sqlite::memory");

export { sequelize };

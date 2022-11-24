import { Sequelize } from "sequelize";

const log_flag = JSON.parse(process.env.LOG || "true")

const sequelize = new Sequelize("sqlite::memory", { logging: log_flag });

export { sequelize };

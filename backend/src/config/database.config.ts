import { Sequelize } from "sequelize";

const log_flag = JSON.parse(process.env.LOG || "false") ? console.log : false

const sequelize = new Sequelize("sqlite::memory", { logging: log_flag, define: {timestamps: false} });

export { sequelize };

import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";

class User extends Model {
  declare username: string;
  declare password: string;
  declare fullName: string;
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

export { User };

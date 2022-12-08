import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";

class User extends Model {
  declare userId: typeof DataTypes.UUIDV4;
  declare email: string;
  declare name: string;
  declare pictureUrl: string | undefined;
}

User.init(
  {
    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
      field: "user_id",
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      field: "email",
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: "name",
    },
    pictureUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "picture_url",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

export { User };

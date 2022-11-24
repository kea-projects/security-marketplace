import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";
import { MarketEntry } from "./marketEntryModel";

class User extends Model {
  declare id: number;
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

const associateUserWithMarketEntry = () => {
  User.hasMany(MarketEntry, {foreignKey: {
    name: "marketEntryId",
    field: "market_entry_id"
  }});
}

export { User, associateUserWithMarketEntry };

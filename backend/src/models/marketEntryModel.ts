import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";

class MarketEntry extends Model {
  declare title: string;
  declare content: string;
}

MarketEntry.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "MarketEntry",
    tableName: "market_entries",
  }
);

export { MarketEntry };

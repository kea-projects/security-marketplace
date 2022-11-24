import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";
import { User } from "./userModel";

class MarketEntry extends Model {
  declare id: number;
  declare userId: number;
  declare title: string;
  declare content: string;
}

MarketEntry.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
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

const associateMarketEntryWithUser = () => {
  MarketEntry.belongsTo(User, {foreignKey: {
    name: "userId",
    field: "user_id"
  }});
};

export { MarketEntry, associateMarketEntryWithUser };

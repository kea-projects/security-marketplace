import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";
import { Listing } from "./listingModel";

class User extends Model {
  declare userId: typeof DataTypes.UUIDV4;
  declare email: string;
  declare name: string;
  declare pictureUrl: string;
}

User.init(
  {
    userId: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
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
      allowNull: false,
      field: "picture_url",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

const associateUserWithListing = () => {
  User.hasMany(Listing, {
    foreignKey: {
      name: "createdBy",
      field: "created_by",
    },
  });
};

export { User, associateUserWithListing };

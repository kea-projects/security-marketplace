import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";
import { User } from "./userModel";

class Listing extends Model {
  declare listingId: typeof DataTypes.UUIDV4;
  declare name: string;
  declare description: string;
  declare imageUrl: string;

  // Foreign key of User
  declare createdBy: typeof DataTypes.UUIDV4;
}

Listing.init(
  {
    listingId: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
      field: "listing_id",
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      // unique: true, // TODO: ?
      field: "name",
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false, // TODO: ?
      field: "description",
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false, // TODO: ?
      // unique: true, // TODO: ?
      field: "image_url",
    },
  },
  {
    sequelize,
    modelName: "Listing",
    tableName: "listings",
  }
);

const associateListingWithUser = () => {
  Listing.belongsTo(User, {
    foreignKey: {
      name: "createdBy",
      field: "created_by",
    },
  });
};

export { Listing, associateListingWithUser };

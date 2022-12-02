import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";

class Listing extends Model {
  declare listingId: typeof DataTypes.UUIDV4;
  declare name: string;
  declare description: string;
  declare imageUrl: string;

  // User.user_id
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
      allowNull: false,
      field: "description",
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false, // TODO: ?
      // unique: true, // TODO: ?
      field: "image_url",
    },
    createdBy: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      field: "created_by",
    },
  },
  {
    sequelize,
    modelName: "Listing",
    tableName: "listings",
  }
);

export { Listing };

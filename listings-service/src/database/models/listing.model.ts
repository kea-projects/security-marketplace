import { DataTypes, Model, Sequelize } from "sequelize";
import { IBase } from "../../interfaces";

export interface IListing extends IBase {
  listingId?: string;
  name: string;
  description: string;
  imageUrl: string;
  createdBy: string;
}

export class Listing extends Model implements IListing {
  declare listingId?: string | undefined;
  declare name: string;
  declare description: string;
  declare imageUrl: string;
  declare createdBy: string;
}
export const ListingInit = (sequelize: Sequelize) => {
  Listing.init(
    {
      listingId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize: sequelize,
      modelName: "Listing",
      tableName: "listings",
      timestamps: true,
    }
  );
};

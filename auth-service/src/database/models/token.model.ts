import { DataTypes, Model, Sequelize } from "sequelize";
import { IBase } from "../../interfaces";

export interface IToken extends IBase {
  tokenId?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export class Token extends Model implements IToken {
  declare tokenId: string;
  declare accessToken: string;
  declare refreshToken: string;
  declare expiresAt: Date;
}
export const TokenInit = (sequelize: Sequelize) => {
  Token.init(
    {
      tokenId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      accessToken: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize: sequelize,
      modelName: "Token",
      tableName: "tokens",
      timestamps: true,
    }
  );
};

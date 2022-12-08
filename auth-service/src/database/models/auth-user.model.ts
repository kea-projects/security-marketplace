import { DataTypes, Model, Sequelize } from "sequelize";
import { IBase, Role } from "../../interfaces";
export interface IAuthUser extends IBase {
  userId: string;
  email: string;
  password: string;
  role: Role;
}

export class AuthUser extends Model implements IAuthUser {
  declare userId: string;
  declare email: string;
  declare password: string;
  declare role: Role;
}
export const AuthUserInit = (sequelize: Sequelize) => {
  AuthUser.init(
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM,
        values: Object.values(Role),
        defaultValue: Role.user,
        allowNull: false,
      },
    },
    {
      sequelize: sequelize,
      modelName: "AuthUser",
      tableName: "auth_users",
      timestamps: true,
    }
  );
};

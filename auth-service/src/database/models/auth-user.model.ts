import { DataTypes, Model, Sequelize } from "sequelize";
import { IBase, Role } from "../../interfaces";

// const connectionString = `postgres://${getEnvVar("AUTH_POSTGRES_USER")}:${getEnvVar("AUTH_POSTGRES_PASSWORD")}@${getEnvVar(
//   "AUTH_POSTGRES_HOST"
// )}:${getEnvVar("AUTH_POSTGRES_PORT")}/${getEnvVar("AUTH_POSTGRES_DATABASE")}`;

// let sequelize: Sequelize = new Sequelize(connectionString, {
//   logging: false,
// });

export interface IAuthUser extends IBase {
  id: string;
  username: string;
  password: string;
  role: Role;
}

export class AuthUser extends Model implements IAuthUser {
  declare id: string;
  declare username: string;
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
      username: {
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

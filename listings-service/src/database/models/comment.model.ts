import { DataTypes, Model, Sequelize } from "sequelize";
import { IBase } from "../../interfaces";

export interface IComment extends IBase {
  commentId?: string;
  name: string;
  email: string;
  comment: string;
  createdBy: string;
  commentedOn: string;
}

export class Comment extends Model implements IComment {
  declare commentId?: string | undefined;
  declare name: string;
  declare email: string;
  declare comment: string;
  declare createdBy: string;
  declare commentedOn: string;
}
export const CommentInit = (sequelize: Sequelize) => {
  Comment.init(
    {
      commentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      commentedOn: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize: sequelize,
      modelName: "Comment",
      tableName: "comments",
      timestamps: true,
    }
  );
};

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface greetingsAttributes {
  client?: string;
  channelId?: string;
  message?: string;
}

export type greetingsOptionalAttributes = "client" | "channelId" | "message";
export type greetingsCreationAttributes = Optional<greetingsAttributes, greetingsOptionalAttributes>;

export class greetings extends Model<greetingsAttributes, greetingsCreationAttributes> implements greetingsAttributes {
  client?: string;
  channelId?: string;
  message?: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof greetings {
    return greetings.init({
      client: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      channelId: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'greetings',
      schema: 'public',
      timestamps: false
    });
  }
}

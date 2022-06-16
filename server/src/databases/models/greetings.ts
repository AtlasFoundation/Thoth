import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface greetingsAttributes {
  channelId?: string;
  message?: string;
}

export type greetingsOptionalAttributes = "channelId" | "message";
export type greetingsCreationAttributes = Optional<greetingsAttributes, greetingsOptionalAttributes>;

export class greetings extends Model<greetingsAttributes, greetingsCreationAttributes> implements greetingsAttributes {
  channelId?: string;
  message?: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof greetings {
    return greetings.init({
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

import * as Sequelize from 'sequelize'
import { DataTypes, Model, Optional } from 'sequelize'

export interface authUsersAttributes {
  id: number
  userId: string
  token?: string
  createdAt?: Date
  updatedAt?: Date
  isDeleted?: Boolean
}

export type authUsersAttributesOptionalAttributes =
  | 'isDeleted'
  | 'createdAt'
  | 'updatedAt'

export type authUsersAttributesCreationAttributes = Optional<
  authUsersAttributes,
  authUsersAttributesOptionalAttributes
>

export class authUsers
  extends Model<authUsersAttributes, authUsersAttributes>
  implements authUsersAttributes
{
  id: number
  userId: string
  token?: string
  createdAt?: Date
  updatedAt?: Date
  isDeleted?: Boolean

  static initModel(sequelize: Sequelize.Sequelize): typeof authUsers {
    return authUsers.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'user_id',
        },
        token: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'token',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.Sequelize.fn('now'),
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('now'),
          field: 'updated_at',
        },
        isDeleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          field: 'is_deleted',
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'auth_users',
        schema: 'public',
        timestamps: false,
      }
    )
  }
}

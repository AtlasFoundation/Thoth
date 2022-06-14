import * as Sequelize from 'sequelize'
import { DataTypes, Model, Optional } from 'sequelize'

export interface calendarEventsAttributes {
  name?: string
  calendar_id: string
  date?: string
  time?: string
  type?: string
  moreInfo?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Boolean
}

export type calendarEventsOptionalAttributes =
  | 'name'
  | 'date'
  | 'time'
  | 'type'
  | 'moreInfo'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
export type calendarEventsCreationAttributes = Optional<
  calendarEventsAttributes,
  calendarEventsOptionalAttributes
>

export class calendarEvents
  extends Model<calendarEventsAttributes, calendarEventsCreationAttributes>
  implements calendarEventsAttributes
{
  name?: string
  calendar_id: string
  date?: string
  time?: string
  type?: string
  moreInfo?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Boolean

  static initModel(sequelize: Sequelize.Sequelize): typeof calendarEvents {
    return calendarEvents.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        calendar_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        date: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        time: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        moreInfo: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('now'),
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('now'),
          field: 'updated_at',
        },
        deletedAt: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'deleted_at',
        },
      },
      {
        sequelize,
        tableName: 'calendar_events',
        schema: 'public',
        timestamps: true,
        paranoid: true,
      }
    )
  }
}

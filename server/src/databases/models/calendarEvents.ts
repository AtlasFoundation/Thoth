import * as Sequelize from 'sequelize'
import { DataTypes, Model, Optional } from 'sequelize'

export interface calendarEventsAttributes {
	name?: string
	date?: string
	time?: string
	type?: string
	moreInfo?: string
}

export type calendarEventsOptionalAttributes = 'name' | 'date' | 'time' | 'type' | 'moreInfo'
export type calendarEventsCreationAttributes = Optional<calendarEventsAttributes, calendarEventsOptionalAttributes>

export class calendarEvents extends Model<calendarEventsAttributes, calendarEventsCreationAttributes> implements calendarEventsAttributes {
	name?: string
	date?: string
	time?: string
	type?: string
	moreInfo?: string

	static initModel(sequelize: Sequelize.Sequelize): typeof calendarEvents {
		return calendarEvents.init({
			name: {
				type: DataTypes.STRING,
				allowNull: true
			},
			date: {
				type: DataTypes.STRING,
				allowNull: true
			},
			time: {
				type: DataTypes.STRING,
				allowNull: true
			},
			type: {
				type: DataTypes.STRING,
				allowNull: true
			},
			moreInfo: {
				type: DataTypes.TEXT,
				allowNull: true
			}
		}, {
			sequelize,
			tableName: 'calendar_events',
			schema: 'public',
			timestamps: false
		})
	}
}
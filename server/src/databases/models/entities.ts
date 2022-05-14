import * as Sequelize from 'sequelize'
import { DataTypes, Model, Optional } from 'sequelize'

export interface entitiesAttributes {
  id?: number
  instanceId?: number
  personality?: string
  enabled?: boolean
  updated_at?: string
  dirty?: boolean
  discord_enabled?: boolean
  discord_api_key?: string
  discord_starting_words?: string
  discord_bot_name_regex?: string
  discord_bot_name?: string
  discord_empty_responses?: string
  discord_spell_handler_incoming?: string
  discord_spell_handler_update?: string
  discord_spell_handler_feed?: string
  use_voice?: boolean
  voice_provider?: string
  voice_character?: string
  voice_language_code?: string
  xrengine_enabled?: boolean
  xrengine_url?: string
  xrengine_spell_handler_incoming?: string
  xrengine_spell_handler_update?: string
  xrengine_spell_handler_feed?: string
  xrengine_bot_name?: string
  xrengine_bot_name_regex?: string
  xrengine_starting_words?: string
  xrengine_empty_responses?: string
  twitter_client_enable?: boolean
  twitter_token?: string
  twitter_id?: string
  twitter_app_token?: string
  twitter_app_token_secret?: string
  twitter_access_token?: string
  twitter_access_token_secret?: string
  twitter_bot_name?: string
  twitter_bot_name_regex?: string
  telegram_enabled?: boolean
  telegram_bot_token?: string
  telegram_bot_name?: string
  telegram_spell_handler_incoming?: string
  reddit_enabled?: boolean
  reddit_app_id?: string
  reddit_app_secret_id?: string
  reddit_oauth_token?: string
  reddit_bot_name?: string
  reddit_bot_name_regex?: string
  reddit_spell_handler_incoming?: string
  zoom_enabled?: boolean
  zoom_invitation_link?: string
  zoom_password?: string
  zoom_bot_name?: string
  zoom_spell_handler_incoming?: string
}

export type entitiesPk = 'id'
export type entitiesId = entities[entitiesPk]
export type entitiesOptionalAttributes =
  | 'discord_enabled'
  | 'discord_api_key'
  | 'discord_starting_words'
  | 'discord_bot_name_regex'
  | 'discord_bot_name'
  | 'discord_empty_responses'
  | 'discord_spell_handler_incoming'
  | 'discord_spell_handler_update'
  | 'discord_spell_handler_feed'
  | 'use_voice'
  | 'voice_provider'
  | 'voice_character'
  | 'voice_language_code'
  | 'xrengine_enabled'
  | 'xrengine_url'
  | 'xrengine_spell_handler_incoming'
  | 'xrengine_spell_handler_update'
  | 'xrengine_spell_handler_feed'
  | 'xrengine_bot_name'
  | 'xrengine_bot_name_regex'
  | 'twitter_client_enable'
  | 'twitter_token'
  | 'twitter_id'
  | 'twitter_app_token'
  | 'twitter_app_token_secret'
  | 'twitter_access_token'
  | 'twitter_access_token_secret'
  | 'twitter_bot_name'
  | 'twitter_bot_name_regex'
  | 'telegram_enabled'
  | 'telegram_bot_token'
  | 'telegram_bot_name'
  | 'telegram_spell_handler_incoming'
  | 'reddit_enabled'
  | 'reddit_app_id'
  | 'reddit_app_secret_id'
  | 'reddit_oauth_token'
  | 'reddit_bot_name'
  | 'reddit_bot_name_regex'
  | 'reddit_spell_handler_incoming'
  | 'zoom_enabled'
  | 'zoom_invitation_link'
  | 'zoom_password'
  | 'zoom_bot_name'
  | 'zoom_spell_handler_incoming'
  | 'enabled'
  | 'updated_at'
export type entitiesCreationAttributes = Optional<
  entitiesAttributes,
  entitiesOptionalAttributes
>

export class entities
  extends Model<entitiesAttributes, entitiesCreationAttributes>
  implements entitiesAttributes
{
  id?: number
  instanceId?: number
  personality?: string
  enabled?: boolean
  updated_at?: string
  discord_enabled?: boolean
  discord_api_key?: string
  discord_starting_words?: string
  discord_bot_name_regex?: string
  discord_bot_name?: string
  discord_empty_responses?: string
  discord_spell_handler_incoming?: string
  discord_spell_handler_update?: string
  discord_spell_handler_feed?: string
  use_voice?: boolean
  voice_provider?: string
  voice_character?: string
  voice_language_code?: string
  xrengine_enabled?: boolean
  xrengine_url?: string
  xrengine_spell_handler_incoming?: string
  xrengine_spell_handler_update?: string
  xrengine_spell_handler_feed?: string
  xrengine_bot_name?: string
  xrengine_bot_name_regex?: string
  xrengine_starting_words?: string
  xrengine_empty_responses?: string
  twitter_client_enable?: boolean
  twitter_token?: string
  twitter_id?: string
  twitter_app_token?: string
  twitter_app_token_secret?: string
  twitter_access_token?: string
  twitter_access_token_secret?: string
  twitter_bot_name?: string
  twitter_bot_name_regex?: string
  telegram_enabled?: boolean
  telegram_bot_token?: string
  telegram_bot_name?: string
  telegram_spell_handler_incoming?: string
  reddit_enabled?: boolean
  reddit_app_id?: string
  reddit_app_secret_id?: string
  reddit_oauth_token?: string
  reddit_bot_name?: string
  reddit_bot_name_regex?: string
  reddit_spell_handler_incoming?: string
  zoom_enabled?: boolean
  zoom_invitation_link?: string
  zoom_password?: string
  zoom_bot_name?: string
  zoom_spell_handler_incoming?: string

  static initModel(sequelize: Sequelize.Sequelize): typeof entities {
    return entities.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        dirty: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        personality: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        updated_at: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        discord_api_key: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_starting_words: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_bot_name_regex: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_bot_name: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_empty_responses: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_spell_handler_incoming: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        use_voice: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        voice_provider: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        voice_character: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        voice_language_code: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_spell_handler_update: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        discord_spell_handler_feed: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        xrengine_url: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_spell_handler_incoming: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_spell_handler_update: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_spell_handler_feed: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_bot_name: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_bot_name_regex: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_starting_words: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        xrengine_empty_responses: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_client_enable: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        twitter_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_id: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_app_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_app_token_secret: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_access_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_access_token_secret: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_bot_name: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter_bot_name_regex: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        telegram_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        telegram_bot_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        telegram_bot_name: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        telegram_spell_handler_incoming: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reddit_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        reddit_app_id: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reddit_app_secret_id: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reddit_oauth_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reddit_bot_name: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reddit_bot_name_regex: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reddit_spell_handler_incoming: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        zoom_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        zoom_invitation_link: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        zoom_password: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        zoom_bot_name: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        zoom_spell_handler_incoming: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'entities',
        schema: 'public',
        timestamps: false,
      }
    )
  }
}

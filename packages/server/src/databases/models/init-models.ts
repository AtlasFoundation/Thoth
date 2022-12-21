import type { Sequelize } from 'sequelize'
import type { entitiesAttributes, entitiesCreationAttributes } from './entities'
import { entities as _entities } from './entities'
import type { spellsAttributes, spellsCreationAttributes } from './spells'
import { spells as _spells } from './spells'
import type { eventsAttributes, eventsCreationAttributes } from './events'
import { events as _events } from './events'
import type {
  documentsAttributes,
  documentsCreationAttributes,
} from './documents'
import { documents as _documents } from './documents'
import type {
  documentsStoreAttributes,
  documentsStoreCreationAttributes,
} from './documentstores'
import { documentsStore as _documentsStore } from './documentstores'
import type {
  contentObjAttributes,
  contentObjCreationAttributes,
} from './content_objects'
import { contentObj as _contentObj } from './content_objects'
import type {
  clientSettingCreationAttributes,
  clientSettingAttributes,
} from './client_settings'
import { clientSettings as _clientSettings } from './client_settings'
import type {
  configurationSettingAttributes,
  configurationSettingCreationAttributes,
} from './configuration_setting'
import { configurationSettings as _configurationSettings } from './configuration_setting'
import type {
  authUsersAttributes,
  authUsersAttributesCreationAttributes,
} from './authUsers'
import { authUsers as _authUsers } from './authUsers'
import {
  handled_history as _handled_history,
  handled_historyAttributes,
} from './handled_history'

export {
  _entities as entities,
  _spells as spells,
  _events as events,
  _documents as documents,
  _documentsStore as documentsStore,
  _contentObj as contentObj,
  _clientSettings as clientSettings,
  _configurationSettings as configurationSettings,
  _authUsers as authUsers,
  _handled_history as handled_history,
}

export type {
  entitiesAttributes,
  entitiesCreationAttributes,
  spellsAttributes,
  spellsCreationAttributes,
  eventsAttributes,
  eventsCreationAttributes,
  documentsAttributes,
  documentsCreationAttributes,
  documentsStoreAttributes,
  documentsStoreCreationAttributes,
  contentObjAttributes,
  contentObjCreationAttributes,
  clientSettingCreationAttributes,
  clientSettingAttributes,
  configurationSettingAttributes,
  configurationSettingCreationAttributes,
  authUsersAttributes,
  handled_historyAttributes,
}

export function initModels(sequelize: Sequelize) {
  const entities = _entities.initModel(sequelize)
  const spells = _spells.initModel(sequelize)
  const events = _events.initModel(sequelize)
  const documentsStore = _documentsStore.initModel(sequelize)
  const documents = _documents.initModel(sequelize)
  const contentObj = _contentObj.initModel(sequelize)
  const clientSettings = _clientSettings.initModel(sequelize)
  const configurationSettings = _configurationSettings.initModel(sequelize)
  const authUsers = _authUsers.initModel(sequelize)
  const handled_history = _handled_history.initModel(sequelize)

  return {
    entities: entities,
    spells: spells,
    events: events,
    contentObj: contentObj,
    documents: documents,
    documentsStore: documentsStore,
    clientSettings: clientSettings,
    configurationSettings: configurationSettings,
    authUsers: authUsers,
    handled_history: handled_history,
  }
}

import { combineReducers } from 'redux'

import { spellApi } from './api/spells'
import tabReducer from './tabs'
import configreducer from './admin/config/configState'
import scopeSlice from './admin/scope/scopeState'
import clientSlice from './admin/clientS/clientState'
import preferencesReducer from './preferences'

const reducers = combineReducers({
  tabs: tabReducer,
  preferences: preferencesReducer,
  [spellApi.reducerPath]: spellApi.reducer,
  config: configreducer,
  scope: scopeSlice,
  client: clientSlice,
})

export default reducers

import { combineReducers } from 'redux'

import { spellApi } from './api/spells'
import tabReducer from './tabs'
<<<<<<< HEAD:client/src/state/reducers.ts
import configreducer from './admin/config/configState'
import scopeSlice from './admin/scope/scopeState'
import clientSlice from './admin/clientS/clientState'
=======
import preferencesReducer from './preferences'
>>>>>>> latitude/0.0.68:packages/client/src/state/reducers.ts

const reducers = combineReducers({
  tabs: tabReducer,
  preferences: preferencesReducer,
  [spellApi.reducerPath]: spellApi.reducer,
  config: configreducer,
  scope: scopeSlice,
  client: clientSlice,
})

export default reducers

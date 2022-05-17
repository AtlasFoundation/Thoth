import { combineReducers } from 'redux'

import { spellApi } from './api/spells'
import tabReducer from './tabs'
import { configReducer } from './admin/Reducers/configReducer'

const reducers = combineReducers({
  tabs: tabReducer,
  [spellApi.reducerPath]: spellApi.reducer,
  config: configReducer,
})

export default reducers

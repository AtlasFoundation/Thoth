import { ConfigActionTypes, State, Action } from '../types/types'

const initialState = {
  config: [],
  loading: false,
  error: null,
}

export const configReducer = (
  state: State = initialState,
  action: Action
): State => {
  switch (action.type) {
    case ConfigActionTypes.FETCH_CONFIG_REQUEST:
      return {
        loading: true,
        config: [],
        error: null,
      }
    case ConfigActionTypes.FETCH_CONFIG_SUCCESS:
      return {
        loading: false,
        config: action.payload,
        error: null,
      }
    case ConfigActionTypes.FETCH_CONFIG_ERROR:
      return {
        loading: false,
        config: [],
        error: action.payload,
      }
    default:
      return state
  }
}

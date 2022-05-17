export interface Config {
  id: number
  key: string
  value: string
}

export interface State {
  config: Config[]
  loading: boolean
  error: string | null
}

export enum ConfigActionTypes {
  ADD_CONFIG = 'ADD_CONFIG',
  REMOVE_CONFIG = 'REMOVE_FROM_CART',
  FETCH_CONFIG_REQUEST = 'FETCH_CONFIG_REQUEST',
  FETCH_CONFIG_SUCCESS = 'FETCH_CONFIG_SUCCESS',
  FETCH_CONFIG_ERROR = 'FETCH_CONFIG_ERROR',
}

interface actionPending {
  type: ConfigActionTypes.FETCH_CONFIG_REQUEST
}

interface actionSuccess {
  type: ConfigActionTypes.FETCH_CONFIG_SUCCESS
  payload: Config[]
}

interface actionFail {
  type: ConfigActionTypes.FETCH_CONFIG_ERROR
  payload: string
}

export type Action = actionPending | actionSuccess | actionFail

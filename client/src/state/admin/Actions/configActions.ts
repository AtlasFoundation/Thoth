import axios from 'axios'
import { Dispatch } from 'redux'
import { ConfigActionTypes } from '../types/types'

export const getConfig = () => {
  return async (dispatch: Dispatch) => {
    dispatch({
      type: ConfigActionTypes.FETCH_CONFIG_REQUEST,
    })

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ROOT_URL}/setting/configuration`
      )

      dispatch({
        type: ConfigActionTypes.FETCH_CONFIG_SUCCESS,
        payload: data.payload,
      })
    } catch (err) {
      dispatch({
        type: ConfigActionTypes.FETCH_CONFIG_ERROR,
        payload: err.message,
      })
    }
  }
}

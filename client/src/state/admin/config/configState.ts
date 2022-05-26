import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Configservice from './configService'

export interface Config {
  id: number
  key: string
  value: string
}
export interface ConfigRes {
  message: String
  payload: { data: Config[]; pages: number; totalItems: number }
}

export interface State {
  config: ConfigRes
  loading: boolean
  error: boolean
  success: boolean
  createSuccess: boolean
  updateSuccess: boolean
  deleteSuccess: boolean
}

const initialState: State = {
  config: { message: '', payload: { data: [], pages: 0, totalItems: 0 } },
  loading: false,
  error: false,
  success: false,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
}
export const createConfig = createAsyncThunk(
  'createconfiguration',
  async (data: {}) => {
    const res = await Configservice.create(data)
    return res.data
  }
)
export const retrieveConfig = createAsyncThunk('getconfiguration', async () => {
  const res = await Configservice.getAll()
  return res.data
})
export const updateConfig = createAsyncThunk(
  'updateConfiguration',
  async (id, data) => {
    const res = await Configservice.update(id, data)
    return res.data
  }
)
export const deleteConfig = createAsyncThunk(
  'deleteConfiguration',
  async (id: number) => {
    const res = await Configservice.delete(id)
    return res.data
  }
)

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(createConfig.pending, state => {
      state.loading = true
    })
    builder.addCase(createConfig.fulfilled, state => {
      state.loading = false
      state.success = true
      state.createSuccess = true
    })
    builder.addCase(createConfig.rejected, state => {
      state.loading = true
      state.error = false
    })

    builder.addCase(retrieveConfig.pending, state => {
      state.loading = true
    })
    // : PayloadAction<[{ message:string; payload:[{id,key,value}] }]>
    builder.addCase(retrieveConfig.fulfilled, (state, action) => {
      state.loading = false
      state.success = true
      state.deleteSuccess = false
      state.createSuccess = false
      state.updateSuccess = false
      state.config = action.payload
    })
    builder.addCase(retrieveConfig.rejected, state => {
      state.loading = true
      state.error = false
    })
    builder.addCase(deleteConfig.pending, state => {
      state.loading = true
    })
    builder.addCase(deleteConfig.fulfilled, state => {
      state.loading = false
      state.success = true
      state.deleteSuccess = true
    })
    builder.addCase(deleteConfig.rejected, state => {
      state.loading = true
      state.error = false
    })
  },
})
const { reducer } = configSlice
export default reducer

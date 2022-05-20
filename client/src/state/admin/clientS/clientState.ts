import {
  createSlice,
  createAsyncThunk,
  // PayloadAction
} from '@reduxjs/toolkit'
import ClientService from './clientService'

export interface Client {
  id: number
  client: string
  name: string
  type: string
  default_value: string
}
export interface ClientRes {
  message: String
  payload: {
    data: Client[]
    pages: number
    totalItems: number
  }
}

export interface State {
  client: ClientRes
  loading: boolean
  error: boolean
  success: boolean
  deleteSuccess: boolean
}

const initialState: State = {
  client: { message: '', payload: { data: [], pages: 0, totalItems: 0 } },
  loading: false,
  error: false,
  success: false,
  deleteSuccess: true,
}
export const createClient = createAsyncThunk(
  'createClienturation',
  async data => {
    const res = await ClientService.create(data)
    return res.data
  }
)
export const retrieveClient = createAsyncThunk('getClienturation', async () => {
  const res = await ClientService.getAll()
  return res.data
})
export const updateClient = createAsyncThunk(
  'updateClienturation',
  async (id, data) => {
    const res = await ClientService.update(id, data)
    return res.data
  }
)
export const deleteClient = createAsyncThunk(
  'deleteClienturation',
  async (id: number) => {
    const res = await ClientService.delete(id)
    return res.data
  }
)

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(retrieveClient.pending, state => {
      state.loading = true
    })
    // : PayloadAction<[{ message:string; payload:[{id,key,value}] }]>
    builder.addCase(retrieveClient.fulfilled, (state, action) => {
      state.loading = false
      state.success = true
      state.deleteSuccess = false
      state.client = action.payload
    })
    builder.addCase(retrieveClient.rejected, state => {
      state.loading = true
      state.error = false
    })
    builder.addCase(deleteClient.pending, state => {
      state.loading = true
    })
    builder.addCase(deleteClient.fulfilled, state => {
      state.loading = false
      state.success = true
      state.deleteSuccess = true
    })
    builder.addCase(deleteClient.rejected, state => {
      state.loading = true
      state.error = false
    })
  },
})
const { reducer } = clientSlice
export default reducer

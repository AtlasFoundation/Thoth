import {
  createSlice,
  createAsyncThunk,
  // PayloadAction
} from '@reduxjs/toolkit'
import ScopeService from './scopeService'

export interface Scope {
  id: number
  full_table_size: string
  table_size: string
  tables: string
  record_count: string
}
export interface ScopeRes {
  message: String
  payload: Scope[]
}

export interface State {
  scope: ScopeRes
  loading: boolean
  error: boolean
  success: boolean
  createSuccess: boolean
  updateSuccess: boolean
  deleteSuccess: boolean
}

const initialState: State = {
  scope: { message: '', payload: [] },
  loading: false,
  error: false,
  success: false,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
}
export const createScope = createAsyncThunk(
  'createconfiguration',
  async (data: {}) => {
    const res = await ScopeService.create(data)
    return res.data
  }
)
export const retrieveScope = createAsyncThunk('getconfiguration', async () => {
  const res = await ScopeService.getAll()
  return res.data
})
export const updateScope = createAsyncThunk(
  'updateConfiguration',
  async (id, data) => {
    const res = await ScopeService.update(id, data)
    return res.data
  }
)
export const deleteScope = createAsyncThunk(
  'deleteConfiguration',
  async (id: number) => {
    const res = await ScopeService.delete(id)
    return res.data
  }
)

const scopeSlice = createSlice({
  name: 'scope',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(createScope.pending, state => {
      state.loading = true
    })
    builder.addCase(createScope.fulfilled, state => {
      state.loading = false
      state.success = true
      state.createSuccess = true
    })
    builder.addCase(createScope.rejected, state => {
      state.loading = true
      state.error = false
    })

    builder.addCase(retrieveScope.pending, state => {
      state.loading = true
    })
    // : PayloadAction<[{ message:string; payload:[{id,key,value}] }]>
    builder.addCase(retrieveScope.fulfilled, (state, action) => {
      state.loading = false
      state.success = true
      state.deleteSuccess = false
      state.createSuccess = false
      state.updateSuccess = false
      state.scope = action.payload
    })
    builder.addCase(retrieveScope.rejected, state => {
      state.loading = true
      state.error = false
    })
    builder.addCase(deleteScope.pending, state => {
      state.loading = true
    })
    builder.addCase(deleteScope.fulfilled, state => {
      state.loading = false
      state.success = true
      state.deleteSuccess = true
    })
    builder.addCase(deleteScope.rejected, state => {
      state.loading = true
      state.error = false
    })
  },
})
const { reducer } = scopeSlice
export default reducer

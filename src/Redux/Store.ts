import {
  configureStore,
  combineReducers
} from '@reduxjs/toolkit'
import FileSystemSlice from './FileSystem/FileSystemSlice'
import FileSystemActions from './FileSystem/FileSystemActions'
import SettingsSlice from './Settings/SettingsSlice'
import ViewsSlice from './Views/ViewsSlice'
import BotSlice from './Bot/BotSlice'

/* **************************************************************************/
// Reducers
/* **************************************************************************/

const rootReducer = combineReducers({
  bot: BotSlice.reducer,
  fileSystem: FileSystemSlice.reducer,
  settings: SettingsSlice.reducer,
  views: ViewsSlice.reducer
})
export type RootState = ReturnType<typeof rootReducer>

/* **************************************************************************/
// Store
/* **************************************************************************/

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'actionCreator/fulfilled',
          ...Object.values(FileSystemActions).flatMap((action: any) => {
            const types = []
            if (typeof (action.type) === 'string') {
              types.push(action.type)
            }
            if (typeof (action.pending) === 'function' && typeof (action.pending.type) === 'string') {
              types.push(action.pending.type)
            }
            if (typeof (action.rejected) === 'function' && typeof (action.rejected.type) === 'string') {
              types.push(action.rejected.type)
            }
            if (typeof (action.fulfilled) === 'function' && typeof (action.fulfilled.type) === 'string') {
              types.push(action.fulfilled.type)
            }
            return types
          })
        ],
        ignoredPaths: ['fileSystem']
      }
    })
})

export default store

/* **************************************************************************/
// Types
/* **************************************************************************/

export type AppDispatch = typeof store.dispatch

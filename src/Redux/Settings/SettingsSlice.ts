import { createSlice } from '@reduxjs/toolkit'
import { UserTheme, SystemTheme } from './SettingsTypes'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { SettingsState } from './SettingsTypes'

const initialState: SettingsState = {
  userTheme: UserTheme.System,
  systemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? SystemTheme.Dark : SystemTheme.Light,
  editorLineNumbers: true,
  editorShowManifest: false,
  assistantHelperPopup: true,
  assistantViewSize: 360,
  termsAgreed: false
}

export default createSlice({
  name: 'settings',
  initialState,
  reducers: {
    load: (state, action: PayloadAction<{ data: Partial<SettingsState> }>) => {
      return {
        ...state,
        ...action.payload.data
      }
    },
    setUserTheme: (state, action: PayloadAction<{ userTheme: UserTheme }>) => {
      state.userTheme = action.payload.userTheme
    },
    setSystemTheme: (state, action: PayloadAction<{ systemTheme: SystemTheme }>) => {
      state.systemTheme = action.payload.systemTheme
    },
    setEditorLineNumbers: (state, action: PayloadAction<{ enabled: boolean }>) => {
      state.editorLineNumbers = action.payload.enabled
    },
    setEditorShowManifest: (state, action: PayloadAction<{ show: boolean }>) => {
      state.editorShowManifest = action.payload.show
    },
    setAssistantViewSize: (state, action: PayloadAction<{ size: number }>) => {
      state.assistantViewSize = Math.max(200, action.payload.size)
    },
    setAssistantHelperPopup: (state, action: PayloadAction<{ show: boolean }>) => {
      state.assistantHelperPopup = action.payload.show
    },
    setTermsAgreed: (state, action: PayloadAction<{ agreed: boolean }>) => {
      state.termsAgreed = action.payload.agreed
    }
  }
})

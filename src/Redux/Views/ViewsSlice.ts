import { createSlice } from '@reduxjs/toolkit'
import { AssistantView, HintView } from './ViewsTypes'
import { isWavebox } from 'WaveboxApi'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { ViewsState } from './ViewsTypes'

const initialState: ViewsState = {
  assistantView: AssistantView.None,
  hintView: isWavebox ? HintView.None : HintView.InstallWavebox,
  suppressedHintView: []
}

export default createSlice({
  name: 'views',
  initialState,
  reducers: {
    setAssistantView: (state, action: PayloadAction<{ view: AssistantView }>) => {
      state.assistantView = action.payload.view
    },
    setHintView: (state, action: PayloadAction<{ view: HintView }>) => {
      state.hintView = action.payload.view
    },
    addSuppressedHintView: (state, action: PayloadAction<{ view: HintView }>) => {
      state.suppressedHintView = Array.from(new Set([...state.suppressedHintView, action.payload.view]))
      state.hintView = action.payload.view
    }
  }
})

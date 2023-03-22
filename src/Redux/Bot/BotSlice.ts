import { createSlice } from '@reduxjs/toolkit'
import { MessageSender, BotStatus } from './BotTypes'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { BotState } from './BotTypes'

const initialState: BotState = {
  messages: [],
  status: BotStatus.Idle,
  shownIntroMessage: false
}

export default createSlice({
  name: 'bot',
  initialState,
  reducers: {
    createUserMessage: (state, action: PayloadAction<{ id: string, message: string }>) => {
      state.messages.push({
        sender: MessageSender.User,
        id: action.payload.id,
        content: action.payload.message,
        timestamp: Date.now()
      })
    },
    setStatus: (state, action: PayloadAction<{ status: BotStatus }>) => {
      state.status = action.payload.status
    },
    createPresetBotMessage: (state, action: PayloadAction<{ id: string, content: string }>) => {
      state.messages.push({
        sender: MessageSender.BotPreset,
        id: action.payload.id,
        content: action.payload.content,
        timestamp: Date.now()
      })
    },
    createBotMessage: (state, action: PayloadAction<{ id: string, content: string }>) => {
      state.messages.push({
        sender: MessageSender.Bot,
        id: action.payload.id,
        content: action.payload.content,
        timestamp: Date.now()
      })
    },
    appendBotMessage: (state, action: PayloadAction<{ id: string, content: string }>) => {
      const message = state.messages.find(({ id }) => id === action.payload.id)
      if (message) {
        message.content += action.payload.content
      }
    },
    setShownIntroMessage: (state, action: PayloadAction<{ shown: boolean }>) => {
      state.shownIntroMessage = action.payload.shown
    }
  }
})

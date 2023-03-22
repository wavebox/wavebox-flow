export enum MessageSender {
  User,
  Bot,
  BotPreset
}
export enum BotStatus {
  Idle,
  Busy,
  Error
}

export interface Message {
  id: string
  sender: MessageSender
  content: string
  timestamp: number
}

export type Messages = Message[]

export interface ChatGPTMessage {
  content: string
  role: 'assistant' | 'user' | 'system'
}

export type ChatGPTMessages = ChatGPTMessage[]

export interface PresetStreamMessage {
  request?: string
  response: string
}

export interface BotState {
  messages: Messages
  status: BotStatus
  shownIntroMessage: boolean
}

import { nanoid } from 'nanoid'
import Slice from './BotSlice'
import { BotStatus, MessageSender } from './BotTypes'
import { BOT_WEBSOCKET_URL, BOT_MAX_TOKEN_COUNT } from 'R/constants'
import { isExtensionManagerAvailable, configureBot } from 'R/WaveboxApi'
import { encode as gpt3Encoder } from '@nem035/gpt-3-encoder'

import type { PresetStreamMessage, ChatGPTMessages, Messages } from './BotTypes'
import type { AppDispatch } from '../Store'
import type { FSFileSystemFileHandle } from 'FileSystem'

/* **************************************************************************/
// Utils
/* **************************************************************************/

/**
 * Turns the internal messages to chat GTP messages
 * @param messages
 * @returns
 */
function messagesToChatGPTMessages (messages: Messages): ChatGPTMessages {
  const chatGPTMessages: ChatGPTMessages = []
  for (const message of messages) {
    if (message.sender === MessageSender.BotPreset) { continue }
    chatGPTMessages.push({
      content: message.content,
      role: message.sender === MessageSender.User ? 'user' : 'assistant'
    })
  }
  return chatGPTMessages
}

/* **************************************************************************/
// Sending messages
/* **************************************************************************/

interface SendMessageOptions {
  messages: ChatGPTMessages
  userMessage?: string
}

/**
 * Creates a message in the bot store, asks the server and handles the response
 * @param dispatch: store dispatch call
 * @param options: the options to use when communicating with the api
 */
const sendMessageInternal = async (dispatch: AppDispatch, options: SendMessageOptions) => {
  const userMessageId = nanoid()
  const botMessageId = nanoid()

  // Prep the bot as busy and create an empty message
  dispatch(Slice.actions.setStatus({ status: BotStatus.Busy }))
  const message = options.userMessage ?? options.messages.at(-1)?.content
  if (message) {
    dispatch(Slice.actions.createUserMessage({ id: userMessageId, message }))
  }
  dispatch(Slice.actions.createBotMessage({ id: botMessageId, content: '' }))

  // Generate our config
  let socketUrl: string
  let maxTokenCount: number
  if (await isExtensionManagerAvailable()) {
    const config = await configureBot()
    socketUrl = config.socket
    maxTokenCount = config.maxTokenCount ?? BOT_MAX_TOKEN_COUNT
  } else {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('bot')
    const qs = new URLSearchParams({
      ...(typeof (key) === 'string' ? { key } : undefined)
    })
    socketUrl = `${BOT_WEBSOCKET_URL}?${qs.toString()}`
    maxTokenCount = BOT_MAX_TOKEN_COUNT
  }

  // Filter down the messags to stay within our token limit
  const messages: ChatGPTMessages = []
  let tokenCount = 0
  for (const message of options.messages) {
    if (message.role === 'system') {
      tokenCount += gpt3Encoder(message.content).length
      messages.push(message)
    }
  }
  const filteredMessages: ChatGPTMessages = []
  for (const message of [...options.messages].reverse()) {
    if (message.role !== 'system') {
      const nextTokenCount = tokenCount + gpt3Encoder(message.content).length
      if (nextTokenCount > maxTokenCount) { break }
      tokenCount = nextTokenCount
      filteredMessages.push(message)
    }
  }
  for (const message of filteredMessages.reverse()) {
    messages.push(message)
  }

  // Setup the socket
  const socket = new WebSocket(socketUrl)
  socket.onmessage = (evt) => {
    const payload = JSON.parse(evt.data)
    switch (payload.type) {
      case 'stream': {
        dispatch(Slice.actions.appendBotMessage({ id: botMessageId, content: payload.content }))
        break
      }
      case 'finish': {
        dispatch(Slice.actions.setStatus({ status: BotStatus.Idle }))
        socket.close()
        break
      }
    }
  }

  // Start everything off
  socket.onopen = () => {
    socket.send(JSON.stringify({
      opts: { ...options, messages }
    }))
  }
  socket.onerror = () => {
    dispatch(Slice.actions.setStatus({ status: BotStatus.Error }))
  }
}

const getFileLanguage = (fileHandle: FSFileSystemFileHandle) => {
  const fileExt = fileHandle.name.split('.').at(-1) as string
  switch (fileExt) {
    case 'js': return 'JavaScript'
    case 'css': return 'CSS'
    case 'html': return 'HTML'
    case 'json': return 'JSON'
    default: return `.${fileExt}`
  }
}

/**
 * Sends a message to the bot
 * @param dispatch: the store dispatch function
 * @param message: the users message
 */
export const sendMessage = async (
  dispatch: AppDispatch,
  messages: Messages,
  message: string,
  fileHandle: FSFileSystemFileHandle | undefined
) => {
  const language = fileHandle
    ? getFileLanguage(fileHandle)
    : 'code'

  await sendMessageInternal(dispatch, {
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that helps users write ${language} inside a Chrome extension. Your responses should be in Markdown.`
      },
      ...messagesToChatGPTMessages(messages),
      { role: 'user', content: message }
    ]
  })
}

/**
 * Asks the bot to validate some code
 * @param dispatch: the store dispatch function
 * @param fileHandle: the handle of the file to validate
 */
export const validateCode = async (
  dispatch: AppDispatch,
  fileHandle: FSFileSystemFileHandle,
  fileContents?: string
) => {
  if (!fileContents) {
    const file = await fileHandle.getFile()
    fileContents = await file.text()
  }

  const maxTokenCount = await isExtensionManagerAvailable()
    ? (await configureBot()).maxTokenCount ?? BOT_MAX_TOKEN_COUNT
    : BOT_MAX_TOKEN_COUNT
  const fileContentsTokenCount = gpt3Encoder(fileContents).length
  const language = getFileLanguage(fileHandle)

  const userMessage = 'Check my code for errors'
  const prompt: ChatGPTMessages = [
    {
      role: 'system',
      content: `You are a helpful assistant looks for errors in ${language} code. Your responses should be in Markdown.`
    },
    { role: 'user', content: userMessage }
  ]
  const totalTokenCount = prompt.reduce((acc, { content }) => {
    return acc + gpt3Encoder(content).length
  }, fileContentsTokenCount)

  if (totalTokenCount > maxTokenCount) {
    await streamPresetMessage(dispatch, {
      request: userMessage,
      response: 'Whoops, there\'s a little bit too much code there!\n\nHighlight some code that you want to check and try again'
    })
  } else {
    await sendMessageInternal(dispatch, {
      messages: [
        ...prompt,
        { role: 'user', content: fileContents }
      ],
      userMessage
    })
  }
}

/* **************************************************************************/
// Streaming template messages
/* **************************************************************************/

/**
 * Creates a message in the bot store, asks the server and handles the response
 * @param dispatch: store dispatch call
 * @param request: the users message to ask
 * @param response: the bots response
 * @param maxTime: the maximum millis to take to stream the message
 */
const streamMessageInternal = async (
  dispatch: AppDispatch,
  request: string | undefined,
  response: string,
  maxTime: number
) => {
  const userMessageId = nanoid()
  const botMessageId = nanoid()

  // Pre-chunk the message up
  const responseChunks: string[] = []
  const brackets: Record<string, string> = { '[': ']', '(': ')', '{': '}' }
  let pendingChunk = ''
  let openBracket: string | undefined
  for (let i = 0; i < response.length; i++) {
    const char = response[i]
    pendingChunk += char

    let splitChunk = false
    if (openBracket && char === brackets[openBracket]) {
      splitChunk = true
      openBracket = undefined
    } else if (brackets[char] !== undefined) {
      splitChunk = false
      openBracket = char
    } else if (!openBracket && Math.random() < 0.2) {
      splitChunk = true
    }

    if (splitChunk) {
      responseChunks.push(pendingChunk)
      pendingChunk = ''
    }
  }
  if (pendingChunk) {
    responseChunks.push(pendingChunk)
  }

  dispatch(Slice.actions.setStatus({ status: BotStatus.Busy }))
  if (request) {
    dispatch(Slice.actions.createUserMessage({ id: userMessageId, message: request }))
  }
  dispatch(Slice.actions.createPresetBotMessage({ id: botMessageId, content: '' }))

  const streamer = setInterval(() => {
    const chunk = responseChunks.shift()
    if (chunk === undefined) {
      dispatch(Slice.actions.setStatus({ status: BotStatus.Idle }))
      clearInterval(streamer)
    } else {
      dispatch(Slice.actions.appendBotMessage({ id: botMessageId, content: chunk }))
    }
  }, Math.min(20, maxTime / responseChunks.length))
}

/**
 * Streams a message
 * @param dispatch: store dispatch call
 * @param preset: the preset message
 */
export const streamPresetMessage = async (
  dispatch: AppDispatch,
  preset: PresetStreamMessage,
  maxTime?: number
) => {
  maxTime = maxTime ?? preset.response.length * 6
  await streamMessageInternal(dispatch, preset.request, preset.response, maxTime)
}

/**
 * Inserts a preset message immediately
 * @param dispatch: the store dispatcher
 * @param preset: the preset message
 */
export const insertPresetMessage = async (dispatch: AppDispatch, preset: PresetStreamMessage) => {
  const userMessageId = nanoid()
  const botMessageId = nanoid()
  if (preset.request) {
    dispatch(Slice.actions.createUserMessage({ id: userMessageId, message: preset.request }))
  }
  dispatch(Slice.actions.createPresetBotMessage({ id: botMessageId, content: preset.response }))
}

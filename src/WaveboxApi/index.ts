import { request } from './Rpc'
import FileSystemPort from './FileSystemPort'
import validUrl from 'valid-url'

import type RemoteFileSystemDirectoryHandle from 'FileSystem/RemoteFileSystemDirectoryHandle'

const params = new URLSearchParams(window.location.search)

/* **************************************************************************/
// Url params
/* **************************************************************************/

{
  // Some urls we want to strip out of the querystring, so reloading the page for example
  // still has the same effect
  const STRIP_PARAMS = [
    'taskId',
    'patternSuggestion'
  ]

  let strip = false
  const url = new URL(window.location.href)
  for (const param of STRIP_PARAMS) {
    if (params.has(param)) {
      strip = true
      url.searchParams.delete(param)
    }
  }

  if (strip) {
    window.history.replaceState({}, '', url.toString())
  }
}

export const createPatternSuggestion = params.get('patternSuggestion')

/* **************************************************************************/
// Environment
/* **************************************************************************/

export const isWavebox = params.get('iswavebox') === 'false'
  ? false
  // eslint-disable-next-line
  // @ts-ignore
  : navigator.userAgentData ? navigator.userAgentData.brands.some(({ brand }) => brand === 'Wavebox') : false

let _isExtensionManagerAvailable: boolean | undefined
/**
 * @returns true if the extension manager is available
 */
export async function isExtensionManagerAvailable () {
  if (typeof (_isExtensionManagerAvailable) === 'boolean') {
    return _isExtensionManagerAvailable
  }

  if (!isWavebox) {
    _isExtensionManagerAvailable = false
    return _isExtensionManagerAvailable
  }

  if (params.get('waveboxapi') === 'false') {
    _isExtensionManagerAvailable = false
    return _isExtensionManagerAvailable
  }

  try {
    _isExtensionManagerAvailable = (await request('flow:available')) as boolean
  } catch (ex) {
    _isExtensionManagerAvailable = false
  }

  return _isExtensionManagerAvailable
}

/**
 * Configures the bot
 * @returns the bot configuration
 */
export async function configureBot () {
  if (!await isExtensionManagerAvailable()) {
    throw new Error('Extension manager not available')
  }

  const config = (await request('flow:configureBot')) as { socket: string, maxTokenCount?: number }
  return config
}

/* **************************************************************************/
// Extension loading & management
/* **************************************************************************/

/**
 * Requests that the extension is reloaded
 * @param directoryHandle: the directory handle
 */
export async function reloadExtension (directoryHandle: RemoteFileSystemDirectoryHandle) {
  if (!await isExtensionManagerAvailable()) {
    throw new Error('Extension manager not available')
  }

  await FileSystemPort.request('reloadExtension', directoryHandle.ref)
}

/* **************************************************************************/
// Startup tasks
/* **************************************************************************/

/**
 * If there's a launch task, fetches and returns it
 * @returns the task or undefined
 */
export async function getTask () {
  if (!await isExtensionManagerAvailable()) {
    throw new Error('Extension manager not available')
  }

  // Get and clear the taskId
  const taskId = params.get('taskId')
  if (!taskId) { return undefined }

  // Fetch the task
  const task = (await request('flow:getTask', taskId)) as { type: string } | undefined
  switch (task?.type) {
    case 'edit': return task as { type: string, extensionId: string }
    default: return task as { type: string }
  }
}

/* **************************************************************************/
// Settings
/* **************************************************************************/

/**
 * Reads the settings from Wavebox
 * @returns the the settings object
 */
export async function readSettings () {
  if (!await isExtensionManagerAvailable()) {
    throw new Error('Extension manager not available')
  }

  return (await request('flow:readSettings'))
}

/**
 * Writes the settings object to Wavebox
 * @param settings: the settings to write
 */
export async function writeSettings (settings: any) {
  if (!await isExtensionManagerAvailable()) {
    throw new Error('Extension manager not available')
  }

  return (await request('flow:writeSettings', settings))
}

/* **************************************************************************/
// UI
/* **************************************************************************/

/**
 * Creates a docked preview tab at the given url
 * @param pattern: the pattern to use
 */
export async function createDockedPreviewTab (pattern: string) {
  if (!await isExtensionManagerAvailable()) {
    throw new Error('Extension manager not available')
  }

  if (!pattern) { throw new Error('Pattern is required') }

  const url = new URL(
    pattern.startsWith('*://')
      ? pattern.replace('*://', 'https://')
      : pattern
  )
  if (url.hostname.includes('%2A.')) {
    url.hostname = url.hostname.replace(/%2A./g, '')
  }
  if (url.pathname.includes('*')) {
    const pathCmp = url.pathname.split('/')
    url.pathname = pathCmp.slice(0, pathCmp.indexOf('*')).join('/')
  }

  if (!validUrl.isWebUri(url.toString())) {
    throw new Error('Unable to reify url')
  }

  await request('flow:createDockedPreviewTab', url.toString())
}

export {
  FileSystemPort
}

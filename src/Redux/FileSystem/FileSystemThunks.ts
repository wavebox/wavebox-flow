import { createAsyncThunk } from '@reduxjs/toolkit'
import Storage from 'Storage'
import {
  loadDirectoryContents,
  directoryContainsFlow,
  getAvailableFileName,
  getAvailableDirectoryName,
  writeTextFile,
  updateManifest,
  readManifest,
  getEditableDirectoryContents
} from './FileSystemUtils'
import { FileTemplateTypes } from 'FileTemplates'
import { getEditorHistory, deleteFlowDirectory, createFlowDirectory } from 'FileSystem'
import { isExtensionManagerAvailable, createDockedPreviewTab } from 'WaveboxApi'
import sanitizeFilename from 'sanitize-filename'

import type { FileTemplate } from 'FileTemplates'
import type {
  FSFileSystemDirectoryHandle,
  FSFileSystemFileHandle,
  FSDirectoryContents
} from 'FileSystem'

/* **************************************************************************/
// Directories
/* **************************************************************************/

/**
 * Opens and loads a directory, adds it to the history
 * @param handle: the directory handle
 * @return the directory contents
 */
async function openDirectoryInternal (handle: FSFileSystemDirectoryHandle) {
  const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' }
  if ((await handle.queryPermission(options)) !== 'granted') {
    await handle.requestPermission(options)
  }

  let contents: FSDirectoryContents
  try {
    contents = await loadDirectoryContents(handle)
  } catch (ex) {
    contents = []
  }
  if (!directoryContainsFlow(contents)) {
    window.alert('This directory does not contain a valid flow')
    throw new Error('Cannot open directory, does not contain a valid flow')
  }

  if (handle instanceof FileSystemDirectoryHandle) {
    await Storage.addEditorHistory(handle)
  }
  return contents
}

/**
 * Opens a directory entry
 * @param handle: the directory entry handle
 */
export const openDirectory = createAsyncThunk(
  'fileSystem/openDirectory',
  async ({ handle }: { handle: FSFileSystemDirectoryHandle }) => {
    const contents = await openDirectoryInternal(handle)
    return {
      handle,
      contents,
      history: await isExtensionManagerAvailable()
        ? await getEditorHistory()
        : await Storage.getEditorHistory(),
      fileHandle: getEditableDirectoryContents(contents, false /* showManifest */)[0],
      manifest: await readManifest(handle)
    }
  }
)

/**
 * Deletes a flow
 * @param handle: the directory entry handle
 */
export const deleteFlow = createAsyncThunk(
  'fileSystem/deleteFlow',
  async ({ handle }: { handle: FSFileSystemDirectoryHandle }) => {
    let ok = false
    let nextHistory
    if (await isExtensionManagerAvailable()) {
      ok = await deleteFlowDirectory(handle)
      nextHistory = await getEditorHistory()
    } else {
      if (handle instanceof FileSystemDirectoryHandle) {
        ok = await Storage.removeEditorHistory(handle)
      }
      nextHistory = await Storage.getEditorHistory()
    }

    return { ok, history: nextHistory }
  }
)

export const reloadDirectory = createAsyncThunk(
  'fileSystem/reloadDirectory',
  async ({ handle }: { handle: FileSystemDirectoryHandle }) => {
    return {
      handle,
      contents: await loadDirectoryContents(handle),
      manifest: await readManifest(handle)
    }
  }
)

/* **************************************************************************/
// Editor history
/* **************************************************************************/

/**
 * Loads the editor history
 */
export const loadEditorHistory = createAsyncThunk(
  'fileSystem/loadEditorHistory',
  async () => {
    const history = await isExtensionManagerAvailable()
      ? await getEditorHistory()
      : await Storage.getEditorHistory()
    return { history }
  }
)

/* **************************************************************************/
// Contentscripts
/* **************************************************************************/

interface createContentScriptPayload {
  directoryHandle: FSFileSystemDirectoryHandle
  type: 'css' | 'js'
  urlPattern?: string
  contents?: string
}

/**
 * Creates a content script
 * @param payload: the create call payload
 * @returns the file handle and manifest
 */
async function createContentScriptInternal ({
  directoryHandle,
  type,
  urlPattern = '<all_urls>',
  contents
}: createContentScriptPayload) {
  // Create the file
  let baseFilename
  switch (type) {
    case 'css': baseFilename = 'styles'; break
    case 'js': baseFilename = 'contentscript'; break
  }
  const filename = await getAvailableFileName(directoryHandle, baseFilename, type)
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true })
  if (contents) {
    await writeTextFile(fileHandle, contents)
  }

  // Update the manifest
  const manifest = await updateManifest(directoryHandle, (manifest) => {
    return {
      ...manifest,
      content_scripts: [
        ...(manifest.content_scripts ?? []),
        {
          matches: [urlPattern],
          ...type === 'css' ? { css: [filename] } : {},
          ...type === 'js' ? { js: [filename] } : {}
        }
      ]
    }
  })

  return { fileHandle, manifest }
}

/**
 * Creates a new contentscript
 * @param directoryHandle: the parent directory handle
 * @param type: either css or js
 * @param urlPattern=<all_urls>: the url pattern
 * @param contents=undefined: the file contents
 */
export const createContentScript = createAsyncThunk(
  'fileSystem/createContentScript',
  async (payload: createContentScriptPayload) => {
    const { directoryHandle } = payload
    const { fileHandle, manifest } = await createContentScriptInternal(payload)
    return {
      directoryHandle,
      fileHandle,
      directoryContents: await loadDirectoryContents(directoryHandle),
      manifest
    }
  }
)

/* **************************************************************************/
// Background
/* **************************************************************************/

async function createBackgroundInternal ({
  directoryHandle,
  contents
}: createBackgroundPayload) {
  const filename = await getAvailableFileName(directoryHandle, 'background', 'js')
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true })
  if (contents) {
    await writeTextFile(fileHandle, contents)
  }

  // Update the manifest
  const manifest = await updateManifest(directoryHandle, (manifest) => {
    switch (manifest.manifest_version) {
      case 2: return {
        ...manifest,
        background: { ...manifest.background, scripts: [filename] }
      }
      case 3: return {
        ...manifest,
        background: { ...manifest.background, service_worker: filename }
      }
      default: return manifest
    }
  })

  return {
    fileHandle,
    manifest
  }
}

interface createBackgroundPayload {
  directoryHandle: FSFileSystemDirectoryHandle
  contents?: string
}

/**
 * Creates a new background page
 */
export const createBackground = createAsyncThunk(
  'fileSystem/createBackground',
  async (payload: createBackgroundPayload) => {
    const { directoryHandle } = payload
    const {
      fileHandle,
      manifest
    } = await createBackgroundInternal(payload)

    return {
      directoryHandle,
      fileHandle,
      directoryContents: await loadDirectoryContents(directoryHandle),
      manifest
    }
  }
)

/* **************************************************************************/
// Popup
/* **************************************************************************/

interface createPopupPayload {
  directoryHandle: FSFileSystemDirectoryHandle
  contents?: string
}

async function createPopupInternal ({
  directoryHandle,
  contents
}: createPopupPayload) {
  const filename = await getAvailableFileName(directoryHandle, 'popup', 'html')
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true })
  if (contents) {
    await writeTextFile(fileHandle, contents)
  }

  // Update the manifest
  const manifest = await updateManifest(directoryHandle, (manifest) => {
    return {
      ...manifest,
      action: {
        ...manifest.action,
        default_popup: filename
      }
    }
  })

  return {
    manifest,
    fileHandle
  }
}

/**
 * Creates a new background page
 */
export const createPopup = createAsyncThunk(
  'fileSystem/createPopup',
  async (payload: createPopupPayload) => {
    const { directoryHandle } = payload
    const {
      manifest,
      fileHandle
    } = await createPopupInternal(payload)

    return {
      directoryHandle,
      fileHandle,
      directoryContents: await loadDirectoryContents(directoryHandle),
      manifest
    }
  }
)

/* **************************************************************************/
// Flow creation
/* **************************************************************************/

interface createDirectoryWithFileTemplatePayload {
  template: FileTemplate
  urlPattern?: string
}

export const createDirectoryWithFileTemplate = createAsyncThunk(
  'fileSystem/createDirectoryWithFileTemplate',
  async (payload: createDirectoryWithFileTemplatePayload) => {
    const {
      template,
      urlPattern
    } = payload

    let flowName: string
    try {
      let suggestedName
      if (urlPattern !== undefined && urlPattern !== '<all_urls>') {
        const primaryUrl = urlPattern.split(':')[1].split('/').find((v) => Boolean(v))
        if (primaryUrl) {
          suggestedName = primaryUrl.replace(/(\*\.)/g, '')
        }
      }
      if (!suggestedName) {
        suggestedName = template.name
      }

      flowName = sanitizeFilename(`My ${suggestedName} extension`)
    } catch (ex) {
      flowName = 'My extension'
    }

    let directoryHandle: FSFileSystemDirectoryHandle
    if (await isExtensionManagerAvailable()) {
      directoryHandle = await createFlowDirectory(flowName)
    } else {
      const baseDirectoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
      const flowDirectoryName = await getAvailableDirectoryName(baseDirectoryHandle, flowName)
      directoryHandle = await baseDirectoryHandle.getDirectoryHandle(flowDirectoryName, { create: true })
    }

    // Update the manifest
    await updateManifest(directoryHandle, (manifest) => {
      return { ...manifest, name: flowName }
    })

    // Create the contentscript
    let fileHandle: FSFileSystemFileHandle | undefined
    let manifest: chrome.runtime.Manifest | undefined
    switch (template.type) {
      case FileTemplateTypes.ContentscriptCSS: {
        const res = await createContentScriptInternal({
          directoryHandle,
          type: 'css',
          urlPattern,
          contents: template.content
        })
        fileHandle = res.fileHandle
        manifest = res.manifest
        break
      }
      case FileTemplateTypes.ContentscriptJS: {
        const res = await createContentScriptInternal({
          directoryHandle,
          type: 'js',
          urlPattern,
          contents: template.content
        })
        fileHandle = res.fileHandle
        manifest = res.manifest
        break
      }
      case FileTemplateTypes.Background: {
        const res = await createBackgroundInternal({ directoryHandle, contents: template.content })
        fileHandle = res.fileHandle
        manifest = res.manifest
        break
      }
      case FileTemplateTypes.Popup: {
        const res = await createPopupInternal({ directoryHandle, contents: template.content })
        fileHandle = res.fileHandle
        manifest = res.manifest
        break
      }
      default: throw new Error('Template type is not supported')
    }

    // Open the directory
    const directoryContents = await openDirectoryInternal(directoryHandle)

    // Create a docked tab if we can
    if (urlPattern && await isExtensionManagerAvailable()) {
      try {
        await createDockedPreviewTab(urlPattern)
      } catch (ex) {
        console.warn(ex)
      }
    }

    return {
      directoryHandle,
      directoryContents,
      history: await isExtensionManagerAvailable()
        ? await getEditorHistory()
        : await Storage.getEditorHistory(),
      fileHandle,
      manifest
    }
  }
)

/* **************************************************************************/
// Manifest editing
/* **************************************************************************/

export const setManifestName = createAsyncThunk(
  'fileSystem/setManifestName',
  async (payload: { directoryHandle: FSFileSystemDirectoryHandle, name: string }) => {
    const { directoryHandle, name } = payload

    const manifest = await updateManifest(directoryHandle, (manifest) => {
      return { ...manifest, name }
    })

    return {
      directoryHandle,
      manifest
    }
  }
)

export const addManifestPermission = createAsyncThunk(
  'fileSystem/addManifestPermission',
  async (payload: { directoryHandle: FSFileSystemDirectoryHandle, permission: string }) => {
    const { directoryHandle, permission } = payload

    // eslint-disable-next-line
    // @ts-ignore
    const manifest = await updateManifest(directoryHandle, (manifest) => {
      const permissions = Array.from(new Set([
        ...(manifest.permissions ?? []),
        permission
      ])) as unknown as chrome.runtime.ManifestPermissions
      return { ...manifest, permissions }
    })

    return {
      directoryHandle,
      manifest
    }
  }
)

export const removeManifestPermission = createAsyncThunk(
  'fileSystem/removeManifestPermission',
  async (payload: { directoryHandle: FSFileSystemDirectoryHandle, permission: string }) => {
    const { directoryHandle, permission } = payload

    // eslint-disable-next-line
    // @ts-ignore
    const manifest = await updateManifest(directoryHandle, (manifest) => {
      const permissions = (manifest.permissions ?? [])
        .filter((p) => p !== permission) as unknown as chrome.runtime.ManifestPermissions
      return { ...manifest, permissions }
    })

    return {
      directoryHandle,
      manifest
    }
  }
)

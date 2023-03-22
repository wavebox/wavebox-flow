import {
  isExtensionManagerAvailable,
  FileSystemPort
} from 'WaveboxApi'
import RemoteFileSystemDirectoryHandle from './RemoteFileSystemDirectoryHandle'

import type RemoteFileSystemFile from './RemoteFileSystemFile'
import type RemoteFileSystemFileHandle from './RemoteFileSystemFileHandle'

export type FSFileSystemDirectoryHandle = FileSystemDirectoryHandle | RemoteFileSystemDirectoryHandle
export type FSFileSystemFileHandle = FileSystemFileHandle | RemoteFileSystemFileHandle
export type FSDirectoryContents = Array<FSFileSystemDirectoryHandle | FSFileSystemFileHandle>
export type FSFileSystemFileEntry = FileSystemFileEntry | RemoteFileSystemFile

/**
 * Creates a flow directory, either by asking the user to pick a directory or using the in-built picker
 * @param name: the name of the flow
 * @returns the directoy handle
 */
export async function createFlowDirectory (name: string): Promise<FSFileSystemDirectoryHandle> {
  if (await isExtensionManagerAvailable()) {
    const data = await FileSystemPort.request('createFlowDirectory', name)
    return new RemoteFileSystemDirectoryHandle(data)
  } else {
    throw new Error('Creating flow directories is not supported in this mode')
  }
}

/**
 * Gets a flow directory handle from an extension id
 * @param extensionId: the id of the extension
 * @returns the directoy handle
 */
export async function getFlowDirectoryFromExtensionId (extensionId: string): Promise<FSFileSystemDirectoryHandle> {
  if (await isExtensionManagerAvailable()) {
    const data = await FileSystemPort.request('getFlowDirectoryFromExtensionId', extensionId)
    return new RemoteFileSystemDirectoryHandle(data)
  } else {
    throw new Error('Accessing flow directories from extensionId\'s is not supported in this mode')
  }
}

/**
 * Deletes a flow directory
 * @param handle: the directory handle
 */
export async function deleteFlowDirectory (handle: FSFileSystemDirectoryHandle): Promise<boolean> {
  if (await isExtensionManagerAvailable() && handle instanceof RemoteFileSystemDirectoryHandle) {
    return await FileSystemPort.request('deleteFlowDirectory', handle.ref)
  } else {
    throw new Error('Deleting flow directories is not supported in this mode')
  }
}

/**
 * Gets the editor history from Wavebox
 */
export async function getEditorHistory () {
  if (await isExtensionManagerAvailable()) {
    const history = []
    for (const data of await FileSystemPort.request('getEditorHistory')) {
      history.push(new RemoteFileSystemDirectoryHandle(data))
    }
    return history
  } else {
    throw new Error('Wavebox editor history not avilable')
  }
}

/**
 * Opens the file/folder in explorer/finder etc
 * @param handle: the file or folder handle to highlight
 */
export async function openInPlatformExplorer (handle: FSFileSystemDirectoryHandle) {
  if (
    await isExtensionManagerAvailable() &&
    (handle instanceof RemoteFileSystemDirectoryHandle)
  ) {
    return await FileSystemPort.request('openInPlatformExplorer', handle.ref)
  } else {
    throw new Error('Opening in the platform explorer is not supported in this mode')
  }
}

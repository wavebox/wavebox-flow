import { manifestFilename } from './FileSystemTypes'

import type {
  FSFileSystemDirectoryHandle,
  FSDirectoryContents,
  FSFileSystemFileHandle
} from 'FileSystem'

/* **************************************************************************/
// Primitive directory operations
/* **************************************************************************/

/**
 * Loads the contents of the directory
 * @param handle: the directory entry
 * @return an array of directory entries
 */
export async function loadDirectoryContents (handle: FSFileSystemDirectoryHandle): Promise<FSDirectoryContents> {
  const entries = []
  for await (const entry of handle.entries()) {
    entries.push(entry[1])
  }
  return entries
}

/**
 * Gets a free filename in a directory
 * @param handle: the directory entry
 * @return an array of directory entries
 */
export async function getAvailableFileName (handle: FSFileSystemDirectoryHandle, name: string, ext: string) {
  const dirEntries = await loadDirectoryContents(handle)
  let count = 0
  while (true) {
    const filename = count === 0
      ? `${name}.${ext}`
      : `${name}_${count}.${ext}`
    const conflict = dirEntries.some((entry) => entry.kind === 'file' && entry.name === filename)
    if (!conflict) { return filename }
    count++
  }
}

/**
 * Gets a free filename in a directory
 * @param handle: the directory entry
 * @return an array of directory entries
 */
export async function getAvailableDirectoryName (handle: FSFileSystemDirectoryHandle, name: string) {
  const dirEntries = await loadDirectoryContents(handle)
  let count = 0
  while (true) {
    const filename = count === 0
      ? name
      : `${name}_${count}`
    const conflict = dirEntries.some((entry) => entry.kind === 'directory' && entry.name === filename)
    if (!conflict) { return filename }
    count++
  }
}

/**
 * @param contents: the directory contents
 * @param showManifest: true to show the manifest
 * @returns a list of directory contents that are editable to the user
 */
export function getEditableDirectoryContents (contents: FSDirectoryContents, showManifest: boolean): FSFileSystemFileHandle[] {
  const editable = []
  for (const entry of contents) {
    if (entry.kind === 'file') {
      if (entry.name === manifestFilename && !showManifest) { continue }
      editable.push(entry as FSFileSystemFileHandle)
    }
  }
  return editable
}

/**
 * @param contents: the directory contents
 * @returns true if this directory looks like it contains a flow, false otherwise
 */
export function directoryContainsFlow (contents: FSDirectoryContents) {
  for (const entry of contents) {
    if (entry.kind === 'file' && entry.name === 'manifest.json') {
      return true
    }
  }

  return false
}

/* **************************************************************************/
// Primitive file operations
/* **************************************************************************/

/**
 * Saves a file to disk
 * @param fileHandle: the file handle
 * @param value: the file contents
 */
export async function writeTextFile (fileHandle: FSFileSystemFileHandle, value: string) {
  const writable = await fileHandle.createWritable()
  await writable.write(value)
  await writable.close()
}

/**
 * Reads a file from disk
 * @param fileHandle: the file handle
 * @return the string contents
 */
export async function readTextFile (fileHandle: FSFileSystemFileHandle) {
  const file = await fileHandle.getFile()
  return await file.text()
}

/**
 * Reads a json file
 * @param fileHandle: the file handle
 * @param defaultValue=undefined: value to provide if the file is empty
 * @return the string contents
 */
export async function readJsonFile (fileHandle: FSFileSystemFileHandle, defaultValue: object | undefined = undefined) {
  const contents = await readTextFile(fileHandle)
  return contents
    ? JSON.parse(contents)
    : defaultValue
}

/**
 * Writes a json file
 * @param fileHandle: the file handle
 * @param contents: json contents
 */
export async function writeJsonFile (
  fileHandle: FSFileSystemFileHandle,
  value: object,
  space?: string | number | undefined
) {
  await writeTextFile(fileHandle, JSON.stringify(value, null, space))
}

/* **************************************************************************/
// Manifest
/* **************************************************************************/

/**
 * Updates the manifest file
 * @param directoryHandle: the parent directory handle
 * @param updater: updater function
 * @return the new manifest json
 */
export async function updateManifest (
  directoryHandle: FSFileSystemDirectoryHandle,
  updater: (manifest: chrome.runtime.Manifest) => chrome.runtime.Manifest
) {
  const manifestHandle = await directoryHandle.getFileHandle('manifest.json', { create: true })
  const manifest = await readJsonFile(manifestHandle, {
    manifest_version: 3,
    version: '1'
  })
  const nextManifest = updater(manifest)
  await writeJsonFile(manifestHandle, nextManifest, 2)
  return nextManifest
}

/**
 * Reads the manifest file
 * @param directoryHandle: the parent directory handle
 * @return the manifest json
 */
export async function readManifest (directoryHandle: FSFileSystemDirectoryHandle) {
  const manifestHandle = await directoryHandle.getFileHandle('manifest.json', { create: true })
  const manifest = await readJsonFile(manifestHandle, {
    manifest_version: 3,
    version: '1'
  })
  return manifest as chrome.runtime.Manifest
}

export default {
  loadDirectoryContents,
  getAvailableFileName,
  getAvailableDirectoryName,

  writeTextFile,
  readTextFile,
  readJsonFile,
  writeJsonFile,

  updateManifest
}

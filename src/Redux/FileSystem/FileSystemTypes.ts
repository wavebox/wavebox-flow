import type {
  FSFileSystemDirectoryHandle,
  FSFileSystemFileHandle,
  FSDirectoryContents
} from 'FileSystem'

export interface FileSystemState {
  directoryHistory: FSFileSystemDirectoryHandle[]
  directoryHistoryLoaded: boolean
  directoryHandle?: FSFileSystemDirectoryHandle
  directoryContents: FSDirectoryContents

  fileHandle?: FSFileSystemFileHandle
  manifest?: chrome.runtime.Manifest
}

export const manifestFilename = 'manifest.json'

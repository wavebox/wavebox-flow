import { createSlice } from '@reduxjs/toolkit'
import {
  openDirectory,
  reloadDirectory,
  loadEditorHistory,
  createContentScript,
  createBackground,
  createPopup,
  createDirectoryWithFileTemplate,
  setManifestName,
  addManifestPermission,
  removeManifestPermission,
  deleteFlow
} from './FileSystemThunks'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { FileSystemState } from './FileSystemTypes'
import type { FSFileSystemFileHandle } from 'FileSystem'

const initialState: FileSystemState = {
  directoryHistory: [],
  directoryHistoryLoaded: false,
  directoryHandle: undefined,
  directoryContents: [],
  fileHandle: undefined,
  manifest: undefined
}

export default createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    openFile: (state, action: PayloadAction<{ handle: FSFileSystemFileHandle }>) => {
      state.fileHandle = action.payload.handle
    }
  },
  extraReducers: (builder) => {
    /* **************************************************************************/
    // Directories
    /* **************************************************************************/

    builder.addCase(openDirectory.fulfilled, (state, { payload }) => {
      state.directoryHistory = payload.history
      state.directoryHandle = payload.handle
      state.directoryContents = payload.contents
      state.fileHandle = payload.fileHandle
      state.manifest = payload.manifest
    })

    builder.addCase(deleteFlow.fulfilled, (state, { payload }) => {
      state.directoryHistory = payload.history
      if (payload.ok) {
        state.directoryHandle = undefined
        state.directoryContents = []
        state.fileHandle = undefined
        state.manifest = undefined
      }
    })

    builder.addCase(reloadDirectory.fulfilled, (state, { payload }) => {
      if (payload.handle === state.directoryHandle) {
        state.directoryContents = payload.contents
        state.manifest = payload.manifest
      }
    })

    /* **************************************************************************/
    // Contentscripts
    /* **************************************************************************/

    builder.addCase(createContentScript.fulfilled, (state, { payload }) => {
      if (payload.directoryHandle === state.directoryHandle) {
        state.directoryContents = payload.directoryContents
        state.fileHandle = payload.fileHandle
        state.manifest = payload.manifest
      }
    })

    builder.addCase(createDirectoryWithFileTemplate.fulfilled, (state, { payload }) => {
      state.directoryHistory = payload.history
      state.directoryHandle = payload.directoryHandle
      state.directoryContents = payload.directoryContents
      state.fileHandle = payload.fileHandle
      state.manifest = payload.manifest
    })

    /* **************************************************************************/
    // Manifest
    /* **************************************************************************/

    builder.addCase(setManifestName.fulfilled, (state, { payload }) => {
      if (payload.directoryHandle === state.directoryHandle) {
        state.manifest = payload.manifest
      }
    })

    builder.addCase(addManifestPermission.fulfilled, (state, { payload }) => {
      if (payload.directoryHandle === state.directoryHandle) {
        state.manifest = payload.manifest
      }
    })

    builder.addCase(removeManifestPermission.fulfilled, (state, { payload }) => {
      if (payload.directoryHandle === state.directoryHandle) {
        state.manifest = payload.manifest
      }
    })

    /* **************************************************************************/
    // Background
    /* **************************************************************************/

    builder.addCase(createBackground.fulfilled, (state, { payload }) => {
      if (payload.directoryHandle === state.directoryHandle) {
        state.directoryContents = payload.directoryContents
        state.fileHandle = payload.fileHandle
        state.manifest = payload.manifest
      }
    })

    /* **************************************************************************/
    // Popup
    /* **************************************************************************/

    builder.addCase(createPopup.fulfilled, (state, { payload }) => {
      if (payload.directoryHandle === state.directoryHandle) {
        state.directoryContents = payload.directoryContents
        state.fileHandle = payload.fileHandle
        state.manifest = payload.manifest
      }
    })

    /* **************************************************************************/
    // history
    /* **************************************************************************/

    builder.addCase(loadEditorHistory.fulfilled, (state, action) => {
      state.directoryHistory = action.payload.history
      state.directoryHistoryLoaded = true
    })
  }
})

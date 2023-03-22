import { createSelector } from '@reduxjs/toolkit'
import { FileTemplateTypes } from 'FileTemplates'
import {
  getEditableDirectoryContents as getEditableDirectoryContentsInternal
} from './FileSystemUtils'

import type { RootState } from '../Store'
import type {
  FSDirectoryContents,
  FSFileSystemDirectoryHandle,
  FSFileSystemFileHandle
} from 'FileSystem'

/* **************************************************************************/
// Directory
/* **************************************************************************/

/**
 * Gets the editable directory contents
 */
export const getEditableDirectoryContents = createSelector(
  (state: RootState) => state.fileSystem.directoryContents,
  (state: RootState) => state.settings.editorShowManifest,
  (directoryContents: FSDirectoryContents, showManifest: boolean): FSDirectoryContents => {
    return getEditableDirectoryContentsInternal(directoryContents, showManifest)
  }
)

/* **************************************************************************/
// Files
/* **************************************************************************/
export type FileSystemDirectoryContentsWithTemplateTypes = Array<{ entry: FSFileSystemDirectoryHandle | FSFileSystemFileHandle, templateType: FileTemplateTypes }>

/**
 * Gets the original template types of the files in the directory
 */
export const getEditableDirectoryContentsWithTemplateTypes = createSelector(
  (state: RootState) => state.fileSystem.directoryContents,
  (state: RootState) => state.fileSystem.manifest,
  (state: RootState) => state.settings.editorShowManifest,
  (
    directoryContents: FSDirectoryContents,
    manifest: chrome.runtime.Manifest | undefined,
    showManifest: boolean
  ): FileSystemDirectoryContentsWithTemplateTypes => {
    // Build some indexes
    const contentscriptCssNames = new Set<string>()
    const contentscriptJsNames = new Set<string>()
    for (const cs of manifest?.content_scripts ?? []) {
      for (const css of cs.css ?? []) {
        contentscriptCssNames.add(css)
      }
      for (const js of cs.js ?? []) {
        contentscriptJsNames.add(js)
      }
    }

    // Generate the final record
    const directoryContentsWithTypes: FileSystemDirectoryContentsWithTemplateTypes = []
    for (const entry of getEditableDirectoryContentsInternal(directoryContents, showManifest)) {
      if (entry.kind !== 'file') { continue }

      if (contentscriptCssNames.has(entry.name)) {
        directoryContentsWithTypes.push({ entry, templateType: FileTemplateTypes.ContentscriptCSS })
        continue
      }
      if (contentscriptJsNames.has(entry.name)) {
        directoryContentsWithTypes.push({ entry, templateType: FileTemplateTypes.ContentscriptJS })
        continue
      }

      if (typeof (manifest?.background) === 'object') {
        if ('service_worker' in manifest.background) {
          if (manifest.background.service_worker === entry.name) {
            directoryContentsWithTypes.push({ entry, templateType: FileTemplateTypes.Background })
            continue
          }
        }
      }

      if (typeof (manifest?.action) === 'object') {
        if (manifest.action.default_popup === entry.name) {
          directoryContentsWithTypes.push({ entry, templateType: FileTemplateTypes.Popup })
          continue
        }
      }

      directoryContentsWithTypes.push({ entry, templateType: FileTemplateTypes.Other })
    }

    return directoryContentsWithTypes
  }
)

/**
 * Gets the original template type of the open file
 */
export const getOpenFileTemplateType = createSelector(
  (state: RootState) => getEditableDirectoryContentsWithTemplateTypes(state),
  (state: RootState) => state.fileSystem.fileHandle,
  (directoryContents: FileSystemDirectoryContentsWithTemplateTypes, fileHandle: FSFileSystemFileHandle | undefined) => {
    if (!fileHandle) { return FileTemplateTypes.Other }

    const record = directoryContents.find(({ entry }) => entry.name === fileHandle.name)
    return record
      ? record.templateType
      : FileTemplateTypes.Other
  }
)

/* **************************************************************************/
// Manifest
/* **************************************************************************/

/**
 * Gets the first contentscript url pattern from the manifest
 */
export const getContentscriptPrimaryUrlPattern = createSelector(
  (state: RootState) => state.fileSystem.manifest,
  (manifest?: chrome.runtime.Manifest): string => {
    if (!manifest?.content_scripts?.length) { return '<all_urls>' }
    const cs = manifest.content_scripts[0]
    return cs.matches?.[0] ?? '<all_urls>'
  }
)

import { get, set } from 'idb-keyval'
import {
  isExtensionManagerAvailable,
  writeSettings,
  readSettings
} from 'WaveboxApi'

import type { SettingsState } from 'Redux/Settings/SettingsTypes'

class Storage {
  /* **************************************************************************/
  // Editor history
  /* **************************************************************************/

  /**
   * @returns the array of previous editors
   */
  async getEditorHistory (): Promise<FileSystemDirectoryHandle[]> {
    const val: [] | undefined = await get('editorHistory')
    return val === undefined
      ? []
      : val as FileSystemDirectoryHandle[]
  }

  /**
   * Adds an editor to the history
   * @param directoryEntry: the directory entry
   */
  async addEditorHistory (directoryEntry: FileSystemDirectoryHandle): Promise<void> {
    // Really we should use update here, but update doesn't support async updaters
    // Not the end of the world if we lose an entry, but obviously could be better
    const history = await this.getEditorHistory()
    const next = [directoryEntry]
    for (const entry of history) {
      if (!(await directoryEntry.isSameEntry(entry))) {
        next.push(entry)
      }
      if (next.length >= 5) { break }
    }
    await set('editorHistory', next)
  }

  /**
   * Removes an editor from the history
   * @param directoryEntry: the directory entry
   * @return true if we removed the entry
   */
  async removeEditorHistory (directoryEntry: FileSystemDirectoryHandle): Promise<boolean> {
    // Really we should use update here, but update doesn't support async updaters
    // Not the end of the world if we lose an entry, but obviously could be better
    const history = await this.getEditorHistory()
    const next = []
    let success = false
    for (const entry of history) {
      if (await directoryEntry.isSameEntry(entry)) {
        success = true
      } else {
        next.push(entry)
      }
      if (next.length >= 5) { break }
    }
    await set('editorHistory', next)
    return success
  }

  /* **************************************************************************/
  // Settings
  /* **************************************************************************/

  /**
   * Gets the settings object
   * @returns the settings object from the database
   */
  async getSettings (): Promise<Partial<SettingsState>> {
    const val: SettingsState | undefined = await isExtensionManagerAvailable() ? await readSettings() : await get('settings')
    return val ?? {}
  }

  /**
   * Writes the settings back to the database
   * @param settings: the settings object to write
   */
  async setSettings (settings: SettingsState): Promise<void> {
    if (await isExtensionManagerAvailable()) {
      await writeSettings(settings)
    } else {
      await set('settings', settings)
    }
  }
}

export default new Storage()

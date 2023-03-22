import store from './Store'
import Storage from 'Storage'
import { debounce } from 'throttle-debounce'

import type { SettingsState } from './Settings/SettingsTypes'

class Autopersist {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #started = false
  #settings?: SettingsState = undefined

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
   * Starts watching for changes and auto-persisting
   */
  start () {
    if (this.#started) { return }
    this.#started = true

    const state = store.getState()
    this.#settings = state.settings

    store.subscribe(this.#handleStoreChanged)
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
   * Handles the store changing looking for persist events
   */
  #handleStoreChanged = () => {
    const state = store.getState()
    if (state.settings !== this.#settings) {
      this.#settings = state.settings
      this.#handleWriteSettings(state.settings)
    }
  }

  /**
   * Writes settings to disk
   */
  #handleWriteSettings = debounce(500, (settings) => {
    Storage.setSettings(settings)
  })
}

export default new Autopersist()

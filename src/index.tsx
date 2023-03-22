import React from 'react'
import ReactDOM from 'react-dom/client'
import App from 'Views/App'
import { Provider as ReduxProvider } from 'react-redux'
import Store from 'Redux/Store'
import Storage from 'Storage'
import Autopersist from 'Redux/Autopersist'
import SettingsActions from 'Redux/Settings/SettingsActions'
import AppThemeProvider from './AppThemeProvider'

async function main () {
  Autopersist.start()

  const $root = document.getElementById('root')
  if (!$root) { throw new Error('Failed to locate root element') }
  const root = ReactDOM.createRoot($root)

  Store.dispatch(SettingsActions.load({ data: await Storage.getSettings() }))
  root.render(
    <ReduxProvider store={Store}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </ReduxProvider>
  )
}

main()

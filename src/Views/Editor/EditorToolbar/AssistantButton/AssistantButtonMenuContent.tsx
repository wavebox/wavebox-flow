import React from 'react'
import { List, ListItemText, ListItemIcon, MenuItem, Paper } from '@mui/material'
import { AssistantView } from 'Redux/Views/ViewsTypes'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import DownloadIcon from '@mui/icons-material/Download'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CodeIcon from '@mui/icons-material/Code'
import { connect } from 'react-redux'
import { isExtensionManagerAvailable } from 'R/WaveboxApi'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { FSFileSystemFileHandle } from 'FileSystem'

interface Props {
  onCheckCodeForErrors: () => void

  onOpenAssistant: (view: AssistantView) => void

  dispatch: AppDispatch
  fileHandle?: FSFileSystemFileHandle
}

class AssistantButtonMenuContent extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    isExtensionManagerAvailable().then((available) => {
      this.setState({ extensionManagerAvailable: available })
    })
  }

  /* **************************************************************************/
  // Data
  /* **************************************************************************/

  state = {
    extensionManagerAvailable: true
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleCheckCodeForErrors = () => {
    const { onOpenAssistant, onCheckCodeForErrors } = this.props
    onOpenAssistant(AssistantView.Chat)
    onCheckCodeForErrors()
  }

  handleOpenExtensionAPIDocs = () => {
    window.open('https://developer.chrome.com/extensions/api_index', '_blank')
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      onOpenAssistant,
      dispatch,
      fileHandle,
      onCheckCodeForErrors,
      ...passProps
    } = this.props
    const {
      extensionManagerAvailable
    } = this.state

    return (
      <Paper elevation={8} {...passProps}>
        <List dense>
          <MenuItem onClick={() => { onOpenAssistant(AssistantView.Chat) }}>
            <ListItemIcon>
              <SmartToyIcon />
            </ListItemIcon>
            <ListItemText
              primary='ChatGPT assistant'
              secondary='A helpful assistant that can help you create your flow'
            />
          </MenuItem>
          <MenuItem onClick={this.handleCheckCodeForErrors} disabled={!fileHandle}>
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText
              primary='Check my code for errors'
              secondary='Use the AI assistant to check for errors'
            />
          </MenuItem>
          <MenuItem onClick={this.handleOpenExtensionAPIDocs}>
            <ListItemIcon>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText
              primary='Extension API documentation'
              secondary='Use the extension documentation to find out how to make use of built-in extension calls'
            />
          </MenuItem>
          {extensionManagerAvailable
            ? undefined
            : (
              <MenuItem onClick={() => { onOpenAssistant(AssistantView.Install) }}>
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText
                  primary='Install & Reload instructions'
                  secondary='See how to install your extension and reload it easily'
                />
              </MenuItem>
              )}
        </List>
      </Paper>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    fileHandle: state.fileSystem.fileHandle
  }
}

export default connect(mapStateToProps)(AssistantButtonMenuContent)

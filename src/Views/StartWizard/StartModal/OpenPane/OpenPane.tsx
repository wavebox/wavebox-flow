import React from 'react'
import clsx from 'clsx'
import {
  List, ListItemText, ListItemButton, ListItemIcon, ListItemSecondaryAction,
  Typography, Divider, IconButton
} from '@mui/material'
import { connect } from 'react-redux'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'
import ModalContent from '../../Components/ModalContent'
import { isExtensionManagerAvailable } from 'WaveboxApi'
import ExtensionIcon from '@mui/icons-material/Extension'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { FSFileSystemDirectoryHandle } from 'FileSystem'

interface Props {
  directoryHistory: FSFileSystemDirectoryHandle[]

  openDirectory: (handle: FSFileSystemDirectoryHandle) => void
  deleteFlow: (handle: FSFileSystemDirectoryHandle) => void
}

class OpenPane extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
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

  /**
   * Opens a new directory
   */
  handleOpenDirectory = async () => {
    const { openDirectory } = this.props
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
    openDirectory(handle)
  }

  handleDeleteFlow = (evt: React.MouseEvent<HTMLButtonElement>, entry: FSFileSystemDirectoryHandle) => {
    evt.stopPropagation()
    evt.preventDefault()
    this.props.deleteFlow(entry)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,

      directoryHistory,

      openDirectory,
      deleteFlow,

      ...passProps
    } = this.props
    const {
      extensionManagerAvailable
    } = this.state

    return (
      <ModalContent className={clsx(className, classes.root)} {...passProps}>
        <Typography variant='subtitle2' fontWeight='bold' paragraph>
          Edit an extension
        </Typography>
        <Typography color='textSecondary' variant='body2' paragraph>
          Pick up where you left off, by opening an extension you were
          working on previously.
        </Typography>
        <List dense className={classes.directoryList}>
          {!extensionManagerAvailable
            ? (
              <ListItemButton
                onClick={this.handleOpenDirectory}
                color='primary'
              >
                <ListItemIcon className={classes.icon}>
                  <FileOpenIcon />
                </ListItemIcon>
                <ListItemText
                  primary='Open folder'
                  primaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }}
                />
              </ListItemButton>
              )
            : undefined}
          {!extensionManagerAvailable && directoryHistory.length
            ? <Divider />
            : undefined}
          {directoryHistory.map((entry, index) => {
            return (
              <ListItemButton
                key={index}
                onClick={() => { openDirectory(entry) }}
              >
                <ListItemIcon className={classes.icon}>
                  <ExtensionIcon />
                </ListItemIcon>
                <ListItemText
                  primary={entry.name || 'Untitled'}
                  primaryTypographyProps={{ color: 'textSecondary' }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge='end'
                    onClick={(evt) => { this.handleDeleteFlow(evt, entry) }}
                    className={classes.deleteButton}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            )
          })}
        </List>
      </ModalContent>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    directoryHistory: state.fileSystem.directoryHistory
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  openDirectory: (handle: FSFileSystemDirectoryHandle) => dispatch(FileSystemActions.openDirectory({ handle })),
  deleteFlow: (handle: FSFileSystemDirectoryHandle) => dispatch(FileSystemActions.deleteFlow({ handle }))
})

export default connect(mapStateToProps, mapDispatchToProps)(OpenPane)

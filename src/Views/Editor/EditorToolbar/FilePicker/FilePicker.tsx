import React from 'react'
import { connect } from 'react-redux'
import { getEditableDirectoryContents } from 'Redux/FileSystem/FileSystemSelectors'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'
import clsx from 'clsx'
import FileButton from './FileButton'
import AddIcon from '@mui/icons-material/Add'
import { IconButton, Menu } from '@mui/material'
import AddMenuContents from './AddMenuContents'

import type { RootState, AppDispatch } from 'Redux/Store'
import type {
  FSDirectoryContents,
  FSFileSystemFileHandle,
  FSFileSystemDirectoryHandle
} from 'FileSystem'

interface Props {
  dispatch: AppDispatch
  directoryContents: FSDirectoryContents
  fileHandle?: FSFileSystemFileHandle
}

class FilePicker extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #addButtonRef = React.createRef<HTMLButtonElement>()

  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    addMenuOpen: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleOpenFile = (handle: FSFileSystemFileHandle | FSFileSystemDirectoryHandle) => {
    const { dispatch } = this.props
    if (handle.kind === 'file') {
      const fileHandle = handle as FSFileSystemFileHandle
      dispatch(FileSystemActions.openFile({ handle: fileHandle }))
    }
  }

  handleAddMenuClose = () => {
    this.setState({ addMenuOpen: false })
  }

  handleAddMenuOpen = () => {
    this.setState({ addMenuOpen: true })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      dispatch,

      directoryContents,
      fileHandle,

      ...passProps
    } = this.props
    const {
      addMenuOpen
    } = this.state

    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <div className={classes.files}>
          {directoryContents.map((entry) => {
            return (
              <FileButton
                key={`${entry.kind}:${entry.name}`}
                onClick={() => { this.handleOpenFile(entry) }}
                selected={fileHandle?.name === entry.name && fileHandle?.kind === entry.kind}
              >
                {entry.name}
              </FileButton>
            )
          })}
        </div>
        <IconButton
          ref={this.#addButtonRef}
          className={classes.addButton}
          size='small'
          onClick={this.handleAddMenuOpen}
        >
          <AddIcon className={classes.icon} />
        </IconButton>
        <Menu
          anchorEl={this.#addButtonRef.current}
          open={addMenuOpen}
          onClose={this.handleAddMenuClose}
          MenuListProps={{ dense: true }}
        >
          <AddMenuContents
            onRequestClose={this.handleAddMenuClose}
            onOpenFile={this.handleOpenFile}
          />
        </Menu>
      </div>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    directoryContents: getEditableDirectoryContents(state),
    fileHandle: state.fileSystem.fileHandle
  }
}

export default connect(mapStateToProps)(FilePicker)

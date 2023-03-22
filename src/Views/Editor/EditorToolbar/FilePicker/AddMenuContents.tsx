import React from 'react'
import { connect } from 'react-redux'
import {
  getEditableDirectoryContentsWithTemplateTypes,
  getContentscriptPrimaryUrlPattern
} from 'Redux/FileSystem/FileSystemSelectors'
import {
  ListSubheader, ListItemText, ListItemIcon,
  MenuItem, Divider
} from '@mui/material'
import memoize from 'fast-memoize'
import FormatPaintIcon from '@mui/icons-material/FormatPaint'
import CodeIcon from '@mui/icons-material/Code'
import DescriptionIcon from '@mui/icons-material/Description'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { fileTemplates, FileTemplateTypes } from 'FileTemplates'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'

import type { FileSystemDirectoryContentsWithTemplateTypes } from 'Redux/FileSystem/FileSystemSelectors'
import type {
  FSFileSystemDirectoryHandle,
  FSFileSystemFileHandle
} from 'FileSystem'
import type { RootState, AppDispatch } from 'Redux/Store'

const FILE_TYPE_HELPER_TEXT = {
  [FileTemplateTypes.ContentscriptCSS]: 'Add CSS styles to a page when it loads',
  [FileTemplateTypes.ContentscriptJS]: 'Run JavaScript when a page loads',
  [FileTemplateTypes.Background]: 'Run code in the background',
  [FileTemplateTypes.Popup]: 'Open a popup from the browser toolbar',
  [FileTemplateTypes.Other]: undefined
}

export const FILE_TYPE_ICONS = {
  [FileTemplateTypes.ContentscriptCSS]: FormatPaintIcon,
  [FileTemplateTypes.ContentscriptJS]: CodeIcon,
  [FileTemplateTypes.Background]: ContentCopyIcon,
  [FileTemplateTypes.Popup]: OpenInNewIcon,
  [FileTemplateTypes.Other]: DescriptionIcon
}

interface Props {
  onRequestClose: () => void
  onOpenFile: (handle: FSFileSystemFileHandle | FSFileSystemDirectoryHandle) => void

  dispatch: AppDispatch
  directoryHandle?: FSFileSystemDirectoryHandle
  directoryContents: FileSystemDirectoryContentsWithTemplateTypes
  primaryContentscripturlPattern: string
}

class AddMenuContents extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Memo
  /* **************************************************************************/

  #getDirectoryHas = memoize((directoryContents: FileSystemDirectoryContentsWithTemplateTypes) => {
    const types = new Set<FileTemplateTypes>()
    for (const { templateType } of directoryContents) {
      types.add(templateType)
    }
    return types
  })

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleAddContentscriptCSS = () => {
    const {
      dispatch,
      directoryHandle,
      primaryContentscripturlPattern,
      onRequestClose
    } = this.props
    if (!directoryHandle) { return }
    dispatch(FileSystemActions.createContentScript({
      directoryHandle,
      type: 'css',
      urlPattern: primaryContentscripturlPattern,
      contents: fileTemplates.csStyle.content
    }))
    onRequestClose()
  }

  handleAddContentscriptJS = () => {
    const {
      dispatch,
      directoryHandle,
      primaryContentscripturlPattern,
      onRequestClose
    } = this.props
    if (!directoryHandle) { return }
    dispatch(FileSystemActions.createContentScript({
      directoryHandle,
      type: 'js',
      urlPattern: primaryContentscripturlPattern,
      contents: fileTemplates.csFeature.content
    }))
    onRequestClose()
  }

  handleAddBackground = () => {
    const {
      dispatch,
      directoryHandle,
      onRequestClose
    } = this.props
    if (!directoryHandle) { return }
    dispatch(FileSystemActions.createBackground({
      directoryHandle,
      contents: fileTemplates.background.content
    }))
    onRequestClose()
  }

  handleAddPopup = () => {
    const {
      dispatch,
      directoryHandle,
      onRequestClose
    } = this.props
    if (!directoryHandle) { return }
    dispatch(FileSystemActions.createPopup({
      directoryHandle,
      contents: fileTemplates.popup.content
    }))
    onRequestClose()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      onRequestClose,
      onOpenFile,

      directoryContents
    } = this.props

    const directoryTypes = this.#getDirectoryHas(directoryContents)
    const hasAddItems = (
      !directoryTypes.has(FileTemplateTypes.ContentscriptCSS) ||
      !directoryTypes.has(FileTemplateTypes.ContentscriptJS) ||
      !directoryTypes.has(FileTemplateTypes.Background) ||
      !directoryTypes.has(FileTemplateTypes.Popup)
    )

    return (
      <>
        <ListSubheader className={classes.subheader}>Current files</ListSubheader>
        {directoryContents.map(({ entry, templateType }) => {
          const Icon = FILE_TYPE_ICONS[templateType]
          const helperText = FILE_TYPE_HELPER_TEXT[templateType]
          return (
            <MenuItem
              key={`${entry.kind}:${entry.name}`}
              onClick={() => { onOpenFile(entry); onRequestClose() }}
            >
              <ListItemIcon>
                {Icon ? <Icon /> : undefined}
              </ListItemIcon>
              <ListItemText primary={entry.name} secondary={helperText} />
            </MenuItem>
          )
        })}
        {hasAddItems
          ? (
            <>
              <Divider />
              <ListSubheader className={classes.subheader}>Add functionality</ListSubheader>
              {!directoryTypes.has(FileTemplateTypes.ContentscriptCSS)
                ? (
                  <MenuItem onClick={this.handleAddContentscriptCSS}>
                    <ListItemIcon>
                      <FormatPaintIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Content Stylesheet'
                      secondary={FILE_TYPE_HELPER_TEXT[FileTemplateTypes.ContentscriptCSS]}
                    />
                  </MenuItem>
                  )
                : undefined}
              {!directoryTypes.has(FileTemplateTypes.ContentscriptJS)
                ? (
                  <MenuItem onClick={this.handleAddContentscriptJS}>
                    <ListItemIcon>
                      <CodeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Content JavaScript'
                      secondary={FILE_TYPE_HELPER_TEXT[FileTemplateTypes.ContentscriptJS]}
                    />
                  </MenuItem>
                  )
                : undefined}
              {!directoryTypes.has(FileTemplateTypes.Background)
                ? (
                  <MenuItem onClick={this.handleAddBackground}>
                    <ListItemIcon>
                      <ContentCopyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Background'
                      secondary={FILE_TYPE_HELPER_TEXT[FileTemplateTypes.Background]}
                    />
                  </MenuItem>
                  )
                : undefined}
              {!directoryTypes.has(FileTemplateTypes.Popup)
                ? (
                  <MenuItem onClick={this.handleAddPopup}>
                    <ListItemIcon>
                      <CodeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Popup'
                      secondary={FILE_TYPE_HELPER_TEXT[FileTemplateTypes.Popup]}
                    />
                  </MenuItem>
                  )
                : undefined}
            </>
            )
          : undefined}
      </>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    directoryHandle: state.fileSystem.directoryHandle,
    directoryContents: getEditableDirectoryContentsWithTemplateTypes(state),
    primaryContentscripturlPattern: getContentscriptPrimaryUrlPattern(state)
  }
}

export default connect(mapStateToProps)(AddMenuContents)

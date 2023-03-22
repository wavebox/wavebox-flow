import React from 'react'
import { connect } from 'react-redux'
import {
  List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction, ListItemIcon, ListSubheader,
  IconButton, Divider, ToggleButtonGroup, ToggleButton, TextField
} from '@mui/material'
import SettingsActions from 'Redux/Settings/SettingsActions'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import clsx from 'clsx'
import { UserTheme } from 'Redux/Settings/SettingsTypes'
import { isExtensionManagerAvailable } from 'WaveboxApi'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { openInPlatformExplorer } from 'FileSystem'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { FSFileSystemDirectoryHandle } from 'FileSystem'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'

const PERMISSIONS = [
  ['waveboxApps', 'Wavebox apps', 'https://github.com/wavebox/wavebox-10-extension-api/tree/master/wavebox_apps_api'],
  ['brainbox', 'Brainbox', 'https://github.com/wavebox/wavebox-10-extension-api/tree/master/brainbox_api']
]

interface Props {
  onRequestClose: () => void

  editorLineNumbers: boolean
  editorShowManifest: boolean
  directoryHandle?: FSFileSystemDirectoryHandle
  userTheme: UserTheme
  manifest?: chrome.runtime.Manifest

  setEditorLineNumbers: (enabled: boolean) => void
  setEditorShowManifest: (show: boolean) => void
  setUserTheme: (userTheme: UserTheme) => void
  setManifestName: (directoryHandle: FSFileSystemDirectoryHandle, name: string) => void
  addManifestPermission: (directoryHandle: FSFileSystemDirectoryHandle, permission: string) => void
  removeManifestPermission: (directoryHandle: FSFileSystemDirectoryHandle, permission: string) => void
}

class MainDrawerContents extends React.PureComponent<Props & React.HTMLAttributes<HTMLUListElement>> {
  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    extensionManagerAvailable: false
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    isExtensionManagerAvailable().then((extensionManagerAvailable) => {
      this.setState({ extensionManagerAvailable })
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleToggleEditorLineNumbers = (evt: React.MouseEvent<HTMLElement>) => {
    evt.stopPropagation()
    const { editorLineNumbers, setEditorLineNumbers } = this.props
    setEditorLineNumbers(!editorLineNumbers)
  }

  handleToggleShowManifest = (evt: React.MouseEvent<HTMLElement>) => {
    evt.stopPropagation()
    const { editorShowManifest, setEditorShowManifest } = this.props
    setEditorShowManifest(!editorShowManifest)
  }

  handleUserThemeChange = (_event: React.MouseEvent<HTMLElement>, value: UserTheme) => {
    this.props.setUserTheme(value)
  }

  /* **************************************************************************/
  // UI Events: Blur
  /* **************************************************************************/

  handleNameKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      const target = evt.target as HTMLInputElement
      this.handleSaveName(target.value)
    }
  }

  handleNameBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    this.handleSaveName(evt.target.value)
  }

  handleSaveName = (name: string) => {
    const { directoryHandle, setManifestName } = this.props
    if (directoryHandle) {
      setManifestName(directoryHandle, name)
    }
  }

  handleShowInFolder = async () => {
    const { directoryHandle } = this.props
    if (directoryHandle) {
      await openInPlatformExplorer(directoryHandle)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      onRequestClose,

      editorLineNumbers,
      editorShowManifest,
      directoryHandle,
      userTheme,
      manifest,

      setEditorLineNumbers,
      setEditorShowManifest,
      setUserTheme,
      setManifestName,
      addManifestPermission,
      removeManifestPermission,

      ...passProps
    } = this.props
    const {
      extensionManagerAvailable
    } = this.state

    return (
      <List className={clsx(classes.root, className)} dense {...passProps}>
        {extensionManagerAvailable
          ? (
            <ListItem className={classes.nameListItem}>
              <TextField
                key={`_${manifest?.name ?? ''}`}
                defaultValue={manifest?.name ?? ''}
                inputProps={{ className: classes.input }}
                fullWidth
                variant='outlined'
                label='Flow name'
                size='small'
                onBlur={this.handleNameBlur}
                onKeyDown={this.handleNameKeyDown}
                placeholder='My extension'
              />
            </ListItem>
            )
          : (
            <ListItem>
              <ListItemText
                primary={directoryHandle?.name ?? 'Untitled'}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            )}
        {extensionManagerAvailable
          ? (
            <ListItemButton onClick={this.handleShowInFolder}>
              <ListItemIcon style={{ minWidth: 24 }}>
                <OpenInNewIcon style={{ fontSize: '1rem' }} />
              </ListItemIcon>
              <ListItemText
                primary={navigator.userAgent.includes('Mac OS')
                  ? 'Show in finder'
                  : 'Show in folder'}
              />
            </ListItemButton>
            )
          : undefined}
        <Divider />
        <ListItem>
          <ListItemText primary='Theme' />
          <ListItemSecondaryAction>
            <ToggleButtonGroup
              value={userTheme}
              size='small'
              exclusive
              onChange={this.handleUserThemeChange}
              className={classes.themeButtons}
            >
              <ToggleButton value={UserTheme.System} className={classes.button}>System</ToggleButton>
              <ToggleButton value={UserTheme.Light} className={classes.button}>Light</ToggleButton>
              <ToggleButton value={UserTheme.Dark} className={classes.button}>Dark</ToggleButton>
            </ToggleButtonGroup>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItemButton onClick={this.handleToggleEditorLineNumbers}>
          <ListItemText primary='Line numbers' />
          <ListItemSecondaryAction>
            <IconButton
              color={editorLineNumbers ? 'primary' : 'default'}
              size='small'
              onClick={this.handleToggleEditorLineNumbers}
              className={classes.checkbox}
            >
              {editorLineNumbers
                ? <CheckBoxIcon />
                : <CheckBoxOutlineBlankIcon />}
            </IconButton>
          </ListItemSecondaryAction>
        </ListItemButton>
        <ListItemButton onClick={this.handleToggleShowManifest}>
          <ListItemText primary='Show manifest' />
          <ListItemSecondaryAction>
            <IconButton
              color={editorShowManifest ? 'primary' : 'default'}
              size='small'
              onClick={this.handleToggleShowManifest}
              className={classes.checkbox}
            >
              {editorShowManifest
                ? <CheckBoxIcon />
                : <CheckBoxOutlineBlankIcon />}
            </IconButton>
          </ListItemSecondaryAction>
        </ListItemButton>
        <Divider />
        <ListSubheader>Manifest permissions</ListSubheader>
        {PERMISSIONS.map(([permission, name, url]) => {
          // eslint-disable-next-line
          // @ts-ignore
          const enabled = manifest?.permissions?.includes?.(permission)
          const onClick = (evt: React.MouseEvent<HTMLElement>) => {
            evt.stopPropagation()
            if (!directoryHandle) { return }
            if (enabled) {
              removeManifestPermission(directoryHandle, permission)
            } else {
              addManifestPermission(directoryHandle, permission)
            }
          }
          return (
            <ListItemButton
              key={permission}
              onClick={onClick}
            >
              <ListItemText
                primary={name}
                secondary={<a style={{ color: 'var(--mui-palette-primary-main)' }} href={url} target='_blank'>API info</a>}
              />
              <ListItemSecondaryAction>
                <IconButton
                  color={enabled ? 'primary' : 'default'}
                  size='small'
                  onClick={onClick}
                  className={classes.checkbox}
                >
                  {enabled
                    ? <CheckBoxIcon />
                    : <CheckBoxOutlineBlankIcon />}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItemButton>
          )
        })}
      </List>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    directoryHandle: state.fileSystem.directoryHandle,
    editorLineNumbers: state.settings.editorLineNumbers,
    editorShowManifest: state.settings.editorShowManifest,
    userTheme: state.settings.userTheme,
    manifest: state.fileSystem.manifest
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setEditorLineNumbers: (enabled: boolean) => dispatch(SettingsActions.setEditorLineNumbers({ enabled })),
  setEditorShowManifest: (show: boolean) => dispatch(SettingsActions.setEditorShowManifest({ show })),
  setUserTheme: (userTheme: UserTheme) => dispatch(SettingsActions.setUserTheme({ userTheme })),
  setManifestName: (directoryHandle: FSFileSystemDirectoryHandle, name: string) => dispatch(FileSystemActions.setManifestName({ directoryHandle, name })),
  addManifestPermission: (directoryHandle: FSFileSystemDirectoryHandle, permission: string) => dispatch(FileSystemActions.addManifestPermission({ directoryHandle, permission })),
  removeManifestPermission: (directoryHandle: FSFileSystemDirectoryHandle, permission: string) => dispatch(FileSystemActions.removeManifestPermission({ directoryHandle, permission }))
})

export default connect(mapStateToProps, mapDispatchToProps)(MainDrawerContents)

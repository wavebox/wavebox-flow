import React from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { Typography, IconButton, Drawer } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import MainDrawerContents from './MainDrawerContents'

import type { RootState, AppDispatch } from 'Redux/Store'

interface Props {
  dispatch: AppDispatch
  manifest?: chrome.runtime.Manifest
}

class OpenEditorInfo extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    drawerOpen: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleDrawerOpen = () => {
    this.setState({ drawerOpen: true })
  }

  handleDrawerClose = () => {
    this.setState({ drawerOpen: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,

      dispatch,
      manifest,

      ...passProps
    } = this.props
    const {
      drawerOpen
    } = this.state

    return (
      <>
        <div className={clsx(className, classes.root)} {...passProps}>
          <IconButton size='small' className={classes.menuButton} onClick={this.handleDrawerOpen}>
            <MenuIcon className={classes.icon} />
          </IconButton>
          <Typography fontSize='small' fontWeight='bold' className={classes.folderName}>
            {manifest?.name ?? 'Untitled'}
          </Typography>
        </div>
        <Drawer
          anchor='left'
          open={drawerOpen}
          onClose={this.handleDrawerClose}
        >
          <MainDrawerContents onRequestClose={this.handleDrawerClose} />
        </Drawer>
      </>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    manifest: state.fileSystem.manifest
  }
}

export default connect(mapStateToProps)(OpenEditorInfo)

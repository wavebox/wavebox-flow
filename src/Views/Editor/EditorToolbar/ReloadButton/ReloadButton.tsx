import React from 'react'
import clsx from 'clsx'
import { IconButton, Tooltip } from '@mui/material'
import { connect } from 'react-redux'
import RefreshIcon from '@mui/icons-material/Refresh'
import GradientSvgIcon from 'Icons/GradientSvgIcon'
import {
  isExtensionManagerAvailable,
  reloadExtension
} from 'WaveboxApi'
import ViewsActions from 'Redux/Views/ViewsActions'
import { HintView } from 'Redux/Views/ViewsTypes'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { FSFileSystemDirectoryHandle } from 'FileSystem'
import type RemoteFileSystemDirectoryHandle from 'FileSystem/RemoteFileSystemDirectoryHandle'

interface Props {
  directoryHandle: undefined | FSFileSystemDirectoryHandle

  suppressHint: () => void
}

class ReloadButton extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    reloadAvailable: false,
    animate: false
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    isExtensionManagerAvailable().then((available) => {
      this.setState({ reloadAvailable: available })
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleButtonClick = () => {
    const { directoryHandle, suppressHint } = this.props
    if (directoryHandle) {
      reloadExtension(directoryHandle as RemoteFileSystemDirectoryHandle)
      this.setState({ animate: true })
    }
    suppressHint()
  }

  handleResetAnimation = () => {
    setTimeout(() => {
      this.setState({ animate: false })
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,

      directoryHandle,

      suppressHint,

      ...passProps
    } = this.props
    const {
      reloadAvailable,
      animate
    } = this.state

    if (!reloadAvailable) { return false }

    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <Tooltip title='Reload your extension' arrow disableInteractive>
          <IconButton
            onClick={this.handleButtonClick}
            className={clsx(classes.icon, animate ? classes.spin : undefined)}
            onAnimationEnd={this.handleResetAnimation}
          >
            <GradientSvgIcon
              Icon={RefreshIcon}
              start='var(--mui-palette-primary-main)'
              end='var(--mui-palette-primary-dark)'
            />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    directoryHandle: state.fileSystem.directoryHandle
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  suppressHint: () => dispatch(ViewsActions.addSuppressedHintView({ view: HintView.Reload }))
})

export default connect(mapStateToProps, mapDispatchToProps)(ReloadButton)

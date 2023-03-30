import React from 'react'
import clsx from 'clsx'
import { connect } from 'react-redux'
import { Paper, Typography, Tooltip } from '@mui/material'
import Editor from './Editor'
import StartWizard from './StartWizard'
import { isWavebox, getTask, isExtensionManagerAvailable } from 'WaveboxApi'
import { getFlowDirectoryFromExtensionId } from 'FileSystem'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import { isSupportedBrowser } from 'R/Browser'

import type { RootState, AppDispatch } from 'Redux/Store'

const SUPPORTED_BROWSERS = [
  ['Chrome', 'https://chrome.google.com', 'chrome.svg'],
  ['Edge', 'https://www.microsoft.com/edge', 'edge.svg'],
  ['Wavebox', 'https://wavebox.io/', 'wavebox.svg'],
  ['Brave', 'https://brave.com/', 'brave.png'],
  ['Vivaldi', 'https://vivaldi.com/', 'vivaldi.svg']
]

interface Props {
  hasOpenDirectory: boolean
  dispatch: AppDispatch
}

class App extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const { dispatch } = this.props
    // Handle any launch tasks
    ;(async () => {
      if (await isExtensionManagerAvailable()) {
        const task = await getTask()
        switch (task?.type) {
          case 'edit': {
            const editTask = task as { type: string, extensionId: string }
            const directoryHandle = await getFlowDirectoryFromExtensionId(editTask.extensionId)
            dispatch(FileSystemActions.openDirectory({ handle: directoryHandle }))
            break
          }
        }
      }
    })()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,

      hasOpenDirectory,

      dispatch,

      ...passProps
    } = this.props

    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <Paper
          className={clsx(
            classes.pane,
            isWavebox ? classes.wavebox : undefined,
            hasOpenDirectory
              ? undefined
              : isSupportedBrowser
                ? classes.empty
                : undefined
          )}
        >
          {isSupportedBrowser
            ? hasOpenDirectory
              ? <Editor />
              : <StartWizard />
            : (
              <div className={classes.unsupportedBrowser}>
                <SentimentVeryDissatisfiedIcon className={classes.icon} />
                <Typography variant='h4' align='center' paragraph>
                  Oh no!
                </Typography>
                <Typography variant='body1' align='center'>
                  Thanks for taking a look at Wavebox Flow.
                </Typography>
                <Typography variant='body1' align='center' paragraph>
                  Unfortunately this browser is not supported.
                </Typography>
                <Typography variant='body1' align='center'>
                    Try launching flow in one of the following desktop browsers:
                </Typography>
                <div className={classes.browsers}>
                  {SUPPORTED_BROWSERS.map(([name, url, icon]) => (
                    <Tooltip arrow disableInteractive title={name} key={name}>
                      <a target='_blank' href={url}>
                        <img src={`/assets/browsers/${icon}`} />
                      </a>
                    </Tooltip>
                  ))}
                </div>
              </div>
              )}
        </Paper>
      </div>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    hasOpenDirectory: Boolean(state.fileSystem.directoryHandle)
  }
}

export default connect(mapStateToProps)(App)

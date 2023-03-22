import React from 'react'
import clsx from 'clsx'
import { connect } from 'react-redux'
import { Paper } from '@mui/material'
import Editor from './Editor'
import StartWizard from './StartWizard'
import { isWavebox, getTask, isExtensionManagerAvailable } from 'WaveboxApi'
import { getFlowDirectoryFromExtensionId } from 'FileSystem'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'

import type { RootState, AppDispatch } from 'Redux/Store'

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
            hasOpenDirectory ? undefined : classes.empty
          )}
        >
          {hasOpenDirectory
            ? <Editor />
            : <StartWizard />}
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

import React from 'react'
import { connect } from 'react-redux'
import EditorToolbar from './EditorToolbar'
import CodeEditor from './CodeEditor'
import clsx from 'clsx'
import HintBasestrip from './HintBasestrip'
import AssistantSidebar from './AssistantSidebar'
import { AssistantView } from 'Redux/Views/ViewsTypes'
import { isHintViewOpen } from 'Redux/Views/ViewsSelectors'
import { SizeMe } from 'react-sizeme'
import SettingsActions from 'Redux/Settings/SettingsActions'
import * as BotSagas from 'Redux/Bot/BotSagas'
import {
  isExtensionManagerAvailable,
  reloadExtension
} from 'WaveboxApi'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { SizeMeProps } from 'react-sizeme'
import type { FSFileSystemDirectoryHandle, FSFileSystemFileHandle } from 'FileSystem'
import type RemoteFileSystemDirectoryHandle from 'FileSystem/RemoteFileSystemDirectoryHandle'
import type { PublicCodeEditor } from './CodeEditor'

interface Props {
  dispatch: AppDispatch
  directoryHandle?: FSFileSystemDirectoryHandle
  fileHandle?: FSFileSystemFileHandle
  hintViewOpen: boolean
  assistantViewOpen: boolean
  assistantViewSize: number

  setAssistantViewSize: (size: number) => void
}

interface State {
  assistantViewResizing: boolean
}

class Editor extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #assistantViewResize: undefined | { mouseX: number, startWidth: number, lastWidth: number }
  #codeEditor: PublicCodeEditor | null = null

  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    assistantViewResizing: false
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentWillUnmount () {
    document.body.removeEventListener('mousemove', this.handleBodyMouseMove, false)
    window.removeEventListener('mouseup', this.handleFinishAssistantViewResize, false)
  }

  /* **************************************************************************/
  // Editor events
  /* **************************************************************************/

  handleSetEditor = (editor: PublicCodeEditor | null) => {
    this.#codeEditor = editor
  }

  handleCheckCodeForErrors = () => {
    const {
      dispatch,
      fileHandle
    } = this.props

    if (fileHandle) {
      if (this.#codeEditor) {
        const model = this.#codeEditor.editor.getModel()
        const selection = this.#codeEditor.editor.getSelection()
        if (model && selection) {
          BotSagas.validateCode(dispatch, fileHandle, model.getValueInRange(selection))
          return
        }
      }
      BotSagas.validateCode(dispatch, fileHandle)
    }
  }

  handleReloadExtension = async () => {
    const { directoryHandle } = this.props
    if (await isExtensionManagerAvailable() && directoryHandle) {
      if (this.#codeEditor) {
        await this.#codeEditor.saveNow()
      }
      reloadExtension(directoryHandle as RemoteFileSystemDirectoryHandle)
    }
  }

  /* **************************************************************************/
  // UI Events: resize handle
  /* **************************************************************************/

  handleStartAssistantViewResize = (evt: React.MouseEvent<HTMLDivElement>) => {
    const { assistantViewSize } = this.props
    this.#assistantViewResize = {
      mouseX: evt.clientX,
      startWidth: assistantViewSize,
      lastWidth: assistantViewSize
    }

    document.body.addEventListener('mousemove', this.handleBodyMouseMove, false)
    window.addEventListener('mouseup', this.handleFinishAssistantViewResize, false)
    this.setState({ assistantViewResizing: true })
  }

  handleBodyMouseMove = (evt: MouseEvent) => {
    if (!this.#assistantViewResize) { return }
    const delta = this.#assistantViewResize.mouseX - evt.clientX
    const nextWidth = this.#assistantViewResize.startWidth + delta
    if (nextWidth !== this.#assistantViewResize.lastWidth) {
      this.#assistantViewResize.lastWidth = nextWidth
      this.props.setAssistantViewSize(nextWidth)
    }
  }

  handleFinishAssistantViewResize = () => {
    this.#assistantViewResize = undefined
    this.setState({ assistantViewResizing: false })

    document.body.removeEventListener('mousemove', this.handleBodyMouseMove, false)
    window.removeEventListener('mouseup', this.handleFinishAssistantViewResize, false)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  renderContent = ({ size }: SizeMeProps) => {
    const {
      className,
      dispatch,

      directoryHandle,
      fileHandle,
      hintViewOpen,
      assistantViewOpen,
      assistantViewSize: _rawAssistantViewSize,

      setAssistantViewSize,

      ...passProps
    } = this.props
    const {
      assistantViewResizing
    } = this.state
    const assistantViewSize = size?.width
      ? Math.min(size.width * 0.75, _rawAssistantViewSize)
      : _rawAssistantViewSize

    const featureClasses = clsx(
      hintViewOpen ? classes.hintViewOpen : undefined,
      assistantViewOpen ? classes.assistantViewOpen : undefined,
      assistantViewResizing ? classes.assistnViewResize : undefined
    )

    return (
      <div className={clsx(classes.root, className)} {...passProps}>
        <div
          className={clsx(classes.editor, featureClasses)}
          style={{ right: assistantViewSize }}
        >
          <EditorToolbar
            onCheckCodeForErrors={this.handleCheckCodeForErrors}
            onReloadExtension={this.handleReloadExtension}
            className={classes.toolbar}
          />
          <CodeEditor
            onSetEditor={this.handleSetEditor}
            className={classes.codeEditor}
          />
        </div>
        <AssistantSidebar
          className={clsx(classes.assistantSidebar, featureClasses)}
          style={{ width: assistantViewSize, right: -assistantViewSize }}
        />
        <HintBasestrip
          className={clsx(classes.hintBasestrip, featureClasses)}
          style={{ right: assistantViewSize }}
        />
        <div
          className={clsx(classes.assistantSidebarResizeHandle, featureClasses)}
          style={{ right: assistantViewSize }}
          onMouseDown={this.handleStartAssistantViewResize}
        />
      </div>
    )
  }

  render () {
    return (
      <SizeMe
        monitorHeight={false}
        monitorWidth={true}
        noPlaceholder
      >
        {this.renderContent}
      </SizeMe>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    directoryHandle: state.fileSystem.directoryHandle,
    fileHandle: state.fileSystem.fileHandle,
    hintViewOpen: isHintViewOpen(state),
    assistantViewOpen: state.views.assistantView !== AssistantView.None,
    assistantViewSize: state.settings.assistantViewSize
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setAssistantViewSize: (size: number) => dispatch(SettingsActions.setAssistantViewSize({ size })),
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(Editor)

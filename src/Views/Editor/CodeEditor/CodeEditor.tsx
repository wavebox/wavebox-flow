import React from 'react'
import { connect } from 'react-redux'
import MonacoEditor from '@monaco-editor/react'
import memoizeOne from 'memoize-one'
import { throttle } from 'throttle-debounce'
import { nanoid } from 'nanoid'
import FileSystemFlows from 'Redux/FileSystem/FileSystemUtils'
import Statusbar, { SaveStatus } from './Statusbar'
import clsx from 'clsx'
import { getAppTheme } from 'Redux/Settings/SettingsSelectors'
import { AppTheme } from 'Redux/Settings/SettingsTypes'
import ViewsActions from 'Redux/Views/ViewsActions'
import { HintView } from 'Redux/Views/ViewsTypes'
import { isExtensionManagerAvailable } from 'WaveboxApi'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { OnChange, EditorProps, OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'
import type { FSFileSystemDirectoryHandle, FSFileSystemFileHandle } from 'FileSystem'

interface EditingFile {
  handle: undefined | FSFileSystemFileHandle
  contents: undefined | string
  unsavedChanges: boolean
}

export interface PublicCodeEditor {
  editor: editor.IStandaloneCodeEditor
  saveNow: () => Promise<void>
}

type SetEditorFn = (publicEditor: PublicCodeEditor | null) => void

interface Props {
  dispatch: AppDispatch
  onSetEditor: SetEditorFn
  directoryHandle: undefined | FSFileSystemDirectoryHandle
  fileHandle?: FSFileSystemFileHandle
  editorLineNumbers: boolean
  appTheme: AppTheme
  hintView: HintView
}

interface State {
  fileLoadHash: string
  initialFileContents?: string
  saveStatus: SaveStatus
}

class CodeEditor extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #editingFile: EditingFile = {
    handle: undefined,
    contents: undefined,
    unsavedChanges: false
  }

  /* **************************************************************************/
  // Data
  /* **************************************************************************/

  state = {
    fileLoadHash: nanoid(),
    initialFileContents: undefined,
    saveStatus: SaveStatus.Idle
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.#loadFileContents()
    window.addEventListener('keydown', this.handleWindowKeypress)
  }

  componentWillUnmount () {
    this.props.onSetEditor(null)
    this.handleSaveNow()
    window.removeEventListener('keydown', this.handleWindowKeypress)
  }

  componentDidUpdate (prevProps: Readonly<Props & React.HTMLAttributes<HTMLDivElement>>) {
    if (this.props.fileHandle !== prevProps.fileHandle) {
      this.handleSaveNow()
      this.#loadFileContents()
    }
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
   * Loads the file contents from disk
   */
  #loadFileContents = async () => {
    this.#editingFile = {
      handle: this.props.fileHandle,
      contents: undefined,
      unsavedChanges: false
    }
    this.setState({ saveStatus: SaveStatus.Idle })
    if (this.props.fileHandle) {
      const file = await this.props.fileHandle.getFile()
      const contents = await file.text()
      this.#editingFile = {
        handle: this.props.fileHandle,
        contents,
        unsavedChanges: false
      }
      this.setState({
        fileLoadHash: nanoid(),
        initialFileContents: contents,
        saveStatus: SaveStatus.Idle
      })
    }
  }

  /**
   * Saves the file contents immediately
   */
  handleSaveNow = async () => {
    const {
      dispatch,
      hintView
    } = this.props
    const {
      handle,
      contents,
      unsavedChanges
    } = this.#editingFile

    if (handle && contents && unsavedChanges) {
      this.setState({ saveStatus: SaveStatus.Busy })
      await FileSystemFlows.writeTextFile(handle, contents)
      this.#editingFile.unsavedChanges = false
      this.setState({ saveStatus: SaveStatus.Idle })

      if (await isExtensionManagerAvailable()) {
        if (hintView !== HintView.Reload) {
          dispatch(ViewsActions.setHintView({ view: HintView.Reload }))
        }
      } else {
        if (hintView !== HintView.Install) {
          dispatch(ViewsActions.setHintView({ view: HintView.Install }))
        }
      }
    }
  }

  /**
   * Saves the file contents on throttle
   */
  handleSaveThrottle = throttle(2500, this.handleSaveNow)

  /**
   * Gets the editor language
   * @param filename: the current filename
   * @return the editor language
   */
  #getEditorLanguage = memoizeOne((filename: string | undefined): string | undefined => {
    if (filename === undefined) { return undefined }
    const ext = filename.split('.').at(-1)
    if (typeof (ext) !== 'string') { return 'code' }
    switch (ext) {
      case 'js': return 'javascript'
      case 'css': return 'css'
      case 'html': return 'html'
      case 'json': return 'json'
      default: return ext
    }
  })

  /**
   * Gets the editor options
   */
  #getEditorOptions = memoizeOne((lineNumbers: boolean) => {
    const options: EditorProps['options'] = {
      insertSpaces: true,
      tabSize: 2,
      lineNumbers: lineNumbers ? 'on' : 'off'
    }
    return options
  })

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleWindowKeypress = (evt: KeyboardEvent) => {
    if (evt.ctrlKey || evt.metaKey) {
      if (evt.key === 'S' || evt.key === 's') {
        evt.preventDefault()
        this.handleSaveNow()
      }
    }
  }

  /* **************************************************************************/
  // Editor Events
  /* **************************************************************************/

  handleEditorChange: OnChange = (value) => {
    const { fileHandle } = this.props
    if (fileHandle && fileHandle === this.#editingFile.handle) {
      this.#editingFile.contents = value
      this.#editingFile.unsavedChanges = true
      this.setState({ saveStatus: SaveStatus.Pending })
      this.handleSaveThrottle()
    }
  }

  handleEditorMount: OnMount = (editor) => {
    const { onSetEditor } = this.props
    onSetEditor({
      editor,
      saveNow: this.handleSaveNow
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      dispatch,
      directoryHandle,
      fileHandle,
      onSetEditor,

      editorLineNumbers,
      appTheme,
      hintView,

      ...passProps
    } = this.props
    const {
      fileLoadHash,
      initialFileContents,
      saveStatus
    } = this.state

    let theme
    switch (appTheme) {
      case AppTheme.Light: theme = 'vs-light'; break
      case AppTheme.Dark: theme = 'vs-dark'; break
    }

    return (
      <div className={clsx(classes.root, className)} {...passProps}>
        {initialFileContents !== undefined
          ? (
            <MonacoEditor
              key={fileLoadHash}
              className={classes.monaco}
              defaultLanguage={this.#getEditorLanguage(fileHandle?.name)}
              defaultValue={initialFileContents}
              defaultPath={fileHandle?.name}
              theme={theme}
              options={this.#getEditorOptions(editorLineNumbers)}
              onChange={this.handleEditorChange}
              onMount={this.handleEditorMount}
            />
            )
          : undefined}
        <Statusbar
          className={classes.statusbar}
          saveStatus={saveStatus}
        />
      </div>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    fileHandle: state.fileSystem.fileHandle,
    directoryHandle: state.fileSystem.directoryHandle,
    editorLineNumbers: state.settings.editorLineNumbers,
    appTheme: getAppTheme(state),
    hintView: state.views.hintView
  }
}

export default connect(mapStateToProps)(CodeEditor)

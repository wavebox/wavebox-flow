import React from 'react'
import FilePicker from './FilePicker'
import OpenEditorInfo from './OpenEditorInfo'
import clsx from 'clsx'
import AssistantButton from './AssistantButton'
import ReloadButton from './ReloadButton'

interface Props {
  onCheckCodeForErrors: () => void
  onReloadExtension: () => void
}

class EditorToolbar extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      onCheckCodeForErrors,
      onReloadExtension,

      ...passProps
    } = this.props

    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <OpenEditorInfo />
        <FilePicker />
        <ReloadButton onReloadExtension={onReloadExtension} />
        <AssistantButton onCheckCodeForErrors={onCheckCodeForErrors} />
      </div>
    )
  }
}

export default EditorToolbar

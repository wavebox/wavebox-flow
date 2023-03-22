import React from 'react'
import FilePicker from './FilePicker'
import OpenEditorInfo from './OpenEditorInfo'
import clsx from 'clsx'
import AssistantButton from './AssistantButton'
import ReloadButton from './ReloadButton'

interface Props {
  onCheckCodeForErrors: () => void
}

class EditorToolbar extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      onCheckCodeForErrors,

      ...passProps
    } = this.props

    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <OpenEditorInfo />
        <FilePicker />
        <ReloadButton />
        <AssistantButton onCheckCodeForErrors={onCheckCodeForErrors} />
      </div>
    )
  }
}

export default EditorToolbar

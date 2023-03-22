import React from 'react'
import clsx from 'clsx'
import { connect } from 'react-redux'
import { AssistantView } from 'Redux/Views/ViewsTypes'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InstallAssistantContent from './InstallAssistantContent'
import ChatAssistantContent from './ChatAssistantContent'
import ViewsActions from 'Redux/Views/ViewsActions'

import type { RootState, AppDispatch } from 'Redux/Store'

interface Props {
  assistantView: AssistantView
  closeView: () => void
}

interface State {
  shadowView: AssistantView
}

class AssistantSidebar extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #rootRef = React.createRef<HTMLDivElement>()
  #shadowViewClearer: ReturnType<typeof setTimeout> | undefined

  /* **************************************************************************/
  // Data
  /* **************************************************************************/

  state = {
    shadowView: this.props.assistantView
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidUpdate (prevProps: Readonly<Props & React.HTMLAttributes<HTMLDivElement>>) {
    if (this.props.assistantView !== prevProps.assistantView) {
      clearTimeout(this.#shadowViewClearer)
      switch (this.props.assistantView) {
        case AssistantView.None:
          this.#shadowViewClearer = setTimeout(() => {
            this.setState({ shadowView: AssistantView.None })
          }, 1000)
          break
        default:
          this.setState({ shadowView: this.props.assistantView })
          break
      }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,

      assistantView,
      closeView,

      ...passProps
    } = this.props
    const {
      shadowView
    } = this.state

    const renderView = assistantView === AssistantView.None
      ? shadowView
      : assistantView

    let Content: React.ElementType | false
    switch (renderView) {
      case AssistantView.Install: Content = InstallAssistantContent; break
      case AssistantView.Chat: Content = ChatAssistantContent; break
      case AssistantView.None: Content = false; break
    }

    return (
      <div
        ref={this.#rootRef}
        className={clsx(className, classes.root)}
        {...passProps}
      >
        {Content ? <Content className={classes.content} closeView={closeView} /> : undefined}
        <IconButton onClick={closeView} className={classes.closeButton} size='small'>
          <CloseIcon />
        </IconButton>
      </div>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    assistantView: state.views.assistantView
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  closeView: () => dispatch(ViewsActions.setAssistantView({ view: AssistantView.None }))
})

export default connect(mapStateToProps, mapDispatchToProps)(AssistantSidebar)

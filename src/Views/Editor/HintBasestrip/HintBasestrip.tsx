import React from 'react'
import { connect } from 'react-redux'
import { HintView } from 'Redux/Views/ViewsTypes'
import { getDisplayHintView } from 'Redux/Views/ViewsSelectors'
import InstallHintBasestrip from './InstallHintBasestrip'
import InstallWaveboxHintBasestrip from './InstallWaveboxHintBasestrip'
import ReloadHintBasestrip from './ReloadHintBasestrip'

import type { RootState, AppDispatch } from 'Redux/Store'

interface Props {
  dispatch: AppDispatch
  hintView: HintView
}

interface State {
  shadowView: HintView
}

class HintBasestrip extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #shadowViewClearer: ReturnType<typeof setTimeout> | undefined

  /* **************************************************************************/
  // Data
  /* **************************************************************************/

  state = {
    shadowView: this.props.hintView
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidUpdate (prevProps: Readonly<Props & React.HTMLAttributes<HTMLDivElement>>) {
    if (this.props.hintView !== prevProps.hintView) {
      clearTimeout(this.#shadowViewClearer)
      switch (this.props.hintView) {
        case HintView.None:
          this.#shadowViewClearer = setTimeout(() => {
            this.setState({ shadowView: HintView.None })
          }, 1000)
          break
        default:
          this.setState({ shadowView: this.props.hintView })
          break
      }
    }
  }

  componentWillUnmount () {
    clearTimeout(this.#shadowViewClearer)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      hintView,
      dispatch,

      ...passProps
    } = this.props
    const {
      shadowView
    } = this.state

    const renderView = hintView === HintView.None
      ? shadowView
      : hintView

    let Content: React.ElementType | false
    switch (renderView) {
      case HintView.Install: Content = InstallHintBasestrip; break
      case HintView.Reload: Content = ReloadHintBasestrip; break
      case HintView.InstallWavebox: Content = InstallWaveboxHintBasestrip; break
      case HintView.None: Content = false; break
    }

    return Content ? <Content {...passProps} /> : false
  }
}

function mapStateToProps (state: RootState) {
  return {
    hintView: getDisplayHintView(state)
  }
}

export default connect(mapStateToProps)(HintBasestrip)

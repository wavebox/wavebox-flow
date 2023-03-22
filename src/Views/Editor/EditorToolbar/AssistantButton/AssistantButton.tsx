import React from 'react'
import clsx from 'clsx'
import { IconButton, Tooltip, Fade, Button } from '@mui/material'
import { connect } from 'react-redux'
import { AssistantView } from 'Redux/Views/ViewsTypes'
import ViewsActions from 'Redux/Views/ViewsActions'
import SettingsActions from 'Redux/Settings/SettingsActions'
import AssistantButtonMenuContent from './AssistantButtonMenuContent'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import GradientSvgIcon from 'Icons/GradientSvgIcon'

import type { RootState, AppDispatch } from 'Redux/Store'

interface Props {
  onCheckCodeForErrors: () => void

  assistantView: AssistantView
  assistantHelperPopup: boolean

  openAssistant: (view: AssistantView) => void
  hideAssistantHelperPopup: () => void
}

class AssistantButton extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    menu: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleButtonClick = () => {
    const { assistantView, openAssistant, hideAssistantHelperPopup } = this.props
    switch (assistantView) {
      case AssistantView.None:
        openAssistant(AssistantView.Chat)
        break
      default:
        openAssistant(AssistantView.None)
        break
    }
    this.setState({ menu: false })
    hideAssistantHelperPopup()
  }

  handleOpenMenuAssistant = (view: AssistantView) => {
    const { openAssistant } = this.props
    openAssistant(view)
    this.setState({ menu: false })
  }

  handleOpenMenu = () => {
    this.setState({ menu: true })
  }

  handleCloseMenu = () => {
    this.setState({ menu: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      onCheckCodeForErrors,

      assistantView,
      assistantHelperPopup,

      openAssistant,
      hideAssistantHelperPopup,

      ...passProps
    } = this.props
    const {
      menu
    } = this.state

    return (
      <Tooltip
        open={assistantHelperPopup && !menu}
        classes={{ tooltip: classes.helperTooltip, arrow: classes.arrow }}
        arrow
        title={(
          <div onClick={hideAssistantHelperPopup}>
            <h3>
              <GradientSvgIcon
                className={classes.icon}
                Icon={SmartToyIcon}
                start='rgba(255, 255, 255, 1)'
                end='rgba(255, 255, 255, 0.6)'
              />
              Get help from the ChatGPT assistant
            </h3>
            <p>
              Press the assistant button at any time to get help with coding,
              error checking and more!
            </p>
            <Button variant='outlined' className={classes.button}>Dismiss</Button>
          </div>
        )}
      >
        <div className={clsx(className, classes.root)} {...passProps}>
          <Tooltip
            classes={{ tooltip: classes.menuTooltip }}
            title={(
              <AssistantButtonMenuContent
                onOpenAssistant={this.handleOpenMenuAssistant}
                onCheckCodeForErrors={onCheckCodeForErrors}
              />
            )}
            disableFocusListener
            open={menu}
            onOpen={this.handleOpenMenu}
            onClose={this.handleCloseMenu}
            TransitionComponent={Fade}
            leaveDelay={100}
          >
            <IconButton
              onClick={this.handleButtonClick}
              onMouseEnter={this.handleOpenMenu}
              className={classes.icon}
            >
              <GradientSvgIcon
                Icon={SmartToyIcon}
                start='var(--mui-palette-primary-main)'
                end='var(--mui-palette-primary-dark)'
              />
            </IconButton>
          </Tooltip>
        </div>
      </Tooltip>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    assistantView: state.views.assistantView,
    assistantHelperPopup: state.settings.assistantHelperPopup
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  openAssistant: (view: AssistantView) => dispatch(ViewsActions.setAssistantView({ view })),
  hideAssistantHelperPopup: () => dispatch(SettingsActions.setAssistantHelperPopup({ show: false }))
})

export default connect(mapStateToProps, mapDispatchToProps)(AssistantButton)

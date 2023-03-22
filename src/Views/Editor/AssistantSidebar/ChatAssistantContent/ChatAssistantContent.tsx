import React from 'react'
import clsx from 'clsx'
import {
  TextField, InputAdornment, IconButton, Typography,
  CircularProgress, Snackbar, Alert, Menu
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { connect } from 'react-redux'
import { BotStatus } from 'Redux/Bot/BotTypes'
import MessageItem from './MessageItem'
import * as BotSagas from 'Redux/Bot/BotSagas'
import { getAppTheme } from 'Redux/Settings/SettingsSelectors'
import memoizeOne from 'memoize-one'
import GradientSvgIcon from 'Icons/GradientSvgIcon'
import BotActions from 'Redux/Bot/BotActions'
import { introMessage } from 'Redux/Bot/BotPresetMessages'
import InfoIcon from '@mui/icons-material/Info'
import HelpMenuContent from './HelpMenuContent'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { Messages } from 'Redux/Bot/BotTypes'
import type { AppTheme } from 'Redux/Settings/SettingsTypes'
import type { FSFileSystemFileHandle } from 'FileSystem'

interface Props {
  closeView: () => void

  dispatch: AppDispatch
  messages: Messages
  botStatus: BotStatus
  shownIntroMessage: boolean
  appTheme: AppTheme
  fileHandle?: FSFileSystemFileHandle
}

interface State {
  message: string
  copiedSnackbarOpen: boolean
  helpMenuOpen: boolean
}

class ChatAssistantContent extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #textFieldRef = React.createRef<HTMLInputElement>()
  #conversationRef = React.createRef<HTMLDivElement>()
  #helpButtonRef = React.createRef<HTMLDivElement>()
  #wantsRefocus = false

  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    message: '',
    copiedSnackbarOpen: false,
    helpMenuOpen: false
  }

  /* **************************************************************************/
  // Data utils
  /* **************************************************************************/

  #inputIsDisabled (props: Props) {
    return props.botStatus === BotStatus.Busy
  }

  #getRenderMessages = memoizeOne((messages: Messages) => {
    return messages.slice(-10)
  })

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    setTimeout(() => {
      this.#textFieldRef.current?.focus?.()

      const { shownIntroMessage, dispatch, botStatus } = this.props
      if (!shownIntroMessage) {
        dispatch(BotActions.setShownIntroMessage({ shown: true }))
        if (botStatus === BotStatus.Idle) {
          BotSagas.streamPresetMessage(dispatch, introMessage, 1000)
        }
      }
    }, 500)
  }

  componentDidUpdate (prevProps: Readonly<Props & React.HTMLAttributes<HTMLDivElement>>) {
    if (this.#wantsRefocus && this.#inputIsDisabled(prevProps) && !this.#inputIsDisabled(this.props)) {
      this.#wantsRefocus = false
      this.#textFieldRef.current?.focus?.()
    }

    if (this.props.messages !== prevProps.messages) {
      const $conversation = this.#conversationRef.current
      if ($conversation) {
        $conversation.scrollTop = $conversation.scrollHeight
      }
    }
  }

  /* **************************************************************************/
  // UI Events: Text field
  /* **************************************************************************/

  handleMessageChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ message: evt.target.value })
  }

  handleMessageKeydown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter' && (!evt.ctrlKey && !evt.metaKey && !evt.shiftKey)) {
      evt.preventDefault()
      this.handleSendMessage()
    }
  }

  handleSendMessage = () => {
    const { dispatch, fileHandle, messages } = this.props
    const { message } = this.state
    if (!message) { return }
    BotSagas.sendMessage(dispatch, messages, message, fileHandle)
    this.setState({ message: '' })
    this.#wantsRefocus = true
  }

  /* **************************************************************************/
  // Snackbar
  /* **************************************************************************/

  handleOpenCopiedSnackbar = () => {
    this.setState({ copiedSnackbarOpen: true })
  }

  handleCloseCopiedSnackbar = () => {
    this.setState({ copiedSnackbarOpen: false })
  }

  /* **************************************************************************/
  // Help menu
  /* **************************************************************************/

  handleOpenHelpMenu = () => {
    this.setState({ helpMenuOpen: true })
  }

  handleCloseHelpMenu = () => {
    this.setState({ helpMenuOpen: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      closeView,

      dispatch,
      messages,
      botStatus,
      shownIntroMessage,
      appTheme,
      fileHandle,

      ...passProps
    } = this.props
    const {
      message,
      copiedSnackbarOpen,
      helpMenuOpen
    } = this.state

    const renderMessages = this.#getRenderMessages(messages)
    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <Typography fontWeight='bold' className={classes.title}>
          <GradientSvgIcon
            Icon={SmartToyIcon}
            start='var(--mui-palette-primary-main)'
            end='var(--mui-palette-primary-dark)'
            className={classes.icon}
          />
          ChatGPT Assistant
        </Typography>
        <div className={classes.conversation} ref={this.#conversationRef}>
          {renderMessages.map((message) => {
            return (
              <MessageItem
                key={message.id}
                message={message}
                appTheme={appTheme}
                openCopiedSnackbar={this.handleOpenCopiedSnackbar}
                isNewestMessage={message === messages.at(-1)}
                botStatus={botStatus}
              />
            )
          })}
        </div>
        <TextField
          inputRef={this.#textFieldRef}
          className={classes.messageInput}
          multiline
          maxRows={4}
          value={message}
          onChange={this.handleMessageChange}
          onKeyDown={this.handleMessageKeydown}
          disabled={this.#inputIsDisabled(this.props)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  disabled={this.#inputIsDisabled(this.props) || !message}
                  onClick={this.handleSendMessage}
                  edge='end'
                  color='primary'
                >
                  {botStatus === BotStatus.Busy
                    ? <CircularProgress size={16} thickness={6} />
                    : <SendIcon />
                  }
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <div
          ref={this.#helpButtonRef}
          className={classes.help}
          onClick={this.handleOpenHelpMenu}
        >
          <InfoIcon className={classes.icon} />
          Not sure what to ask?
        </div>
        <Snackbar
          open={copiedSnackbarOpen}
          autoHideDuration={1000}
          onClose={this.handleCloseCopiedSnackbar}
        >
          <Alert onClose={this.handleCloseCopiedSnackbar} severity='success' sx={{ width: '100%' }}>
            Copied to clipboard
          </Alert>
        </Snackbar>
        <Menu
          anchorEl={this.#helpButtonRef.current}
          open={helpMenuOpen}
          onClose={this.handleCloseHelpMenu}
          MenuListProps={{ dense: true }}
        >
          <HelpMenuContent onRequestClose={this.handleCloseHelpMenu} />
        </Menu>
      </div>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    messages: state.bot.messages,
    botStatus: state.bot.status,
    shownIntroMessage: state.bot.shownIntroMessage,
    appTheme: getAppTheme(state),
    fileHandle: state.fileSystem.fileHandle
  }
}

export default connect(mapStateToProps)(ChatAssistantContent)

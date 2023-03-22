import React from 'react'
import clsx from 'clsx'
import { BotStatus, MessageSender } from 'Redux/Bot/BotTypes'
import {
  Typography, Avatar, IconButton, Tooltip,
  Dialog, DialogContent
} from '@mui/material'
import FaceIcon from '@mui/icons-material/Face'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import SyntaxHighlighterDark from 'react-syntax-highlighter/dist/esm/styles/prism/dark'
import SyntaxHighlighterLight from 'react-syntax-highlighter/dist/esm/styles/prism/vs'
import { AppTheme } from 'Redux/Settings/SettingsTypes'
import memoize from 'fast-memoize'
import CopyToClipboard from 'react-copy-to-clipboard'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'

import type { Message } from 'Redux/Bot/BotTypes'
import type {
  CodeProps,
  ComponentPropsWithoutRef,
  ReactMarkdownProps
} from 'react-markdown/lib/ast-to-react'

type ImageProps = ComponentPropsWithoutRef<'img'> & ReactMarkdownProps & {
  src?: string
  alt?: string
}

interface Props {
  openCopiedSnackbar: () => void
  message: Message
  appTheme: AppTheme
  isNewestMessage: boolean
  botStatus: BotStatus
}

const getCodeLanguageFromClassName = memoize((className: string | undefined) => {
  return typeof (className) === 'string'
    ? /language-(\w+)/.exec(className || '')?.[1]
    : undefined
})

const getCodeStyle = memoize((appTheme: AppTheme): React.CSSProperties => {
  switch (appTheme) {
    case AppTheme.Dark:
      return SyntaxHighlighterDark
    case AppTheme.Light:
    default:
      return SyntaxHighlighterLight
  }
})

class MessageItem extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Element Rendering
  /* **************************************************************************/

  renderCode = ({ node, inline, className, children, ...props }: CodeProps) => {
    const language = getCodeLanguageFromClassName(className)
    if (!inline && language) {
      const code = String(children).replace(/\n$/, '')
      const highlighterProps = {
        children: code,
        style: getCodeStyle(this.props.appTheme),
        language,
        PreTag: 'div',
        ...props
      }

      // eslint-disable-next-line
      // @ts-ignore
      const highlighted = <SyntaxHighlighter {...highlighterProps} />
      return (
        <div className={classes.code}>
          {highlighted}
          <CopyToClipboard text={code} onCopy={this.props.openCopiedSnackbar}>
            <Tooltip arrow disableInteractive title='Copy'>
              <IconButton className={classes.copyButton} size='small'>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </CopyToClipboard>
        </div>
      )
    } else {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  renderImage = ({ node, alt, src, ...passProps }: ImageProps) => {
    const [expanded, setExpanded] = React.useState(false)
    return (
      <>
        <span className={classes.image} onClick={() => { setExpanded(true) }} {...passProps}>
          <img src={src} alt={alt} />
          <IconButton className={classes.expandButton}>
            <AspectRatioIcon />
          </IconButton>
        </span>
        <Dialog
          open={expanded}
          fullWidth
          maxWidth='sm'
          onClose={() => { setExpanded(false) }}
        >
          <DialogContent>
            <img src={src} alt={alt} className={classes.expandedImg} />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  #markdownComponents = {
    code: this.renderCode,
    img: this.renderImage
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      openCopiedSnackbar,
      message,
      appTheme,
      isNewestMessage,
      botStatus,
      ...passProps
    } = this.props

    let senderName: string
    let SenderIcon: React.ElementType
    let senderClassName: string
    switch (message.sender) {
      case MessageSender.User:
        senderName = 'You'
        SenderIcon = FaceIcon
        senderClassName = classes.user
        break
      case MessageSender.Bot:
      case MessageSender.BotPreset:
        senderName = 'Assistant'
        SenderIcon = SmartToyIcon
        senderClassName = classes.bot
        break
    }
    const showLoading = (
      isNewestMessage &&
      message.sender === MessageSender.Bot &&
      botStatus === BotStatus.Busy
    )

    return (
      <div
        className={clsx(className, classes.root, senderClassName)}
        {...passProps}
      >
        <div className={classes.sender}>
          <Avatar className={clsx(classes.icon, showLoading ? classes.loading : undefined)}>
            <SenderIcon />
          </Avatar>
          <Typography variant='caption' fontWeight='bold'>{senderName}</Typography>
        </div>
        <div className={classes.content}>
          <ReactMarkdown
            components={this.#markdownComponents}
            linkTarget='_blank'
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    )
  }
}

export default MessageItem

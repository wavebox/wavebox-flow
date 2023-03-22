import React from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { Typography, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import ViewsActions from 'Redux/Views/ViewsActions'
import { HintView, AssistantView } from 'Redux/Views/ViewsTypes'

import type { AppDispatch } from 'Redux/Store'

interface Props {
  suppress: () => void
  openAssistant: () => void
}

class InstallHintBasestrip extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,

      suppress,
      openAssistant,

      ...passProps
    } = this.props

    return (
      <div className={clsx(classes.root, className)} {...passProps}>
        <DownloadIcon className={classes.icon} />
        <Typography variant='body2' className={classes.text}>
          Find out how to install and reload this extension in your browser
        </Typography>
        <div className={classes.actions}>
          <Button
            color='primary'
            variant='contained'
            size='small'
            onClick={openAssistant}
          >
            Find out
          </Button>
          <IconButton onClick={suppress} size='small'>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  suppress: () => dispatch(ViewsActions.addSuppressedHintView({ view: HintView.Install })),
  openAssistant: () => {
    dispatch(ViewsActions.setAssistantView({ view: AssistantView.Install }))
    dispatch(ViewsActions.addSuppressedHintView({ view: HintView.Install }))
  }
})

export default connect(undefined, mapDispatchToProps)(InstallHintBasestrip)

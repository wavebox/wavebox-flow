import React from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { Typography, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ViewsActions from 'Redux/Views/ViewsActions'
import { HintView } from 'Redux/Views/ViewsTypes'

import type { AppDispatch } from 'Redux/Store'

interface Props {
  suppress: () => void
}

class InstallWaveboxHintBasestrip extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleOpenWavebox = () => {
    window.open('https://wavebox.io/download', '_blank')
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,

      suppress,

      ...passProps
    } = this.props

    return (
      <div className={clsx(classes.root, className)} {...passProps}>
        <img src='/assets/wavebox.svg' className={classes.icon} />
        <Typography variant='body2' fontWeight='bold' className={classes.text}>
          Use Wavebox for the most streamlined install & reload cycle when creating your flows
        </Typography>
        <div className={classes.actions}>
          <Button
            color='primary'
            variant='contained'
            size='small'
            onClick={this.handleOpenWavebox}
          >
            Download now
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
  suppress: () => dispatch(ViewsActions.addSuppressedHintView({ view: HintView.InstallWavebox }))
})

export default connect(undefined, mapDispatchToProps)(InstallWaveboxHintBasestrip)

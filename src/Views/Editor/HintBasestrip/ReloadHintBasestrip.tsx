import React from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import ViewsActions from 'Redux/Views/ViewsActions'
import { HintView } from 'Redux/Views/ViewsTypes'
import GradientSvgIcon from 'Icons/GradientSvgIcon'

import type { AppDispatch } from 'Redux/Store'

interface Props {
  suppress: () => void
}

class InstallHintBasestrip extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
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
        <GradientSvgIcon
          className={classes.icon}
          Icon={RefreshIcon}
          start='var(--mui-palette-primary-main)'
          end='var(--mui-palette-primary-dark)'
        />
        <Typography variant='body2' className={classes.text}>
          Use the reload button in the top toolbar to reload your extension at anytime
        </Typography>
        <div className={classes.actions}>
          <IconButton onClick={suppress} size='small'>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  suppress: () => dispatch(ViewsActions.addSuppressedHintView({ view: HintView.Reload }))
})

export default connect(undefined, mapDispatchToProps)(InstallHintBasestrip)

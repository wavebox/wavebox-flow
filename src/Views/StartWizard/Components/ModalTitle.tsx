import React from 'react'
import { IconButton, Typography } from '@mui/material'
import clsx from 'clsx'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

interface Props {
  onBack?: () => void
}

export default React.forwardRef<HTMLDivElement, Props & React.HTMLAttributes<HTMLDivElement>>(function ModalTitle (props, ref) {
  const {
    className,
    onBack,
    children,
    ...passProps
  } = props

  return (
    <div ref={ref} className={clsx(className, classes.root)} {...passProps}>
      {onBack
        ? (
          <IconButton onClick={onBack} className={classes.icon}>
            <ArrowBackIcon />
          </IconButton>
          )
        : undefined}
      <Typography variant='h6' fontWeight='bold' textAlign='center' className={classes.title}>
        {children}
      </Typography>
    </div>
  )
})

import React from 'react'
import clsx from 'clsx'
import { Typography, Avatar, ButtonBase } from '@mui/material'

interface Props {
  color1: string
  color2: string
  icon: React.ReactNode
  title: string
  subtitle?: string
}

class JumbotronButton extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      color1,
      color2,
      icon,
      title,
      subtitle,
      ...passProps
    } = this.props

    return (
      <ButtonBase
        className={clsx(className, classes.root)}
        component='div'
        {...passProps}
      >
        <Avatar sx={{ bgcolor: color1, color: color2 }} className={classes.icon}>
          {icon}
        </Avatar>
        <Typography variant='subtitle1' fontWeight='bold'>
          {title}
        </Typography>
        {subtitle
          ? (
            <Typography variant='body2' color='textSecondary'>
              {subtitle}
            </Typography>
            )
          : undefined}
      </ButtonBase>
    )
  }
}

export default JumbotronButton

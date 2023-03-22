import React from 'react'
import clsx from 'clsx'
import { ButtonBase } from '@mui/material'

interface Props {
  selected: boolean
}

class FileButton extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      selected,
      children,
      ...passProps
    } = this.props

    return (
      <ButtonBase
        className={clsx(className, classes.root, selected ? classes.selected : undefined)}
        component='div'
        {...passProps}
      >
        {children}
      </ButtonBase>
    )
  }
}

export default FileButton

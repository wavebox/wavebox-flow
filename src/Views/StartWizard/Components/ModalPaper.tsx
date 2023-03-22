import React from 'react'
import { Paper } from '@mui/material'
import clsx from 'clsx'

import type { PaperProps } from '@mui/material'

interface Props {
  width?: 800 | 700 | 600 | 500 | 400
}

export default React.forwardRef<HTMLDivElement, Props & PaperProps>(function ModalPaper (props, ref) {
  const { className, width, ...passProps } = props

  return (
    <Paper
      ref={ref}
      elevation={6}
      className={clsx(className, classes.root, classes[`w${width ?? 800}`])}
      {...passProps}
    />
  )
})

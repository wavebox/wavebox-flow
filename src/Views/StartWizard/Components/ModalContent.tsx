import React from 'react'
import clsx from 'clsx'

export default React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function ModalContent (props, ref) {
  const {
    className,
    children,
    ...passProps
  } = props

  return (
    <div ref={ref} className={clsx(className, classes.root)} {...passProps}>
      {children}
    </div>
  )
})

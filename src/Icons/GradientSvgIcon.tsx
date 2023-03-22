import React from 'react'
import { nanoid } from 'nanoid'
import memoizeOne from 'memoize-one'
import clsx from 'clsx'

interface Props {
  Icon: React.ElementType
  start: string
  end: string
}

class GradientSvgIcon extends React.PureComponent<Props & React.HTMLAttributes<HTMLOrSVGElement>> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #id = nanoid()
  #style = document.createElement('style')

  /* **************************************************************************/
  // Styles
  /* **************************************************************************/

  #updateStyle = memoizeOne((start: string, end: string) => {
    const classes = {
      gradient: `gradient-${this.#id}`,
      gradientStop1: `gradient-stop-1-${this.#id}`,
      gradientStop2: `gradient-stop-2-${this.#id}`,
      icon: `icon-${this.#id}`
    }

    // Icon gradient fill https://codepen.io/fontawesome/pen/BEKpBy
    this.#style.innerHTML = `
.${classes.gradient} {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
}
.${classes.gradientStop1} { stop-color: ${start}; }
.${classes.gradientStop2} { stop-color: ${end}; }
.${classes.icon} path { fill: url("#${this.#id}"); }
    `
    return classes
  })

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    document.head.appendChild(this.#style)
  }

  componentWillUnmount () {
    this.#style.parentNode?.removeChild?.(this.#style)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      start,
      end,
      Icon,
      ...passProps
    } = this.props
    const classes = this.#updateStyle(start, end)

    return (
      <>
        <svg version='1.1' xmlns='http://www.w3.org/2000/svg' className={classes.gradient}>
          <defs>
            <linearGradient id={this.#id}>
              <stop className={classes.gradientStop1} offset='0%'></stop>
              <stop className={classes.gradientStop2} offset='100%'></stop>
            </linearGradient>
          </defs>
        </svg>
        <Icon className={clsx(className, classes.icon)} {...passProps} />
      </>
    )
  }
}

export default GradientSvgIcon

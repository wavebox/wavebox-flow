import React from 'react'
import clsx from 'clsx'
import SyncIcon from '@mui/icons-material/Sync'
import DoneIcon from '@mui/icons-material/Done'

export enum SaveStatus {
  Idle,
  Pending,
  Busy
}

interface Props {
  saveStatus: SaveStatus
}

class Statusbar extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  renderSaveStatus (saveStatus: SaveStatus) {
    let text
    let icon
    switch (saveStatus) {
      case SaveStatus.Idle:
        icon = <DoneIcon className={clsx(classes.icon, classes.done)} />
        text = 'Saved'
        break
      case SaveStatus.Pending:
      case SaveStatus.Busy:
        icon = <SyncIcon className={clsx(classes.icon, classes.busy)} />
        text = 'Saving'
    }

    return (
      <div className={classes.saveStatus}>
        {icon} {text}
      </div>
    )
  }

  render () {
    const {
      className,
      saveStatus,

      ...passProps
    } = this.props

    return (
      <div className={clsx(classes.root, className)} {...passProps}>
        {this.renderSaveStatus(saveStatus)}
      </div>
    )
  }
}

export default Statusbar

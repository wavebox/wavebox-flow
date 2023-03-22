import React from 'react'
import { connect } from 'react-redux'
import { getOpenFileTemplateType } from 'Redux/FileSystem/FileSystemSelectors'
import { helpMenuMessages } from 'Redux/Bot/BotPresetMessages'
import { MenuItem, ListItemText } from '@mui/material'
import * as BotSagas from 'Redux/Bot/BotSagas'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { FileTemplateTypes } from 'FileTemplates'
import type { PresetStreamMessage } from 'Redux/Bot/BotTypes'

interface Props {
  onRequestClose: () => void
  dispatch: AppDispatch

  templateType: FileTemplateTypes
}

class HelpMenuContent extends React.PureComponent<Props> {
  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleStreamMessage = (message: PresetStreamMessage) => {
    const { dispatch, onRequestClose } = this.props
    onRequestClose()
    BotSagas.streamPresetMessage(dispatch, message)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      templateType
    } = this.props

    const messages = helpMenuMessages[templateType]

    return (
      <>
        {messages.map(({ title, message }) => {
          return (
            <MenuItem
              key={`${templateType}:${title ?? ''}`}
              onClick={() => { this.handleStreamMessage(message) }}
            >
              <ListItemText primary={title} />
            </MenuItem>
          )
        })}
      </>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    templateType: getOpenFileTemplateType(state)
  }
}

export default connect(mapStateToProps)(HelpMenuContent)

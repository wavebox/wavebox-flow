import React from 'react'
import clsx from 'clsx'
import {
  List, ListItemButton, ListItemText, ListItemAvatar,
  Avatar, Typography
} from '@mui/material'
import { ModalIds } from '../../StartWizardTypes'
import ModalContent from '../../Components/ModalContent'
import { fileTemplates } from 'FileTemplates'

import type { onChangeModalFn } from '../../StartWizardTypes'
import type { FileTemplate } from 'FileTemplates'

interface Props {
  onChangeModal: onChangeModalFn
}

class CreatePane extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  renderFileTemplate (template: FileTemplate) {
    const { onChangeModal } = this.props

    return (
      <ListItemButton onClick={() => { onChangeModal(ModalIds.SitePickerOption, { template }) }}>
        <ListItemAvatar>
          <Avatar style={{ backgroundColor: template.colors[0], color: template.colors[1] }}>
            <template.Icon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={template.name}
          secondary={template.description}
        />
      </ListItemButton>
    )
  }

  render () {
    const {
      className,
      onChangeModal,

      ...passProps
    } = this.props

    return (
      <ModalContent className={clsx(className, classes.root)} {...passProps}>
        <Typography variant='subtitle2' fontWeight='bold' paragraph>
          Create a new extension
        </Typography>
        <Typography color='textSecondary' variant='body2' paragraph>
          Create themes, link sites together, inject new features and more! With
          a touch of CSS & JavaScript you can create your custom workflows with
          OpenAI's ChatGPT on hand to help.
        </Typography>
        <List>
          {this.renderFileTemplate(fileTemplates.csStyle)}
          {this.renderFileTemplate(fileTemplates.csReplace)}
          {this.renderFileTemplate(fileTemplates.csFeature)}
          {this.renderFileTemplate(fileTemplates.background)}
          {this.renderFileTemplate(fileTemplates.popup)}
        </List>
      </ModalContent>
    )
  }
}

export default CreatePane

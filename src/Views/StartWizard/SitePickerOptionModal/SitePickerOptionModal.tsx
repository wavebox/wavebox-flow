import React from 'react'
import clsx from 'clsx'
import ModalPaper from '../Components/ModalPaper'
import ModalTitle from '../Components/ModalTitle'
import ModalContent from '../Components/ModalContent'
import JumbotronButton from '../Components/JumbotronButton'
import { pink, lightBlue } from '@mui/material/colors'
import PublicIcon from '@mui/icons-material/Public'
import DescriptionIcon from '@mui/icons-material/Description'
import { connect } from 'react-redux'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'
import { Collapse, TextField, Button } from '@mui/material'
import { createPatternSuggestion } from 'WaveboxApi'

import type { ModalProps } from '../StartWizardTypes'
import type { AppDispatch } from 'Redux/Store'
import type { FileTemplate } from 'FileTemplates'

type SitePickerOptionModalElement = HTMLDivElement

interface Props extends ModalProps {
  create: (template: FileTemplate, urlPattern?: string) => void
}

class SitePickerOptionModal extends React.PureComponent<Props & React.HTMLAttributes<SitePickerOptionModalElement>> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #websitePatternInputRef = React.createRef<HTMLInputElement>()

  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    websitePickerOpen: false,
    websitePattern: createPatternSuggestion ?? ''
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleWebsiteClicked = () => {
    this.setState({ websitePickerOpen: !this.state.websitePickerOpen })
  }

  handleWebsitePatternChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ websitePattern: evt.target.value })
  }

  handleWebsitePatternKeydown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      evt.preventDefault()
      this.handleCreateSingleWebsite()
    }
  }

  handleWebsitePickerCollapseTransitionEnd = () => {
    if (this.state.websitePickerOpen) {
      this.#websitePatternInputRef.current?.focus?.()
    }
  }

  /* **************************************************************************/
  // UI Events: Creation
  /* **************************************************************************/

  handleCreateAllSites = async () => {
    const {
      modalProps,
      create
    } = this.props

    if (typeof (modalProps) === 'object' && typeof (modalProps.template) === 'object') {
      const template = modalProps.template as FileTemplate
      create(template)
    }
  }

  handleCreateSingleWebsite = async () => {
    const {
      modalProps,
      create
    } = this.props
    const {
      websitePattern: userPattern
    } = this.state

    // Sanitize the pattern for the extension
    let pattern = userPattern
    if (pattern) {
      // wavebox.io -> *://wavebox.io
      if (!pattern.includes('://')) { pattern = `*://${pattern}` }

      // www.wavebox.io -> *://wavebox.io/*
      if (pattern.includes('://wwww.')) { pattern = pattern.replace('wwww.', '') }

      // *://wavebox.io -> *://*.wavebox.io
      if (!pattern.includes('://*.')) { pattern = pattern.split('://').join('://*.') }

      // *://*.wavebox.io -> *://*.wavebox.io/*
      if (!pattern.endsWith('*')) { pattern = `${pattern}${pattern.endsWith('/') ? '' : '/'}*` }
    } else {
      pattern = '<all_urls>'
    }

    if (typeof (modalProps) === 'object' && typeof (modalProps.template) === 'object') {
      const template = modalProps.template as FileTemplate
      create(template, pattern)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      onChangeModal,
      onBackModal,
      modalProps,

      create,

      ...passProps
    } = this.props
    const {
      websitePickerOpen,
      websitePattern
    } = this.state

    return (
      <ModalPaper
        className={clsx(className, classes.root)}
        width={500}
        {...passProps}
      >
        <ModalTitle onBack={onBackModal}>
          Which website should this extension be added to?
        </ModalTitle>
        <ModalContent className={classes.content}>
          <div className={classes.targetOptions}>
            <JumbotronButton
              color1={lightBlue[100]}
              color2={lightBlue[800]}
              icon={<DescriptionIcon />}
              title='A website'
              onClick={this.handleWebsiteClicked}
            />
            <JumbotronButton
              color1={pink[100]}
              color2={pink[800]}
              icon={<PublicIcon />}
              title='All websites'
              onClick={this.handleCreateAllSites}
            />
          </div>
          <Collapse
            in={websitePickerOpen}
            addEndListener={this.handleWebsitePickerCollapseTransitionEnd}
          >
            <TextField
              fullWidth
              inputRef={this.#websitePatternInputRef}
              variant='outlined'
              value={websitePattern}
              className={classes.patternTextField}
              onChange={this.handleWebsitePatternChanged}
              onKeyDown={this.handleWebsitePatternKeydown}
              placeholder='Website URL'
            />
            <Button
              fullWidth
              size='large'
              color='primary'
              variant='contained'
              onClick={this.handleCreateSingleWebsite}
            >
              Create extension
            </Button>
          </Collapse>
        </ModalContent>
      </ModalPaper>
    )
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  create: (template: FileTemplate, urlPattern?: string) => (
    dispatch(FileSystemActions.createDirectoryWithFileTemplate({ template, urlPattern }))
  )
})

export default connect(undefined, mapDispatchToProps)(SitePickerOptionModal)

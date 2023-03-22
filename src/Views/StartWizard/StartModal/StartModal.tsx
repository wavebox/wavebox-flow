import React from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { Fade, Snackbar, SnackbarContent, Button, IconButton } from '@mui/material'
import FileSystemActions from 'Redux/FileSystem/FileSystemActions'
import CreatePane from './CreatePane'
import OpenPane from './OpenPane'
import ModalPaper from '../Components/ModalPaper'
import { isWavebox, isExtensionManagerAvailable } from 'WaveboxApi'
import ModalTitle from '../Components/ModalTitle'
import SettingsActions from 'Redux/Settings/SettingsActions'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import TaskAltIcon from '@mui/icons-material/TaskAlt'

import type { RootState, AppDispatch } from 'Redux/Store'
import type { ModalProps } from '../StartWizardTypes'

type StartModalElement = HTMLDivElement

interface Props extends ModalProps {
  directoryHistoryLoaded: boolean
  termsAgreed: boolean

  loadEditorHistory: () => void
  setTermsAgreed: (agreed: boolean) => void
}

interface PropsWithRef extends Props {
  innerRef: React.ForwardedRef<StartModalElement>
}

class StartModal extends React.PureComponent<PropsWithRef & React.HTMLAttributes<StartModalElement>> {
  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    waveboxTermsAgreed: false,
    termsSnackOpen: true
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.props.loadEditorHistory()

    isExtensionManagerAvailable().then((available) => {
      if (available) {
        this.setState({ waveboxTermsAgreed: true })
      }
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleToggleTerms = () => {
    this.props.setTermsAgreed(!this.props.termsAgreed)
  }

  handleOpenTerms = () => {
    window.open('https://wavebox.io/terms-flow', '_blank')
  }

  handleAgreeTerms = () => {
    this.props.setTermsAgreed(true)
  }

  handleNoTermsMainClick = () => {
    this.setState({ termsSnackOpen: false })
    setTimeout(() => {
      this.setState({ termsSnackOpen: true })
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      innerRef,
      onChangeModal,
      onBackModal,
      modalProps,

      directoryHistoryLoaded,
      termsAgreed,

      loadEditorHistory,
      setTermsAgreed,

      ...passProps
    } = this.props
    const {
      waveboxTermsAgreed,
      termsSnackOpen
    } = this.state

    return (
      <Fade in={directoryHistoryLoaded}>
        <div ref={innerRef}>
          <ModalPaper
            className={clsx(className, classes.root)}
            onClick={!termsAgreed && !waveboxTermsAgreed ? this.handleNoTermsMainClick : undefined}
            {...passProps}
          >
            <ModalTitle className={classes.title}>
              Wavebox Flow Extension Builder
            </ModalTitle>
            <div className={clsx(classes.panes, !termsAgreed && !waveboxTermsAgreed ? classes.termsDisabled : undefined)}>
              <CreatePane
                className={classes.pane}
                onChangeModal={onChangeModal}
              />
              <div className={classes.divider} />
              <OpenPane className={classes.pane} />
            </div>
            {waveboxTermsAgreed
              ? undefined
              : (
                <div className={classes.terms}>
                  <IconButton className={classes.button} onClick={this.handleToggleTerms} size='small'>
                    {termsAgreed
                      ? (<CheckBoxIcon />)
                      : (<CheckBoxOutlineBlankIcon />)}
                  </IconButton>
                  By continuing to use this service, your agree to our <a href='https://wavebox.io/terms-flow' target='_blank'>Terms</a>
                </div>
                )}
          </ModalPaper>
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={!waveboxTermsAgreed && !termsAgreed && termsSnackOpen}
            message='You need to agree to the terms to continue'
          >
            <SnackbarContent
              message='You need to agree to the terms to continue'
              action={(
                <span>
                  <Button onClick={this.handleOpenTerms}>
                    Terms
                  </Button>
                  <Button onClick={this.handleAgreeTerms} startIcon={<TaskAltIcon />}>
                    Agree
                  </Button>
                </span>
              )}
            />
          </Snackbar>
          {isWavebox
            ? undefined
            : (
              <a
                href='https://github.com/wavebox/wavebox-flow'
                target='_blank'
                className={classes.githubRibbon}
              >
                <svg
                  width='98'
                  height='96'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z'
                    fill='#fff' />
                </svg>
              </a>
              )}
        </div>
      </Fade>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    directoryHistoryLoaded: state.fileSystem.directoryHistoryLoaded,
    termsAgreed: state.settings.termsAgreed
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  loadEditorHistory: () => dispatch(FileSystemActions.loadEditorHistory()),
  setTermsAgreed: (agreed: boolean) => dispatch(SettingsActions.setTermsAgreed({ agreed }))
})

export default connect(mapStateToProps, mapDispatchToProps, undefined, { forwardRef: true })(
  React.forwardRef<StartModalElement, Props & React.HTMLAttributes<StartModalElement>>((props, ref) => {
    return <StartModal {...props} innerRef={ref} />
  })
)

import React from 'react'
import clsx from 'clsx'
import {
  Stepper, Step, StepLabel, StepContent,
  Dialog, DialogContent, DialogTitle, DialogActions,
  Button, Typography, Box, IconButton
} from '@mui/material'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'

const steps = [
  {
    label: 'Open browser extension settings',
    image: '/assets/install_assistant/step1.gif',
    description: <><b>Open a new tab</b>, type <i>chrome://extensions</i> into the address bar and <b>press enter</b></>
  },
  {
    label: 'Enable developer mode',
    image: '/assets/install_assistant/step2.gif',
    description: <>Enable the <b>developer mode toggle</b> in the top right of the extensions page</>
  },
  {
    label: 'Load your extension',
    image: '/assets/install_assistant/step3.gif',
    description: <>Press the <b>Load unpacked</b> button and use the file picker to locate your extension on your machine</>
  },
  {
    label: 'Reload your changes',
    image: '/assets/install_assistant/step4.gif',
    description: <>Use the <b>reload button</b> at any time on the extensions page whenever you want to see your changes reflected in the browser</>
  }
]

interface Props {
  closeView: () => void
}

interface State {
  activeStep: number
  expanded: boolean
  expandedStep: number | undefined
}

class InstallAssistantContent extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  /* **************************************************************************/
  // Data
  /* **************************************************************************/

  state = {
    activeStep: 0,
    expanded: false,
    expandedStep: undefined
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleBack = () => {
    this.setState({ activeStep: this.state.activeStep - 1 })
  }

  handleNext = () => {
    this.setState({ activeStep: this.state.activeStep + 1 })
  }

  handleOpenExpanded = () => {
    this.setState({ expanded: true, expandedStep: this.state.activeStep })
  }

  handleCloseExpanded = () => {
    this.setState({ expanded: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      className,
      closeView,

      ...passProps
    } = this.props
    const {
      activeStep,
      expanded,
      expandedStep
    } = this.state

    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <Typography fontWeight='bold'>
          Install and Reload
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1
            return (
              <Step key={index} className={classes.step}>
                <StepLabel>
                  {step.label}
                </StepLabel>
                <StepContent>
                  <div className={classes.image}>
                    <img src={step.image} />
                    <IconButton size='small' className={classes.expand} onClick={this.handleOpenExpanded}>
                      <AspectRatioIcon />
                    </IconButton>
                  </div>
                  <Typography variant='body2'>{step.description}</Typography>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={isLast ? closeView : this.handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {isLast ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        size='small'
                        disabled={index === 0}
                        onClick={this.handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            )
          })}
        </Stepper>
        <Dialog
          open={expanded}
          onClose={this.handleCloseExpanded}
        >
          {expandedStep !== undefined
            ? (
              <>
                <DialogTitle>
                  {steps[expandedStep].label}
                </DialogTitle>
                <DialogContent className={classes.expanded}>
                  <img src={steps[expandedStep].image} className={classes.image} />
                  <Typography variant='body2'>
                    {steps[expandedStep].description}
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button color='primary' variant='contained' onClick={this.handleCloseExpanded}>
                    Close
                  </Button>
                </DialogActions>
              </>
              )
            : undefined}
        </Dialog>
      </div>
    )
  }
}

export default InstallAssistantContent

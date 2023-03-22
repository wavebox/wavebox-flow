import React from 'react'
import clsx from 'clsx'
import StartModal from './StartModal'
import SitePickerOptionModal from './SitePickerOptionModal'
import { ModalIds } from './StartWizardTypes'
import { SizeMe } from 'react-sizeme'

import type { ModalProps } from './StartWizardTypes'
import type { SizeMeProps } from 'react-sizeme'

interface ModalRec {
  id: ModalIds
  props: object | undefined
}

interface State {
  modals: ModalRec[]
  modalIndex: number
}

class StartWizard extends React.PureComponent<React.HTMLAttributes<HTMLDivElement>, State> {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #transitioning = false

  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    modals: [{ id: ModalIds.Start, props: undefined }],
    modalIndex: 0
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleBackModal = () => {
    if (this.#transitioning) { return }
    this.#transitioning = true

    let nextModals: ModalRec[]
    this.setState((prevState) => {
      nextModals = prevState.modals.slice(0, -1)
      return { ...prevState, modalIndex: nextModals.length - 1 }
    }, () => {
      setTimeout(() => {
        this.setState((prevState) => {
          return { ...prevState, modals: nextModals }
        }, () => {
          this.#transitioning = false
        })
      }, 750)
    })
  }

  handleChangeModal = (modalId: ModalIds, modalProps: object | undefined) => {
    if (this.#transitioning) { return }
    this.#transitioning = true
    this.setState((prevState) => ({
      modals: [...prevState.modals, { id: modalId, props: modalProps }],
      modalIndex: prevState.modals.length
    }), () => {
      this.#transitioning = false
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  getModalComponent (id: ModalIds): React.ElementType<ModalProps & React.HTMLAttributes<HTMLDivElement>> {
    switch (id) {
      case ModalIds.Start: return StartModal
      case ModalIds.SitePickerOption: return SitePickerOptionModal
    }
  }

  renderInner = ({ size }: SizeMeProps): React.ReactElement => {
    const {
      className,
      ...passProps
    } = this.props
    const {
      modals,
      modalIndex
    } = this.state

    const width = size.width ?? 0
    return (
      <div className={clsx(className, classes.root)} {...passProps}>
        <div
          className={classes.inner}
          style={{
            width: width * modals.length,
            left: width * modalIndex * -1
          }}
        >
          {modals.map((modalRec, index) => {
            const Component = this.getModalComponent(modalRec.id)
            return (
              <div
                key={`${index}:${modalRec.id}`}
                className={classes.modal}
                style={{ left: width * index, width }}
              >
                <Component
                  onChangeModal={this.handleChangeModal}
                  onBackModal={this.handleBackModal}
                  modalProps={modalRec.props}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  render () {
    return (
      <SizeMe
        monitorHeight={false}
        monitorWidth={true}
      >
        {this.renderInner}
      </SizeMe>
    )
  }
}

export default StartWizard

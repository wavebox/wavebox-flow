export enum ModalIds {
  Start,
  SitePickerOption
}

export type onChangeModalFn = (modalId: ModalIds, wizardState: object | undefined) => void

export type onBackModalFn = () => void

export interface ModalProps {
  onBackModal: onBackModalFn
  onChangeModal: onChangeModalFn
  modalProps: any | undefined
}

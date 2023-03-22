export enum HintView {
  None,
  Install,
  InstallWavebox,
  Reload
}

export enum AssistantView {
  None,
  Install,
  Chat
}

export interface ViewsState {
  assistantView: AssistantView
  hintView: HintView
  suppressedHintView: HintView[]
}

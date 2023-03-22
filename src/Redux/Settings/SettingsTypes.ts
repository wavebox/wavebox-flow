export enum UserTheme {
  System,
  Light,
  Dark
}
export enum SystemTheme {
  Light,
  Dark
}
export enum AppTheme {
  Light,
  Dark
}

export interface SettingsState {
  userTheme: UserTheme
  systemTheme: SystemTheme
  editorLineNumbers: boolean
  editorShowManifest: boolean
  assistantViewSize: number
  assistantHelperPopup: boolean
  termsAgreed: boolean
}

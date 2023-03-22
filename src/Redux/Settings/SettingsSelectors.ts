import { createSelector } from '@reduxjs/toolkit'
import {
  AppTheme,
  SystemTheme,
  UserTheme
} from './SettingsTypes'

import type { RootState } from '../Store'

/* **************************************************************************/
// Theme
/* **************************************************************************/

/**
 * Gets the editable directory contents
 */
export const getAppTheme = createSelector(
  (state: RootState) => state.settings.userTheme,
  (state: RootState) => state.settings.systemTheme,
  (userTheme: UserTheme, systemTheme: SystemTheme): AppTheme => {
    switch (userTheme) {
      case UserTheme.System: {
        switch (systemTheme) {
          case SystemTheme.Light: return AppTheme.Light
          case SystemTheme.Dark: return AppTheme.Dark
          default: return AppTheme.Light
        }
      }
      case UserTheme.Light: return AppTheme.Light
      case UserTheme.Dark: return AppTheme.Dark
    }
  }
)

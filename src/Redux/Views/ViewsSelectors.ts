import { createSelector } from '@reduxjs/toolkit'
import { HintView } from './ViewsTypes'

import type { RootState } from '../Store'

/* **************************************************************************/
// Hint view
/* **************************************************************************/

export const getDisplayHintView = createSelector(
  (state: RootState) => state.views.hintView,
  (state: RootState) => state.views.suppressedHintView,
  (view: HintView, suppressed: HintView[]) => {
    return suppressed.includes(view) ? HintView.None : view
  }
)

export const isHintViewOpen = createSelector(
  (state: RootState) => state.views.hintView,
  (state: RootState) => state.views.suppressedHintView,
  (view: HintView, suppressed: HintView[]) => {
    return view !== HintView.None && !suppressed.includes(view)
  }
)

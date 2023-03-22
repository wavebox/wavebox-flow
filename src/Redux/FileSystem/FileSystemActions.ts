import * as Thunks from './FileSystemThunks'
import Slice from './FileSystemSlice'

export default {
  ...Slice.actions,
  ...Thunks
}

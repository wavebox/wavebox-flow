import RemoteFileSystem from './RemoteFileSystem'
import { FileSystemPort } from 'WaveboxApi'

interface RemoteData {
  ref: string
}

class RemoteFileSystemFile extends RemoteFileSystem {
/* **************************************************************************/
  // Private
  /* **************************************************************************/

  #data: RemoteData

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (remoteData: RemoteData) {
    super(remoteData.ref)
    this.#data = remoteData
  }

  /* **************************************************************************/
  // Reading
  /* **************************************************************************/

  async text () {
    const data: string = await FileSystemPort.request('file::text', this.ref)
    return data
  }
}

export default RemoteFileSystemFile

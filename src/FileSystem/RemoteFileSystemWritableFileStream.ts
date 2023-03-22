import RemoteFileSystem from './RemoteFileSystem'
import { FileSystemPort } from 'WaveboxApi'

interface RemoteData {
  ref: string
}

class RemoteFileSystemWritableFileStream extends RemoteFileSystem {
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
  // Writing
  /* **************************************************************************/

  async write (data: any) {
    await FileSystemPort.request('writable::write', this.ref, data)
  }

  async close () {
    await FileSystemPort.request('writable::close', this.ref)
  }
}

export default RemoteFileSystemWritableFileStream

import RemoteFileSystem from './RemoteFileSystem'

interface RemoteData {
  ref: string
  kind: 'directory' | 'file'
  name: string
}

class RemoteFileSystemHandle extends RemoteFileSystem {
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
  // Properties
  /* **************************************************************************/

  get kind () { return this.#data.kind }

  get name () { return this.#data.name }
}

export default RemoteFileSystemHandle

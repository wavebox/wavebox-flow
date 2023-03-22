import RemoteFileSystemHandle from './RemoteFileSystemHandle'
import { FileSystemPort } from 'WaveboxApi'
import RemoteFileSystemFile from './RemoteFileSystemFile'
import RemoteFileSystemWritableFileStream from './RemoteFileSystemWritableFileStream'

class RemoteFileSystemFileHandle extends RemoteFileSystemHandle {
  /* **************************************************************************/
  // Getting handles
  /* **************************************************************************/

  async getFile () {
    const data = await FileSystemPort.request('fileHandle::getFile', this.ref)
    return new RemoteFileSystemFile(data)
  }

  /* **************************************************************************/
  // Writables
  /* **************************************************************************/

  async createWritable () {
    const data = await FileSystemPort.request('fileHandle::createWritable', this.ref)
    return new RemoteFileSystemWritableFileStream(data)
  }
}

export default RemoteFileSystemFileHandle

import RemoteFileSystemHandle from './RemoteFileSystemHandle'
import RemoteFileSystemFileHandle from './RemoteFileSystemFileHandle'
import { FileSystemPort } from 'R/WaveboxApi'

class RemoteFileSystemDirectoryHandle extends RemoteFileSystemHandle {
  /* **************************************************************************/
  // Reading dir
  /* **************************************************************************/

  async * entries (): AsyncGenerator<[string, RemoteFileSystemDirectoryHandle | RemoteFileSystemFileHandle]> {
    const data: Array<[string, any]> = await FileSystemPort.request('directoryHandle::entries', this.ref)
    const entries = data.reduce((
      acc: Array<[string, RemoteFileSystemDirectoryHandle | RemoteFileSystemFileHandle]>,
      [name, entryData]
    ) => {
      switch (entryData.kind) {
        case 'directory':
          acc.push([name, new RemoteFileSystemDirectoryHandle(entryData)])
          break
        case 'file':
          acc.push([name, new RemoteFileSystemFileHandle(entryData)])
          break
      }
      return acc
    }, [])

    for (const [name, handle] of entries) {
      yield [name, handle]
    }
  }

  /* **************************************************************************/
  // Permissions
  /* **************************************************************************/

  async queryPermission (options: FileSystemHandlePermissionDescriptor) {
    return await FileSystemPort.request('directoryHandle::queryPermission', this.ref, options)
  }

  async requestPermission (options: FileSystemHandlePermissionDescriptor) {
    return await FileSystemPort.request('directoryHandle::requestPermission', this.ref, options)
  }

  /* **************************************************************************/
  // Getting handles
  /* **************************************************************************/

  async getDirectoryHandle (name: string, options = {}) {
    const data = await FileSystemPort.request('directoryHandle::getDirectoryHandle', this.ref, name, options)
    return new RemoteFileSystemDirectoryHandle(data)
  }

  async getFileHandle (name: string, options = {}) {
    const data = await FileSystemPort.request('directoryHandle::getFileHandle', this.ref, name, options)
    return new RemoteFileSystemFileHandle(data)
  }
}

export default RemoteFileSystemDirectoryHandle

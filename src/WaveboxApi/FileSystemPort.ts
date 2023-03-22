import { request, connect } from './Rpc'
import { nanoid } from 'nanoid'

interface Connector {
  resolve: (value: chrome.runtime.Port) => void
  reject: (reason?: any) => void
}

enum Status {
  Idle,
  Connecting,
  Connected,
  Error
}

class FileSystemPort {
  /* **************************************************************************/
  // Private
  /* **************************************************************************/

  #port: chrome.runtime.Port | undefined
  #status = Status.Idle
  #connectQueue: Connector[] = []
  #requests = new Map()

  /* **************************************************************************/
  // Connection
  /* **************************************************************************/

  async #connect (): Promise<chrome.runtime.Port> {
    if (this.#port) {
      return this.#port
    }

    if (this.#status === Status.Idle) {
      this.#status = Status.Connecting
      ;(async () => {
        try {
          const ref = (await request('flow:provisionFileSystem')) as string
          const port = await connect(ref)
          this.#port = port
          this.#port.onMessage.addListener(this.#handlePortMessage)
          this.#status = Status.Connected

          for (const connector of this.#connectQueue) {
            connector.resolve(port)
          }
        } catch (ex) {
          this.#status = Status.Error

          for (const connector of this.#connectQueue) {
            connector.reject(ex)
          }
        }
      })()
    }

    return await new Promise((resolve, reject) => {
      this.#connectQueue.push({ resolve, reject })
    })
  }

  /* **************************************************************************/
  // Port events
  /* **************************************************************************/

  #handlePortMessage = (evt: any) => {
    const { reply, response, error } = evt
    if (reply && this.#requests.has(reply)) {
      const { resolve, reject } = this.#requests.get(reply)
      this.#requests.delete(reply)
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    }
  }

  /* **************************************************************************/
  // Requests
  /* **************************************************************************/

  /**
   * Makes a request to the port
   * @param type: the requst type
   * @param args: additional args
   * @return the response
   */
  async request (type: string, ...args: any): Promise<any> {
    const port = await this.#connect()

    return await new Promise((resolve, reject) => {
      const reply = nanoid()
      port.postMessage({ type, args, reply })
      this.#requests.set(reply, { resolve, reject })
    })
  }
}

export default new FileSystemPort()

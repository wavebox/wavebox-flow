const WAVEBOX_CHANNEL_ID = 'ckimpoegidoklmlkmkccfmbdmfigmgfm'

/**
 * Sends a message to Wavebox
 * @param type: the message type
 * @param args: arguments to send
 * @return the response
 */
export async function request (type: string, ...args: any): Promise<any> {
  return await new Promise((resolve, reject) => {
    if (!chrome?.runtime?.sendMessage) {
      reject(new Error('Runtime API not available'))
      return
    }

    chrome.runtime.sendMessage(WAVEBOX_CHANNEL_ID, { type, args }, (response) => {
      const error = chrome.runtime.lastError ?? response[0]
      if (error) {
        reject(error)
      } else {
        resolve(response[1])
      }
    })
  })
}

/**
 * Connects a channel to Wavebox
 * @param name: the channel name
 * @return the the port
 */
export async function connect (name: string): Promise<chrome.runtime.Port> {
  return await new Promise((resolve, reject) => {
    if (!chrome?.runtime?.connect) {
      reject(new Error('Runtime API not available'))
      return
    }

    const port = chrome.runtime.connect(WAVEBOX_CHANNEL_ID, { name })
    const connectListener = (evt: any) => {
      if (evt.type === 'system:init') {
        port.onMessage.removeListener(connectListener)
        if (evt.response === true) {
          resolve(port)
        } else {
          reject(new Error('Failed to connect'))
        }
      }
    }

    port.onMessage.addListener(connectListener)
  })
}

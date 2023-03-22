const { Configuration, OpenAIApi } = require('openai')
const { Server } = require('ws')

const openai = new OpenAIApi(new Configuration({
  apiKey: undefined // Place your openAI key here
}))

async function getResponse (opts, updateCb) {
  try {
    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      max_tokens: 2048,
      temperature: 0,
      stream: true,
      messages: opts.messages
    }, { responseType: 'stream' })

    await new Promise((resolve, reject) => {
      res.data.on('data', (data) => {
        const messages = data
          .toString()
          .split('\n')
          .reduce((acc, line) => {
            if (line && line.startsWith('data:')) {
              acc.push(line.replace(/^data: /, '').trim())
            }
            return acc
          }, [])

        for (const message of messages) {
          if (message === '[DONE]') {
            resolve()
            return
          } else {
            let parsed
            try {
              parsed = JSON.parse(message)
            } catch (error) {
              throw new Error(`Could not JSON parse stream. Message: ${message} Error: ${error}`)
            }

            for (const choice of parsed.choices) {
              if (choice.finish_reason === 'stop') {
                resolve()
                return
              } else if (choice.delta.content) {
                updateCb(choice.delta.content)
              }
            }
          }
        }
      })
    })
  } catch (ex) {
    if (ex.response?.status) {
      console.error(ex.response.status, ex.message)
      ex.response.data.on('data', data => {
        const message = data.toString()
        try {
          const parsed = JSON.parse(message)
          throw new Error('An error occurred during OpenAI request: ' + parsed)
        } catch (ex) {
          throw new Error('An error occurred during OpenAI request: ' + message)
        }
      })
    } else {
      throw new Error('An error occurred during OpenAI request' + ex)
    }
  }
}

const sockserver = new Server({ port: 443 })
sockserver.on('connection', (ws, req) => {
  console.log('Connected')
  ws.on('message', async (data) => {
    data = JSON.parse(data)
    console.log('IN:', data)
    const id = Math.random()
    await getResponse(data.opts, (message) => {
      const payload = JSON.stringify({ id, type: 'stream', content: message })
      console.log('OUT:', payload)
      ws.send(payload)
    })
    const payload = JSON.stringify({ id, type: 'finish' })
    console.log('OUT:', payload)
    ws.send(payload)
  })

  ws.on('close', () => console.log('Client has disconnected!'))
})

console.log('Ready')

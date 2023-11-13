const OpenAI = require('openai')
const { Server } = require('ws')

const openai = new OpenAI({
  apiKey: undefined // Place your openAI key here
})

async function getResponse (opts, updateCb) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 2048,
      temperature: 0,
      stream: true,
      messages: opts.messages
    }, { responseType: 'stream' })

    let buffer = ''
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content || ''
      buffer += content
      updateCb(content)
    }
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

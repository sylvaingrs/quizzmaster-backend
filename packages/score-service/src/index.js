import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', (req, res) => {
    return { status: 'OK', alive: true }
})

app.post('/room-score', async (req, res) => {
    const { data } = req.body
    console.log('score-service data : ', data)
    // Store to PostgreSQL

    return { status: 'OK', data }
})

await app.listen({ port: 3004, host: '0.0.0.0' })
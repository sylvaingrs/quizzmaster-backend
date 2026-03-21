import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', (req, res) => {
    return { status: 'OK', alive: true }
})

app.post('/room-quizz', async (req, res) => {
    const { data } = req.body
    console.log('quizz-service data : ', data)
    // Store to PostgreSQL

    return { status: 'OK', data }
})

await app.listen({ port: 3003 })
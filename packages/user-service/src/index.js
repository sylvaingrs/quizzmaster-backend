import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', (req, res) => {
    return { status: 'OK', alive: true }
})

app.post('/gateway-user', async (req, res) => {

    const { data } = req.body
    console.log('user-service data : ', data)

    const result = await fetch('http://localhost:3002/user-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })

    const r = await result.json()
    console.log('user-service result : ', r)

    // Store to PostgreSQL

})

await app.listen({ port: 3001 })
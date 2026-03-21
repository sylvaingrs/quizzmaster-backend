import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', (req, res) => {
    return { status: 'OK', alive: true }
})

app.post('/user-room', async (req, res) => {
    const { data } = req.body
    console.log('room-service data : ', data)

    const result = await fetch('http://localhost:3003/room-quizz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })
    const r = await result.json()

    console.log('room-service result : ', r)

    const result2 = await fetch('http://localhost:3004/room-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })
    const r2 = await result2.json()

    console.log('room-service result : ', r2)


    return { status: 'OK', data }
})

await app.listen({ port: 3002 })
import Fastify from 'fastify'
import dotenv from 'dotenv'
import fs from 'fs'
import dotenvExpand from 'dotenv-expand'

if (fs.existsSync('../../.env')) {
    dotenvExpand.expand(dotenv.config({ path: '../../.env' }))
}

const app = Fastify({ logger: true })

app.get('/health', (req, res) => {
    return { status: 'OK', alive: true }
})

app.post('/user-room', async (req, res) => {
    const { data } = req.body
    console.log('room-service data : ', data)

    const result = await fetch(`${process.env.QUIZZ_SERVICE_URL}/room-quizz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })
    const r = await result.json()

    console.log('room-service result : ', r)

    const result2 = await fetch(`${process.env.SCORE_SERVICE_URL}/room-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })
    const r2 = await result2.json()

    console.log('room-service result : ', r2)


    // Store into cache (Valkey)

    // emit into RabbitMQ


    return { status: 'OK', data }
})

await app.listen({ port: process.env.ROOM_SERVICE_PORT, host: process.env.HOST })
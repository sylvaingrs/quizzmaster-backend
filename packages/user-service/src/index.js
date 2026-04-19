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

app.post('/gateway-user', async (req, res) => {

    const { data } = req.body
    console.log('user-service data : ', data)

    const result = await fetch(`${process.env.ROOM_SERVICE_URL}/user-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })

    const r = await result.json()
    console.log('user-service result : ', r)

    // Store to PostgreSQL

})

await app.listen({ port: process.env.USER_SERVICE_PORT, host: process.env.HOST })
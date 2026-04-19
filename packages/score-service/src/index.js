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

app.post('/room-score', async (req, res) => {
    const { data } = req.body
    console.log('score-service data : ', data)
    // Store to PostgreSQL

    return { status: 'OK', data }
})

await app.listen({ port: process.env.SCORE_SERVICE_PORT, host: process.env.HOST })
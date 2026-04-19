import Fastify from 'fastify'
import httpProxy from '@fastify/http-proxy'
import dotenv from 'dotenv'
import fs from 'fs'
import dotenvExpand from 'dotenv-expand'

if (fs.existsSync('../../.env')) {
    dotenvExpand.expand(dotenv.config({ path: '../../.env' }))
}

const app = Fastify({ logger: true })

app.get('/health', () => ({ status: 'OK', alive: true }))

app.register(async (api) => {

    api.register(httpProxy, {
        upstream: process.env.NODE_ENV === 'production' ? process.env.USER_SERVICE_URL : process.env.USER_SERVICE_LOCAL_URL,
        prefix: '/user',
        rewritePrefix: '',
    })

    api.register(httpProxy, {
        upstream: process.env.NODE_ENV === 'production' ? process.env.ROOM_SERVICE_URL : process.env.ROOM_SERVICE_LOCAL_URL,
        prefix: '/room',
        rewritePrefix: '',
    })

    api.register(httpProxy, {
        upstream: process.env.NODE_ENV === 'production' ? process.env.QUIZZ_SERVICE_URL : process.env.QUIZZ_SERVICE_LOCAL_URL,
        prefix: '/quizz',
        rewritePrefix: '',
    })

    api.register(httpProxy, {
        upstream: process.env.NODE_ENV === 'production' ? process.env.SCORE_SERVICE_URL : process.env.SCORE_SERVICE_LOCAL_URL,
        prefix: '/score',
        rewritePrefix: '',
    })
} , { prefix: '/api' })

await app.listen({ port: process.env.API_GATEWAY_PORT ?? 3000, host: process.env.HOST ?? '0.0.0.0' })
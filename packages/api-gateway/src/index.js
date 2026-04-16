import Fastify from 'fastify'
import httpProxy from '@fastify/http-proxy'

const app = Fastify({ logger: true })


app.register(async (api) => {
    api.register(httpProxy, {
        upstream: process.env.ROOM_SERVICE_URL ?? 'http://localhost:3002',
        prefix: '/room',
        rewritePrefix: '',
    })

    api.register(httpProxy, {
        upstream: process.env.QUIZ_SERVICE_URL ?? 'http://localhost:3003',
        prefix: '/quizz',
        rewritePrefix: '',
    })

    api.register(httpProxy, {
        upstream: process.env.SCORE_SERVICE_URL ?? 'http://localhost:3004',
        prefix: '/score',
        rewritePrefix: '',
    })
} , { prefix: '/api' })


await app.listen({ port: 3000, host: '0.0.0.0' })
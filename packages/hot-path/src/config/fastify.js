import Fastify from 'fastify';
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export const app = Fastify({ logger: true })

await app.register(swagger, {
  openapi: {
    info: {
      title: 'Quiz POC',
      version: '1.0.0'
    }
  }
})

await app.register(swaggerUi, {
  routePrefix: '/'
})

import Fastify from 'fastify';
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import {createFastifyLoggerConfig} from "@quizzmaster-backend/logger";

export const app = Fastify({
    logger: createFastifyLoggerConfig('score-service'),
})

await app.register(swagger, {
    openapi: {
        info: {
            title: 'Score Service API',
            description: "score service description.",
            version: '1.0.0'
        },
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
            { name: "Score", description: "Score endpoints" },
        ],
    }
})

await app.register(swaggerUi, {
    routePrefix: '/docs'
})
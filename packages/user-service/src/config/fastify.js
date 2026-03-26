import Fastify from 'fastify';
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import {createFastifyLoggerConfig} from "@quizzmaster-backend/logger/logger/index.js";

export const app = Fastify({
    logger: createFastifyLoggerConfig('user-service'),
})

await app.register(swagger, {
    openapi: {
        info: {
            title: 'User Service API',
            description: "user service description.",
            version: '1.0.0'
        },
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
            { name: "Room", description: "Room endpoints" },
            { name: "User", description: "User endpoints" },
        ],
    }
})

await app.register(swaggerUi, {
    routePrefix: '/docs'
})
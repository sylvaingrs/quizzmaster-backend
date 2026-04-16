import Fastify from 'fastify';
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import {createFastifyLoggerConfig} from "@quizzmaster-backend/logger";

export const app = Fastify({
    logger: createFastifyLoggerConfig('room-service'),
})

await app.register(swagger, {
    openapi: {
        info: {
            title: 'Room Service API',
            description: "room service description.",
            version: '1.0.0'
        },
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
            { name: "Room", description: "Room endpoints" },
            { name: "Buzzer", description: "Buzzer endpoints" },
            { name: "Leaderboard", description: "Leaderboard endpoints" },
            { name: "Checkpoint", description: "Checkpoint endpoints" }
        ],
    }
})

await app.register(swaggerUi, {
    routePrefix: '/docs'
})
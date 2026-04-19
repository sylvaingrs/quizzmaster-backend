import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {quizzController} from "./quizz/controller/quizz-service.controller.js";
import fastifyCors from '@fastify/cors';
import { questionController } from "./question/controller/question-service.controller.js";
import { createFastifyLoggerConfig } from "../../logger/src/index.js";

import dotenv from 'dotenv'
import fs from 'fs'
import dotenvExpand from 'dotenv-expand'

if (fs.existsSync('../../.env')) {
    dotenvExpand.expand(dotenv.config({ path: '../../.env' }))
}

const app = Fastify({
    logger: createFastifyLoggerConfig('quizz-service'),
})

const swaggerOptions = {
    swagger: {
        info: {
            title: "Quizz Service",
            description: "quizz service description.",
            version: "1.0.0",
        },
        host: `${process.env.HOSTNAME_DEV}:${process.env.QUIZZ_SERVICE_PORT}`,
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
            { name: "Default", description: "Default" },
            { name: "Quizz", description: "Quizz endpoints" }
        ],
    },
};

const swaggerUiOptions = {
    routePrefix: "/docs",
    exposeRoute: true,
};

app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
});

app.register(fastifySwagger, swaggerOptions);
app.register(fastifySwaggerUi, swaggerUiOptions);

app.register((app, options, done) => {
    app.get("/", {
        schema: {
            tags: ["Default"],
            response: {
                200: {
                    type: "object",
                    properties: {
                        anything: { type: "string" },
                    },
                },
            },
        },
        handler: (req, res) => {
            res.send({ anything: "meaningfull" });
        },
    });
    done();
});

app.register(quizzController);
app.register(questionController);

app.get('/health', (req, res) => {
    return { status: 'OK', alive: true }
})
console.log("HOST =", process.env.HOST)
app.listen(
    {
        port: process.env.QUIZZ_SERVICE_PORT,
        host: process.env.HOST,
    },
    (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    }
);

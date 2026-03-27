import dotenv from "dotenv";
import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {quizzController} from "./quizz/controller/quizz-service.controller.js";
import fastifyCors from '@fastify/cors';
import { questionController } from "./question/controller/question-service.controller.js";
import { createFastifyLoggerConfig } from "@quizzmaster-backend/logger";

dotenv.config();
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
        host: "localhost:3003",
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

app.listen(
    {
        port: 3003,
        host: "0.0.0.0",
    },
    (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    }
);

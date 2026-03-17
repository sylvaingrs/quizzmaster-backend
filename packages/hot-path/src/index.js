import { app } from './config/fastify.js'
import {roomRoutes} from "./quiz-live/ controllers/room.controller.js";

import { startConsumer } from './checkpoint/consumer.js'
import {checkpointRoutes} from "./checkpoint/controller/checkpoint.controller.js";

startConsumer()

app.get('/Hello-World', async () => ({ message: 'Hello World' }))
await app.register(roomRoutes, { prefix: '/quiz' })
await app.register(checkpointRoutes, { prefix: '/checkpoint' })

await app.listen({ port: 3000 })

import { app } from "./config/fastify.js"

import { roomRoutes } from "./room/room.controller.js"

await app.register(roomRoutes);

await app.listen({ port: 3002, host: '0.0.0.0' });
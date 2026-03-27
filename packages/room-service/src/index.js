import {app} from "./config/fastify.js"

import {roomRoutes} from "./room/controller/room.controller.js"
// import {buzzerRoutes} from "./buzzer/buzzer.controller.js";

await app.register(roomRoutes);

// await app.register(buzzerRoutes, {prefix: '/buzzer'})

await app.listen({port: 3002, host: '0.0.0.0'});